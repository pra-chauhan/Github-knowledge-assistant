import { repositoryIngestionService } from "./repository-ingestion.service";

async function test() {
  try {
    const repositoryId = "0d60b631-8a90-4324-a8f7-e6bebe302435";

    console.log("Starting repository ingestion...\n");

    const result =
      await repositoryIngestionService.ingest(repositoryId);

    console.log("\n========== INGESTION RESULT ==========\n");

    console.log(result);

    console.log("\n======================================\n");
  } catch (error) {
    console.error("\nIngestion failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

test();