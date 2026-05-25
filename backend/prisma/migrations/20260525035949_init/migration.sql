/*
  Warnings:

  - Added the required column `userId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pomodoroDuration" INTEGER DEFAULT 25,
ADD COLUMN     "theme" TEXT DEFAULT 'light',
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
