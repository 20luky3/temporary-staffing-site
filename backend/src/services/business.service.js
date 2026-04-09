const { v4: uuidv4 } = require("uuid");
const { PrismaClient, Prisma } = require("@prisma/client");
const prisma = new PrismaClient();

class BusinessService {
  static async create(newBusiness) {
    /* Create a new business accout with the given newBusiness object */
    const currentTime = new Date();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // add one week to currentTime

    try {
      const business = await prisma.user.create({
        data: {
          role: "business",
          email: newBusiness.email,
          password: newBusiness.password,
          activated: false,
          createdAt: currentTime,
          resetToken: uuidv4(),
          expiresAt: expires,

          businessUser: {
            create: {
              businessName: newBusiness.business_name,
              ownerName: newBusiness.owner_name,
              phoneNumber: newBusiness.phone_number,
              postalAddress: newBusiness.postal_address,
              location: newBusiness.location,
            },
          },
        },
        include: {
          businessUser: true, // for returning in response
        },
      });

      return business;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return { error: "Unique constraint failed" };
      }

      console.log(e);
      throw e;
    }
  }

  static async list(filters, isAdmin) {
    /* Return a list of businesses, according to the given filters */

    // build the object to pass into findMany
    const findManyObj = {
      include: {
        businessUser: true, // for returning in response
      },
    };
    const where = {};

    where.role = "business"; // only filter businesses

    if (filters.keyword) {
      const keywordFilters = [
        { businessName: { contains: filters.keyword } },
        { postalAddress: { contains: filters.keyword } },
        { phoneNumber: { contains: filters.keyword } },
      ];

      if (isAdmin) {
        keywordFilters.push({ ownerName: { contains: filters.keyword } });
      }

      where.OR = [
        { email: { contains: filters.keyword } },
        { businessUser: { OR: keywordFilters } },
      ];
    }

    if (filters.activated) {
      where.activated = filters.activated === "true";
    }

    if (filters.verified) {
      where.businessUser = {
        ...where.businessUser,
        verified: filters.verified === "true",
      };
    }

    findManyObj.where = where;

    if (filters.sort) {
      let order = "asc"; // defaults to asc

      if (filters.order) {
        order = filters.order;
      }

      const namesMap = {
        business_name: "businessName",
        owner_name: "ownerName",
        email: "email",
      };

      const sortField = namesMap[filters.sort];

      if (sortField === "email") {
        findManyObj.orderBy = { [sortField]: order };
      } else {
        findManyObj.orderBy = {
          businessUser: {
            [sortField]: order,
          },
        };
      }
    }

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    findManyObj.skip = (page - 1) * limit;
    findManyObj.take = limit;

    const count = await prisma.user.count({ where });
    const businesses = await prisma.user.findMany(findManyObj);

    return { count, businesses };
  }

  static async retrieve(businessId) {
    /** Retrieves a specific business */

    const business = await prisma.user.findUnique({
      where: { id: businessId, role: "business" },
      include: { businessUser: true },
    });

    return business;
  }

  static async updateVerified(businessId, verified) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: businessId, role: "business" },
        data: { businessUser: { update: { verified: verified } } },
        include: { businessUser: true },
      });

      return updatedUser;
    } catch (e) {
      if (e.code === "P2025") {
        return {
          status: 404,
          error: `Could not find business with id ${businessId}`,
        };
      }

      throw e;
    }
  }

  static async update(businessId, updatedFields) {
    try {
      const updatedBusiness = await prisma.user.update({
        where: { id: businessId, role: "business" },
        data: {
          businessUser: {
            update: {
              businessName: updatedFields.business_name,
              ownerName: updatedFields.owner_name,
              phoneNumber: updatedFields.phone_number,
              postalAddress: updatedFields.postal_address,
              location: updatedFields.location,
              avatar: updatedFields.avatar,
              biography: updatedFields.biography,
            },
          },
        },
      });

      return updatedBusiness;
    } catch (e) {
      if (e.code === "P2025") {
        return {
          status: 404,
          error: `Could not find business with id ${businessId}`,
        };
      }

      throw e;
    }
  }

  static async updateFilepath(userId, fileField, path) {
    await prisma.businessUser.update({
      where: { id: userId },
      data: {
        [fileField]: path,
      },
    });

    return;
  }
}

module.exports = { BusinessService };
