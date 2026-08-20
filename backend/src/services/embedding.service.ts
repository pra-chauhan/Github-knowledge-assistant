import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = "text-embedding-3-small";

export const embeddingService = {
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text.trim()) {
      throw new Error("Cannot generate embedding for empty text");
    }

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
      throw new Error("Embedding generation returned no vector");
    }

    return embedding;
  },
};