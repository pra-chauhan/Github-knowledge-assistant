import { githubService } from "./github.service";
import { shouldIndexFile } from "./repository-file-filter";
import { repositoryFileService } from "./repository-file.service";
import { repositoryService } from "./repository.service";

const MAX_FILES_PER_RUN = 100;

export interface IngestionResult {
  repositoryId: string;
  totalFilesFound: number;
  filesEligible: number;
  filesDownloaded: number;
  filesSaved: number;
  filesSkipped: number;
  filesFailed: number;
}

export const repositoryIngestionService = {
  async ingest(repositoryId: string): Promise<IngestionResult> {
    const repository =
      await repositoryService.findById(repositoryId);

    if (!repository) {
      throw new Error("Repository not found");
    }

    if (!repository.defaultBranch) {
      throw new Error("Repository has no default branch");
    }

    console.log(
      `Starting ingestion for ${repository.fullName}...`
    );

    const tree = await githubService.getRepositoryTree(
      repository.owner,
      repository.name,
      repository.defaultBranch
    );

    console.log(`Total files found: ${tree.length}`);

    const eligibleFiles = tree.filter((file) =>
      shouldIndexFile(file.path)
    );

    console.log(
      `Files eligible for indexing: ${eligibleFiles.length}`
    );

    const filesToProcess = eligibleFiles.slice(
      0,
      MAX_FILES_PER_RUN
    );

    if (eligibleFiles.length > MAX_FILES_PER_RUN) {
      console.log(
        `Limiting this run to ${MAX_FILES_PER_RUN} files.`
      );
    }

    let filesDownloaded = 0;
    let filesSaved = 0;
    let filesSkipped = 0;
    let filesFailed = 0;

    for (const file of filesToProcess) {
      try {
        console.log(`Processing: ${file.path}`);

        const existingFile =
          await repositoryFileService.findByPath(
            repositoryId,
            file.path
          );

        if (
          existingFile &&
          existingFile.sha === file.sha
        ) {
          console.log(
            `Skipping unchanged file: ${file.path}`
          );

          filesSkipped++;
          continue;
        }

        const githubFile =
            await githubService.getBlobContent(
                repository.owner,
                repository.name,
                file.sha
            );

        if (!githubFile) {
          console.log(
            `Skipped file: ${file.path}`
          );

          filesSkipped++;
          continue;
        }

        filesDownloaded++;

        await repositoryFileService.upsert({
  repositoryId,
  path: file.path,
  sha: githubFile.sha,
  size: githubFile.size,
  language: null,
  content: githubFile.content,
});

        filesSaved++;

        console.log(
          `Saved: ${githubFile.path}`
        );
      } catch (error) {
        filesFailed++;

        console.error(
          `Failed to process ${file.path}:`,
          error instanceof Error
            ? error.message
            : error
        );
      }
    }

    await repositoryService.update(repositoryId, {
      status: "INDEXED",
      lastIndexedAt: new Date(),
    });

    console.log("Ingestion completed.");

    return {
      repositoryId,
      totalFilesFound: tree.length,
      filesEligible: eligibleFiles.length,
      filesDownloaded,
      filesSaved,
      filesSkipped,
      filesFailed,
    };
  },
};