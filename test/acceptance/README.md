# Tender Radar acceptance handoff

## Publication and Linux CI review

The owner subsequently authorized committing and pushing acceptance tooling to
the existing draft PR #36, while retaining the prohibition on merge, deployment
and production Firebase operations. Windows probing is finished; the confirmed
trigger and unresolved native-module limit are described below.

The Linux workflow now supports pull-request events because its manual dispatch
definition is absent from the default branch. It checks out the exact PR head,
uses the existing Node/Java versions and lockfiles, and runs the bounded-parser
preflight and acceptance in a clean loopback-only network namespace. No
production secrets, Functions emulator, scheduler or email code is enabled.
The launcher rejects any configuration beyond the exact demo Auth/Firestore
setup, writes fresh current-run evidence before emulator startup and preserves
incomplete evidence on crashes. A unique run ID and source commit must match
the final result gate. All 19 checks, exact rules readback on both databases,
zero socket/credential fallback counters and successful cleanup are required.

Local checks: evidence/workflow/configuration gate passed, seven isolation tests
passed outside the sandbox after `spawn EPERM`, and JavaScript syntax/whitespace
checks passed. Linux full-suite results must come from CI on the published
commit, not the interrupted Windows runs. The historical handoffs below retain
their earlier authorization and validation statements only as context.

## Windows diagnosis on 2026-10-14: isolated worker crash confirmed

Read the latest interrupted evidence and Git status before this diagnosis.
No full acceptance suite was started. No dependencies were reinstalled, no
runtime/dependency versions changed, and no commit/push/merge/deployment or
production Firebase operation was performed. Local changes and guards remain.

Confirmed crashing executable: `C:\nvm4w\nodejs\node.exe`, Node **v22.23.2**,
Windows x64 (Node ABI 127, N-API 10), host Windows 10 Pro 22H2/build 19045.
The initial synthetic bounded-parser reproduction stopped at a Chromium
`page.setContent` timeout before reaching the parser; it did not reproduce
the access violation and is not acceptance evidence.

The smaller `reproduce-worker.mjs pdfjs-batch empty-batch canvas-batch` command
started **no browser, no Java/Firebase emulator, no HTTP server and parsed no
PDF**. It used clean demo environment variables and retained socket guards.
Evidence:
`.cache/tender-radar/worker-repro-2026-10-14T15-35-35.261Z/results.json`.
The first PDF.js-only worker imported `legacy/build/pdf.mjs`, reported
`module-imported`, then its host Node executable exited **3221225477**
(`0xC0000005`), before a worker exit event. No explicit `terminate()` was used,
and the supervisor's timeout did not fire. Thirty otherwise equivalent
`node:zlib` workers and thirty `@napi-rs/canvas`-only workers exited normally.
The supervisor survived, recorded all three cases, and exited 1.

A second single-worker probe reproduced the same native exit code:
`.cache/tender-radar/worker-repro-2026-10-14T15-47-26.686Z/results.json`.
Its detailed phase file is `pdfjs-natural.jsonl`. This confirms the PDF.js
import completed and the worker even reported exit code 0 before its host Node
process crashed; the failure lies in the surrounding native worker lifecycle.
Together these probes confirm the PDF.js
worker lifecycle as the local trigger, independent of browser/emulators,
parsing and explicit worker termination. A native crash dump/faulting-module
stack is unavailable; do **not** attribute the native fault to canvas alone,
or claim a specific source-line fix. The original worker integration remains
unchanged and Windows acceptance remains blocked.

An upstream matching report is
<https://github.com/mozilla/pdf.js/issues/21934>. The maintainer states Node
`worker_threads` is outside PDF.js's supported worker API. That report supports
the diagnosis but does not prove that a version upgrade fixes this repository.
No dependency upgrade or parser-limit change has been made.

Installed compatibility was recorded in
`.cache/tender-radar/compatibility.json`: Node 22.23.2 satisfies the repository's
Node 22 engine and the installed PDF.js 5.5.207, canvas 0.1.100, Firebase CLI
15.33.0, and Playwright 1.64.0 engine ranges. Installed Java is Microsoft
OpenJDK **21.0.12+8**, and the cached Firestore emulator **1.22.0** matches the
CLI manifest. Chromium revision **1248** is **156.0.8078.4**. These are declared
version checks, not a guarantee of native worker compatibility. Java and the
emulator are excluded from the minimal crash reproduction.

Playwright's current system requirements list Windows 11+/Server 2019+/WSL,
not this Windows 10 host: <https://playwright.dev/docs/intro#system-requirements>.
WSL reports `WSL_E_WSL_OPTIONAL_COMPONENT_REQUIRED`; it was not installed.
Prepared a manual Ubuntu 24.04 CI workflow preserving Node/Java versions and
existing dependency lockfiles. See [LINUX.md](LINUX.md) for commands and limits.
It has not been published or executed. The evidence gate rejects interrupted
results; Linux completed acceptance remains pending.

