# ReQore AI Coding Agent Instructions

## Project Overview

ReQore is a **themeable React component library** for the Qorus platform. It provides 40+ UI components (Button, Table, Modal, Drawer, etc.) that share a unified design system with consistent theming, sizing, and effect systems.

**Key Facts:**

- **Framework:** React 18 + TypeScript (strict mode)
- **Build:** TypeScript compilation to `/dist`, exports both `.js` and `.d.ts`
- **Styling:** styled-components with theme-driven values (no CSS modules)
- **State Management:** zustand + React Context (use-context-selector)
- **Testing:** Jest + React Testing Library (tests in `__tests__/`)
- **Documentation:** Storybook (dev stories in `src/stories/`) + Docusaurus (docs site)

## Architecture Essentials

### General Development Practices

# General

- Focus is first on user experience and performance, complexity and tech debt secondary
- Follow existing code patterns for new components; refer to similar components for guidance
- Check if a helper or utility already exists before writing a new one

# TypeScript

- Use TypeScript with strict typing; define prop interfaces for each component with `I` prefix for interfaces and `T` prefix for types

# UI / UX

- Always make sure to create reusable components
- Always use named exports for React components
- There can be multiple React components in one file if it makes sense
- Use styled-components for styling; define style interfaces for styled components
- Always componentize styles with styled-components; avoid inline styles except for dynamic cases
- Use functional components with React hooks
- For React, always wrap components in `memo()` unless there's a specific reason not to
- For React, always wrap callbacks in `useCallback()` unless there's a specific reason not to
- For React, always memoize computed values in `useMemo()` unless there's a specific reason not to

# Testing

- Run tests after changes, run `yarn precheck` after feature completions
- Write a unit test if it makes sense for the change you have made, but Storybook tests will always have higher priority

### Component Structure

- **Folder:** `src/components/{ComponentName}/` contains only `index.tsx` (and occasionally `backdrop.tsx` for overlay components)
- **Pattern:** Each component is a `memo()` wrapped functional component with TypeScript interfaces
- **Exports:** Named exports (e.g., `export const ReqoreButton`) from component files; re-exported in `src/index.tsx`

### Theme System (`src/constants/theme.ts` + hooks)

- **Global theming:** `useReqoreTheme()` hook provides `IReqoreTheme` (colors, text, main background, intents)
- **Dynamic theming:** Components read theme via hooks, enabling runtime theme switching
- **Intents:** Type-safe intent system (e.g., `'primary' | 'secondary' | 'success' | 'danger'`) maps to theme colors
- **Custom themes:** Merge with `DEFAULT_THEME`; see `ThemeProvider.tsx`
- **Custom theme inheritance:** Components automatically inherit `customTheme` from ancestor components via `CustomThemeContext`. The `useReqoreTheme()` hook checks this context when no explicit `customTheme` prop is passed. Components can opt out with `inheritCustomTheme={false}` (available on components extending `IWithReqoreCustomTheme`). Components that wrap children and set a custom theme must pass `customTheme` to `ReqoreThemeProvider` so descendants can inherit it.

### Sizing System (`src/constants/sizes.ts`)

- **Size types:** `'micro' | 'tiny' | 'small' | 'normal' | 'big' | 'huge' | 'massive'`
- **Pattern:** Maps like `SIZE_TO_PX`, `SIZE_TO_NUMBER`, `CONTROL_TEXT_FROM_SIZE` convert size enums to pixel/CSS values
- **Usage:** Most interactive components accept `size?: TSizes` prop; pass through to nested styled components

### Effect System (`src/components/Effect/`)

- **Purpose:** Provides gradient, blur, shadow effects applied via `StyledTextEffect`
- **Props:** `IWithReqoreEffect` mixin (gradient, blur, shadow, opacity) on interactive components
- **Color types:** `TReqoreHexColor`, `TReqoreRgbaColor`, `TReqoreMultiTypeColor` used consistently

### Global Context (`src/context/ReqoreContext.tsx` + `ReqoreProvider.tsx`)

