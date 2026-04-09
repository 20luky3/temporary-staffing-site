let resetCooldown = 1; // in seconds
let negotiationWindow = 60 * 15; // in seconds
let jobStartWindow = 24 * 7; // in hours
let availabilityTimeout = 60 * 5; // in seconds

function getResetCooldown() {
  return resetCooldown;
}

function setResetCooldown(newValue) {
  resetCooldown = newValue;
}

function getNegotiationWindow() {
  return negotiationWindow;
}

function setNegotiationWindow(newValue) {
  negotiationWindow = newValue;
}

function getJobStartWindow() {
  return jobStartWindow;
}

function setJobStartWindow(newValue) {
  jobStartWindow = newValue;
}

function getAvailabilityTimeout() {
  return availabilityTimeout;
}

function setAvailabilityTimeout(newValue) {
  availabilityTimeout = newValue;
}

function getDistance(lat1, lon1, lat2, lon2) {
  var R = 6371.2;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function checkUserDiscoverable(user, job) {
  // account is not activated
  if (!user.user.activated) return false;

  // account is suspended
  if (user.suspended) return false;

  // user is not qualified for this job posting
  const positionTypeId = job.positionTypeId;
  const validQuals = user.qualifications.filter(
    (qual) =>
      qual.positionTypeId === positionTypeId && qual.status === "approved",
  );

  if (validQuals.length === 0) return false;

  // user is not available
  if (!user.availability) return false;

  // user has not been active within system defined inactivity window
  const currentTime = new Date();

  if (currentTime - user.lastActive > getAvailabilityTimeout() * 1000)
    return false;

  // user has not been committed to another job with conflicting working hours
  const jobStart = job.startTime;
  const jobEnd = job.endTime;

  const conflictingJobs = user.committedJobs.filter((job) => {
    let existingStart = job.startTime;
    let existingEnd = job.endTime;

    return existingStart < jobEnd && existingEnd > jobStart;
  });

  if (conflictingJobs.length > 0) return false;

  // all checks passed
  return true;
}

module.exports = {
  getResetCooldown,
  setResetCooldown,
  getNegotiationWindow,
  setNegotiationWindow,
  getJobStartWindow,
  setJobStartWindow,
  getAvailabilityTimeout,
  setAvailabilityTimeout,
  getDistance,
  checkUserDiscoverable,
};
