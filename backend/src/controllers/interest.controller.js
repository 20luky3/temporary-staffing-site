const { InterestService } = require("../services/interest.services");

async function updateUserInterestController(req, res) {
  // must be a regular user
  if (req.user.role !== "regular") {
    return res.status(403).json({
      error: "Must be a regular user for this request",
    });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res
      .status(404)
      .json({ error: `Could not find job with id ${req.params.jobId}` });
  }

  // make sure interested is included in payload body
  if (req.body.interested === undefined) {
    return res.status(400).json({
      error: "Request does not included the required field of interested",
    });
  }

  const interest = await InterestService.updateUserInterest(
    jobId,
    req.user.id,
    req.body.interested,
  );

  if (interest.error) {
    return res.status(interest.status).json({ error: interest.error });
  }

  return res.status(200).json({
    id: interest.id,
    job_id: interest.jobId,
    candidate: {
      id: interest.candidateId,
      interested: interest.candidateInterest,
    },
    business: {
      id: interest.businessId,
      interested: interest.businessInterest,
    },
  });
}

async function updateBusinessInterestController(req, res) {
  // must be a business user
  if (req.user.role !== "business") {
    return res.status(403).json({
      error: "Must be a business for this request",
    });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res.status(404).json({
      error: `Given jobId ${req.params.jobId} is not a valid integer`,
    });
  }

  // process userId param
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId)) {
    return res.status(404).json({
      error: `Given userId ${req.params.userId} is not a valid integer`,
    });
  }

  // make sure interested is included in payload body
  if (req.body.interested === undefined) {
    return res.status(400).json({
      error: "Request does not included the required field of interested",
    });
  }

  const interest = await InterestService.updateBusinessInterest(
    jobId,
    req.user.id,
    userId,
    req.body.interested,
  );

  if (interest.error) {
    return res.status(interest.status).json({ error: interest.error });
  }

  return res.status(200).json({
    id: interest.id,
    job_id: interest.jobId,
    candidate: {
      id: interest.candidateId,
      interested: interest.candidateInterest,
    },
    business: {
      id: interest.businessId,
      interested: interest.businessInterest,
    },
  });
}

async function listUserInterestsController(req, res) {
  // must be a regular user
  if (req.user.role !== "regular") {
    return res.status(403).json({
      error: "Must be a regular user for this request",
    });
  }

  const { count, interests } = await InterestService.listUserInterests(
    req.user.id,
    req.query,
  );

  return res.json({
    count: count,
    results: interests.map((interest) => {
      return {
        interest_id: interest.id,
        mutual: interest.candidateInterest === interest.businessInterest,
        job: {
          id: interest.job.id,
          status: interest.job.status,
          position_type: {
            id: interest.job.positionType.id,
            name: interest.job.positionType.name,
          },
          business: {
            id: interest.business.id,
            business_name: interest.business.businessName,
          },
          salary_min: interest.job.salaryMin,
          salary_max: interest.job.salaryMax,
          start_time: interest.job.startTime,
          end_time: interest.job.endTime,
          updatedAt: interest.job.updatedAt,
        },
      };
    }),
  });
}

async function listUserInvitationsController(req, res) {
  // must be a regular user
  if (req.user.role !== "regular") {
    return res.status(403).json({
      error: "Must be a regular user for this request",
    });
  }

  const { count, interests } = await InterestService.listUserInvitations(
    req.user.id,
    req.query,
  );

  return res.json({
    count: count,
    results: interests.map((interest) => {
      return {
        id: interest.job.id,
        status: interest.job.status,
        position_type: {
          id: interest.job.positionType.id,
          name: interest.job.positionType.name,
        },
        business: {
          id: interest.business.id,
          business_name: interest.business.businessName,
        },
        salary_min: interest.job.salaryMin,
        salary_max: interest.job.salaryMax,
        start_time: interest.job.startTime,
        end_time: interest.job.endTime,
        updatedAt: interest.job.updatedAt,
      };
    }),
  });
}

async function listCandidatesController(req, res) {
  // must be a business user
  if (req.user.role !== "business") {
    return res.status(403).json({
      error: "Must be a business for this request",
    });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res.status(404).json({
      error: `Given jobId ${req.params.jobId} is not a valid integer`,
    });
  }

  const results = await InterestService.listCandidates(
    jobId,
    req.user.id,
    req.query,
  );

  if (results.error) {
    return res.status(results.status).json({ error: results.error });
  }

  const { count, candidates } = results;

  return res.json({
    count: count,
    results: candidates.map((candidate) => {
      return {
        id: candidate.id,
        first_name: candidate.firstName,
        last_name: candidate.lastName,
        invited: candidate.invited,
      };
    }),
  });
}

async function retrieveCandidateController(req, res) {
  // must be a business user
  if (req.user.role !== "business") {
    return res.status(403).json({
      error: "Must be a business for this request",
    });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res.status(404).json({
      error: `Given jobId ${req.params.jobId} is not a valid integer`,
    });
  }

  // process userId param
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId)) {
    return res.status(404).json({
      error: `Given userId ${req.params.userId} is not a valid integer`,
    });
  }

  const returned = await InterestService.retrieveCandidate(
    req.user.id,
    userId,
    jobId,
  );

  if (returned.error) {
    return res.status(returned.status).json({ error: returned.error });
  }

  const { user, job, qualification } = returned;

  let result = {
    user: {
      id: user.id,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar: user.avatar,
      resume: user.resume,
      biography: user.biography,
      qualification: {
        id: qualification.id,
        position_type_id: qualification.positionTypeId,
        document: qualification.document,
        note: qualification.note,
        updatedAt: qualification.updatedAt,
      },
    },
    job: {
      id: job.id,
      status: job.status,
      position_type: {
        id: job.positionType.id,
        name: job.positionType.name,
        description: job.positionType.description,
      },
      start_time: job.startTime,
      end_time: job.endTime,
    },
  };

  // if this candidate filled the job, include extra info
  if (job.workerId === user.id) {
    result = {
      user: {
        ...result.user,
        email: user.user.email,
        phone_number: user.phoneNumber,
      },
      job: {
        ...result.job,
      },
    };
  }

  return res.json(result);
}

async function listInterestedCandidatesController(req, res) {
  // must be a business user
  if (req.user.role !== "business") {
    return res.status(403).json({
      error: "Must be a business for this request",
    });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res.status(404).json({
      error: `Given jobId ${req.params.jobId} is not a valid integer`,
    });
  }

  const result = await InterestService.listInterestedCandidates(
    jobId,
    req.user.id,
    req.query,
  );

  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  const { count, interests } = result;

  return res.json({
    count: count,
    results: interests.map((interest) => {
      return {
        interest_id: interest.id,
        mutual: interest.candidateInterest === interest.businessInterest,
        user: {
          id: interest.candidate.id,
          first_name: interest.candidate.firstName,
          last_name: interest.candidate.lastName,
        },
      };
    }),
  });
}

module.exports = {
  updateUserInterestController,
  listUserInterestsController,
  updateBusinessInterestController,
  listUserInvitationsController,
  listCandidatesController,
  retrieveCandidateController,
  listInterestedCandidatesController,
};
