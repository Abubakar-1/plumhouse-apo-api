import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@guesthouse.com";
  const adminPassword = "Password123!"; // Use a strong password, preferably from a secure source in production

  console.log("[Seed]: Starting database seeding...");

  // Check for the existence of the admin user to prevent duplication
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(
      `[Seed]: Admin user with email "${adminEmail}" already exists. Skipping.`
    );
  } else {
    // A salt round of 12 is a strong, recommended default
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
      },
    });
    console.log(`[Seed]: Successfully created admin user "${adminEmail}".`);
  }
  console.log("[Seed]: Database seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
