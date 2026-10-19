import { IReqoreEffect, TReqoreEffectColor, TReqoreHexColor } from '../components/Effect';
import { Colors } from './colors';
import { TReqoreFontFamilyShorthand } from './fonts';
import { TSizes } from './sizes';

export interface IReqoreSidebarTheme {
  main?: TReqoreHexColor;
  color?: TReqoreHexColor;
  border?: TReqoreHexColor;
  item?: {
    color?: TReqoreHexColor;
    background?: TReqoreHexColor;
    border?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    hoverBackground?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
    activeBackground?: TReqoreHexColor;
  };
  subItem?: {
    color?: TReqoreHexColor;
    border?: TReqoreHexColor;
    background?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    hoverBackground?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
    activeBackground?: TReqoreHexColor;
  };
  icon?: {
    color?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
  };
  section?: {
    background?: TReqoreHexColor;
  };
}

export interface IReqoreBreadcrumbsTheme {
  main?: TReqoreHexColor;
  item?: {
    color?: TReqoreHexColor;
    hoverColor?: TReqoreHexColor;
    activeColor?: TReqoreHexColor;
  };
}

export interface IReqoreNavbarTheme {
  main?: TReqoreHexColor;
  color?: TReqoreHexColor;
  border?: TReqoreHexColor;
  background?: TReqoreHexColor;
  hoverColor?: TReqoreHexColor;
}

/**
 * The surface panels and panel-like containers are painted on, and the hairline they are edged
 * with. Unset, both are derived from `main` as they always were (on a dark theme the panel comes
 * out a shade DARKER than the page). Set, a panel can sit one step above the page with a
 * neutral 1px edge — one decision for every surface instead of a `customTheme` on each.
 *
 * Read by ReqorePanel (and so ReqoreDrawer, ReqoreModal and ReqoreTable), ReqoreStatistic,
 * ReqoreAccordion, ReqoreCallout, ReqoreCollection items, ReqoreFeatureCard, ReqoreMenu,
 * ReqoreTestimonial, ReqoreTier, ReqoreEntityRow and ReqoreSeverityRow, and by table row lines.
 *
 * A component whose surface is customised — a `customTheme` with a `main`, an `intent`, or a
 * custom theme inherited from an ancestor — keeps deriving its colours from that, as before.
 */
export interface IReqorePanelTheme {
  /** The panel surface. */
  main?: TReqoreHexColor;
  /** The 1px hairline on the panel's edge and between its rows. */
  border?: TReqoreHexColor;
}

/**
 * The px every `size` renders its text at, decided once for the whole app. Each table names only
 * the sizes it changes; a size it leaves out — and every size when `typeScale` is unset — keeps
 * Reqore's own value (`TEXT_FROM_SIZE`, `CONTROL_TEXT_FROM_SIZE`, `TAG_TEXT_FROM_SIZE`), so a
 * theme without it renders exactly as before.
 *
 * What a component derives from its text size (a feature card's title at 1.4×, a data view's
 * secondary line a pixel smaller, the width a tab list measures a label at) is derived from the
 * theme's value. Box heights are not type: a button, an input, a tag or a table row keeps its
 * height from the size, and its text is centred in it.
 */
export interface IReqoreTypeScale {
  /**
   * px per size for running text: ReqoreP, ReqoreSpan, ReqoreLink, table cells,
   * panel/accordion/callout/bubble/notification/dataview text, `effect.textSize` given as a
   * size name (which is how table header cells are sized: one size below the table's).
   */
  text?: Partial<Record<TSizes, number>>;
  /**
   * px per size for controls: buttons, inputs, textareas, tabs, checkboxes, segmented control,
   * progress, a tag's actions.
   */
  control?: Partial<Record<TSizes, number>>;
  /** px per size for tags, badges and keyboard keys. */
  tag?: Partial<Record<TSizes, number>>;
  /**
   * Unitless line height for running text, set where `theme.fontFamily` is set (the layout
   * wrapper and the portal popovers, modals and drawers render into) and inherited from there.
   * Unset, neither names one: the browser's `normal` applies, as before.
   */
  lineHeight?: number;
}

