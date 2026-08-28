import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("@claim:demo-sandbox @claim:web-storage the query-string demo uses isolated storage and clears it on exit", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => requests.push(new URL(request.url()).origin));
  await page.goto("/?demo=1");
  await expect(
    page.getByText("Demo — sample data, nothing is saved"),
  ).toBeVisible();
  await expect(page.getByText("agent-edit.json")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("demo:change-checkpoints:state"),
      ),
    )
    .toBe("sample");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([
    "demo:change-checkpoints:state",
  ]);
  expect([...new Set(requests)]).toEqual(["http://127.0.0.1:4173"]);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const banner = page.getByRole("status", { name: "Demo status" });
  await expect(banner).toBeVisible();
  const bannerBox = await banner.boundingBox();
  expect(bannerBox.y).toBeGreaterThanOrEqual(0);
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Leave demo and view install steps" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Leave demo and view install steps" })
    .click();
  await expect(page).toHaveURL(/\/#install$/);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test("@claim:signed-manifest @claim:checkpoint-record @claim:local-key-ignore @claim:markdown-summary @claim:cli-demo-isolated cpc demo writes the documented fields to its local repository", async () => {
  const output = execFileSync(
    "cargo",
    ["run", "--quiet", "--", "demo", "--json"],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const manifest = JSON.parse(readFileSync(result.manifest, "utf8"));
  expect(result.manifest.startsWith(result.demo_directory)).toBe(true);
  expect(result.demo_directory.startsWith(tmpdir())).toBe(true);
  expect(existsSync(join(result.demo_directory, ".git"))).toBe(true);
  expect(manifest.format).toBe("change-checkpoints/v1");
  expect(manifest.repository.head).toMatch(/^[0-9a-f]{40}$/);
  expect(manifest.workspace.diff_sha256).toMatch(/^[0-9a-f]{64}$/);
  expect(manifest.rollback).toBe("git restore src/lib.rs");
  expect(manifest.signature.algorithm).toBe("ed25519");
  expect(manifest.signature.value.length).toBeGreaterThan(40);
  expect(manifest.checks.map((check) => check.exit_code)).toEqual([0, 0]);
  expect(
    readFileSync(
      join(result.demo_directory, ".change-checkpoints", ".gitignore"),
      "utf8",
    ),
  ).toBe("signing.key\n");
  const summary = readFileSync(result.manifest.replace(/\.json$/, ".md"), "utf8");
  expect(summary).toContain("# Change checkpoint: agent-edit");
  expect(summary).toContain("git diff --check");
});

test("@claim:runs-in-git-repository cpc writes a normal checkpoint below a caller-created Git repository", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-caller-repo-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");

  execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "caller-change",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore src/a.txt",
    ],
    { cwd: repo },
  );

  expect(existsSync(join(repo, ".change-checkpoints", "caller-change.json"))).toBe(
    true,
  );
});

test("@claim:local-signing-key-path cpc creates its signing key at the documented local path", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-key-path-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");

  execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "key-path",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore src/a.txt",
    ],
    { cwd: repo },
  );

  expect(existsSync(join(repo, ".change-checkpoints", "signing.key"))).toBe(true);
});

test("@claim:verify-manifest cpc verifies the sample state and reruns its checks", async () => {
  const output = execFileSync(
    "cargo",
    ["run", "--quiet", "--", "demo", "--json"],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const verified = execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "verify",
      result.manifest,
      "--rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(JSON.parse(verified).valid).toBe(true);
});

test("@claim:no-command-output @claim:environment-hash checkpoint manifests omit command output and environment values", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-output-test-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");
  writeFileSync(join(repo, "output.txt"), "PRIVATE OUTPUT");
  execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "quiet",
      "--check",
      "cat output.txt",
      "--env",
      "PRIVATE_TOKEN=PRIVATE_VALUE",
      "--rollback",
      "git restore src/a.txt",
    ],
    { cwd: repo },
  );
  const text = readFileSync(
    join(repo, ".change-checkpoints", "quiet.json"),
    "utf8",
  );
  expect(text).not.toContain("PRIVATE OUTPUT");
  expect(text).not.toContain("PRIVATE_VALUE");
  expect(text).not.toContain('"output"');
  const manifest = JSON.parse(text);
  expect(manifest.checks[0].exit_code).toBe(0);
  expect(manifest.environment[0]).toMatchObject({
    name: "PRIVATE_TOKEN",
    present: true,
  });
  expect(manifest.environment[0].value_sha256).toMatch(/^[0-9a-f]{64}$/);
});

