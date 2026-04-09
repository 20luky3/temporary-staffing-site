/*
 * If you need to initialize your database with some data, you may write a script
 * to do so here.
 */
"use strict";

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const regularUsers = [
  { first_name: "Andy", last_name: "Andyson" },
  { first_name: "Bella", last_name: "Bellamy" },
  { first_name: "Charlie", last_name: "Charlton", suspended: true },
  { first_name: "Diana", last_name: "Dianez" },
  { first_name: "Ethan", last_name: "Ethell" },
  { first_name: "Franklin", last_name: "Fletcher" },
  { first_name: "George", last_name: "Geary" },
  { first_name: "Hannah", last_name: "Harrison" },
  { first_name: "Ian", last_name: "Irving" },
  { first_name: "Julia", last_name: "Julian", availability: true },
  { first_name: "Kevin", last_name: "Kendrick", availability: true },
  { first_name: "Laura", last_name: "Laurent", availability: true },
  { first_name: "Michael", last_name: "Michaels", availability: true },
  { first_name: "Nina", last_name: "Nielsen", availability: true },
  { first_name: "Oscar", last_name: "Osborne", availability: true },
  { first_name: "Paula", last_name: "Paulson", availability: true },
  { first_name: "Quentin", last_name: "Quincy", availability: true },
  { first_name: "Rachel", last_name: "Richards", availability: true },
  { first_name: "Sam", last_name: "Sampson", availability: true },
  { first_name: "Tina", last_name: "Tinsley", availability: true },
];

const extraUsers = [
  { first_name: "Jeremy", last_name: "Dooley", suspended: true, activated: false, },
  { first_name: "Elaina", last_name: "Anderson", suspended: true, activated: true, },
  { first_name: "Anthony", last_name: "Hudgens", suspended: true, activated: false, },
  { first_name: "Courtney", last_name: "Miller", suspended: true, activated: false, }
]

const businessUsers = [
  {
    business_name: "Aachen Dentists",
    owner_name: "Addison Abbott",
    location: { lat: 30.6532, lon: -79.3832 },
    biography:
      "A modern clinic focused on preventive care and patient comfort, serving downtown professionals and families.",
  },
  {
    business_name: "Brighton Association of Dentists",
    owner_name: "Becca Benson",
    location: { lat: -44.0421, lon: 77.7369 },
    biography:
      "A community-oriented practice offering friendly, reliable dental services in a welcoming small-town setting.",
  },
  {
    business_name: "Cedar Grove Dental Care",
    owner_name: "Caleb Carter",
    location: { lat: 0.589, lon: -3.6441 },
    biography:
      "Dedicated to family dentistry with a focus on long-term oral health and personalized treatment plans.",
  },
  {
    business_name: "Dover Family Dentistry",
    owner_name: "Darrow Dixon",
    location: { lat: 31.7837, lon: 10.204 },
    biography:
      "Providing comprehensive dental care for all ages, with an emphasis on trust and patient education.",
  },
  {
    business_name: "Everest Dental Group",
    owner_name: "Edward Edwards",
    location: { lat: 12.8561, lon: -55.337 },
    biography:
      "A growing practice offering advanced dental procedures using the latest technology in a modern setting.",
  },
  {
    business_name: "Fable Oral Health Associates",
    owner_name: "Frank Franklin",
    location: { lat: 53.2557, lon: -17.8711 },
    biography:
      "Blending experience with innovation to deliver high-quality care tailored to each patient’s needs.",
  },
  {
    business_name: "Greenwood Dental Specialists",
    owner_name: "Geoff Griffin",
    location: { lat: -80.7731, lon: 123.2578 },
    biography:
      "Specializing in restorative and cosmetic dentistry with a strong focus on patient satisfaction.",
  },
  {
    business_name: "Harborview Dental Centre",
    owner_name: "Harry Hughes",
    location: { lat: 44.2312, lon: -88.486 },
    biography:
      "A trusted clinic serving the lakeside community with comprehensive and compassionate dental care.",
  },
  {
    business_name: "Ironwood Family Dental",
    owner_name: "Isaac Ibsen",
    location: { lat: 53.8971, lon: 92.8658 },
    biography:
      "Focused on creating a comfortable experience for families while delivering consistent, high-quality care.",
  },
  {
    business_name: "Jubilee Smile Clinic",
    owner_name: "Jason Johnson",
    location: { lat: -8.4215, lon: -53.6972 },
    biography:
      "A vibrant clinic committed to improving smiles through modern techniques and patient-centered service.",
  },
];

