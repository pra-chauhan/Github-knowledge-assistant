# GitHub Knowledge Assistant — Technical Documentation

## 1. Overview

GitHub Knowledge Assistant is a full-stack repository intelligence system that converts a GitHub repository into a searchable knowledge base and uses retrieval-augmented generation (RAG) to answer questions about the codebase.

The system combines:

- GitHub repository APIs
- Node.js + Express
- TypeScript
- Prisma
- PostgreSQL/Supabase
- PostgreSQL `pgvector`
- Embeddings
- Semantic similarity search
- Gemini LLM
- Next.js/React frontend

The primary engineering focus is the backend ingestion, persistence, indexing, retrieval and orchestration pipeline.

---

# 2. Problem Statement

Understanding an unfamiliar software repository can be time-consuming.

A developer may need to:

1. Find the repository structure.
2. Locate relevant directories.
3. Search for functions/classes.
4. Follow imports and references.
5. Read configuration files.
6. Understand how multiple modules interact.
7. Identify where a feature is implemented.

Traditional text search is useful, but it depends heavily on knowing the exact terminology used in the code.

GitHub Knowledge Assistant attempts to provide a higher-level interface:

> Ask a question about the repository in natural language and receive an answer grounded in retrieved repository code.

---

# 3. System Goals

The project was designed around five main goals:

### Goal 1 — Repository ingestion

Fetch repository metadata, tree information and source files from GitHub.

### Goal 2 — Persistent indexing

Store repository data in a structured database instead of processing everything only in memory.

### Goal 3 — Semantic retrieval

Represent code chunks as embeddings and retrieve semantically relevant code for a natural-language question.

### Goal 4 — Grounded generation

Provide retrieved repository context to an LLM so the answer is based on the indexed repository rather than general model knowledge.

### Goal 5 — Backend-first architecture

Keep GitHub integration, data processing, database operations, retrieval and LLM orchestration separated into maintainable services.

---

# 4. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      Frontend        │
                         │   Next.js + React     │
                         └──────────┬───────────┘
                                    │
                              REST / JSON
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       Express        │
                         │       Backend        │
                         └──────────┬───────────┘
                                    │
          ┌─────────────────────────┼──────────────────────────┐
          │                         │                          │
          ▼                         ▼                          ▼
 ┌────────────────┐        ┌────────────────┐         ┌────────────────┐
 │ GitHub Service │        │ Repository DB  │         │  LLM Service   │
 │    Octokit     │        │ Prisma/Postgres│         │     Gemini     │
 └───────┬────────┘        └───────┬────────┘         └────────────────┘
         │                         │
         ▼                         │
   Repository Tree                 │
         │                         │
         ▼                         │
   File Filtering                  │
         │                         │
         ▼                         │
   File Persistence                │
         │                         │
         ▼                         │
      Chunking                     │
         │                         │
         ▼                         │
     Embeddings ───────────────────┘
         │
         ▼
  pgvector Similarity Search
         │
         ▼
   Relevant Code Chunks
         │
         ▼
    RAG Context
         │
         ▼
      Gemini
         │
         ▼
 Answer + Source Metadata
```

---

# 5. Repository Structure

The repository is organized as a frontend/backend application.

```text
github-knowledge-assistant/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── repository.controller.ts
│   │   │   └── repository-qa.controller.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── repository.routes.ts
│   │   │   └── repository-qa.routes.ts
│   │   │
│   │   ├── services/
│   │   │   ├── github.service.ts
│   │   │   ├── repository.service.ts
│   │   │   ├── repository-file.service.ts
│   │   │   ├── repository-chunk.service.ts
│   │   │   ├── repository-ingestion.service.ts
│   │   │   ├── repository-embedding.service.ts
│   │   │   ├── repository-search.service.ts
│   │   │   ├── repository-qa.service.ts
│   │   │   ├── embedding.service.ts
│   │   │   └── llm/
│   │   │       ├── llm.types.ts
│   │   │       ├── llm-router.service.ts
│   │   │       └── gemini.provider.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── file-filter.ts
│   │   │   ├── file-language.ts
│   │   │   └── github-url.util.ts
│   │   │
│   │   └── app.ts
│   │
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx
│   │       ├── ask/
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       └── globals.css
│   │
│   └── package.json
│
└── README.md
```

---

# 6. Backend Layer

The backend follows a controller → service → data/provider style architecture.

```text
HTTP Request
     ↓
