# RANDOM_ISSUE.md — v2 (Find & Fix One Real Issue)

## Mission

You are to act as a senior engineer reviewing this repository.

Your task is to:

1. **Scan the codebase**
2. **Identify ONE real, defensible issue**
3. **Create a concrete plan**
4. **Fix it**
5. **Open a PR against `develop`**

This is not an exploration task.
This is not a refactor exercise.
This is a _deliver one meaningful improvement_ task.

---

## What qualifies as an issue

Pick **one** of the following (or justify a close equivalent):

- **Bug** (logic error, broken edge case, incorrect behavior)
- **UX issue** (accessibility, keyboard/focus behavior, confusing interaction, inconsistency)
- **Performance issue** (unnecessary re-renders, heavy render-time work, avoidable allocations)
- **Design flaw** (leaky abstraction, misuse-prone API, inconsistent behavior)
- **Code duplication** that clearly increases maintenance cost
- **DX issue** that demonstrably slows or confuses contributors

If you cannot prove the issue exists, it does **not** qualify.

---

## ReQore priority targets (pick from these first)

Prefer issues in:

- core components used widely (Button, Input, Modal/Drawer, Tooltip/Popover, Table, Form controls)
- theming, tokens, variants, styling utilities
- shared hooks and utils
- Storybook stories and play functions
- accessibility (ARIA, focus management, keyboard navigation, reduced motion)
- render performance (unstable props, excessive renders, layout thrashing)

Strong candidates include:

- missing or incorrect `aria-*`
- broken focus trap / escape key handling
- inconsistent disabled/loading states
- unnecessary re-renders caused by inline objects/functions
- duplicated variant or style mapping logic

---

## Hard bans (these will fail review)

- ❌ Formatting-only or lint-only changes
- ❌ Rename-only changes
- ❌ Refactors without a functional win
- ❌ Dependency upgrades unless required to fix the issue
- ❌ API changes unless strictly necessary
- ❌ Suppressing errors with `any`, `@ts-ignore`, or broad disables
- ❌ “This feels cleaner” or “more readable” justifications

---

## Candidate triage (MANDATORY)

Before picking the issue, list **3–6 candidates**:

For each candidate:

- type (bug / UX / perf / etc.)
- location (files/components)
- evidence (repro steps, code-path proof, test failure, observable behavior)
- estimated effort (S / M / L)

Then:

- **pick exactly ONE**
- explain why it wins (impact × confidence × reviewability)

---

## Evidence requirement (non-negotiable)

Your chosen issue MUST include at least one:

- minimal reproduction (steps + expected vs actual)
- failing test added first (red → green)
- before/after measurement (render count, timing, bundle size, etc.)
- clear code-path explanation of why and when it breaks

No evidence → no fix.

---

## Implementation plan (required format)

Before writing code, produce this plan:

### Selected issue

- Type:
- Location:
- Why it matters:
- Evidence:

### Fix approach

1. …
2. …
3. …

### Verification

- Automated:
- Manual:
- Risk / rollback:

---

## UX changes checklist (mandatory for UI work)

If the change affects UI/UX, you MUST check and document:

- keyboard navigation (Tab / Shift+Tab / Enter / Space / Esc)
- focus behavior on open/close
- screen reader semantics (roles, labels)
- at least one Storybook interaction test **or** a precise manual checklist
- before/after screenshot or GIF if visible

---

## Required local verification

Run locally and report in the PR:

- `yarn install`
- `yarn lint` (if present)
- `yarn typecheck` or `yarn tsc`
- `yarn test` / `yarn vitest run`
- `yarn storybook` or `yarn build-storybook` if UI behavior changed

---

## Workflow

1. Create branch: `random-issue/<short-slug>`
2. Implement the **smallest coherent fix**
3. Add or update tests
4. Run full verification
5. Increase minor version (e.g., `1.0.0` → `1.1.0`) if you made a non-breaking change
6. Open PR targeting **`develop`**

---

## Commit rules

Max **3 commits**:

- `test: reproduce <issue>` (optional but preferred)
- `fix: <what + why>`
- `docs/chore: <only if strictly required>`

Each commit message must explain **why** the change exists.

---

## PR requirements

**Title**

- `Fix: <short description>` or `Improve: <short description>`

**Description must include**

- Summary (1–3 sentences)
- Evidence
- What changed (bullets)
- Verification (commands + manual checks)
- Screenshots/GIFs (if UI)
- Notes / follow-ups (optional)

---

## Final guardrail

If no meaningful issue is found:

1. Document what you inspected
2. List 2–3 credible candidates with pros/cons
3. Pick the smallest **real** improvement OR stop

Never force a change.

---

## Expected output from you

1. Candidate triage
2. Implementation plan
3. Code + tests
4. PR against `develop`
