# Tender Radar admin ingestion stage (PR #36)

## Authorization and error contract

`createAuthorizer` accepts only a single Bearer credential, verifies the Firebase
ID token with revocation checking, rejects anonymous sign-in, and requires both
the verified token and the current enabled user record to have `admin: true`.
Caller-provided roles, email addresses and user IDs never grant authority. The
return value contains only the verified UID. SDK failures are sanitized and fail
closed; the helper does not initialize Firebase or emit logs.

`errors.js` recognizes only errors created by its own factory. Responses contain
an allowlisted code, fixed message, generated request ID and retryability flag.
Foreign errors cannot choose a public code or expose messages, stacks, claims,
credentials or internal paths. Both admin suites are included in PR validation.

## Confirmed database and prepared corrections

Before this stage, project `gen-lang-client-0089421810` selected three databases:

| Consumer | Database ID | Evidence |
| --- | --- | --- |
| Frontend | `ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701` | `firebase-applet-config.json`, `src/firebase.ts` |
| SoR import | Same named database as the frontend | `scripts/import-sor.cjs` |
| Rules deployment configuration | `ai-studio-4e239597-e97a-4fa4-9fc6-820d5d24cb34` | `firebase.json` |
| Existing Functions STD routes | `(default)` | `admin.firestore()` in `functions/index.js` |

The owner explicitly confirmed `ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701`
and reported existing users/analyses/payments/SoR/support collections there.
`functions/database-config.js` selects that named database. Radar persistence and
Functions STD routes use explicit `getFirestore(app, id)`; `firebase.json` targets
rules at that database. Frontend configuration and rules text are unchanged.
These configuration corrections do not migrate or deploy data. No existing
collections are deleted or copied.

## Admin preview and confirmation

The existing Tender Radar settings view shows the bilingual admin panel only
after a freshly refreshed ID token has boolean `admin: true`. Firestore
`role: admin` alone does not grant access. The server also checks the current
enabled Auth user and claims on every request. No live account claims are set.

Both endpoints require a Bearer token and an `application/pdf` body:

- `POST /api/tender-radar/preview` requires `X-Tender-Radar-Expected-Count`.
  Enter the actual exported row count (1–400), not the portal pagination total.
  Verification checks required fields, serial continuity, unique IDs and parser
  diagnostics. The response contains validation/category counts, duplicate and
  conflict counts, and file/preview hashes. It returns no PDF text or raw
  diagnostic messages and performs no writes.
- `POST /api/tender-radar/confirm` requires the same bytes/count plus the preview's
  `X-Tender-Radar-Preview-Hash`. It reparses, verifies and categorizes the PDF,
  then compares the digest before persistence. It never accepts client-supplied
  records/categories. The digest checks consistency, not authority; every call
  still requires admin Auth.

Limits: 10 MiB input, 100 pages, 100,000 text items, 1,000,000 text characters,
200,000 drawing operators per page, 400 tenders and 2 MiB of parsed records.
A dedicated worker has a 256 MiB old-generation heap cap and a 45-second deadline;
at most two parser workers run per instance. PDF.js evaluation is disabled.
Worker output/parser exceptions are discarded, never logged. The supported
layout is the inspected tagged Chromium e-GP export; unsupported, encrypted or
scanned layouts fail closed. No OCR or LLM is used.

The UI blocks edits/duplicate submissions during requests. File/count changes
invalidate previews; account changes/unmount abort and discard stale requests.
Confirmation failures require revalidation. Aborting the browser request does
not cancel an already-started server transaction; retrying discovers an already
completed import safely.

## Persistence and duplicates

`tenderRadarTenders/{numericTenderId}` stores canonical fields/category, source
serial/pages, content hash, importing UID/timestamp and first import ID.
`tenderRadarImports/{sha256OfPdf}` stores validation digest/version, counts and
provenance. No PDF bytes or filenames are stored. The existing default-deny rules
cover both collections: browser clients cannot access them directly.

One transaction reads all documents before writing at most 401 documents. Tenders
and receipt commit together or none do. Repeated/concurrent confirmation of the
same file returns `already_imported`. Overlapping exports skip identical stored
tenders; content comparison ignores row/page positions. Different content under
an existing ID, including amendments, blocks the whole import for review. There
is no automatic overwrite policy. Duplicate IDs inside a PDF fail verification.

## Runtime packaging and checks

`npm run build:tender-radar` compiles the actual top-level parser/verifier and
canonical frontend matcher into ignored `functions/tender-radar/runtime` files.
Root prebuild/predev/prestart and Functions predeploy generate them. Functions
pins the same PDF.js `5.5.207`; Node 22 must be at least 22.13. CI type-checks the
source before packaging, and runs both admin suites plus ingestion/UI tests.
Local development and Firebase Functions register the same Radar routes.

```powershell
npm run build:tender-radar
npm run test:tender-radar
npm run lint
npm run build
```

