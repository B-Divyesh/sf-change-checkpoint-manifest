import { execFileSync } from "node:child_process";

export function buildId() {
  const supplied = process.env.BUILD_ID
    ?? process.env.GITHUB_SHA
    ?? process.env.BUILD_SOURCEVERSION;
  const value = supplied
    ? supplied.trim()
    : execFileSync("git", ["rev-parse", "--short=12", "HEAD"], {
        encoding: "utf8",
      }).trim();
  if (!/^[A-Za-z0-9._-]{7,64}$/.test(value))
    throw new Error("build identifier must be 7–64 letters, numbers, dots, dashes, or underscores");
  return value.slice(0, 12);
}
