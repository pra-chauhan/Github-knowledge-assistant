import dotenv from "dotenv";
import { prisma } from "../lib/prisma";
import { repositoryQaService } from "./repository-qa.service";

dotenv.config();

const REPOSITORY_ID =
  "0d60b631-8a90-4324-a8f7-e6bebe302435";

async function test() {
  try {
    console.log(
      "Starting repository QA test...\n"
    );

    const result =
      await repositoryQaService.ask({
        repositoryId: REPOSITORY_ID,
        question:
          "How is the React repository structured?",
        topK: 5,
      });

    console.log(
      "\n========== ANSWER ==========\n"
    );

    console.log(result.answer);

    console.log(
      "\n========== SOURCES ==========\n"
    );

    for (const source of result.sources) {
      console.log(
        `${source.file} | Chunk ${source.chunkIndex} | Score ${source.score.toFixed(3)}`
      );
    }
  } catch (error) {
    console.error(
      "\nQA test failed:",
      error
    );

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

test();