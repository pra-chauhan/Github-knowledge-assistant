import { embeddingService } from "./embedding.service";
import { repositoryChunkService } from "./repository-chunk.service";

export const repositoryEmbeddingService = {
  async embedChunk(chunkId: string, content: string) {
    if (!content.trim()) {
      throw new Error("Cannot embed empty chunk");
    }

    console.log(`Generating embedding for chunk ${chunkId}...`);

    const embedding =
      await embeddingService.generateEmbedding(content);

    console.log(
      `Embedding generated: ${embedding.length} dimensions`
    );

    const updatedChunk =
      await repositoryChunkService.updateEmbedding(
        chunkId,
        embedding
      );

    if (!updatedChunk) {
      throw new Error(
        `Chunk not found after embedding update: ${chunkId}`
      );
    }

    console.log(`Embedding saved for chunk ${chunkId}`);

    return updatedChunk;
  },
};