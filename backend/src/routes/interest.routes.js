const express = require("express");
const { basicAuth } = require("../middleware/auth");

// import controllers
const {
  updateUserInterestController,
  listUserInterestsController,
  updateBusinessInterestController,
  listUserInvitationsController,
  listCandidatesController,
  retrieveCandidateController,
  listInterestedCandidatesController,
} = require("../controllers/interest.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/jobs/:jobId/interested")
  .patch(basicAuth, updateUserInterestController)
  .all(methodNotAllowed);

router
  .route("/jobs/:jobId/interests")
  .get(basicAuth, listInterestedCandidatesController)
  .all(methodNotAllowed);

router
  .route("/jobs/:jobId/candidates/:userId/interested")
  .patch(basicAuth, updateBusinessInterestController)
  .all(methodNotAllowed);

router
  .route("/jobs/:jobId/candidates")
  .get(basicAuth, listCandidatesController)
  .all(methodNotAllowed);

router
  .route("/jobs/:jobId/candidates/:userId")
  .get(basicAuth, retrieveCandidateController)
  .all(methodNotAllowed);

router
  .route("/users/me/interests")
  .get(basicAuth, listUserInterestsController)
  .all(methodNotAllowed);

router
  .route("/users/me/invitations")
  .get(basicAuth, listUserInvitationsController)
  .all(methodNotAllowed);

module.exports = router;
