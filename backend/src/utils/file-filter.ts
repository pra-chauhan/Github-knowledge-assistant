import path from "path";
import type { GitHubTreeItem } from "../services/github.service";

const SOURCE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",

  ".py",

  ".java",
  ".kt",

  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".cc",
  ".cxx",

  ".cs",

  ".go",
  ".rs",
  ".rb",
  ".php",
  ".swift",
]);

const DOCUMENTATION_FILES = new Set([
  "README.md",
  "CONTRIBUTING.md",
  "ARCHITECTURE.md",
  "CHANGELOG.md",
]);

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".svn",
  ".hg",

  "node_modules",

  "dist",
  "build",
  "coverage",
  ".next",
  "out",

  "target",
  "vendor",

  ".cache",
  "cache",

  "tmp",
  "temp",

  "__pycache__",
  ".venv",
  "venv",
]);

const EXCLUDED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".bmp",

  ".mp4",
  ".mov",
  ".avi",
  ".mkv",
  ".webm",

  ".zip",
  ".tar",
  ".gz",
  ".rar",
  ".7z",

  ".exe",
  ".dll",
  ".so",
  ".dylib",

  ".pdf",
]);

function hasExcludedDirectory(filePath: string): boolean {
  const parts = filePath.split("/");

  return parts.some((part) =>
    EXCLUDED_DIRECTORIES.has(part)
  );
}

function isDocumentationFile(filePath: string): boolean {
  const fileName = path.posix.basename(filePath);

  if (DOCUMENTATION_FILES.has(fileName)) {
    return true;
  }

  return (
    filePath.startsWith("docs/") &&
    fileName.toLowerCase().endsWith(".md")
  );
}

function isSourceFile(filePath: string): boolean {
  const extension = path.posix.extname(filePath).toLowerCase();

  return SOURCE_EXTENSIONS.has(extension);
}

function hasExcludedExtension(filePath: string): boolean {
  const extension = path.posix.extname(filePath).toLowerCase();

  return EXCLUDED_EXTENSIONS.has(extension);
}

export function shouldIndexFile(filePath: string): boolean {
  if (!filePath) {
    return false;
  }

  if (hasExcludedDirectory(filePath)) {
    return false;
  }

  if (hasExcludedExtension(filePath)) {
    return false;
  }

  if (isDocumentationFile(filePath)) {
    return true;
  }

  if (isSourceFile(filePath)) {
    return true;
  }

  return false;
}

export function filterRepositoryFiles(
  files: GitHubTreeItem[]
): GitHubTreeItem[] {
  return files.filter((file) =>
    shouldIndexFile(file.path)
  );
}
