---
name: audit
description: Pre-commit audit for Reqore components. Runs tests / lint / typecheck, then checks that new or modified components actually wire the standard prop contract through to rendering (intent tints something, size scales something, customTheme reaches sub-components — not just declared), reuse existing Reqore primitives instead of one-off custom JSX or styled wrappers, follow Appendix A in `.tasks/NEW_COMPONENT.md`, have a sensible story matrix that **demonstrably** renders distinct variants (the Intents/Sizes stories actually look different), have tests that cover the standard prop matrix, and don't duplicate logic already living in `src/helpers/`. Invoke as `/audit` before every `git commit` and `git push` — the result is a structured report the user reads before deciding to commit. Never edits files, never invokes git.
---

# `/audit` — Pre-Commit Audit for Reqore

This skill runs before a developer (or another agent) commits or pushes work on Reqore. It is **never optional** — the report must be produced and shown to the user before any commit/push is invoked. The user reads the report, decides what to fix or override, and then proceeds.

## Goal

Catch problems that are easy to fix while the change is fresh and hard to spot in review without running the code:

1. **Tests / lint / typecheck broken.** Deterministic gates.
2. **Standard prop contract declared but not wired.** The headline regression: a new component `extends IReqoreIntent / IWithReqoreSize / IWithReqoreCustomTheme / IWithReqoreTransparent / IReqoreDisabled` etc. but never *uses* the destructured value, so `<ReqoreFoo intent='danger'>` paints nothing. The interface looks right, the prop is accepted by TypeScript, but the visible behaviour is missing.
3. **One-off raw HTML or hand-rolled styled-components where a Reqore primitive fits.** A `<button>` instead of `<ReqoreButton>`, a `<div>` grid instead of `<ReqoreControlGroup>`, a styled wrapper around `<ReqoreTag>` that only changes the colour.
4. **Stories that don't actually demonstrate the prop they claim to.** The classic case: an `Intents` story that renders 5 identical-looking rows because `intent` was never wired, OR because every row is rendered full-width on a 1440px viewport and nothing overflows. The story file exists, but the variants look the same.
5. **Tests that don't cover the standard prop matrix.** Each meaningful prop should have a behavioural assertion.
6. **Helper / code duplication.** A new utility that closely matches an existing one in `src/helpers/`.
7. **Appendix A drift.** `.tasks/NEW_COMPONENT.md` Appendix A is the canonical convention list — `Omit<HTMLAttributes, 'title'>`, `memo + forwardRef`, transient `$`-prefixed style props, class hooks on every meaningful sub-element, sub-element `*Effect` props, no hardcoded pixels.

## Procedure

Run checks in order, collect everything, emit a single Markdown report at the end. Do not stop at the first failure — collect everything so the user can address several findings at once.

### Step 0 — Scope the diff

```bash
git fetch origin --quiet
BASE=$(git merge-base HEAD origin/develop 2>/dev/null || git rev-parse HEAD~1)
git diff --stat $BASE...HEAD
git diff --name-only $BASE...HEAD
git status --short
```

Treat the union of committed + staged + unstaged changes as the audit surface. **Never `git stash`** — Reqore has concurrent agents working in the same branch and stash can lose their work.

For very large diffs (>30 files or >2000 lines), warn the user up front and ask whether to audit the whole diff or just the staged/unstaged slice.

### Step 1 — Deterministic gates

Run in parallel via Bash where possible:

```bash
yarn test            # vitest --project unit
yarn lint            # eslint
yarn build:test:prod # tsc --noEmit
```

- `yarn test` must end with `Tests` summary showing 0 failed. If a test fails, capture the failing test name + first relevant assertion line.
- `yarn lint` must exit 0. Capture any rule violations with file:line.
- `yarn build:test:prod` must exit 0. TypeScript errors are hard stops.

**`yarn test:stories`** (browser-based Storybook interaction tests) is **expensive** — only run it if the diff touches:

- Any `src/stories/**/*.stories.tsx`
- Any component referenced from a `.stories.tsx` `play` function
- `.storybook/` config
- A widely-used primitive that many stories transitively render (`ReqorePanel`, `ReqoreButton`, `ReqoreControlGroup`, `ReqoreEffect`, `ReqoreIcon`)

