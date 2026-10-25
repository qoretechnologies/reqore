import { cloneDeep } from 'lodash';
import type { IReqoreNotificationDefaults } from '../components/Notifications/notification';
import merge from 'lodash/merge';
import { rgba } from 'polished';
import React, { forwardRef, memo, useMemo, useState } from 'react';
import { createGlobalStyle, css } from 'styled-components';
import styled from '../helpers/styled';
import ReqoreLayoutWrapper, { IReqoreLayoutWrapperProps } from '../components/Layout';
import { getFontFamily } from '../constants/fonts';
import { DEFAULT_THEME, IReqoreTheme } from '../constants/theme';
import { IReqoreContext } from '../context/ReqoreContext';
import { TReqoreDataAttributes } from '../types/global';
import ThemeContext from '../context/ThemeContext';
import { buildTheme, getMainBackgroundColor, getReadableColor } from '../helpers/colors';
import ReqoreProvider from './ReqoreProvider';
import ReqoreThemeProvider from './ThemeProvider';

export interface IReqoreOptions
  extends Pick<
    IReqoreContext,
    | 'closeModalsOnEscPress'
    | 'closePopoversOnEscPress'
    | 'animations'
    | 'tooltips'
    | 'customPortalId'
    | 'errorBoundaryOptions'
    | 'glowingIcons'
    | 'shortcutHints'
    | 'schedule'
  > {
  withSidebar?: boolean;
  uiScale?: number;
  /** Defaults for every notification added through `addNotification`. */
  notifications?: IReqoreNotificationDefaults;
}
/**
 * Props for the top-level UI provider that wires Reqore theme and global layout.
 */
export interface IReqoreUIProviderProps {
  children?: any;
  theme?: Partial<IReqoreTheme>;
  options?: IReqoreOptions;
  /**
   * Props for the layout wrapper the provider renders around the app (`.reqore-layout-wrapper`):
   * `transparent` to let the page's own background show through, plus any `div` attribute —
   * `className`, `style`, `data-*`, `aria-*`. `className` is merged with the wrapper's own;
   * `options.withSidebar` keeps deciding the direction.
   */
  layoutWrapperProps?: Omit<IReqoreLayoutWrapperProps, 'children' | 'withSidebar'> &
    TReqoreDataAttributes;
}

/**
 * What reduced motion stills: Reqore's own elements, each named by a class that starts with
 * `reqore-`, and what they draw before and after them, in the layout and in the portal its dialogs,
 * popovers and notifications open in - Reqore's own, and the one the app names (`customPortalId`,
 * where drawers, modals and popovers then open). Not every element in there: the app's own elements
 * inside the layout keep the transitions the app gave them.
 */
export const getReducedMotionSelectors = (customPortalId?: string): string[] => [
  '.reqore-layout-wrapper',
  ...['.reqore-layout-wrapper', '#reqore-portal', ...(customPortalId ? [customPortalId] : [])].flatMap(
    (scope) =>
      ['', '::before', '::after'].flatMap((part) =>
        ["[class^='reqore-']", "[class*=' reqore-']"].map((own) => `${scope} ${own}${part}`)
      )
  ),
];

/** What reduced motion stills where the app names no portal of its own (`getReducedMotionSelectors`). */
export const REDUCED_MOTION_SELECTORS: string[] = getReducedMotionSelectors();

/**
 * The children of a wrapped control group (`ReqoreControlGroup` with `wrap`), which are never wider than the group:
 * each is capped at the row, and may shrink below its content to fit it. All of it is in `:where()`, so the rule
 * weighs nothing and a child that sets its own width limits (a button's `maxWidth`) keeps them. It is a global
 * rule because a group's own styles are scoped to the group's class, which would weigh as much as the child's.
 */
export const WRAPPED_CONTROL_GROUP_CHILD_SELECTOR = ':where(.reqore-control-group-wrapped) > *';

const GlobalStyle = createGlobalStyle<{ $customPortalId?: string }>`
  .reqore-blur-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 8998;
    cursor: pointer;
    background-color: ${({ theme }) => rgba(getMainBackgroundColor(theme), 0.3)};
    backdrop-filter: blur(3px);
  }

  .reqore-blur-z-index {
    z-index: 8999;
  }

  /* A wrapped control group's child is never wider than the group (WRAPPED_CONTROL_GROUP_CHILD_SELECTOR). A child
     as wide as content that does not wrap - a button saying a value and its description, or a group holding one -
     stayed that wide, past the group and the card it was in: a data provider's path ran 487-712px wide in a 346px
     card on a phone (qorus#646). */
  ${WRAPPED_CONTROL_GROUP_CHILD_SELECTOR} {
    max-width: 100%;
    min-width: 0;
  }

  /* Reduced motion (WCAG 2.3.3): what Reqore draws changes at once - its own elements only, see
     REDUCED_MOTION_SELECTORS. A hair of a duration, not none: a transition of no time sends no
     transitionend, which some components wait for. Reqore's springs settle at once in their own
     components (immediate under usePrefersReducedMotion), not through react-spring's global switch,
     which settled the app's springs too. (No backticks in here: this comment lives inside a
     template literal.) */
  @media (prefers-reduced-motion: reduce) {
    ${({ $customPortalId }) => getReducedMotionSelectors($customPortalId).join(', ')} {
      transition-duration: 0.01ms !important;
      transition-delay: 0s !important;
    }
  }
`;

const StyledPortal = styled.div`
  * {
    box-sizing: border-box;
  }

  ${({ theme }) => css`
    color: ${getReadableColor(theme, undefined, undefined, true)};
  `}

  /* The portal is outside the layout wrapper, so it names the theme's font itself. */
  ${({ theme }) =>
    theme.fontFamily &&
    css`
      font-family: ${getFontFamily(theme.fontFamily)};
    `}
`;

const ReqorePortal = memo(
  forwardRef<HTMLDivElement, object>((_props, ref) => {
    return (
      <ReqoreThemeProvider>
        <StyledPortal id='reqore-portal' ref={ref} />
      </ReqoreThemeProvider>
    );
  })
);

/**
 * Wrap your application with Reqore's theme, layout, and modal portal context.
 */
const ReqoreUIProvider: React.FC<IReqoreUIProviderProps> = memo(
  ({ children, theme, options, layoutWrapperProps }) => {
    const [modalPortal, setModalPortal] = useState<any>(false);

    const _theme: Partial<IReqoreTheme> = useMemo(() => cloneDeep(theme || {}), [theme]);
    const _defaultTheme: IReqoreTheme = useMemo(() => cloneDeep(DEFAULT_THEME), []);
    const rebuiltTheme: IReqoreTheme = useMemo(
      () => buildTheme(merge(_defaultTheme, _theme)),
      [_defaultTheme, _theme]
    );

    return (
      <>
        <ThemeContext.Provider value={{ ...rebuiltTheme }}>
          <ReqoreThemeProvider>
            <GlobalStyle $customPortalId={options?.customPortalId} />
          </ReqoreThemeProvider>
          <ReqoreLayoutWrapper {...layoutWrapperProps} withSidebar={options?.withSidebar}>
            {modalPortal ? <ReqoreProvider options={options}>{children}</ReqoreProvider> : null}
          </ReqoreLayoutWrapper>
          <ReqorePortal ref={setModalPortal} />
        </ThemeContext.Provider>
      </>
    );
  }
);

export default ReqoreUIProvider;
