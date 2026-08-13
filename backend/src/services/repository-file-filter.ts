const IGNORED_DIRECTORIES = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  "coverage/",
  ".next/",
  "out/",
  "vendor/",
];

const IGNORED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".mp4",
  ".mp3",
  ".wav",
  ".zip",
  ".tar",
  ".gz",
  ".exe",
  ".dll",
  ".so",
  ".woff",
  ".woff2",
  ".ttf",
  ".lock",
];

export function shouldIndexFile(path: string): boolean {
  const normalizedPath = path.toLowerCase();

  if (
    IGNORED_DIRECTORIES.some((directory) =>
      normalizedPath.includes(directory)
    )
  ) {
    return false;
  }

  if (
    IGNORED_EXTENSIONS.some((extension) =>
      normalizedPath.endsWith(extension)
    )
  ) {
    return false;
  }

  return true;
}