import { Router } from "express";
import { repositoryQaController } from "../controllers/repository-qa.controller";

const router = Router();

router.post(
  "/repositories/:repositoryId/ask",
  repositoryQaController.ask
);

export default router;