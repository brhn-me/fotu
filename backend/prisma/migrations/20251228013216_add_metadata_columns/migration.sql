-- AlterTable
ALTER TABLE "Metadata" ADD COLUMN     "bitrate" INTEGER,
ADD COLUMN     "codec" TEXT,
ADD COLUMN     "exposureTime" DOUBLE PRECISION,
ADD COLUMN     "fNumber" DOUBLE PRECISION,
ADD COLUMN     "fps" DOUBLE PRECISION,
ADD COLUMN     "iso" INTEGER,
ADD COLUMN     "lens" TEXT,
ADD COLUMN     "make" TEXT,
ADD COLUMN     "model" TEXT;
