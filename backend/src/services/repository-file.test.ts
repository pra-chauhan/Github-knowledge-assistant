import { githubService } from "./github.service";
import { repositoryFileService } from "./repository-file.service";

async function test() {
  try {
    const repositoryId = "0d60b631-8a90-4324-a8f7-e6bebe302435";

    console.log("Downloading README.md from GitHub...\n");

    const githubFile = await githubService.getFileContent(
      "react",
      "react",
      "README.md"
    );

    if (!githubFile) {
      console.log("GitHub file was skipped.");
      return;
    }

    console.log("GitHub file downloaded:");

    console.log({
      path: githubFile.path,
      sha: githubFile.sha,
      size: githubFile.size,
    });

    console.log("\nSaving file to Supabase...\n");

    const savedFile = await repositoryFileService.create({
      repositoryId,
      path: githubFile.path,
      sha: githubFile.sha,
      size: githubFile.size,
      language: "Markdown",
      content: githubFile.content,
    });

    console.log("File saved successfully!\n");

    console.log({
      id: savedFile.id,
      repositoryId: savedFile.repositoryId,
      path: savedFile.path,
      sha: savedFile.sha,
      size: savedFile.size,
      language: savedFile.language,
    });
  } catch (error) {
    console.error("Test failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

test();