const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class PositionTypeService {
  static async create(newPositionType) {
    const positionType = await prisma.positionType.create({
      data: newPositionType,
    });

    return positionType;
  }

  static async update(positionTypeId, newFields) {
    try {
      const updatedPositionType = await prisma.positionType.update({
        where: { id: positionTypeId },
        data: {
          ...newFields,
        },
      });

      return updatedPositionType;
    } catch (e) {
      if (e.code === "P2025") {
        return {
          status: 404,
          error: `Could not find position type with id ${positionTypeId}`,
        };
      }

      throw e;
    }
  }

  static async delete(positionTypeId) {
    const positionType = await prisma.positionType.findUnique({
      where: { id: positionTypeId },
    });

    if (!positionType) {
      return {
        status: 404,
        error: `Could not find a record with id ${positionTypeId}`,
      };
    }

    if (positionType.numQualified !== 0) {
      return {
        status: 409,
        error: "Position has a non-zero number of qualified users",
      };
    }

    try {
      await prisma.positionType.delete({
        where: { id: positionTypeId },
      });
    } catch (e) {
      if (e.code === "P2003") {
        return {
          status: 409,
          error: "Position has a non-zero number of jobs associated with it",
        };
      }
    }

    return { status: 204 };
  }

  static async list(filters, isAdmin) {
    // Build object to pass into findMany
    const findManyObj = {};

    if (filters.keyword) {
      findManyObj.where = {
        OR: [
          { name: { contains: filters.keyword } },
          { description: { contains: filters.keyword } },
        ],
      };
    }

    if (isAdmin) {
      // set the sorting order
      findManyObj.orderBy = [
        { numQualified: filters.num_qualified ? filters.num_qualified : "asc" },
        { name: filters.name ? filters.name : "asc" },
      ];
    } else {
      findManyObj.orderBy = { name: filters.name ? filters.name : "asc" };

      // don't allow not admins to view hidden roles
      findManyObj.where = {
        ...findManyObj.where,
        hidden: false,
      };
    }

    if (filters.hidden !== undefined) {
      findManyObj.where = {
        ...findManyObj.where,
        hidden: filters.hidden === "true",
      };
    }

    const page = filters.page ? Number(filters.page) : 1; // default is 1
    const limit = filters.limit ? Number(filters.limit) : 10; // default is 10

    findManyObj.skip = (page - 1) * limit;
    findManyObj.take = limit;

    // set select keywords if not admin
    if (!isAdmin) {
      findManyObj.select = {
        id: true,
        name: true,
        description: true,
        hidden: false,
        numQualified: false,
      };
    }

    const count = await prisma.positionType.count({ where: findManyObj.where });
    const positionTypes = await prisma.positionType.findMany(findManyObj);

    return { count, positionTypes };
  }
}

module.exports = { PositionTypeService };
