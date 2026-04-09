const express = require("express");
const { basicAuth } = require("../middleware/auth");

// import controllers
const {
  createJobController,
  editJobController,
  retrieveJobController,
  listJobsController,
  listMyJobsController,
  deleteJobController,
  updateNoShowController,
  getUserJobsController,
} = require("../controllers/job.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/businesses/me/jobs")
  .post(basicAuth, createJobController)
  .get(basicAuth, listMyJobsController)
  .all(methodNotAllowed);

router
  .route("/businesses/me/jobs/:jobId")
  .patch(basicAuth, editJobController)
  .delete(basicAuth, deleteJobController)
  .all(methodNotAllowed);

router
  .route("/users/me/jobs")
  .get(basicAuth, getUserJobsController)
  .all(methodNotAllowed);

router
  .route("/jobs/:jobId(\\d+)")
  .get(basicAuth, retrieveJobController)
  .all(methodNotAllowed);

router
  .route("/jobs/:jobId/no-show")
  .patch(basicAuth, updateNoShowController)
  .all(methodNotAllowed);

router.route("/jobs").get(basicAuth, listJobsController).all(methodNotAllowed);

module.exports = router;
