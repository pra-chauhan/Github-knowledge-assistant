import { repositorySearchService } from "./repository-search.service";
import { llmRouter } from "./llm/llm-router.service";

export interface AskRepositoryInput {
  repositoryId: string;
  question: string;
  topK?: number;
}

export interface RepositoryQaResponse {
  answer: string;
  sources: {
    file: string;
    chunkIndex: number;
    score: number;
  }[];
}

export const repositoryQaService = {
  async ask({
    repositoryId,
    question,
    topK = 5,
  }: AskRepositoryInput): Promise<RepositoryQaResponse> {
    if (!question.trim()) {
      throw new Error("Question cannot be empty");
    }

    console.log(
      `Searching repository for: "${question}"`
    );

    /*
     * 1. Convert the question into an embedding
     * 2. Search pgvector
     * 3. Retrieve the most relevant repository chunks
     */
    const results =
      await repositorySearchService.search(
        repositoryId,
        question,
        topK
      );

    console.log(
      `Found ${results.length} relevant chunks.`
    );

    if (results.length === 0) {
      return {
        answer:
          "I could not find relevant information in this repository.",
        sources: [],
      };
    }

    /*
     * Build the context that will be provided to the LLM.
     */
    const context = results
      .map(
        (result, index) =>
          `SOURCE ${index + 1}
File: ${result.path}
Chunk: ${result.chunkIndex}
Similarity Score: ${result.score.toFixed(3)}

${result.content}`
      )
      .join(
        "\n\n--------------------\n\n"
      );

    console.log("Generating LLM answer...");

    /*
     * Generate a grounded answer using the retrieved
     * repository context.
     */
    const answer =
      await llmRouter.generateAnswer({
        question: question.trim(),
        context,
      });

    return {
      answer,
      sources: results.map((result) => ({
        file: result.path,
        chunkIndex: result.chunkIndex,
        score: result.score,
      })),
    };
  },
};