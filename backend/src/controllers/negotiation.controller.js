const { NegotiationService } = require("../services/negotiation.services");

async function createNegotiationController(req, res) {
  // check user is regular or business
  if (req.user.role === "admin") {
    return res.status(403).json({
      error: "Must be a regular user or business for this request",
    });
  }

  // check interest_id is present in the payload
  if (req.body.interest_id === undefined) {
    return res.status(400).json({
      error: "Request does not included the required field interest_id",
    });
  }

  const result = await NegotiationService.create(
    req.body.interest_id,
    req.user,
  );

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  const { status, negotiation } = result;
  const { job, candidate } = negotiation.interest;

  return res.status(status).json({
    id: negotiation.id,
    status: negotiation.status,
    createdAt: negotiation.createdAt,
    updatedAt: negotiation.updatedAt,
    expiresAt: negotiation.expiresAt,
    job: {
      id: job.id,
      status: job.status,
      position_type: {
        id: job.positionType.id,
        name: job.positionType.name,
      },
      business: {
        id: job.business.id,
        business_name: job.business.businessName,
      },
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      start_time: job.startTime,
      end_time: job.endTime,
    },
    user: {
      id: candidate.id,
      first_name: candidate.firstName,
      last_name: candidate.lastName,
    },
    decisions: {
      candidate: negotiation.candidateDecision,
      business: negotiation.businessDecision,
    },
  });
}

async function retrieveCurrentNegotiationController(req, res) {
  // check user is regular or business
  if (req.user.role === "admin") {
    return res.status(403).json({
      error: "Must be a regular user or business for this request",
    });
  }

  const negotiation = await NegotiationService.retrieveActive(req.user);

  if (negotiation.error) {
    return res.status(negotiation.status).json({ error: negotiation.error });
  }

  const { job, candidate } = negotiation.interest;

  return res.json({
    id: negotiation.id,
    status: negotiation.status,
    createdAt: negotiation.createdAt,
    updatedAt: negotiation.updatedAt,
    expiresAt: negotiation.expiresAt,
    job: {
      id: job.id,
      status: job.status,
      position_type: {
        id: job.positionType.id,
        name: job.positionType.name,
      },
      business: {
        id: job.business.id,
        business_name: job.business.businessName,
      },
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      start_time: job.startTime,
      end_time: job.endTime,
    },
    user: {
      id: candidate.id,
      first_name: candidate.firstName,
      last_name: candidate.lastName,
    },
    decisions: {
      candidate: negotiation.candidateDecision,
      business: negotiation.businessDecision,
    },
  });
}

async function updateNegotiationDecisionController(req, res) {
  // check user is regular or business
  if (req.user.role === "admin") {
    return res.status(403).json({
      error: "Must be a regular user or business for this request",
    });
  }

  // check for required fields in the payload
  if (
    req.body.decision === undefined ||
    req.body.negotiation_id === undefined
  ) {
    return res.status(400).json({
      error:
        "Request does not included the required field of decision or negotiation_id",
    });
  }

  // check decision is a valid field
  if (req.body.decision !== "accept" && req.body.decision !== "decline") {
    return res
      .status(400)
      .json({ error: "Decision field is neither accept nor decline" });
  }

  // get the negotiation given by this id
  const givenNegotiation = await NegotiationService.retrieveById(
    req.body.negotiation_id,
  );

  if (givenNegotiation.error) {
    return res
      .status(givenNegotiation.status)
      .json({ error: givenNegotiation.error });
  }

  // get the user's active negotiation
  const negotiation = await NegotiationService.retrieveActive(req.user);

  if (negotiation.error) {
    return res.status(negotiation.status).json({ error: negotiation.error });
  }

  // 409 negotiation_id doesn't match the given active negotiation
  if (negotiation.id !== req.body.negotiation_id) {
    return res.status(409).json({
      error: `Given id ${req.body.negotiation_id} does not match the active negotiation id ${negotiation.id}`,
    });
  }

  const updatedNegotiation = await NegotiationService.updateDecision(
    negotiation,
    req.body.decision,
    req.user.role,
  );

  return res.json({
    id: updatedNegotiation.id,
    status: updatedNegotiation.status,
    createdAt: updatedNegotiation.createdAt,
    expiresAt: updatedNegotiation.expiresAt,
    updatedAt: updatedNegotiation.updatedAt,
    decisions: {
      candidate: updatedNegotiation.candidateDecision,
      business: updatedNegotiation.businessDecision,
    },
  });
}

module.exports = {
  createNegotiationController,
  retrieveCurrentNegotiationController,
  updateNegotiationDecisionController,
};
