const validateCreateUser = (req, res, next) => {
  const { first_name, last_name, email, password, birthday } = req.body;

  if (!first_name || typeof first_name !== "string")
    return res.status(400).json({ error: "Bad request: first_name" });

  if (!last_name || typeof last_name !== "string")
    return res.status(400).json({ error: "Bad request: last_name" });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email))
    return res.status(400).json({ error: "Bad request: email" });

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/;

  if (!passwordPattern.test(password))
    return res.status(400).json({ error: "Bad request: password" });

  if (birthday) {
    const birthdayPattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!birthdayPattern.test(birthday))
      return res.status(400).json({ error: "Bad request: birthday" });
  }

  next();
};

const validateCreateBusiness = (req, res, next) => {
  const {
    business_name,
    owner_name,
    email,
    password,
    phone_number,
    postal_address,
    location,
  } = req.body;

  if (!business_name || typeof business_name !== "string")
    return res.status(400).json({ error: "Bad request: business_name" });

  if (!owner_name || typeof owner_name !== "string")
    return res.status(400).json({ error: "Bad request: owner_name" });

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailPattern.test(email))
    return res.status(400).json({ error: "Bad request: email" });

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,20}$/;

  if (!passwordPattern.test(password))
    return res.status(400).json({ error: "Bad request: password" });

  if (!phone_number || typeof phone_number !== "string")
    return res.status(400).json({ error: "Bad request: phone_number" });

  if (!postal_address || typeof postal_address !== "string")
    return res.status(400).json({ error: "Bad request: postal_address" });

  if (!location || typeof location !== "object") {
    return res.status(400).json({ error: "Bad request: location" });
  } else {
    if (!location.lon || typeof location.lon !== "number")
      return res.status(400).json({ error: "Bad request: location.lon" });
    if (!location.lat || typeof location.lat !== "number")
      return res.status(400).json({ error: "Bad request: location.lat" });

    // check range of lat
    if (location.lat < -90 || location.lat > 90)
      return res
        .status(400)
        .json({ error: "Bad request: lat is out of range" });

    // check range of lon
    if (location.lon < -180 || location.lon > 180)
      return res
        .status(400)
        .json({ error: "Bad request: lon is out of range" });
  }

  next();
};

module.exports = { validateCreateUser, validateCreateBusiness };
