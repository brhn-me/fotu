/*
  Warnings:

  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "extension" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "File_parentId_idx" ON "File"("parentId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