- **Manages:** Modals, notifications, z-index stack, mobile breakpoints, animations toggle, tooltips
- **Methods:** `addModal()`, `removeModal()`, `addNotification()`, `confirmAction()` (confirmation dialog)
- **Mobile detection:** `isMobile`, `isTablet`, `isMobileOrTablet` flags from `useMedia()` hook
- **ESC handling:** Modals/popovers close on ESC via `escClosableModals` stack; `closeModalsOnEscPress` toggle

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

- `yarn precheck` runs: lint → test → build (production)
- `pre-push` hook enforces same checks before push (see `package.json`)
- Line length: 100 characters (enforced by eslint)

### Testing Patterns

- **Setup:** `__tests__/setup.js` disables console debug/info/error
- **Wrapper:** Always wrap tests with `<ReqoreUIProvider><ReqoreLayoutContent><ReqoreContent>...</ReqoreContent></ReqoreLayoutContent></ReqoreUIProvider>`
- **Selectors:** Use CSS classes like `.reqore-button`, `.reqore-icon` (added via `className` prop)
- **Example:** See [button.test.tsx](__tests__/button.test.tsx)

### Storybook Stories

- **Location:** `src/stories/` (e.g., `Collection.stories.tsx`)
- **Pattern:** ArgTypes for props, canvas controls, visual testing via Chromatic
- **Command:** `yarn build-storybook` builds static site

## Code Patterns & Conventions

### Component Prop Interfaces

- **Extend mixins:** `IWithReqoreSize`, `IWithReqoreEffect`, `IWithReqoreLoading`, `IWithReqoreReadOnly`, `IWithReqoreCustomTheme`
- **Naming:** Props interface is `IReqore{ComponentName}Props`; style interface is `IReqore{ComponentName}Style`
- **Optional theme:** Style interfaces accept `theme: IReqoreTheme` for styled-components access
- **Readonly context:** Use `readonly` keyword on context properties (immutability)

### Styled Components Pattern

