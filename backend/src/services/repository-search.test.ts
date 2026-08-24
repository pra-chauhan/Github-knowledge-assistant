import { repositorySearchService } from "./repository-search.service";

async function test() {
  const repositoryId =
    "0d60b631-8a90-4324-a8f7-e6bebe302435";

  console.log("Searching repository...\n");

  const results =
    await repositorySearchService.search(
      repositoryId,
      "How does React handle state?",
      5
    );

  console.log(
    `Found ${results.length} results\n`
  );

  for (const [index, result] of results.entries()) {
    console.log(`========== RESULT ${index + 1} ==========`);

    console.log("File:", result.path);
    console.log(
      "Chunk:",
      result.chunkIndex
    );
    console.log(
      "Score:",
      result.score
    );

    console.log("\nContent preview:");
    console.log(
      result.content.slice(0, 500)
    );

    console.log();
  }
}

test().catch((error) => {
  console.error(
    "Search failed:",
    error
  );
});