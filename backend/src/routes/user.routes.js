const express = require("express");
const { basicAuth } = require("../middleware/auth");
const { validateCreateUser } = require("../middleware/validate_payload");

const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `uploads/users/${req.user.id}`;

    // create folder if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// import controllers
const {
  createUserController,
  listUsersController,
  updateUserSuspendedController,
  retrieveSelfController,
  updateSelfController,
  updateSelfAvailabilityController,
  uploadAvatarController,
  uploadResumeController,
} = require("../controllers/user.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/users")
  .post(validateCreateUser, createUserController)
  .get(basicAuth, listUsersController)
  .all(methodNotAllowed);

router
  .route("/users/me")
  .get(basicAuth, retrieveSelfController)
  .patch(basicAuth, updateSelfController)
  .all(methodNotAllowed);

router
  .route("/users/me/available")
  .patch(basicAuth, updateSelfAvailabilityController)
  .all(methodNotAllowed);

router
  .route("/users/me/avatar")
  .put(basicAuth, upload.single("file"), uploadAvatarController)
  .all(methodNotAllowed);

router
  .route("/users/me/resume")
  .put(basicAuth, upload.single("file"), uploadResumeController)
  .all(methodNotAllowed);

router
  .route("/users/:userId/suspended")
  .patch(basicAuth, updateUserSuspendedController)
  .all(methodNotAllowed);

module.exports = router;
