CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "RepositoryFileChunk"
ADD COLUMN "embedding" vector(1536);