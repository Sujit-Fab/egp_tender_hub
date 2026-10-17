# Proposed release review: no production action authorized

This document is a proposal for a future, separately approved release window.
Writing it does not authorize deployment, production inspection, admin claims,
data changes, scheduling, emails or merging PR #36. The PR stays draft.

## PR-specific acceptance and coverage

The Linux suites exercise isolated `demo-tender-radar` Auth, named Firestore and
Storage only. The OS network namespace, credential scrubbing, socket/request
guards and exact rules readback remain required. The production parser deadline
is still 45,000 ms. A result belongs only to its exact source commit and fresh
run identity; use the final-commit CI artifact rather than historical counts.

Two enterprise non-admin demo users exercise STD uploads, reloads, independent
Firestore metadata and exact Storage byte reads, owner-filtered UI lists, and
deletion of both metadata and object. This is **not** a cross-user authorization
or confidentiality test. Repository Firestore rules allow authenticated STD reads;
the demo Storage rules allow any signed-in user to read/write `/stds/{file}`.
Those Storage rules are test-only and are never a proposed production policy.
Production Storage rules are not present or verified by this work.

Eight synthetic desktop/mobile English/Bengali screenshots support human visual
review. They do not prove persistence, browser installation or real-device touch
behavior. Their manifest binds each PNG and hash to the exact source/run.
Profiles, raw traces, raw PDFs and credential-bearing URLs are not published.
Actual PWA installation/OS integration and profile persistence/account switching
remain explicitly untested. No unrelated profile/STD behavior is changed.

## Proposed named-database rules rollout

Target: project `gen-lang-client-0089421810`, database
`ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701` (owner-confirmed frontend/Radar
target). PR #36 corrects `firebase.json` from a different named database. Rules
text is unchanged by the PR, but applying it to another database is a material
release decision. Never treat the previous database ID as this target's rollback.

1. **Approve scope and prerequisites before any production action.** Name the
   release owner, source commit, reviewed rules artifact/hash, explicit project
   and database, maintenance/monitoring window, abort criteria and rollback owner.
   Do not use the existing deploy-all workflow as a rules rollout mechanism.
   It does not deploy Firestore rules and masks deployment failures.
2. **Capture the real rollback baseline in that future authorized window.**
   Record the target database's current rules release identifier, complete rules
   source/hash and associated configuration in a restricted release record.
   Record the prior app/API artifacts and the unaffected default/other database
   release identifiers. Do not assume the repository's old rules-target setting
   or current repository rules equal what is actually deployed. No data export
   or migration is implied by this rules change.
3. **Review the baseline-to-candidate policy diff.** Include users, analyses,
   payments, support, SoR and STD collections, not just Radar. Confirm expected
   direct-client denials for Radar collections and nested paths. Any permissive
   existing production rule, unexpected database mapping or unrelated policy
   change is a stop condition requiring a separate decision. Do not replace
   production Storage rules with the demo rules.
4. **Rehearse before rollout.** Load the reviewed candidate into isolated demo
   named/default databases, require exact readback, all current automated suites,
   zero isolation violations and verified cleanup. Review the resulting visual
   captures and keep incomplete human checks explicit. Agree a controlled
   fail-closed rollback path before enabling imports.
5. **Future approved rollout only.** Release rules explicitly scoped to the
   confirmed named database using a reviewed, pinned tool invocation that fails
   on errors. Check the exact selector against that tool version before approval;
   do not run a broad database/Functions deployment. Require release success and
   exact named-database rules readback before the reviewed API/UI release proceeds.
   Verify other databases' rules releases remain unchanged. Establishing live
   `admin: true` Auth claims is separate approval; Firestore `role: admin` alone
   does not authorize ingestion. Scheduling and email remain disabled.
6. **Monitor and stop on mismatch.** Compare the recorded rules/artifact identity
   and approved smoke-check outcomes. Unexpected denials, permission expansion,
   wrong target, incomplete rollout or uncertain deployment status stops release
   and triggers the agreed rollback decision. No live import or write test is
   authorized by this document; any such test requires explicit separate scope.

## Proposed rollback

- Pause further administrator imports using the approved operational control and
  restore the reviewed previous UI/API artifact if needed. Do not weaken Auth or
  rules to make the new importer work.
- Restore the **captured previous rules release/source for the same confirmed
  named database**, with an explicitly scoped, error-propagating release. Verify
  its hash/release identifier and verify default/other database releases remain
  unchanged. If the captured baseline is itself unsafe, stop for the release
  owner's decision rather than silently reinstalling an unsafe policy.
- Treat already committed tender batches/receipts as data: an app/rules rollback
  does not undo them. Preserve provenance, inventory any completed imports and
  propose a separately reviewed reconciliation if needed. No automatic deletes,
  overwrites, collection migration or data restoration is part of this plan.
- Record rollback artifacts, timestamps, outcomes and remaining access limits;
  keep ingestion disabled until a new reviewed candidate is approved.

## Pre-existing issues: separate work, not fixed here

These observations come from source comparison with PR #36's base, not a live
security audit. They can still affect release decisions despite predating this PR.

- `functions/index.js` legacy STD GET/upload/delete handlers lack token, role
  and ownership checks and use the Admin SDK. The STD database regression fix
  preserves `(default)`; it does not fix those authorization problems.
- `src/App.tsx` uses a shared `company_profile` localStorage key and does not
  clear profile state on sign-out. Profile save UI reports success before the
  asynchronous Firestore write finishes. Source-level isolation/persistence risks
  remain; this PR neither changes them nor claims they are resolved.
- Firestore authenticated STD reads are broad. Owner-filtered UI queries are
  not confidentiality enforcement. STD metadata and Storage deletion are separate
  operations; this acceptance test validates the happy path, not atomic deletion
  under storage/database failure.
- `.github/workflows/deploy-functions.yml` uses `npm install`, installs an
  unpinned Firebase CLI, deploys all Functions with `--force`, suppresses deployment
  failures and omits Firestore rules deployment. Unrelated local workflow edits
  remain outside this change.
- `vite.config.ts` can embed a configured `GEMINI_API_KEY` in frontend output.
  No production build/key was inspected and no key exposure is claimed observed.
- Existing STD form labels remain English in Bengali mode. The synthetic captures
  show the current behavior for review; no localization fix is included.

Optional separate work includes physical-device interaction, PWA installation
and update-across-builds review, and Windows native-worker compatibility if
Windows execution is a supported requirement. None is silently marked passed.
