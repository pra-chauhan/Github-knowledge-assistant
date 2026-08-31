import {
  LlmGenerateInput,
  LlmProvider,
} from "./llm.types";

import { GeminiProvider } from "./gemini.provider";

export const llmRouter = {
  async generateAnswer(
    input: LlmGenerateInput
  ): Promise<string> {
    const providers: LlmProvider[] = [];

    const provider =
      process.env.LLM_PROVIDER || "auto";

    if (
      provider === "auto" ||
      provider === "gemini"
    ) {
      try {
        providers.push(
          new GeminiProvider()
        );
      } catch (error) {
        console.error(
          "Gemini provider unavailable:",
          error instanceof Error
            ? error.message
            : error
        );
      }
    }

    if (providers.length === 0) {
      throw new Error(
        "No LLM provider is configured."
      );
    }

    let lastError: unknown;

    for (const llmProvider of providers) {
      try {
        console.log(
          `Generating answer using ${llmProvider.name}...`
        );

        return await llmProvider.generateAnswer(
          input
        );
      } catch (error) {
        lastError = error;

        console.error(
          `${llmProvider.name} failed:`,
          error instanceof Error
            ? error.message
            : error
        );
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(
          "All LLM providers failed."
        );
  },
};