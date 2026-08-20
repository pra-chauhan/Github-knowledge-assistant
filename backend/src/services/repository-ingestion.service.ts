import { githubService } from "./github.service";
import { shouldIndexFile } from "./repository-file-filter";
import { repositoryFileService } from "./repository-file.service";
import { repositoryService } from "./repository.service";
import { detectLanguage } from "../utils/file-language";
import { repositoryChunkService } from "./repository-chunk.service";
import { repositoryEmbeddingService } from "./repository-embedding.service";


const MAX_FILES_PER_RUN = 25;

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

    const CONCURRENCY = 5;

for (let i = 0; i < filesToProcess.length; i += CONCURRENCY) {
  const batch = filesToProcess.slice(i, i + CONCURRENCY);

  console.log(
    `Processing batch ${Math.floor(i / CONCURRENCY) + 1}...`
  );

  const results = await Promise.all(
    batch.map(async (file) => {
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

          return {
            downloaded: 0,
            saved: 0,
            skipped: 1,
            failed: 0,
          };
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

          return {
            downloaded: 0,
            saved: 0,
            skipped: 1,
            failed: 0,
          };
        }

        const savedFile = await repositoryFileService.upsert({
  repositoryId,
  path: file.path,
  sha: githubFile.sha,
  size: githubFile.size,
  language: detectLanguage(file.path),
  content: githubFile.content,
});

await repositoryChunkService.createForFile(
  repositoryId,
  savedFile.id,
  githubFile.content
);

console.log(`Saved file and chunks: ${file.path}`);

        return {
          downloaded: 1,
          saved: 1,
          skipped: 0,
          failed: 0,
        };
      } catch (error) {
        console.error(
          `Failed to process ${file.path}:`,
          error instanceof Error
            ? error.message
            : error
        );

        return {
          downloaded: 0,
          saved: 0,
          skipped: 0,
          failed: 1,
        };
      }
    })
  );

  for (const result of results) {
    filesDownloaded += result.downloaded;
    filesSaved += result.saved;
    filesSkipped += result.skipped;
    filesFailed += result.failed;
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
