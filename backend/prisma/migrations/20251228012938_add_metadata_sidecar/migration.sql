/*
  Warnings:

  - You are about to drop the column `mimeType` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sidecarFileId]` on the table `Metadata` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "mimeType";

-- AlterTable
ALTER TABLE "Metadata" ADD COLUMN     "sidecarFileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Metadata_sidecarFileId_key" ON "Metadata"("sidecarFileId");

-- AddForeignKey
ALTER TABLE "Metadata" ADD CONSTRAINT "Metadata_sidecarFileId_fkey" FOREIGN KEY ("sidecarFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
