import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildId } from "./build-id.mjs";

const output = join(
  fileURLToPath(new URL("..", import.meta.url)),
  "..",
  "dist",
  "site",
);
const shell = readFileSync(join(output, "index.html"), "utf8");
const identifier = buildId();

const notFoundPath = join(output, "404.html");
writeFileSync(
  notFoundPath,
  readFileSync(notFoundPath, "utf8").replaceAll("__BUILD_ID__", identifier),
);

const routes = {
  demo: {
    title: "Demo — Change Checkpoints",
    description: "A safe sample of a local Git checkpoint.",
  },
  privacy: {
    title: "Privacy — Change Checkpoints",
    description: "How Change Checkpoints handles local files and sample data.",
  },
  terms: {
    title: "Terms — Change Checkpoints",
    description: "Terms for Change Checkpoints.",
  },
};

function routeShell(route, values) {
  const canonical = `https://change-checkpoint-manifest.sociobot.in/${route}`;
  return shell
    .replace(/<title>[^<]*<\/title>/, `<title>${values.title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${values.description}" />`,
    )
    .replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${canonical}" />`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${values.title}" />`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${values.description}" />`,
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${values.title}" />`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${values.description}" />`,
    );
}

for (const [route, values] of Object.entries(routes)) {
  const directory = join(output, route);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), routeShell(route, values));
}
