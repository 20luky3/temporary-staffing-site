"use strict";

const cors = require("cors");
const express = require("express");

function create_app() {
  const app = express();
  app.use(express.json());
  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  const userRoutes = require("./routes/user.routes");
  const businessRoutes = require("./routes/business.routes");
  const authRoutes = require("./routes/auth.routes");
  const systemRoutes = require("./routes/system.routes");
  const positionTypeRoutes = require("./routes/position_types.routes");
  const qualificationRoutes = require("./routes/qualification.routes");
  const jobRoutes = require("./routes/job.routes");
  const interestRoutes = require("./routes/interest.routes");
  const negotiationRoutes = require("./routes/negotiation.routes");

  app.use("", userRoutes);
  app.use("", businessRoutes);
  app.use("", authRoutes);
  app.use("", systemRoutes);
  app.use("", positionTypeRoutes);
  app.use("", qualificationRoutes);
  app.use("", jobRoutes);
  app.use("", interestRoutes);
  app.use("", negotiationRoutes);

  // handle image requests
  const path = require("path");
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
  
  // handle no matched routes
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });

  return app;
}

module.exports = { create_app };
