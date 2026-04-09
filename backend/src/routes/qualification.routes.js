const express = require("express");
const { basicAuth } = require("../middleware/auth");

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `uploads/qualifications/${req.params.qualificationId}`;

    // create folder if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `document${ext}`);
  },
});

const upload = multer({ storage });

// import controllers
const {
  createQualificationController,
  listQualificationsController,
  updateQualificationController,
  retrieveQualificationController,
  uploadDocumentController,
  getMyQualificationsController
} = require("../controllers/qualification.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/qualifications")
  .post(basicAuth, createQualificationController)
  .get(basicAuth, listQualificationsController)
  .all(methodNotAllowed);

router.route("/users/me/qualifications") // payload: filter by status, page, limit
  .get(basicAuth, getMyQualificationsController)
  .all(methodNotAllowed);

router
  .route("/qualifications/:qualificationId")
  .get(basicAuth, retrieveQualificationController)
  .patch(basicAuth, updateQualificationController)
  .all(methodNotAllowed);

router
  .route("/qualifications/:qualificationId/document")
  .put(basicAuth, upload.single("file"), uploadDocumentController)
  .all(methodNotAllowed);

module.exports = router;
