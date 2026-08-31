import { prisma } from "../lib/prisma";

const DEFAULT_CHUNK_SIZE = 4000;
const DEFAULT_OVERLAP = 400;

export interface CreateChunkInput {
  repositoryId: string;
  fileId: string;
  chunkIndex: number;
  content: string;
  startLine?: number | null;
  endLine?: number | null;
  tokenCount?: number | null;
}

export function splitContent(
  content: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): string[] {
  if (!content) {
    return [];
  }

  if (overlap >= chunkSize) {
    throw new Error("Overlap must be smaller than chunk size");
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < content.length) {
    const end = Math.min(
      start + chunkSize,
      content.length
    );

    chunks.push(content.slice(start, end));

    if (end >= content.length) {
      break;
    }

    start = end - overlap;
  }

  return chunks;
}

export const repositoryChunkService = {
  async create(data: CreateChunkInput) {
    return prisma.repositoryFileChunk.create({
      data: {
        repositoryId: data.repositoryId,
        fileId: data.fileId,
        chunkIndex: data.chunkIndex,
        content: data.content,
        startLine: data.startLine ?? null,
        endLine: data.endLine ?? null,
        tokenCount: data.tokenCount ?? null,
      },
    });
  },

  async deleteByFileId(fileId: string) {
    return prisma.repositoryFileChunk.deleteMany({
      where: {
        fileId,
      },
    });
  },

  async createForFile(
    repositoryId: string,
    fileId: string,
    content: string
  ) {
    const chunks = splitContent(content);

    await this.deleteByFileId(fileId);

    if (chunks.length === 0) {
      return [];
    }

    return prisma.repositoryFileChunk.createManyAndReturn({
      data: chunks.map((chunk, index) => ({
        repositoryId,
        fileId,
        chunkIndex: index,
        content: chunk,
        startLine: null,
        endLine: null,
        tokenCount: null,
      })),
    });
  },

  async findByFileId(fileId: string) {
    return prisma.repositoryFileChunk.findMany({
      where: {
        fileId,
      },
      orderBy: {
        chunkIndex: "asc",
      },
    });
  },

  async updateEmbedding(
    chunkId: string,
    embedding: number[]
  ) {
    if (embedding.length !== 1536) {
      throw new Error(
        `Expected 1536-dimensional embedding, received ${embedding.length}`
      );
    }

    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "RepositoryFileChunk"
      SET "embedding" = ${vector}::vector
      WHERE "id" = ${chunkId}
    `;

    return prisma.repositoryFileChunk.findUnique({
      where: {
        id: chunkId,
      },
    });
  },

  async findById(chunkId: string) {
    return prisma.repositoryFileChunk.findUnique({
      where: {
        id: chunkId,
      },
    });
  },

  async findWithoutEmbeddings(
  repositoryId: string,
  limit = 1000
) {
  return prisma.repositoryFileChunk.findMany({
    where: {
      repositoryId,
      embedding: null,
    },
    select: {
      id: true,
      content: true,
    },
    take: limit,
    orderBy: {
      createdAt: "asc",
    },
  });
},
};