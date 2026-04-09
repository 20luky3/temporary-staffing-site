const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

class QualificationService {
  static async create(userId, positionTypeId, note) {
    // check this positionType is visible (not hidden)
    const positionType = await prisma.positionType.findUnique({
      where: {
        id: positionTypeId,
      },
    });

    if (!positionType) {
      return {
        status: 404,
        error: `Could not find a positionType with id ${positionTypeId}`,
      };
    }

    if (positionType.hidden) {
      // positionType is hidden so this request shouldn't work
      return {
        status: 400,
        error:
          "This positionType is not visible, you shouldn't be able to see it",
      };
    }

    // check the user doesn't already have a qualification for this positionType
    const qual = await prisma.qualification.findFirst({
      where: {
        userId: userId,
        positionTypeId: positionTypeId,
      },
    });

    if (qual) {
      return {
        status: 409,
        error:
          "Qualification for this user already exists for this position type",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      // create qualification
      let qualification;

      try {
        qualification = await tx.qualification.create({
          data: {
            note: note,
            updatedAt: new Date(),
            userId: userId,
            positionTypeId: positionTypeId,
          },
          include: {
            user: true,
            positionType: true,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          return {
            status: 500,
            error: `Error when creating qualification for user ${userId} and positionType ${positionTypeId}`,
          };
        }
      }

      // update corresponding positionType
      await tx.positionType.update({
        where: { id: positionTypeId },
        data: {
          numQualified: { increment: 1 },
        },
      });

      return qualification;
    });

    return result;
  }

  static async list(filters) {
    // Build object to pass into findMAny
    const findManyObj = {
      include: {
        user: true,
        positionType: true,
      },
    };

    const where = {};
    where.status = { in: ["submitted", "revised"] };

    if (filters.keyword) {
      where.OR = [
        { user: { firstName: { contains: filters.keyword } } },
        { user: { lastName: { contains: filters.keyword } } },
        { user: { phoneNumber: { contains: filters.keyword } } },
        { user: { user: { email: { contains: filters.keyword } } } },
      ];
    }

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    findManyObj.where = where;
    findManyObj.skip = (page - 1) * limit;
    findManyObj.take = limit;

    const count = await prisma.qualification.count({ where });
    const qualifications = await prisma.qualification.findMany(findManyObj);

    return { count: count, qualifications: qualifications };
  }

  static async listMine(userId, filters) {
    const where = {
      userId: userId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    const count = await prisma.qualification.count({ where });
    const qualifications = await prisma.qualification.findMany({
      where: where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: true,
        positionType: true,
      },
    });

    return { count, qualifications };
  }

  static async update(user, qualificationId, qualificationRequest) {
    const currQual = await prisma.qualification.findUnique({
      where: { id: qualificationId },
    });

    // check qualification actually exists
    if (!currQual) {
      return {
        status: 404,
        error: `Could not find qualification with id ${qualificationId}`,
      };
    }

    // if regular user, check this user actually owns this user
    if (user.role === "regular" && currQual.userId !== user.id) {
      return {
        status: 403,
        error: "This regular user cannot edit another user's qualification",
      };
    }

    // if changing status, get the qualification and check it CAN be modified
    if (qualificationRequest.status) {
      if (
        !qualificationRequest.allowedCurrentStatus.includes(currQual.status)
      ) {
        return {
          status: 403,
          error: `Current status ${currQual.status} cannot be changed into ${qualificationRequest.status} for this qualification`,
        };
      }
    }

    // do the actual update
    const updatedQual = await prisma.qualification.update({
      where: { id: qualificationId },
      data: {
        status: qualificationRequest.status,
        note: qualificationRequest.note,
        updatedAt: new Date(),
      },
      include: {
        user: true,
        positionType: true,
      },
    });

    return updatedQual;
  }

  static async retrieve(qualificationId, user) {
    const qualification = await prisma.qualification.findUnique({
      where: { id: qualificationId },
      include: {
        user: {
          include: {
            user: true,
            interests: {
              include: { job: true },
            },
          },
        },
        positionType: true,
      },
    });

    // 404 if qualification doesn't exist
    if (!qualification) {
      return {
        status: 404,
        error: `Could not find qualification with id ${qualificationId}`,
      };
    }

    // 404 if regular user tries to view a qualification that's not their own
    if (user.role === "regular" && qualification.user.id !== user.id) {
      return {
        status: 404,
        error: "User cannot view a qualification that is not their own",
      };
    }

    // 403 if business attempts to view a non-approved qualification
    if (user.role === "business" && qualification.status !== "approved") {
      return {
        status: 403,
        error: "Business cannot view a non-approved qualification",
      };
    }

    // 403 if qualification belongs to someone who hasn't expressed interest to any of the business's active job postings
    if (user.role === "business") {
      const qualUser = qualification.user;

      let activeJobs = await prisma.job.findMany({
        where: {
          businessId: user.id,
          // status: {not: ["expired", "cancelled", "completed"]},
        },
      });

      activeJobs = activeJobs.map((e) => e.id); // convert to a regular array
      const interestedInActive = qualUser.interests.filter((interest) => {
        return activeJobs.includes(interest.jobId);
      });

      if (interestedInActive.length === 0)
        return {
          status: 403,
          error:
            "Qualification belongs to some who hasn't expresed interest in any of the business's active job postings",
        };

      // 403 if the job posting that person expressed interest does not require this qualification
      // (specfically, the position type of the qualification)
      if (
        interestedInActive[0].job.positionTypeId !==
        qualification.positionTypeId
      )
        return {
          status: 403,
          error:
            "Job posting that person is interested in does not require this qualification",
        };
    }

    return qualification;
  }

  static async updateFilepath(qualificationId, userId, fileField, path) {
    let updated;
    try {
      updated = await prisma.qualification.update({
        where: { id: qualificationId },
        data: {
          [fileField]: path,
        },
      });
    } catch (e) {
      if (e.code === "P2025") {
        // update failed because qualification didn't exist
        return {
          status: 404,
          error: `Could not find qualification with id ${qualificationId}`,
        };
      }

      throw e;
    }

    // check the user actually owns this qualification
    if (updated.userId !== userId) {
      return {
        status: 403,
        error: `This user is not the correct one for this qualification id ${qualificationId}`,
      };
    }

    return updated;
  }
}

module.exports = { QualificationService };
