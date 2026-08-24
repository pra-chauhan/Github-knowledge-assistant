import { embeddingService } from "./embedding.service";
import { repositoryChunkService } from "./repository-chunk.service";

export const repositoryEmbeddingService = {
  async generateEmbedding(
    content: string
  ): Promise<number[]> {
    return embeddingService.generateEmbedding(content);
  },

  async saveEmbedding(
    chunkId: string,
    embedding: number[]
  ) {
    return repositoryChunkService.updateEmbedding(
      chunkId,
      embedding
    );
  },

  async embedChunk(
    chunkId: string,
    content: string
  ) {
    const embedding =
      await this.generateEmbedding(content);

    return this.saveEmbedding(
      chunkId,
      embedding
    );
  },

  async embedChunks(
    chunks: Array<{
      id: string;
      content: string;
    }>
  ) {
    const results = [];

    for (const chunk of chunks) {
      try {
        const result =
          await this.embedChunk(
            chunk.id,
            chunk.content
          );

        results.push(result);
      } catch (error) {
        console.error(
          `Failed to embed chunk ${chunk.id}:`,
          error instanceof Error
            ? error.message
            : error
        );
      }
    }

    return results;
  },
};