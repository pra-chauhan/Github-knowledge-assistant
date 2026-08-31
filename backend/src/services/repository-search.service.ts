import { prisma } from "../lib/prisma";
import { embeddingService } from "./embedding.service";

export interface RepositorySearchResult {
  chunkId: string;
  fileId: string;
  path: string;
  chunkIndex: number;
  content: string;
  score: number;
}

export const repositorySearchService = {
  async search(
    repositoryId: string,
    query: string,
    limit = 5
  ): Promise<RepositorySearchResult[]> {
    if (!query.trim()) {
      throw new Error("Search query cannot be empty");
    }

    const embeddingStart = Date.now();

    const embedding =
      await embeddingService.generateEmbedding(query);

    const embeddingTime = Date.now() - embeddingStart;

    console.log(
      `[SEARCH] Query embedding: ${embeddingTime} ms`
    );

    const vector = `[${embedding.join(",")}]`;

    const candidateLimit = Math.max(limit * 2, 10);

    const searchStart = Date.now();

    const results =
      await prisma.$queryRaw<RepositorySearchResult[]>`
        SELECT
          c."id" AS "chunkId",
          c."fileId" AS "fileId",
          f."path" AS "path",
          c."chunkIndex" AS "chunkIndex",
          c."content" AS "content",
          1 - (c."embedding" <=> ${vector}::vector) AS "score"
        FROM "RepositoryFileChunk" c
        INNER JOIN "RepositoryFile" f
          ON f."id" = c."fileId"
        WHERE
          c."repositoryId" = ${repositoryId}
          AND c."embedding" IS NOT NULL
        ORDER BY
          c."embedding" <=> ${vector}::vector
        LIMIT ${candidateLimit}
      `;

    const searchTime = Date.now() - searchStart;

    console.log(
      `[SEARCH] Vector search: ${searchTime} ms`
    );

    const relevantResults = results.filter(
      (result) => result.score >= 0.20
    );

    console.log(
      `[SEARCH] Candidates: ${results.length}, relevant: ${relevantResults.length}`
    );

    return relevantResults.slice(0, limit);
  },
};