test("@claim:restore-safe restore rejects changed state, hides the note, and never runs it", async () => {
  const output = execFileSync(
    "cargo",
    ["run", "--quiet", "--", "demo", "--json"],
    { encoding: "utf8" },
  );
  const result = JSON.parse(output);
  const changedFile = join(result.demo_directory, "unexpected.txt");
  writeFileSync(changedFile, "new untracked state\n");

  const rejected = spawnSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "restore",
      result.manifest,
      "--rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(rejected.status).toBe(2);
  const rejection = JSON.parse(rejected.stdout);
  expect(rejection.valid).toBe(false);
  expect(rejection).not.toHaveProperty("rollback");
  expect(rejection.findings).toContain("workspace status differs");

  unlinkSync(changedFile);
  const restored = execFileSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "restore",
      result.manifest,
      "--rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(JSON.parse(restored)).toMatchObject({
    valid: true,
    checks_rerun: true,
    rollback: "git restore src/lib.rs",
  });
  expect(
    readFileSync(join(result.demo_directory, "src", "lib.rs"), "utf8"),
  ).toContain("tested change");

  const tamperedPath = join(
    result.demo_directory,
    ".change-checkpoints",
    "tampered.json",
  );
  const tampered = JSON.parse(readFileSync(result.manifest, "utf8"));
  tampered.checks[0].command = "touch command-was-run";
  writeFileSync(tamperedPath, JSON.stringify(tampered));
  const untrusted = spawnSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "restore",
      tamperedPath,
      "--rerun",
      "--json",
    ],
    { cwd: result.demo_directory, encoding: "utf8" },
  );
  expect(untrusted.status).toBe(2);
  expect(JSON.parse(untrusted.stdout).findings).toEqual([
    "signature is invalid",
  ]);
  expect(existsSync(join(result.demo_directory, "command-was-run"))).toBe(
    false,
  );
});

test("@claim:optional-patch a patch is absent by default and present only when requested", async () => {
  const repo = mkdtempSync(join(tmpdir(), "cpc-patch-test-"));
  mkdirSync(join(repo, "src"));
  writeFileSync(join(repo, "src", "a.txt"), "base\n");
  for (const args of [
    ["init"],
    ["config", "user.email", "test@example.invalid"],
    ["config", "user.name", "Test"],
    ["add", "."],
    ["commit", "-m", "base"],
  ])
    execFileSync("git", args, { cwd: repo });
  writeFileSync(join(repo, "src", "a.txt"), "changed\n");
  const cargo = [
    "run",
    "--manifest-path",
    join(process.cwd(), "Cargo.toml"),
    "--quiet",
    "--",
    "checkpoint",
  ];
  execFileSync(
    "cargo",
    [
      ...cargo,
      "plain",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore src/a.txt",
    ],
    { cwd: repo },
  );
  expect(
    JSON.parse(
      readFileSync(join(repo, ".change-checkpoints", "plain.json"), "utf8"),
    ).patch,
  ).toBeNull();
  expect(existsSync(join(repo, ".change-checkpoints", "plain.patch"))).toBe(
    false,
  );
  execFileSync(
    "cargo",
    [
      ...cargo,
      "with-patch",
      "--check",
      "git diff --check",
      "--rollback",
      "git restore src/a.txt",
      "--include-diff",
    ],
    { cwd: repo },
  );
  expect(
    JSON.parse(
      readFileSync(
        join(repo, ".change-checkpoints", "with-patch.json"),
        "utf8",
      ),
    ).patch.path,
  ).toBe(".change-checkpoints/with-patch.patch");
  expect(
    existsSync(join(repo, ".change-checkpoints", "with-patch.patch")),
  ).toBe(true);
});

test("@claim:no-third-party-runtime every website route loads only same-origin resources", async ({
  page,
}) => {
  const origins = [];
  page.on("request", (request) => origins.push(new URL(request.url()).origin));
  for (const route of ["/", "/demo", "/privacy", "/terms", "/404.html"])
    await page.goto(route);
  expect([...new Set(origins)]).toEqual(["http://127.0.0.1:4173"]);
});

test("@claim:mit-license the repository ships the MIT License", async () => {
  const license = readFileSync(join(process.cwd(), "LICENSE"), "utf8");
  expect(license).toContain("MIT License");
  expect(license).toContain("Permission is hereby granted");
});

test("@claim:web-demo-verify keyboard paths check the bundled browser record and reject a changed field", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/?demo=1$/);
  await page
    .getByRole("button", { name: "Check sample record" })
    .press("Enter");
  await expect(
    page.getByText("The displayed sample matches the bundled record."),
  ).toBeVisible();
  await page.locator('[data-field="hash"]').evaluate((element) => {
    element.textContent = "changed";
  });
  await page.getByRole("button", { name: "Check sample record" }).click();
  await expect(
    page.getByText("The displayed sample does not match the bundled record."),
  ).toBeVisible();
});

