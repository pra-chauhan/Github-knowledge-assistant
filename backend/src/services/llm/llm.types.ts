export interface LlmGenerateInput {
  question: string;
  context: string;
}

export interface LlmProvider {
  name: string;

  generateAnswer(
    input: LlmGenerateInput
  ): Promise<string>;
}