```tsx
const StyledButton = styled.button<IReqoreButtonStyle>`
  // Use props.theme from ReqoreTheme
  background: ${({ theme, intent }) => theme.intents?.[intent]?.color};
  color: ${({ theme }) => getReadableColor(theme)};
  // Conditional styles via css helper
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
    `}
`;
```

### Hooks Usage

- **Theme:** `useReqoreTheme(element?, customTheme?, intent?, intentsKey?, inheritCustomTheme?)` returns `IReqoreTheme`. Pass `customTheme` and `inheritCustomTheme` from component props to support custom theme inheritance.
- **Context props:** `useReqoreProperty('propertyName')` for context values (avoids consuming entire context)
- **Local refs:** `useCombinedRefs()` for forwarding + internal refs; `useOutsideClick()` for popover clicks
- **Auto-focus:** `useAutoFocus()` for modal/drawer focus management

### Color Helpers (`src/helpers/colors.ts`)

- **Text contrast:** `getReadableColor(theme)` returns light or dark based on theme.main
- **Gradients:** `getGradientMix()` blends multiple colors for effect gradients
- **Hex↔RGBA:** `hexAToRGBA()`, `getRGBAFromHex()` for color space conversions
- **Lightness:** `changeLightness()`, `changeDarkness()` for theme-aware color adjustments

### Animation Config

- **Spring:** `SPRING_CONFIG` for bounce/smooth animations (via `@react-spring/web`)
- **Disabled:** `SPRING_CONFIG_NO_ANIMATIONS` when `animations.buttons: false`
- **Usage:** Wrap animated components with `<animated>` from react-spring

## Key Integration Points

### Modal & Notification Flow

1. **Add modal:** `context.addModal(modalElement, id?)` returns modal ID
2. **Close:** `context.removeModal(id)` + optional confirmation dialog
3. **Notifications:** `context.addNotification({...})` queues toast; auto-removes after `duration`
4. **Portal:** All modals/notifications render via `customPortalId` or default DOM portal

### Responsive Breakpoints

- **Mobile:** `isMobile` (width ≤ 480px)
- **Tablet:** `isTablet` (width ≤ 1024px)
- **Usage:** Conditional rendering in components; affects dropdown/menu positioning

### Icon System (`src/types/icons.ts`)

- **Type:** `IReqoreIconName` (string literal of all icon names)
- **Render:** `<ReqoreIcon name="iconNameHere" />` or component prop `icon="iconNameHere"`
- **Sizing:** Icon size auto-scales with component size via `ICON_FROM_SIZE`

### Collections & Paging

- **Collection:** Renders arrays with optional sorting/filtering; used in Table, MultiSelect
- **Paging:** `useReqorePaging()` hook handles offset/limit; `<ReqorePaging>` component for controls
- **Pattern:** See [Collection.tsx](src/components/Collection/) and [Paging.tsx](src/containers/Paging.tsx)

## Common Pitfalls & Solutions

| Issue                                  | Solution                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| Styled component props not typed       | Add `<IComponentStyle>` generic; ensure mixin interfaces extend properly                     |
| Theme not applying                     | Verify `ReqoreUIProvider` wraps component tree; check `useReqoreTheme()` call                |
| ESC key ignored in modal               | Ensure `closeModalsOnEscPress: true` in provider; modal must be in `escClosableModals` stack |
| Icon not rendering                     | Verify icon name in `IReqoreIconName`; check icon imports in `Icon/` component               |
| Tests fail with "React is not defined" | Verify `setup.js` is loaded; jsx: "react-jsx" in tsconfig.json                               |
| Animation janky on slow devices        | Offer `animations.buttons: false` toggle in theme/context; use `SPRING_CONFIG_NO_ANIMATIONS` |

## File Reference

| Path              | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `src/index.tsx`   | Main export barrel; re-exports all public components            |
| `src/constants/`  | Global enums, size maps, theme defaults, animation configs      |
| `src/helpers/`    | Color math, utility functions (no React)                        |
| `src/hooks/`      | Custom React hooks (theme, context, DOM utilities)              |
| `src/containers/` | Provider components (ReqoreProvider, ThemeProvider, UIProvider) |
| `src/context/`    | Context definitions (ReqoreContext, ThemeContext)               |
| `src/types/`      | Global TypeScript interfaces (icons, global prop mixins)        |
| `__tests__/`      | Jest tests; mirrors `src/` structure                            |
| `src/stories/`    | Storybook stories for visual development                        |

## When Adding New Components

1. **Create folder:** `src/components/{ComponentName}/index.tsx`
2. **Define interfaces:** `IReqore{ComponentName}Props` + `IReqore{ComponentName}Style`
3. **Use mixins:** Extend `IWithReqoreEffect`, `IWithReqoreSize`, `IWithReqoreCustomTheme` as needed
4. **Apply theme:** Use `useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme)` — destructure both `customTheme` and `inheritCustomTheme` from props so the component supports custom theme inheritance from ancestor components
5. **Propagate theme to children:** If the component wraps children with `ReqoreThemeProvider`, pass both the resolved `theme` and raw `customTheme` prop: `<ReqoreThemeProvider theme={theme} customTheme={customTheme}>` — this enables descendant components to inherit the custom theme via `CustomThemeContext`
6. **Export:** Add named export to `src/index.tsx`
7. **Test:** Add test file in `__tests__/{ComponentName}.test.tsx` with UIProvider wrapper
8. **Story:** Create `src/stories/{ComponentName}.stories.tsx` with argTypes

## Documentation

- **Storybook:** Run `yarn storybook` for interactive component playground
- **Docusaurus:** Run `yarn docs:dev` for user guides + API docs
- **TypeDoc:** `yarn docs:api` generates API reference from JSDoc comments
- **Inline:** Use JSDoc comments on public props/methods for IDE tooltips

## Other

- You may need to source zsh to get some commands (like gh) working
- If there is an issue, always start the branch with the issue number e.g. `feature/1234_new-component`
