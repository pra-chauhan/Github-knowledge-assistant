import dotenv from "dotenv";
import { prisma } from "../lib/prisma";
import { repositoryEmbeddingService } from "./repository-embedding.service";

dotenv.config();

const REPOSITORY_ID =
  "0d60b631-8a90-4324-a8f7-e6bebe302435";

const CHUNK_FETCH_SIZE = 100;

interface ChunkToEmbed {
  id: string;
  content: string;
}

async function backfillEmbeddings() {
  console.log("Starting embedding backfill...");

  let totalEmbedded = 0;

  while (true) {
    /*
     * The embedding column is PostgreSQL's vector type and is
     * intentionally not exposed through Prisma Client.
     *
     * Therefore we use raw SQL to find chunks whose embedding
     * is still NULL.
     */
    const chunks =
      await prisma.$queryRaw<ChunkToEmbed[]>`
        SELECT
          "id",
          "content"
        FROM "RepositoryFileChunk"
        WHERE
          "repositoryId" = ${REPOSITORY_ID}
          AND "embedding" IS NULL
        ORDER BY "createdAt" ASC
        LIMIT ${CHUNK_FETCH_SIZE}
      `;

    if (chunks.length === 0) {
      break;
    }

    console.log(
      `Found ${chunks.length} chunks without embeddings.`
    );

    const results =
      await repositoryEmbeddingService.embedChunks(
        chunks
      );

    totalEmbedded += results.length;

    console.log(
      `Total embedded so far: ${totalEmbedded}`
    );

    /*
     * Prevent an infinite loop if Gemini fails and no
     * embeddings are actually saved.
     */
    if (results.length === 0) {
      throw new Error(
        "No embeddings were generated for this batch. Stopping backfill."
      );
    }
  }

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "Embedding backfill completed successfully."
  );
  console.log(
    `Total chunks embedded: ${totalEmbedded}`
  );
  console.log(
    "======================================"
  );
}

backfillEmbeddings()
  .catch((error) => {
    console.error(
      "Embedding backfill failed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });