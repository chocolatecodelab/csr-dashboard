/*
  Warnings:

  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `tenantId` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `budgets` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `programs` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `users` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `budgets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `programs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "tenants_code_key";

-- AlterTable
ALTER TABLE "category_programs" ADD COLUMN "color" TEXT;
ALTER TABLE "category_programs" ADD COLUMN "description" TEXT;
ALTER TABLE "category_programs" ADD COLUMN "icon" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "actualCost" REAL;
ALTER TABLE "projects" ADD COLUMN "budget" REAL;

-- AlterTable
ALTER TABLE "type_programs" ADD COLUMN "description" TEXT;
ALTER TABLE "type_programs" ADD COLUMN "duration" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "tenants";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logo" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "headId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "location" TEXT,
    "participants" INTEGER,
    "budget" REAL,
    "actualCost" REAL,
    "progress" REAL NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "activities_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "activities_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_activities" ("actualCost", "assignedToId", "budget", "createdAt", "description", "endDate", "id", "location", "name", "participants", "priority", "progress", "projectId", "startDate", "status", "type", "updatedAt") SELECT "actualCost", "assignedToId", "budget", "createdAt", "description", "endDate", "id", "location", "name", "participants", "priority", "progress", "projectId", "startDate", "status", "type", "updatedAt" FROM "activities";
DROP TABLE "activities";
ALTER TABLE "new_activities" RENAME TO "activities";
CREATE TABLE "new_budgets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "approvedAmount" REAL,
    "spentAmount" REAL NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "programId" TEXT,
    "projectId" TEXT,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "budgets_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "budgets_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "budgets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_budgets" ("amount", "approvedAmount", "approvedAt", "category", "createdAt", "currency", "id", "name", "period", "programId", "projectId", "spentAmount", "status", "type", "updatedAt") SELECT "amount", "approvedAmount", "approvedAt", "category", "createdAt", "currency", "id", "name", "period", "programId", "projectId", "spentAmount", "status", "type", "updatedAt" FROM "budgets";
DROP TABLE "budgets";
ALTER TABLE "new_budgets" RENAME TO "budgets";
CREATE TABLE "new_programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "targetBeneficiary" INTEGER,
    "targetArea" TEXT,
    "objectives" TEXT,
    "expectedOutcome" TEXT,
    "departmentId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "programs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category_programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "programs_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "type_programs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "programs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "programs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_programs" ("approvedAt", "approvedBy", "categoryId", "createdAt", "createdById", "description", "endDate", "id", "name", "priority", "startDate", "status", "targetArea", "targetBeneficiary", "typeId", "updatedAt") SELECT "approvedAt", "approvedBy", "categoryId", "createdAt", "createdById", "description", "endDate", "id", "name", "priority", "startDate", "status", "targetArea", "targetBeneficiary", "typeId", "updatedAt" FROM "programs";
DROP TABLE "programs";
ALTER TABLE "new_programs" RENAME TO "programs";
CREATE TABLE "new_roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_roles" ("createdAt", "description", "id", "name", "permissions", "updatedAt") SELECT "createdAt", "description", "id", "name", "permissions", "updatedAt" FROM "roles";
DROP TABLE "roles";
ALTER TABLE "new_roles" RENAME TO "roles";
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "employeeId" TEXT,
    "departmentId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_users" ("avatar", "createdAt", "email", "id", "lastLogin", "name", "phone", "position", "roleId", "status", "updatedAt") SELECT "avatar", "createdAt", "email", "id", "lastLogin", "name", "phone", "position", "roleId", "status", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_employeeId_key" ON "users"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "company_name_key" ON "company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_code_key" ON "company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");
