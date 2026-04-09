const {
  getResetCooldown,
  setResetCooldown,
  getNegotiationWindow,
  setNegotiationWindow,
  getJobStartWindow,
  setJobStartWindow,
  getAvailabilityTimeout,
  setAvailabilityTimeout,
} = require("../system_config");

class SystemService {
  static getSystemSettings() {
    return {
      resetCooldown: getResetCooldown(),
      negotiationWindow: getNegotiationWindow(),
      jobStartWindow: getJobStartWindow(),
      availabilityTimeout: getAvailabilityTimeout(),
    };
  }

  static resetCooldown(newValue) {
    setResetCooldown(newValue);
    return getResetCooldown();
  }

  static negotiationWindow(newValue) {
    setNegotiationWindow(newValue);
    return getNegotiationWindow();
  }

  static jobStartWindow(newValue) {
    setJobStartWindow(newValue);
    return getJobStartWindow();
  }

  static availabilityTimeout(newValue) {
    setAvailabilityTimeout(newValue);
    return getAvailabilityTimeout();
  }
}

module.exports = { SystemService };
