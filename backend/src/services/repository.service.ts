import { prisma } from "../lib/prisma";

export interface CreateRepositoryInput {
  owner: string;
  name: string;
  fullName: string;
  githubUrl: string;
  defaultBranch?: string;
  description?: string;
  language?: string;
  stars?: number;
}

export const repositoryService = {
  async create(data: CreateRepositoryInput) {
    return prisma.repository.create({
      data: {
        owner: data.owner,
        name: data.name,
        fullName: data.fullName,
        githubUrl: data.githubUrl,
        defaultBranch: data.defaultBranch ?? null,
        description: data.description ?? null,
        language: data.language ?? null,
        stars: data.stars ?? 0,
      },
    });
  },

  async findAll() {
    return prisma.repository.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findById(id: string) {
    return prisma.repository.findUnique({
      where: {
        id,
      },
    });
  },

  async delete(id: string) {
    return prisma.repository.delete({
      where: {
        id,
      },
    });
  },
};