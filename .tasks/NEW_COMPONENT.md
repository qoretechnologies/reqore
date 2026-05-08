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

### Custom theme handling (required)

- Extend `IWithReqoreCustomTheme` in the component's props interface — this provides `customTheme` and `inheritCustomTheme` props
- Destructure both `customTheme` and `inheritCustomTheme` from props
- Pass them to `useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme)`
- If the component wraps children with `ReqoreThemeProvider`, also pass the raw `customTheme` prop: `<ReqoreThemeProvider theme={theme} customTheme={customTheme}>` — this allows descendant components to automatically inherit the custom theme via `CustomThemeContext` without prop drilling

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

---

# Appendix A — Repo idioms & gotchas (read before Step 4)

These are concrete patterns distilled from real components in this repo (`ReqoreStatistic`, `ReqoreProgress`, `ReqoreFeatureCard`, `ReqoreCallout`, `ReqorePanel`, `ReqoreSeverityRow`, `ReqoreEntityRow`). Every one of them was a real review correction that should not have to happen twice.

## A.1 Prop naming — match the library, do not invent

| Use this | Not this | Why |
|---|---|---|
| `label` | `title` | `title` is an HTML reserved attribute. Every existing Reqore component (`Panel`, `Button`, `FeatureCard`, `Statistic`, `Tier`) uses `label`. |
| `description` | `subtitle`, `subLabel`, `secondary` | Used consistently across `Panel`, `FeatureCard`, `EmptyState`. |
| `transparent: boolean` | `tinted`, `noTint`, `withBg` | Polarity matches `ReqorePanel` / `ReqoreStatistic`. Default `false`; pass `true` to drop the surface. |
| `flat: boolean` | `bordered`, `outlined` | Default rendering shows a border; `flat={true}` drops it. Same polarity as Panel/Button/etc. |
| `rounded: boolean` | `square`, `pill` (unless explicitly a pill component) | Default `true`; `rounded={false}` makes it square. |
| `badge: TReqoreBadge \| TReqoreBadge[]` | `badges`, `tag`, `chip` | Reuse `Button.TReqoreBadge`. Render via `ButtonBadge`. |
| `actions: IReqoreXxxAction[]` | `buttons`, `controls` | Each action extends `Omit<IReqoreButtonProps, 'children'>` plus an optional `label` field. Same as `Panel.actions`. |
| `effect`, `labelEffect`, `descriptionEffect`, `metadataEffect` | `style`, `theme`, `appearance` | One `*Effect` prop per text-bearing element. The wrapper takes `effect`. |
| `intent: TReqoreIntent` | `severity`, `level`, `kind` | Always use the `IReqoreIntent` contract. Map domain concepts (severity, status) to intents in the consumer. |
| `disabled`, `tooltip`, `customTheme`, `inheritCustomTheme`, `fluid`, `fixed`, `size` | anything else | Inherit from the standard global type contracts (see A.2). |

**Rule of thumb**: before naming a prop, grep `src/components/Panel/index.tsx` and `src/components/Button/index.tsx` for the closest concept. If those use a name, you must use the same name.

## A.2 Standard contract checklist

Every interactive surface component should extend the matching contracts so consumers get the same prop bag everywhere:

```ts
export interface IReqoreXxxProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  // Component-specific props go here.
}
```

Add `IWithReqoreFixed` for components that can be used in flex layouts where shrinking is sometimes wrong.

The `Omit<React.HTMLAttributes<...>, 'title'>` is critical — without it, callers can pass `title='...'` (the HTML attribute) which collides with any `title` field you might tempt yourself into adding. Block it explicitly.

## A.3 Required structural patterns

```ts
const ReqoreXxx = memo(
  forwardRef<HTMLDivElement, IReqoreXxxProps>(
    ({ /* destructure all */ }, ref) => {
      const theme = useReqoreTheme(
        'main',
        customTheme,
        intent,                  // pass intent only when the component should colour-shift
        undefined,
        inheritCustomTheme,
      );

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledXxx}
          tooltip={tooltip}
          ref={ref}
          theme={theme}
          {/* transient props, see A.4 */}
          className={`${className || ''} reqore-xxx`}
        >
          {/* body */}
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreXxx;
```

