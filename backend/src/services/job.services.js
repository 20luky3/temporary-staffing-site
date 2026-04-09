const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class JobService {
  static async create(newJob, businessId, currentTime) {
    // check if this business is not verified
    const business = await prisma.businessUser.findUnique({
      where: { id: businessId },
    });

    if (!business.verified) {
      return {
        status: 403,
        error: "Business cannot create job postings, it's not verified",
      };
    }

    const job = await prisma.job.create({
      data: {
        status: "open",
        note: newJob.note,
        updatedAt: currentTime,

        salaryMin: newJob.salary_min,
        salaryMax: newJob.salary_max,

        startTime: new Date(newJob.start_time),
        endTime: new Date(newJob.end_time),

        positionTypeId: newJob.position_type_id,
        businessId: businessId,
      },
      include: {
        positionType: true,
        business: true,
      },
    });

    return job;
  }

  static async update(jobId, updatedFields, currentTime) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    // check if the job is no longer in the open state
    if (job.status !== "open") {
      return { status: 409, error: "Job is no longer in the open state" };
    }

    // check if current time is past the start time
    if (job.startTime < currentTime) {
      return {
        status: 409,
        error: "Current time is past the start time (i.e. expired state)",
      };
    }

    // if updating only salary min, check it's valid with salary max
    if (updatedFields.salary_min && !updatedFields.salary_max) {
      if (updatedFields.salary_min > job.salaryMax) {
        return {
          status: 400,
          error: "New salary min is not valid with existing salary max",
        };
      }
    }

    // if updating only salary max, check it's valid with salary min
    if (updatedFields.salary_max && !updatedFields.salary_min) {
      if (updatedFields.salary_max < job.salaryMin) {
        return {
          status: 400,
          error: "New salary max is not valid with existing salary min",
        };
      }
    }

    // if updating only start time, check it's valid with end time
    if (updatedFields.start_time && !updatedFields.end_time) {
      if (updatedFields.start_time > job.endTime) {
        return {
          status: 400,
          error: "New start time is not valid with existing end time",
        };
      }
    }

    // if updating only end time, check it's valid with start time
    if (updatedFields.end_time && !updatedFields.start_time) {
      if (updatedFields.end_time < job.startTime) {
        return {
          status: 400,
          error: "New end time is not valid with existing start time",
        };
      }
    }

    // update job and update negotiations with this job id
    const result = await prisma.$transaction(async (tx) => {
      // update the job
      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          salaryMin: updatedFields.salary_min,
          salaryMax: updatedFields.salary_max,
          startTime: updatedFields.start_time
            ? new Date(updatedFields.start_time)
            : undefined,
          endTime: updatedFields.end_time
            ? new Date(updatedFields.end_time)
            : undefined,
          note: updatedFields.note,
          updatedAt: currentTime,
        },
      });

      // update the decisions for all negotiations with this job id
      await tx.negotiation.updateMany({
        where: {
          interest: {
            jobId: jobId,
          },
        },
        data: {
          status: "active",
          candidateDecision: null,
          businessDecision: null,
        },
      });

      return updatedJob;
    });

    return result;
  }

  static async retrieve(jobId, user) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        positionType: true,
        business: true,
        worker: true,
      },
    });

    // check if jobId exists
    if (!job) {
      return { status: 404, error: `Could not find a job with id ${jobId}` };
    }

    // if business, check if it's their job
    if (user.role === "business" && job.businessId !== user.id) {
      return {
        status: 404,
        error: "Job does not belong to this business user",
      };
    }

    // checking regular user constraints
    if (user.role === "regular") {
      // worker is this user + job is not filled, cancelled, or completed
      if (job.workerId !== undefined && job.workerId == user.id) {
        if (!["filled", "cancelled", "completed"].includes(job.status)) {
          return {
            status: 403,
            error:
              "Regular user is this job's worker, but the job is not filled, cancelled, or completed",
          };
        }
        // worker is this user and job is filled, cancelled, or completed
        return job;
      }

      // at this point, the job should be open
      if (job.status !== "open") {
        return {
          status: 403,
          error: "Regular users cannot view a non-open job",
        };
      }

      // job is open, but the user does not qualify for this job
      // check if their qualifications contains the position type id
      const retrievedUser = await prisma.regularUser.findUnique({
        where: { id: user.id },
        include: { qualifications: true },
      });

      const positionTypeId = job.positionType.id;
      const userQualifications = retrievedUser.qualifications;

      const validQuals = userQualifications.filter(
        (qual) =>
          qual.positionTypeId === positionTypeId && qual.status === "approved",
      );

      if (validQuals.length === 0) {
        return { status: 403, error: "User does not qualify for this job" };
      }
    }

    return job;
  }

  static async list(filters) {
    // build object to pass into findMany
    const findManyObj = {
      include: {
        positionType: true,
        business: true,
      },
    };

    const where = { status: "open" }; // job posting must be open

    if (filters.position_type_id) {
      where.positionTypeId = Number(filters.position_type_id);
    }

    if (filters.business_id) {
      where.businessId = Number(filters.business_id);
    }

    findManyObj.where = where;

    // set sort order
    let order = "asc"; // default is asc

    if (filters.order) {
      order = filters.order;
    }

    const namesMap = {
      updatedAt: "updatedAt",
      start_time: "startTime",
      salary_min: "salaryMin",
      salary_max: "salaryMax",
    };

    let sortField = "startTime";

    const isComputedSort = ["distance", "eta"].includes(filters.sort);

    if (!isComputedSort) {
      sortField = namesMap[filters.sort];
      findManyObj.orderBy = { [sortField]: order };
    }

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    if (!isComputedSort) { // do pagination if sort isn't eta or distance
      findManyObj.skip = (page - 1) * limit;
      findManyObj.take = limit;
    }
    const count = await prisma.job.count({ where });
    const jobs = await prisma.job.findMany(findManyObj);

    return { count, jobs };
  }

  static async listMine(filters, businessId) {
    // build object to pass into findMany
    const findManyObj = {
      include: {
        positionType: true,
        business: true,
      },
    };

    const where = { businessId: businessId };

    if (filters.position_type_id) {
      where.positionTypeId = Number(filters.position_type_id);
    }

    if (filters.salary_min) {
      where.salaryMin = { gte: Number(filters.salary_min) };
    }

    if (filters.salary_max) {
      where.salaryMax = { gt: Number(filters.salary_max) };
    }

    if (filters.start_time) {
      where.startTime = { gt: new Date(filters.start_time) };
    }

    if (filters.end_time) {
      where.endTime = { lt: new Date(filters.end_time) };
    }

    let allowedStatus = ["open", "filled"];

    if (filters.status) {
      if (!Array.isArray(filters.status)) {
        allowedStatus = [filters.status];
      } else {
        allowedStatus = filters.status;
      }
    }

    where.status = { in: allowedStatus };

    findManyObj.where = where;

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    findManyObj.skip = (page - 1) * limit;
    findManyObj.take = limit;

    const count = await prisma.job.count({ where });
    const jobs = await prisma.job.findMany(findManyObj);

    return { count, jobs };
  }

  static async listUserJobs(filters, userId) {
    const page = filters.page ? Number(filters.page) : 1;
    const limit = filters.limit ? Number(filters.limit) : 10;

    const count = await prisma.job.count({
      where: {
        workerId: userId,
      },
    });

    const jobs = await prisma.job.findMany({
      where: {
        workerId: userId,
      },
      include: {
        positionType: true,
        business: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { count, jobs };
  }

  static async delete(jobId, businessId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    // check status
    const allowedStatus = ["open", "expired"];
    if (!allowedStatus.includes(job.status)) {
      return { status: 409, error: "Job is not in the open or expired state" };
    }

    // check this business owns this job
    if (job.businessId !== businessId) {
      return {
        status: 409,
        error: "This business does not own this job posting",
      };
    }

    // 409 if job is currently in an active negotiation
    const currentTime = new Date();
    const negotiation = await prisma.negotiation.findFirst({
      where: {
        expiresAt: { gt: currentTime },
        status: "active",
        interest: {
          jobId: jobId,
        },
      },
    });

    if (negotiation) {
      return {
        status: 409,
        error: "This job is currently involved in an active negotiation",
      };
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    return { status: 204 };
  }

  static async updateNoShow(jobId, userId) {
    const currentTime = new Date();
    const job = await prisma.job.findUnique({ where: { id: jobId } });

    // check job exists
    if (!job)
      return { status: 404, error: `Could not find job with id ${jobId}` };

    // check this business user owns this job
    if (job.businessId !== userId) {
      return {
        status: 403,
        error: "This business does not own this job that's being modified",
      };
    }

    // check job is not filled
    if (job.status !== "filled") {
      return { status: 409, error: "Job has not been filled yet" };
    }

    // check job has not yet started
    if (currentTime < job.startTime) {
      return { status: 409, error: "Job has not started yet" };
    }

    // check is already over
    if (currentTime >= job.endTime) {
      return { status: 409, error: "Job has already ended" };
    }

    // update both job as cancelled and user as suspended in transaction
    const result = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "cancelled",
        updatedAt: currentTime,
        worker: {
          update: {
            suspended: true,
          },
        },
      },
    });

    return result;
  }
}

module.exports = { JobService };
