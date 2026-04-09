const { AuthService } = require("../services/auth.services");
const { getResetCooldown } = require("../system_config");
const lastRequestByIp = new Map(); // tracks when the last resetToken request was

function resetCooldownRateLimiter(req) {
  const ip = req.ip;
  const now = Date.now();
  const cooldownMs = getResetCooldown() * 1000;

  if (!lastRequestByIp.has(ip)) {
    lastRequestByIp.set(ip, now);
  } else {
    const lastUserTime = lastRequestByIp.get(ip);

    if (now - lastUserTime > cooldownMs) {
      lastRequestByIp.delete(ip); // cleans up expired entry
      lastRequestByIp.set(ip, now);
    } else {
      // time is within the reset
      return false;
    }
  }

  return true;
}

async function requestResetTokenController(req, res) {
  // Validate the payload
  if (!req.body.email) {
    return res.status(400).json({ error: "No email in payload" });
  }

  // check rate limiter
  if (!resetCooldownRateLimiter(req)) {
    return res
      .status(429)
      .json({ error: "Too many reset token requests from this ip" });
  }

  const resetToken = await AuthService.requestResetToken(req.body.email);

  if (resetToken.error) {
    return res.status(404).json(resetToken);
  }

  return res.status(202).json(resetToken);
}

async function resetController(req, res) {
  // Validate email in payload
  if (!req.body.email) {
    return res.status(400).json({ error: "No email in payload" });
  }

  // If there's a password, check its format
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/;
  if (req.body.password && !passwordPattern.test(req.body.password)) {
    return res.status(400).json({ error: "Password is in wrong format" });
  }

  const user = await AuthService.reset(
    req.body.email,
    req.params.resetToken,
    req.body.password,
  );

  // success case
  if (!user.message) {
    return res.status(200).json({ activated: user.activated });
  } else {
    return res.status(user.status).json({ error: user.message });
  }
}

async function generateJwtTokenController(req, res) {
  // validate payload
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "Email or password is missing" });
  }

  const token = await AuthService.generateJwtToken(
    req.body.email,
    req.body.password,
  );

  if (token.error) {
    return res.status(token.status).json({ error: token.error });
  }

  return res.status(200).json(token);
}

module.exports = {
  requestResetTokenController,
  resetController,
  generateJwtTokenController,
};
