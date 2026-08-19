export function detectLanguage(path: string): string | null {
  const fileName = path.split("/").pop()?.toLowerCase() ?? "";

  if (fileName === "dockerfile") return "Dockerfile";
  if (fileName === "makefile") return "Makefile";

  const extension = fileName.includes(".")
    ? fileName.split(".").pop()
    : "";

  switch (extension) {
    case "ts":
      return "TypeScript";

    case "tsx":
      return "TypeScript React";

    case "js":
      return "JavaScript";

    case "jsx":
      return "JavaScript React";

    case "py":
      return "Python";

    case "java":
      return "Java";

    case "cpp":
    case "cc":
    case "cxx":
      return "C++";

    case "c":
      return "C";

    case "cs":
      return "C#";

    case "go":
      return "Go";

    case "rs":
      return "Rust";

    case "php":
      return "PHP";

    case "rb":
      return "Ruby";

    case "swift":
      return "Swift";

    case "kt":
    case "kts":
      return "Kotlin";

    case "html":
      return "HTML";

    case "css":
      return "CSS";

    case "scss":
      return "SCSS";

    case "json":
      return "JSON";

    case "xml":
      return "XML";

    case "yaml":
    case "yml":
      return "YAML";

    case "md":
    case "mdx":
      return "Markdown";

    case "sql":
      return "SQL";

    case "sh":
    case "bash":
      return "Shell";

    default:
      return null;
  }
}