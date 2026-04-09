const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { checkUserDiscoverable } = require("../system_config");

class InterestService {
  static async updateUserInterest(jobId, userId, interestValue) {
    // check if an interest object already exists
    const interest = await prisma.interest.findFirst({
      where: {
        jobId: jobId,
        candidateId: userId,
      },
    });

    // if interested is false but there is no interest object (hasn't previously expressed interest)
    // or there is an interest object, but the value is null
    if (
      (!interest && !interestValue) ||
      (interest && interest.candidateInterest === null && !interestValue)
    ) {
      return {
        status: 400,
        error:
          "Cannot set to false, user has not previously expressed interest",
      };
    }

    // check if the job has been deleted
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job)
      return { status: 404, error: `Could not find job with id ${jobId}` };

    // check if user qualifies for this job
    const user = await prisma.regularUser.findUnique({
      where: { id: userId },
      include: { qualifications: true },
    });

    const positionTypeId = job.positionTypeId;
    const validQuals = user.qualifications.filter(
      (qual) =>
        qual.positionTypeId === positionTypeId && qual.status === "approved",
    );

    if (validQuals.length === 0) {
      return { status: 403, error: "User does not qualify for this job" };
    }

    // check if the job is still open
    // if (["filled", "completed", "cancelled", "expired"].includes(job.status)) {
    if (job.status !== "open") {
      return {
        status: 409,
        error: "Job is no longer available because of its status",
      };
    }

    const currentTime = new Date();

    // 409 if user is in active negotiation for this job
    const negotiation = await prisma.negotiation.findFirst({
      where: {
        expiresAt: { gt: currentTime },
        status: "active",
        interest: {
          candidateId: userId,
          jobId: jobId,
        },
      },
    });

    if (negotiation) {
      return {
        status: 409,
        error:
          "This user and job are already involved in an active negotiation",
      };
    }

    // if an interest object already exists, just update that
    if (interest) {
      const result = await prisma.interest.update({
        where: { id: interest.id },
        data: {
          candidateInterest: interestValue,
          candidate: {
            update: {
              lastActive: currentTime,
            },
          },
        },
      });

      return result;
    }

