# Isolated manual full-SPA/PWA acceptance

Uses the actual `src/main.tsx`, App, router, CSS, components and generated service
worker. A build-only Firebase adapter connects Auth, named Firestore and Storage
to emulators before any app operation. The normal sign-in button prompts for a
demo account instead of contacting Google. This does not validate Google OAuth.
Production source/configuration and automated acceptance/security tests are unchanged.
Landing-page production Storage sample images become local DEMO placeholders;
external analytics are removed from this build, and external fonts/images are blocked.

## Automated Linux CI

The existing Linux acceptance workflow additionally builds this full app and runs
12 required SPA/PWA checks headlessly in a separate loopback-only namespace.
It reuses the job's installed dependencies and browser/Firestore caches; only
the additional Storage emulator is prepared. It retains all 19 existing security
and ingestion acceptance checks. Run identity, source/build commit, exact rules
hash, complete counts, zero Node socket/credential fallback attempts and verified
cleanup must pass `node test/manual-spa/verify.mjs`. The three sanitized build,
launch and result JSON files are uploaded; browser profiles and PDFs are excluded.

On an already prepared Linux checkout:

```bash
node scripts/tender-radar/manual-spa.mjs prepare-storage
node scripts/tender-radar/manual-spa.mjs build
bash scripts/tender-radar/manual-spa-linux.sh ci
node test/manual-spa/verify.mjs
```

These 12 checks cover real app mounting/styles/privacy navigation, ordinary/admin
access, English import/repeat/invalid input, Bengali repeat/invalid input, account
switching, refresh, narrow viewport shell, manifest/service-worker control and
offline reload. They do not establish visual quality, browser installation,
profile/STD persistence or production Storage policy. Complete the manual rows
below before marking full UI review complete. A failed or unrun CI stage is a
blocker, even if the existing 19 component acceptance checks pass.

Run in a **graphical Ubuntu 24.04 X11/XWayland session**, from the repository root,
with the same Node 22.23.2 / Java 21.0.12 and locked dependencies as Linux CI.
This Windows host lacks the required Linux namespace environment; do not run the
SPA in your ordinary Windows browser or run the production `npm run dev` for this pass.
No Firebase login or real cloud project is needed: `demo-tender-radar` is emulator-only.

## Startup

On a fresh Linux checkout only, prepare the locked dependencies/caches online:

```bash
npm ci
npm ci --prefix functions --ignore-scripts
npm ci --prefix test/acceptance --ignore-scripts
node scripts/tender-radar/manual-spa.mjs prepare
```

Reuse installed dependencies and caches on subsequent runs. Then:

```bash
npm run build:tender-radar
node scripts/tender-radar/manual-spa.mjs build
bash scripts/tender-radar/manual-spa-linux.sh
```

The last command asks for local sudo only to create a network namespace; it drops
back to your user before starting Node/Java/Chromium. All of them have only
loopback networking. Use the **Chromium window it opens** at `http://127.0.0.1:4179`;
the host browser cannot access that namespace. No Functions emulator, scheduler,
production credentials, AI service, email or deployment runs. CSP and browser
request filtering supplement the OS network block; service workers cannot bypass
the namespace. Browser profile and service-worker caches are unique to each run.
An unexpected occupied port or changed bootstrap/configuration stops startup.

| Account entered at sign-in prompt | Email | Role / tier | Expected Radar access |
|---|---|---|---|
| `admin` | `admin@example.invalid` | admin / enterprise; Auth admin claim | Visible, preview/confirm permitted |
| `ordinary` | `ordinary@example.invalid` | user / free; no admin claim | Admin upload hidden |
| `other` | `other@example.invalid` | separate user / free; no admin claim | Admin upload hidden; separate profile |

All use `Emulator-only-password-2026`; the adapter supplies it. No real account
is valid. Firestore rules are loaded and read back exactly on both databases.
Radar and frontend use the confirmed named database within **demo-tender-radar**.
The existing legacy STD HTTP routes are not started by this harness; the frontend
continues using the real client SDK. Manual Storage rules allow signed-in STD
file operations only; no production Storage rules are available here, so Storage
authorization parity is **not** claimed. Other `/api` calls return explicit 503.

## Short checklist

Record every row PASS / FAIL / BLOCKED / NOT RUN, in both languages where relevant.

1. **Shell/navigation:** landing loads without a blank screen; navigate sign-in,
   dashboard, profile, Tender Radar settings, privacy and terms; refresh each
   reachable URL. Layout and navigation work at desktop and a narrow viewport.
2. **Account isolation:** sign in `ordinary`; upload controls stay hidden. Sign
   out, sign in `admin`; controls appear. Switch back to `other` during/after a
   preview: previous account's preview disappears and cannot be confirmed.
3. **Real parser flow:** select the printed run directory's
   `synthetic-two-rows.pdf`, count **2**. Preview succeeds without importing;
   confirm imports **2** once. Repeat the same file: duplicates/already-imported,
   no extra records. Wrong count, non-PDF, and editing count/file require a new
   valid preview. Double-click cannot create a second import. Repeat in Bengali.
4. **Full-app persistence:** save a synthetic profile, refresh, and verify it
   persists for that account only. As `admin`, upload a synthetic STD, refresh,
   then delete it; another account must not see it in its owner-filtered list.
   Record any client/rules/schema/Storage errors; do not relax rules to pass.
5. **PWA:** DevTools Application shows the local manifest and activated worker;
   reload once so the page is controlled. Check installability/install if the
   browser offers it. In DevTools Network set Offline, reload: the cached app
   shell renders. Emulator-dependent operations need not work offline. Restore
   Online and check navigation/sign-out again. Record missing install support.
6. **Isolation/limits:** requests go only to local ports 4179, 9098, 8085, 9198.
   External fonts/images/analytics and live AI/email/support are blocked or
   unavailable, not successful integration tests. Record blocked integrations as
   BLOCKED, and unexpected production attempts as failures. This manual pass does
   not replace the unchanged automated security/database/deadline tests.

## Failures and shutdown

The launcher prints a unique `.cache/tender-radar/manual-spa/run-...` directory;
its path is also in `.cache/tender-radar/manual-spa/latest-run.txt`.
Record steps, account, language, expected/actual behavior and sanitized console
source lines in that directory's **`failures.md`**. `events.jsonl` records startup,
page errors and blocked origins; `session.json` records build identity, rules
hash and cleanup after browser exit. Add local screenshots only with synthetic
data; browser profiles contain emulator tokens and must not be published.

Close **all** windows in the launched Chromium session to stop; wait for emulator
shutdown. No emulator state is imported/exported; every launch seeds fresh users.
Keep failed-run evidence. The launcher never marks manual acceptance complete:
the human checklist is the result. PWA update-across-builds, real Google OAuth,
production Storage policy, AI, email and live deployment remain separate checks.
