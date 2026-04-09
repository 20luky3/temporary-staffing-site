const { BusinessService } = require("../services/business.service");
const fs = require("fs");

async function createBusinessController(req, res) {
  const business = await BusinessService.create(req.body);

  if (business.error) {
    return res
      .status(409)
      .json({ error: "A user with that email aready exists" });
  }

  return res.status(201).json({
    id: business.id,
    business_name: business.businessUser.businessName,
    owner_name: business.businessUser.ownerName,
    email: business.email,
    activated: business.activated,
    verified: business.businessUser.verified,
    role: business.role,
    phone_number: business.businessUser.phoneNumber,
    postal_address: business.businessUser.postalAddress,
    location: business.businessUser.location,
    createdAt: business.createdAt,
    resetToken: business.resetToken,
    expiresAt: business.expiresAt,
  });
}

async function listBusinessesController(req, res) {
  // Check payload if it contains admin only allowed fields
  const adminOnlyFields = ["activated", "verified"];
  const needsAdmin =
    adminOnlyFields.some((field) => req.query[field] !== undefined) ||
    req.query.sort === "owner_name";

  if (needsAdmin && (!req.user || req.user.role !== "admin")) {
    return res
      .status(400)
      .json({ error: "Admin privileges required for this request" });
  }

  const { count, businesses } = await BusinessService.list(
    req.query,
    req.user && req.user.role === "admin",
  );

  if (req.user && req.user.role === "admin") {
    return res.json({
      count: count,
      results: businesses.map((business) => {
        return {
          id: business.id,
          business_name: business.businessUser.businessName,
          email: business.email,
          role: business.role,
          phone_number: business.businessUser.phoneNumber,
          postal_address: business.businessUser.postalAddress,

          owner_name: business.businessUser.ownerName,
          verified: business.businessUser.verified,
          activated: business.activated,
        };
      }),
    });
  } else {
    return res.json({
      count: count,
      results: businesses.map((business) => {
        return {
          id: business.id,
          business_name: business.businessUser.businessName,
          email: business.email,
          role: business.role,
          phone_number: business.businessUser.phoneNumber,
          postal_address: business.businessUser.postalAddress,
        };
      }),
    });
  }
}

async function retrieveBusinessController(req, res) {
  const businessId = Number(req.params.businessId);

  if (!Number.isInteger(businessId)) {
    return res
      .status(404)
      .json({ error: `Not found: /businesses/${req.params.businessId}` });
  }

  const business = await BusinessService.retrieve(businessId);

  // if business is null, could not find it
  if (!business) {
    return res
      .status(404)
      .json({ message: `Not found: /businesses/${req.params.businessId}` });
  }

  let returnObj = {
    id: business.id,
    business_name: business.businessUser.businessName,
    email: business.email,
    role: business.role,
    phone_number: business.businessUser.phoneNumber,
    postal_address: business.businessUser.postalAddress,
    location: business.businessUser.location,
    avatar: business.businessUser.avatar,
    biography: business.businessUser.biography,
  };

  if (req.user && req.user.role === "admin") {
    returnObj = {
      ...returnObj,
      owner_name: business.businessUser.ownerName,
      activated: business.activated,
      verified: business.businessUser.verified,
      createdAt: business.createdAt,
    };
  }

  return res.json(returnObj);
}

async function updateBusinessVerifiedController(req, res) {
  // Check if user is an admin
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  // Check the verified field is present
  if (req.body.verified === undefined) {
    return res
      .status(400)
      .json({ error: "Verified field is missing from request" });
  }

  // check verified field is boolean
  if (typeof req.body.verified !== "boolean") {
    return res.status(400).json({ error: "Verified field is not a boolean" });
  }

  // Check userId param
  const businessId = Number(req.params.businessId);

  if (!Number.isInteger(businessId)) {
    return res
      .status(404)
      .json({ error: `Not found: /businesses/${req.params.businessId}` });
  }

  const business = await BusinessService.updateVerified(
    businessId,
    req.body.verified,
  );

  if (business.error) {
    return res.status(business.status).json({ error: business.error });
  }

  return res.json({
    id: business.id,
    business_name: business.businessUser.businessName,
    owner_name: business.businessUser.ownerName,
    email: business.email,
    activated: business.activated,
    verified: business.businessUser.verified,
    role: business.role,
    phone_number: business.businessUser.phoneNumber,
    postal_address: business.businessUser.postalAddress,
  });
}

async function retrieveSelfController(req, res) {
  // Validate this is a business account
  if (req.user.role !== "business") {
    return res
      .status(403)
      .json({ error: "Must be a business user for this request" });
  }

  const business = await BusinessService.retrieve(req.user.id);

  return res.json({
    id: business.id,
    business_name: business.businessUser.businessName,
    owner_name: business.businessUser.ownerName,
    email: business.email,
    role: business.role,
    phone_number: business.businessUser.phoneNumber,
    postal_address: business.businessUser.postalAddress,
    location: business.businessUser.location,
    avatar: business.businessUser.avatar,
    biography: business.businessUser.biography,
    activated: business.activated,
    verified: business.businessUser.verified,
    createdAt: business.createdAt,
  });
}

async function updateSelfController(req, res) {
  // Validate this is a business account
  if (req.user.role !== "business") {
    return res
      .status(403)
      .json({ error: "Must be a business user for this request" });
  }

  // Check payload is not empty
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Payload is empty" });
  }

  // Check payload only contains the allowed fields
  const allowedFields = [
    "business_name",
    "owner_name",
    "phone_number",
    "postal_address",
    "location",
    "avatar",
    "biography",
  ];

  const payloadKeys = Object.keys(req.body);
  const invalidFields = payloadKeys.filter(
    (key) => !allowedFields.includes(key),
  );
  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: `Invalid fields in payload: ${invalidFields.join(", ")}`,
    });
  }

  // if location present, check lat and lon are numbers
  const location = req.body.location;

  if (location) {
    // check lon is good
    if (!location.lon || typeof location.lon !== "number")
      return res.status(400).json({ error: "Bad request: location.lon" });

    // check lat is good
    if (!location.lat || typeof location.lat !== "number")
      return res.status(400).json({ error: "Bad request: location.lat" });

    // check range of lat
    if (location.lat < -90 || location.lat > 90)
      return res
        .status(400)
        .json({ error: "Bad request: lat is out of range" });

    // check range of lon
    if (location.lon < -180 || location.lon > 180)
      return res
        .status(400)
        .json({ error: "Bad request: lon is out of range" });
  }

  await BusinessService.update(req.user.id, req.body);
  return res.json({
    id: req.user.id,
    ...req.body,
  });
}

async function uploadAvatarController(req, res) {
  // check role is business
  if (req.user.role !== "business") {
    return res
      .status(403)
      .json({ error: "Must be a business user for this request" });
  }

  // check the file exists
  if (!req.file) {
    return res.status(400).json({ error: "File is missing from this request" });
  }

  // check file type
  const allowedTypes = ["image/png", "image/jpeg"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    fs.unlinkSync(req.file.path); // delete the uploaded file
    return res.status(400).json({ error: "Invalid file type" });
  }

  // update avatar field for this user
  await BusinessService.updateFilepath(req.user.id, "avatar", req.file.path);

  return res.status(200).json({
    avatar: req.file.path,
  });
}

module.exports = {
  createBusinessController,
  listBusinessesController,
  retrieveBusinessController,
  updateBusinessVerifiedController,
  retrieveSelfController,
  updateSelfController,
  uploadAvatarController,
};
