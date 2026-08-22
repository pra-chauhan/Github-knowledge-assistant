import { githubService } from "./github.service";

async function test() {
  try {
    console.log("Getting repository tree...\n");

    const tree = await githubService.getRepositoryTree(
      "react",
      "react",
      "main"
    );

    const readme = tree.find(
      (file) => file.path.toLowerCase() === "readme.md"
    );

    if (!readme) {
      throw new Error("README.md not found");
    }

    console.log("README found:");
    console.log({
      path: readme.path,
      sha: readme.sha,
      size: readme.size,
    });

    console.log("\nDownloading README using Git Blob API...\n");

    const file = await githubService.getBlobContent(
      "react",
      "react",
      readme.sha,
    );
    if (!file) {
      console.log("File was skipped.");
      return;
    }
    console.log("Blob downloaded successfully:\n");
    console.log({
      path: file.path,
      sha: file.sha,
      size: file.size,
      encoding: file.encoding,
    });
    console.log("\nFirst 500 characters:\n");
    console.log(file.content.slice(0, 500));
  } catch (error) {
    console.error("\nBlob download failed:");
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}
test();