Validation: the workflow parsed and configuration checks passed; the evidence
gate accepted a synthetic finished all-pass result and rejected interrupted,
unverified-cleanup, skipped, incomplete, wrong-project/database, and external
socket cases. It also rejected the actual interrupted result (CLI exit 1).
Script syntax and tracked-diff whitespace checks passed. This validation is
of the prepared tooling and is not a completed acceptance run.

## Resume on 2026-10-14: rules validated, native process crash remains

The owner explicitly resumed acceptance. Git status and this handoff were read
first, and the existing local changes were preserved. No installations, runtime
rebuilds, commits, pushes, merges, deployments, production Firebase access,
production claims, or emails were performed.

Two outside-sandbox emulator runs progressed beyond rules loading. The second
run began at `2026-10-14T15:07:50.721Z`; both rules PUT/GET operations and exact
repository source readback passed for both databases. The 120-second correction
is now validated. Rules SHA-256:
`6c740f1fdd37b678c60c37fb6aeb4089f4a03c7ef96d98d03178e884eee22e01`.

The first resumed run passed authorization, parallel/repeated confirmation,
real SDK rollback, invalid input rejection, named-database direct-write denial,
English account switching, and Bengali keyboard/invalid-PDF/refresh/sign-out.
Parser ingestion, overlap, amendment, and several English browser checks failed.
It then terminated with Windows code `3221225477` (`0xC0000005`, access violation)
before aggregate evidence/cleanup. Those observations are terminal evidence only;
they do not establish a completed suite result or verified cleanup.

The second run also terminated with `3221225477`, immediately after rules,
isolation rejection, and HTTP authorization passed, while entering parser
ingestion. Durable evidence is in
`.cache/tender-radar/progress-2026-10-14T15-07-50.721Z.json`.
Its socket and credential counters were zero at the last checkpoint. The CLI
reported emulator shutdown, but suite cleanup and final isolation were not
verified. Do not treat the older `results.json` as evidence of this run unless
an explicitly interrupted aggregate has subsequently been saved. An interrupted
aggregate was recovered from this progress file into `results.json` and
`results-2026-10-14T15-07-50.721Z.json`: **3 passed, 0 failed, 16 skipped,
1 blocked**, incomplete, cleanup unverified. The earlier completed aggregate
remains preserved in its timestamped file.

`inspect-synthetic.mjs` used the existing acceptance browser cache and packaged
parser, with external sockets blocked. Both a two-row fixture and an amendment
fixture passed verification with no diagnostics (exit 0). This excludes an
obvious fixture-format failure; it does not validate the bounded worker parser
or establish the native crash's cause. Do not increase production parser limits
or replace the real SDK/parser to force acceptance through.

The suite now writes separate progress evidence after each check. The launcher
also saves explicitly incomplete aggregate evidence if a future suite exits
before its final evidence writer. Those files mark cleanup unverified and list
remaining required checks as skipped. These changes do not disable isolation.

Next: diagnose the repeated native Node crash before another full run. Local
Windows crash-event inspection found no matching Application ID 1000 events.
Full process inspection after shutdown found only unrelated Codex Node PID 3704,
parent 10048, started 2026-10-14 20:37:51 Dhaka; no acceptance Node/Java remained.
Preserve unrelated Chrome/Codex processes. All earlier production restrictions
remain in force. The historical paused handoff below is retained for context.

Paused by the owner on 2026-10-14 (Asia/Dhaka). Preserve the current working
tree. Do not start another run until the owner resumes work. No commit, push,
merge, deployment, production Firebase access, production admin claim, or email
is authorized. No dependencies or browsers were reinstalled during this work.

## Completed checks and evidence

- Node v22.23.2 and Java 21.0.12 are installed. Existing local Firebase CLI,
  Playwright/Chromium and Firestore emulator tooling were used. The parser runtime
  was built by the acceptance command; do not rebuild or reinstall without cause.
- The isolation test passed all seven checks, with zero failures/skips and exit
  code 0. Terminal TAP output is the evidence (no separate JSON was saved).
  Checks cover the demo project/database selection, credential environment
  removal, missing/non-loopback/wrong-project rejection (both project variables),
  external socket and credential fallback rejection, permitted loopback sockets,
  tracked socket cleanup while the guard remains active, and the synthetic
  certificate using the deployed SDK.
- The emulator-backed diagnostic passed, exit 0, from
  `2026-10-13T20:56:56.881Z` to `2026-10-13T20:59:07.013Z`
  (2026-10-14 02:56:56 to 02:59:07 Dhaka). Evidence:
  `.cache/tender-radar/diagnostic.json` and
  `.cache/tender-radar/diagnostic-2026-10-13T20-56-56.881Z.json`.
  It verified rules for both databases, initialized the deployed SDK, seeded
  a synthetic rollback precondition, started Vite/HTTP, and closed the harness
  and tracked connections. External socket attempts: 0; credential fallback
  attempts: 0; cleanup failure: false. The guard stays installed through exit.
- An earlier acceptance attempt loaded/read back the exact repository rules for
  both databases: 1 passed, 0 failed, 18 skipped, 1 blocked at harness startup.
  This is historical evidence, not the latest suite result.

