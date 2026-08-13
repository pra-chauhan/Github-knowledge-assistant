import { prisma } from "../lib/prisma";

export interface CreateRepositoryFileInput {
  repositoryId: string;
  path: string;
  sha: string;
  size: number;
  language?: string | null;
  content: string;
}

export const repositoryFileService = {
  async create(data: CreateRepositoryFileInput) {
    return prisma.repositoryFile.create({
      data: {
        repositoryId: data.repositoryId,
        path: data.path,
        sha: data.sha,
        size: data.size,
        language: data.language ?? null,
        content: data.content,
      },
    });
  },

  async findByRepositoryId(repositoryId: string) {
    return prisma.repositoryFile.findMany({
      where: {
        repositoryId,
      },
      orderBy: {
        path: "asc",
      },
    });
  },

  async findByPath(
    repositoryId: string,
    path: string
  ) {
    return prisma.repositoryFile.findUnique({
      where: {
        repositoryId_path: {
          repositoryId,
          path,
        },
      },
    });
  },

  async upsert(data: CreateRepositoryFileInput) {
    return prisma.repositoryFile.upsert({
      where: {
        repositoryId_path: {
          repositoryId: data.repositoryId,
          path: data.path,
        },
      },

      update: {
        sha: data.sha,
        size: data.size,
        language: data.language ?? null,
        content: data.content,
      },

      create: {
        repositoryId: data.repositoryId,
        path: data.path,
        sha: data.sha,
        size: data.size,
        language: data.language ?? null,
        content: data.content,
      },
    });
  },
};