- **`memo` + `forwardRef` are non-negotiable** — without `forwardRef`, parents can't measure / scroll to / focus the component.
- **`ReqoreTooltipComponent` is the wrapper that gives every component a free `tooltip` prop.** Using it also propagates `effect`, `customTheme`, `disabled` correctly. Never wire tooltip yourself.
- **`useReqoreTheme(...)`** for theme resolution. Don't read theme directly from context; the hook applies intent + customTheme correctly.
- **`className` always merges with the existing one** and includes a `.reqore-<component-name>` hook for tests.

## A.4 Styled components — transient props

Styled-components forwards all unknown props as DOM attributes. Anything that's a styling-only flag MUST be a transient prop (`$prefix`) so it doesn't leak to the DOM:

```ts
interface IStyledXxxProps {
  theme: IReqoreTheme;
  size: TSizes;
  $fluid?: boolean;        // ← transient (styling-only)
  $intent?: TReqoreIntent; // ← transient
  $tinted?: boolean;       // ← transient
  flat?: boolean;          // not transient — also a real prop on the public API
  rounded?: boolean;       // same
}
```

Pass them through with the `$` prefix at the render site:

```tsx
<StyledXxx
  $fluid={fluid}
  $intent={intent}
  flat={flat}
  rounded={rounded}
/>
```

## A.5 Sizing — never hardcode pixels

Use the size lookup tables in `constants/sizes`:

- `PADDING_FROM_SIZE[size]` for content padding
- `RADIUS_FROM_SIZE[size]` for border radius
- `TEXT_FROM_SIZE[size]` / `CONTROL_TEXT_FROM_SIZE[size]` for font size
- `ICON_FROM_SIZE[size]` for icon size