const positionTypes = [
  {
    name: "Dentist",
    description: "Performs dental procedures",
    hidden: false,
    numQualified: 2,
  },
  {
    name: "Dental Hygienist",
    description: "Cleans teeth ",
    hidden: false,
    numQualified: 1,
  },
  {
    name: "Dental Assistant",
    description: "Supports dentists",
    hidden: false,
    numQualified: 0,
  },
  {
    name: "Receptionist",
    description: "Manages appointments",
    hidden: false,
    numQualified: 1,
  },
  {
    name: "Office Manager",
    description: "Oversees office",
    hidden: false,
    numQualified: 1,
  },

  {
    name: "Orthodontist",
    description: "Specialist for braces",
    hidden: true,
    numQualified: 2,
  },
  {
    name: "Periodontist",
    description: "Specialist for gums",
    hidden: true,
    numQualified: 0,
  },
  {
    name: "Endodontist",
    description: "Performs root canals",
    hidden: true,
    numQualified: 1,
  },
  {
    name: "Oral Surgeon",
    description: "Performs surgical procedures",
    hidden: true,
    numQualified: 1,
  },
  {
    name: "Lab Technician",
    description: "Works on dental prosthetics",
    hidden: true,
    numQualified: 0,
  },
];

const qualifications = [
  // qualifications for demo
  { status: "approved", userId: 2, positionTypeId: 1 },
  { status: "approved", userId: 2, positionTypeId: 6 },
  {
    status: "submitted",
    userId: 2,
    positionTypeId: 5,
    note: "I have 4 years of experience as an office manager.",
    document: "uploads/qualifications/3/document.pdf",
  },
  { status: "rejected", userId: 2, positionTypeId: 10 },

  { status: "approved", userId: 11, positionTypeId: 5 },
  { status: "approved", userId: 12, positionTypeId: 5 },
  { status: "approved", userId: 13, positionTypeId: 5 },
  { status: "approved", userId: 14, positionTypeId: 5 },
  { status: "approved", userId: 15, positionTypeId: 5 },
  { status: "approved", userId: 16, positionTypeId: 5 },
  { status: "approved", userId: 17, positionTypeId: 5 },
  { status: "approved", userId: 18, positionTypeId: 5 },
  { status: "approved", userId: 19, positionTypeId: 5 },

  { status: "approved", userId: 11, positionTypeId: 4 },

  // submitted qualifications
  { status: "submitted", userId: 21, positionTypeId: 1 },
  { status: "submitted", userId: 3, positionTypeId: 2 },
  { status: "submitted", userId: 7, positionTypeId: 5 },
  { status: "submitted", userId: 12, positionTypeId: 3 },
  { status: "submitted", userId: 18, positionTypeId: 9 },
  { status: "submitted", userId: 5, positionTypeId: 4 },

  // revised qualifications
  { status: "revised", userId: 9, positionTypeId: 1 },
  { status: "revised", userId: 14, positionTypeId: 8 },
  { status: "revised", userId: 20, positionTypeId: 7 },
  { status: "revised", userId: 11, positionTypeId: 10 },

  // approved qualifications
  { status: "approved", userId: 4, positionTypeId: 2 },
  { status: "approved", userId: 6, positionTypeId: 1 },
  { status: "approved", userId: 10, positionTypeId: 5 },
  { status: "approved", userId: 15, positionTypeId: 6 },
  { status: "approved", userId: 17, positionTypeId: 4 },
  { status: "approved", userId: 19, positionTypeId: 9 },
  { status: "approved", userId: 20, positionTypeId: 8 },

  // rejected qualifications
  { status: "rejected", userId: 8, positionTypeId: 3 },
  { status: "rejected", userId: 13, positionTypeId: 7 },
];

