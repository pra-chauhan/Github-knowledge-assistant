import { repositorySearchService } from "./repository-search.service";
import { llmRouter } from "./llm/llm-router.service";


export interface AskRepositoryInput {
  repositoryId: string;
  question: string;
  topK?: number;
}

export const repositoryQaService = {
  async ask({
    repositoryId,
    question,
    topK = 5,
  }: AskRepositoryInput) {
    if (!question.trim()) {
      throw new Error("Question cannot be empty");
    }

    const results =
      await repositorySearchService.search(
        repositoryId,
        question,
        topK
      );

    if (results.length === 0) {
      return {
        answer:
          "I could not find relevant information in this repository.",
        sources: [],
      };
    }

    const context = results
      .map(
        (result, index) =>
          `SOURCE ${index + 1}
File: ${result.path}
Chunk: ${result.chunkIndex}

${result.content}`
      )
      .join("\n\n--------------------\n\n");

    const answer =
      await llmRouter.generateAnswer({
        question,
        context
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

function buildMockAnswer(
  question: string,
  results: Array<{
    path: string;
    chunkIndex: number;
    score: number;
  }>
) {
  return `Based on the repository, I found ${
    results.length
  } relevant source chunks for:

"${question}"

The most relevant source is:

${results[0]?.path ?? "Unknown"}

The retrieved repository context is ready to be passed to an LLM in the next phase.`;
}