If your component has its own scale (e.g. an icon tile that's bigger than a regular icon), define a per-component table:

```ts
const ICON_TILE_SIZE_FROM_SIZE: Record<TSizes, number> = {
  micro: 18, tiny: 22, small: 26, normal: 32, big: 40, huge: 48, massive: 56,
};
```

Don't hardcode `28px` in the styled component.

## A.6 Colour helpers — use the toolkit, not hex

```ts
import {
  changeLightness,
  changeDarkness,
  getMainBackgroundColor,
  getReadableColor,
  getColorFromMaybeString,
} from '../../helpers/colors';
import { rgba } from 'polished';
```

- `theme.intents[intent]` for intent-coloured fills
- `changeLightness(getMainBackgroundColor(theme), 0.08)` for subtle borders
- `rgba(theme.intents[intent], 0.06)` for tinted backgrounds
- `getReadableColor(theme, undefined, undefined, true)` for foreground that adapts to the surface

**Reqore colour shorthand strings** (work anywhere a `TReqoreEffectColor` is accepted):

```
'main:lighten:5'       // 5 steps lighter than theme.main
'success:darken:2'     // 2 steps darker than theme.intents.success
'info:lighten:2:0.6'   // intent.info, 2 steps lighter, 0.6 opacity
```

Use these for design tokens like dimmed chip surfaces (`customTheme={{ main: 'main:lighten:5' }}`) instead of hardcoded hex.

## A.7 Effect prop trifecta — every text-bearing element gets one

For a component with `label` + `description` + `metadata`:

```ts
labelEffect?: IReqoreEffect;
descriptionEffect?: IReqoreEffect;
metadataEffect?: IReqoreEffect;
effect?: IReqoreEffect;  // applied to the wrapper for backgrounds/gradients
```

Pass them to the inner elements with sensible defaults merged via spread:

```tsx
<ReqoreP effect={{ opacity: 0.7, ...descriptionEffect }}>{description}</ReqoreP>
```

That way the consumer's effect always wins on conflicts but the default opacity etc. carries through for unset fields.

The wrapper itself uses `styled(StyledEffect)` so the `effect` prop applies to the surface (gradients, glows, frost, drop-shadow filters):

```ts
const StyledXxx = styled(StyledEffect)<IStyledXxxProps>` /* ... */ `;
```

## A.8 Badges — reuse `ButtonBadge`, never roll your own

```tsx
import ReqoreButton, { ButtonBadge, TReqoreBadge } from '../Button';

// In your styled label row:
{hasBadge && <ButtonBadge size={size} content={badge} margin='none' />}
```

**`margin='none'` is critical** when the badge is inside a flex container with its own `gap`. The default `margin='left'` adds a `ReqoreSpacer` which double-spaces inside a flex parent and creates visible gaps. Use `'none'` and let the flex `gap` handle spacing.

## A.9 Truncation / `wrap={false}` — cascade ellipsis, never apply to the wrapper

The CSS `text-overflow: ellipsis` only takes effect on the actual text-bearing element. Applying it to a wrapping `<div>` just clips the inner text without rendering the `…` glyph. The correct pattern:

```ts
const StyledTextSlot = styled.div<{ $wrap: boolean }>`
  min-width: 0;
  ${({ $wrap }) =>
    !$wrap &&
    css`
      flex: 1 1 auto;
      overflow: hidden;

      & > * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
        max-width: 100%;
      }
    `}
`;
```

Then wrap each truncatable element with `<StyledTextSlot $wrap={wrap}>`. The `& > *` selector cascades into the inner `<ReqoreP>` / `<ReqoreSpan>` / `<ReqoreHeading>`.

For multi-element rows (label + leading tag + badge), only wrap the LABEL in `StyledTextSlot` so the leading tag and badge keep their natural width while the label ellipsizes.

## A.10 Border behaviour — honour `intent` when present

```ts
border: ${({ flat, theme, intent }) =>
  flat
    ? 'none'
    : `1px solid ${changeLightness(
        intent ? theme.intents[intent] : getMainBackgroundColor(theme),
        0.08
      )}`};
```

When the consumer passes `intent='danger'` and `flat={false}`, the border should be danger-coloured at 0.08 lightness (subtle). This was a real bug in the original `ReqoreCallout` — the border used the theme bg regardless of intent.

## A.11 The `raised` 3D effect — shared helper

If your component has a card-like surface, accept a `raised?: boolean` prop and apply the `RaisedElement` helper from `src/styles.ts`:

```ts
import { RaisedElement } from '../../styles';

// In the styled component:
${({ raised, flat }) => raised && flat !== false && RaisedElement}
```

`flat !== false` gate (or per-component equivalent) suppresses the highlight when there's already a border, since the border provides surface definition. The helper itself:

```ts
export const RaisedElement = css`
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.22);
`;
```

Theme-neutral additive overlays — works on dark or light themes without per-theme tuning.

## A.12 Don't reinvent existing `IReqoreEffect` features

`IReqoreEffect` already supports:

- `gradient` (linear/radial, animated, with intent border colour)
- `glow` (colour, blur, opacity, inset, when: hover/focus/active)
- `frost` (frosted glass with backdrop-filter)
- `weight`, `italic`, `underline`, `uppercase`, `spaced` (text styling)
- `opacity`, `blur`, `grayscale`, `sepia`, `invert`, `brightness`, `contrast`, `saturate`

If your component needs glow / frost / gradient — pipe `effect` through. Don't add a parallel prop.

If a shorthand makes sense (e.g. `ReqoreIcon.glow: boolean | TReqoreEffectColor | { color, blur, opacity }`), add it as convenience, but resolve internally to the existing `IReqoreEffect.glow` semantics.

## A.13 Class hooks for testability

Always include a `.reqore-<component-name>` class on the root, plus per-part classes on every meaningful sub-element. Tests query by these class names:

```
.reqore-xxx                   // root
.reqore-xxx-icon              // leading icon if any
.reqore-xxx-label             // label
.reqore-xxx-description       // description
.reqore-xxx-metadata          // tertiary text
.reqore-xxx-actions           // action group
.reqore-xxx-strip             // any decorative strip / accent
.reqore-xxx-body              // content wrapper
```

