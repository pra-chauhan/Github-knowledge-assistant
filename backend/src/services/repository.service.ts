import { prisma } from "../lib/prisma";

export interface CreateRepositoryInput {
  owner: string;
  name: string;
  fullName: string;
  githubUrl: string;
  defaultBranch?: string | null;
  description?: string | null;
  language?: string | null;
  stars?: number;
}

export const repositoryService = {
  async create(data: CreateRepositoryInput) {
    const existingRepository = await prisma.repository.findUnique({
      where: {
        fullName: data.fullName,
      },
    });

    if (existingRepository) {
      return existingRepository;
    }

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

  async update(
  id: string,
  data: {
    status?: string;
    lastIndexedAt?: Date | null;
  }
) {
  return prisma.repository.update({
    where: {
      id,
    },
    data,
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