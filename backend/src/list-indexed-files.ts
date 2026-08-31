import { prisma } from "./lib/prisma";

async function main() {
  const files = await prisma.repositoryFile.findMany({
    select: {
      path: true,
    },
    orderBy: {
      path: "asc",
    },
  });

  console.log("\n========== INDEXED FILES ==========");

  for (const file of files) {
    console.log(file.path);
  }

  console.log("===================================\n");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
