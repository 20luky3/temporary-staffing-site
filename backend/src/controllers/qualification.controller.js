const { QualificationService } = require("../services/qualification.services");
const fs = require("fs");

async function createQualificationController(req, res) {
  // Check user is regular
  if (req.user.role !== "regular") {
    return res
      .status(403)
      .json({ error: "You must be a regular user for this request" });
  }

  // check position_type_id parameter is a number
  const positionTypeId = Number(req.body.position_type_id);
  if (!Number.isInteger(positionTypeId)) {
    return res.status(400).json({ error: "position_type_id is not a number" });
  }

  const qualification = await QualificationService.create(
    req.user.id,
    positionTypeId,
    req.body.note,
  );

  if (qualification.error) {
    return res.status(qualification.status).json({ error: qualification.error });
  }

  return res.status(201).json({
    id: qualification.id,
    status: qualification.status,
    note: qualification.note,
    document: qualification.document,
    user: {
      id: qualification.user.id,
      first_name: qualification.user.firstName,
      last_name: qualification.user.lastName,
    },
    position_type: {
      id: qualification.positionType.id,
      name: qualification.positionType.name,
    },
    updatedAt: qualification.updatedAt,
  });
}

async function listQualificationsController(req, res) {
  // check user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  const {count, qualifications} = await QualificationService.list(req.query);

  return res.json({
    count: count,
    results: qualifications.map((qual) => {
      return {
        id: qual.id,
        status: qual.status,
        user: {
          id: qual.user.id,
          first_name: qual.user.firstName,
          last_name: qual.user.lastName,
        },
        position_type: {
          id: qual.positionType.id,
          name: qual.positionType.name,
        },
        updatedAt: qual.updatedAt,
      };
    }),
  });
}

async function getMyQualificationsController(req, res) {
  if (req.user.role !== "regular") {
    return res.status(403).json({error: "Must be a regular user for this route"})
  }

  const {count, qualifications} = await QualificationService.listMine(req.user.id, req.query);

  return res.json({
    count: count,
    results: qualifications.map((qual) => {
      return {
        id: qual.id,
        status: qual.status,
        note: qual.note,
        document: qual.document,
        user: {
          id: qual.user.id,
          first_name: qual.user.firstName,
          last_name: qual.user.lastName,
        },
        position_type: {
          id: qual.positionType.id,
          name: qual.positionType.name,
        },
        updatedAt: qual.updatedAt,
      };
    }),
  });
}

async function updateQualificationController(req, res) {
  // check user's role is not business, which is the only one not allowed
  if (req.user.role === "business") {
    return res
      .status(403)
      .json({ error: "Must be an admin or regular user for this request" });
  }

  // process qualificationId param
  const qualificationId = Number(req.params.qualificationId);

  if (!Number.isInteger(qualificationId)) {
    return res.status(404).json({
      error: `Not found: /qualification/${req.params.qualificationId}`,
    });
  }

  let allowedCurrentStatus; // what the current status can be, depending on what the user is requesting to change it to

  // if admin, check it's one of ['approved', 'rejected']
  if (req.body.status && req.user.role === "admin") {
    if (["approved", "rejected"].includes(req.body.status)) {
      allowedCurrentStatus = ["submitted", "revised"];
    } else {
      return res.status(403).json({
        error:
          "Admins can only change qualification status to approved or rejected",
      });
    }
  }

  // if regular, check it's one of ['submitted', 'revised']
  if (req.body.status && req.user.role === "regular") {
    if (req.body.status === "submitted") {
      allowedCurrentStatus = ["created"];
    } else if (req.body.status === "revised") {
      allowedCurrentStatus = ["approved", "rejected"];
    } else {
      return res.status(403).json({
        error:
          "Regular users can only change qualification status to submitted or revised",
      });
    }
  }

  const qualificationRequest = {};

  if (req.body.status) {
    qualificationRequest.status = req.body.status;
    qualificationRequest.allowedCurrentStatus = allowedCurrentStatus;
  }

  if (req.body.note) {
    qualificationRequest.note = req.body.note;
  }

  const qualification = await QualificationService.update(
    req.user,
    qualificationId,
    qualificationRequest,
  );

  if (qualification.error) {
    return res
      .status(qualification.status)
      .json({ error: qualification.error });
  }

  return res.json({
    id: qualification.id,
    status: qualification.status,
    document: qualification.document,
    note: qualification.note,
    user: {
      id: qualification.user.id,
      first_name: qualification.user.firstName,
      last_name: qualification.user.lastName,
    },
    position_type: {
      id: qualification.positionType.id,
      name: qualification.positionType.name,
    },
    updatedAt: qualification.updatedAt
  });
}

async function retrieveQualificationController(req, res) {
  // validate qualificationId param
  const qualificationId = Number(req.params.qualificationId);

  if (!Number.isInteger(qualificationId)) {
    return res.status(404).json({
      error: `Not found: /qualification/${req.params.qualificationId}`,
    });
  }

  const qualification = await QualificationService.retrieve(
    qualificationId,
    req.user,
  );

  if (qualification.error) {
    return res
      .status(qualification.status)
      .json({ error: qualification.error });
  }

  // process object to return
  let result = {
    id: qualification.id,
    document: qualification.document,
    note: qualification.note,
    position_type: {
      id: qualification.positionType.id,
      name: qualification.positionType.name,
      description: qualification.positionType.description,
    },
    updatedAt: qualification.updatedAt,
    user: {
      id: qualification.user.id,
      first_name: qualification.user.firstName,
      last_name: qualification.user.lastName,
      role: qualification.user.user.role,
      avatar: qualification.user.avatar,
      resume: qualification.user.resume,
      biography: qualification.user.biography,
    },
  };

  if (req.user.role !== "business") {
    result = {
      ...result,
      user: {
        ...result.user,
        email: qualification.user.user.email,
        phone_number: qualification.user.phoneNumber,
        postal_address: qualification.user.postalAddress,
        birthday: qualification.user.birthday,
        activated: qualification.user.user.activated,
        suspended: qualification.user.suspended,
        createdAt: qualification.user.user.createdAt,
      },
      status: qualification.status,
    };
  }

  return res.json(result);
}

async function uploadDocumentController(req, res) {
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

  // validate qualificationId param
  const qualificationId = Number(req.params.qualificationId);

  if (!Number.isInteger(qualificationId)) {
    return res.status(404).json({
      error: `Not found: /qualification/${req.params.qualificationId}`,
    });
  }

  // update document field
  const result = await QualificationService.updateFilepath(
    qualificationId,
    req.user.id,
    "document",
    req.file.path,
  );

  if (result.error) {
    fs.unlinkSync(req.file.path); // delete the uploaded file
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(200).json({
    document: req.file.path,
  });
}

module.exports = {
  createQualificationController,
  listQualificationsController,
  updateQualificationController,
  retrieveQualificationController,
  uploadDocumentController,
  getMyQualificationsController
};
