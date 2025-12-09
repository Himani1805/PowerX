-- AlterTable
ALTER TABLE "users" ADD COLUMN "resetPasswordToken" TEXT,
ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);
