-- CreateEnum
CREATE TYPE "AnalyticsTimeframe" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "assignedTo" TEXT;

-- CreateTable
CREATE TABLE "lead_analytics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalLeads" INTEGER NOT NULL,
    "newLeads" INTEGER NOT NULL,
    "contacted" INTEGER NOT NULL,
    "qualified" INTEGER NOT NULL,
    "converted" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "userId" TEXT,

    CONSTRAINT "lead_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_performance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "leadsAssigned" INTEGER NOT NULL DEFAULT 0,
    "leadsConverted" INTEGER NOT NULL DEFAULT 0,
    "activities" INTEGER NOT NULL DEFAULT 0,
    "responseTime" INTEGER,
    "conversionRate" DOUBLE PRECISION,

    CONSTRAINT "user_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funnel_stages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funnel_stages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_analytics_date_idx" ON "lead_analytics"("date");

-- CreateIndex
CREATE INDEX "user_performance_date_userId_idx" ON "user_performance"("date", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "funnel_stages_name_date_key" ON "funnel_stages"("name", "date");

-- AddForeignKey
ALTER TABLE "lead_analytics" ADD CONSTRAINT "lead_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_performance" ADD CONSTRAINT "user_performance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