Controller
     ↓
Service
     ↓
Database / GitHub / Embedding / LLM
     ↓
Service Result
     ↓
Controller Response
```

This keeps HTTP handling separate from application logic.

---

# 7. Express Application

The Express application:

- initializes environment configuration
- enables CORS
- parses JSON requests
- mounts repository routes
- mounts repository Q&A routes
- exposes health checks

Main entry point:

```text
backend/src/app.ts
```

Current API port:

```text
5000
```

---

# 8. API Endpoints

## 8.1 API Health

```http
GET /api/health
```

Example response:

```json
{
  "status": "ok",
  "service": "github-knowledge-assistant-api"
}
```

---

## 8.2 Database Health

```http
GET /api/health/db
```

This checks whether Prisma can successfully communicate with PostgreSQL.

Example response:

```json
{
  "status": "ok",
  "database": "connected",
  "repositories": 1
}
```

---

## 8.3 Create Repository

```http
POST /api/repositories
```

Creates a repository record.

---

## 8.4 Import Repository

```http
POST /api/repositories/import
```

Request:

```json
{
  "url": "https://github.com/facebook/react"
}
```

The controller:

1. Validates the URL.
2. Parses owner and repository name.
3. Calls GitHub.
4. Retrieves repository metadata.
5. Persists the repository.

---

## 8.5 List Repositories

```http
GET /api/repositories
```

---

## 8.6 Get Repository

```http
GET /api/repositories/:id
```

---

## 8.7 Delete Repository

```http
DELETE /api/repositories/:id
```

Repository relationships use cascading deletion for associated indexed data.

---

## 8.8 Ask Repository

```http
POST /api/repositories/:repositoryId/ask
```

Request:

```json
{
  "question": "How is this repository structured?",
  "topK": 5
}
```

Response conceptually contains:

```json
{
  "answer": "Repository-grounded answer...",
  "sources": [
    {
      "file": "path/to/file.ts",
      "chunkIndex": 0,
      "score": 0.57
    }
  ]
}
```

---

# 9. GitHub Integration

File:

```text
backend/src/services/github.service.ts
```

The service uses Octokit to communicate with GitHub.

## Responsibilities

### Repository metadata

Retrieves:

- owner
- name
- full name
- GitHub URL
- default branch
- description
- language
- stars

### Repository tree

Uses GitHub's recursive tree API to identify repository files.

The system works with blob entries rather than directories.

### File content

The system can retrieve file content through GitHub APIs.

For ingestion, the Git blob SHA is used to retrieve content efficiently.

---

# 10. File Filtering

File:

```text
backend/src/services/repository-file-filter.ts
```

The ingestion pipeline should not index every file in a repository.

Typical ignored directories include:

```text
node_modules/
.git/
dist/
build/
coverage/
.next/
out/
vendor/
```

Typical ignored file types include:

```text
.png
.jpg
.jpeg
.gif
.webp
.svg
.ico
.mp4
.mp3
.wav
.zip
.tar
.gz
.exe
.dll
.so
.woff
.woff2
.ttf
.lock
```

This reduces:

- unnecessary storage
- embedding cost
- indexing time
- irrelevant retrieval results

---

# 11. Repository Persistence

File:

```text
backend/src/services/repository.service.ts
```

Repository metadata is stored in PostgreSQL.

A repository is uniquely identified by:

```text
fullName
```

The service avoids creating duplicate repository records when the same GitHub repository has already been imported.

---

# 12. Database Schema

The main models are:

```text
Repository
RepositoryFile
RepositoryFileChunk
```

## Repository

```text
Repository
 ├── id
 ├── owner
 ├── name
 ├── fullName
 ├── githubUrl
 ├── defaultBranch
 ├── description
 ├── language
 ├── stars
 ├── status
 ├── lastIndexedAt
 ├── createdAt
 └── updatedAt
