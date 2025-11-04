/*
  Warnings:

  - You are about to drop the column `amenities` on the `room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `adults` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `children` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `room` DROP COLUMN `amenities`,
    ADD COLUMN `airportTransport` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `balcony` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `features` JSON NOT NULL,
    ADD COLUMN `fitnessCenter` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `freeWifi` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `refrigerator` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `shower` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `support24_7` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `swimmingPool` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `workDesk` BOOLEAN NOT NULL DEFAULT false;