Used in `__tests__/Xxx.test.tsx`:

```ts
expect(document.querySelector('.reqore-xxx-label')!.textContent).toContain('...');
expect(document.querySelectorAll('.reqore-xxx-actions').length).toBe(1);
```

## A.14 Required stories matrix

Every new surface component should have these stories at minimum (under `src/stories/<Component>/<Component>.stories.tsx`):

- `Basic` — minimal config
- `WithLabel` / `WithBadge` / `WithIcon` — each major optional prop demonstrated separately
- `Sizes` — `tiny / small / normal / big` (or larger if relevant) in a `ReqoreControlGroup`
- `Intents` — every intent in a row (`Object.keys(DEFAULT_INTENTS).map(...)`)
- `Bordered` — `flat={false}` (the bordered case is often the inverse of the default; show it)
- `Square` — `rounded={false}`
- `Transparent` — `transparent={true}`
- `Disabled` — `disabled={true}`
- `Tooltip` — `tooltip='...'` so the prop is clearly inheritable
- `Clickable` — `onClick` to demonstrate hover/lift/cursor
- `WithEffects` — combined `effect` + `labelEffect` + `descriptionEffect`
- `CustomTheme` — `customTheme={{ main: '#...' }}`
- `Fixed` — when applicable
- `Raised` — when supported (see A.11)
- `NoWrap` (or `Truncated`) — when supported (with a narrow-width decorator so the ellipsis is visible)

**Story title pattern**: `'Display/<Component>/Stories'` or `'Data Display/<Component>/Stories'`. Match the existing folder grouping.

## A.15 Storybook layout pitfall

Reqore's `.storybook/preview.tsx` sets `parameters.layout = 'fullscreen'` globally. **Do not override it to `'padded'` per-story** — that's Storybook's built-in layout that adds white margins around the canvas, which fights the dark Reqore canvas and gives stories an unintentional white background.

If your story needs a constrained width (e.g. for `NoWrap` to actually demonstrate ellipsis), use a `decorator` instead:

```ts
decorators: [
  (Story) => (
    <div style={{ width: 480 }}>
      <Story />
    </div>
  ),
],
```

Don't touch `parameters.layout`.

## A.16 Required tests matrix

Mirror the stories matrix in `__tests__/<Component>.test.tsx`. At minimum:

- renders root + label + description
- doesn't render optional parts when not provided (negative cases)
- renders with each intent
- renders with each size
- renders with `flat={false}` (border case)
- renders with `rounded={false}`
- renders with `transparent`
- renders with `effect`, `labelEffect`, `descriptionEffect` together
- `onClick` fires when set
- `disabled` short-circuits interaction (when applicable)
- badge as string + as object + as array (each renders the right number of `.reqore-button-badge` elements)
- truncation (`wrap={false}`) — both the negative (wraps by default) and positive case
- `raised` smoke test when supported

Standard render setup:

```tsx
render(
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>
        <ReqoreXxx ... />
      </ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);
```

Don't omit the providers — some hooks (`useReqoreTheme`, `useReqoreProperty`) silently return undefined without them and the test passes for the wrong reason.

## A.17 Index export + COMPONENTS.md

Two non-optional steps for shipping:

1. Add to `src/index.tsx` in alphabetical order:
   ```ts
   export { default as ReqoreXxx } from './components/Xxx';
   ```
   Use `default` if your component is exported as default; named otherwise.

2. Add a one-line entry to `src/components/COMPONENTS.md` describing the prop catalogue. Match the depth of existing entries — list the standard prop bag (intent, size, flat, rounded, fluid, transparent, customTheme, tooltip, disabled, effect/labelEffect/descriptionEffect) plus what's component-specific.

Both happen in the same PR as the component.

## A.18 Don't drop `children` when supporting structured content

Real bug from `ReqoreCallout`: when both `label` and `children` could be passed, the structured-content branch (label/description) was rendered and `children` was silently dropped. Result: `<Callout label='Heads up'>{detailedMessage}</Callout>` rendered just "Heads up" with no body.

