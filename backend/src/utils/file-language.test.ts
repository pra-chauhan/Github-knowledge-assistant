import { detectLanguage } from "./file-language";

const files = [
  "src/index.ts",
  "src/App.tsx",
  "utils/helper.py",
  "package.json",
  "README.md",
  "styles/main.css",
  "Dockerfile",
  "unknown.xyz",
];

for (const file of files) {
  console.log(file, "=>", detectLanguage(file));
}