@~/Projects/instruction-files/CLAUDE.md
@~/Projects/instruction-files/stacks/frontend/FRONTEND.md

# ReQore — Claude entry point

## Shared Qore rules (READ FIRST)

The two `@`-imports above load the shared rules from the **instruction-files**
repo: the org-wide baseline (`CLAUDE.md`) and the frontend ruleset
(`stacks/frontend/FRONTEND.md`) — git safety, commit conventions, CI
monitoring, `/audit`, the Reqore-first rule, the Storybook + Qlip visual-change
flow, story descriptions, and more. Those files point on to
`stacks/frontend/BRAND_DESIGN.md` for brand / UI-design decisions (read it
before building any visual surface). **Everything below this section is
specific to ReQore.**

**If the imports above did not load** — you don't see the shared rules because
this repo is cloned somewhere other than `~/Projects/instruction-files` — find
the shared repo before doing any frontend work:

1. Check for a gitignored **`.instruction-files-path`** file at this repo's
   root. If it exists, read the path `P` from it, then read `P/CLAUDE.md` and
   `P/stacks/frontend/FRONTEND.md` (+ `P/stacks/frontend/BRAND_DESIGN.md` for
   UI work) and follow them.
2. Otherwise locate the `instruction-files` repo on disk (try
   `~/Projects/instruction-files`, then your other project roots). If found at
   `P`, write `P` into `.instruction-files-path` (create it — it's gitignored)
   so future sessions skip the search, then read the files above.
3. If it isn't cloned anywhere, **STOP and ask the user to clone it**:
   `git clone git@github.com:qoretechnologies/instruction-files.git ~/Projects/instruction-files`
   Do not proceed with frontend work until the shared rules are loaded.

# ReQore — project-specific rules

ReQore is a **themeable React component library** for the Qorus platform. It provides
40+ UI components (Button, Table, Modal, Drawer, etc.) sharing one design system with
consistent theming, sizing, and effect systems. **reqore is the UI primitive library
itself** — rules here are about how to build and publish reqore's own components.

## Key Facts

- **Framework:** React 18 + TypeScript (strict mode)
- **Build:** TypeScript compilation to `/dist`, exports both `.js` and `.d.ts`
- **Styling:** styled-components with theme-driven values (no CSS modules)
- **State:** zustand + React Context (use-context-selector)
- **Testing:** Jest + React Testing Library (tests in `__tests__/`)
- **Docs:** Storybook (dev stories in `src/stories/`) + Docusaurus (docs site)
- **Priority:** user experience and performance first; complexity/tech debt secondary.

## Perf conventions that OVERRIDE the frontend default

Reqore is a hot-path primitive library, so it inverts the general
"don't memoize by default" guidance:

- Always wrap components in `memo()` unless there's a specific reason not to.
- Always wrap callbacks in `useCallback()` unless there's a specific reason not to.
- Always memoize computed values in `useMemo()` unless there's a specific reason not to.

## Architecture Essentials

### Component Structure
- **Folder:** `src/components/{ComponentName}/` contains only `index.tsx` (and
  occasionally `backdrop.tsx` for overlay components).
- **Pattern:** each component is a `memo()`-wrapped functional component with TS interfaces.
- **Exports:** named exports (e.g. `export const ReqoreButton`); re-exported in `src/index.tsx`.

### Theme System (`src/constants/theme.ts` + hooks)
- **Global theming:** `useReqoreTheme()` provides `IReqoreTheme` (colors, text, main
  background, intents).
- **Dynamic theming:** components read theme via hooks, enabling runtime switching.
- **Intents:** type-safe intent system (`'primary' | 'secondary' | 'success' | 'danger'`)
  maps to theme colors.
- **Custom themes:** merge with `DEFAULT_THEME`; see `ThemeProvider.tsx`.
- **Custom theme inheritance:** components inherit `customTheme` from ancestors via
  `CustomThemeContext`. `useReqoreTheme()` checks this context when no explicit
  `customTheme` prop is passed. Opt out with `inheritCustomTheme={false}` (on components
  extending `IWithReqoreCustomTheme`). Components that wrap children and set a custom theme
  must pass `customTheme` to `ReqoreThemeProvider` so descendants can inherit it.

### Sizing System (`src/constants/sizes.ts`)
- **Size types:** `'micro' | 'tiny' | 'small' | 'normal' | 'big' | 'huge' | 'massive'`.
- **Pattern:** maps like `SIZE_TO_PX`, `SIZE_TO_NUMBER`, `CONTROL_TEXT_FROM_SIZE` convert
  size enums to pixel/CSS values.
- **Usage:** most interactive components accept `size?: TSizes`; pass through to nested
  styled components.

### Effect System (`src/components/Effect/`)
- **Purpose:** gradient, blur, shadow effects applied via `StyledTextEffect`.
- **Props:** `IWithReqoreEffect` mixin (gradient, blur, shadow, opacity).
- **Color types:** `TReqoreHexColor`, `TReqoreRgbaColor`, `TReqoreMultiTypeColor`.

### Global Context (`src/context/ReqoreContext.tsx` + `ReqoreProvider.tsx`)
- **Manages:** modals, notifications, z-index stack, mobile breakpoints, animations toggle,
  tooltips.
- **Methods:** `addModal()`, `removeModal()`, `addNotification()`, `confirmAction()`.
- **Mobile detection:** `isMobile`, `isTablet`, `isMobileOrTablet` from `useMedia()`.
- **ESC handling:** modals/popovers close on ESC via `escClosableModals` stack;
  `closeModalsOnEscPress` toggle.

## Development Workflows

### Quick Start
```bash
yarn install
yarn storybook          # Dev mode on http://localhost:6007
yarn docs:dev           # Docusaurus dev server
yarn test:watch         # Jest watch mode
yarn lint               # ESLint check
yarn build              # TypeScript compilation
```

### Pre-commit Checks
- `yarn precheck` runs: lint → test → build (production).
- `pre-push` hook enforces the same checks before push (see `package.json`).
- Line length: 100 characters (enforced by eslint).

### What reqore's `/audit` uniquely catches
(The general "run `/audit` before every commit/push, show the report, pause for
fix-or-waive" flow is the frontend baseline — this is what reqore's audit adds on top.)
- Standard prop contract declared but never wired (the headline bug — `intent` extended on
  the interface but never read, so `intent='danger'` paints nothing).
- One-off raw HTML or styled wrappers where a Reqore primitive fits.
- Matrix stories (`Sizes`, `Intents`, …) rendering identical-looking rows because the prop
  isn't wired OR the matrix isn't constrained on a wide viewport.
- Test coverage gaps against the standard prop matrix.
- Helper duplication vs `src/helpers/`.
- Appendix A drift vs `.tasks/NEW_COMPONENT.md`.

### Version bumps (required on every PR)

Every PR to `develop` MUST bump `package.json`'s `version` field before it merges. This is
load-bearing: `.github/workflows/beta_release.yml` runs on every push to `develop` and
publishes to NPM using whatever version is in `package.json` at push time. If two PRs merge
back-to-back without bumps, the second silently no-ops or fails (NPM refuses to re-publish
an existing version).

**Bump size rules:**
- **New component** (a whole new `Reqore{Name}` in `src/components/` exported from
  `src/index.tsx`) → minor: `0.70.6` → `0.71.0`
- **New prop on an existing component, bug fix, refactor, test-only, story-only** →
  patch: `0.70.6` → `0.70.7`
- **Breaking change** (removed export, changed default behaviour, renamed prop without
  alias) → major: `0.70.6` → `1.0.0` — coordinate with the maintainer first; Reqore stays
  0.x until 1.0 is intentional.

**How to bump:**
1. Edit `package.json` directly (`"version": "0.70.7"`) as part of the same PR. Don't leave
   it for a post-merge follow-up — the workflow can't wait for a second push.
2. Commit it in a dedicated `chore(release): bump version to X.Y.Z` commit OR fold the line
   into the feature commit; both are fine.
3. If another PR bumps to the same version before yours merges, rebase and bump again — the
   version in `develop` on merge must be strictly greater than the previous merged version.

**Where to look if unsure:** `git log --oneline -20 -- package.json`.

### Testing Patterns
- **Setup:** `__tests__/setup.js` disables console debug/info/error.
- **Wrapper:** always wrap tests with
  `<ReqoreUIProvider><ReqoreLayoutContent><ReqoreContent>...</ReqoreContent></ReqoreLayoutContent></ReqoreUIProvider>`.
- **Selectors:** use CSS classes like `.reqore-button`, `.reqore-icon` (added via
  `className` prop).
- **Example:** see `__tests__/button.test.tsx`.

### Storybook Stories
- **Location:** `src/stories/` (e.g. `Collection.stories.tsx`).
- **Pattern:** ArgTypes for props, canvas controls, visual testing via Chromatic.
- **Command:** `yarn build-storybook` builds the static site.

### Verifying a visual fix locally with Qlip — reqore mechanics

(The principle — capture the story locally and Read the PNG before claiming a Qlip-flagged
snapshot is fixed — is the frontend baseline. These are reqore's specific mechanics and
guardrails.)

Capture one story without triggering upload:
```bash
yarn test:stories src/stories/Tabs/Tabs.stories.tsx > /tmp/qlip-verify.log 2>&1
```
Then `Read` the PNG under `qlip/screenshots/<timestamp>/stories/auto/<Story__Id>.png`.
To prove the fix moved the pixels, compare the `md5` of that PNG against the same story in
the previous capture directory — identical hashes mean the render did not change.

**Guardrails:**
- **NEVER set `QLIP_UPLOAD_TOKEN` locally.** `vitest.config.ts` attaches qlip's `upload`
  block only when that variable is present, and CI supplies it from the repo secret in
  `.github/workflows/tests.yml`. With it set, **every** `yarn test:stories` publishes a
  build the whole team then sees in review (the token was hardcoded here until July 2026 and
  local runs posted four unwanted builds in one session).
- **Check for the upload line.** qlip prints
  `[qlip] uploaded build <id> … → https://qlip.qoretechnologies.com` when it publishes. If a
  local run prints that, the gate is broken — stop and fix it before continuing.
- **NEVER run `yarn vitest run` with no `--project`** — it includes the storybook project
  and captures the whole ~870-snapshot suite (and uploads it if the gate is broken). Use
  `yarn test` (`--project unit`) for unit tests; one story file at a time for stories.
- **Delete the previous capture directory BEFORE re-capturing.** Qlip names files
  `<StoryId>.png`; a renamed/deleted/skipped story leaves its old PNG behind and will
  mislead you into reviewing a render that is no longer produced.

## Code Patterns & Conventions

### Component Prop Interfaces
- **Extend mixins:** `IWithReqoreSize`, `IWithReqoreEffect`, `IWithReqoreLoading`,
  `IWithReqoreReadOnly`, `IWithReqoreCustomTheme`.
- **Naming:** props interface is `IReqore{ComponentName}Props`; style interface is
  `IReqore{ComponentName}Style`.
- **Optional theme:** style interfaces accept `theme: IReqoreTheme` for styled-components access.
- **Readonly context:** use the `readonly` keyword on context properties (immutability).

### Styled Components Pattern
```tsx
const StyledButton = styled.button<IReqoreButtonStyle>`
  background: ${({ theme, intent }) => theme.intents?.[intent]?.color};
  color: ${({ theme }) => getReadableColor(theme)};
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
    `}
`;
```

### Hooks Usage
- **Theme:** `useReqoreTheme(element?, customTheme?, intent?, intentsKey?, inheritCustomTheme?)`
  returns `IReqoreTheme`. Pass `customTheme` and `inheritCustomTheme` from props to support
  custom theme inheritance.
- **Context props:** `useReqoreProperty('propertyName')` (avoids consuming the whole context).
- **Local refs:** `useCombinedRefs()` for forwarding + internal refs; `useOutsideClick()`
  for popover clicks.
- **Auto-focus:** `useAutoFocus()` for modal/drawer focus management.

### Color Helpers (`src/helpers/colors.ts`)
- **Text contrast:** `getReadableColor(theme)` returns light or dark based on `theme.main`.
- **Gradients:** `getGradientMix()` blends multiple colors for effect gradients.
- **Hex↔RGBA:** `hexAToRGBA()`, `getRGBAFromHex()`.
- **Lightness:** `changeLightness()`, `changeDarkness()` for theme-aware adjustments.

### Animation Config
- **Spring:** `SPRING_CONFIG` for bounce/smooth animations (via `@react-spring/web`).
- **Disabled:** `SPRING_CONFIG_NO_ANIMATIONS` when `animations.buttons: false`.
- **Usage:** wrap animated components with `<animated>` from react-spring.

## Key Integration Points

### Modal & Notification Flow
1. **Add modal:** `context.addModal(modalElement, id?)` returns modal ID.
2. **Close:** `context.removeModal(id)` + optional confirmation dialog.
3. **Notifications:** `context.addNotification({...})` queues a toast; auto-removes after `duration`.
4. **Portal:** modals/notifications render via `customPortalId` or default DOM portal.

### Responsive Breakpoints
- **Mobile:** `isMobile` (width ≤ 480px).
- **Tablet:** `isTablet` (width ≤ 1024px).
- **Usage:** conditional rendering; affects dropdown/menu positioning.

### Icon System (`src/types/icons.ts`)
- **Type:** `IReqoreIconName` (string literal of all icon names).
- **Render:** `<ReqoreIcon name="iconNameHere" />` or component prop `icon="iconNameHere"`.
- **Sizing:** icon size auto-scales with component size via `ICON_FROM_SIZE`.

### Collections & Paging
- **Collection:** renders arrays with optional sorting/filtering; used in Table, MultiSelect.
- **Paging:** `useReqorePaging()` handles offset/limit; `<ReqorePaging>` for controls.
- **Pattern:** see `src/components/Collection/` and `src/containers/Paging.tsx`.

## Common Pitfalls & Solutions

| Issue | Solution |
| --- | --- |
| Styled component props not typed | Add `<IComponentStyle>` generic; ensure mixin interfaces extend properly |
| Theme not applying | Verify `ReqoreUIProvider` wraps the tree; check `useReqoreTheme()` call |
| ESC key ignored in modal | Ensure `closeModalsOnEscPress: true`; modal must be in `escClosableModals` stack |
| Icon not rendering | Verify icon name in `IReqoreIconName`; check icon imports in `Icon/` |
| Tests fail with "React is not defined" | Verify `setup.js` is loaded; `jsx: "react-jsx"` in tsconfig.json |
| Animation janky on slow devices | Offer `animations.buttons: false`; use `SPRING_CONFIG_NO_ANIMATIONS` |

## File Reference

| Path | Purpose |
| --- | --- |
| `src/index.tsx` | Main export barrel; re-exports all public components |
| `src/constants/` | Global enums, size maps, theme defaults, animation configs |
| `src/helpers/` | Color math, utility functions (no React) |
| `src/hooks/` | Custom React hooks (theme, context, DOM utilities) |
| `src/containers/` | Provider components (ReqoreProvider, ThemeProvider, UIProvider) |
| `src/context/` | Context definitions (ReqoreContext, ThemeContext) |
| `src/types/` | Global TypeScript interfaces (icons, global prop mixins) |
| `__tests__/` | Jest tests; mirrors `src/` structure |
| `src/stories/` | Storybook stories for visual development |

## When Adding New Components
1. **Create folder:** `src/components/{ComponentName}/index.tsx`.
2. **Define interfaces:** `IReqore{ComponentName}Props` + `IReqore{ComponentName}Style`.
3. **Use mixins:** extend `IWithReqoreEffect`, `IWithReqoreSize`, `IWithReqoreCustomTheme` as needed.
4. **Apply theme:** `useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme)`
   — destructure both `customTheme` and `inheritCustomTheme` from props.
5. **Propagate theme to children:** if wrapping children with `ReqoreThemeProvider`, pass
   both the resolved `theme` and raw `customTheme` prop so descendants inherit via
   `CustomThemeContext`.
6. **Export:** add named export to `src/index.tsx`.
7. **Test:** add `__tests__/{ComponentName}.test.tsx` with the UIProvider wrapper.
8. **Story:** create `src/stories/{ComponentName}.stories.tsx` with argTypes.
   (Also follow `.tasks/NEW_COMPONENT.md` — Appendix A is what `/audit` checks against.)

## Documentation
- **Storybook:** `yarn storybook` for the interactive playground.
- **Docusaurus:** `yarn docs:dev` for user guides + API docs.
- **TypeDoc:** `yarn docs:api` generates API reference from JSDoc comments.
- **Inline:** JSDoc comments on public props/methods for IDE tooltips.
