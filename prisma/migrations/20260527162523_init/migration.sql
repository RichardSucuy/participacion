-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "HandRaiseStatus" AS ENUM ('WAITING', 'REVIEWING', 'LOWERED', 'CORRECT', 'INCORRECT');

-- CreateTable
CREATE TABLE "Parallel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parallel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "parallelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'ACTIVE',
    "parallelId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandRaise" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "HandRaiseStatus" NOT NULL DEFAULT 'WAITING',
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HandRaise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "handRaiseId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parallel_name_key" ON "Parallel"("name");

-- CreateIndex
CREATE INDEX "Student_parallelId_idx" ON "Student"("parallelId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_parallelId_firstName_lastName_key" ON "Student"("parallelId", "firstName", "lastName");

-- CreateIndex
CREATE INDEX "Round_parallelId_status_idx" ON "Round"("parallelId", "status");

-- CreateIndex
CREATE INDEX "Round_openedAt_idx" ON "Round"("openedAt");

-- CreateIndex
CREATE INDEX "HandRaise_roundId_status_raisedAt_idx" ON "HandRaise"("roundId", "status", "raisedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HandRaise_roundId_studentId_key" ON "HandRaise"("roundId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_handRaiseId_key" ON "Participation"("handRaiseId");

-- CreateIndex
CREATE INDEX "Participation_roundId_idx" ON "Participation"("roundId");

-- CreateIndex
CREATE INDEX "Participation_studentId_idx" ON "Participation"("studentId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_parallelId_fkey" FOREIGN KEY ("parallelId") REFERENCES "Parallel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round" ADD CONSTRAINT "Round_parallelId_fkey" FOREIGN KEY ("parallelId") REFERENCES "Parallel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandRaise" ADD CONSTRAINT "HandRaise_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandRaise" ADD CONSTRAINT "HandRaise_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_handRaiseId_fkey" FOREIGN KEY ("handRaiseId") REFERENCES "HandRaise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
