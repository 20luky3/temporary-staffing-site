const { SystemService } = require("../services/system.services");

function getSystemSettingsController(req, res) {
  // Check if user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  const settings = SystemService.getSystemSettings();

  return res.json({...settings});
}

function resetCooldownController(req, res) {
  // Check if user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  // Check the reset cooldown field is present
  if (req.body.reset_cooldown === undefined) {
    return res
      .status(400)
      .json({ error: "reset_cooldown field is missing from request" });
  }

  // Check validity of cooldown integer
  const resetCooldown = Number(req.body.reset_cooldown);

  if (!Number.isInteger(resetCooldown) || resetCooldown < 0) {
    return res
      .status(400)
      .json({ error: "Value of reset_cooldown is invalid" });
  }

  const updatedValue = SystemService.resetCooldown(resetCooldown);

  return res.json({ reset_cooldown: updatedValue });
}

function negotiationWindowController(req, res) {
  // Check if user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  // Check the negotiation window field is present
  if (req.body.negotiation_window === undefined) {
    return res
      .status(400)
      .json({ error: "negotiation_window field is missing from request" });
  }

  // Check validity of window integer
  const negotiationWindow = Number(req.body.negotiation_window);

  if (!Number.isInteger(negotiationWindow) || negotiationWindow <= 0) {
    return res
      .status(400)
      .json({ error: "Value of negotiation_window is invalid" });
  }

  const updatedValue = SystemService.negotiationWindow(negotiationWindow);

  return res.json({ negotiation_window: updatedValue });
}

function jobStartWindowController(req, res) {
  // Check if user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  // Check the job start window field is present
  if (req.body.job_start_window === undefined) {
    return res
      .status(400)
      .json({ error: "job_start_window field is missing from request" });
  }

  // Check validity of window integer
  const jobStartWindow = Number(req.body.job_start_window);

  if (!Number.isInteger(jobStartWindow) || jobStartWindow <= 0) {
    return res
      .status(400)
      .json({ error: "Value of job_start_window is invalid" });
  }

  const updatedValue = SystemService.jobStartWindow(jobStartWindow);

  return res.json({ job_start_window: updatedValue });
}

function availabilityTimeoutController(req, res) {
  // Check if user is an admin
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Admin privileges required for this request" });
  }

  // Check the availability timeout field is present
  if (req.body.availability_timeout === undefined) {
    return res
      .status(400)
      .json({ error: "availability_timeout field is missing from request" });
  }

  // Check validity of timeout integer
  const availabilityTimeout = Number(req.body.availability_timeout);

  if (!Number.isInteger(availabilityTimeout) || availabilityTimeout <= 0) {
    return res
      .status(400)
      .json({ error: "Value of availability_window is invalid" });
  }

  const updatedValue = SystemService.availabilityTimeout(availabilityTimeout);

  return res.json({ availability_timeout: updatedValue });
}

module.exports = {
  resetCooldownController,
  negotiationWindowController,
  jobStartWindowController,
  availabilityTimeoutController,
  getSystemSettingsController,
};
