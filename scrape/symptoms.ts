import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const content = readdirSync("content");

for (const file of content) {
  const inside = readFileSync(`content/${file}`, "utf-8");
  let lines = inside.split("\n");
  lines = lines.slice(1).filter((line) => line && line !== "## Symptoms");
  let newLines = [];
  for (const line of lines) {
    if (line === "## Risk Factors") {
      break;
    }
    newLines.push(line);
  }
  lines = newLines;
  writeFileSync(`content_mod/${file}`, lines.join("\n").trim());
}
