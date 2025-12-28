/*
  Warnings:

  - You are about to drop the column `hash` on the `Media` table. All the data in the column will be lost.
  - Added the required column `sourceId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceId` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Media_hash_key";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "isDirectory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "sourceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "hash",
ADD COLUMN     "sourceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'watch',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'IDLE';

-- CreateIndex
CREATE INDEX "File_sourceId_idx" ON "File"("sourceId");

-- CreateIndex
CREATE INDEX "File_hash_idx" ON "File"("hash");

-- CreateIndex
CREATE INDEX "Media_sourceId_idx" ON "Media"("sourceId");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
