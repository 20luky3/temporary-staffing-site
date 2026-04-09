const { PositionTypeService } = require("../services/position_types.service");

async function createPositionTypeController(req, res) {
  // Check user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "You must be an admin for this request" });
  }

  // Check required headers are present
  if (!req.body.name || !req.body.description) {
    return res
      .status(400)
      .json({ error: "Request is missing name or description fields" });
  }

  const positionType = await PositionTypeService.create(req.body);

  return res.status(201).json({
    id: positionType.id,
    name: positionType.name,
    description: positionType.description,
    hidden: positionType.hidden,
    num_qualified: positionType.numQualified,
  });
}

async function updatePositionTypeController(req, res) {
  // Check route param is valid
  const positionTypeId = Number(req.params.positionTypeId);

  if (!Number.isInteger(positionTypeId)) {
    return res.status(404).json({
      error: `Not found: /position-type/${req.params.positionTypeId}`,
    });
  }

  // Check user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "You must be an admin for this request" });
  }

  // Check payload is not empty
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: "Payload is empty" });
  }

  // check payload only includes the allowed fields
  const allowedFields = ["name", "description", "hidden"];
  const payloadKeys = Object.keys(req.body);
  const invalidFields = payloadKeys.filter(
    (key) => !allowedFields.includes(key),
  );
  if (invalidFields.length > 0) {
    return res.status(400).json({
      error: `Invalid fields in payload: ${invalidFields.join(", ")}`,
    });
  }

  const positionType = await PositionTypeService.update(
    positionTypeId,
    req.body,
  );

  if (positionType.error) {
    return res.status(positionType.status).json({
      error: positionType.error,
    });
  }

  return res.json({
    id: positionTypeId,
    ...req.body,
  });
}

async function deletePositionTypeController(req, res) {
  // Check route param is valid
  const positionTypeId = Number(req.params.positionTypeId);

  if (!Number.isInteger(positionTypeId)) {
    return res.status(404).json({
      error: `Not found: /position-type/${req.params.positionTypeId}`,
    });
  }

  // Check user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "You must be an admin for this request" });
  }

  // delete, then check if it was successful
  const success = await PositionTypeService.delete(positionTypeId);

  if (success.status !== 200) {
    return res.status(success.status).json({
      error: success.error,
    });
  }

  return res.status(204).end();
}

async function listPositionTypeController(req, res) {
  // check if the payload contains admin only fields
  const adminOnlyFields = ["hidden", "num_qualified"];
  const needsAdmin = adminOnlyFields.some(
    (field) => req.query[field] !== undefined,
  );

  if (needsAdmin && (!req.user || req.user.role !== "admin")) {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  const { count, positionTypes } = await PositionTypeService.list(
    req.query,
    req.user && req.user.role === "admin",
  );

  return res.json({
    count: count,
    results: positionTypes.map((positionType) => {
      return {
        id: positionType.id,
        name: positionType.name,
        description: positionType.description,
        hidden: positionType.hidden,
        num_qualified: positionType.numQualified,
      };
    }),
  });
}

module.exports = {
  createPositionTypeController,
  updatePositionTypeController,
  deletePositionTypeController,
  listPositionTypeController,
};
