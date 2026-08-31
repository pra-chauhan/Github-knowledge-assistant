import { prisma } from "./lib/prisma";

async function main() {
  const rows = await prisma.repositoryFile.findMany({
    select: {
      path: true,
      _count: {
        select: {
          chunks: true,
        },
      },
    },
    orderBy: {
      path: "asc",
    },
  });

  console.log("\n========== CHUNK DISTRIBUTION ==========\n");

  for (const row of rows) {
    console.log(
      `${row._count.chunks.toString().padStart(3)} chunks | ${row.path}`
    );
  }

  console.log("\n========================================\n");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
