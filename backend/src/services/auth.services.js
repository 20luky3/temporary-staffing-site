const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

require("dotenv").config();
const SECRET_KEY = "A2RyDMaJUiFVTi9PWwuIe8IpQbpjjeFTn9sgVO4cMzT";

class AuthService {
  static async requestResetToken(email) {
    // find a matching user
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // if user is null, couldn't find a matching user
    if (!user) {
      return { error: `Couldn't find a user with email ${email}` };
    }

    const newResetToken = uuidv4();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // write the new reset token and exprie time to this user
    await prisma.user.update({
      where: { email: email },
      data: {
        resetToken: newResetToken,
        expiresAt: expires,
      },
    });

    return { expiresAt: expires, resetToken: newResetToken };
  }

  static async reset(email, resetToken, password) {
    // look for user with this resetToken
    const user = await prisma.user.findFirst({
      where: { resetToken: resetToken },
    });

    // if user is null, reset token doesn't exist/already was used
    if (!user) {
      return {
        status: 401,
        message: "Reset token does not exist or has already been used",
      };
    }

    // check if email matches
    if (user.email !== email) {
      return {
        status: 401,
        message: "Email does not match the reset token",
      };
    }

    // check if reset token expired
    const currentTime = new Date();
    if (user.expiresAt < currentTime) {
      return {
        status: 410,
        message: "Reset token has expired",
      };
    }

    // activate the account and change password
    const updatedUser = await prisma.user.update({
      where: { resetToken: resetToken },
      data: {
        password: password,
        activated: true,
        resetToken: null, // sets this resetToken as used
        expiresAt: null,
      },
    });

    return updatedUser;
  }

  static async generateJwtToken(email, password) {
    // check if email and password combo is valid by finding the user
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        password: password,
      },
    });

    if (!user) {
      return {
        status: 401,
        error: "Email and password combination is invalid",
      };
    }

    // check if account is activated
    if (!user.activated) {
      return {
        status: 403,
        error: "Cannot generate token, account is not activated",
      };
    }

    // generate a jwt token
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    return {
      token: token,
      expiresAt: expiresAt,
      role: user.role,
    };
  }
}

module.exports = { AuthService };
