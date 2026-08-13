export interface GitHubRepositoryPath {
  owner: string;
  name: string;
}

export function parseGitHubUrl(
  repositoryUrl: string
): GitHubRepositoryPath {
  let url: URL;

  try {
    url = new URL(repositoryUrl);
  } catch {
    throw new Error("Invalid repository URL");
  }

  if (url.hostname !== "github.com") {
    throw new Error("URL must be a GitHub repository URL");
  }

  const parts = url.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Invalid GitHub repository URL");
  }

  const owner = parts[0];
  const name = parts[1].replace(/\.git$/, "");

  if (!owner || !name) {
    throw new Error("Invalid GitHub repository URL");
  }

  return {
    owner,
    name,
  };
}