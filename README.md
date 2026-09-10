# GitHub Knowledge Assistant

> AI-powered repository intelligence tool that lets developers ask natural-language questions about a GitHub codebase.

## Overview

GitHub Knowledge Assistant imports a GitHub repository, indexes its source code, and uses **semantic search + RAG** to answer questions using relevant repository context.

### Core Flow

```text
GitHub Repository
      ↓
GitHub API
      ↓
File Filtering & Persistence
      ↓
Code Chunking
      ↓
Embeddings
      ↓
PostgreSQL + pgvector
      ↓
Semantic Search
      ↓
RAG Context
      ↓
Gemini
      ↓
Answer + Sources
```

The project is built primarily as a **backend-focused system** rather than a generic AI chatbot. It demonstrates GitHub API integration, data ingestion, incremental indexing, PostgreSQL data modeling, vector search, service-layer architecture, and LLM/RAG integration.

## Current Status

**Core pipeline: Working end-to-end ✅**

Implemented:

- GitHub repository import
- Repository tree/file fetching
- File filtering
- PostgreSQL persistence with Prisma
- SHA-based incremental indexing
- Code chunking
- Gemini embeddings
- PostgreSQL `pgvector` storage
- Semantic search
- RAG-based repository Q&A
- Gemini LLM integration
- Source-file references
- Next.js frontend
- Backend tests

### Current Development Focus

The application is functional. The remaining work is mainly **quality and optimization**:

- Improve repository-wide indexing/retrieval coverage
- Improve retrieval ranking for broad architecture questions
- Optimize pgvector search
- Reduce LLM response latency
- Add further production hardening

For the complete technical design, implementation details, API behavior, database schema, testing, limitations, and roadmap, see **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

---

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- Node.js
- Express
- TypeScript
- Octokit

**Database**
- PostgreSQL
- Supabase
- Prisma
- pgvector

**AI**
- Gemini LLM
- Gemini embeddings
- Semantic search
- Retrieval-Augmented Generation (RAG)

---
See `DOCUMENTATION.md` for the detailed architecture and service responsibilities.

---

## Getting Started

### Prerequisites

Install:

- Node.js
- npm
- Git
- A Supabase PostgreSQL database
- GitHub API credentials
- Gemini API credentials

No local PostgreSQL installation is required.

### 1. Clone

```bash
git clone <your-repository-url>
cd github-knowledge-assistant
```

### 2. Backend

```bash
cd backend
npm install
```

Create:

```text
backend/.env
```

Configure the environment variables required by the project, including:

```env
DATABASE_URL=your_supabase_database_url
DIRECT_URL=your_direct_database_url

GITHUB_TOKEN=your_github_token

GEMINI_API_KEY_1=your_gemini_key
GEMINI_API_KEY_2=your_optional_second_key

LLM_PROVIDER=gemini
EMBEDDING_PROVIDER=gemini
```

Never commit `.env` or API keys.

Generate Prisma Client:

```bash
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## Basic Usage

1. Import a GitHub repository.
2. Run repository ingestion/indexing.
3. Wait for files, chunks, and embeddings to be processed.
4. Open the repository Q&A interface.
5. Ask a question about the codebase.
6. The backend retrieves relevant code and generates an answer with source references.

Example:

```text
How is this repository structured?
```

or:

```text
Where is the Editor component implemented?
```

---

## API Quick Reference

```http
GET  /api/health
GET  /api/health/db

GET  /api/repositories
GET  /api/repositories/:id

POST /api/repositories/import
POST /api/repositories/:repositoryId/ask

DELETE /api/repositories/:id
```

Example Q&A request:

```json
{
  "question": "How does this repository handle state?",
  "topK": 5
}
```

---

## Security

Do not commit:

```text
.env
API keys
GitHub tokens
Database credentials
```

Before pushing:

```bash
git check-ignore -v backend/.env
git ls-files backend/.env
git status --short
```

---

## Documentation

For the full technical documentation:

**[DOCUMENTATION.md](./DOCUMENTATION.md)**

It covers the architecture, ingestion pipeline, database design, chunking, embeddings, pgvector search, RAG flow, LLM layer, testing, performance, current limitations, retrieval improvements, production roadmap, and interview/resume positioning.

---

## Author

**Pragya Chauhan**
Backend & Full-Stack Development | AI/RAG Systems
