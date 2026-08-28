import "./style.css";
import "./repair.css";
import pressUrl from "./assets/checkpoint-press.webp";
import recordingUrl from "./assets/demo-recording.svg";

const app = document.querySelector("#app");
const announce = document.createElement("div");
announce.className = "sr-only";
announce.setAttribute("aria-live", "polite");
document.body.append(announce);
const meta = {
  "/": [
    "Change Checkpoints — Record checks with each change",
    "Record a Git change, its checks, and a rollback note in one signed local checkpoint.",
  ],
  "/demo": [
    "Demo — Change Checkpoints",
    "A safe sample of a local Git checkpoint.",
  ],
  "/privacy": [
    "Privacy — Change Checkpoints",
    "How Change Checkpoints handles local files and sample data.",
  ],
  "/terms": ["Terms — Change Checkpoints", "Terms for Change Checkpoints."],
  "/404": [
    "Not found — Change Checkpoints",
    "The requested Change Checkpoints page was not found.",
  ],
};
const header = () =>
  `<header class="site-header"><a class="wordmark" href="/" data-route><span aria-hidden="true">●</span> Change Checkpoints</a><nav aria-label="Main navigation"><a href="/?demo=1" data-route>Demo</a><a href="/#install">Install</a><a href="/privacy" data-route>Privacy</a></nav></header>`;
const footer = () =>
  `<footer><p>Signed context for a change.</p><p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a> · Built by Param Factory · v0.1.0</p></footer>`;
const shell = (content) =>
  `${header()}<main id="main" tabindex="-1">${content}</main>${footer()}`;
const routeLink = (url, label, style = "button") =>
  `<a class="${style}" href="${url}" data-route>${label}</a>`;

function home() {
  return shell(`
<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">A local Git checkpoint tool</p><h1 id="hero-title">Record checks with each change</h1><p class="lede">For teams reviewing fast edits who need the diff, checks, and rollback note together.</p><div class="hero-action">${routeLink("/?demo=1", "Try it with sample data")}<span>See a sample checkpoint next.</span></div><ul class="facts"><li>Runs in your Git repository</li><li>Stores exit status, not output</li><li>Signs each checkpoint so you can verify it later</li></ul></div><figure class="press"><img src="${pressUrl}" width="1536" height="1024" fetchpriority="high" alt="A printed technical proof sheet with verification stamps on a dark workbench." /><figcaption>One checkpoint for the change and its checks.</figcaption></figure></section>
<section class="terminal-section" id="install" aria-labelledby="sample-title"><div><p class="eyebrow">Install from source</p><h2 id="sample-title" tabindex="-1">Clone and install cpc</h2><p>Clone the public source, then install the command with Cargo.</p><pre aria-label="Clone and install commands"><code><span class="prompt">$</span> git clone https://github.com/B-Divyesh/sf-change-checkpoint-manifest.git
<span class="prompt">$</span> cd sf-change-checkpoint-manifest
<span class="prompt">$</span> cargo install --path .</code></pre><a class="source-link" href="https://github.com/B-Divyesh/sf-change-checkpoint-manifest">View source on GitHub <span class="sr-only">(opens GitHub)</span></a></div><pre aria-label="Example checkpoint command"><code><span class="prompt">$</span> cpc checkpoint auth-timeout \\
  --check "npm test" \\
  --check "git diff --check" \\
  --rollback "git restore src/auth.rs"</code></pre></section>
<section class="steps" aria-labelledby="steps-title"><p class="eyebrow">How it works</p><h2 id="steps-title">Keep the checkpoint with the change</h2><ol><li><strong>Name the checkpoint.</strong><span>cpc records the current commit and a hash of the changes.</span></li><li><strong>Run the checks.</strong><span>cpc saves each command and its exit status, not its output.</span></li><li><strong>Verify later.</strong><span>cpc checks the signature, current Git state, saved environment checks, and the checks you selected.</span></li></ol></section>
<section class="split" aria-labelledby="scope-title"><div><p class="eyebrow">Clear boundary</p><h2 id="scope-title">Store change context without running a rollback</h2><p>A checkpoint is a file in your repository. Restore checks the current state before showing its rollback note.</p><p>Do not put secrets in an optional patch file.</p></div><div class="mini-manifest" aria-label="Sample manifest fields"><span>format: change-checkpoints/v1</span><span>signature: ed25519</span><span>checks: 2 passed</span><span>command output: omitted</span></div></section>`);
}

