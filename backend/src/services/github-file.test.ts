import { githubService } from "./github.service";

async function test() {
  try {
    console.log("Downloading README.md...\n");

    const file = await githubService.getFileContent(
      "react",
      "react",
      "packages/react/src/React.js"
    );

    if (!file) {
      console.log("File was skipped.");
      return;
    }

    console.log("File downloaded successfully.\n");

    console.log({
      path: file.path,
      sha: file.sha,
      size: file.size,
      encoding: file.encoding,
    });

    console.log("\nFirst 500 characters:\n");

    console.log(file.content.slice(0, 500));
  } catch (error) {
    console.error("Failed to download file:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

test();