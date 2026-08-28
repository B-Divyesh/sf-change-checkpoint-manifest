import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const output = join(
  fileURLToPath(new URL("..", import.meta.url)),
  "..",
  "dist",
  "site",
);
const shell = readFileSync(join(output, "index.html"));

for (const route of ["demo", "privacy", "terms"]) {
  const directory = join(output, route);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), shell);
}
