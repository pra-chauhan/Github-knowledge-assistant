import { shouldIndexFile } from "./repository-file-filter";

const testFiles = [
  "README.md",
  "packages/react/src/React.js",
  "src/components/Button.tsx",
  "node_modules/react/index.js",
  "dist/index.js",
  "package-lock.json",
  "src/assets/logo.png",
  "docs/guide.md",
];

for (const file of testFiles) {
  console.log({
    file,
    shouldIndex: shouldIndexFile(file),
  });
}