```

## RepositoryFile

```text
RepositoryFile
 ├── id
 ├── repositoryId
 ├── path
 ├── sha
 ├── size
 ├── language
 ├── content
 ├── createdAt
 └── updatedAt
```

## RepositoryFileChunk

```text
RepositoryFileChunk
 ├── id
 ├── repositoryId
 ├── fileId
 ├── chunkIndex
 ├── content
 ├── startLine
 ├── endLine
 ├── tokenCount
 ├── embedding
 ├── createdAt
 └── updatedAt
```

The embedding field is:

```text
vector(1536)
```

because Prisma does not directly model the PostgreSQL vector type in the schema used by the project, so vector persistence/search uses raw SQL where required.

---

# 13. Incremental Indexing

Incremental indexing is one of the important backend design decisions.

Each indexed GitHub file stores its SHA.

During a later indexing operation:

```text
GitHub SHA
     │
     ▼
Existing file?
     │
 ┌───┴────┐
 │        │
Same    Different
 │        │
 ▼        ▼
Skip    Reprocess
```

### Why this matters

Without SHA comparison:

```text
Every indexing run
→ download every file
→ chunk every file
→ embed every chunk
```

With SHA comparison:

```text
Unchanged file
→ skip

Changed file
→ reprocess
```

This becomes increasingly important as repositories grow.

---

# 14. Chunking

File:

```text
backend/src/services/repository-chunk.service.ts
```

The chunking layer converts a file into smaller pieces before embedding.

Current development defaults are approximately:

```text
Chunk size: 4000 characters
Overlap:    400 characters
```

The algorithm moves through the file using an overlapping sliding window.

Conceptually:

```text
┌──────────────────────────────┐
│ Chunk 0                      │
└──────────────────────────────┘
                    ┌──────────────────────────────┐
                    │ Chunk 1                      │
                    └──────────────────────────────┘
                                      ┌──────────────┐
                                      │ Chunk 2      │
                                      └──────────────┘
```

The overlap preserves some surrounding context between adjacent chunks.

---

# 15. Embedding Pipeline

The embedding layer converts text into a numerical vector representation.

```text
Code Chunk
    ↓
Embedding Model
    ↓
1536-dimensional vector
    ↓
PostgreSQL pgvector
```

The project has used provider abstraction around embedding generation so the application can switch between development and API-backed embedding strategies.

The working production-oriented development path uses Gemini embeddings.

The database vector dimension is:

```text
1536
```

---

# 16. Embedding Persistence

Embeddings are stored separately from normal Prisma scalar fields because PostgreSQL's vector type is represented as:

```text
Unsupported("vector(1536)")
```

The application uses parameterized raw SQL to write vector values into PostgreSQL.

Conceptually:

```sql
UPDATE "RepositoryFileChunk"
SET "embedding" = '<vector>'::vector
WHERE "id" = '<chunk-id>';
```

This preserves Prisma for normal relational operations while using PostgreSQL's vector capability directly.

---

# 17. Semantic Search

File:

```text
backend/src/services/repository-search.service.ts
```

The search flow is:

```text
User Question
     ↓
Generate Query Embedding
     ↓
Compare Against Stored Vectors
     ↓
Order By Vector Distance
     ↓
Return Top K Chunks
```

The project uses PostgreSQL vector distance operators to compare the query embedding with stored embeddings.

A similarity-style score is derived from vector distance so that higher scores represent more similar results.

Each result contains:

```text
chunkId
fileId
path
chunkIndex
content
score
```

---

# 18. RAG Pipeline

File:

```text
backend/src/services/repository-qa.service.ts
```

The RAG layer connects semantic retrieval to the LLM.

## Step 1 — Validate question

The backend rejects an empty question.

## Step 2 — Retrieve relevant chunks

The repository search service performs semantic retrieval.

## Step 3 — Build context

Retrieved results are converted into structured context:

```text
SOURCE 1
File: src/example.ts
Chunk: 0

