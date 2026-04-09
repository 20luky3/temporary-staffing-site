const express = require("express");
const { basicAuth } = require("../middleware/auth");

// import controllers
const {
  createNegotiationController,
  retrieveCurrentNegotiationController,
  updateNegotiationDecisionController,
} = require("../controllers/negotiation.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/negotiations")
  .post(basicAuth, createNegotiationController)
  .all(methodNotAllowed);

router
  .route("/negotiations/me")
  .get(basicAuth, retrieveCurrentNegotiationController)
  .all(methodNotAllowed);

router
  .route("/negotiations/me/decision")
  .patch(basicAuth, updateNegotiationDecisionController)
  .all(methodNotAllowed);

module.exports = router;
