import { parseGitHubUrl } from "./github-url.util";

const validUrls = [
  "https://github.com/facebook/react",
  "https://github.com/facebook/react.git",
  "https://github.com/microsoft/vscode",
];

const invalidUrls = [
  "https://google.com",
  "https://github.com",
  "https://github.com/facebook",
  "facebook/react",
];

console.log("=== VALID URL TESTS ===");

for (const url of validUrls) {
  try {
    const result = parseGitHubUrl(url);

    console.log(`PASS: ${url}`);
    console.log(result);
  } catch (error) {
    console.error(`FAIL: ${url}`);
    console.error(error);
  }
}

console.log("\n=== INVALID URL TESTS ===");

for (const url of invalidUrls) {
  try {
    parseGitHubUrl(url);

    console.error(`FAIL: ${url} should have been rejected`);
  } catch (error) {
    console.log(`PASS: ${url} was rejected`);
    console.log((error as Error).message);
  }
}