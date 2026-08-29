import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { join } from "node:path";

const root = process.cwd();
const configPath = join(root, "site", "public", "staticwebapp.config.json");
const config = JSON.parse(readFileSync(configPath, "utf8"));

test("Azure Static Web Apps config keeps rewrites and route status codes separate", () => {
  const invalidRoutes = (config.routes ?? []).filter(
    (route) => "rewrite" in route && "statusCode" in route,
  );
  assert.deepEqual(invalidRoutes, []);
  assert.equal(
    config.navigationFallback,
    undefined,
    "a navigation fallback would turn unknown routes into HTTP 200",
  );
});

test("Azure Static Web Apps uses pre-rendered routes and a response override for real 404 responses", () => {
  assert.deepEqual(config.responseOverrides?.["404"], { rewrite: "/404.html" });
  assert.ok(existsSync(join(root, "site", "public", "404.html")));

  const artifactPath = join(root, "dist", "site", "staticwebapp.config.json");
  assert.ok(
    existsSync(artifactPath),
    "the deployable site artifact includes the Static Web Apps configuration",
  );
  assert.deepEqual(JSON.parse(readFileSync(artifactPath, "utf8")), config);
  for (const route of ["demo", "privacy", "terms"]) {
    assert.ok(
      existsSync(join(root, "dist", "site", route, "index.html")),
      `${route} has a physical deep-link entry`,
    );
    assert.deepEqual(
      config.routes.find((item) => item.route === `/${route}`),
      { route: `/${route}`, rewrite: `/${route}/index.html` },
    );
  }
});

test("physical deep-link HTML has route-specific metadata before JavaScript runs", () => {
  const expected = {
    demo: ["Demo — Change Checkpoints", "A safe sample of a local Git checkpoint."],
    privacy: [
      "Privacy — Change Checkpoints",
      "How Change Checkpoints handles local files and sample data.",
    ],
    terms: ["Terms — Change Checkpoints", "Terms for Change Checkpoints."],
  };
  for (const [route, [title, description]] of Object.entries(expected)) {
    const html = readFileSync(join(root, "dist", "site", route, "index.html"), "utf8");
    assert.match(html, new RegExp(`<title>${title}</title>`));
    assert.match(html, new RegExp(`name="description" content="${description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    assert.match(
      html,
      new RegExp(`rel="canonical" href="https://change-checkpoint-manifest\\.sociobot\\.in/${route}"`),
    );
    assert.match(html, new RegExp(`property="og:title" content="${title}"`));
    assert.match(html, new RegExp(`name="twitter:title" content="${title}"`));
  }
});

test("hashed Vite assets receive a year-long immutable cache policy", () => {
  const assets = config.routes.find((route) => route.route === "/assets/*");
  assert.equal(
    assets?.headers?.["Cache-Control"],
    "public, max-age=31536000, immutable",
  );
  const builtAssets = readdirSync(join(root, "dist", "site", "assets"));
  assert.ok(
    builtAssets.some((name) =>
      /^demo-recording-[A-Za-z0-9_-]+\.svg$/.test(name),
    ),
    "the CSP-safe demo image is emitted as a hashed asset",
  );
  const builtJavaScript = builtAssets
    .filter((name) => name.endsWith(".js"))
    .map((name) =>
      readFileSync(join(root, "dist", "site", "assets", name), "utf8"),
    )
    .join("\n");
  assert.doesNotMatch(builtJavaScript, /data:image\//);
});
