import type { Request, Response } from "express";
import { repositoryService } from "../services/repository.service";

export const createRepository = async (
  req: Request,
  res: Response
) => {
  try {
    const repository = await repositoryService.create(req.body);

    res.status(201).json({
      success: true,
      data: repository,
    });
  } catch (error) {
    console.error("Failed to create repository:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create repository",
    });
  }
};

export const getRepositories = async (
  _req: Request,
  res: Response
) => {
  try {
    const repositories = await repositoryService.findAll();

    res.json({
      success: true,
      data: repositories,
    });
  } catch (error) {
    console.error("Failed to fetch repositories:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch repositories",
    });
  }
};

export const getRepositoryById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const repository = await repositoryService.findById(req.params.id);

    if (!repository) {
      res.status(404).json({
        success: false,
        message: "Repository not found",
      });
      return;
    }

    res.json({
      success: true,
      data: repository,
    });
  } catch (error) {
    console.error("Failed to fetch repository:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch repository",
    });
  }
};

export const deleteRepository = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const repository = await repositoryService.delete(req.params.id);

    res.json({
      success: true,
      data: repository,
    });
  } catch (error) {
    console.error("Failed to delete repository:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete repository",
    });
  }
};