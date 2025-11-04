/*
  Warnings:

  - You are about to drop the column `imagePublicId` on the `room` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `room` DROP COLUMN `imagePublicId`,
    DROP COLUMN `imageUrl`,
    ADD COLUMN `capacity` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `size` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `RoomImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `roomId` INTEGER NOT NULL,

    INDEX `RoomImage_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomImage` ADD CONSTRAINT `RoomImage_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
