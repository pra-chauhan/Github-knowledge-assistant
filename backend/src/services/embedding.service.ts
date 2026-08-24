import OpenAI from "openai";
import crypto from "crypto";

const EMBEDDING_DIMENSIONS = 1536;

const EMBEDDING_PROVIDER =
  process.env.EMBEDDING_PROVIDER || "local";

const EMBEDDING_MODEL = "text-embedding-3-small";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, value) => sum + value * value, 0)
  );

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => value / magnitude);
}

/**
 * Deterministic local development embedding.
 *
 * This is NOT a production-quality semantic embedding model.
 * It is used so the complete vector-search pipeline can be
 * developed without requiring paid API credits.
 */
function generateLocalEmbedding(text: string): number[] {
  const vector = new Array<number>(
    EMBEDDING_DIMENSIONS
  ).fill(0);

  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  for (const token of tokens) {
    const hash = crypto
      .createHash("sha256")
      .update(token)
      .digest();

    const index =
      hash.readUInt32BE(0) % EMBEDDING_DIMENSIONS;

    const sign =
      hash[4] % 2 === 0 ? 1 : -1;

    vector[index] += sign;
  }

  return normalize(vector);
}

async function generateOpenAIEmbedding(
  text: string
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error(
      "Embedding generation returned no vector"
    );
  }

  return embedding;
}

export const embeddingService = {
  async generateEmbedding(
    text: string
  ): Promise<number[]> {
    if (!text.trim()) {
      throw new Error(
        "Cannot generate embedding for empty text"
      );
    }

    if (
      EMBEDDING_PROVIDER.toLowerCase() ===
      "openai"
    ) {
      return generateOpenAIEmbedding(text);
    }

    return generateLocalEmbedding(text);
  },

  getProvider() {
    return EMBEDDING_PROVIDER;
  },

  getDimensions() {
    return EMBEDDING_DIMENSIONS;
  },
};