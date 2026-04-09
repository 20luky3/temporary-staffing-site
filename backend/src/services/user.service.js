const { v4: uuidv4 } = require("uuid");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

class UserService {
  static async create(newUser) {
    /* Creates a new regular user with the given newUser object*/
    const currentTime = new Date();
    const expires = new Date();
    expires.setDate(currentTime.getDate() + 7); // add one week

    console.log(newUser);

    try {
      const user = await prisma.user.create({
        data: {
          role: "regular",
          email: newUser.email,
          password: newUser.password,
          activated: false,
          createdAt: currentTime,
          resetToken: uuidv4(),
          expiresAt: expires,

          regularUser: {
            create: {
              firstName: newUser.first_name,
              lastName: newUser.last_name,

              // Only include optional fields if they exist
              ...(newUser.phone_number && { phoneNumber: newUser.phone_number }),
              ...(newUser.postal_address && {
                postalAddress: newUser.postal_address,
              }),
              ...(newUser.birthday && { birthday: newUser.birthday }),

              lastActive: currentTime, // last active when they created the account
            },
          },
        },
        include: {
          regularUser: true, // for returning in response
        },
      });

      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return { error: "Unique constraint failed" };
      }

      console.log(e);
      throw e;
    }
  }

  static async list(filters) {
    // Build object to pass into findMany
    const findManyObj = {
      include: {
        regularUser: true,
      },
    };

    const where = {};
    where.role = "regular"; // only return regular users

    if (filters.keyword) {
      const keywordFilters = [
        { firstName: { contains: filters.keyword } },
        { lastName: { contains: filters.keyword } },
        { phoneNumber: { contains: filters.keyword } },
        { postalAddress: { contains: filters.keyword } },
      ];

      where.OR = [
        { email: { contains: filters.keyword } },
        { regularUser: { OR: keywordFilters } },
      ];
    }

    if (filters.activated) {
      where.activated = filters.activated === "true";
    }

    if (filters.suspended) {
      where.regularUser = {
        ...where.regularUser,
        suspended: filters.suspended === "true",
      };
    }

    findManyObj.where = where;

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    findManyObj.skip = (page - 1) * limit;
    findManyObj.take = limit;

    const count = await prisma.user.count({ where });
    const users = await prisma.user.findMany(findManyObj);

    return { count: count, users: users };
  }

  static async updateSuspended(userId, suspended) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId, role: "regular" },
        data: { regularUser: { update: { suspended: suspended } } },
        include: { regularUser: true },
      });

      return updatedUser;
    } catch (e) {
      if (e.code === "P2025") {
        return { status: 404, error: `Could not find user with id ${userId}` };
      }
      throw e;
    }
  }

  static async retrieve(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId, role: "regular" },
      include: { regularUser: true },
    });

    return user;
  }

  static async update(userId, updatedFields) {
    const updatedUser = await prisma.user.update({
      where: { id: userId, role: "regular" },
      data: {
        regularUser: {
          update: {
            firstName: updatedFields.first_name,
            lastName: updatedFields.last_name,
            phoneNumber: updatedFields.phone_number,
            postalAddress: updatedFields.postal_address,
            birthday: updatedFields.birthday,
            avatar: updatedFields.avatar,
            biography: updatedFields.biography,
          },
        },
      },
      include: { regularUser: true },
    });

    return updatedUser;
  }

  static async updateAvailability(userId, availability) {
    const user = await prisma.regularUser.findUnique({
      where: {
        id: userId,
      },
      include: {
        qualifications: true,
      },
    });

    // check if user is suspended
    if (user.suspended && availability) {
      return {
        status: 400,
        error: "Cannot set availability to true, this account is suspended",
      };
    }

    // check if user has any approved qualifications
    const approvedQualifications = user.qualifications.filter(
      (qual) => qual.status === "approved",
    );

    if ((approvedQualifications.length === 0) & availability) {
      // could not find any approved qualifications
      return {
        status: 400,
        error:
          "Cannot set availability to true, this account has no approved qualifications",
      };
    }

    // all checks passed, update accordingly
    const updatedUser = await prisma.regularUser.update({
      where: { id: userId },
      data: {
        availability: availability,
      },
    });

    return updatedUser;
  }

  static async updateFilepath(userId, fileField, path) {
    await prisma.regularUser.update({
      where: { id: userId },
      data: {
        [fileField]: path,
      },
    });

    return;
  }
}

module.exports = { UserService };
