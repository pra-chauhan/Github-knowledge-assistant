import { repositoryService } from "./repository.service";
import { repositoryFileService } from "./repository-file.service";
import { repositoryChunkService } from "./repository-chunk.service";

async function test() {
  try {
    const repositories = await repositoryService.findAll();

    if (repositories.length === 0) {
      throw new Error("No repository found in database");
    }

    const repository = repositories[0];

    const files =
      await repositoryFileService.findByRepositoryId(
        repository.id
      );

    if (files.length === 0) {
      throw new Error("No repository files found");
    }

    const file = files[0];

    console.log("Creating chunks for:");
    console.log(file.path);

    const chunks =
      await repositoryChunkService.createForFile(
        repository.id,
        file.id,
        file.content
      );

    console.log(`\nTotal chunks saved: ${chunks.length}`);

    for (const chunk of chunks) {
      console.log({
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        contentLength: chunk.content.length,
      });
    }

    const savedChunks =
      await repositoryChunkService.findByFileId(
        file.id
      );

    console.log(
      `\nChunks retrieved from database: ${savedChunks.length}`
    );

    console.log("\nFirst chunk:");
    console.log(savedChunks[0]?.content.slice(0, 200));

    console.log("\nPersistence test successful!");
  } catch (error) {
    console.error("\nPersistence test failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

test();