import {
  filterRepositoryFiles,
  shouldIndexFile,
} from "./file-filter";

const testPaths = [
  "src/index.ts",
  "src/components/App.tsx",
  "src/utils/helper.js",
  "README.md",
  "docs/architecture.md",

  "node_modules/react/index.js",
  "dist/index.js",
  "build/app.js",

  "image.png",
  "video.mp4",
  "archive.zip",

  "src/generated/file.ts",
];

console.log("Individual file tests:\n");

for (const filePath of testPaths) {
  console.log(
    `${shouldIndexFile(filePath) ? "✓" : "✗"} ${filePath}`
  );
}