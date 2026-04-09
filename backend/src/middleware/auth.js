const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const SECRET_KEY = "A2RyDMaJUiFVTi9PWwuIe8IpQbpjjeFTn9sgVO4cMzT";

const basicAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Invalid credentials (no auth header)" });
  }

  const [scheme, credentials] = authHeader.split(" ");

  // basic authentication
  if (scheme === "Basic") {
    const decoded = Buffer.from(credentials, "base64").toString("utf8");
    const [username, password] = decoded.split(":");

    // check database for user with matching user and password
    const user = await prisma.user.findFirst({
      where: {
        email: username,
        password: password,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (basic auth)" });
    }

    req.user = user;
  }

  // token authentication
  else if (scheme === "Bearer") {
    try {
      const decoded = jwt.verify(credentials, SECRET_KEY);

      // check database for user with matching user and password
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      req.user = user;
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Unsupported authorization scheme" });
  }

  return next();
};

const optionalAuth = async (req, res, next) => {
  /** Only authenticates IF the authorization header is present */

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return next();
  }

  const [scheme, credentials] = authHeader.split(" ");

  // basic authentication
  if (scheme === "Basic") {
    const decoded = Buffer.from(credentials, "base64").toString("utf8");
    const [username, password] = decoded.split(":");

    // check database for user with matching user and password
    const user = await prisma.user.findFirst({
      where: {
        email: username,
        password: password,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials (basic auth)" });
    }

    req.user = user;
  }

  // token authentication
  else if (scheme === "Bearer") {
    try {
      const decoded = jwt.verify(credentials, SECRET_KEY);

      // check database for user with matching user and password
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      req.user = user;
    } catch (e) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "Unsupported authorization scheme" });
  }

  return next();

  // // 1. Parse authHeader to extract the username and password.
  // const base64Credentials = authHeader.split(" ")[1];
  // const credentials = Buffer.from(base64Credentials, "base64").toString("utf8");
  // const [username, password] = credentials.split(":");

  // // 2. Check the database for the user with matching username and password.
  // const user = await prisma.user.findFirst({
  //   where: {
  //     email: username,
  //     password: password,
  //   },
  // });

  // // 3. If found, set req.user to it and allow the next middleware to run.
  // // 4. If not, immediate respond with status code 401 and this JSON data: { message: "Invalid credentials" }
  // if (!user) {
  //   return res.status(401).json({ message: "Invalid credentials" });
  // }

  // req.user = user;
  // return next();
};

module.exports = { basicAuth, optionalAuth };
