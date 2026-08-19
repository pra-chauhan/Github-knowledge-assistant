import { splitContent } from "./repository-chunk.service";

const content = "A".repeat(9000);

const chunks = splitContent(content);

console.log("Total chunks:", chunks.length);

chunks.forEach((chunk, index) => {
  console.log(
    `Chunk ${index}: ${chunk.length} characters`
  );
});

console.log(
  "\nFirst chunk starts with:",
  chunks[0].slice(0, 20)
);

console.log(
  "Second chunk starts with:",
  chunks[1].slice(0, 20)
);