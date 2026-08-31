import { prisma } from "./lib/prisma";

async function main() {
  const repositories = await prisma.repository.count();
  const files = await prisma.repositoryFile.count();
  const chunks = await prisma.repositoryFileChunk.count();

  const embedded = await prisma.$queryRawUnsafe<
    { count: number }[]
  >(
    'SELECT COUNT(*)::int AS count FROM "RepositoryFileChunk" WHERE "embedding" IS NOT NULL'
  );

  console.log("\n========== DATABASE DIAGNOSTIC ==========");
  console.log("Repositories:", repositories);
  console.log("Files:", files);
  console.log("Chunks:", chunks);
  console.log("Embedded chunks:", embedded[0]?.count ?? 0);
  console.log("==========================================\n");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