Otherwise note "skipped — diff does not touch story-bound files." When you do run it, expect a few minutes — set a Bash timeout of at least 600s.

A failing gate is a **hard stop** — the report leads with it.

### Step 2 — Identify components in scope

Enumerate the audit targets from the diff:

- New or modified `src/components/<Name>/index.tsx` files → audited as **components**.
- New or modified `src/stories/<Name>/<Name>.stories.tsx` files → audited as **stories** (cross-checked against the component when one exists).
- New or modified `__tests__/<Name>.test.tsx` files → audited as **tests**.
- New or modified `src/helpers/**` → audited for duplication.

For each component target, read the file and note:

- The component name + props interface name.
- Which Reqore mixins it `extends` (e.g. `IReqoreIntent`, `IReqoreDisabled`, `IWithReqoreSize`, `IWithReqoreCustomTheme`, `IWithReqoreFlat`, `IWithReqoreFluid`, `IWithReqoreEffect`, `IWithReqoreTooltip`, `IWithReqoreTransparent`).
- The styled components it defines and their transient props.
- The sub-components it renders (`<ReqoreButton>`, `<ReqorePanel>`, etc.).

These are the inputs for Steps 3–8.

### Step 3 — Standard contract wiring (the marquee check)

For each component in scope, for each mixin it extends, verify the corresponding prop is **destructured AND used** in a way that affects rendering. Not just spread into `{...rest}`.

| Mixin | Prop | What "wired" means |
|---|---|---|
| `IReqoreIntent` | `intent` | Passed to `useReqoreTheme('main', customTheme, intent, ...)` OR to a styled prop driving colour (e.g. `theme.intents[intent]` in a styled rule) OR passed to a sub-component that respects it. |
| `IWithReqoreSize` | `size` | Used in a lookup (`PADDING_FROM_SIZE[size]`, `RADIUS_FROM_SIZE[size]`, `SIZE_TO_PX[size]`, `CONTROL_TEXT_FROM_SIZE[size]`, ...) OR passed to a sub-component that scales with it. |
| `IWithReqoreCustomTheme` | `customTheme`, `inheritCustomTheme` | Both passed to `useReqoreTheme(...)`. `customTheme` ALSO forwarded to any sub-component that creates its own theme (otherwise descendants lose it). |
| `IWithReqoreEffect` | `effect` | Forwarded to `ReqoreTooltipComponent`, `StyledEffect`, or a sub-component. |
| `IWithReqoreFlat` | `flat` | Drives a border rule OR forwarded to a sub-component. |
| `IWithReqoreFluid` | `fluid` | Drives width via `$fluid` transient prop on the wrapper. |
| `IWithReqoreFixed` | `fixed` | Drives the `flex: 0 0 auto` / non-grow behaviour. |
| `IWithReqoreTooltip` | `tooltip` | Passed to `ReqoreTooltipComponent`. |
| `IReqoreDisabled` | `disabled` | Applies `DisabledElement` styles AND short-circuits interactive handlers (`onClick`, `onPick`, etc. early-return). |
| `IWithReqoreTransparent` | `transparent` | Drops the surface background (`'transparent'` instead of the resolved tint). |

**Detection heuristic:** after the destructure block, grep the rest of the file for each prop name. If the prop appears only in the destructure or only as `{...rest}` re-spread, flag it as "declared, not wired." If the prop appears in a `panelProps={...}` / `buttonProps={...}` forwarded object only, that's *partial* wiring — call it out so the user can decide whether the wrapper itself should also respect it.

Example finding:

