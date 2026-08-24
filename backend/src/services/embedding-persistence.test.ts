import { prisma } from "../lib/prisma";
import { repositoryEmbeddingService } from "./repository-embedding.service";

async function test() {
  try {
    console.log("Finding an existing chunk...\n");

    const chunk = await prisma.repositoryFileChunk.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!chunk) {
      throw new Error(
        "No chunks found. Run repository ingestion first."
      );
    }

    console.log("Found chunk:");
    console.log("ID:", chunk.id);
    console.log("Content length:", chunk.content.length);
    console.log(
      "Content preview:",
      chunk.content.slice(0, 200)
    );

    console.log("\nGenerating and saving embedding...\n");

    await repositoryEmbeddingService.embedChunk(
      chunk.id,
      chunk.content
    );

    console.log("Embedding saved successfully! ✅");

    const updatedChunk =
      await prisma.repositoryFileChunk.findUnique({
        where: {
          id: chunk.id,
        },
      });

    if (!updatedChunk) {
      throw new Error("Chunk could not be retrieved");
    }

    console.log("\nChunk retrieved successfully:");
    console.log("ID:", updatedChunk.id);
    console.log(
      "Embedding should now be stored in PostgreSQL."
    );

    console.log("\n========== EMBEDDING TEST PASSED ==========\n");
  } catch (error) {
    console.error("\nEmbedding test failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

test();