const jobs = [
  // job for demo
  {
    status: "open",
    salaryMin: 30,
    salaryMax: 53,
    startTime: new Date("2026-04-15T09:00:00Z"),
    endTime: new Date("2026-04-18T17:00:00Z"),
    positionTypeId: 5,
    businessId: 22,
  },

  {
    status: "completed",
    salaryMin: 27,
    salaryMax: 50,
    startTime: new Date("2026-03-03T09:00:00Z"),
    endTime: new Date("2026-03-05T17:00:00Z"),
    positionTypeId: 7,
    businessId: 28,
    workerId: 2,
  },

  {
    status: "filled",
    salaryMin: 27,
    salaryMax: 50,
    startTime: new Date("2026-04-06T09:00:00Z"),
    endTime: new Date("2026-04-10T17:00:00Z"),
    positionTypeId: 3,
    businessId: 26,
    workerId: 2,
  },

  {
    status: "filled",
    salaryMin: 27,
    salaryMax: 50,
    startTime: new Date("2026-06-06T09:00:00Z"),
    endTime: new Date("2026-06-20T17:00:00Z"),
    positionTypeId: 7,
    businessId: 28,
    workerId: 2,
  },

  // jobs for paginating
  {
    status: "expired",
    salaryMin: 25,
    salaryMax: 30,
    startTime: new Date("2026-03-15T09:00:00Z"),
    endTime: new Date("2026-03-20T17:00:00Z"),
    positionTypeId: 3,
    businessId: 22,
  },
  {
    status: "completed",
    salaryMin: 21,
    salaryMax: 35,
    startTime: new Date("2026-01-15T09:00:00Z"),
    endTime: new Date("2026-03-18T17:00:00Z"),
    positionTypeId: 1,
    businessId: 22,
    workerId: 9,
  },
  {
    status: "completed",
    salaryMin: 30,
    salaryMax: 53,
    startTime: new Date("2026-05-15T09:00:00Z"),
    endTime: new Date("2026-05-18T17:00:00Z"),
    positionTypeId: 5,
    businessId: 22,
    workerId: 16,
  },
  {
    status: "open",
    salaryMin: 18,
    salaryMax: 24,
    startTime: new Date("2026-06-01T08:00:00Z"),
    endTime: new Date("2026-06-05T16:00:00Z"),
    positionTypeId: 2,
    businessId: 22,
  },
  {
    status: "filled",
    salaryMin: 22,
    salaryMax: 28,
    startTime: new Date("2026-04-07T10:00:00Z"),
    endTime: new Date("2026-04-13T18:00:00Z"),
    positionTypeId: 4,
    businessId: 22,
    workerId: 11,
  },
  {
    status: "cancelled",
    salaryMin: 26,
    salaryMax: 34,
    startTime: new Date("2026-07-01T09:30:00Z"),
    endTime: new Date("2026-07-03T17:30:00Z"),
    positionTypeId: 3,
    businessId: 22,
  },
  {
    status: "expired",
    salaryMin: 20,
    salaryMax: 27,
    startTime: new Date("2026-02-01T07:00:00Z"),
    endTime: new Date("2026-02-05T15:00:00Z"),
    positionTypeId: 6,
    businessId: 22,
  },
  {
    status: "completed",
    salaryMin: 35,
    salaryMax: 50,
    startTime: new Date("2026-03-25T11:00:00Z"),
    endTime: new Date("2026-03-30T19:00:00Z"),
    positionTypeId: 2,
    businessId: 22,
    workerId: 14,
  },
  {
    status: "open",
    salaryMin: 19,
    salaryMax: 26,
    startTime: new Date("2026-08-01T08:30:00Z"),
    endTime: new Date("2026-08-06T16:30:00Z"),
    positionTypeId: 1,
    businessId: 22,
  },
  {
    status: "filled",
    salaryMin: 28,
    salaryMax: 40,
    startTime: new Date("2026-03-10T09:00:00Z"),
    endTime: new Date("2026-03-15T17:00:00Z"),
    positionTypeId: 5,
    businessId: 22,
    workerId: 18,
  },

  // other jobs
  {
    status: "open",
    salaryMin: 20,
    salaryMax: 45,
    startTime: new Date("2026-04-13T09:00:00Z"),
    endTime: new Date("2026-04-20T17:00:00Z"),
    positionTypeId: 1,
    businessId: 23,
  },
  {
    status: "filled",
    salaryMin: 25,
    salaryMax: 50,
    startTime: new Date("2026-04-13T09:00:00Z"),
    endTime: new Date("2026-04-19T17:00:00Z"),
    positionTypeId: 2,
    businessId: 23,
    workerId: 5,
  },
  {
    status: "expired",
    salaryMin: 18,
    salaryMax: 40,
    startTime: new Date("2026-04-01T09:00:00Z"),
    endTime: new Date("2026-04-10T17:00:00Z"),
    positionTypeId: 3,
    businessId: 24,
  },
  {
    status: "cancelled",
    salaryMin: 22,
    salaryMax: 48,
    startTime: new Date("2026-03-04T09:00:00Z"),
    endTime: new Date("2026-03-09T17:00:00Z"),
    positionTypeId: 4,
    businessId: 25,
    workerId: 12,
  },
  {
    status: "completed",
    salaryMin: 30,
    salaryMax: 55,
    startTime: new Date("2026-04-03T09:00:00Z"),
    endTime: new Date("2026-04-09T17:00:00Z"),
    positionTypeId: 5,
    businessId: 26,
    workerId: 7,
  },
  {
    status: "open",
    salaryMin: 19,
    salaryMax: 38,
    startTime: new Date("2026-04-16T09:00:00Z"),
    endTime: new Date("2026-04-25T17:00:00Z"),
    positionTypeId: 6,
    businessId: 27,
  },
  {
    status: "filled",
    salaryMin: 24,
    salaryMax: 50,
    startTime: new Date("2026-04-12T09:00:00Z"),
    endTime: new Date("2026-04-29T17:00:00Z"),
    positionTypeId: 7,
    businessId: 28,
    workerId: 8,
  },
  {
    status: "expired",
    salaryMin: 20,
    salaryMax: 45,
    startTime: new Date("2026-04-05T09:00:00Z"),
    endTime: new Date("2026-04-10T17:00:00Z"),
    positionTypeId: 8,
    businessId: 29,
  },
  {
    status: "cancelled",
    salaryMin: 28,
    salaryMax: 52,
    startTime: new Date("2026-04-01T09:00:00Z"),
    endTime: new Date("2026-04-03T17:00:00Z"),
    positionTypeId: 9,
    businessId: 30,
    workerId: 16,
  },
  {
    status: "completed",
    salaryMin: 26,
    salaryMax: 50,
    startTime: new Date("2026-04-08T09:00:00Z"),
    endTime: new Date("2026-04-10T17:00:00Z"),
    positionTypeId: 10,
    businessId: 31,
    workerId: 9,
  },
  {
    status: "open",
    salaryMin: 21,
    salaryMax: 46,
    startTime: new Date("2026-04-17T09:00:00Z"),
    endTime: new Date("2026-04-25T17:00:00Z"),
    positionTypeId: 1,
    businessId: 27,
  },
  {
    status: "filled",
    salaryMin: 23,
    salaryMax: 48,
    startTime: new Date("2026-05-13T09:00:00Z"),
    endTime: new Date("2026-05-22T17:00:00Z"),
    positionTypeId: 2,
    businessId: 23,
    workerId: 11,
  },
  {
    status: "expired",
    salaryMin: 19,
    salaryMax: 42,
    startTime: new Date("2026-04-06T09:00:00Z"),
    endTime: new Date("2026-04-10T17:00:00Z"),
    positionTypeId: 3,
    businessId: 24,
  },
  {
    status: "cancelled",
    salaryMin: 25,
    salaryMax: 50,
    startTime: new Date("2026-04-11T09:00:00Z"),
    endTime: new Date("2026-04-19T17:00:00Z"),
    positionTypeId: 4,
    businessId: 25,
    workerId: 20,
  },
  {
    status: "completed",
    salaryMin: 30,
    salaryMax: 55,
    startTime: new Date("2026-02-21T09:00:00Z"),
    endTime: new Date("2026-03-02T17:00:00Z"),
    positionTypeId: 5,
    businessId: 26,
    workerId: 14,
  },
  {
    status: "open",
    salaryMin: 18,
    salaryMax: 40,
    startTime: new Date("2026-04-18T09:00:00Z"),
    endTime: new Date("2026-04-20T17:00:00Z"),
    positionTypeId: 6,
    businessId: 27,
  },
  {
    status: "filled",
    salaryMin: 27,
    salaryMax: 50,
    startTime: new Date("2026-04-15T09:00:00Z"),
    endTime: new Date("2026-04-26T17:00:00Z"),
    positionTypeId: 7,
    businessId: 28,
    workerId: 7,
  },
  {
    status: "expired",
    salaryMin: 22,
    salaryMax: 46,
    startTime: new Date("2026-04-06T09:00:00Z"),
    endTime: new Date("2026-04-12T17:00:00Z"),
    positionTypeId: 8,
    businessId: 29,
  },
  {
    status: "cancelled",
    salaryMin: 24,
    salaryMax: 48,
    startTime: new Date("2026-03-10T09:00:00Z"),
    endTime: new Date("2026-03-18T17:00:00Z"),
    positionTypeId: 9,
    businessId: 30,
    workerId: 18,
  },
  {
    status: "completed",
    salaryMin: 26,
    salaryMax: 52,
    startTime: new Date("2026-03-29T09:00:00Z"),
    endTime: new Date("2026-04-11T17:00:00Z"),
    positionTypeId: 10,
    businessId: 31,
    workerId: 15,
  },
  {
    status: "open",
    salaryMin: 20,
    salaryMax: 45,
    startTime: new Date("2026-04-16T09:00:00Z"),
    endTime: new Date("2026-04-28T17:00:00Z"),
    positionTypeId: 1,
    businessId: 22,
  },
  {
    status: "filled",
    salaryMin: 23,
    salaryMax: 48,
    startTime: new Date("2026-04-21T09:00:00Z"),
    endTime: new Date("2026-04-25T17:00:00Z"),
    positionTypeId: 2,
    businessId: 23,
    workerId: 14,
  },
  {
    status: "expired",
    salaryMin: 19,
    salaryMax: 40,
    startTime: new Date("2026-04-02T09:00:00Z"),
    endTime: new Date("2026-04-10T17:00:00Z"),
    positionTypeId: 3,
    businessId: 24,
  },
  {
    status: "cancelled",
    salaryMin: 25,
    salaryMax: 50,
    startTime: new Date("2026-04-09T09:00:00Z"),
    endTime: new Date("2026-04-13T17:00:00Z"),
    positionTypeId: 4,
    businessId: 25,
    workerId: 3,
  },
  {
    status: "completed",
    salaryMin: 28,
    salaryMax: 52,
    startTime: new Date("2026-04-01T09:00:00Z"),
    endTime: new Date("2026-04-09T17:00:00Z"),
    positionTypeId: 5,
    businessId: 26,
    workerId: 10,
  },
  {
    status: "open",
    salaryMin: 21,
    salaryMax: 46,
    startTime: new Date("2026-04-15T09:00:00Z"),
    endTime: new Date("2026-04-26T17:00:00Z"),
    positionTypeId: 6,
    businessId: 27,
  },

  {
    status: "expired",
    salaryMin: 22,
    salaryMax: 45,
    startTime: new Date("2026-04-06T09:00:00Z"),
    endTime: new Date("2026-04-09T17:00:00Z"),
    positionTypeId: 8,
    businessId: 29,
  },
  {
    status: "completed",
    salaryMin: 24,
    salaryMax: 48,
    startTime: new Date("2026-04-01T09:00:00Z"),
    endTime: new Date("2026-04-08T17:00:00Z"),
    positionTypeId: 9,
    businessId: 30,
    workerId: 21,
  },
  {
    status: "completed",
    salaryMin: 26,
    salaryMax: 50,
    startTime: new Date("2026-04-04T09:00:00Z"),
    endTime: new Date("2026-04-10T17:00:00Z"),
    positionTypeId: 10,
    businessId: 31,
    workerId: 12,
  },
];