<retrieved code>

--------------------

SOURCE 2
File: src/another.ts
Chunk: 1

<retrieved code>
```

## Step 4 — Send context to LLM

The LLM receives:

```text
Question
+
Repository Context
```

## Step 5 — Return answer and sources

The API returns the generated answer together with source metadata.

---

# 19. LLM Architecture

The project separates the LLM interface from the Q&A service.

Conceptually:

```text
Repository QA
     ↓
LLM Router
     ↓
Provider Interface
     ↓
Gemini Provider
```

The abstraction is based on a common provider contract:

```text
generateAnswer({
    question,
    context
})
```

This prevents repository Q&A logic from being tightly coupled to a particular LLM SDK.

### Current provider

```text
Gemini
```

### Planned provider strategy

The architecture can be extended to support:

```text
Gemini
   ↓
Fallback
   ↓
OpenAI
```

without rewriting the RAG retrieval layer.

---

# 20. Prompting Strategy

The LLM is instructed to treat retrieved repository context as the authoritative source for repository-specific answers.

The intended behavior is:

- use the supplied repository context
- explain technical concepts clearly
- prefer concrete file/function/class references
- avoid inventing repository details
- distinguish missing context from known information

This is important because the assistant should behave as a repository knowledge system rather than a generic programming chatbot.

---

# 21. Frontend

The frontend uses:

- Next.js
- React
- TypeScript
- Tailwind CSS
- App Router

The primary interaction is the repository Q&A interface.

The frontend communicates with the Express backend through HTTP requests.

Conceptually:

```text
User Question
      ↓
Next.js UI
      ↓
POST /api/repositories/:id/ask
      ↓
Express
      ↓
RAG Pipeline
      ↓
JSON Response
      ↓
Answer + Sources
      ↓
UI
```

---

# 22. Testing Strategy

The backend contains tests around individual components and pipeline stages.

Representative areas include:

```text
GitHub URL parsing
GitHub repository retrieval
GitHub tree retrieval
GitHub file/blob retrieval
File filtering
Language detection
Repository persistence
File persistence
Chunking
Chunk persistence
Embedding persistence
Repository ingestion
Semantic search
Repository Q&A
```

The purpose is to verify the pipeline incrementally rather than relying only on a final end-to-end test.

---

# 23. Development Validation

The project has been tested using a real GitHub repository rather than only synthetic test data.

The development workflow has included:

```text
Import repository
      ↓
Fetch repository tree
      ↓
Persist repository/files
      ↓
Generate chunks
      ↓
Generate/store embeddings
      ↓
Run semantic search
      ↓
Run repository Q&A
      ↓
Verify frontend response
```

The complete flow is currently operational.

---

# 24. Observability and Performance

Timing logs were added during development to identify where request time is being spent.

A representative end-to-end request showed approximately:

```text
Query embedding       ~1.1 seconds
Vector search          ~1.6 seconds
Gemini generation     ~10.2 seconds
------------------------------------
Total                  ~13 seconds
```

These numbers are development observations rather than production benchmarks.

The largest current latency source is LLM generation.

Vector search latency is also being investigated because the dataset is still relatively small and therefore the observed database time should be optimized before scaling the number of indexed chunks significantly.

---

# 25. Current Data/Indexing State

During development, the tested repository reached a state with approximately:

```text
Repositories:       1
Persisted files:  126
Chunks:             38
Embedded chunks:    38
```

This diagnostic result is important.

It confirms that:

- repository persistence works
- file persistence works
- chunk persistence works
- embedding persistence works
- semantic retrieval works

However, it also exposed the next major engineering task:

> **File persistence coverage is ahead of chunk/index coverage.**

Therefore, repository-wide questions can still miss important files.

This is why retrieval coverage is currently considered the main remaining quality task.

---

# 26. Current Known Limitation: Retrieval Coverage

The current system can successfully answer questions when the relevant code is present among retrieved chunks.

However, broad repository questions may produce incomplete answers if the relevant part of the repository has not yet been chunked/embedded or if semantic ranking does not surface it.

For example:

```text
Repository
├── compiler/
├── packages/
├── apps/
├── docs/
├── README.md
└── configuration
```

A repository-wide question should ideally retrieve evidence from the appropriate combination of these areas.

The current implementation can sometimes over-represent one subdirectory because semantic retrieval is operating over the currently indexed chunks.

---

# 27. Retrieval Improvement Plan

The next engineering stage is focused on retrieval quality.

## 27.1 Complete indexing coverage

Ensure eligible persisted files consistently produce chunks.

Validate:

```text
eligible file count
      ↓