Fix: when supporting both forms, ensure all paths render content. Either:
- Use `children` as a fallback for `description` when `description` is not set, or
- Document explicitly that `description` takes precedence and drop `children` in that branch (but log a dev-mode warning), or
- Render both stacked.

Pick one and document it. Silently dropping content is the worst option.

## A.19 Component composition — reuse, don't reinvent

Before writing new layout primitives, check if these existing components can be the building blocks:

| Need | Use |
|---|---|
| KPI tile (number + label + trend) | `ReqoreStatistic` |
| Progress bar (with optional target marker) | `ReqoreProgress` |
| Inline alert / notice | `ReqoreCallout` (label + description + icon + onClose) |
| List of issues / alerts (severity strip + label + actions) | `ReqoreSeverityRow` |
| List of entities / items (icon tile + label + metadata + actions) | `ReqoreEntityRow` |
| Card with marker + label + description | `ReqoreFeatureCard` |
| Pricing tier card | `ReqoreTier` |
| Empty state placeholder | `ReqoreEmptyState` |
| Container with header + footer + actions | `ReqorePanel` |
| Icon with optional glow | `ReqoreIcon` (use `glow` prop) |
| Drawer / side panel | `ReqoreDrawer` (extends `ReqorePanel` — same `bottomActions`, `actions`, `label`, `badge`, `icon`) |
| Two-column key/value table | `ReqoreKeyValueTable` |
| Vertical event list | `ReqoreTimeline` |
| Tag / chip | `ReqoreTag` (use `customTheme={{ main: 'main:lighten:5' }}` for dimmed neutral chips, NOT `intent='muted'` which often looks too dark) |

If your "new component" is mostly composition of these, ship it as a thin composer in the consumer repo first. Only promote to Reqore once it's used in 2+ places with the same shape.

---

# Appendix B — Common review corrections (memorise these)

These are real fixes that came back from review. Avoid them in v1:

1. **`title` instead of `label`** → reviewer will request rename. Just use `label`.
2. **`tinted` / `noTint`** → reviewer will request `transparent`. Use `transparent`.
3. **`trailingTitle` slot for badges** → reviewer will request `badge: TReqoreBadge | TReqoreBadge[]`. Use the standard typing + `ButtonBadge`.
4. **Bottom Close button when there's already a top-right `X`** → drop the redundant Close. The drawer/modal's built-in close is the only Close affordance.
5. **`hidable` enabled on a drawer that doesn't need a collapse** → drop it. Renders an extra `>` button stacked above the close `X` and looks weird.
6. **Bare custom styled headings instead of `<ReqoreH4>` / eyebrow `<ReqoreSpan>`** → use existing typography primitives, with `effect={{ uppercase, spaced, weight: 'bold', opacity: 0.5 }}` for eyebrow/section labels.
7. **Action buttons inside the body when `bottomActions` exists on the panel/drawer** → use `bottomActions` so the bar sticks at the bottom and doesn't leave a void.
8. **Action button when the row itself can be clickable** → make the row clickable (`<EntityRow onClick={...} tooltip='...' />`) instead of a trailing icon button.
9. **`labelEffect.gradient` on every panel** → resist the temptation. One subtle gradient on the page title is enough. Multiple gradients fight for attention.
10. **`(N)` count in segmented control labels** → use the segmented item's `badge` field instead. Each item supports `badge: TReqoreBadge`.
11. **`intent='muted'` for "neutral metadata" chips** → too dark on most themes. Use `customTheme={{ main: 'main:lighten:5' }}` for a visible-but-dimmed chip surface.
12. **Action that fires `onAction(name, payload)` with no destination** → either wire it up, mark it `disabled` with `tooltip='Coming soon'`, or remove the button. Don't ship buttons that do nothing.
13. **`min-width: 0` missing on the wrapping flex item** → ellipsis won't trigger; the inner element won't shrink below its content. Always set `min-width: 0` on the flex item that contains a truncatable element.
14. **Forgetting `minimal` on `ReqoreDrawer`** → the drawer's panel chrome is too heavy without it. Convention here is to always pass `minimal`.
