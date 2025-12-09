-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_leadId_fkey";

-- DropIndex
DROP INDEX "activities_leadId_idx";

-- CreateIndex
CREATE INDEX "activities_leadId_createdAt_idx" ON "activities"("leadId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
