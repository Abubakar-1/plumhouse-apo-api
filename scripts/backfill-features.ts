// scripts/backfill-features.ts
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[Backfill]: Starting to update rooms with NULL features...");

  const result = await prisma.room.updateMany({
    // CORRECTED `where` CLAUSE:
    // We use the `equals` operator within the filter object to check for NULL.
    where: {
      features: {
        equals: Prisma.JsonNull,
      },
    },
    // The `data` block correctly uses an array, which Prisma serializes to '[]'.
    data: {
      features: [],
    },
  });

  console.log(`[Backfill]: Completed. Updated ${result.count} room(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
