import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const claims = JSON.parse(readFileSync(".factory/claims.json", "utf8"));
const browserTests = readFileSync("tests/claims.spec.js", "utf8");
const publicClaims = JSON.parse(
  readFileSync(".factory/public-claims.json", "utf8"),
);
const brief = JSON.parse(readFileSync(".factory/brief.json", "utf8"));

test("every listed visitor claim has one executable claim tag", () => {
  const ids = claims.map((claim) => claim.id);
  assert.equal(new Set(ids).size, ids.length, "claim IDs must be unique");

  for (const claim of claims) {
    assert.match(
      claim.test,
      new RegExp(`@claim:${claim.id.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}`),
      `${claim.id} command filters its own tag`,
    );
    const tags = browserTests.match(
      new RegExp(`@claim:${claim.id.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}`, "g"),
    );
    assert.equal(tags?.length, 1, `${claim.id} must have exactly one test tag`);
  }
});

test("every public reliance-copy source is mapped to the claims inventory", () => {
  const ids = new Set(claims.map((claim) => claim.id));
  assert.equal(publicClaims.version, 2);
  const mappedIds = new Set();
  const mappedSentences = new Set();
  for (const statement of publicClaims.statements) {
    assert.equal(typeof statement.claim, "string", "each statement maps to exactly one claim ID");
    assert.ok(ids.has(statement.claim), `${statement.source} references unknown claim ${statement.claim}`);
    const source = readFileSync(statement.source, "utf8").replace(/\s+/g, " ");
    const text = statement.text.replace(/\s+/g, " ");
    assert.ok(source.includes(text), `${statement.source} is missing mapped sentence: ${text}`);
    const key = `${statement.source}\0${text}`;
    assert.ok(!mappedSentences.has(key), `${statement.source} maps a sentence more than once: ${text}`);
    mappedSentences.add(key);
    mappedIds.add(statement.claim);
  }
  for (const id of ids) assert.ok(mappedIds.has(id), `claim ${id} has no sentence-level public mapping`);

  for (const [source, digest] of Object.entries(publicClaims.reviewed_sources)) {
    const copy = readFileSync(source);
    assert.equal(
      createHash("sha256").update(copy).digest("hex"),
      digest,
      `${source} changed; review every public sentence and update its claim mapping`,
    );
  }

  const readme = readFileSync("README.md", "utf8");
  for (const removed of [
    "To preview the site, use `npm run dev`.",
    "The site has `/demo`, `/privacy`, and `/terms` routes.",
    "The factory deploys `dist/site` as a static site.",
    "This repository does not manage DNS, billing, or other infrastructure.",
  ]) assert.ok(!readme.includes(removed), `review-4 unlisted claim remains: ${removed}`);
});

test("the researched opportunity brief has the required review fields", () => {
  for (const field of [
    "product",
    "artifact_class",
    "summary",
    "audience",
    "job_to_be_done",
    "problem",
    "scope",
    "success_signals",
    "non_goals",
  ])
    assert.ok(brief[field], `brief is missing ${field}`);
  assert.equal(brief.artifact_class, "cli");
  assert.ok(Array.isArray(brief.scope.must) && brief.scope.must.length > 0);
  assert.ok(Array.isArray(brief.scope.must_not) && brief.scope.must_not.length > 0);
});