persisted file count
      ↓
chunk count
      ↓
embedded chunk count
```

These numbers should be observable and explainable.

---

## 27.2 Improve chunk metadata

Future chunks should preserve more structural information where possible:

```text
file path
language
start line
end line
symbol/function/class information
directory
```

This can improve retrieval and source presentation.

---

## 27.3 Hybrid Retrieval

Combine:

```text
Vector similarity
+
Keyword/path matching
```

This is useful for exact identifiers such as:

```text
Editor
useState
ReactFiber
package.json
webpack.config
README
```

Semantic search is strong for meaning; lexical search is strong for exact code identifiers.

---

## 27.4 Path-aware Ranking

Repository paths contain valuable structural information.

For example:

```text
src/components/
src/services/
src/hooks/
src/config/
tests/
docs/
```

The retrieval system can use path signals to improve ranking for architecture and location questions.

---

## 27.5 Reranking

A future pipeline can retrieve a larger candidate set and rerank it:

```text
Vector Search
    ↓
Top 20 candidates
    ↓
Reranker
    ↓
Top 5 context chunks
    ↓
LLM
```

This can improve precision without forcing the LLM to process excessive context.

---

# 28. Vector Search Optimization Plan

Current search is functional but should be optimized before indexing thousands of chunks.

Planned improvements:

### Candidate limiting

Retrieve only a controlled number of candidates from PostgreSQL.

### pgvector index

Evaluate an appropriate vector index such as HNSW after the indexed dataset becomes large enough for it to provide measurable benefit.

### Query plan analysis

Use PostgreSQL query planning tools to identify unnecessary scans or expensive operations.

### Retrieval benchmarks

Create a small evaluation dataset:

```text
Question
Expected file(s)
Expected concept
Retrieved file(s)
Score
Pass/Fail
```

This turns retrieval improvement into a measurable engineering problem.

---

# 29. LLM Performance Plan

LLM generation is currently the largest contributor to response time.

Planned improvements:

### Smaller context

Only send the most useful chunks.

### Prompt optimization

Avoid unnecessary instructions and duplicated context.

### Faster model configuration

Use an appropriate low-latency model when answer quality remains acceptable.

### Streaming

Stream generated tokens to the frontend rather than waiting for the entire answer.

### Caching

Cache repeated repository questions where appropriate.

Potential cache key:

```text
repositoryId + normalizedQuestion + indexVersion
```

This prevents stale answers after repository updates.

---

# 30. Ingestion Scalability

The ingestion service already uses batching/concurrency concepts and incremental SHA checks.

The current development workflow intentionally limits the number of files processed per run while the pipeline is being validated.

Before production, ingestion should become a proper background job.

Recommended architecture:

```text
POST /repositories/import
        ↓
Create ingestion job
        ↓
Return job ID
        ↓
Background worker
        ↓
Fetch tree
        ↓
Process files
        ↓
Chunk
        ↓
Embed
        ↓
Update progress
        ↓
INDEXED
```

This prevents a long-running indexing process from blocking an HTTP request.

---

# 31. Production Hardening Roadmap

## Authentication

Add authentication before exposing repository data to multiple users.

Potential future flow:

```text
User
 ↓
