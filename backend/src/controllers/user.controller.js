const { UserService } = require("../services/user.service");
const { getAvailabilityTimeout } = require("../system_config");
const fs = require("fs");

async function createUserController(req, res) {
  const user = await UserService.create(req.body);

  if (user.error) {
    return res
      .status(409)
      .json({ error: "A user with that email already exists" });
  }

  return res.status(201).json({
    id: user.id,
    first_name: user.regularUser.firstName,
    last_name: user.regularUser.lastName,
    email: user.email,
    activated: user.activated,
    role: user.role,
    phone_number: user.regularUser.phoneNumber,
    postal_address: user.regularUser.postalAddress,
    birthday: user.regularUser.birthday,
    createdAt: user.createdAt,
    resetToken: user.resetToken,
    expiresAt: user.expiresAt,
  });
}

async function listUsersController(req, res) {
  // Check if user is an admin
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  const { count, users } = await UserService.list(req.query);

  return res.json({
    count: count,
    results: users.map((user) => {
      return {
        id: user.id,
        first_name: user.regularUser.firstName,
        last_name: user.regularUser.lastName,
        email: user.email,
        activated: user.activated,
        suspended: user.regularUser.suspended,
        role: user.role,
        phone_number: user.regularUser.phoneNumber,
        postal_address: user.regularUser.postalAddress,
      };
    }),
  });
}

async function updateUserSuspendedController(req, res) {
  // Check if user is an admin
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  // Check the suspended field is present
  if (req.body.suspended === undefined) {
    return res
      .status(400)
      .json({ error: "Suspended field is missing from request" });
  }

  // check suspended field is a boolean
  if (typeof req.body.suspended !== "boolean") {
    return res.status(400).json({ error: "Suspended field is not a boolean" });
  }

  // Check userId param
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId)) {
    return res
      .status(404)
      .json({ error: `Not found: /users/${req.params.userId}` });
  }

  const user = await UserService.updateSuspended(userId, req.body.suspended);

  if (user.error) {
    return res.status(user.status).json({
      error: user.error,
    });
  }

  return res.json({
    id: user.id,
    first_name: user.regularUser.firstName,
    last_name: user.regularUser.lastName,
    email: user.email,
    activated: user.activated,
    suspended: user.regularUser.suspended,
    role: user.role,
    phone_number: user.regularUser.phoneNumber,
    postal_address: user.regularUser.postalAddress,
  });
}

async function retrieveSelfController(req, res) {
  // Validate this is a regular user
  if (req.user.role !== "regular") {
    return res
      .status(403)
      .json({ error: "Must be a regular user for this request" });
  }

  const user = await UserService.retrieve(req.user.id);

  const availabilityTimeout = getAvailabilityTimeout() * 1000; // convert to ms
  const lastActiveTime = new Date(user.regularUser.lastActive).getTime();
  const available = Date.now() - lastActiveTime < availabilityTimeout;

  return res.json({
    id: user.id,
    first_name: user.regularUser.firstName,
    last_name: user.regularUser.lastName,
    email: user.email,
    activated: user.activated,
    suspended: user.regularUser.suspended,
    available: available,
    role: user.role,
    phone_number: user.regularUser.phoneNumber,
    postal_address: user.regularUser.postalAddress,
    birthday: user.regularUser.birthday,
    createdAt: user.createdAt,
    avatar: user.regularUser.avatar,
    resume: user.regularUser.resume,
    biography: user.regularUser.biography,
  });
}

async function updateSelfController(req, res) {
  // Validate this is a regular user
  if (req.user.role !== "regular") {
    return res
      .status(403)
      .json({ error: "Must be a regular user for this request" });
  }

  // Check payload is not empty
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Payload is empty" });
  }

  // Check payload only contains the allowed fields
  const allowedFields = [
    "first_name",
    "last_name",
    "phone_number",
    "postal_address",
    "birthday",
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

  // if birthday is present, check its format
  if (req.body.birthday) {
    const birthdayPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdayPattern.test(req.body.birthday))
      return res
        .status(400)
        .json({ error: "Bad request: birthday has the wrong format" });
  }

  await UserService.update(req.user.id, req.body);

  return res.json({
    id: req.user.id,
    ...req.body,
  });
}

async function updateSelfAvailabilityController(req, res) {
  // check role is regular
  if (req.user.role !== "regular") {
    return res
      .status(403)
      .json({ error: "Must be a regular user for this request" });
  }

  // check payload contains the available field
  if (req.body.available === undefined) {
    return res
      .status(400)
      .json({ error: "Payload must contain the field available" });
  }

  // check available is a boolean
  if (typeof req.body.available !== "boolean") {
    return res.status(400).json({ error: "Available field is not a boolean" });
  }

  const user = await UserService.updateAvailability(
    req.user.id,
    req.body.available,
  );

  if (user.error) {
    return res.status(user.status).json({ error: user.error });
  }

  return res.status(200).json({ available: user.availability });
}

async function uploadAvatarController(req, res) {
  // check role is regular
  if (req.user.role !== "regular") {
    return res
      .status(403)
      .json({ error: "Must be a regular user for this request" });
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
  await UserService.updateFilepath(req.user.id, "avatar", req.file.path);

  return res.status(200).json({
    avatar: req.file.path,
  });
}

async function uploadResumeController(req, res) {
  // check role is regular
  if (req.user.role !== "regular") {
    return res
      .status(403)
      .json({ error: "Must be a regular user for this request" });
  }

  // check the file exists
  if (!req.file) {
    return res.status(400).json({ error: "File is missing from this request" });
  }

  // check file type
  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    fs.unlinkSync(req.file.path); // delete the uploaded file
    return res.status(400).json({ error: "Invalid file type" });
  }

  // update resume field for this user
  await UserService.updateFilepath(req.user.id, "resume", req.file.path);

  return res.status(200).json({
    resume: req.file.path,
  });
}

module.exports = {
  createUserController,
  listUsersController,
  updateUserSuspendedController,
  retrieveSelfController,
  updateSelfController,
  updateSelfAvailabilityController,
  uploadAvatarController,
  uploadResumeController,
};
