const express = require("express");
const { basicAuth, optionalAuth } = require("../middleware/auth");
const { validateCreateBusiness } = require("../middleware/validate_payload");

const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `uploads/businesses/${req.user.id}`;

    // create folder if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // const ext = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// import controllers
const {
  createBusinessController,
  listBusinessesController,
  retrieveBusinessController,
  updateBusinessVerifiedController,
  retrieveSelfController,
  updateSelfController,
  uploadAvatarController,
} = require("../controllers/business.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/businesses")
  .post(validateCreateBusiness, createBusinessController)
  .get(optionalAuth, listBusinessesController)
  .all(methodNotAllowed);

router
  .route("/businesses/me")
  .get(basicAuth, retrieveSelfController)
  .patch(basicAuth, updateSelfController)
  .all(methodNotAllowed);

router
  .route("/businesses/me/avatar")
  .put(basicAuth, upload.single("file"), uploadAvatarController)
  .all(methodNotAllowed);

router
  .route("/businesses/:businessId")
  .get(optionalAuth, retrieveBusinessController)
  .all(methodNotAllowed);

router
  .route("/businesses/:businessId/verified")
  .patch(basicAuth, updateBusinessVerifiedController)
  .all(methodNotAllowed);

module.exports = router;
