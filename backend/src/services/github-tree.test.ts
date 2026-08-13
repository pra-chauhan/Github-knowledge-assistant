import { githubService } from "./github.service";
import { filterRepositoryFiles } from "../utils/file-filter";

async function test() {
  try {
    console.log("Fetching GitHub repository tree...\n");

    const tree = await githubService.getRepositoryTree(
      "react",
      "react",
      "main"
    );

    console.log(`Total GitHub files: ${tree.length}`);

    const filteredFiles = filterRepositoryFiles(tree);

    console.log(
      `Files selected for indexing: ${filteredFiles.length}`
    );

    console.log(
      `Files excluded: ${tree.length - filteredFiles.length}`
    );

    console.log("\nFirst 30 files selected for indexing:\n");

    for (const file of filteredFiles.slice(0, 30)) {
      console.log(file.path);
    }
  } catch (error) {
    console.error("Failed to test repository filtering:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

test();