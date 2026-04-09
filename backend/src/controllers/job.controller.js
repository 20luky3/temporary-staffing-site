const { JobService } = require("../services/job.services");
const {
  getJobStartWindow,
  getNegotiationWindow,
  getDistance,
} = require("../system_config");

async function createJobController(req, res) {
  // check user is a business
  if (req.user.role !== "business") {
    return res
      .status(403)
      .json({ error: "User must be a business to use this request" });
  }

  // check all the required fields are present
  const requiredFields = [
    "position_type_id",
    "salary_min",
    "salary_max",
    "start_time",
    "end_time",
  ];

  const missingField = requiredFields.find(
    (field) => req.body[field] === undefined,
  );

  if (missingField) {
    return res.status(400).json({
      error: `Missing required field: ${missingField}`,
    });
  }

  // check validity of salaries
  if (req.body.salary_min < 0 || req.body.salary_max < req.body.salary_min) {
    return res.status(400).json({ error: "Salary min or max are invalid" });
  }

  // check validity of times
  const currentTime = new Date();
  const startTime = new Date(req.body.start_time);
  const endTime = new Date(req.body.end_time);

  if (startTime < currentTime || endTime < currentTime) {
    return res
      .status(400)
      .json({ error: "Start time or end time is in the past" });
  }

  if (endTime < startTime) {
    return res.status(400).json({ error: "End time is before the start time" });
  }

  const jobStartWindowMaxStart = new Date(currentTime);
  jobStartWindowMaxStart.setHours(
    jobStartWindowMaxStart.getHours() + getJobStartWindow(),
  );

  if (jobStartWindowMaxStart < startTime) {
    return res
      .status(400)
      .json({ error: "Start time is too far in the future" });
  }

  if (startTime - currentTime < getNegotiationWindow() * 1000) {
    return res.status(400).json({
      error: "Not enough time for a full negotiation window before start time",
    });
  }

  const job = await JobService.create(req.body, req.user.id, currentTime);

  if (job.error) {
    return res.status(job.status).json({ error: job.error });
  }

  return res.status(201).json({
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
    worker: null,
    note: job.note,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    start_time: job.startTime,
    end_time: job.endTime,
    updatedAt: job.updatedAt,
  });
}

async function editJobController(req, res) {
  // check user is a business
  if (req.user.role !== "business") {
    return res
      .status(403)
      .json({ error: "User must be a business to use this request" });
  }

  // check jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res
      .status(404)
      .json({ error: `Could not find job with id ${req.params.jobId}` });
  }

  // check validity of salaries
  if (req.body.salary_min < 0 || req.body.salary_max < req.body.salary_min) {
    return res.status(400).json({ error: "Salary min or max are invalid" });
  }

  // check validity of times
  const currentTime = new Date();
  const startTime = new Date(req.body.start_time);
  const endTime = new Date(req.body.end_time);

  if (startTime < currentTime || endTime < currentTime) {
    return res
      .status(400)
      .json({ error: "Start time or end time is in the past" });
  }

  if (endTime < startTime) {
    return res.status(400).json({ error: "End time is before the start time" });
  }

  const jobStartWindowMaxStart = new Date(currentTime);
  jobStartWindowMaxStart.setHours(
    jobStartWindowMaxStart.getHours() + getJobStartWindow(),
  );

  if (jobStartWindowMaxStart < startTime) {
    return res
      .status(400)
      .json({ error: "Start time is too far in the future" });
  }

  if (startTime - currentTime < getNegotiationWindow() * 1000) {
    return res.status(400).json({
      error: "Not enough time for a full negotiation window before start time",
    });
  }

  const job = await JobService.update(jobId, req.body, currentTime);

  if (job.error) {
    return res.status(job.status).json({ error: job.error });
  }

  return res.status(200).json({
    id: job.id,
    ...req.body,
    updatedAt: currentTime,
  });
}

async function retrieveJobController(req, res) {
  // check user is regular or business
  if (req.user.role === "admin") {
    return res.status(403).json({
      error: "User must be a regular user or a business to use this request",
    });
  }

  // if lat and lon are in the payload but user is not regular
  if ((req.query.lat || req.query.lon) && req.user.role !== "regular") {
    return res
      .status(400)
      .json({ error: "Must be a regular user to use lat or lon in payloda" });
  }

  // 400 if lat is provided without lon
  if (req.query.lat && !req.query.lon) {
    return res.status(400).json({ error: "Lat is provided without lon" });
  }

  // 400 if lon is provided without lat
  if (!req.query.lat && req.query.lon) {
    return res.status(400).json({ error: "Lon is provided without lat" });
  }

  // 400 if lat and lon are provided, but invalid
  if (req.query.lat && req.query.lon) {
    // check both are floats
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res
        .status(400)
        .json({ error: "Either lat or lon are not valid numbers" });
    }

    // check range of lat
    if (lat < -90 || lat > 90)
      return res
        .status(400)
        .json({ error: "Bad request: lat is out of range" });

    // check range of lon
    if (lon < -180 || lon > 180)
      return res
        .status(400)
        .json({ error: "Bad request: lon is out of range" });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res
      .status(404)
      .json({ error: `Could not find job with id ${req.params.jobId}` });
  }

  const job = await JobService.retrieve(jobId, req.user);

  if (job.error) {
    return res.status(job.status).json({ error: job.error });
  }

  // calculate distance if this user is regular
  let distance,
    eta = undefined;

  if (req.user.role === "regular" && req.query.lon && req.query.lat) {
    const userLat = Number(req.query.lat);
    const userLon = Number(req.query.lon);
    const { lat, lon } = job.business.location;

    distance = getDistance(userLat, userLon, lat, lon);
    eta = 30 * distance;
  }

  return res.status(200).json({
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
    worker: job.worker
      ? {
          id: job.worker.id,
          first_name: job.worker.firstName,
          last_name: job.worker.lastName,
        }
      : null,
    note: job.note,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    start_time: job.startTime,
    end_time: job.endTime,
    updatedAt: job.updatedAt,
    distance: distance,
    eta: eta,
  });
}