OAuth
 ↓
Session
 ↓
Authorized repositories
```

## Validation

Add strict validation for:

- repository URLs
- repository IDs
- question length
- `topK`
- request body fields

## Rate Limiting

Protect:

- GitHub API calls
- embedding calls
- LLM calls
- ingestion endpoints

## Retry Handling

Retry transient failures for:

- GitHub API
- embeddings
- LLM provider
- database operations where appropriate

## Logging

Move from ad-hoc console logs toward structured logs containing:

```text
requestId
repositoryId
operation
duration
status
error
```

## Security

Never expose:

- GitHub tokens
- Gemini keys
- database credentials
- provider secrets

Secrets belong in environment variables or a deployment secret manager.

---

# 32. Environment Configuration

The backend uses environment variables.

Typical variables include:

```env
PORT=5000

DATABASE_URL=...
DIRECT_URL=...

GITHUB_TOKEN=...

GEMINI_API_KEY_1=...
GEMINI_API_KEY_2=...

LLM_PROVIDER=gemini
EMBEDDING_PROVIDER=gemini
```

The exact set may evolve as provider routing and deployment are completed.

`.env` must remain untracked.

Recommended checks before pushing:

```bash
git check-ignore -v backend/.env
git ls-files backend/.env
git status --short
```

The second command should not return the environment file.

---

# 33. Prisma and PostgreSQL

The project uses Prisma 7.

The Prisma schema defines relational entities, while PostgreSQL-specific vector functionality is handled with raw SQL where necessary.

The database is hosted through Supabase PostgreSQL.

This approach was selected to avoid maintaining a local PostgreSQL server during development while still using a real PostgreSQL database.

---

# 34. Why Supabase PostgreSQL?

The project requires:

```text
Relational data
+
Vector data
```

Supabase provides managed PostgreSQL infrastructure, while pgvector allows embeddings to remain in the same database.

This avoids introducing a separate vector database for the current project stage.

---

# 35. Error Handling

The backend controllers use `try/catch` around asynchronous operations.

Errors are:

1. logged server-side
2. converted into HTTP responses
3. returned without exposing sensitive configuration

For example, invalid repository URLs are handled as client errors rather than allowing the application to crash.

Further work is planned to introduce centralized error middleware and more consistent error codes.

---

# 36. Data Lifecycle

For one repository:

```text
Import
  ↓
Repository metadata
  ↓
Repository tree
  ↓
Eligible files
  ↓
Stored files
  ↓
Chunks
  ↓
Embeddings
  ↓
Searchable repository
```

If a repository is deleted:

```text
Repository
   ↓ cascade
RepositoryFile
   ↓ cascade
RepositoryFileChunk
```

This prevents orphaned indexed data.

---

# 37. Security Considerations

The current project is primarily a development-stage application.

Before production:

- authentication must be added
- repository ownership/access must be enforced
- private GitHub repositories require secure GitHub authorization
- API keys must remain server-side
- user input must be validated
- rate limits should be added
- LLM prompts should not expose internal secrets
- repository content should be treated as untrusted input

The RAG system should also guard against prompt injection contained inside repository files.

---

# 38. Testing Philosophy

Testing is organized around pipeline boundaries.

Instead of only testing:

```text
Question → Final Answer
```

the project also tests:

```text
GitHub URL → Parsed Repository
GitHub → Tree
GitHub → File
File → Filter Decision
File → Database
File → Chunks
Chunk → Embedding
Embedding → Vector Database
Question → Search Results
Search Results → RAG Context
RAG Context → Answer
```

This makes failures easier to isolate.

---

# 39. Recommended Future Evaluation Dataset

A useful retrieval benchmark should contain questions from several categories.

### Exact code lookup

```text
Where is the Editor component defined?
```

### Conceptual

```text
How does this project handle state?
```

### Architecture

```text
How is the repository structured?
```

### Configuration

```text
Where is the build configuration defined?
```

### Dependency

```text
Where is package X used?
```

### Cross-file reasoning

```text
How does a request move from the API layer to the database?
```

For each question, record expected files and compare them with retrieved results.

---

# 40. Current Completion Assessment

The project can currently be described as:

```text
                    STATUS