export interface IReqoreTheme {
  main: TReqoreHexColor;
  originalMain?: TReqoreHexColor;
  text?: {
    color?: TReqoreHexColor;
    dim?: boolean;
  };
  /**
   * The font Reqore renders in — set on the layout wrapper and the portal that popovers, modals
   * and drawers render into, and inherited from there by the text inside, buttons and inputs
   * included. Accepts the `'mono'` / `'system'` shorthands of `effect.fontFamily` or any CSS
   * font stack.
   *
   * Tags and textareas are excluded: `ReqoreTag` (badges included) and the
   * `ReqoreKeyboardShortcut` keys keep the platform UI font (`system-ui`), and `ReqoreTextarea`
   * keeps the browser's `monospace`. `effect.fontFamily` still picks a font for one of them.
   *
   * Unset (the default), the wrapper and the portal name no font: the page's font reaches them.
   */
  fontFamily?: TReqoreFontFamilyShorthand | string;
  /** Text sizes and line height for the whole app. See `IReqoreTypeScale`. */
  typeScale?: IReqoreTypeScale;
  intents: IReqoreIntents;
  sidebar?: IReqoreSidebarTheme;
  notifications: IReqoreIntents;
  popover?: {
    main: TReqoreHexColor;
  };
  /** Surface and hairline for panels and panel-like containers. See `IReqorePanelTheme`. */
  panel?: IReqorePanelTheme;
  /**
   * Whether the small labels Reqore names things with — a statistic's label, a menu's group
   * heading, a stacked bar's segment labels, a description list's row labels — are set in
   * tracked uppercase. Default `true` (unchanged). A theme that sets every label in sentence
   * case (the calm theme) sets `false` once here, instead of overriding each component at every
   * call site — which is how one app ended up with uppercase headings in the menus nobody had
   * reached yet. A component's own `uppercase` prop or effect still wins.
   */
  uppercaseLabels?: boolean;
  header?: IReqoreNavbarTheme;
  footer?: IReqoreNavbarTheme;
  breadcrumbs?: IReqoreBreadcrumbsTheme;
  buttons?: IReqoreCustomTheme;
}

export interface IReqoreCustomTheme {
  /**
   * As `theme.buttons.main`: the surface of every button that has no intent and no surface of
   * its own (a `customTheme` main, given or inherited) — table header cells included, which are
   * buttons. Unset, a button is `main` a step lighter, as before. (`text` is not read.)
   */
  main?: TReqoreEffectColor;
  text?: {
    color?: TReqoreEffectColor;
    dim?: boolean;
  };
  effect?: IReqoreEffect;
  compact?: boolean;
}

export interface IReqoreIntents {
  info?: TReqoreHexColor;
  success?: TReqoreHexColor;
  pending?: TReqoreHexColor;
  warning?: TReqoreHexColor;
  danger?: TReqoreHexColor;
  muted?: TReqoreHexColor;
  black?: TReqoreHexColor;
  white?: TReqoreHexColor;

  custom1?: TReqoreHexColor;
  custom2?: TReqoreHexColor;
  custom3?: TReqoreHexColor;
  custom4?: TReqoreHexColor;
  custom5?: TReqoreHexColor;
}

export const DEFAULT_INTENTS: IReqoreIntents = {
  info: Colors.BLUE,
  success: Colors.GREEN,
  pending: Colors.YELLOW,
  warning: Colors.ORANGE,
  danger: Colors.RED,
  muted: Colors.GRAY,
  black: Colors.DARK,
  white: Colors.LIGHT,

  custom1: Colors.GRAY,
  custom2: Colors.GRAY,
  custom3: Colors.GRAY,
  custom4: Colors.GRAY,
  custom5: Colors.GRAY,
};

export type TReqoreIntent = keyof IReqoreIntents;

export const DEFAULT_THEME: IReqoreTheme = {
  main: Colors.DARK_THEME,
  text: {
    dim: true,
  },
  intents: DEFAULT_INTENTS,
  notifications: {},
};

export const ReqoreIntents: { [key: string]: TReqoreIntent } = {
  INFO: 'info',
  SUCCESS: 'success',
  PENDING: 'pending',
  WARNING: 'warning',
  DANGER: 'danger',
  MUTED: 'muted',
  BLACK: 'black',
  WHITE: 'white',
  CUSTOM1: 'custom1',
  CUSTOM2: 'custom2',
  CUSTOM3: 'custom3',
  CUSTOM4: 'custom4',
  CUSTOM5: 'custom5',
};
