const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  getNegotiationWindow,
  checkUserDiscoverable,
} = require("../system_config");
const { startNegotiation, decisionMade } = require("../socket");

class NegotiationService {
  static async create(interestId, user) {
    const currentTime = new Date();

    // if an active (not expired) negotiation already exists for this interest_id, then return that
    const negotiation = await prisma.negotiation.findFirst({
      where: {
        interestId: interestId,
        expiresAt: { gt: currentTime },
        status: "active",
      },
      include: {
        interest: {
          include: {
            job: {
              include: { positionType: true, business: true },
            },
            candidate: true,
          },
        },
      },
    });

    if (negotiation) {
      return { status: 200, negotiation: negotiation };
    }

    // get interest of interestId
    const interest = await prisma.interest.findUnique({
      where: { id: interestId },
      include: {
        job: true,
        candidate: {
          include: { user: true, qualifications: true, committedJobs: true },
        },
        business: true,
      },
    });

    // 404 if interest does not exist
    if (!interest) {
      return {
        status: 404,
        error: `Could not find interest with id ${interestId}`,
      };
    }

    // 404 if authenticated user is neither the business nor the candidate
    const candidateId = interest.candidateId;
    const businessId = interest.businessId;

    if (candidateId !== user.id && businessId !== user.id) {
      return {
        status: 404,
        error: "Authenticated user is neither the business nor the candidate",
      };
    }

    // 403 if interest is not mutual
    if (!interest.businessInterest || !interest.candidateInterest) {
      return {
        status: 403,
        error: "Interest is not mutual, cannot start negotiation",
      };
    }

    // 403 if regular user is not currently discoverable
    if (!checkUserDiscoverable(interest.candidate, interest.job)) {
      return {
        status: 403,
        error: "Candidate is not currently discoverable",
      };
    }

    // 409 if either party is in an active negotiation
    const checkActiveNegotiations = await prisma.negotiation.findMany({
      where: {
        interest: {
          is: {
            OR: [{ candidateId: candidateId }, { businessId: businessId }],
          },
        },
        expiresAt: { gt: currentTime },
        status: "active",
      },
    });

    if (checkActiveNegotiations.length > 0) {
      return {
        status: 409,
        error:
          "Either party (regular user or business) is currently in active negotiation",
      };
    }

    // 409 if job is no longer in state where negotiation can be started
    if (
      ["filled", "cancelled", "completed", "expired"].includes(
        interest.job.status,
      )
    ) {
      return {
        status: 409,
        error: "Job is no longer in state where negotiation can be started",
      };
    }

    // all checks passed, create new negotiation
    const expiresAt = new Date(currentTime);
    expiresAt.setSeconds(expiresAt.getSeconds() + getNegotiationWindow());

    const result = await prisma.negotiation.create({
      data: {
        createdAt: currentTime,
        updatedAt: currentTime,
        expiresAt: expiresAt,
        interestId: interestId,
      },
      include: {
        interest: {
          include: {
            job: {
              include: { positionType: true, business: true },
            },
            candidate: true,
          },
        },
      },
    });

    // emit event for negotiation start
    startNegotiation(result);

    return { status: 201, negotiation: result };
  }

  static async retrieveActive(user) {
    const currentTime = new Date();
    const userId = user.id;

    const where = {
      interest: {},
      expiresAt: { gt: currentTime },
      status: "active",
    };

    if (user.role === "regular") {
      where.interest = { candidateId: userId };
    } else {
      // user is a business
      where.interest = { businessId: userId };
    }

    const negotiation = await prisma.negotiation.findFirst({
      where: where,
      include: {
        interest: {
          include: {
            job: {
              include: { positionType: true, business: true },
            },
            candidate: true,
          },
        },
      },
    });

    if (!negotiation) {
      return {
        status: 404,
        error: "User is not involved in an active negotiation",
      };
    }

    return negotiation;
  }

  static async updateDecision(negotiation, userDecision, userRole) {
    const negotiationId = negotiation.id;
    const decisionField =
      userRole === "regular" ? "candidateDecision" : "businessDecision";

    const currentTime = new Date();

    // if userDecision is decline, negotiation should fail
    if (userDecision === "decline") {
      const updatedNegotiation = await prisma.negotiation.update({
        where: { id: negotiationId },
        include: {
          interest: true,
        },
        data: {
          [decisionField]: userDecision,
          status: "failed",
          interest: {
            update: {
              candidateInterest: null,
              businessInterest: null,
              candidate: {
                update: {
                  lastActive: currentTime,
                },
              },
            },
          },
        },
      });

      decisionMade(updatedNegotiation, userDecision, userRole);

      return updatedNegotiation;
    }

    const otherDecision =
      userRole === "regular"
        ? negotiation.businessDecision
        : negotiation.candidateDecision;

    // if both decisions are accept, update the negotiation and job posting
    if (userDecision === "accept" && otherDecision === "accept") {
      const candidateId = negotiation.interest.candidateId;

      const updatedNegotiation = await prisma.negotiation.update({
        where: { id: negotiationId },
        include: {
          interest: true,
        },
        data: {
          [decisionField]: userDecision,
          status: "success",
          interest: {
            update: {
              candidate: {
                update: {
                  lastActive: currentTime,
                },
              },
              job: {
                update: {
                  status: "filled",
                  workerId: candidateId,
                },
              },
            },
          },
        },
      });

      decisionMade(updatedNegotiation, userDecision, userRole);
      return updatedNegotiation;
    }

    // at this point, userDecision is accept but otherDecision is probably null
    // so just update the current user's decision
    const updatedNegotiation = await prisma.negotiation.update({
      where: { id: negotiationId },
      include: {
        interest: true,
      },
      data: {
        [decisionField]: userDecision,
        status: "active",
      },
    });

    decisionMade(updatedNegotiation, userDecision, userRole);

    return updatedNegotiation;
  }

  static async retrieveById(negotiationId) {
    const negotiation = await prisma.negotiation.findUnique({
      where: {
        id: negotiationId,
      },
    });

    if (!negotiation) {
      return {
        status: 404,
        error: `Could not find negotiation with id ${negotiationId}`,
      };
    }

    return negotiation;
  }
}

module.exports = { NegotiationService };