Tests use synthetic records, local fixtures and inert Auth/Firestore doubles;
they contact no live services. The real packaged worker is fixture-tested without
printing records. Doubles verify rollback/concurrency contracts; real deployed
rules, Firestore integration and browser interaction need separate emulator or
staging review before release.

## Isolated acceptance required before release

### Automated local acceptance

The dedicated harness uses `demo-tender-radar` and explicitly configures both
the named and default emulator databases with the actual repository rules.
Only Auth and Firestore emulators start; no Functions trigger, Hosting deployment,
scheduler or email code starts. Local ports are checked before startup so a test
cannot silently reuse an unrelated service.

```powershell
npm ci --prefix test/acceptance --ignore-scripts --strict-ssl=true
node scripts/tender-radar/install-acceptance.mjs
npm run test:tender-radar:acceptance
```

Java 21 and Node 22.13+ are required. Tool versions are pinned in the separate
acceptance lockfile; application dependency resolutions are unchanged. Browser
and emulator downloads use normal TLS verification. All generated tooling and
sanitized aggregate results live under ignored `.cache/tender-radar`.

The runner removes credential/project environment variables and uses an isolated
Firebase CLI configuration directory. The harness requires exact loopback
emulator hosts, supplies a synthetic SDK certificate generated only in memory
whose access-token method always rejects, and blocks
non-loopback Node sockets. Browser request interception permits only the three
local service ports and rejects unexpected WebSockets. The browser entry uses a
dummy demo configuration and connects before any Auth/Firestore operation; it
never imports the production Firebase bootstrap or loads application `.env` files.

Real deployed Functions Auth/Firestore/Express dependencies and the actual PDF
worker/service/store are used with dependency injection, preserving the
production project guard. Chromium generates tagged synthetic PDFs in memory;
no existing fixture contents, tokens, PDFs, screenshots or traces are logged.
Commit rollback is tested using a deliberately failing real SDK create
precondition alongside the staged tender and receipt writes. Direct browser SDK
create/update/delete denials include nested paths and the explicit named database;
a permitted ordinary-user profile creation also verifies rules are evaluated.

CI runs the same acceptance command in its own job. Aggregate results distinguish
passed, failed, skipped and blocked checks. These emulator checks do not prove
production limits, indexes or deployed rules, and browser acceptance exercises
the production upload component in a dedicated page rather than the entire SPA.

1. Use an ephemeral `demo-tender-radar` project with Auth and Firestore emulators
   bound to loopback. Use no production credentials, imported production data or
   live accounts. Block outbound network access during acceptance. Configure the
   named database explicitly with this repository's rules; do not rely on the
   emulator's permissive rules for an implicitly created database. Verify the
   loaded rules before submitting any test.
2. Use a dedicated local acceptance harness that injects the same ingestion
   service into `registerTenderRadarRoutes`. Construct its real Admin Auth and
   named Firestore clients for the demo project with emulator hosts set before
   SDK initialization. Keep the production project guard intact. Seed synthetic
   accounts and admin claims only in the Auth emulator. Configure a test browser
   entry to connect its Firebase clients to these emulators before initialization
   checks; fail the harness if an emulator host is missing or not loopback.
3. Test unauthenticated, ordinary, disabled, revoked and claim-removed accounts
   against both HTTP endpoints. Independently assert denied direct client
   create/update/delete operations on both ingestion collections, including
   nested paths, using anonymous, ordinary and admin tokens. Repeat against the
   explicit named database; a default-database-only rules test is insufficient.
4. Through the real HTTP parser and Firestore SDK, assert zero writes on preview
   and invalid PDFs/counts/digests, one atomic tender-plus-receipt import, repeated
   and parallel confirmation idempotency, overlap skips, and whole-batch rejection
   for amendments or a conflict inserted between preview and confirmation.
   Inject a failed commit and confirm neither collection contains partial writes.
   Verify timestamps/provenance and that client-supplied records or database IDs
   cannot affect persistence. Use synthetic exports or local approved fixtures;
   keep document contents, PDFs and tokens out of logs/screenshots.
5. In a real browser, test ordinary-user invisibility and admin preview/confirm,
   English/Bengali labels, keyboard use, count/file changes, invalid uploads,
   conflict messages, double clicks, refresh/retry, sign-out/account switching,
   and delayed responses. Check that changing the preview in browser tools cannot
   bypass server verification. Assert every network request is local and that no
   scheduler, email provider or production Firebase endpoint is contacted.

Record versions, aggregate results and sanitized failure evidence for review.
Local acceptance is incomplete; see `test/acceptance/README.md` for the paused
handoff, verified isolation/diagnostic checks, blocked suite results and resume
commands. Required HTTP/rules/browser acceptance remains unverified. Production deployment,
rules rollout, any real admin claim and email enablement require separate review.

Scheduled email delivery remains disabled. This stage does not merge, deploy,
change live Firebase resources, or send email. Test fixture contents and
credentials must not appear in logs or PR descriptions.