test("@claim:install-from-source the install section gives the public clone path and Cargo installs from an isolated source copy", async ({ page }) => {
  await page.goto("/#install");
  await expect(page.getByRole("heading", { name: "Clone and install cpc" })).toBeVisible();
  await expect(page.getByText("git clone https://github.com/B-Divyesh/sf-change-checkpoint-manifest.git")).toBeVisible();
  await expect(page.getByRole("link", { name: /View source on GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/B-Divyesh/sf-change-checkpoint-manifest",
  );
  const root = mkdtempSync(join(tmpdir(), "cpc-consumer-root-"));
  execFileSync("cargo", ["install", "--path", process.cwd(), "--root", root], {
    encoding: "utf8",
  });
  expect(existsSync(join(root, "bin", "cpc"))).toBe(true);
});

test("@claim:runtime-requirements the documented test workflow requires available Rust and Node toolchains", async () => {
  expect(execFileSync("cargo", ["--version"], { encoding: "utf8" })).toMatch(/^cargo /);
  expect(execFileSync("node", ["--version"], { encoding: "utf8" })).toMatch(/^v\d+/);
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
  expect(pkg.scripts.test).toContain("cargo");
  expect(pkg.scripts.test).toContain("playwright");
});

test("every route has valid landmarks, metadata, images, and no serious accessibility violations", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of ["/", "/demo", "/privacy", "/terms", "/404.html"]) {
    await page.goto(route);
    expect(await page.title()).not.toBe("");
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(await page.locator("img:not([alt])").count()).toBe(0);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("SPA navigation restores route focus and browser history", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Demo", exact: true }).click();
  await expect(page).toHaveURL(/\/?demo=1$/);
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Record checks with each change",
  );
  await expect(page.locator("h1")).toBeFocused();
});

test("leaving the demo moves keyboard focus to the install heading", async ({ page }) => {
  await page.goto("/?demo=1");
  await page.getByRole("link", { name: "Leave demo and view install steps" }).click();
  await expect(page).toHaveURL(/\/#install$/);
  await expect(page.getByRole("heading", { name: "Clone and install cpc" })).toBeFocused();
  await expect(page.getByText("Install steps loaded")).toHaveCount(1);
});

test("desktop first screen keeps the action result and all three facts in view", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("/");
  for (const text of [
    "Record checks with each change",
    "Try it with sample data",
    "See a sample checkpoint next.",
    "Runs in your Git repository",
    "Stores exit status, not output",
    "Signs each checkpoint so you can verify it later",
  ]) {
    const box = await page.getByText(text, { exact: true }).boundingBox();
    expect(box.y + box.height, `${text} must fit in the desktop first screen`).toBeLessThanOrEqual(900);
  }
  await context.close();
});

test("reduced motion disables smooth scrolling and animated transforms", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  expect(
    await page.evaluate(() => ({
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      pressTransform: getComputedStyle(document.querySelector(".press"))
        .transform,
    })),
  ).toEqual({ scrollBehavior: "auto", pressTransform: "none" });
  await context.close();
});

test("the static site does not register a service worker or claim offline updates", async ({
  page,
}) => {
  await page.goto("/");
  expect(
    await page.evaluate(
      () =>
        navigator.serviceWorker
          ?.getRegistrations()
          .then((items) => items.length) ?? 0,
    ),
  ).toBe(0);
  await expect(page.getByText(/works offline/i)).toHaveCount(0);
});

test("content remains usable at 200% text size on a 390px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/demo", "/privacy", "/terms"]) {
    await page.goto(route);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  }
});

test("the designed 404 page loads cleanly and returns home by keyboard", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/404.html");
  await expect(page).toHaveTitle("Change Checkpoints — Page not found");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://change-checkpoint-manifest.sociobot.in/404",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Change Checkpoints — Page not found",
  );
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "Install" }),
  ).toHaveCount(1);
  await expect(page.locator("footer")).toContainText("v0.1.0");
  await expect(
    page.getByRole("heading", { name: "That checkpoint page is not here" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.getByRole("link", { name: "Go to Change Checkpoints" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  expect(errors).toEqual([]);
});

test("mobile demo has no horizontal overflow or serious accessibility violations", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto("/demo");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await context.close();
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`${viewport.width}px layouts do not overflow and visible controls meet the touch target baseline`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport,
      isMobile: viewport.width === 390,
      hasTouch: viewport.width === 390,
    });
    const page = await context.newPage();
    for (const route of ["/", "/demo", "/privacy", "/terms"]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} overflowed at ${viewport.width}px`,
      ).toBe(true);
      const undersized = await page
        .locator("a:visible, button:visible, input:visible")
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              const box = element.getBoundingClientRect();
              return box.width < 44 || box.height < 44;
            })
            .map((element) => ({
              text: element.textContent?.trim(),
              width: element.getBoundingClientRect().width,
              height: element.getBoundingClientRect().height,
            })),
        );
      expect(
        undersized,
        `${route} has undersized targets at ${viewport.width}px`,
      ).toEqual([]);
    }
    await context.close();
  });
}

test("@claim:git-required outside a Git repository exits with a useful error and writes no manifest", async () => {
  const directory = mkdtempSync(join(tmpdir(), "cpc-no-git-"));
  const result = spawnSync(
    "cargo",
    [
      "run",
      "--manifest-path",
      join(process.cwd(), "Cargo.toml"),
      "--quiet",
      "--",
      "checkpoint",
      "no-repo",
      "--check",
      "true",
      "--rollback",
      "true",
    ],
    { cwd: directory, encoding: "utf8" },
  );
  expect(result.status).toBe(1);
  expect(result.stderr).toContain("not a git repository");
  expect(existsSync(join(directory, ".change-checkpoints"))).toBe(false);
});