const interests = [
  {
    jobId: 1,
    candidateId: 13,
    businessId: 22,
    candidateInterest: true,
  },
  {
    jobId: 1,
    candidateId: 15,
    businessId: 22,
    candidateInterest: true,
  },
  {
    jobId: 1,
    candidateId: 17,
    businessId: 22,
    candidateInterest: true,
  },
  {
    jobId: 1,
    candidateId: 19,
    businessId: 22,
    candidateInterest: true,
  },
  {
    jobId: 1,
    candidateId: 21,
    businessId: 22,
    candidateInterest: true,
  },

  // businesses interested in candidate 2
  {
    jobId: 8,
    candidateId: 2,
    businessId: 22,
    businessInterest: true
  },
  {
    jobId: 13,
    candidateId: 2,
    businessId: 22,
    businessInterest: true
  },
  {
    jobId: 15,
    candidateId: 2,
    businessId: 23,
    businessInterest: true
  },
  {
    jobId: 20,
    candidateId: 2,
    businessId: 27,
    businessInterest: true
  },
  {
    jobId: 25,
    candidateId: 2,
    businessId: 27,
    businessInterest: true
  },

  {
    jobId: 30,
    candidateId: 2,
    businessId: 27,
    businessInterest: true
  },
  {
    jobId: 35,
    candidateId: 2,
    businessId: 22,
    businessInterest: true
  },
  {
    jobId: 40,
    candidateId: 2,
    businessId: 27,
    businessInterest: true
  },
];

