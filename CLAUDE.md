# CLAUDE.md — Project Rules for eGPTenderHub

Read this at the start of every session. These rules are strict and override any default behavior.

## What this project is
- eGPTenderHub (egptenderhub.com): a React 19 + Vite 6 + TypeScript + Tailwind v4 SPA.
- It helps Bangladeshi contractors check eligibility for government e-GP tenders. This eligibility tool is the CORE PRODUCT and the owner's business.
- Backend: Firebase Functions (Express API at `/api/**`) + Firestore. Hosting: Firebase Hosting (`public: "dist"`).
- `react-router-dom` v7 is installed but NOT currently used; navigation uses an internal `view` state in a large `App.tsx` (~2400 lines).
- Blog posts are hardcoded as an array in `src/components/Blog.tsx` (bilingual: `contentEn` / `contentBn` markdown strings).

## ABSOLUTE RULES (never break these)
1. **NEVER touch, modify, or risk the eligibility tool, company profile, Firestore logic, or `/api/**` functions.** If a change might affect them, STOP and ask the owner first.
2. **NEVER commit directly to `main`.** Always create a feature branch and open a Pull Request.
3. **NEVER merge anything.** Only the owner merges, after the GitHub Actions build passes green.
4. **Work in small, reviewable steps.** After each meaningful change, stop and explain what you did and what you plan next. Wait for the owner's approval before continuing.
5. **Do not run destructive commands** (no force-push, no `rm -rf`, no history rewrite, no dependency removal without asking).
6. **Keep the build working.** The project uses `vite build` with `vite-plugin-pwa`. If you change build config, verify `npm run build` succeeds locally before pushing.
7. **Preserve bilingual content.** Every blog post has `contentEn` and `contentBn`. Never drop a language.
8. **No backend or database changes** unless you flag it clearly and the owner explicitly approves.

## Permission behavior
- Stay in the DEFAULT permission mode: ask before every file edit and every shell command.
- The owner is a non-developer working carefully. Explain each step in plain language before doing it.

## How the owner deploys
- Owner pushes a branch → opens a PR on GitHub → waits for the "Deploy Firebase Functions" GitHub Action to pass green → then merges → Firebase Hosting deploys automatically.
- Your job ends at "branch pushed + PR opened + build green." The owner does the merge.

## If something is ambiguous
- Do NOT guess or invent requirements. Stop and ask the owner a specific question.
- If a task turns out to need a bigger change than expected (especially anything touching `App.tsx` routing or Firebase config), STOP, explain the risk, and wait for approval before proceeding.
