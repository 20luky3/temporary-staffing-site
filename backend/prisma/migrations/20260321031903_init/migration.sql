-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activated" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetToken" TEXT,
    "expiresAt" DATETIME
);

-- CreateTable
CREATE TABLE "RegularUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL DEFAULT '',
    "postalAddress" TEXT NOT NULL DEFAULT '',
    "birthday" TEXT NOT NULL DEFAULT '1970-01-01',
    "avatar" TEXT,
    "resume" TEXT,
    "biography" TEXT,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "availability" BOOLEAN NOT NULL DEFAULT false,
    "lastActive" DATETIME NOT NULL,
    CONSTRAINT "RegularUser_id_fkey" FOREIGN KEY ("id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BusinessUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "postalAddress" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "avatar" TEXT,
    "biography" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BusinessUser_id_fkey" FOREIGN KEY ("id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PositionType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT true,
    "numQualified" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Qualification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'created',
    "note" TEXT NOT NULL DEFAULT '',
    "document" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "positionTypeId" INTEGER NOT NULL,
    CONSTRAINT "Qualification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "RegularUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Qualification_positionTypeId_fkey" FOREIGN KEY ("positionTypeId") REFERENCES "PositionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "note" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "salaryMin" INTEGER NOT NULL,
    "salaryMax" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "positionTypeId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "workerId" INTEGER,
    CONSTRAINT "Job_positionTypeId_fkey" FOREIGN KEY ("positionTypeId") REFERENCES "PositionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Job_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "RegularUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "businessId" INTEGER NOT NULL,
    "candidateInterest" BOOLEAN,
    "businessInterest" BOOLEAN,
    CONSTRAINT "Interest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Interest_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "RegularUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Interest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "BusinessUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Negotiation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "interestId" INTEGER NOT NULL,
    "candidateDecision" TEXT,
    "businessDecision" TEXT,
    CONSTRAINT "Negotiation_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");
