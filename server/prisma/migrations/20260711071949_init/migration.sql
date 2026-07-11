-- CreateTable
CREATE TABLE "Cycle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "applicationDeadline" TIMESTAMP(3),
    "taskDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "regNo" TEXT,
    "branch" TEXT,
    "specialization" TEXT,
    "age" INTEGER,
    "residenceType" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "role" TEXT NOT NULL DEFAULT 'applicant',
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainAssignment" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT,

    CONSTRAINT "DomainAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainTaskConfig" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "artifactType" TEXT NOT NULL DEFAULT 'none',
    "artifactLabel" TEXT,

    CONSTRAINT "DomainTaskConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskQuestion" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "TaskQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationDomain" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,

    CONSTRAINT "ApplicationDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "taskQuestionId" TEXT NOT NULL,
    "answerText" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "artifactType" TEXT,
    "artifactUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "score" INTEGER,
    "reviewerNotes" TEXT,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSlot" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "slotDate" DATE NOT NULL,
    "startTime" TIME NOT NULL,
    "endTime" TIME NOT NULL,
    "meetLink" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "InterviewSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "interviewSlotId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'locked',
    "decision" TEXT,
    "feedback" TEXT,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_name_key" ON "Domain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DomainAssignment_cycleId_domainId_key" ON "DomainAssignment"("cycleId", "domainId");

-- CreateIndex
CREATE UNIQUE INDEX "DomainTaskConfig_cycleId_domainId_key" ON "DomainTaskConfig"("cycleId", "domainId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_cycleId_userId_key" ON "Application"("cycleId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationDomain_applicationId_domainId_key" ON "ApplicationDomain"("applicationId", "domainId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_applicationId_taskQuestionId_key" ON "Answer"("applicationId", "taskQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_applicationId_domainId_key" ON "Submission"("applicationId", "domainId");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_applicationId_key" ON "Interview"("applicationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainAssignment" ADD CONSTRAINT "DomainAssignment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainAssignment" ADD CONSTRAINT "DomainAssignment_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainAssignment" ADD CONSTRAINT "DomainAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainTaskConfig" ADD CONSTRAINT "DomainTaskConfig_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainTaskConfig" ADD CONSTRAINT "DomainTaskConfig_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQuestion" ADD CONSTRAINT "TaskQuestion_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskQuestion" ADD CONSTRAINT "TaskQuestion_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDomain" ADD CONSTRAINT "ApplicationDomain_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDomain" ADD CONSTRAINT "ApplicationDomain_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_taskQuestionId_fkey" FOREIGN KEY ("taskQuestionId") REFERENCES "TaskQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSlot" ADD CONSTRAINT "InterviewSlot_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "Cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSlot" ADD CONSTRAINT "InterviewSlot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewSlotId_fkey" FOREIGN KEY ("interviewSlotId") REFERENCES "InterviewSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
