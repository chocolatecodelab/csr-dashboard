/*
  Warnings:

  - You are about to drop the column `generatedAt` on the `reports` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "report_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "totalBudget" REAL,
    "budgetUsed" REAL,
    "budgetRemaining" REAL,
    "budgetPercentage" REAL,
    "totalPrograms" INTEGER,
    "activePrograms" INTEGER,
    "completedPrograms" INTEGER,
    "totalActivities" INTEGER,
    "completedActivities" INTEGER,
    "ongoingActivities" INTEGER,
    "totalStakeholders" INTEGER,
    "totalBeneficiaries" INTEGER,
    "satisfactionScore" REAL,
    "socialImpact" REAL,
    "environmentalImpact" REAL,
    "economicImpact" REAL,
    "customMetrics" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "report_metrics_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activity_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "reportId" TEXT,
    "summary" TEXT,
    "impact" TEXT,
    "outcomes" TEXT,
    "challenges" TEXT,
    "lessons" TEXT,
    "recommendations" TEXT,
    "photos" TEXT,
    "videos" TEXT,
    "documents" TEXT,
    "participantCount" INTEGER,
    "beneficiaryCount" INTEGER,
    "satisfactionRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "activity_reports_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activity_reports_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_activity_reports" ("activityId", "challenges", "createdAt", "documents", "id", "impact", "lessons", "outcomes", "photos", "reportId", "updatedAt") SELECT "activityId", "challenges", "createdAt", "documents", "id", "impact", "lessons", "outcomes", "photos", "reportId", "updatedAt" FROM "activity_reports";
DROP TABLE "activity_reports";
ALTER TABLE "new_activity_reports" RENAME TO "activity_reports";
CREATE TABLE "new_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "content" TEXT NOT NULL,
    "metrics" TEXT,
    "period" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "programId" TEXT,
    "departmentId" TEXT,
    "template" TEXT,
    "coverImage" TEXT,
    "tags" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "submittedBy" TEXT,
    "submittedAt" DATETIME,
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "publishedAt" DATETIME,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reports_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "reports_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_reports" ("content", "createdAt", "id", "metrics", "period", "programId", "publishedAt", "status", "title", "type", "updatedAt") SELECT "content", "createdAt", "id", "metrics", "period", "programId", "publishedAt", "status", "title", "type", "updatedAt" FROM "reports";
DROP TABLE "reports";
ALTER TABLE "new_reports" RENAME TO "reports";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
