/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example:
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
"use strict";

const { v4: uuidv4 } = require("uuid");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const args = process.argv;

async function main() {
  if (args.length !== 5) {
    console.error("usage: node createsu.js username email password");
    process.exit(1);
  }

  const email = args[3];
  const password = args[4];

  // Check formatting of email
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    console.error("invalid email format");
    process.exit(1);
  }

  const currentTime = new Date();
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // add one week to currentTime

  await prisma.user.create({
    data: {
      role: "admin",
      email: email,
      password: password,
      activated: true,
      createdAt: currentTime,
      resetToken: uuidv4(),
      expiresAt: expires
    },
  });

  console.log("Admin user created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