function demo() {
  return shell(`
<aside class="demo-banner" role="status" aria-label="Demo status">Demo — sample data, nothing is saved <button id="reset-demo">Reset demo</button> <a href="/#install" id="leave-demo">Leave demo and view install steps</a></aside><section class="demo-head"><p class="eyebrow">Bundled demo</p><h1>Inspect a sample checkpoint</h1><p class="lede">This sample shows the manifest that cpc writes for a changed checkout.</p></section><section class="demo-grid"><div class="manifest-paper"><div class="paper-top"><span data-field="name">agent-edit.json</span><span>Bundled sample</span></div><dl><div><dt>Git commit</dt><dd data-field="commit">9d7b1ea…</dd></div><div><dt>Changes hash</dt><dd data-field="hash">3f18a7d6…</dd></div><div><dt>Check</dt><dd><code data-field="check-one">git diff --check</code> <b class="pass" data-field="check-one-status">exit 0</b></dd></div><div><dt>Check</dt><dd><code data-field="check-two">git status --porcelain</code> <b class="pass" data-field="check-two-status">exit 0</b></dd></div><div><dt>Rollback note</dt><dd><code data-field="rollback">git restore src/lib.rs</code></dd></div></dl><button class="button" id="show-verify">Check sample record</button><p id="verify-result" aria-live="polite"></p></div><div class="demo-notes"><h2>Try the real command</h2><p>The CLI makes this sample inside a temporary Git repository.</p><pre><code>$ cargo run -- demo
Demo checkpoint created in /tmp/…</code></pre><img class="terminal-recording" src="${recordingUrl}" width="720" height="260" alt="Terminal recording of cpc demo writing a sample checkpoint in a temporary directory." /><a class="link-arrow" href="/#install" id="install-cpc">Install cpc →</a></div></section><section class="demo-empty"><h2>What happens outside a Git repository?</h2><p>cpc reports that Git is required and exits without writing a manifest. Run it inside a repository.</p></section>`);
}
function legal(kind) {
  const privacy = kind === "privacy";
  return shell(
    `<article class="legal"><p class="eyebrow">${privacy ? "Privacy" : "Terms"}</p><h1>${privacy ? "Your checkpoint stays on your machine" : "Use checkpoints with care"}</h1>${privacy ? `<p>Change Checkpoints reads Git state, runs only commands you name, and writes manifests in your repository.</p><h2>What it stores</h2><p>Manifests store commands, exit statuses, Git identifiers, changes hashes, environment-value hashes, and your rollback note. They do not store command output.</p><p>An optional patch can contain source changes. It is written only when you ask for it. Review it before sharing.</p><h2>Website storage</h2><p>The regular website stores nothing in your browser. The sample demo uses one separate local storage key. Leaving the demo clears that key.</p>` : `<p>Use Change Checkpoints to record engineering context. You remain responsible for reviewing commands, patches, and rollback notes before using them.</p><h2>License</h2><p>Change Checkpoints is open-source software under the MIT License.</p><h2>No warranty</h2><p>The tool is provided as-is. Test rollback steps in a safe checkout before using them on important work.</p>`}</article>`,
  );
}
function missing() {
  return shell(
    `<section class="not-found"><p class="eyebrow">404</p><h1>This proof sheet is missing</h1><p>The page address does not point to a checkpoint guide.</p>${routeLink("/", "Return to Change Checkpoints")}</section>`,
  );
}
function wire(isDemo) {
  document.querySelectorAll("[data-route]").forEach((a) =>
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || a.getAttribute("href").startsWith("/#"))
        return;
      e.preventDefault();
      history.pushState({}, "", a.getAttribute("href"));
      render();
      requestAnimationFrame(() => document.querySelector("h1")?.focus());
    }),
  );
  if (isDemo) {
    localStorage.setItem("demo:change-checkpoints:state", "sample");
    document.querySelector("#reset-demo").onclick = () => {
      localStorage.removeItem("demo:change-checkpoints:state");
      localStorage.setItem("demo:change-checkpoints:state", "sample");
      document.querySelector("#verify-result").textContent = "Sample reset.";
    };
    document.querySelector("#show-verify").onclick = async () => {
      const fields = ["name", "commit", "hash", "check-one", "check-one-status", "check-two", "check-two-status", "rollback"];
      const record = fields.map((field) => document.querySelector(`[data-field="${field}"]`).textContent.trim()).join("|");
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(record))), (byte) => byte.toString(16).padStart(2, "0")).join("");
      document.querySelector("#verify-result").textContent = digest === "d1bf3e25061e83b618d351ff1a1f01533862fb4c9337ad482bd29300f0432e01" ? "The displayed sample matches the bundled record." : "The displayed sample does not match the bundled record.";
    };
    document.querySelector("#leave-demo").onclick = (event) => {
      event.preventDefault();
      localStorage.removeItem("demo:change-checkpoints:state");
      history.pushState({}, "", "/#install");
      render();
      document.querySelector("#install")?.scrollIntoView();
      document.querySelector("#sample-title")?.focus();
      announce.textContent = "Install steps loaded";
    };
  }
}
function render() {
  const path = location.pathname.replace(/\/$/, "") || "/";
  const isDemo =
    path === "/demo" || new URLSearchParams(location.search).get("demo") === "1";
  if (!isDemo) {
    localStorage.removeItem("demo:change-checkpoints:state");
  }
  app.innerHTML =
    isDemo
      ? demo()
      : path === "/"
      ? home()
      : path === "/privacy"
          ? legal("privacy")
          : path === "/terms"
            ? legal("terms")
            : missing();
  const key = isDemo ? "/demo" : meta[path] ? path : "/404";
  document.title = meta[key][0];
  document.querySelector('meta[name="description"]').content = meta[key][1];
  document.querySelector('link[rel="canonical"]').href = new URL(
    key,
    "https://change-checkpoint-manifest.sociobot.in",
  );
  document.querySelector('meta[property="og:title"]').content = meta[key][0];
  document.querySelector('meta[property="og:description"]').content = meta[key][1];
  document.querySelector('meta[name="twitter:title"]').content = meta[key][0];
  document.querySelector('meta[name="twitter:description"]').content = meta[key][1];
  document.querySelector("h1")?.setAttribute("tabindex", "-1");
  announce.textContent = `${document.title} loaded`;
  wire(isDemo);
}
window.addEventListener("popstate", () => {
  render();
  requestAnimationFrame(() => document.querySelector("h1")?.focus());
});
render();