async function listJobsController(req, res) {
  // must be a regular user
  if (req.user.role !== "regular") {
    return res.status(403).json({
      error: "Must be a regular user for this request",
    });
  }

  // sort by distance or eta is specified, but lat and lon are not specified
  if (
    (req.query.sort === "distance" || req.query.sort === "eta") &&
    (!req.query.lat || !req.query.lon)
  ) {
    return res.status(400).json({
      error:
        "Request wants to sort by distance or eta, but lat and lon are not specified",
    });
  }

  let { count, jobs } = await JobService.list(req.query);
  const userLat = Number(req.query.lat);
  const userLon = Number(req.query.lon);

  // now sort by distance/eta if needed
  if (req.query.sort === "distance" || req.query.sort === "eta") {
    // (this sorting order defaults to asc)
    jobs.sort((jobA, jobB) => {
      const { lat: latA, lon: lonA } = jobA.business.location;
      const { lat: latB, lon: lonB } = jobB.business.location;

      const valA = getDistance(userLat, userLon, latA, lonA);
      const valB = getDistance(userLat, userLon, latB, lonB);

      if (req.query.sort === "distance") {
        return valA - valB;
      } else {
        return valA * 30 - valB * 30;
      }
    });

    // if sorting order is desc, reverse the list
    if (req.query.order === "desc") {
      jobs.reverse();
    }

    // paginate
    const page = req.query.page ? Number(req.query.page) : 1; // default is 1
    const limit = req.query.limit ? Number(req.query.limit) : 10; // default is 10
    jobs = jobs.slice((page - 1) * limit, page * limit);
  }

  return res.json({
    count: count,
    results: jobs.map((job) => {
      let result = {
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
        updatedAt: job.updatedAt,
      };

      // if lat and lon are specified, also include dist and eta
      if (req.query.lon && req.query.lat) {
        let { lat, lon } = job.business.location;
        let distance = getDistance(userLat, userLon, lat, lon);

        result = {
          ...result,
          distance: distance,
          eta: distance * 30,
        };
      }

      return result;
    }),
  });
}

async function listMyJobsController(req, res) {
  // must be a business
  if (req.user.role !== "business") {
    return res.status(403).json({
      error: "Must be a business for this request",
    });
  }

  const { count, jobs } = await JobService.listMine(req.query, req.user.id);

  return res.json({
    count: count,
    results: jobs.map((job) => {
      return {
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
        updatedAt: job.updatedAt,
      };
    }),
  });
}

async function deleteJobController(req, res) {
  // must be a business
  if (req.user.role !== "business") {
    return res.status(403).json({
      error: "Must be a business for this request",
    });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res
      .status(404)
      .json({ error: `Could not find job with id ${req.params.jobId}` });
  }

  const success = await JobService.delete(jobId, req.user.id);

  if (success.error) {
    return res.status(success.status).json({ error: success.error });
  }

  return res.status(204).end();
}

async function updateNoShowController(req, res) {
  // must be a business
  if (req.user.role !== "business") {
    return res.status(403).json({
      error: "Must be a business for this request",
    });
  }

  // process jobId param
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res
      .status(404)
      .json({ error: `Could not find job with id ${req.params.jobId}` });
  }

  const job = await JobService.updateNoShow(jobId, req.user.id);

  if (job.error) {
    return res.status(job.status).json({ error: job.error });
  }

  return res.status(200).json({
    id: job.id,
    status: job.status,
    updatedAt: job.updatedAt,
  });
}

async function getUserJobsController(req, res) {
  // must be a user
  if (req.user.role !== "regular") {
    return res.status(403).json({
      error: "Must be a regular user for this request",
    });
  }

  const { count, jobs } = await JobService.listUserJobs(req.query, req.user.id);

  return res.json({
    count: count,
    results: jobs.map((job) => {
      return {
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
        updatedAt: job.updatedAt,
      };
    }),
  });
}

module.exports = {
  createJobController,
  editJobController,
  retrieveJobController,
  listJobsController,
  listMyJobsController,
  deleteJobController,
  updateNoShowController,
  getUserJobsController,
};