## Failures and latest suite result

- The sandbox rejected Node test subprocess creation with `spawn EPERM`.
  The isolation test subsequently passed outside the sandbox. Emulator/browser
  subprocesses likewise require the approved outside-sandbox execution path.
- Firebase CLI 15.33.0 ignored the previous two-entry Firestore configuration
  and warned about permissive rules. Fixed locally: the CLI config has one
  startup rules file, and `rules.mjs` explicitly PUTs and GETs rules for both
  `(default)` and the named database before any SDK initialization/seeding.
  Exact source readback and compiler-error rejection are mandatory.
- The standalone diagnostic, without a running emulator, failed with deadline
  exceeded (code 4) after the SDK retry window. It recorded zero external socket
  and credential fallback attempts and successful cleanup. The diagnostic now
  checks emulator availability/rules first and should run through the launcher.
- The successful emulator-backed diagnostic emitted an esbuild goroutine
  deadlock message during shutdown after its success output. The CLI exited 0;
  investigate whether this affects browser execution or cleanup. A passing
  diagnostic does not establish browser acceptance.
- Latest completed full acceptance run:
  `2026-10-13T21:04:48.353Z` to `2026-10-13T21:05:18.750Z`
  (2026-10-14 03:04:48 to 03:05:18 Dhaka): **0 passed, 0 failed,
  19 skipped, 1 blocked**, exit 1. It blocked during rules loading with
  `TimeoutError`, code 23, at the 30-second request timeout. No external socket
  or credential fallback attempts were recorded. Evidence:
  `.cache/tender-radar/results.json` and
  `.cache/tender-radar/results-2026-10-13T21-04-48.353Z.json`.
- The rules PUT and GET deadlines are now **120 seconds**. This correction is
  present on disk, but its subsequent interrupted retry produced no newer
  completed result. Do not claim the correction is validated.

## Other relevant local fixes

- Harness cleanup now covers partial SDK initialization, Vite, HTTP connections,
  Firestore and the Admin app. The diagnostic keeps its guard installed through
  process exit, writes sanitized error types/codes/frame locations, and exits
  nonzero on failure. Successful diagnostics exit after explicit cleanup too.
- `acceptanceEnvironment` pins both project variables to `demo-tender-radar`,
  Auth to `127.0.0.1:9098`, and Firestore to `127.0.0.1:8085`; it removes
  credential/project variables, proxy overrides and inherited Node options.
  SDK credentials are synthetic and reject access-token fallback. The browser
  uses its isolated demo bootstrap and permits only loopback service requests.
  Only Auth and Firestore emulators run; email, scheduler and Functions triggers
  are excluded. No production credentials or account claims are used.
- The rollback test store now forwards `collection()` to the real SDK and counts
  injected create-precondition attempts. The check requires an actual attempt,
  preventing an earlier missing-method error from masquerading as SDK rollback.
  This corrected check has not yet run.
- Added English/Bengali keyboard, invalid-PDF, refresh and sign-out checks to
  cover documented gaps. These browser checks have not yet run.
- The suite inventories 19 required checks, records skipped checks explicitly,
  saves timestamped aggregate evidence, and exits nonzero for any failed,
  blocked or skipped required check. Its socket guard remains through cleanup
  and evidence writing.

## Remaining blockers and pending checks

Validate the longer rules-compilation deadline and finish harness startup. All
HTTP ingestion, authorization, real SDK transaction/rollback/idempotency,
conflict/input validation, direct-client named-database rules, and all browser
interaction checks remain unverified. Investigate the esbuild shutdown message
if it recurs. Review actual run results before declaring readiness.

At pause, read-only PID/parent/startup-time/command-line inspection found **no
acceptance or diagnostic Node/Java processes**. Only unrelated Codex Node PID
7984, parent 7808, started 2026-10-14 01:37:30, remained; it was preserved.
Nothing needed stopping. Do not use blanket Node/Java process termination on
resume. If stale processes appear, list their full command lines and verify
their ancestry and startup times before stopping only this task's processes.

## Exact resume commands

After explicit owner resumption, from PowerShell:

```powershell
Set-Location -LiteralPath D:\egp_tender_hub
git status --short
Get-Content test/acceptance/README.md
node scripts/tender-radar/acceptance.mjs
Get-Content .cache/tender-radar/results.json
```

Use the existing approved outside-sandbox execution path for the acceptance
command when needed; do not disable guards or TLS. The direct launcher avoids
repeating the already completed runtime build. Do not run install commands.

If a new harness failure requires diagnosis, use this optional command (the
previous emulator-backed diagnostic already passed):

```powershell
node scripts/tender-radar/acceptance.mjs --diagnostic
Get-Content .cache/tender-radar/diagnostic.json
```

Only if isolation code changes, rerun its seven checks:

```powershell
node --test test/tender-radar-acceptance-isolation.test.mjs
```

No command above deploys, grants live claims, or enables email. Production
release review remains separate and unauthorized.
