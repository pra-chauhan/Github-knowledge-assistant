-- CreateTable
CREATE TABLE "RepositoryFileChunk" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "startLine" INTEGER,
    "endLine" INTEGER,
    "tokenCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepositoryFileChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepositoryFileChunk_repositoryId_idx" ON "RepositoryFileChunk"("repositoryId");

-- CreateIndex
CREATE INDEX "RepositoryFileChunk_fileId_idx" ON "RepositoryFileChunk"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryFileChunk_fileId_chunkIndex_key" ON "RepositoryFileChunk"("fileId", "chunkIndex");

-- AddForeignKey
ALTER TABLE "RepositoryFileChunk" ADD CONSTRAINT "RepositoryFileChunk_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryFileChunk" ADD CONSTRAINT "RepositoryFileChunk_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "RepositoryFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
