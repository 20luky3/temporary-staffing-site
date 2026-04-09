const express = require("express");
const { basicAuth, _ } = require("../middleware/auth");

// import controllers
const {
  getSystemSettingsController,
  resetCooldownController,
  negotiationWindowController,
  jobStartWindowController,
  availabilityTimeoutController,
} = require("../controllers/system.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/system/settings")
  .get(basicAuth, getSystemSettingsController)
  .all(methodNotAllowed);

router
  .route("/system/reset-cooldown")
  .patch(basicAuth, resetCooldownController)
  .all(methodNotAllowed);

router
  .route("/system/negotiation-window")
  .patch(basicAuth, negotiationWindowController)
  .all(methodNotAllowed);

router
  .route("/system/job-start-window")
  .patch(basicAuth, jobStartWindowController)
  .all(methodNotAllowed);
  
router
  .route("/system/availability-timeout")
  .patch(basicAuth, availabilityTimeoutController)
  .all(methodNotAllowed);

module.exports = router;
