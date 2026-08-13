import { repositoryFileService } from "./repository-file.service";

async function test() {
  try {
    const repositoryId = "0d60b631-8a90-4324-a8f7-e6bebe302435";

    console.log("Fetching repository files...\n");

    const files = await repositoryFileService.findByRepositoryId(
  repositoryId
);

    console.log(`Total files saved: ${files.length}\n`);

    for (const file of files) {
      console.log({
        id: file.id,
        path: file.path,
        sha: file.sha,
        size: file.size,
        language: file.language,
      });
    }
  } catch (error) {
    console.error("Failed to fetch repository files:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

test();