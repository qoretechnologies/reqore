# NEW_COMPONENT.md — Add One New Component (Repo-Conformant)

## Mission

You are to design and implement **one new UI component** that belongs in this library.

This is not a playground task. The new component must:

- solve a real UI need,
- match the library’s conventions,
- include docs/stories/tests,
- and be shipped as a PR against `develop`.

---

## Hard bans (will fail review)

- ❌ No “toy components” (e.g., pointless wrappers, novelty components).
- ❌ No dependency additions unless absolutely necessary and aligned with repo norms.
- ❌ No API design that ignores existing patterns in this repo.
- ❌ No public API breaking changes.
- ❌ No `any`, `@ts-ignore`, broad disables, or weakening types to “make it work”.
- ❌ No styling approach that diverges from the repo’s established system.

---

## Step 1 — Learn the repo patterns (required)

Before proposing anything, scan and summarize:

- how components are structured (folders/files, naming, exports)
- styling/theming/token usage patterns
- how variants/props are modeled
- accessibility conventions (ARIA, focus, keyboard)
- Storybook conventions (stories structure, play tests)
- test conventions (Vitest/Jest/RTL/etc.)
- documentation conventions (MDX/README, prop tables, examples)
- how components are added to the public API (index exports)

Output a short “Repo conventions” bullet list.

---

## Step 2 — Propose candidates (mandatory)

Propose **3–5 component ideas** that are plausible for this library.

Each candidate must include:

- Name
- Problem solved / why it belongs
- Comparable components in popular libs (only as reference, do not copy)
- API sketch (props + events)
- Accessibility considerations
- Estimated complexity (S/M/L)

Then pick **exactly one** to implement, based on:

- impact to users,
- fit with the library,
- reviewability (small surface area),
- confidence (low risk).

---

## Step 3 — Design the API (required)

For the chosen component, define:

### Component contract

- Component name:
- Purpose:
- Key behaviors:
- Controlled vs uncontrolled behavior (if applicable):
- Default props:
- Edge cases:
- Accessibility behavior (keyboard, focus, roles, labels):
- Theming/styling approach:
- “Do not do” list (misuse prevention):

### Files to touch

List exact files/dirs you will add or modify.

---

## Step 4 — Implement (required)

Implement the component strictly following repo conventions:

- increase major version if you add a new component (e.g., `1.0.0` → `2.0.0`)
- switch to a branch named `feature/<component-name>` (e.g., `feature/Tooltip`) must be clean and well-structured, with clear naming and consistent patterns.
- structure, naming, exports
- tokens/theme usage
- typing style
- consistent prop naming and event patterns
- consistent className/slot patterns (if present)

Keep scope minimal: **one component**, plus required supporting pieces.

---

## Step 5 — Storybook & docs (required)

Add Storybook coverage consistent with the repo:

- at least 2–4 stories showing common usage
- include edge state(s) (disabled/loading/error/etc. if relevant)
- include a story with interactions if the component is interactive

If the repo documents components in MDX/README:

- add docs entry with basic usage + props overview

---

## Step 6 — Tests (required for non-trivial behavior)

Add tests consistent with repo style. Cover:

- rendering smoke test
- at least one behavioral test (events, keyboard, state transitions)
- accessibility-related expectations where feasible

---

## Step 7 — Verification (required)

Run and report results in PR:

- `yarn install`
- `yarn precheck`
- `yarn vitest src/stories/*` replace \* with your new story file

---

## PR requirements

Open a PR targeting **`develop`**.

### PR title

`Add: <ComponentName>`

### PR description must include

- Summary (what + why)
- API overview (props/events)
- Accessibility notes (keyboard/focus/ARIA)
- Stories added
- Tests added
- Verification commands run
- Screenshots/GIF if visually meaningful

---

## Commit rules

Max 3 commits:

- `feat: add <ComponentName>`
- `test: add coverage for <ComponentName>` (optional)
- `docs: document <ComponentName>` (optional)

No “misc fixes” commits.

---

## Final guardrail

If you cannot find a component idea that is genuinely useful and fits the library:

- do not implement anything
- instead produce a shortlist with pros/cons and stop
