import { Router } from "express";

import {
  createRepository,
  getRepositories,
  getRepositoryById,
  deleteRepository,
} from "../controllers/repository.controller";

const router = Router();

router.post("/", createRepository);
router.get("/", getRepositories);
router.get("/:id", getRepositoryById);
router.delete("/:id", deleteRepository);

export default router;