const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 1536;

const geminiApiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
].filter((key): key is string => Boolean(key));

let currentGeminiKeyIndex = 0;

async function getGeminiClient() {
  if (geminiApiKeys.length === 0) {
    throw new Error("No Gemini API key configured.");
  }

  const { GoogleGenAI } = await import("@google/genai");

  return new GoogleGenAI({
    apiKey: geminiApiKeys[currentGeminiKeyIndex],
  });
}

function switchGeminiKey(): boolean {
  if (geminiApiKeys.length <= 1) {
    return false;
  }

  currentGeminiKeyIndex =
    (currentGeminiKeyIndex + 1) % geminiApiKeys.length;

  return true;
}

async function generateGeminiEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const cleanedTexts = texts.map((text) => text.trim());

  if (cleanedTexts.some((text) => !text)) {
    throw new Error(
      "Cannot generate embeddings for empty text."
    );
  }

  let lastError: unknown;

  for (
    let attempt = 0;
    attempt < geminiApiKeys.length;
    attempt++
  ) {
    try {
      const ai = await getGeminiClient();

      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: cleanedTexts,
        config: {
          outputDimensionality: EMBEDDING_DIMENSIONS,
        },
      });

      const embeddings =
        response.embeddings?.map(
          (item) => item.values ?? []
        ) ?? [];

      if (embeddings.length !== cleanedTexts.length) {
        throw new Error(
          `Expected ${cleanedTexts.length} embeddings, received ${embeddings.length}.`
        );
      }

      for (const embedding of embeddings) {
        if (embedding.length !== EMBEDDING_DIMENSIONS) {
          throw new Error(
            `Expected ${EMBEDDING_DIMENSIONS}-dimensional embedding, received ${embedding.length}.`
          );
        }
      }

      return embeddings;
    } catch (error) {
      lastError = error;

      console.error(
        `Gemini embedding attempt ${attempt + 1} failed:`,
        error instanceof Error
          ? error.message
          : error
      );

      if (!switchGeminiKey()) {
        break;
      }

      console.log(
        "Switching to the next Gemini API key..."
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(
        "Gemini embedding generation failed."
      );
}

export const embeddingService = {
  async generateEmbedding(
    text: string
  ): Promise<number[]> {
    const results =
      await this.generateEmbeddings([text]);

    return results[0];
  },

  async generateEmbeddings(
    texts: string[]
  ): Promise<number[][]> {
    const provider =
      process.env.EMBEDDING_PROVIDER || "gemini";

    if (provider === "gemini") {
      return generateGeminiEmbeddings(texts);
    }

    throw new Error(
      `Unsupported embedding provider: ${provider}`
    );
  },
};