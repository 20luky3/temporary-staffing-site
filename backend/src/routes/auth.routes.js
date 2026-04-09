const express = require("express");

// import controllers
const {
  requestResetTokenController,
  resetController,
  generateJwtTokenController,
} = require("../controllers/auth.controller");

const router = express.Router();

// define routes
router
  .route("/auth/resets")
  .post(requestResetTokenController)
  .all((req, res) => {
    res.status(405).json({ error: "Method not allowed" });
  });
router
  .route("/auth/resets/:resetToken")
  .post(resetController)
  .all((req, res) => {
    res.status(405).json({ error: "Method not allowed" });
  });
router
  .route("/auth/tokens")
  .post(generateJwtTokenController)
  .all((req, res) => {
    res.status(405).json({ error: "Method not allowed" });
  });
module.exports = router;
