/*
  Warnings:

  - The primary key for the `Settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Settings` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Settings_key_key";

-- AlterTable
ALTER TABLE "Settings" DROP CONSTRAINT "Settings_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Settings_pkey" PRIMARY KEY ("key");
