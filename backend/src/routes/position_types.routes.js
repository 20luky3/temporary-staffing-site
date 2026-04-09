const express = require("express");
const { basicAuth, optionalAuth } = require("../middleware/auth");

// import controllers
const {
  createPositionTypeController,
  updatePositionTypeController,
  deletePositionTypeController,
  listPositionTypeController,
} = require("../controllers/position_types.controller");

const methodNotAllowed = (req, res) => {
  res.status(405).json({ error: "Method not allowed" });
};

const router = express.Router();

// define routes
router
  .route("/position-types")
  .post(basicAuth, createPositionTypeController)
  .get(basicAuth, listPositionTypeController)
  .all(methodNotAllowed);

router
  .route("/position-types/:positionTypeId")
  .patch(basicAuth, updatePositionTypeController)
  .delete(basicAuth, deletePositionTypeController)
  .all(methodNotAllowed);

module.exports = router;