> **IReqoreIntent declared but not wired** — [src/components/Foo/index.tsx:42](src/components/Foo/index.tsx#L42). Props interface extends `IReqoreIntent`, `intent` is destructured at line 67, but the only subsequent reference is `<ReqoreButton intent={intent}>` — the wrapper surface itself doesn't tint. If the wrapper has a visible surface (border, background, fade gradient), it should also derive its colour from `intent`. See `Testimonial` / `EntityRow` for the canonical pattern.

### Step 4 — Reqore primitive reuse

Scan each component in scope (and any new view-level JSX) for opportunities to replace bespoke markup with existing Reqore primitives:

**Raw HTML with Reqore equivalents:**

| Raw | Use |
|---|---|
| `<button>` | `<ReqoreButton>` |
| `<input type="text">` etc. | `<ReqoreInput>` |
| `<textarea>` | `<ReqoreTextarea>` |
| `<table>` | `<ReqoreTable>` (or `<ReqoreKeyValueTable>` / `<ReqoreDescriptionList>` for k/v) |
| `<h1>..<h6>` | `<ReqoreH1>..<ReqoreH6>` or `<ReqoreHeading>` |
| `<p>` | `<ReqoreP>` (alias `ReqoreParagraph`) |
| `<span>` (text-bearing, themed) | `<ReqoreSpan>` |
| `<dialog>`, hand-rolled modal | `<ReqoreModal>` |
| `<details><summary>` | `<ReqoreCollapsibleContent>` (for in-place) or `<ReqoreAccordion>` (for header + body) |
| `<a>` | `<ReqoreLink>` |
| Hand-rolled tooltip / popover | `<ReqorePopover>` |
| Floating panel anchored to a trigger | `<ReqorePopover>` + `<ReqorePanel>` |

**Styled wrappers around Reqore primitives** are almost always wrong. Each is a finding unless the styled rule does something a prop genuinely can't:

```bash
git diff $BASE...HEAD -- '*.tsx' '*.ts' | grep -E '^\+.*styled\(Reqore'
```

For each hit, identify the cosmetic change:
- Colour → use `intent` / `customTheme` / `effect`
- Layout / spacing → use `padded` / `paddingSize` / `fluid` / `fixed` / `gapSize`
- Border → use `flat` / `rounded` / `radiusSize` / `intent`
- Background / blur → use `transparent` / `effect.backgroundBlur` / `effect.frost`
- Text styling → use `labelEffect` / `descriptionEffect` / `effect.weight` / `effect.italic` / `effect.uppercase`

**Hand-rolled layout** that maps to existing primitives:

- Vertical or horizontal flex with gap → `<ReqoreControlGroup vertical gapSize=...>`
- 2-column key/value rows → `<ReqoreKeyValueTable>` or `<ReqoreDescriptionList>`
- Sticky list of headed panels → `<ReqorePanel stickyHeader>` per item
- Card with marker + label + description → `<ReqoreFeatureCard>`
- Row with leading icon + label/description/metadata + actions → `<ReqoreEntityRow>`
- Row with severity strip + tag + label + actions → `<ReqoreSeverityRow>`
- KPI tile (number + label + trend) → `<ReqoreStatistic>`
- Quote / endorsement card → `<ReqoreTestimonial>`
- Inline notice + close button → `<ReqoreCallout>`
- Empty state with icon + label + actions → `<ReqoreEmptyState>`

**New helper that closely matches an existing one**:

```bash
# Common helper names that frequently get reinvented
grep -nE '\b(padded|paddingSize|getCellSize|getOneLessSize|getOneHigherSize|resolveRadius|resolvePadding|changeLightness|changeDarkness|getMainBackgroundColor|getReadableColor|getColorFromMaybeString|getReadableColorFrom)\b' src/helpers/
```

If the new helper duplicates one of these by a different name, flag it.

For each hit, write a row pointing at file:line and the recommended primitive / helper. A "keep" must carry a one-line written justification (genuine reason this surface needs custom markup).

### Step 5 — Story matrix that actually varies

For each component in scope, open its story file and verify:

**Required matrix stories** (Appendix A.14):

- `Default` / `Basic`
- `Sizes` — if `IWithReqoreSize`
- `Intents` — if `IReqoreIntent`
- `Bordered` (`flat={false}`) — if `IWithReqoreFlat`
- `Square` (`rounded={false}`) — if the component has a border radius
- `Transparent` — if `IWithReqoreTransparent`
- `Disabled` — if `IReqoreDisabled`
- `Tooltip` — every component
- `Clickable` — if the component is interactive
- `WithEffects` — combined `effect` + sub-element effects
- `CustomTheme` — every component, with `customTheme={{ main: ... }}`
- `Fluid` — if `IWithReqoreFluid`
- `Fixed`, `Raised`, `NoWrap` as applicable

Missing required stories are findings.

**Matrix stories must visibly vary.** This is the lesson from the `CollapsibleContent` Intents/Sizes regression: the file existed, the stories rendered, but every row looked identical because the prop wasn't wired AND the rows were rendered fluid-width on a wide viewport so the content never overflowed.

For each `Sizes`/`Intents`/etc. matrix story, read the render function and verify:

1. The iteration uses distinct values (not the same value with different labels).
2. The container has a **constrained width** if the component is fluid — otherwise on a 1440px Chromatic viewport the content won't overflow / wrap and the variants will look the same. Typical good widths: 720px for content-bearing components, 600px for compact rows.
3. The content is **enough** to demonstrate the prop's effect (a single `<p>` won't show fade variants in a `CollapsibleContent.Sizes` story; multiple `<ReqoreP>`s do).
4. The prop driving the matrix is **actually wired in the component** (covered by Step 3 — but flag matrix stories where the prop isn't wired so the user knows the story is misleading even though it "exists").

**Story title pattern** (post commit `1b6c3cb`):

- `title: 'Display/<Component Name>'` — NOT `'Display/<Component>/Stories'`
- `title: 'Form/<Component Name>'` for form controls
- `title: 'Layout/<Component Name>'` for layout primitives

If the title still uses `/Stories`, that's a finding — the sidebar will show a redundant `Stories` group under each component.

### Step 6 — Test matrix

For each component in scope, open its test file under `__tests__/<Name>.test.tsx`. The test matrix should cover (Appendix A.16):

- Root + each meaningful sub-element class hook (`.reqore-foo-label`, `-description`, `-actions`, etc.)
- Negative cases — optional parts NOT rendered when not provided
- Each intent value (or at least the four primary intents)
- Each size value (or at least `tiny / small / normal / big / huge`)
- `flat={false}` (border on case)
- `rounded={false}`
- `transparent`
- `effect` + sub-element effects together
- `onClick` fires (if interactive)
- `disabled` short-circuits (if interactive + disabled)
- `customTheme`
- Per-prop behaviour for the component-specific props (e.g. `padded={false}` produces no padding; `iconHasBackground={false}` produces no tile; `buttonAlign='right'` lands `align-items: flex-end`)

Missing test classes are findings.

If the standard `ReqoreUIProvider > ReqoreLayoutContent > ReqoreContent` wrapper isn't used, that's a finding too — many hooks (`useReqoreTheme`, `useReqoreProperty`) silently return undefined without it and tests can pass for the wrong reason.

### Step 7 — Duplication / re-use

For each new helper or non-trivial utility introduced in the diff:

```bash
git diff $BASE...HEAD -- 'src/**/*.tsx' 'src/**/*.ts' | grep -E '^\+(export )?(const|function) (use[A-Z]|resolve[A-Z]|get[A-Z]|format[A-Z]|build[A-Z]|parse[A-Z]|render[A-Z])'
```

For each hit:

1. Extract name + signature.
2. `grep -rn` `src/helpers/` and `src/hooks/` for similar names or shapes.
3. If a close match exists, report it: `→ duplicates <other location>; consider importing / parameterizing.`

Common reinventions to watch for (the recent session shows these are the usual suspects):

- Padding axis resolution → `resolvePadding({ padded, paddingSize, verticalMultiplier, horizontalMultiplier })`
- Size scaling → `getOneLessSize` / `getOneHigherSize`
- Color manipulation → `changeLightness` / `changeDarkness` / `getMainBackgroundColor` / `getReadableColor` / `getColorFromMaybeString` / `getReadableColorFrom`
- Theme resolution → `useReqoreTheme(main, customTheme, intent, intentsKey, inheritCustomTheme)`
- Container measurement → `useMeasure` from `react-use`
- Combined refs → `useCombinedRefs`
- Outside-click → `useOutsideClick`

A new component that looks 80% like an existing one (same props subset, same render structure) is also a finding — flag as a candidate for refactor into one parameterized component.

### Step 8 — Appendix A drift

Walk each component in scope against `.tasks/NEW_COMPONENT.md` Appendix A:

- **A.2:** Props interface extends `Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>` (NOT bare `HTMLAttributes`). The omit blocks the HTML `title` attribute from colliding with the standard Reqore `label` slot.
- **A.3:** `memo + forwardRef` wrapper. `ReqoreTooltipComponent` as the render-time wrapper (gives every component a free `tooltip` prop and propagates `effect` / `customTheme` / `disabled`). `useReqoreTheme(...)` (NOT direct context reads). `className` merges with the existing one and includes `.reqore-<component-name>`.
- **A.4:** Styling-only props on styled components use `$` prefix (transient). Pass-through props (`flat`, `rounded`, `size`) stay un-prefixed when they're also part of the public API.
- **A.5:** No hardcoded pixels — use `PADDING_FROM_SIZE`, `RADIUS_FROM_SIZE`, `SIZE_TO_PX`, `ICON_FROM_SIZE`, `CONTROL_TEXT_FROM_SIZE`.
- **A.6:** Use colour helpers (`changeLightness`, `getMainBackgroundColor`, `getReadableColor`, `getColorFromMaybeString`) not hex literals.
- **A.7:** Each text-bearing element gets its own `*Effect` prop (`labelEffect`, `descriptionEffect`, `metadataEffect`) for sub-element overrides.
- **A.8:** Badges via `<ButtonBadge>` with `margin='none'` inside a flex parent (not rolled by hand).
- **A.9:** `wrap={false}` truncation cascades into the actual text-bearing child via `& > *` selector on a `StyledTextSlot` — NOT applied to the wrapping `<div>`.
- **A.10:** Border respects `intent` when present (`changeLightness(intent ? theme.intents[intent] : getMainBackgroundColor(theme), 0.08)`).
- **A.11:** `raised` uses the shared `RaisedElement` helper, gated on `flat !== false` (to suppress the highlight when a border is rendered).
- **A.12:** Doesn't reinvent existing `IReqoreEffect` features (`gradient`, `glow`, `frost`, `backgroundBlur`, `weight`, `italic`, etc.) — pipes the `effect` prop through.
- **A.13:** Class hooks on every meaningful sub-element (`.reqore-<name>-label`, `-description`, `-actions`, etc.) for testability.
- **A.17:** Component exported from `src/index.tsx` in alphabetical order. Entry added to `src/components/COMPONENTS.md`.
- **A.18:** Doesn't silently drop `children` when supporting both `children` and structured props (`label` + `description`). Either fall back, render both, or document precedence.

Each missing item is a row pointing at the file:line.

### Step 9 — Compose the report

Emit a single Markdown report with this shape. Use `[name](path#Lline)` links so the user can click into the IDE.

```markdown
# /audit report — <branch> @ <short-sha>

## ✅ Passing gates
- yarn test: <N> tests, 0 failed (<duration>)
- yarn lint: clean
- yarn build:test:prod: clean
- yarn test:stories: skipped — diff does not touch story-bound files
  (OR: <N> stories, 0 failed)

## ❌ Hard stops (fix before committing)
1. **yarn test failed**: `__tests__/Foo.test.tsx > Renders <Foo /> with intent` — `expected null to be truthy`
2. **lint error**: `src/components/Foo/index.tsx:42` — `'theme' is declared but its value is never read.`

## ⚠️ Standard contract not wired
- [src/components/Foo/index.tsx:42](src/components/Foo/index.tsx#L42) — `IReqoreIntent` extended but `intent` is destructured at line 67 and never read again. → Pass to `useReqoreTheme(..., intent, ...)` and to the inner `<ReqoreButton intent={intent}>`.
- [src/components/Foo/index.tsx:55](src/components/Foo/index.tsx#L55) — `IWithReqoreSize` extended but the wrapper has no size-scaled padding/text. → Use `PADDING_FROM_SIZE[size]` for outer padding so size visibly scales the surface, not just the inner button.

## ⚠️ Should use Reqore primitive
- [src/components/Bar/index.tsx:88](src/components/Bar/index.tsx#L88) — raw `<button>`. → Replace with `<ReqoreButton>`.
- [src/components/Bar/index.tsx:120](src/components/Bar/index.tsx#L120) — `styled(ReqoreTag)\`color: red\``. → Use `<ReqoreTag intent='danger'>` instead of wrapping.
- [src/components/Bar/index.tsx:145](src/components/Bar/index.tsx#L145) — vertical flex with `gap: 8px`. → Use `<ReqoreControlGroup vertical gapSize='small'>`.

## ⚠️ Story matrix gaps
- [src/stories/Foo/Foo.stories.tsx:165](src/stories/Foo/Foo.stories.tsx#L165) — `Intents` story iterates `DEFAULT_INTENTS` correctly, BUT each row renders fluid-width and the content (3 paragraphs) fits within the 1440px viewport, so the fade never triggers and all intents look identical. → Constrain to `style={{ width: 720, maxWidth: '100%' }}` and use 4+ paragraphs.
- Missing `Disabled` story for `<ReqoreFoo>`.
- [src/stories/Bar/Bar.stories.tsx:14](src/stories/Bar/Bar.stories.tsx#L14) — `title: 'Display/Bar/Stories'` uses the deprecated `/Stories` suffix (removed in commit 1b6c3cb). → Change to `'Display/Bar'`.

## ⚠️ Test matrix gaps
- `__tests__/Foo.test.tsx` — no test asserts `intent` is rendered.
- `__tests__/Foo.test.tsx` — no test for `disabled` short-circuiting `onClick`.

## ⚠️ Duplication
- `resolveFooBar` in [src/components/Foo/index.tsx:42](src/components/Foo/index.tsx#L42) — same shape as `resolvePadding` in [src/helpers/utils.ts](src/helpers/utils.ts). → Import the shared helper.

## ⚠️ Appendix A drift
- [src/components/Foo/index.tsx:20](src/components/Foo/index.tsx#L20) — props interface uses bare `React.HTMLAttributes<HTMLDivElement>`. → Use `Omit<..., 'title'>` per A.2.
- [src/components/Foo/index.tsx:140](src/components/Foo/index.tsx#L140) — hardcoded `padding: 12px`. → Use `PADDING_FROM_SIZE[size]` per A.5.
- `<ReqoreFoo>` not exported from `src/index.tsx`.
- No entry in `src/components/COMPONENTS.md` for `<ReqoreFoo>`.

## ℹ️ Justifications recorded
- (none)

## Suggested next step
Address the **hard stops** first, then walk the **Standard contract not wired** rows top-down — those are the bugs that look right in TypeScript but render wrong in the browser. Re-run `/audit` after each cluster.
```

## Operating notes

- The audit **never edits files** and **never invokes `git commit` or `git push`**. It reports; the user/agent then chooses what to fix.
- Always emit a section — even an empty one (`- (none)`) — for each of: Hard stops, Standard contract, Reqore primitive reuse, Story matrix, Test matrix, Duplication, Appendix A drift, Justifications. A silent section is suspicious; explicit `(none)` makes the absence visible.
- A **new file** in the diff (especially under `src/components/<NewName>/index.tsx`) deserves extra scrutiny — a brand-new component is the highest-leverage point to ask "does this match Appendix A and the standard contract end-to-end?"
- For single-typo / comment-only / regenerated-docs diffs, the report is one paragraph and explicitly says so — no need to walk every section.
- `yarn test:stories` is gated: run only if the diff touches story-bound files, otherwise skip and say so. Set a Bash timeout ≥ 600s when running it.
- Story `play` functions should query inside `waitFor` (not capture the result outside) — flag any `const x = canvasElement.querySelector(...); await waitFor(() => expect(x).toBeTruthy())` pattern as fragile (captures once, can fail when mount is delayed).
- The audit can spawn an `Explore` sub-agent for large diffs to parallelize the per-file reading; merge findings into the final report.
- If a finding is genuinely a false positive (e.g. a component intentionally has no size-scaled wrapper because it's a transparent disclosure widget), the user can record a one-line justification in the **Justifications recorded** section. A blanket "keep" with no reason is not acceptable — the report must call it out.