    // else, need to create an interest object (and update user activity)
    else {
      const result = await prisma.$transaction(async (tx) => {
        const interest = await tx.interest.create({
          data: {
            jobId: jobId,
            candidateId: userId,
            businessId: job.businessId,
            candidateInterest: interestValue,
          },
        });

        await tx.regularUser.update({
          where: { id: userId },
          data: {
            lastActive: currentTime,
          },
        });

        return interest;
      });

      return result;
    }
  }

  static async updateBusinessInterest(
    jobId,
    businessId,
    userId,
    interestValue,
  ) {
    // 403 if the userId does not exist
    const candidate = await prisma.regularUser.findUnique({
      where: { id: userId },
      include: { qualifications: true, committedJobs: true, user: true },
    });

    if (!candidate) {
      return {
        status: 404,
        error: `Could not find a regular user with id ${userId}`,
      };
    }

    // check if an interest object already exists
    const interest = await prisma.interest.findFirst({
      where: {
        jobId: jobId,
        candidateId: userId,
      },
    });

    // 403 if job posting doens't belong to the authenticated business or doesn't exist
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return { status: 404, error: `Could not find job with id ${jobId}` };
    }

    if (job.businessId !== businessId) {
      return {
        status: 404,
        error: "This job does not belong to this business user",
      };
    }

    // 409 if job is not open, so business isn't allowed to express interest
    if (job.status !== "open") {
      return {
        status: 409,
        error:
          "Job is not open, business cannot express interest in a candidate",
      };
    }

    // if interested is false but there is no interest object (hasn't previously expressed interest)
    // or there is an interest object, but the value is null
    if (
      (!interest && !interestValue) ||
      (interest && interest.businessInterest === null && !interestValue)
    ) {
      return {
        status: 409,
        error:
          "Cannot set to false, business has not previously expressed interest",
      };
    }

    // 403 if user is no longer discoverable
    if (!checkUserDiscoverable(candidate, job)) {
      return { status: 403, error: "Candidate is no longer discoverable" };
    }

    // if interest object already exists, update that
    if (interest) {
      const result = await prisma.interest.update({
        where: { id: interest.id },
        data: {
          businessInterest: interestValue,
        },
      });

      return result;
    }

    // if not, then create one
    else {
      const result = await prisma.interest.create({
        data: {
          jobId: jobId,
          candidateId: userId,
          businessId: job.businessId,
          businessInterest: interestValue,
        },
      });

      return result;
    }
  }

  static async listUserInterests(userId, filters) {
    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    const where = {
      candidateId: userId,
      candidateInterest: true,
    };

    const count = await prisma.interest.count({ where });
    const interests = await prisma.interest.findMany({
      where: where,
      include: {
        job: {
          include: { positionType: true },
        },
        business: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { count, interests };
  }

  static async listUserInvitations(userId, filters) {
    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    const where = {
      candidateId: userId,
      businessInterest: true,
      OR: [{ candidateInterest: false }, { candidateInterest: null }],
    };

    const count = await prisma.interest.count({ where });
    const interests = await prisma.interest.findMany({
      where: where,
      include: {
        job: {
          include: { positionType: true },
        },
        business: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { count, interests };
  }

  static async listCandidates(jobId, businessId, filters) {
    // check this job belongs to the business
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return { status: 404, error: `Could not find job with id ${jobId}` };
    }

    if (job.businessId !== businessId) {
      return {
        status: 404,
        error: "This job does not belong to the authenticated business",
      };
    }

    const users = await prisma.regularUser.findMany({
      include: { qualifications: true, committedJobs: true, user: true },
    });

    // filter for discoverable qualified regular users
    let possibleCandidates = users.filter((user) => {
      return checkUserDiscoverable(user, job);
    });

    // checking if user has been invited by the business for this job or not
    const interests = await prisma.interest.findMany({
      where: {
        jobId: job.id,
        candidateId: { in: possibleCandidates.map((c) => c.id) },
      },
    });

    const interestMap = new Map();
    for (const interest of interests) {
      interestMap.set(interest.candidateId, interest);
    }

    possibleCandidates = possibleCandidates.map((candidate) => {
      const interest = interestMap.get(candidate.id);

      return {
        ...candidate,
        invited: interest ? interest.businessInterest === true : false,
      };
    });

    // do pagination
    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    const skip = (page - 1) * limit;
    const take = limit;

    const paginatedCandidates = possibleCandidates.slice(skip, skip + take);

    return {
      count: possibleCandidates.length,
      candidates: paginatedCandidates,
    };
  }

  static async retrieveCandidate(businessId, userId, jobId) {
    // 404 if the userId does not exist
    const candidate = await prisma.regularUser.findUnique({
      where: { id: userId },
      include: { qualifications: true, committedJobs: true, user: true },
    });

    if (!candidate) {
      return {
        status: 404,
        error: `Could not find a regular user with id ${userId}`,
      };
    }

    // 404 if job posting doens't belong to the authenticated business or doesn't exist
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { positionType: true },
    });

    if (!job) {
      return { status: 404, error: `Could not find job with id ${jobId}` };
    }

    if (job.businessId !== businessId) {
      return {
        status: 404,
        error: "This job does not belong to this business user",
      };
    }

    // 403 if user is no longer discoverable, unless if they're the candidate who filled the job
    if (job.workerId !== userId && !checkUserDiscoverable(candidate, job)) {
      return {
        status: 403,
        error: "Candidate is no longer discoverable and did not fill this job",
      };
    }

    // make sure to only return the qualification that's applicable for this job
    const qualification = candidate.qualifications.filter((qual) => {
      return qual.positionTypeId === job.positionTypeId;
    })[0];

    return {
      user: candidate,
      job: job,
      qualification: qualification,
    };
  }

  static async listInterestedCandidates(jobId, businessId, filters) {
    // 404 if job doesn't belong to authenticated business
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { positionType: true },
    });

    if (!job) {
      return { status: 404, error: `Could not find job with id ${jobId}` };
    }

    if (job.businessId !== businessId) {
      return {
        status: 404,
        error: "This job does not belong to this business user",
      };
    }

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    const count = await prisma.interest.count({
      where: {
        candidateInterest: true,
        jobId: jobId,
      },
    });

    const interests = await prisma.interest.findMany({
      where: {
        candidateInterest: true,
        jobId: jobId,
      },
      include: {
        job: {
          include: { positionType: true },
        },
        business: true,
        candidate: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { count, interests };
  }
}

module.exports = { InterestService };
