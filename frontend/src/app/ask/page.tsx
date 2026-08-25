"use client";

import { FormEvent, useState } from "react";

interface Source {
  file: string;
  chunkIndex: number;
  score: number;
}

interface QaResponse {
  answer: string;
  sources: Source[];
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

const DEFAULT_REPOSITORY_ID =
  "0d60b631-8a90-4324-a8f7-e6bebe302435";

export default function Home() {
  const [repositoryId, setRepositoryId] = useState(
    DEFAULT_REPOSITORY_ID
  );
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQuestion(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/repositories/${repositoryId}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
            topK: 5,
          }),
        }
      );

      const data: unknown = await response.json();

if (!response.ok) {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    throw new Error(data.error);
  }

  throw new Error("Failed to get answer");
}

if (
  typeof data !== "object" ||
  data === null ||
  !("answer" in data) ||
  typeof data.answer !== "string" ||
  !("sources" in data) ||
  !Array.isArray(data.sources)
) {
  throw new Error("Invalid response received from backend");
}

setAnswer(data.answer);

setSources(data.sources as Source[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <header className="mb-10">
          <p className="mb-2 text-sm font-medium text-blue-400">
            AI-Powered Repository Search
          </p>

          <h1 className="text-4xl font-bold tracking-tight">
            GitHub Knowledge Assistant
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Ask questions about your indexed GitHub
            repository and get answers backed by
            repository sources.
          </p>
        </header>

        {/* Repository */}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Repository ID
          </label>

          <input
            value={repositoryId}
            onChange={(event) =>
              setRepositoryId(event.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
          />

          <p className="mt-2 text-xs text-slate-500">
            Currently using your indexed React repository.
          </p>
        </section>

        {/* Question */}
        <form
          onSubmit={askQuestion}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Ask about the repository
          </label>

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            rows={5}
            placeholder="Example: How is this repository structured?"
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500"
          />

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Searching..." : "Ask Question"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Answer */}
        {answer && (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Answer
            </h2>

            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {answer}
            </div>
          </section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">
              Retrieved Sources
            </h2>

            <div className="space-y-3">
              {sources.map((source, index) => (
                <div
                  key={`${source.file}-${source.chunkIndex}-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-blue-400">
                        {source.file}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Chunk {source.chunkIndex}
                      </p>
                    </div>

                    <span className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-slate-400">
                      Score: {source.score.toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!answer && !loading && !error && (
          <div className="py-16 text-center">
            <p className="text-slate-500">
              Ask a question to search the repository.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}