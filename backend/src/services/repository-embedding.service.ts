import { embeddingService } from "./embedding.service";
import { repositoryChunkService } from "./repository-chunk.service";

const EMBEDDING_BATCH_SIZE = 20;

export const repositoryEmbeddingService = {
  async generateEmbedding(
    content: string
  ): Promise<number[]> {
    if (!content.trim()) {
      throw new Error(
        "Cannot generate embedding for empty content"
      );
    }

    return embeddingService.generateEmbedding(content);
  },

  async generateEmbeddings(
    contents: string[]
  ): Promise<number[][]> {
    if (contents.length === 0) {
      return [];
    }

    return embeddingService.generateEmbeddings(contents);
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
    if (chunks.length === 0) {
      return [];
    }

    const results = [];

    for (
      let i = 0;
      i < chunks.length;
      i += EMBEDDING_BATCH_SIZE
    ) {
      const batch = chunks.slice(
        i,
        i + EMBEDDING_BATCH_SIZE
      );

      console.log(
        `Embedding batch ${Math.floor(
          i / EMBEDDING_BATCH_SIZE
        ) + 1} (${batch.length} chunks)...`
      );

      try {
        const embeddings =
          await this.generateEmbeddings(
            batch.map((chunk) => chunk.content)
          );

        if (embeddings.length !== batch.length) {
          throw new Error(
            `Expected ${batch.length} embeddings, received ${embeddings.length}`
          );
        }

        for (let j = 0; j < batch.length; j++) {
          const result =
            await this.saveEmbedding(
              batch[j].id,
              embeddings[j]
            );

          results.push(result);
        }

        console.log(
          `Batch completed: ${batch.length} chunks`
        );
      } catch (error) {
        console.error(
          `Embedding batch failed:`,
          error instanceof Error
            ? error.message
            : error
        );
      }
    }

    return results;
  },
};