────────────────────────────────────────
Repository import        ✅ Working
GitHub API integration   ✅ Working
File filtering           ✅ Working
File persistence         ✅ Working
Chunking                 ✅ Working
Embedding generation     ✅ Working
Embedding persistence    ✅ Working
pgvector search          ✅ Working
RAG context creation     ✅ Working
Gemini generation        ✅ Working
Source metadata          ✅ Working
Frontend integration     ✅ Working
Automated tests          ✅ Present
────────────────────────────────────────
Retrieval coverage      🔄 Improving
Retrieval ranking       🔄 Improving
Vector optimization     🔄 Planned/Improving
LLM latency             🔄 Optimization needed
Production hardening    🔄 Planned
Deployment               ⏳ Later
Authentication           ⏳ Later
```

### Important conclusion

**The core product is ready as a working development system.**

The remaining work is not about proving that the pipeline works. That has already been achieved.

The current focus is:

> **Make the retrieval more complete and accurate, optimize search/LLM performance, and then harden the backend for production.**

---

# 41. Suggested Next Development Order

The recommended order is:

```text
1. Fix/complete indexing coverage
          ↓
2. Verify every eligible file → chunks → embeddings
          ↓
3. Improve retrieval quality
          ↓
4. Add path/keyword-aware retrieval
          ↓
5. Optimize pgvector query
          ↓
6. Reduce LLM latency
          ↓
7. Add ingestion job/progress handling
          ↓
8. Improve validation/error handling/logging
          ↓
9. Authentication/security
          ↓
10. Deployment
```

This order avoids polishing deployment while the core retrieval quality is still changing.

---

# 42. Interview Explanation

For a backend-focused interview, describe the project as a **repository ingestion and retrieval backend with an RAG layer**, rather than simply calling it an AI chatbot.

A concise technical explanation:

> "I built a Node.js and Express backend that imports GitHub repositories through Octokit, retrieves the repository tree, filters and persists source files using Prisma/PostgreSQL, incrementally detects changed files using GitHub SHAs, chunks the code and generates embeddings. The embeddings are stored in PostgreSQL using pgvector, and repository questions are converted into embeddings for semantic retrieval. The retrieved code is then assembled into a RAG context and passed through an LLM provider abstraction to Gemini, with source files returned alongside the answer. The core pipeline is working end-to-end, and I'm currently improving repository-wide retrieval coverage and performance."

---

# 43. Resume Positioning

The strongest positioning is:

### GitHub Knowledge Assistant
**Node.js | Express | TypeScript | Prisma | PostgreSQL | pgvector | GitHub API | RAG | Gemini**

> Built a repository-aware backend that ingests GitHub codebases, performs SHA-based incremental indexing, chunks and embeds source code, stores vectors in PostgreSQL/pgvector, performs semantic retrieval, and generates source-grounded repository answers through a modular LLM/RAG pipeline.

This emphasizes backend engineering first and AI second.

---

# 44. Final Project State

The project has progressed from a basic idea into a functioning backend system.

The major engineering milestones completed are:

```text
Idea
 ↓
Backend foundation
 ↓
Database
 ↓
GitHub integration
 ↓
Repository ingestion
 ↓
File persistence
 ↓
Chunking
 ↓
Embeddings
 ↓
Vector storage
 ↓
Semantic retrieval
 ↓
RAG
 ↓
Gemini integration
 ↓
Frontend integration
 ↓
End-to-end testing
```

The system is now at the **optimization and quality stage**.

The next milestone is not another major architectural rewrite.

It is to make the existing pipeline:

```text
More complete
More accurate
Faster
More observable
More production-ready
```

That is the current direction of the project.

