export interface GitHubRepository {
  owner: string;
  name: string;
  fullName: string;
  githubUrl: string;
  defaultBranch: string;
  description: string | null;
  language: string | null;
  stars: number;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export interface GitHubFileContent {
  path: string;
  sha: string;
  size: number;
  content: string;
  encoding: string;
}

const MAX_FILE_SIZE = 1024 * 1024;

export const githubService = {
  async getRepository(
    owner: string,
    name: string
  ): Promise<GitHubRepository> {
    const { Octokit } = await import("octokit");

    const octokit = new Octokit();

    const response = await octokit.rest.repos.get({
      owner,
      repo: name,
    });

    const repository = response.data;

    return {
      owner: repository.owner.login,
      name: repository.name,
      fullName: repository.full_name,
      githubUrl: repository.html_url,
      defaultBranch: repository.default_branch,
      description: repository.description,
      language: repository.language,
      stars: repository.stargazers_count,
    };
  },

  async getRepositoryTree(
    owner: string,
    name: string,
    branch: string
  ): Promise<GitHubTreeItem[]> {
    const { Octokit } = await import("octokit");

    const octokit = new Octokit();

    const response = await octokit.rest.git.getTree({
      owner,
      repo: name,
      tree_sha: branch,
      recursive: "true",
    });

    return response.data.tree
      .filter(
        (item): item is GitHubTreeItem =>
          item.type === "blob" &&
          typeof item.path === "string" &&
          typeof item.sha === "string" &&
          typeof item.url === "string"
      )
      .map((item) => ({
        path: item.path,
        mode: item.mode ?? "",
        type: "blob",
        sha: item.sha,
        size: item.size,
        url: item.url,
      }));
  },

  async getFileContent(
    owner: string,
    name: string,
    path: string
  ): Promise<GitHubFileContent | null> {
    const { Octokit } = await import("octokit");

    const octokit = new Octokit();

    const response = await octokit.rest.repos.getContent({
      owner,
      repo: name,
      path,
    });

    const data = response.data;

    if (Array.isArray(data)) {
      throw new Error(
        `Expected a file but received a directory: ${path}`
      );
    }

    if (data.type !== "file") {
      throw new Error(
        `Expected a file but received type "${data.type}": ${path}`
      );
    }

    if (data.size > MAX_FILE_SIZE) {
      console.warn(
        `Skipping large file: ${path} (${data.size} bytes)`
      );

      return null;
    }

    if (!data.content) {
      console.warn(
        `GitHub returned no content for file: ${path}`
      );

      return null;
    }

    const content = Buffer.from(
      data.content,
      "base64"
    ).toString("utf-8");

    return {
      path: data.path,
      sha: data.sha,
      size: data.size,
      content,
      encoding: data.encoding,
    };
  },

  async getBlobContent(
    owner: string,
    name: string,
    sha: string
  ): Promise<GitHubFileContent> {
    const { Octokit } = await import("octokit");

    const octokit = new Octokit();

    const response = await octokit.rest.git.getBlob({
      owner,
      repo: name,
      file_sha: sha,
    });

    const data = response.data;

    const content = Buffer.from(
      data.content,
      "base64"
    ).toString("utf-8");

    return {
      path: "",
      sha,
      size: data.size ?? 0,
      content,
      encoding: data.encoding,
    };
  },
};