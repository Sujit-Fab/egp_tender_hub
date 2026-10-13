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

## Database decision required before ingestion

All references are to project `gen-lang-client-0089421810`, but they select three
different Firestore databases:

| Consumer | Database ID | Evidence |
| --- | --- | --- |
| Frontend | `ai-studio-7e6a1daf-95b8-46d0-a6ba-7cf295cd1701` | `firebase-applet-config.json`, `src/firebase.ts` |
| SoR import | Same named database as the frontend | `scripts/import-sor.cjs` |
| Rules deployment configuration | `ai-studio-4e239597-e97a-4fa4-9fc6-820d5d24cb34` | `firebase.json` |
| Existing Functions STD routes | `(default)` | `admin.firestore()` in `functions/index.js` |

The initial repository commit already contains the disagreement between the
frontend and rules configuration. This does not establish which database the
owner intends for production. Ingestion must not select a target by inference.
The owner has been asked to confirm the exact database ID. Existing frontend,
STD backend and rules targets are unchanged by this review.

## Remaining stage work

After the database is confirmed, add authenticated admin preview and confirmation
using the working top-level `lib/tender-radar` parser and canonical category
matcher. Bound PDF bytes and parsing resources, verify parsed output, reject
invalid data, and make persistence atomic and duplicate-safe. Preview must not
persist tenders; confirmation must validate the actual file again rather than
trusting client-supplied records. Add meaningful ingestion and UI tests.

Scheduled email delivery remains disabled. This stage does not merge, deploy,
change live Firebase resources, or send email. Test fixture contents and
credentials must not appear in logs or PR descriptions.
