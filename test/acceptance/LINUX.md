# Reproduce acceptance on Linux

Windows diagnosis and evidence are in `README.md` and
`.cache/tender-radar/worker-repro-*/results.json`. They are diagnostics and
interrupted results, not completed acceptance. No Linux run has been executed.

The prepared manual workflow is
`.github/workflows/tender-radar-acceptance-linux.yml`. It uses Ubuntu 24.04,
Node **22.23.2**, Java **21.0.12** (Temurin on Linux; Microsoft on this Windows
host), and the existing three dependency lockfiles. The pinned acceptance
dependencies are Firebase CLI **15.33.0**, Playwright **1.64.0** (Chromium
revision **1248**, version **156.0.8078.4**), and Firestore emulator **1.22.0**.
The Functions parser uses PDF.js **5.5.207** and canvas **0.1.100**.

The workflow has manual dispatch and pull-request triggers, read-only repository
permissions, no persisted checkout credential, and no production secrets,
deployment, email, or Functions emulator. It has been parsed and checked locally
and is being published to the existing draft PR under the owner's explicit
commit/push authorization. GitHub requires the workflow on the default branch
for manual dispatch; until then, the PR event runs the same job without merging.

For a Linux machine, use a separate source directory containing the current
working-tree files, including the untracked acceptance files and all three
lockfiles. Do not copy Windows `node_modules`, browser caches, credentials,
`.env` files or existing result files into it. WSL is not currently enabled on
this host (`WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED`); no WSL installation or OS
change has been attempted.

On a **fresh** Ubuntu 24.04 environment with the Node/Java versions above:

```bash
npm ci
npm ci --prefix functions --ignore-scripts
npm ci --prefix test/acceptance --ignore-scripts
node scripts/tender-radar/install-acceptance.mjs --with-deps
npm run build:tender-radar
node test/acceptance/compatibility.mjs
node --test test/tender-radar-acceptance-isolation.test.mjs
bash scripts/tender-radar/acceptance-linux.sh preflight
bash scripts/tender-radar/acceptance-linux.sh
node test/acceptance/verify-results.mjs
```

Run with `set -euo pipefail` so a failed preflight or acceptance command stops
the sequence. Installation and runtime build above are for the fresh Linux
environment only. On a previously prepared Linux workspace, verify existing
versions/caches and reuse them; do not repeat completed installations.

Both reproduction and acceptance retain credential scrubbing and external
socket guards. The Linux wrapper additionally creates a new network namespace,
enables only loopback, drops to the original user's UID/GID and starts Node
with a clean environment. This blocks external access for the CLI, Java,
Chromium and parser workers as well. The wrapper requires `sudo`, `unshare`,
`ip` and `setpriv`, available on the GitHub Ubuntu runner. Downloads take place
before entering this namespace; evidence upload takes place afterward.
Acceptance pins both project variables to `demo-tender-radar`,
starts only Auth and Firestore on loopback, explicitly loads and reads back
repository rules on both databases, uses synthetic SDK credentials, and
restricts browser requests to the allowed loopback services. Do not substitute
a production project, relax TLS/rules, replace the parser, or enable email to
make a check pass.

The preflight closes Chromium before invoking the deployed bounded parser and
then the same worker with natural shutdown. It never increases the parser's
45-second limit. Import-only crash diagnosis, without even Chromium, is:

```bash
node test/acceptance/reproduce-worker.mjs pdfjs-batch empty-batch canvas-batch
```

This diagnostic exits nonzero for a crash or timeout and saves timestamps,
runtime identity, child exit codes and phase events separately from acceptance.
It is not a readiness result.

Only the finished suite writes `complete: true`. Cleanup is recorded explicitly.
Each launcher invocation creates a fresh current-run manifest containing a
unique run ID and `git rev-parse HEAD`. Both must match the completed evidence;
stale files cannot satisfy the result gate. Startup/abnormal-exit failures save
incomplete evidence and explicit required skips for that invocation.
The result gate requires all 19 named checks to pass, the exact demo project and
database, the rules hash, zero external sockets/credential fallbacks, a finished
run, and verified cleanup. Interrupted/progress artifacts are rejected even if
their individual checks passed. CI uploads sanitized JSON evidence on success
or failure; it does not upload PDFs, browser auth state, raw emulator logs, or
production configuration. A completed Linux result remains pending.