async function main() {
  const now = new Date();

  // Create admin user
  await prisma.user.create({
    data: {
      role: "admin",
      email: "admin1@csc309.utoronto.ca",
      password: "123123",
      activated: true,
      createdAt: now,
    },
  });

  // Create regular users
  for (const [idx, user] of regularUsers.entries()) {
    await prisma.user.create({
      data: {
        role: "regular",
        email: `regular${idx + 1}@csc309.utoronto.ca`,
        password: "123123",
        activated: true,
        createdAt: now,
        regularUser: {
          create: {
            firstName: user.first_name,
            lastName: user.last_name,
            phoneNumber: "123456789",
            postalAddress: "321 Bloor St W, Toronto",
            birthday: "2000-01-01",
            lastActive: now,
            availability: user.availability,
          },
        },
      },
    });
  }

  // Create businesses
  for (const [idx, business] of businessUsers.entries()) {
    await prisma.user.create({
      data: {
        role: "business",
        email: `business${idx + 1}@csc309.utoronto.ca`,
        password: "123123",
        activated: true,
        createdAt: now,
        businessUser: {
          create: {
            businessName: business.business_name,
            ownerName: business.owner_name,
            phoneNumber: "123456789",
            postalAddress: "1 King's College Circle",
            location: business.location, // make sure this exists
            verified: true,
          },
        },
      },
    });
  }

  // Create the extra users
  for (const [idx, user] of extraUsers.entries()) {
    await prisma.user.create({
      data: {
        role: "regular",
        email: `regular${idx + 21}@csc309.utoronto.ca`,
        password: "123123",
        activated: user.activated,
        createdAt: now,
        regularUser: {
          create: {
            firstName: user.first_name,
            lastName: user.last_name,
            phoneNumber: "123456789",
            postalAddress: "321 Bloor St W, Toronto",
            birthday: "2000-01-01",
            lastActive: now,
            availability: false,
            suspended: user.suspended
          },
        },
      },
    });
  }

  // Create position types
  await prisma.positionType.createMany({
    data: positionTypes,
  });

  // Create job postings
  for (const job of jobs) {
    await prisma.job.create({
      data: {
        status: job.status,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        updatedAt: now,
        startTime: job.startTime,
        endTime: job.endTime,
        positionTypeId: job.positionTypeId,
        businessId: job.businessId,
        ...(job.workerId && { workerId: job.workerId }),
      },
    });
  }

  // Create qualification requests
  await prisma.qualification.createMany({
    data: qualifications.map((q) => {
      return {
        ...q,
        updatedAt: now,
      };
    }),
  });

  // Create interests
  await prisma.interest.createMany({
    data: interests,
  });
}

main().finally(() => prisma.$disconnect());
