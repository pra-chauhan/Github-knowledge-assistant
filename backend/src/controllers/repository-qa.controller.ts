import { Request, Response } from "express";
import { repositoryQaService } from "../services/repository-qa.service";

export const repositoryQaController = {
  async ask(req: Request, res: Response) {
    try {
      const repositoryId = String(req.params.repositoryId);
      const { question, topK } = req.body;

      if (!repositoryId) {
        return res.status(400).json({
          error: "Repository ID is required",
        });
      }

      if (
        typeof question !== "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          error: "Question is required",
        });
      }

      const result =
        await repositoryQaService.ask({
          repositoryId,
          question,
          topK:
            typeof topK === "number"
              ? topK
              : 5,
        });

      return res.status(200).json(result);
    } catch (error) {
      console.error(
        "Repository QA failed:",
        error
      );

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to answer question",
      });
    }
  },
};