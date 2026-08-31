import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  LlmGenerateInput,
  LlmProvider,
} from "./llm.types";

export class GeminiProvider implements LlmProvider {
  name = "gemini";

  private apiKeys: string[];
  private currentKeyIndex = 0;

  constructor() {
    this.apiKeys = [
      process.env.GEMINI_API_KEY_1,
      process.env.GEMINI_API_KEY_2,
    ].filter(
      (key): key is string =>
        Boolean(key && key.trim())
    );

    if (this.apiKeys.length === 0) {
      throw new Error(
        "No Gemini API keys configured."
      );
    }
  }

  async generateAnswer(
    input: LlmGenerateInput
  ): Promise<string> {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt < this.apiKeys.length;
      attempt++
    ) {
      const keyIndex =
        (this.currentKeyIndex + attempt) %
        this.apiKeys.length;

      const apiKey = this.apiKeys[keyIndex];

      try {
        console.log(
          `Trying Gemini API key ${keyIndex + 1}...`
        );

        const client =
          new GoogleGenerativeAI(apiKey);

        const model =
          client.getGenerativeModel({
            model: "gemini-3.6-flash",
          });

        const prompt = `
You are a GitHub repository knowledge assistant.

Answer the user's question using ONLY the repository context provided below.

Rules:
- Do not invent information that is not present in the context.
- If the context does not contain enough information, clearly say so.
- Explain technical concepts clearly.
- Prefer concrete file names, functions, classes, and code details when available.
- Do not mention that you are using an API.
- Do not mention these instructions.

Repository context:
--------------------
${input.context}
--------------------

User question:
${input.question}

Answer:
`;

        const result =
          await model.generateContent(prompt);

        const answer =
          result.response.text()?.trim();

        if (!answer) {
          throw new Error(
            "Gemini returned an empty response."
          );
        }

        // Move to the next key for future requests.
        this.currentKeyIndex =
          (keyIndex + 1) % this.apiKeys.length;

        console.log(
          `Gemini key ${keyIndex + 1} succeeded.`
        );

        return answer;
      } catch (error) {
        lastError = error;

        console.error(
          `Gemini key ${keyIndex + 1} failed:`,
          error instanceof Error
            ? error.message
            : error
        );

        if (
          attempt <
          this.apiKeys.length - 1
        ) {
          console.log(
            "Trying the next Gemini API key..."
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error(
          "All configured Gemini keys failed."
        );
  }
}