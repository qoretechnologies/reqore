import classNames from 'classnames';
import { isArray, omit, size } from 'lodash';
import { darken, rgba } from 'polished';
import { Resizable, ResizableProps } from 're-resizable';
import {
  forwardRef,
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useMeasure, useUpdateEffect } from 'react-use';
import { panelIsSmall } from './responsive';
import { css } from 'styled-components';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import {
  ACCENT_SIZE_TO_PX,
  clearCorner,
  GAP_FROM_SIZE,
  HEADER_SIZE_TO_NUMBER,
  ICON_FROM_HEADER_SIZE,
  PADDING_FROM_SIZE,
  resolvePanelRadius,
  resolveRadius,
  SPECIAL_PADDING_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { getHeadingSize, getTextSize } from '../../helpers/typeScale';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getMainBackgroundColor,
  getPanelBackgroundColor,
  getPanelHairlineColor,
  getReadableColor,
  getSecondaryTextEffect,
  getThemePanelSurface,
} from '../../helpers/colors';
import styled, {
  listReqoreStyleProps,
  omitStyleProps,
  REQORE_CONTROL_GROUP_CHILD_PROPS,
  TReqoreStylePropKeys,
} from '../../helpers/styled';
import { getOneHigherSize, isActionShown, resolveAccentSize } from '../../helpers/utils';
import { useHoverGate } from '../../helpers/hoveringPointer';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import {
  FIT_TEXT_FLOOR_PX,
  textPaintingElement,
  useFitTextSize,
  wordsFitLines,
} from '../../hooks/useFitTextSize';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  ACTIVE_ICON_SCALE,
  DisabledElement,
  INACTIVE_ICON_SCALE,
  RaisedElement,
} from '../../styles';
import {
  IReqoreComponent,
  IReqoreIntent,
  IReqoreTooltip,
  IWithReqoreCustomTheme,
  IWithReqoreDestructive,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreIconImage,
  IWithReqoreLoading,
  IWithReqoreSize,
  IWithReqoreTooltip,
  TReqoreDataAttributes,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreBreadcrumbs, { IReqoreBreadcrumbsProps } from '../Breadcrumbs';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import { StyledCollectionItemContent } from '../Collection/item';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import ReqoreDropdown, { IReqoreDropdownProps } from '../Dropdown';
import { IReqoreDropdownItem } from '../Dropdown/list';
import {
  getPrimaryGradient,
  IReqoreEffect,
  patchPrimaryGradient,
  StyledEffect,
  TReqoreEffectColor,
} from '../Effect';
import { ReqoreErrorBoundary } from '../ErrorBoundary';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreSkeleton } from '../Skeleton';
import { ReqoreSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';
import { LabelEditor } from './LabelEditor';
import { ReqorePanelNonResponsiveActions } from './NonResponsiveActions';
import { ReqoreTitleAndBadges, TITLE_AND_BADGES_CLASS } from './TitleAndBadges';

const getPaddingSize = (padded: boolean | TSizes, size: TSizes): number =>
  typeof padded === 'string' ? SPECIAL_PADDING_FROM_SIZE[padded] : PADDING_FROM_SIZE[size];

export interface IReqorePanelSubAction extends Omit<IReqoreDropdownItem, 'value'> {
  show?: boolean;
}
export interface IReqorePanelAction
  extends IReqoreButtonProps, IWithReqoreTooltip, IReqoreIntent, IWithReqoreDestructive {
  label?: string | number;
  onClick?: () => void;
  group?: IReqorePanelAction[];
  actions?: IReqorePanelSubAction[];
  actionsProps?: IReqoreDropdownProps;
  multiSelect?: boolean;
  // Custom react element
  as?: React.ElementType;
  props?: { [key: string | number]: any } | undefined;
  // Hide the action if the condition is false
  show?: boolean | 'hover';
  // Hide the action if the group is too small
  responsive?: boolean;
  /**
   * The icon says what the action does (refresh, close, download, copy, settings…), so it is drawn as its icon
   * alone at every width; its `label` becomes its tooltip (unless it has one) and its accessible name. Leave it off
   * where the icon cannot carry the meaning on its own (a choice between two things, a mode, a named destination,
   * a primary call to action): those keep their words (`responsive: false` keeps them on a narrow panel too).
   */
  iconOnly?: boolean;
}

export interface IReqorePanelBottomAction extends IReqorePanelAction {
  position?: 'left' | 'right';
}

export interface IReqorePanelContent {}
export type TReqorePanelActions = IReqorePanelAction[];
export type TReqorePanelBottomActions = IReqorePanelBottomAction[];

export interface IReqorePanelProps
  extends
    IReqoreComponent,
    IWithReqoreSize,
    IWithReqoreCustomTheme,
    IWithReqoreFlat,
    IReqoreIntent,
    IWithReqoreTooltip,
    IWithReqoreFluid,
    IWithReqoreIconImage,
    IWithReqoreLoading,
    React.HTMLAttributes<HTMLDivElement> {
  as?: any;
  children?: any;

  icon?: IReqoreIconName;
  iconProps?: IReqoreIconProps;
  /**
   * When `true`, the leading icon is rendered inside the label/badge row so
   * the description appears beneath both the icon and the label. When `false`
   * (default), the icon sits to the left of the label+description stack and
   * its vertical alignment is controlled by `iconVerticalAlign`.
   */
  iconWithLabel?: boolean;
  /**
   * Vertical alignment of the leading icon relative to the label+description
   * stack. Only takes effect when `iconWithLabel={false}` (the default
   * layout). Defaults to `'center'`.
   * - `'top'`: icon aligns with the label line
   * - `'center'`: icon centres against the whole label+description block
   * - `'bottom'`: icon aligns with the description line
   */
  iconVerticalAlign?: 'top' | 'center' | 'bottom';
  label?: string | ReactElement<any>;
  badge?: TReqoreBadge | TReqoreBadge[];
  description?: string;

  collapsible?: boolean;
  isCollapsed?: boolean;
  collapseButtonProps?: IReqoreButtonProps;
  disabled?: boolean;

  onLabelEdit?: (label: string | number) => void;
  resizable?: ResizableProps;

  breadcrumbs?: IReqoreBreadcrumbsProps;

  onClose?: () => void;
  closeButtonProps?: IReqoreButtonProps;

  rounded?: boolean;
  /**
   * Override the size used to derive the panel's border-radius. Defaults to `'normal'`,
   * which preserves the legacy behaviour where the radius was independent of `size`.
   * Useful when the panel's text/padding scale should differ from its corner roundness
   * (e.g. a large hero card with a generous radius, or a small chip-style panel with
   * a tight radius).
   */
  radiusSize?: TSizes;
  wrapperPadding?: 'top' | 'bottom' | 'both' | 'none';

  actions?: TReqorePanelActions;
  bottomActions?: TReqorePanelBottomActions;
  showActionsWhenCollapsed?: boolean;

  unMountContentOnCollapse?: boolean;
  onCollapseChange?: (isCollapsed?: boolean) => void;
  fill?: boolean;
  padded?: boolean | TSizes;
  contentStyle?: React.CSSProperties;
  opacity?: number;
  blur?: number;
  minimal?: boolean;
  labelSize?: 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * @internal Set by ReqoreDrawer and ReqoreModal on their own panel: its title is a dialog's, drawn
   * at `theme.typeScale.dialogHeading` px where the theme names it.
   */
  _dialogTitle?: boolean;
  contentSize?: TSizes;
  contentEffect?: IReqoreEffect;
  labelEffect?: IReqoreEffect;
  descriptionEffect?: IReqoreEffect;
  descriptionIntent?: TReqoreIntent;
  transparent?: boolean;
  iconColor?: TReqoreEffectColor;
  responsiveActions?: boolean;
  responsiveTitle?: boolean;
  /**
   * Where the title and the actions do not fit on one line, the actions go to the line under the
   * title, at its end, before any word of the title wraps, shrinks or is cut (the title keeps its
   * words, what is beside it gives way first). Where they fit, the
   * bar is one line, as without it. The actions move together, in the page's order; the folding
   * ones fold into "⋯" only where even the whole line under the title is too short for them.
   *
   * A lone destructive action (`destructive`, or a `danger` intent) stays on the title's line, at
   * its end and its own size: a row on a phone keeps a lone Delete there too.
   *
   * The collapse and close controls go with the actions. A page head on a phone is what it is for
   * (a pull request's title beside four actions ran to two lines in 130px).
   *
   * On by default for every panel, drawer and dialog; `false` keeps a bar of one line
   * whatever it costs the title.
   *
   * @default true
   */
  wrapActionsBelowTitle?: boolean;
  /**
   * Shrink the title to fit its box before ellipsizing it, down to `labelMinTextSize`.
   * Ignored when `labelEffect.textSize` pins a size.
   *
   * OPT-IN, and the reason is space rather than the fit itself. The responsive action group is
   * `fluid`, so it takes the row's remainder — measured at 206px to hold 90px of buttons — and
   * the title is left with 142px of a 518px bar. The fit then does exactly what it is told and
   * shrinks a title that would have fitted at its natural size given a fair share.
   *
   * With the action group content-sized instead, the cascade is right: 19 / 19 / 18 / 12 / 12px
   * as the bar goes 518 → 438 → 378 → 298 → 218. But `responsive` collapse tests
   * `scrollWidth > clientWidth`, so a content-sized group can never overflow and the fold into
   * the `…` menu stops happening. Freeing the title means bounding that group some other way —
   * a decision about how the title bar divides its width, not a flag.
   *
   * @default true
   */
  fitLabel?: boolean;
  /**
   * Where the description goes.
   *
   * `'inline'` (the default) stacks it under the title, sharing the title's column — so the
   * title, the description and the actions all divide one row, and on a narrow bar the two
   * texts fight each other for a column that may be a third of the panel.
   *
   * `'below'` gives it a row of its own under the whole bar, actions included. The title then
   * has the column to itself and the description gets the full width, which is usually more
   * than either had before: at a 300px bar the title's box goes from 128px to 226px, and the
   * description stops wrapping to three lines. Worth it when the description is a real
   * sentence; unnecessary when it is a word or two that was never going to wrap.
   *
   * @default 'inline'
   */
  descriptionPosition?: 'inline' | 'below';
  /**
   * How many lines the description may wrap to before it is ellipsized. Unset means unlimited,
   * which is today's behaviour.
   *
   * Separate from `labelMaxLines` because the two answer different questions — the title names
   * the panel and is worth two lines, a description is support text and is often worth one —
   * but a bar that bounds one and not the other only half-solves the problem: clamp the title
   * to two lines at 260px and the description underneath still runs to four.
   *
   * @default 2
   */
  descriptionMaxLines?: number;
  /**
   * The most height a description that is not clamped (`descriptionMaxLines={0}`, or a clamped
   * one opened by a click) takes — any CSS length — before it scrolls in its own box, with the
   * title above it and the actions below it left where they are. For a panel whose height is
   * bounded, a dialog above all: there a message longer than the screen pushed the panel's own
   * buttons out of reach. Unset, the description is as tall as its text. `ReqoreModal` sets
   * `'50vh'`.
   */
  descriptionMaxHeight?: string;
  /**
   * The corner radius, in px, of a rounded container the panel sits flush in — a stacked
   * `ReqoreCollection`, which clips its square rows into one rounded block. The title bar, the
   * padded content and the bottom actions clear that corner as they clear the panel's own
   * (`clearCorner`). Unset, only the panel's own corner counts.
   */
  enclosingRadius?: number;
  /**
   * How many lines the title may wrap to before it is ellipsized. `1` (the default) is today's
   * behaviour: one line, cut with an ellipsis the moment it runs out of room.
   *
   * Above 1 the title gives ground in the order that costs the reader least — it wraps before
   * it shrinks, and shrinks before it truncates. Wrapping keeps every character at full size,
   * shrinking keeps every character, and only the ellipsis actually removes words, so that is
   * the order. With `fitLabel` the two compose: the fit measures against the whole line budget,
   * so the title stays at its natural size while it fits in two lines, then shrinks to make two
   * lines work, and the clamp ellipsizes whatever a floored font still cannot hold.
   *
   * Two is the useful value. A title bar that grows past two lines stops reading as a bar.
   *
   * @default 2
   */
  labelMaxLines?: number;
  /**
   * Floor for the shrinking title, in px. Defaults to two thirds of its natural size and
   * never below 11px — past that a heading is fine print, and an ellipsis reads better.
   */
  labelMinTextSize?: number;
  /**
   * Drop the title TEXT on a narrow bar and leave the icon in its place: `[icon] [actions] [×]`.
   *
   * A narrow bar already stays on one row without this — the label ellipsizes and the responsive
   * actions collapse into their overflow. `compactTitle` is the tighter fallback for a bar with
   * so little room that an ellipsized label is a character and a half: it gives that space to the
   * actions instead.
   *
   * Opt-in, because the label carries meaning this cannot recover — it is the collapse target and
   * it may be inline-editable. Nothing changes on a panel with no icon to fall back to, since a
   * header with neither is not compact but empty; the label survives as that icon's tooltip, and
   * `description` (a second line by definition) is dropped for the row.
   *
   * @default false
   */
  compactTitle?: boolean;
  getContentRef?: (ref: HTMLDivElement) => any;

  labelProps?: React.HTMLAttributes<unknown>;
  showLabelTooltip?: boolean;
  customLabelTooltip?: IReqoreTooltip;

  responsiveActionsWrapperProps?: Partial<IReqoreControlGroupProps>;
  stickyHeader?: boolean;
  stickyHeaderOffset?: number;
  floatingActions?: boolean;
  /**
   * Tooltip for the collapse control while the content shows. Defaults to `'Hide'`: the
   * reader's word for what it does, not the mechanism's (`'Collapse'`).
   */
  collapseTooltip?: string;
  /** Tooltip for the collapse control while the content is hidden. Defaults to `'Show'`. */
  expandTooltip?: string;
  /** Tooltip for the close (`×`) control. Defaults to `'Close'`. */
  closeTooltip?: string;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border); the highlight is suppressed
   * when a border is rendered (i.e. `flat={false}` or an `intent` is set)
   * because the border already provides surface definition.
   */
  raised?: boolean;
  /**
   * Renders the intent color (or a neutral highlight when no intent is set) as a
   * single accent strip on one edge instead of tinting the whole border — the
   * quiet "severity rail" treatment, mirroring `ReqoreCallout`'s accent API.
   * When set, the panel's own border drops the intent tint (and is omitted
   * entirely on `flat` panels) so the strip carries the color alone.
   */
  accentPosition?: 'left' | 'top';
  /**
   * Thickness of the accent strip — a raw pixel number, or a `TSizes` name
   * resolved through `ACCENT_SIZE_TO_PX`. Defaults to `'normal'` (5px).
   */
  accentSize?: number | TSizes;
  /**
   * A cover — an image URL, or any node (an `<img>`, a `<picture>`, a `<video>`, an
   * illustration) — drawn edge to edge across the panel, outside its padding, and clipped to
   * its rounded corners. At the `'top'` (the default) it sits above the title bar; at the
   * `'bottom'`, under the bottom actions. A URL renders an `<img>` (`mediaAlt` is its text); an
   * `img`, `picture`, `video`, `svg`, `canvas` or `iframe` node fills the width. Hidden while the
   * panel is collapsed.
   */
  media?: string | React.ReactNode;
  /**
   * Alternative text for a `media` URL. Default `''`: a decorative image, skipped by screen
   * readers. A node carries its own.
   */
  mediaAlt?: string;
  /** Where the media sits. Default `'top'`. */
  mediaPosition?: 'top' | 'bottom';
  /**
   * The media frame's aspect ratio — anything CSS `aspect-ratio` takes (`'16 / 9'`, `1.6`).
   * The media then covers the frame (`object-fit: cover`), cropped rather than stretched.
   * Unset, the frame is as tall as the media.
   */
  mediaAspectRatio?: string | number;
  /**
   * Props for the media frame (a `div`): `className` (merged with `reqore-panel-media`),
   * `style` (e.g. a `maxHeight`), `aria-*`, `data-*`.
   */
  mediaProps?: React.HTMLAttributes<HTMLDivElement> & TReqoreDataAttributes;
}

export interface IStyledPanel extends Omit<IReqorePanelProps, 'accentSize'> {
  theme: IReqoreTheme;
  noHorizontalPadding?: boolean;
  stickyHeaderOffset?: number;
  /** The resolved scroll ancestor's top padding, measured at runtime. Subtracted
   *  from the sticky `top` so a padded scrollport still pins the header flush to
   *  its visible top edge. Internal — the component measures it; callers use
   *  `stickyHeaderOffset` to shift a header deliberately. */
  stickyHeaderInset?: number;
  /** The header is actually pinned: `stickyHeader` is on AND the panel is more than
   *  `STICKY_HEADER_TALL_SCREENS` times the height of its scroll area. */
  $pins?: boolean;
  /** True when the description is rendered as its own full-width row under the bar. The bar
   *  must wrap for that row to exist at all. */
  $descriptionBelow?: boolean;
  /** True when the actions go to the line under the title where the two do not fit
   *  (`wrapActionsBelowTitle`). The bar wraps, and the title claims its one-line width. */
  $wrapActions?: boolean;
  /** Resolved line cap for the description, or 0 for "no cap". */
  $descriptionMaxLines?: number;
  /** The height an unclamped description scrolls past, or unset for none. */
  $descriptionMaxHeight?: string;
  /** Description size in px once the title has been fitted, or 0 to leave it at its own. */
  $descriptionFontPx?: number;
  /** Always a resolved pixel number — the component maps `TSizes` names before
   *  it reaches the styles, so the css (which interpolates px) never sees a string. */
  $accentSize?: number;
  /** True once a sticky header has pinned to its scroll container (detected at
   *  runtime). The header drops its top radius while stuck so it reads as a
   *  full-width bar, and regains it at rest. */
  isStuck?: boolean;
  /** True when `media` sits above the title bar: the bar is not the panel's top edge, so a
   *  sticky header has no top corners to round. */
  $mediaAbove?: boolean;
  /** The panel's inner corner radius (its radius less its border), or 0 when it draws no
   *  corner. The title bar, the padded content and the bottom actions pad their sides by at
   *  least this, so what they hold starts clear of the curve and on one left edge
   *  (`clearCorner`). */
  $cornerInset?: number;
}

/** Nearest scrollable ancestor of `node` (the element a `position: sticky`
 *  header actually pins to), or `null` for the viewport. Used to scope the
 *  stuck-detection observer to the right scroll container. */
const getScrollableAncestor = (node: HTMLElement | null): HTMLElement | null => {
  let el = node?.parentElement ?? null;
  while (el) {
    const overflowY = getComputedStyle(el).overflowY;
    // `hidden` counts: it is a scroll container per spec and DOES capture a
    // sticky descendant, even though it shows no scrollbar. Skipping it picks
    // the wrong ancestor and measures the wrong inset below.
    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay' ||
      overflowY === 'hidden'
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
};

/**
 * How many screens of its scroll area a panel must span before a `stickyHeader` pins.
 *
 * A pinned header is for finding your place in a long panel whose header has scrolled away. A
 * panel that fits on the screen, or nearly does, never puts you there: its header pinned for
 * the few pixels it overhung and drew a band with nothing under it to label. Just over one
 * screen is not enough - a 311px card in a 264px area pinned for its 47px of overhang - so the
 * line is one and a half.
 */
export const STICKY_HEADER_TALL_SCREENS = 1.5;

/** The height a scroll area shows: its client height less its own padding, or the window's
 *  for the viewport. */
const getScrollportVisibleHeight = (el: HTMLElement | null): number => {
  if (!el) return window.innerHeight;
  const style = getComputedStyle(el);
  return (
    el.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0)
  );
};

/** The distance from a scrollport's border-box top to the line a `position:
 *  sticky; top: 0` descendant actually pins to — its top padding. Sticky
 *  resolves against the scroll container's CONTENT box, so a padded scrollport
 *  parks the header below its own padding and content scrolls through the gap.
 *  Border is reported separately: it sits outside the scrollport and so shifts
 *  the reference the stuck-detector measures against, but not the sticky line. */
const getScrollportInset = (el: HTMLElement | null): { padding: number; border: number } => {
  if (!el) return { padding: 0, border: 0 };
  const style = getComputedStyle(el);
  return {
    padding: parseFloat(style.paddingTop) || 0,
    border: parseFloat(style.borderTopWidth) || 0,
  };
};

/**
 * The box the title lives in — and, when the title may wrap, the thing that clamps it.
 *
 * It exists first as a measuring box: as a `min-width: 0` flex child it reports the width the
 * row actually left for the title, where the heading itself would report what its text wants.
 * `overflow: hidden` is what makes it shrinkable at all, and `display: flex` keeps it from
 * opening a line box around the inline-flex heading — a block wrapper adds the row's leading on
 * top of the heading's own box, which made a `tiny` panel 3px taller than it used to be.
 */
const StyledPanelTitleLabelBox = styled.div<{ $clampLines: number; $ownLine?: boolean }>`
  display: flex;
  min-width: 0;
  overflow: hidden;
  /* A title shrunk below its natural size takes its line whole, so its badges stay under it: it
     shrank because it did not fit the line on its own, and a smaller font must not make room for
     them beside it again. Badges give way before the title gives anything. The line stays the
     title's once it fits there again (see \`ownLine\`). */
  flex: ${({ $ownLine }) => ($ownLine ? '1 1 100%' : '0 1 auto')};

  ${({ $clampLines }) =>
    $clampLines > 1 &&
    css`
      .reqore-heading {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: ${$clampLines};
        overflow: hidden;
        white-space: normal;
        /* A single word longer than the box would push past it rather than break, and the
           clamp would have nothing to ellipsize. */
        overflow-wrap: anywhere;
        max-width: 100%;

        /* The heading wraps its text in a span of its own, and \`-webkit-line-clamp\` counts the
           box's CHILDREN rather than the lines inside them — so one block-level child reads as
           a single line and nothing is ever clamped, however far the text overruns. Putting the
           text back into the heading's own line boxes is what the clamp actually measures. */
        .reqore-span {
          display: inline;
        }
      }
    `}
`;

/**
 * How much more than the actions' box a title takes of the room its line leaves (`wrapActionsBelowTitle`): all
 * but a sliver, so a description beside the actions is not wrapped into half the line.
 */
const TITLE_TAKES_THE_ROOM = 1000;

/**
 * How small a title may be drawn to keep actions that draw no words beside it, as a share of its own size
 * (`wrapActionsBelowTitle`): a row of icons under a title they missed by a few px cost a whole row (an
 * issue drawer at 599px, 4px short for its ? and x). The title shrinks a bit instead; a title that would have
 * to go smaller than this lets them go under it.
 */
export const ICON_ACTIONS_TITLE_SHRINK = 0.9;

/** The px a title kept to one line for icons, which may otherwise wrap, keeps spare in its fit (see its use). */
const TITLE_KEPT_ON_ONE_LINE_SLACK = -1;

/**
 * Whether a bar action is drawn as its icon alone, with no words: `iconOnly`, an icon with no label, or a
 * label a narrow bar drops (as `renderActions` does). A control the caller draws (`as`) or a menu that keeps
 * its label has words; a group, only if one of its own has.
 */
export const actionDrawsNoWords = (action: IReqorePanelAction, narrow: boolean): boolean => {
  if (action.show === false) {
    return true;
  }

  if (action.as) {
    return false;
  }

  if (size(action.group)) {
    return action.group!.every((child) => actionDrawsNoWords(child, narrow));
  }

  const hasLabel = action.label !== undefined && action.label !== null && action.label !== '';

  if (!hasLabel || action.iconOnly) {
    return !!action.icon;
  }

  return !!action.icon && !size(action.actions) && narrow && action.responsive !== false;
};

/**
 * How much more than the title a group of actions that do not collapse takes of the room left over: so much
 * that the title's box widens only once the group is at its own width (a flex item takes its grow factor's
 * share of the free space, and the title's is 1).
 */
const ACTIONS_GROW_BEFORE_TITLE = 1000;

/**
 * The flex of the group of actions that do not collapse, beside a title in a NARROW bar:
 * sized from what the title leaves, between what its controls cannot do without and
 * its own width. See where it is used. A wide bar leaves the group at its own width (`0 0 auto`),
 * as it always was.
 */
const NARROW_ACTIONS_BESIDE_TITLE: React.CSSProperties = {
  flex: `${ACTIONS_GROW_BEFORE_TITLE} 1 0%`,
  maxWidth: 'max-content',
};

/** The class of the bar's group of actions that do not collapse, which the title's fit measures. */
const NON_RESPONSIVE_ACTIONS_CLASS = 'reqore-panel-non-responsive-actions';

/**
 * The class of the group of actions that keep their words which the page lists before its first
 * folding action: drawn before the folding group, so the bar keeps the page's order.
 */
export const LEADING_ACTIONS_CLASS = 'reqore-panel-leading-actions';

/** The class of the box that holds a bar's actions where they may go under its title. */
export const TITLE_ACTIONS_CLASS = 'reqore-panel-title-actions';
/**
 * Marks each group of a panel's actions, in its title bar and its bottom bar. A click inside one is the action's,
 * never the panel's (`isPanelOwnClick`). An action used to keep its click from the panel only when it had an
 * `onClick` of its own, so a custom (`as`) action without one, or one that did not hand an `onClick` on to its DOM (a
 * segmented choice), folded a collapsible panel and was a click on a clickable card.
 */
export const PANEL_ACTIONS_ATTRIBUTE = 'data-reqore-panel-actions';
/** The props that mark a group of a panel's actions (`PANEL_ACTIONS_ATTRIBUTE`). */
const PANEL_ACTIONS_MARK = { [PANEL_ACTIONS_ATTRIBUTE]: '' };

/**
 * Whether a click that reached a panel's element (`event.currentTarget`: the panel, or its title bar) is the panel's
 * own: it landed inside that element, and not in one of the panel's action groups (`PANEL_ACTIONS_ATTRIBUTE`, a nested
 * panel's included), nor in anything opened in a portal (a menu, a dropdown), whose clicks reach the panel through
 * React but land outside its DOM. Only its own click folds a collapsible panel or is a clickable panel's `onClick`.
 * The one place this is decided; nothing stops the click, so a page's outside-click listeners still hear it.
 */
export const isPanelOwnClick = (event: React.MouseEvent<HTMLElement>): boolean => {
  const own = event.currentTarget;
  const target = event.target as Element | null;

  if (!target || !own?.contains?.(target)) {
    return false;
  }

  const actions = target.closest?.(`[${PANEL_ACTIONS_ATTRIBUTE}]`);

  return !(actions && own.contains(actions));
};

/**
 * The box a bar's actions are drawn in where they may go to the line under the title
 * (`wrapActionsBelowTitle`): one flex item, so they move together and in the page's order, as wide
 * as they are where there is room and as the line where they go under it. It takes the line's room
 * (it grows), so its folding group measures the line it is on and unfolds when the bar widens.
 */
const WRAPPED_TITLE_ACTIONS_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  /* At the line's end, but never past its start: actions wider than their line under the title ran off
     its left edge, the first choice of a filter out of sight (a list of recent orders). Where they
     cannot fit they start at the line's start, in reading order. */
  justifyContent: 'safe flex-end',
  flex: '1 1 auto',
  minWidth: 0,
  maxWidth: '100%',
  gap: GAP_FROM_SIZE.normal,
};

/** The bottom bar's right-hand folding group, at the bar's trailing edge. */
const RIGHT_BOTTOM_GROUP_STYLE: React.CSSProperties = { marginLeft: 'auto' };
/**
 * A group of bottom actions that do not fold (`responsive: false`), on the left or the right of the bar: never wider
 * than the bar, and wrapping its own buttons where it would be, so it stacks on a phone instead of running off it.
 * The right group keeps every line at its right edge (`horizontalAlign='flex-end'` pushes only its first button).
 */
const KEPT_BOTTOM_GROUP_STYLE = {
  left: { marginRight: 'auto', maxWidth: '100%', minWidth: 0 },
  right: { marginLeft: 'auto', maxWidth: '100%', minWidth: 0, justifyContent: 'flex-end' },
} satisfies Record<string, React.CSSProperties>;

/**
 * A group of actions that keep their words, in that box: at its own width where the line has room, and down
 * to what its controls cannot do without where it does not, so a control that folds to its room (a
 * `foldToFit` segmented control) folds into the line under the title. At its own width always, the group
 * overflowed a phone's line with the whole filter, its first choices past the panel's edge (a list of
 * recent orders). A button does not shrink (it is `fixed`): the group's least is its buttons.
 */
const KEPT_ACTIONS_AT_THEIR_WIDTH: React.CSSProperties = { flex: '0 1 auto' };

/** One canvas for every panel that measures its title's name (`wrapActionsBelowTitle`). */
let titleMeasureCanvas: HTMLCanvasElement | undefined;

/**
 * The box of actions that hold something with no width of its own (a Collection's search input, a group the
 * caller made `fluid`): it claims half the bar, as the growing group did beside the title before the actions
 * could go under it, so the search fills the room the title leaves; where half the bar does not fit beside the
 * title the line breaks, and under the title the search fills the line.
 */
const FILLING_TITLE_ACTIONS_STYLE: React.CSSProperties = {
  ...WRAPPED_TITLE_ACTIONS_STYLE,
  flex: '1 1 50%',
};

/** The bar's actions: in a box of their own where they may go under the title, as they are otherwise. */
/** The actions kept beside a title that would gain nothing under them: their own width, the title the rest. */
const BESIDE_TITLE_ACTIONS_STYLE: React.CSSProperties = {
  ...WRAPPED_TITLE_ACTIONS_STYLE,
  flex: '0 1 auto',
};

/**
 * The least a search in the actions' box that fills the bar is drawn at beside a title (`wrapActionsBelowTitle`):
 * where its placeholder needs more, that. A short title left a phone's search 107px, its placeholder cut to
 * "Sear"; where the title leaves less, the search goes to the line under it, at its full width.
 */
export const SEARCH_BESIDE_TITLE_MIN_PX = 160;

const PanelTitleActions = ({
  wrap,
  fill,
  fillMinWidth,
  beside,
  children,
}: {
  wrap: boolean;
  /** The folding group grows (it holds a search): the box takes half the bar, and the group fills it. */
  fill?: boolean;
  /** The least that box is (its search at the width it needs, and the controls beside it), in px. */
  fillMinWidth?: number;
  /** Kept beside the title, which takes the rest of the line (the title would gain nothing under them). */
  beside?: boolean;
  children: React.ReactNode;
}): JSX.Element =>
  wrap ? (
    <div
      className={TITLE_ACTIONS_CLASS}
      style={
        fill
          ? fillMinWidth
            ? { ...FILLING_TITLE_ACTIONS_STYLE, minWidth: fillMinWidth }
            : FILLING_TITLE_ACTIONS_STYLE
          : beside
            ? BESIDE_TITLE_ACTIONS_STYLE
            : WRAPPED_TITLE_ACTIONS_STYLE
      }
    >
      {children}
    </div>
  ) : (
    <>{children}</>
  );

/**
 * How much wider `element` is than the least it can be: its width less its min-content width, read
 * with its flex and width set aside for the measurement and put back before anything is drawn.
 */
const getWidthAboveMinimum = (element: HTMLElement): number => {
  const width = element.getBoundingClientRect().width;
  const { flex, width: styleWidth } = element.style;

  element.style.flex = '0 0 auto';
  element.style.width = 'min-content';
  const minimum = element.getBoundingClientRect().width;
  element.style.flex = flex;
  element.style.width = styleWidth;

  return Math.max(0, width - minimum);
};

/**
 * What a panel's badges say, as one comparable value: a caller that builds its `badge` array in
 * render hands over a new array every time, and an effect keyed on that array ran after every
 * render. Two effects that measure the title read this instead, so they run when a badge changes,
 * not whenever the panel draws.
 */
const badgeSignature = (badge: unknown): string =>
  (Array.isArray(badge) ? badge : badge === undefined || badge === null ? [] : [badge])
    .map((item) =>
      item !== null && typeof item === 'object'
        ? `${String((item as { label?: unknown }).label ?? '')}:${String(
            (item as { icon?: unknown }).icon ?? ''
          )}`
        : String(item)
    )
    .join('|');

export const StyledPanelTitleHeader = styled.div`

  display: flex;
  justify-content: flex-start;
  align-items: center;
  /* A CONTENT basis, and both extremes were tried before settling here. Basis 0 hands the action
     group beside this one its full content width, so nothing ever overflows and the fold into the
     menu never fires — actions labelled "hidden when small" stay visible on a small panel. A 100%
     width does the opposite: this header claims the entire row, so the group is always crushed to
     its floor and always folds however much room there is, which hid Tree's save button behind an
     overflow menu on a panel with space to spare. On a content basis the two shrink against each
     other in proportion to what they each need, which is the only version where folding means
     "there is no room" rather than "there is a header". */
  flex: 1 1 auto;
  overflow: hidden;
`;

export const StyledPanelTitleHeaderContent = styled.div<{
  iconSize?: number;
  hasIcon?: boolean;
  size?: TSizes;
  $hasOuterIcon?: boolean;
  $iconVerticalAlign?: 'top' | 'center' | 'bottom';
  $hasDescription?: boolean;
}>`
  // When the icon lives in the outer container (iconVerticalAlign mode),
  // we use a 2-column × N-row CSS Grid where the LABEL ROW and DESCRIPTION
  // ROW are direct grid items — not wrapped inside a span-2 stack. That
  // makes each row's auto-sized height equal to the actual text row's
  // line-box height, so 'align-self: center' on the icon (in column 1)
  // visually centres the icon against the text row it shares a grid row
  // with — no font-metric guesswork.
  display: ${({ $hasOuterIcon }) => ($hasOuterIcon ? 'grid' : 'flex')};
  ${({ $hasOuterIcon, size, $iconVerticalAlign = 'center', $hasDescription }) =>
    $hasOuterIcon
      ? css`
          // 'auto' lets the column grow to the icon's actual rendered size —
          // important when consumers pass a custom 'iconProps.size' that does
          // not match the default size derived from 'panelSize'/'labelSize'.
          // 'iconSize' is still passed via 'min-width' below to ensure a
          // sensible minimum reservation when the row is otherwise empty.
          grid-template-columns: auto minmax(0, 1fr);
          grid-template-rows: ${$hasDescription ? 'auto auto' : 'auto'};
          column-gap: ${PADDING_FROM_SIZE[size || 'normal']}px;
          row-gap: 3px;
          align-items: start;

          & > .reqore-panel-title-icon {
            ${
              $iconVerticalAlign === 'top'
                ? css`
                    grid-row: 1;
                  `
                : $iconVerticalAlign === 'bottom' && $hasDescription
                  ? css`
                      grid-row: 2;
                    `
                  : css`
                      grid-row: 1 / ${$hasDescription ? 3 : 2};
                    `
            }
            grid-column: 1;
            align-self: center;
            justify-self: start;
            // Suppress 'vertical-align: super' that ReqoreIcon applies to its
            // SVG for inline-text contexts. In our grid layout the wrapper is
            // already vertically centred against the text row's line-box;
            // 'display: block' takes the SVG out of inline flow entirely so
            // baseline/super offsets cannot push it off-centre. The wrapper's
            // own 'align-items: center' then centres the SVG within itself.
            & svg {
              display: block;
              vertical-align: middle;
            }
          }

          & > .reqore-panel-title-label-row {
            grid-column: 2;
            grid-row: 1;
            min-width: 0;
          }

          & > .reqore-panel-title-description {
            grid-column: 2;
            grid-row: 2;
            min-width: 0;
          }
        `
      : css`
          justify-content: flex-start;
          align-items: center;
        `}
  flex: 0 1 auto;
  overflow: hidden;
  min-width: ${({ iconSize, hasIcon }) => {
    let width = 0;

    if (hasIcon) {
      width += iconSize;
    }

    return width;
  }}px;
`;

export const StyledPanelTitleHeaderLabelAndDescription = styled.div`
  display: flex;
  flex-flow: column;
  gap: 3px;
  min-width: 0;
  flex: 1 auto;
`;

export const StyledPanelTitleHeaderLabelAndBadge = styled.div`
  display: inline-flex;
  align-items: center;
  max-width: 100%;

  /* A title and its count read as one line: the count sits on the title's baseline. Centred in
     the row instead, a count smaller than its title floated above it, like a superscript,
     because the title's text sits low in the taller heading box it is set in. The icon stays
     centred. */
  & > .${TITLE_AND_BADGES_CLASS} {
    align-self: baseline;
  }
`;

export type TPanelStyle = React.FC<
  Omit<IReqorePanelProps, 'onResize' | 'size'> &
    ResizableProps & {
      ref?: any;
      theme: IReqoreTheme;
      effect: IReqoreEffect;
      interactive?: boolean;
    }
>;

/**
 * Does the panel wrapper draw its 1px border?
 *
 * `accentPosition` moves the intent onto the edge strip, so an accent panel never tints its
 * border — and a `flat` one draws no border at all, leaving the strip to carry the colour alone.
 *
 * This lives in one place because FOUR style rules branch on it — the border itself, the
 * interactive hover border, the `raised` inset highlight, and the sticky header's radius inset.
 * They were four separate copies of `flat && !intent`, and only the first was taught about
 * `accentPosition`, so hover repainted the intent border the strip had just removed and `raised`
 * silently vanished on accent panels.
 */
const hasPanelBorder = ({
  flat,
  intent,
  accentPosition,
}: Pick<IStyledPanel, 'flat' | 'intent' | 'accentPosition'>): boolean =>
  !(flat && (!intent || accentPosition));

/** The colour the panel border (and its hover variant) is derived from. With `accentPosition`
 *  the intent belongs to the strip, so the border falls back to the neutral surface colour. */
const getPanelBorderBaseColor = (
  theme: IReqoreTheme,
  { intent, accentPosition }: Pick<IStyledPanel, 'intent' | 'accentPosition'>
) => (intent && !accentPosition ? theme.intents[intent] : getMainBackgroundColor(theme));

/** The title bar: a band a step lighter than the page — or, with `theme.panel` named, the
 *  panel's own surface, set apart from the body by the hairline under it alone. */
const getPanelHeaderColor = (theme: IReqoreTheme, hovered?: boolean) => {
  const themed = getThemePanelSurface(theme);

  if (themed?.main) {
    return hovered ? changeLightness(themed.main, 0.02) : themed.main;
  }

  return changeLightness(getMainBackgroundColor(theme), hovered ? 0.05 : 0.03);
};

/** The resting border: the intent's colour when the intent tints the edge, else the hairline
 *  (`theme.panel.border` when the theme names one). */
const getPanelBorderColor = (
  theme: IReqoreTheme,
  { intent, accentPosition }: Pick<IStyledPanel, 'intent' | 'accentPosition'>
) =>
  intent && !accentPosition
    ? changeLightness(getPanelBorderBaseColor(theme, { intent, accentPosition }), 0.08)
    : getPanelHairlineColor(theme);

/** The border while the panel is hovered — a step brighter than at rest. */
const getPanelHoverBorderColor = (
  theme: IReqoreTheme,
  { intent, accentPosition }: Pick<IStyledPanel, 'intent' | 'accentPosition'>
) => {
  const themed = !(intent && !accentPosition) ? getThemePanelSurface(theme) : undefined;

  return themed?.border
    ? changeLightness(themed.border, 0.12)
    : changeLightness(getPanelBorderBaseColor(theme, { intent, accentPosition }), 0.25);
};

/**
 * Every panel prop that only styles or configures the panel. None of them reaches the rendered
 * element — the `div`, re-resizable's `Resizable` (which spreads every prop it does not know onto
 * its wrapper div), or a component given as `as`. The compiler checks the record against
 * `IStyledPanel`, so a new prop that is not added here fails the build instead of leaking.
 *
 * re-resizable's own props (`size`, `enable`, `minWidth`, handles, ...) are not in it: they are
 * the `Resizable`'s to receive. `opacity` is the surface's background opacity, an SVG attribute
 * a `div` would keep.
 */
export const REQORE_PANEL_STYLE_PROPS = listReqoreStyleProps<
  TReqoreStylePropKeys<IStyledPanel, React.HTMLAttributes<HTMLDivElement> & ResizableProps>
>({
  accentPosition: true,
  actions: true,
  badge: true,
  blur: true,
  bottomActions: true,
  breadcrumbs: true,
  closeButtonProps: true,
  closePopover: true,
  closeTooltip: true,
  collapseButtonProps: true,
  collapseTooltip: true,
  collapsible: true,
  compactTitle: true,
  contentEffect: true,
  contentSize: true,
  contentStyle: true,
  customLabelTooltip: true,
  customTheme: true,
  description: true,
  descriptionEffect: true,
  descriptionIntent: true,
  descriptionMaxHeight: true,
  descriptionMaxLines: true,
  descriptionPosition: true,
  disabled: true,
  enclosingRadius: true,
  errorBoundaryOptions: true,
  expandTooltip: true,
  fill: true,
  fitLabel: true,
  flat: true,
  floatingActions: true,
  fluid: true,
  getContentRef: true,
  icon: true,
  iconColor: true,
  iconImage: true,
  iconProps: true,
  iconVerticalAlign: true,
  iconWithLabel: true,
  inheritCustomTheme: true,
  intent: true,
  isCollapsed: true,
  isStuck: true,
  label: true,
  labelEffect: true,
  labelMaxLines: true,
  labelMinTextSize: true,
  labelProps: true,
  labelSize: true,
  _dialogTitle: true,
  loading: true,
  loadingIconType: true,
  media: true,
  mediaAlt: true,
  mediaAspectRatio: true,
  mediaPosition: true,
  mediaProps: true,
  minimal: true,
  noHorizontalPadding: true,
  onClose: true,
  onCollapseChange: true,
  onLabelEdit: true,
  opacity: true,
  padded: true,
  radiusSize: true,
  raised: true,
  resizable: true,
  responsiveActions: true,
  responsiveActionsWrapperProps: true,
  responsiveTitle: true,
  rounded: true,
  showActionsWhenCollapsed: true,
  showLabelTooltip: true,
  skeleton: true,
  stickyHeader: true,
  stickyHeaderInset: true,
  stickyHeaderOffset: true,
  theme: true,
  tooltip: true,
  transparent: true,
  unMountContentOnCollapse: true,
  wrapActionsBelowTitle: true,
  wrapperPadding: true,
});

export const StyledPanel: TPanelStyle = styled(StyledEffect).withConfig({
  // Its own props, `interactive` (set by the panel for its hover styles) and the layout flags a
  // containing ControlGroup hands it — except `size`, which a panel never forwards but a
  // `Resizable` reads as its own.
  shouldForwardProp: omitStyleProps(
    ...REQORE_PANEL_STYLE_PROPS,
    ...REQORE_CONTROL_GROUP_CHILD_PROPS.filter((prop) => prop !== 'size'),
    'interactive'
  ),
})<IStyledPanel>`
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(getPanelBackgroundColor(theme), opacity)};
  border-radius: ${({ rounded, radiusSize, theme }) =>
    rounded ? resolvePanelRadius(theme, radiusSize) : 0}px;
  border: ${({ theme, flat, intent, accentPosition }) =>
    hasPanelBorder({ flat, intent, accentPosition })
      ? `1px solid ${getPanelBorderColor(theme, { intent, accentPosition })}`
      : undefined};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  ${({
    accentPosition,
    $accentSize = ACCENT_SIZE_TO_PX.normal,
    theme,
    intent,
    flat,
    rounded,
    radiusSize,
    stickyHeader,
  }) => {
    if (!accentPosition) {
      return undefined;
    }
    // The wrapper normally clips the strip into its rounded corners via `overflow: hidden`
    // (see the `overflow` rule below) — EXCEPT with a sticky header, which forces
    // `overflow: visible` so the header can escape. Unclipped, a square strip pokes out past
    // the panel's corners, so in THAT CASE ONLY the strip carries its own matching radius.
    //
    // Deliberately not applied unconditionally: where the wrapper already clips, a redundant
    // radius re-renders the strip as a rounded box that is then clipped to the same curve —
    // identical shape, but a different antialiasing blend along the whole edge, which shows up
    // as a diff on every existing accent snapshot for no visual gain.
    //
    // The strip sits in the padding box, inside any border, so inset by the border width to
    // land on the wrapper's INNER curve — the same adjustment StyledPanelTopBar makes.
    const stripRadius =
      stickyHeader && rounded
        ? Math.max(
            0,
            resolvePanelRadius(theme, radiusSize) -
              (hasPanelBorder({ flat, intent, accentPosition }) ? 1 : 0)
          )
        : 0;

    return css`
      position: relative;
      /* Reserve the strip's thickness so the title bar and content never sit
         under it — the same reservation ReqoreCallout makes. */
      padding-${accentPosition === 'left' ? 'left' : 'top'}: ${$accentSize}px;

      &::before {
        content: '';
        position: absolute;
        ${
          accentPosition === 'left'
            ? css`
                top: 0;
                bottom: 0;
                left: 0;
                width: ${$accentSize}px;
              `
            : css`
                top: 0;
                right: 0;
                left: 0;
                height: ${$accentSize}px;
              `
        }
        ${
          stripRadius
            ? accentPosition === 'left'
              ? css`
                  border-top-left-radius: ${stripRadius}px;
                  border-bottom-left-radius: ${stripRadius}px;
                `
              : css`
                  border-top-left-radius: ${stripRadius}px;
                  border-top-right-radius: ${stripRadius}px;
                `
            : undefined
        }
        background-color: ${
          intent ? theme.intents[intent] : changeLightness(getMainBackgroundColor(theme), 0.22)
        };
      }
    `;
  }}
  overflow: ${({ stickyHeader }) => (stickyHeader ? 'visible' : 'hidden')};
  display: flex;
  flex-flow: column;
  position: relative;
  backdrop-filter: ${({ blur, opacity }) => (blur && opacity < 1 ? `blur(${blur}px)` : undefined)};
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};
  max-width: 100%;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};

  /* Hover-hiding applies ONLY where the pointer can hover. A touch device never
     fires :hover, so without this gate a \`show: 'hover'\` action is display:none
     forever — not merely invisible but absent from the layout, with nothing on
     screen hinting it exists. Where hover is unavailable the action stays
     visible; losing the tidiness beats losing the action. */
  @media (hover: hover) and (pointer: fine) {
    &:not(:hover) {
      .reqore-panel-action-hidden {
        display: none;
      }
    }
  }

  &.reqore-panel-floating-active {
    border-top-right-radius: 0;
  }

  ${({ interactive, theme, opacity = 1, flat, intent, accentPosition }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            ${StyledPanelTitle} ${StyledPanelTitleHeaderContent} .reqore-panel-title-icon {
              transform: scale(${ACTIVE_ICON_SCALE});
            }

            background-color: ${
              opacity === 0 && flat
                ? undefined
                : rgba(
                    darken(
                      0.025,
                      rgba(getPanelBackgroundColor(theme), opacity)
                    ),
                    opacity
                  )
            };

            border-color: ${
              hasPanelBorder({ flat, intent, accentPosition })
                ? getPanelHoverBorderColor(theme, { intent, accentPosition })
                : undefined
            };

            ${
              opacity !== 0 &&
              css`
                ${StyledCollectionItemContent}:after {
                  background: linear-gradient(
                    to top,
                    ${rgba(
                      darken(
                        0.025,
                        rgba(getPanelBackgroundColor(theme), opacity)
                      ),
                      opacity
                    )}
                      0%,
                    transparent 100%
                  );
                }
              `
            }
          }
        `
      : undefined}

  ${({ raised, flat, intent, accentPosition }) =>
    raised && !hasPanelBorder({ flat, intent, accentPosition }) && RaisedElement}

  ${({ fill, isCollapsed }) =>
    !isCollapsed && fill
      ? css`
          height: 100%;
          flex: 1;
        `
      : undefined}

  ${({ disabled }) => disabled && DisabledElement}
`;

/**
 * The bottom corners of a collapsed panel's title: the panel's inner radius (inset 1px past a
 * visible border, as the top corners are), so the title alone keeps the card's shape. Only
 * where the header is sticky and rounded — elsewhere the panel clips its title itself — and
 * not while the header is stuck, when it is a full-width bar.
 */
const collapsedTitleRadius = ({
  isCollapsed,
  stickyHeader,
  rounded,
  radiusSize,
  flat,
  intent,
  accentPosition,
  isStuck,
  theme,
}: IStyledPanel): string | undefined =>
  isCollapsed && stickyHeader && rounded && !isStuck
    ? `${Math.max(
        0,
        resolvePanelRadius(theme, radiusSize) -
          (hasPanelBorder({ flat, intent, accentPosition }) ? 1 : 0)
      )}px`
    : undefined;

export const StyledPanelTitle = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('opacity'),
})<IStyledPanel>`
  display: flex;
  /* Always a row. The title bar used to flip to a column when narrow; it now ellipsizes its
     label and lets the responsive action group collapse instead, which is what the "hidden when
     small" actions are for and what the stack was quietly defeating (a column made the group
     fluid, and a full-width group had room not to collapse). */
  flex-flow: ${({ $descriptionBelow, $wrapActions }) =>
    $descriptionBelow || $wrapActions ? 'row wrap' : 'row'};

  ${({ $descriptionFontPx }) =>
    !!$descriptionFontPx &&
    css`
      /* The description is a fixed px from the type scale (\`getTextSize\`) and knows nothing
         about the title having shrunk, so a fitted title crosses under it: at the 12px floor
         the support text renders at 15px and outranks the heading it supports. Scaling it by
         the SAME factor the title took keeps the two in their original proportion instead of
         giving the description a fit of its own — which would size it against its own box and
         let the pair drift apart again, in the other direction. */
      .reqore-panel-title-description {
        font-size: ${$descriptionFontPx}px;
      }
    `}

  ${({ $descriptionBelow }) =>
    $descriptionBelow &&
    css`
      /* Only on a wrapping bar. The header claims the row so the action group beside it gets
         squeezed and folds — that is what the base rule is for — but in a WRAPPING row a
         full-width claim takes the whole line and pushes the actions onto their own, which is
         not what "description below" asked for. Here the header grows from 0 into whatever the
         actions leave, on line one, and the description takes line two. */
      > .reqore-panel-title-header {
        width: auto;
        flex: 1 1 0%;
        min-width: 0;
      }
    `}

  ${({ $wrapActions }) =>
    $wrapActions &&
    css`
      /* The title claims its one-line width (a content basis) and the actions theirs, so the line
         breaks between them where the two do not fit, before the title is squeezed: the title then
         has the line to itself, and only there wraps, shrinks or is cut (\`wrapActionsBelowTitle\`).
         After the description-below rule, whose 0 basis would never let it break. */
      > .reqore-panel-title-header {
        width: auto;
        /* The room the two leave on their line is the title's: a description beside the actions is a
           sentence, not a column. The actions' box, which also grows, takes the whole line only where it
           is alone under the title, so its folding group still measures that line. */
        flex: ${TITLE_TAKES_THE_ROOM} 1 auto;
        min-width: 0;
      }

      /* A description under the title has no width of its own to claim: it takes what the title's
         line gives it, so a long sentence does not push the actions down where the title fits. The
         title's column grows to the line, so that is the whole line, not the title's width.
         Only in the title's column, which stretches it: a description on its own row under the bar
         (\`descriptionPosition='below'\`) is an inline-block sized by its words, and with no width of
         its own it was 0px wide, a word or a letter to a line (a dashboard's headings). */
      > .reqore-panel-title-header .reqore-panel-title-description {
        contain: inline-size;
      }

      > .reqore-panel-title-header > ${StyledPanelTitleHeaderContent} {
        flex: 1 1 auto;
        min-width: 0;
      }
    `}

  ${({ $descriptionMaxHeight }) =>
    !!$descriptionMaxHeight &&
    css`
      /* The whole message, wrapped, scrolling in its own box only past this height — so a
         dialog's title and its buttons stay on screen whatever it has to say. */
      .reqore-panel-title-description {
        display: block;
        max-height: ${$descriptionMaxHeight};
        overflow-y: auto;
        overscroll-behavior: contain;
        white-space: normal;
        overflow-wrap: anywhere;
      }
    `}

  ${({ $descriptionMaxLines }) =>
    !!$descriptionMaxLines &&
    css`
      .reqore-panel-title-description {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: ${$descriptionMaxLines};
        overflow: hidden;
        white-space: normal;
        overflow-wrap: anywhere;
      }
    `}

  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(getPanelHeaderColor(theme), opacity)};
  justify-content: space-between;

  /* The sides clear the panel's corner: a title (or a bottom action) starts at least the
     corner's radius in from the panel's edge, however small the size's own padding is. */
  padding: ${({
    noHorizontalPadding,
    size,
    padded,
    opacity,
    flat,
    intent,
    $cornerInset = 0,
  }: IStyledPanel) =>
    `${opacity === 0 && flat && !intent ? 0 : getPaddingSize(padded, size)}px ${
      noHorizontalPadding ? 0 : `${clearCorner(getPaddingSize(padded, size), $cornerInset)}px`
    }`};

  align-items: center;
  border-bottom: ${({ theme, isCollapsed, flat, opacity = 1 }) =>
    !isCollapsed && !flat && opacity
      ? `1px solid ${rgba(getPanelHairlineColor(theme), opacity)}`
      : null};
  transition: background-color 0.2s ease-out;
  overflow: hidden;
  flex: 0 0 auto;
  gap: ${GAP_FROM_SIZE.normal}px;

  ${StyledPanelTitleHeaderContent} .reqore-panel-title-icon {
    transform: scale(${INACTIVE_ICON_SCALE});
  }

  ${({ collapsible }) =>
    collapsible &&
    css`
      cursor: pointer;
      &:hover {
        ${StyledPanelTitleHeaderContent} .reqore-panel-title-icon {
          transform: scale(${ACTIVE_ICON_SCALE});
        }

        background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
          rgba(getPanelHeaderColor(theme, true), opacity)};
      }
    `}
`;

export const StyledPanelTopBar = styled(StyledPanelTitle)`
  padding-bottom: ${({ padded, size, isCollapsed, minimal }: IStyledPanel) =>
    !padded || isCollapsed || !minimal
      ? `${getPaddingSize(padded, size)}px`
      : minimal
        ? `${getPaddingSize(padded, size) / 2}px`
        : 0};
  padding-top: ${({ minimal, size, padded, wrapperPadding }: IStyledPanel) =>
    wrapperPadding === 'bottom' || wrapperPadding === 'none'
      ? undefined
      : minimal
        ? `${getPaddingSize(padded, size)}px`
        : undefined};
  /* Pinned only while the panel is clearly taller than its scroll area (\`$pins\`, measured in
     the component). The rest of the sticky treatment - the wrapper's visible overflow, the
     header rounding its own corners - follows \`stickyHeader\`, so a short panel looks exactly
     as it did and only stops pinning. */
  position: ${({ $pins }) => ($pins ? 'sticky' : 'relative')};
  /* \`top: 0\` must mean "flush with the visible top edge of whatever scrolls",
     which is what every call site assumes. Sticky resolves against the scroll
     container's CONTENT box, so on a padded scrollport — which every default
     panel/drawer/modal body is, since StyledPanelContent puts padding and
     overflow on one element — an uncompensated 0 parks the header below the
     padding and lets content scroll through the gap. \`stickyHeaderInset\` is
     that padding, measured from the real scroll ancestor at runtime;
     \`stickyHeaderOffset\` stays a deliberate caller offset on top of a now
     correct zero. */
  top: ${({ $pins, stickyHeaderOffset = 0, stickyHeaderInset = 0 }) =>
    $pins ? `${stickyHeaderOffset - stickyHeaderInset}px` : undefined};
  z-index: ${({ $pins }) => ($pins ? 2 : undefined)};
  // A sticky header forces the panel wrapper to overflow visible (so the
  // header can stick), which stops the wrapper from clipping the header's top
  // corners — so without this the panel reads as square-topped even at rest.
  // AT REST, round the header's own top corners to the panel's inner radius so
  // the panel keeps its radius (inset 1px past a visible border to match the
  // wrapper's inner curve; flat border-less panels need no inset). ONCE STUCK
  // (pinned to the scroll container, detected at runtime via isStuck), drop the
  // radius to 0 so the pinned header reads as a full-width bar and only loses
  // its corners while it is actually moving with the scroll.
  border-top-left-radius: ${({
    stickyHeader,
    rounded,
    radiusSize,
    flat,
    intent,
    accentPosition,
    isStuck,
    $mediaAbove,
    theme,
  }: IStyledPanel) =>
    stickyHeader && rounded
      ? isStuck || $mediaAbove
        ? '0px'
        : `${Math.max(
            0,
            resolvePanelRadius(theme, radiusSize) -
              (hasPanelBorder({ flat, intent, accentPosition }) ? 1 : 0)
          )}px`
      : undefined};
  border-top-right-radius: ${({
    stickyHeader,
    rounded,
    radiusSize,
    flat,
    intent,
    accentPosition,
    isStuck,
    $mediaAbove,
    theme,
  }: IStyledPanel) =>
    stickyHeader && rounded
      ? isStuck || $mediaAbove
        ? '0px'
        : `${Math.max(
            0,
            resolvePanelRadius(theme, radiusSize) -
              (hasPanelBorder({ flat, intent, accentPosition }) ? 1 : 0)
          )}px`
      : undefined};
  // A COLLAPSED panel is its title alone, so the title also meets the panel's bottom corners.
  // Squared there, its surface painted over the panel's rounded bottom edge (a sticky header
  // keeps the panel from clipping) and every collapsed card read as cut off along the bottom.
  border-bottom-left-radius: ${(props: IStyledPanel) => collapsedTitleRadius(props)};
  border-bottom-right-radius: ${(props: IStyledPanel) => collapsedTitleRadius(props)};
  background: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(getPanelHeaderColor(theme), opacity)};
  // When the header is sticky AND the panel is minimal / transparent (opacity === 0), the
  // header has no surface of its own — scrolling content slides straight under it and the
  // label / actions become illegible. Apply a backdrop blur so the underlying content stays
  // visible but is softened enough for the header text to read clearly. Idle (no overflow,
  // nothing behind) the blur is a no-op so the static appearance is unchanged.
  ${({ stickyHeader, opacity = 1 }: IStyledPanel) =>
    stickyHeader &&
    opacity === 0 &&
    css`
      backdrop-filter: blur(30px);
      -webkit-backdrop-filter: blur(30px);
    `}
`;

export const StyledPanelBottomActions = styled(StyledPanelTitle)`
  padding-top: ${({ padded, size, minimal }: IStyledPanel) =>
    !padded || !minimal
      ? `${getPaddingSize(padded, size)}px`
      : minimal
        ? getPaddingSize(padded, size) / 2
        : 0};
  padding-bottom: ${({ minimal, size, padded, wrapperPadding }: IStyledPanel) =>
    wrapperPadding === 'top' || wrapperPadding === 'none'
      ? undefined
      : minimal
        ? `${getPaddingSize(padded, size)}px`
        : undefined};
  border-bottom: 0;
  border-top: ${({ theme, flat, opacity = 1 }) =>
    !flat
      ? `1px solid ${rgba(getPanelHairlineColor(theme), opacity)}`
      : null};
  /* A bar of actions that do not fold (\`responsive: false\`): those that do not fit beside each other go to the next
     line, and a group wider than the bar wraps its own buttons (\`KEPT_BOTTOM_GROUP_STYLE\`); on a phone a dialog's
     kept actions ran off its edge on one line. A bar with a folding group stays one line: that group is as wide as
     the bar (\`fluid\`) and folds into its "⋯" to fit, so on a wrapping line it would take a line of its own. */
  ${({ $wrapKept, size }: IStyledPanel & { $wrapKept?: boolean }) =>
    $wrapKept
      ? css`
          flex-flow: row wrap;
          row-gap: ${PADDING_FROM_SIZE[size] / 2}px;
        `
      : undefined}
`;

export const StyledPanelContent = styled.div<IStyledPanel>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none !important' : undefined)};
  /* The sides take the same corner clearance as the title bar and the bottom actions, so the
     title, the content and the actions share one left edge. Unpadded content stays flush. */
  padding: ${({ padded, size, noHorizontalPadding, $cornerInset = 0 }) =>
    !padded
      ? undefined
      : noHorizontalPadding
        ? `${getPaddingSize(padded, size)}px 0`
        : `${getPaddingSize(padded, size)}px ${clearCorner(
            getPaddingSize(padded, size),
            $cornerInset
          )}px`};
  /* That side inset, said, for a child that bleeds to the panel's edges (a list whose bands and
     hairlines reach the sides): \`margin-inline: calc(-1 * var(--reqore-panel-inset-x))\`. It
     changes with the panel's size and its corner (13px for a small panel under a 14px radius), so
     a child that took back a fixed 16px ran 3px past both sides. 0 when the content is unpadded. */
  --reqore-panel-inset-x: ${({ padded, size, noHorizontalPadding, $cornerInset = 0 }) =>
    !padded || noHorizontalPadding
      ? '0px'
      : `${clearCorner(getPaddingSize(padded, size), $cornerInset)}px`};
  flex: 1;
  /* A flex child's min-height defaults to its content size, so without this the
     scrollable content can't shrink: a panel/drawer body taller than the panel
     pushes the (flex: 0 0 auto) bottom-actions footer past the panel's clipped
     edge and strands it, instead of scrolling. */
  min-height: 0;
  overflow: auto;
  overflow-wrap: anywhere;
  font-size: ${({ size, theme }) => getTextSize(theme, size)}px;
  /* Under a sticky header the body scrolls beneath it, and whatever in the body was positioned with a
     z-index as high as the header's (2) was drawn over it: a table's pinned columns are sticky at 2, and
     come later in the document. A stacking context of its own puts everything in the body in one layer
     under the header, whatever z-index it is given. It is not a containing block, so nothing in the body
     is placed differently; popovers and menus are drawn outside the panel and stay above it. */
  isolation: ${({ stickyHeader }) => (stickyHeader ? 'isolate' : undefined)};
`;

/** The media frame. Its outer corners take the panel's inner curve, so the media is clipped to
 *  the panel's shape even where the panel cannot clip it (a sticky header makes the panel
 *  overflow visible). */
export const StyledPanelMedia = styled.div<{
  $position: 'top' | 'bottom';
  $radius: number;
  $aspectRatio?: string | number;
}>`
  flex: 0 0 auto;
  position: relative;
  overflow: hidden;
  ${({ $position, $radius }) =>
    $position === 'top'
      ? css`
          border-top-left-radius: ${$radius}px;
          border-top-right-radius: ${$radius}px;
        `
      : css`
          border-bottom-left-radius: ${$radius}px;
          border-bottom-right-radius: ${$radius}px;
        `}

  > img,
  > video,
  > picture,
  > picture > img,
  > svg,
  > canvas,
  > iframe {
    display: block;
    width: 100%;
    max-width: 100%;
    border: 0;
  }

  > img,
  > video,
  > picture > img {
    height: auto;
  }

  ${({ $aspectRatio }) =>
    $aspectRatio !== undefined &&
    css`
      aspect-ratio: ${$aspectRatio};

      > img,
      > video,
      > picture,
      > picture > img,
      > svg,
      > canvas,
      > iframe {
        height: 100%;
        object-fit: cover;
      }
    `}
`;

export const StyledFloatingActions = styled.div<{
  theme: IReqoreTheme;
  size: TSizes;
  intent?: TReqoreIntent;
  flat?: boolean;
}>`
  position: fixed;
  z-index: 999999;
  display: flex;
  padding: ${({ size }) => PADDING_FROM_SIZE[size]}px;
  background-color: ${({ theme }) => rgba(getPanelBackgroundColor(theme), 1)};
  border: ${({ theme, flat, intent }) =>
    flat && !intent
      ? undefined
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  border-bottom: none;
  border-radius: ${({ radiusSize, size }) => resolveRadius(size, radiusSize)}px
    ${({ radiusSize, size }) => resolveRadius(size, radiusSize)}px 0 0;
  gap: ${({ size }) => GAP_FROM_SIZE[size]}px;
  pointer-events: auto;
`;

export const ReqorePanelSkeleton = memo(
  ({
    size,
    isCollapsed,
    children,
  }: Pick<IReqorePanelProps, 'size' | 'isCollapsed' | 'children'>) => {
    const style = useMemo(() => ({ padding: `${PADDING_FROM_SIZE[size]}px` }), [size]);

    return (
      <ReqoreControlGroup vertical fluid gapSize='big' style={style}>
        <ReqoreControlGroup spaceBetween fluid>
          <ReqoreControlGroup fixed gapSize='big'>
            <ReqoreSkeleton circle size={size} />
            <ReqoreSkeleton width='200px' size={size} />
          </ReqoreControlGroup>

          <ReqoreControlGroup fixed>
            <ReqoreSkeleton size={size} />
            <ReqoreSkeleton size={size} />
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        {!isCollapsed &&
          (children ? (
            children
          ) : (
            <ReqoreControlGroup vertical>
              <ReqoreSkeleton lines={5} width='100%' size='tiny' />
            </ReqoreControlGroup>
          ))}
      </ReqoreControlGroup>
    );
  }
);

export const ReqorePanel = forwardRef<HTMLDivElement, IReqorePanelProps>(
  (
    {
      children,
      label,
      description,
      collapseButtonProps = {},
      collapsible,
      onClose,
      closeButtonProps = {},
      rounded = true,
      actions = [],
      bottomActions = [],
      isCollapsed,
      customTheme,
      inheritCustomTheme,
      icon,
      iconImage,
      iconWithLabel = false,
      iconVerticalAlign = 'center',
      intent,
      className,
      flat,
      unMountContentOnCollapse = true,
      onCollapseChange,
      padded = true,
      wrapperPadding = 'both',
      contentStyle,
      contentEffect,
      labelEffect = {},
      descriptionEffect = {},
      descriptionIntent,
      labelSize,
      _dialogTitle,
      contentSize,
      minimal,
      badge,
      iconColor,
      iconProps = {},
      fluid,
      responsiveActions = true,
      responsiveTitle = true,
      wrapActionsBelowTitle = true,
      compactTitle = false,
      fitLabel = true,
      labelMaxLines = 2,
      descriptionPosition = 'inline',
      descriptionMaxLines = 2,
      descriptionMaxHeight,
      enclosingRadius,
      labelMinTextSize,
      size: panelSize = 'normal',
      getContentRef,
      labelProps = {},
      disabled,
      breadcrumbs,
      showActionsWhenCollapsed = true,
      showLabelTooltip,
      customLabelTooltip,
      resizable,
      onLabelEdit,
      responsiveActionsWrapperProps,
      loading,
      loadingIconType,
      skeleton,
      errorBoundaryOptions,
      floatingActions: floatingActionsProp,
      collapseTooltip = 'Hide',
      expandTooltip = 'Show',
      closeTooltip = 'Close',
      accentPosition,
      accentSize,
      media,
      mediaAlt = '',
      mediaPosition = 'top',
      mediaAspectRatio,
      mediaProps,
      ...rest
    }: IReqorePanelProps,
    ref
  ) => {
    // Resolved ONCE, here — the accent styles interpolate px and reserve padding,
    // so they must only ever see a number. Shared with ReqoreCallout.
    const accentSizePx = useMemo(() => resolveAccentSize(accentSize), [accentSize]);
    const [_isCollapsed, setIsCollapsed] = useState(isCollapsed || false);
    const primaryContentGradient = getPrimaryGradient(contentEffect?.gradient);
    const primaryContentColors: Record<number | string, unknown> | undefined =
      primaryContentGradient && typeof primaryContentGradient.colors === 'object'
        ? (primaryContentGradient.colors as Record<number | string, unknown>)
        : undefined;
    const firstContentGradientColor: TReqoreEffectColor | undefined = primaryContentColors
      ? (Object.values(primaryContentColors)[0] as TReqoreEffectColor)
      : undefined;
    const theme = useReqoreTheme(
      'main',
      customTheme ||
        (firstContentGradientColor && minimal ? { main: firstContentGradientColor } : undefined),
      undefined,
      undefined,
      inheritCustomTheme
    );

    useEffect(() => {
      return () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      };
    }, []);

    const isMobile = useReqoreProperty('isMobile');
    /* Floating actions are a hover's. Where the device cannot hover (a phone, a tablet), nothing
       would ever float them, so its hover actions stay in the panel's own bar, shown (see the
       hover gate on StyledPanel). */
    const isHoverCapable = useReqoreProperty('isHoverCapable');
    const floatingActions = !!floatingActionsProp && isHoverCapable !== false;
    const { setRef } = useCombinedRefs(ref);
    const [measureRef, { width }] = useMeasure();
    const [_isHovered, setIsHovered] = useState(false);
    const floatingActionsRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Runtime stuck-detection for the sticky header: a 0-height sentinel sits at
    // the very top of the panel, directly above the header. The header is
    // "stuck" once that sentinel has scrolled up to (or past) the sticky line of
    // its scroll container — at which point the header is pinned and sheds its
    // top radius. Positions are read with getBoundingClientRect on scroll
    // (rAF-throttled), NOT an IntersectionObserver: the observer's edge-of-root
    // behaviour falsely reported "stuck" for panels that sit flush at their
    // scroll container's top at rest. A document-level *capture* scroll listener
    // catches scrolling in ANY ancestor container (page or a nested overflow
    // box), so it works regardless of where the scroll lives; measuring the
    // sentinel (not the header) means the panel's OWN content scroll never
    // triggers it. Only wired when `stickyHeader` is on, so ordinary panels pay
    // nothing.
    const stickySentinelRef = useRef<HTMLDivElement>(null);
    const [isHeaderStuck, setIsHeaderStuck] = useState(false);
    const [stickyInset, setStickyInset] = useState(0);
    // Whether the panel is tall enough for its sticky header to pin (STICKY_HEADER_TALL_SCREENS).
    const [isTallEnoughToPin, setIsTallEnoughToPin] = useState(false);

    useEffect(() => {
      if (!rest.stickyHeader) {
        setIsHeaderStuck(false);
        setIsTallEnoughToPin(false);
        return undefined;
      }
      const sentinel = stickySentinelRef.current;
      if (!sentinel) return undefined;
      const offset = rest.stickyHeaderOffset ?? 0;
      const scrollParent = getScrollableAncestor(sentinel);
      let frame = 0;
      // Read once per layout change, not per scroll frame: `measure()` runs in a
      // rAF on every scroll and already forces a layout read.
      let inset = getScrollportInset(scrollParent);
      let tall = false;
      setStickyInset(inset.padding);
      const measureTall = () => {
        const panelHeight = panelRef.current?.getBoundingClientRect().height ?? 0;
        tall = panelHeight > getScrollportVisibleHeight(scrollParent) * STICKY_HEADER_TALL_SCREENS;
        setIsTallEnoughToPin(tall);
      };
      const measure = () => {
        frame = 0;
        const sentinelTop = sentinel.getBoundingClientRect().top;
        // Border box plus the border, which is the line the compensated header
        // pins to. Comparing against the bare border box flips `isHeaderStuck`
        // late by the scrollport's inset, so a pinned header keeps its top
        // radius through exactly the gap this fix closes.
        const rootTop = scrollParent ? scrollParent.getBoundingClientRect().top + inset.border : 0;
        // 1px deadzone so the exact at-rest position (sentinel flush against the
        // top) never reads as stuck. A header that does not pin is never stuck:
        // it scrolls away with its panel.
        setIsHeaderStuck(tall && sentinelTop < rootTop + offset - 1);
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      const onLayout = () => {
        inset = getScrollportInset(scrollParent);
        setStickyInset(inset.padding);
        measureTall();
        onScroll();
      };
      measureTall();
      measure();
      document.addEventListener('scroll', onScroll, { capture: true, passive: true });
      window.addEventListener('resize', onLayout, { passive: true });
      // Responsive padding changes the inset without a window resize or a
      // scroll, and the header would stay compensated by the old value. The panel
      // itself is watched too: rows arriving make a short panel tall.
      const observer =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onLayout) : undefined;
      if (scrollParent) observer?.observe(scrollParent);
      if (panelRef.current) observer?.observe(panelRef.current);
      return () => {
        document.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onLayout);
        observer?.disconnect();
        if (frame) cancelAnimationFrame(frame);
      };
    }, [rest.stickyHeader, rest.stickyHeaderOffset]);

    useUpdateEffect(() => {
      setIsCollapsed(!!isCollapsed);
    }, [isCollapsed]);

    const floatingActionsList: TReqorePanelActions = useMemo(
      () => (floatingActions ? actions.filter((action) => action.show === 'hover') : []),
      [floatingActions, actions]
    );

    const nonFloatingActions: TReqorePanelActions = useMemo(
      () => (floatingActions ? actions.filter((action) => action.show !== 'hover') : actions),
      [floatingActions, actions]
    );

    const updateFloatingActionsPosition = useCallback(() => {
      if (!floatingActionsRef.current || !panelRef.current) return;

      const panelRect = panelRef.current.getBoundingClientRect();

      // Temporarily hide the floating actions from hit-testing so they don't
      // block the elementFromPoint check on the panel
      floatingActionsRef.current.style.pointerEvents = 'none';
      const topRight = document.elementFromPoint(panelRect.right - 1, panelRect.top + 1);
      floatingActionsRef.current.style.pointerEvents = '';

      const isPanelTopVisible =
        topRight && (panelRef.current.contains(topRight) || topRight === panelRef.current);

      if (!isPanelTopVisible) {
        floatingActionsRef.current.style.display = 'none';
        return;
      }

      floatingActionsRef.current.style.display = 'flex';
      // measured once shown: hidden by an earlier call (the panel's top was covered), the actions measure
      // 0 x 0, and were placed with their left edge on the panel's right edge - past the screen's edge on
      // a narrow one
      const floatingRect = floatingActionsRef.current.getBoundingClientRect();
      floatingActionsRef.current.style.top = `${
        panelRect.top - floatingRect.height + (flat ? 0 : 1)
      }px`;
      floatingActionsRef.current.style.left = `${panelRect.right - floatingRect.width}px`;
    }, [flat]);

    const showsFloatingActions = _isHovered && !!floatingActions && size(floatingActionsList) > 0;

    // placed as they are shown, and again whenever the actions change
    useEffect(() => {
      if (showsFloatingActions) updateFloatingActionsPosition();
    }, [showsFloatingActions, floatingActionsList, updateFloatingActionsPosition]);

    /* ...and again whenever what they are placed by moves: the actions are fixed to the screen, placed
     * by the panel's corner and their own size, so nothing follows on its own. A page that scrolls, a
     * screen or window that resizes, a panel that grows or shrinks, and actions whose content changes
     * width (a label, an icon or a font that loads) each moved the panel's corner or the actions' size
     * without placing them again: they were left where the panel had been - mid-screen once the window
     * widened - or reached past the panel's edge once they widened. One placement per frame, however
     * many of these come in; none once they are hidden or the panel is gone. */
    useEffect(() => {
      if (!showsFloatingActions) return undefined;

      let frame = 0;
      const schedule = () => {
        if (!frame) {
          frame = requestAnimationFrame(() => {
            frame = 0;
            updateFloatingActionsPosition();
          });
        }
      };

      window.addEventListener('scroll', schedule, true);
      window.addEventListener('resize', schedule, { passive: true });
      const observer =
        typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : undefined;
      if (observer) {
        if (panelRef.current) observer.observe(panelRef.current);
        if (floatingActionsRef.current) observer.observe(floatingActionsRef.current);
      }

      return () => {
        window.removeEventListener('scroll', schedule, true);
        window.removeEventListener('resize', schedule);
        observer?.disconnect();
        if (frame) cancelAnimationFrame(frame);
      };
    }, [showsFloatingActions, updateFloatingActionsPosition]);

    /* The floating actions are a hover's: a finger's tap - and the `mouseenter` a browser emulates after it -
       shows none (see `createHoverGate`). Where a finger is the primary pointer (`isHoverCapable` false) the
       actions are in the panel's own bar instead (`floatingActions` is off, above), and on a touch laptop its
       tap left them floating until the next. */
    const hoverGate = useHoverGate();
    const handlePointerEnter = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        hoverGate.notePointer(e);
        rest.onPointerEnter?.(e);
      },
      [hoverGate, rest.onPointerEnter]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (floatingActions && hoverGate.isHover()) {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = setTimeout(() => setIsHovered(true), 150);
        }
        rest.onMouseEnter?.(e);
      },
      [floatingActions, rest.onMouseEnter, hoverGate]
    );

    const cancelHover = useCallback(() => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setIsHovered(false);
    }, []);

    /* The way from the panel to its floating actions.
     *
     * The actions float above the panel's top-right corner, so a pointer heading for
     * them from inside the panel leaves the panel through its top edge - usually to the
     * LEFT of the actions, on a diagonal - and passes over what lies above the panel
     * before it reaches them. Ending the hover the moment the pointer left the panel
     * hid the actions on that way, and the click meant for them landed on what they had
     * been covering (in reqraft's expression editor: the Visual / Text switch, so
     * "Remove" switched the view instead).
     *
     * So while the pointer is in the strip between the panel's top edge and the top of
     * the actions, across the panel's width, the hover stays; it ends when the pointer
     * leaves that strip for anything that is neither the panel nor the actions. Decided
     * by where the pointer IS, on each move - no timer to guess the time a person needs. */
    const corridorUntrackRef = useRef<(() => void) | null>(null);
    const stopCorridor = useCallback(() => {
      corridorUntrackRef.current?.();
      corridorUntrackRef.current = null;
    }, []);
    const inCorridor = useCallback((x: number, y: number): boolean => {
      if (!panelRef.current || !floatingActionsRef.current) return false;
      if (floatingActionsRef.current.style.display === 'none') return false;
      const panelRect = panelRef.current.getBoundingClientRect();
      const actionsRect = floatingActionsRef.current.getBoundingClientRect();
      return (
        x >= Math.min(panelRect.left, actionsRect.left) &&
        x <= Math.max(panelRect.right, actionsRect.right) &&
        y >= actionsRect.top &&
        y <= panelRect.top + 1
      );
    }, []);
    const followCorridor = useCallback(() => {
      stopCorridor();
      const onMove = (event: PointerEvent | MouseEvent) => {
        const target = event.target instanceof Node ? event.target : null;
        // reached the actions or came back into the panel: their own handlers take over
        if (
          target &&
          (floatingActionsRef.current?.contains(target) || panelRef.current?.contains(target))
        ) {
          stopCorridor();
          return;
        }
        if (!inCorridor(event.clientX, event.clientY)) {
          stopCorridor();
          cancelHover();
        }
      };
      document.addEventListener('mousemove', onMove, true);
      corridorUntrackRef.current = () => document.removeEventListener('mousemove', onMove, true);
    }, [cancelHover, inCorridor, stopCorridor]);
    // a corridor followed when the panel goes is followed no more
    useEffect(() => stopCorridor, [stopCorridor]);

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (floatingActions) {
          const relatedTarget = e.relatedTarget;

          if (
            floatingActionsRef.current &&
            relatedTarget instanceof Node &&
            floatingActionsRef.current.contains(relatedTarget)
          ) {
            return;
          }

          if (_isHovered && inCorridor(e.clientX, e.clientY)) {
            followCorridor();
          } else {
            cancelHover();
          }
        }
        rest.onMouseLeave?.(e);
      },
      [floatingActions, rest.onMouseLeave, cancelHover, _isHovered, inCorridor, followCorridor]
    );

    const handleFloatingActionsMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const relatedTarget = e.relatedTarget;

        if (
          panelRef.current &&
          relatedTarget instanceof Node &&
          panelRef.current.contains(relatedTarget)
        ) {
          return;
        }

        // back towards the panel through the strip between them
        if (inCorridor(e.clientX, e.clientY)) {
          followCorridor();
          return;
        }

        cancelHover();
      },
      [cancelHover, inCorridor, followCorridor]
    );

    /* The panel renders as re-resizable's `Resizable` when it is resizable — unless the caller
       gave its own element in `as`, which always wins. (`rest.as || cond ? Resizable : 'div'`
       binds as `(rest.as || cond) ? …`, so a panel given `as` used to render a `Resizable`.) */
    const isResizableElement = !rest.as && !!resizable && !disabled && !_isCollapsed;

    const _resizable: ResizableProps = useMemo(() => {
      // Only carry re-resizable's props when the panel actually renders as a
      // `Resizable` (the same condition the `as` below uses). Otherwise the
      // element is a plain `div`, and — now that these props are forwarded
      // through the panel — spreading `enable` / `defaultSize` / … onto a div
      // would emit invalid-DOM-attribute warnings. A non-resizable (or
      // collapsed / disabled) panel therefore carries no resizable props.
      return isResizableElement && resizable ? resizable : {};
    }, [resizable, isResizableElement]);

    // Return true if the card has a title bar, otherwise return false.
    const hasTitleBar: boolean = useMemo(
      () =>
        !!label ||
        !!breadcrumbs ||
        collapsible ||
        !!onClose ||
        !!size(nonFloatingActions.filter(isActionShown)) ||
        !!(isArray(badge) ? size(badge) : badge) ||
        !!icon,
      [label, collapsible, onClose, nonFloatingActions, badge, icon]
    );

    // Return true if the card has a title bar, otherwise return false.
    const hasTitleHeader: boolean = useMemo(
      () => !!label || !!badge || !!icon || !!breadcrumbs,
      [label, icon, badge, breadcrumbs]
    );

    /**
     * `width` comes from `useMeasure`, which reports 0 until the element is actually measured —
     * and in jsdom it stays 0 forever. `0 < 480` is true, so an unmeasured panel used to claim it
     * was narrow; the guard against that was `NODE_ENV !== 'test'`, added in 4eb8ac1 ("Test
     * fixes") back when the suite was jsdom-only.
     *
     * That proxy stopped holding when snapshots moved to a real browser under vitest: same
     * NODE_ENV, real widths, and the narrow layout switched off in the one place it needed to be
     * on. No snapshot has ever shown a stacked title bar, which is why the stack going three rows
     * deep on a drawer went unnoticed for so long (#664).
     *
     * Asking whether the width was MEASURED says what the guard always meant. jsdom keeps its 0
     * and stays wide, so the unit suite is unaffected; a browser measures and behaves.
     */
    /* The same rule, from the helper that carries it and its tests —
       `panelIsSmall` is `responsiveTitle && width > 0 && width < 480`, written
       once so the unit suite can reach it without mounting a panel. Both sides
       of this merge fixed the unmeasured-panel bug independently; keeping the
       expression in two places is how they would drift. */
    const isSmall = useMemo(() => panelIsSmall(width, responsiveTitle), [width, responsiveTitle]);
    /**
     * Narrow, from either trigger: the panel measuring under 480px, or the provider's
     * viewport-level `isMobile`.
     *
     * A narrow title bar STAYS ON ONE ROW. The label ellipsizes (it already carries `noWrap`) and
     * the responsive action group collapses into its overflow, which is what the "hidden when
     * small" actions exist for. It used to stack instead — title on one row, actions on another,
     * close/collapse on a third — and that cost more room than the title ever took: measured on a
     * drawer at 375px, a 93px header for a title using 204px of the width, with a 359px action
     * group holding a 106px button and 261px of nothing beside it.
     *
     * Stacking also broke the collapse it was supposed to help. Going to a column made the action
     * group `fluid`, the group got a full-width row, and with that much space its own measurement
     * decided fewer actions needed collapsing — so an action labelled "hidden when small" rendered
     * in full on a small panel.
     */
    const isNarrow = isSmall || isMobile;
    /**
     * The tightest fallback, still opt-in: drop the title TEXT and leave the icon in its place.
     * For a bar too narrow even to ellipsize into — a `[icon] [actions] [×]` header. Nothing
     * changes without an icon to fall back to, and the label survives as that icon's tooltip.
     */
    /**
     * The title gives up its space entirely and the icon stands in. Opt-in only: the automatic
     * end of the cascade is the ellipsis, and dropping the title is a decision the caller makes,
     * not something a width should take on their behalf. Needs an icon to fall back to.
     */
    const hideTitleForIcon = isNarrow && compactTitle;

    // If collapsible is true, toggle the isCollapsed state
    // If the isCollapsed state is true, the component is expanded
    // If the isCollapsed state is false, the component is collapsed
    const handleCollapseClick = useCallback(() => {
      // If collapsible is true, toggle the isCollapsed state
      if (collapsible) {
        setIsCollapsed(!_isCollapsed);
        onCollapseChange?.(!_isCollapsed);
      }
    }, [collapsible, _isCollapsed, onCollapseChange]);

    /* The bar folds the panel on a click on the bar itself, never on one of its actions nor on anything an action
       opened in a portal (`isPanelOwnClick`). */
    const handleTitleBarClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (isPanelOwnClick(event)) {
          handleCollapseClick();
        }
      },
      [handleCollapseClick]
    );

    /* A clickable panel (a card) is clicked by a click on itself, never by one on its actions, a nested panel's
       included, nor on anything opened from it in a portal (`isPanelOwnClick`). */
    const { onClick: panelOnClick } = rest;
    const handlePanelClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (isPanelOwnClick(event)) {
          panelOnClick?.(event);
        }
      },
      [panelOnClick]
    );

    const leftBottomActions: IReqorePanelBottomAction[] = useMemo(
      () => bottomActions.filter(({ position }) => position === 'left' || !position),
      [bottomActions]
    );

    const rightBottomActions: IReqorePanelBottomAction[] = useMemo(
      () => bottomActions.filter(({ position }) => position === 'right'),
      [bottomActions]
    );

    /**
     * The page's order, whichever of its actions may fold. A bar draws the folding actions
     * in one group and the ones that keep their words (`responsive: false`) in another, and the kept
     * group came after the folding one in the title bar, so a kept action the page lists first ("Start
     * review", then "Show summary") was drawn second. The kept ones the page lists before its first
     * folding action are a group of their own, drawn before the folding group; the rest are drawn
     * after it, the title bar's collapse and close controls last. (A kept action between two folding
     * ones is drawn after them: a bar keeps its one "⋯".) Without `responsiveActions` every action
     * keeps its words, in one group, in order.
     */
    const splitAtFirstFolding = useCallback(
      <T extends IReqorePanelAction>(list: T[]): [T[], T[]] => {
        const first = responsiveActions
          ? list.findIndex((action) => action.show !== false && action.responsive !== false)
          : -1;

        return first > 0 ? [list.slice(0, first), list.slice(first)] : [[], list];
      },
      [responsiveActions]
    );
    const [leadingTitleActions, trailingTitleActions] = useMemo(
      () => splitAtFirstFolding(nonFloatingActions),
      [splitAtFirstFolding, nonFloatingActions]
    );
    const [leadingLeftBottomActions, trailingLeftBottomActions] = useMemo(
      () => splitAtFirstFolding(leftBottomActions),
      [splitAtFirstFolding, leftBottomActions]
    );
    const [leadingRightBottomActions, trailingRightBottomActions] = useMemo(
      () => splitAtFirstFolding(rightBottomActions),
      [splitAtFirstFolding, rightBottomActions]
    );

    /**
     * The actions go under the title where the two do not fit (`wrapActionsBelowTitle`), except a lone
     * destructive one: it stays at the end of the title's line, at its own size, as a row keeps a lone
     * Delete at the end of its label's line on a phone.
     */
    const wrapActions = useMemo(() => {
      if (!wrapActionsBelowTitle || !hasTitleHeader) {
        return false;
      }

      const shown = nonFloatingActions.filter((action) => action.show !== false);

      /* Nothing to put under the title, nothing to wrap: an empty actions box went to a row of its own under
         a title of two lines, and the panel grew 5px for it (a dashboard card on a phone). */
      if (!shown.length && !onClose && !collapsible) {
        return false;
      }

      return !(
        shown.length === 1 && (shown[0].destructive === true || shown[0].intent === 'danger')
      );
    }, [wrapActionsBelowTitle, hasTitleHeader, nonFloatingActions, onClose, collapsible]);

    /** Every action on the title's line is drawn as its icon (the close and collapse controls are). */
    const titleActionsDrawNoWords = useMemo(
      () => nonFloatingActions.every((action) => actionDrawsNoWords(action, isNarrow)),
      [nonFloatingActions, isNarrow]
    );

    // Calculates whether or not the bottom actions should be displayed.
    const hasBottomActions: boolean = useMemo(
      () =>
        !!(
          size(leftBottomActions.filter(isActionShown)) ||
          size(rightBottomActions.filter(isActionShown))
        ),
      [leftBottomActions, rightBottomActions]
    );

    const renderResponsiveActions = useCallback(
      (align: 'flex-start' | 'center' | 'flex-end' = 'flex-end') =>
        (action: IReqorePanelAction, index: number) => {
          return renderActions(action, index, true, align);
        },
      // `isNarrow` belongs here even though this callback does not name it: it wraps
      // `renderActions`, which does. Without it the wrapper keeps whichever `renderActions`
      // existed on the first render — when `useMeasure` still reported 0 and the bar did not
      // yet know it was narrow — so a width-dependent decision inside it could never take
      // effect. That is what silently defeated dropping the action labels: the flag flipped and
      // the closure did not. (`renderActions` itself cannot go here: it is declared below.)
      [isNarrow, actions, showActionsWhenCollapsed, _isCollapsed]
    );

    const hasNonResponsiveActions = useCallback(
      // `show: false` has to be honoured on BOTH paths. The `responsiveActions: false` arm used
      // to ask only whether the array had entries, so a panel whose every action is hidden still
      // reported having some and rendered an empty control group. It went unnoticed while the
      // prop defaulted to `true` and that arm was mostly dead.
      (data: TReqorePanelActions) =>
        data.some(
          (action) =>
            (!responsiveActions || action.responsive === false) && action.show !== false
        ),
      [actions, bottomActions, responsiveActions, showActionsWhenCollapsed, _isCollapsed]
    );

    const hasResponsiveActions = useCallback(
      (data: TReqorePanelActions) =>
        responsiveActions &&
        data.some((action) => action.responsive !== false && action.show !== false),
      [actions, bottomActions, responsiveActions, showActionsWhenCollapsed, _isCollapsed]
    );
    /** The bottom bar wraps its actions only where none of them folds (`StyledPanelBottomActions`). */
    const wrapKeptBottomActions = useMemo(
      () => !hasResponsiveActions(leftBottomActions) && !hasResponsiveActions(rightBottomActions),
      [hasResponsiveActions, leftBottomActions, rightBottomActions]
    );

    const renderNonResponsiveActions = useCallback(
      (align: 'flex-start' | 'center' | 'flex-end' = 'flex-end') =>
        (action: IReqorePanelAction, index: number) => {
          return renderActions(action, index, false, align);
        },
      [
        isNarrow,
        actions,
        bottomActions,
        responsiveActions,
        showActionsWhenCollapsed,
        _isCollapsed,
      ]
    );

    const renderActions = useCallback(
      (
        action: IReqorePanelAction,
        index: number,
        includeResponsive: boolean,
        align: 'flex-start' | 'center' | 'flex-end' = 'flex-end',
        /* A group's child: the group has been put in its bar already, so the child is drawn
           whatever its own \`responsive\` says, which then only decides whether its label folds.
           A child with \`responsive: false\` (a split button's words) was filtered out as though
           it belonged to the other bar, and only the caret was drawn. */
        inGroup = false
      ) => {
        if (
          action.show === false ||
          (showActionsWhenCollapsed === false && _isCollapsed === true) ||
          (!inGroup && includeResponsive && action.responsive === false) ||
          (!inGroup &&
            !includeResponsive &&
            responsiveActions &&
            (action.responsive === true || !('responsive' in action)))
        ) {
          return null;
        }

        const {
          id,
          actions,
          actionsProps,
          label,
          intent,
          as: CustomElement,
          props = {},
          group,
          show,
          // read where the actions are laid out; never the DOM's
          destructive: _destructive,
          iconOnly,
          ...rest
        }: IReqorePanelAction = action;
        const actionLabelText = typeof label === 'number' ? String(label) : label;
        // the icon says it: drawn alone, its label its tooltip and its accessible name
        const iconSaysIt = !!iconOnly && !!rest.icon && !!label;

        let { className }: IReqorePanelAction = action;

        // If the show prop is 'hover', add the hidden class to the action
        className = classNames(className, show === 'hover' ? 'reqore-panel-action-hidden' : '');

        if (size(group)) {
          return (
            <ReqoreControlGroup
              intent={intent}
              stack
              customTheme={rest.customTheme || theme}
              size={rest.size}
              fixed={rest.fixed}
              fluid={rest.fluid}
              key={index}
              className={className}
              horizontalAlign={align}
            >
              {group.map((child, index) => renderActions(child, index, true, undefined, true))}
            </ReqoreControlGroup>
          );
        }

        if (size(actions)) {
          return (
            <ReqoreDropdown
              fixed
              {...rest}
              {...(iconSaysIt ?
                {
                  tooltip: rest.tooltip || actionLabelText,
                  'aria-label': rest['aria-label'] || actionLabelText,
                }
              : {})}
              key={index}
              label={iconSaysIt ? undefined : label}
              intent={intent}
              className={className}
              customTheme={rest.customTheme || theme}
              id={id}
              {...actionsProps}
              items={actions.filter(isActionShown)}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
            />
          );
        }

        if (CustomElement) {
          return (
            <CustomElement
              fixed
              {...props}
              className={classNames(className, props.className)}
              key={props.key || index}
              customTheme={props.customTheme || theme}
              onClick={
                props.onClick
                  ? (e: React.MouseEvent<any>) => {
                      e.stopPropagation();
                      props?.onClick?.(e);
                    }
                  : undefined
              }
            />
          );
        }

        // FIRST thing to go when the bar is short of room: the action's LABEL, not the
        // panel's title. An action is a verb the icon already carries, and the label moves
        // to the tooltip rather than being lost; the title is the only thing naming what
        // this panel IS. Needs an icon to fall back to — an unlabelled, iconless button is
        // a blank box — and a caller can pin the label with `responsive: false`.
        // `label` on an action is typed `string | number`; a tooltip is not, so the numeric
        // case is stringified rather than cast away.
        //
        // `responsive: false` has to be read HERE, not only by the group that renders the
        // action: it used to decide which control group an action was rendered in and
        // nothing else, so a pinned label was dropped anyway and the escape hatch this
        // comment promises did not exist. It is what the confirmation dialog stands on —
        // two unlabelled squares, a tick and a cross, name neither the action nor the
        // one that throws the work away.
        //
        // An action whose icon is enough (`iconOnly`) is drawn as its icon at every width. Either way a
        // dropped label is still the button's accessible name, not only its tooltip.
        const actionLabelTooltip = actionLabelText;
        // the rule a title reads to keep icons beside it (`actionDrawsNoWords`), so the two cannot drift
        const dropActionLabel = !!label && actionDrawsNoWords(action, isNarrow);

        return (
          <ReqoreButton
            fixed
            {...rest}
            id={id}
            key={index}
            className={className}
            customTheme={rest.customTheme || theme}
            intent={intent}
            aria-label={
              dropActionLabel ? rest['aria-label'] || actionLabelTooltip : rest['aria-label']
            }
            tooltip={dropActionLabel ? rest.tooltip || actionLabelTooltip : rest.tooltip}
            onClick={
              rest.onClick
                ? (e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    rest.onClick?.();
                  }
                : undefined
            }
          >
            {dropActionLabel ? undefined : label}
          </ReqoreButton>
        );
      },
      [actions, theme, showActionsWhenCollapsed, _isCollapsed, isNarrow]
    );

    const interactive: boolean = !!(
      rest.onClick ||
      rest.onMouseOver ||
      rest.onMouseEnter ||
      rest.onDoubleClick ||
      rest.onContextMenu
    );

    const transformedContentEffect: IReqoreEffect = useMemo(() => {
      const newContentEffect: IReqoreEffect = { ...contentEffect };

      if (newContentEffect.gradient && intent) {
        newContentEffect.gradient = patchPrimaryGradient(newContentEffect.gradient, {
          borderColor: theme.intents[intent] as TReqoreEffectColor,
        });
      }

      newContentEffect.interactive = interactive;

      return newContentEffect;
    }, [intent, theme, contentEffect, interactive]);

    const opacity = rest.transparent ? 0 : rest.opacity;
    const noHorizontalPadding = opacity === 0 && flat && !intent && !rest.raised;

    // The media frame's outer corners follow the panel's INNER curve: its radius, less the 1px
    // border when it draws one — the same inset the sticky header and the accent strip take.
    const mediaRadius = rounded
      ? Math.max(
          0,
          resolvePanelRadius(theme, rest.radiusSize) -
            (hasPanelBorder({ flat, intent, accentPosition }) ? 1 : 0)
        )
      : 0;
    // The title bar, the padded content and the bottom actions start clear of that same inner
    // curve — one left edge for all three — and of the
    // corner of a container the panel sits flush in (`enclosingRadius`), less the panel's own
    // border. A panel with no surface and no edge (`noHorizontalPadding`) draws no corner, and
    // keeps its bars flush.
    const cornerInset = noHorizontalPadding
      ? 0
      : Math.max(
          mediaRadius,
          clearCorner(
            0,
            enclosingRadius ?? 0,
            hasPanelBorder({ flat, intent, accentPosition }) ? 1 : 0
          )
        );
    const hasMedia = media !== undefined && media !== null && media !== false && media !== '';

    const mediaNode = useMemo(
      () =>
        hasMedia ? (
          <StyledPanelMedia
            {...mediaProps}
            className={classNames(
              mediaProps?.className,
              'reqore-panel-media',
              `reqore-panel-media-${mediaPosition}`
            )}
            $position={mediaPosition}
            $radius={mediaRadius}
            $aspectRatio={mediaAspectRatio}
          >
            {typeof media === 'string' ? (
              <img
                src={media}
                alt={mediaAlt}
                decoding='async'
                className='reqore-panel-media-image'
              />
            ) : (
              media
            )}
          </StyledPanelMedia>
        ) : null,
      [hasMedia, media, mediaAlt, mediaPosition, mediaAspectRatio, mediaProps, mediaRadius]
    );

    const showNonResponsiveGroup = useCallback((): boolean => {
      let show: boolean = false;

      // SHOULD THIS GROUP SHOW CONTROL BUTTONS?
      // Always, now that a narrow bar stays on one row: there is no separate control row for them
      // to move to. This used to read `!isSmall`, which withheld them here because a small panel
      // rendered its own row below — and that row is what the one-row treatment removed.
      if (onClose || collapsible) {
        show = true;
      }

      // OTHERWISE, ARE THERE ANY NON RESPONSIVE ACTIONS TO BE SHOWN?
      // This either means actions where user specified responsive: false
      // or user passed responsiveActions: false
      if (hasNonResponsiveActions(trailingTitleActions)) {
        show = true;
      }

      return show;
    }, [collapsible, onClose, trailingTitleActions, hasNonResponsiveActions]);

    /**
     * The title's natural size in px, from the heading level it renders at — the same
     * `labelSize || HEADER_SIZE_TO_NUMBER[panelSize]` the icon is sized from.
     */
    // A dialog's own title takes the theme's dialog size where it names one (and no caller pinned
    // a level); every other title, its heading level's px.
    const dialogTitlePx =
      _dialogTitle && !labelSize ? theme.typeScale?.dialogHeading : undefined;
    const labelNaturalPx =
      dialogTitlePx ??
      getHeadingSize(theme, labelSize || HEADER_SIZE_TO_NUMBER[panelSize]) ??
      getHeadingSize(theme, 3)!;
    /**
     * SECOND thing to give: the title's size. Once the actions are down to icons and the
     * row is still short, the title shrinks toward a floor rather than dropping characters
     * — the end of a name is often the part that distinguishes it. Only at the floor does
     * the existing `noWrap` ellipsis take over.
     *
     * Off when the caller pins `labelEffect.textSize`: they have said what size they want.
     */
    /**
     * The width the layout left for the title, observed on the box that claims the leftover
     * space. Kept as state rather than read during render so the fit is calculated from a width
     * that has actually been laid out.
     */
    /** Whole lines, at least one — a fractional or zero `labelMaxLines` is a caller slip, not
     *  a request for half a line of text. */
    const clampLines = Math.max(1, Math.floor(labelMaxLines) || 1);
    /** `compactTitle` drops the description with the title it belongs to, so a bar that has
     *  given up its title never grows a row to carry one. */
    const descriptionBelow =
      descriptionPosition === 'below' && !!description && !(hideTitleForIcon && !!icon);
    const descriptionClamp = Math.max(0, Math.floor(descriptionMaxLines || 0));

    /**
     * A clamped description opens on click so the whole of it can be read — on a phone there is
     * no hover to reveal it with, and two lines of a long sentence are an invitation to tap.
     *
     * Interactive only while it is actually cut, or already open: a description that fits is
     * left alone, so a click on it still reaches the bar and collapses a collapsible panel the
     * way it always has. When it IS cut, that same click must not reach the bar — opening the
     * text and folding the panel away in one gesture is the worst of both.
     */
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
    const descriptionRef = useRef<HTMLSpanElement>(null);
    const descriptionIsClamped = descriptionClamp > 0 && !isDescriptionExpanded;

    useLayoutEffect(() => {
      const el = descriptionRef.current;

      // `scrollHeight` is what the text wants, `clientHeight` what the clamp left it. Re-read
      // whenever the bar's width moves, because that is what changes how many lines it takes.
      setIsDescriptionTruncated(descriptionIsClamped && !!el && el.scrollHeight > el.clientHeight + 1);
    }, [description, descriptionIsClamped, width]);

    const descriptionIsInteractive = isDescriptionTruncated || isDescriptionExpanded;

    const handleDescriptionClick = useCallback(
      (event: React.MouseEvent | React.KeyboardEvent) => {
        if (!descriptionIsInteractive) {
          return;
        }

        event.stopPropagation();
        setIsDescriptionExpanded((expanded) => !expanded);
      },
      [descriptionIsInteractive]
    );

    /** Shared by both places the description can render — inline with the title, or on its
     *  own row below — so the two cannot drift apart. */
    const descriptionProps = {
      ref: descriptionRef,
      className: 'reqore-panel-title-description',
      size: panelSize,
      effect: { ...getSecondaryTextEffect(theme, 0.7), ...descriptionEffect },
      intent: descriptionIntent,
      onClick: handleDescriptionClick,
      ...(descriptionIsInteractive
        ? {
            role: 'button' as const,
            tabIndex: 0,
            'aria-expanded': isDescriptionExpanded,
            onKeyDown: (event: React.KeyboardEvent) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleDescriptionClick(event);
              }
            },
            style: { cursor: 'pointer' },
          }
        : {}),
    };
    const [labelAvailable, setLabelAvailable] = useState<number | undefined>(undefined);
    /**
     * The rooms the title has been measured to have since the last thing that can change it, and the
     * one it settled on if they went round in a circle.
     *
     * The room is measured off the box the title sits in, and where a host sizes that box by what it
     * holds the measurement answers the fit it was asked for: a two-line title gets no slack, so a
     * box rounded to whole px read a pixel short, the title shrank a pixel, the header was left with
     * room, the title grew back into it, and round again - "Address" in a drawer measured 56, 52,
     * 80, 56... for ever. A measurement that comes back to a room it has already given, for a
     * title, badges, bar and size that have not changed, is going in circles; the title takes the most
     * room it was given and keeps it until one of those changes.
     */
    const labelRoomsSeen = useRef<{ key: string; rooms: number[]; settled?: number }>({
      key: '',
      rooms: [],
    });
    /**
     * The title keeps one line, drawn a little smaller, so that actions drawn as icons stay beside it
     * (`ICON_ACTIONS_TITLE_SHRINK`): where it may take two lines it would otherwise wrap beside them, and a
     * second line of title costs the panel what a row of icons under it does. Set where the title claims its
     * line (the effect that measures its name).
     */
    const [titleShrinksForIcons, setTitleShrinksForIcons] = useState(false);
    /** What the title claims on its line where the actions may go under it (see the effect that sets it). */
    const [titleBasis, setTitleBasis] = useState<number | undefined>(undefined);
    const [labelFitRef, labelFitPx] = useFitTextSize<HTMLDivElement>({
      text: typeof label === 'string' ? label : '',
      available: labelAvailable,
      max: labelNaturalPx,
      min: labelMinTextSize,
      lines: titleShrinksForIcons ? 1 : clampLines,
      /* Kept to one line for icons, a title that may wrap needs a pixel spare: with the one-line slack a size judged
         to fit by a pixel was drawn on two lines ("Problem / wizard", a dashboard tile on a phone). */
      slack: titleShrinksForIcons && clampLines > 1 ? TITLE_KEPT_ON_ONE_LINE_SLACK : undefined,
      enabled: fitLabel !== false && typeof label === 'string' && !labelEffect?.textSize,
    });
    const badgeKey = badgeSignature(badge);
    const fitsLabel = fitLabel !== false && !labelEffect?.textSize;

    /**
     * The line a title took for its own once its badges went under it, and kept.
     *
     * A title shrinks because it does not fit beside its badges; shrunk, it takes its line whole and
     * its badges go under it (`$ownLine`). On that line it may fit at its natural size again, and if
     * that was what put its badges back beside it, they came back, it no longer fitted, it shrank,
     * they went under it: the title and its badges swapped lines on every render, forever. A title
     * whose box is sized by what it holds (a title bar laid out as a column, as some apps' pages do on
     * a phone) did it at "Notifications" beside "this browser", and under React's `act` a story's
     * page never came back.
     *
     * So the line is kept: by this title with these badges at this size, until the bar is wider than
     * it was when the line was taken - more room is the one thing that can let the badges back.
     */
    const [ownLine, setOwnLine] = useState<{ key: string; width: number } | undefined>(undefined);
    const ownLineKey = [typeof label === 'string' ? label : '', badgeKey, labelNaturalPx, clampLines].join(
      '\u0000'
    );
    const titleShrunk = fitsLabel && labelFitPx < labelNaturalPx;
    const keepsOwnLine = !!ownLine && ownLine.key === ownLineKey && (width || 0) <= ownLine.width;
    const titleOwnsLine = titleShrunk || (fitsLabel && keepsOwnLine);

    useLayoutEffect(() => {
      if (titleShrunk && !keepsOwnLine) {
        setOwnLine({ key: ownLineKey, width: width || 0 });
      }
    }, [titleShrunk, keepsOwnLine, ownLineKey, width]);

    /** Only while the title is actually below its natural size, and never over a caller who
     *  pinned the description's own size. */
    const descriptionFontPx =
      fitLabel && !descriptionEffect?.textSize && labelFitPx < labelNaturalPx
        ? Math.max(
            FIT_TEXT_FLOOR_PX,
            Math.round(
              (getTextSize(theme, panelSize) ?? getTextSize(theme, 'normal')) *
                (labelFitPx / labelNaturalPx)
            )
          )
        : 0;

    /**
     * How much room the title has, computed rather than measured off its own box.
     *
     * The box the title sits in is sized by its content, so measuring THAT is circular — the
     * font shrinks, the box shrinks, and the size ratchets to the floor. Measuring the space it
     * COULD have is not: take the bar, subtract everything competing with the title, and what
     * is left does not move when the title's font does.
     *
     * Everything competing with it is text-independent: the action groups and control buttons
     * (the bar's other children), and the icon and badge that share the title's row. The action
     * group is `fluid` by default and would otherwise swallow the leftover, which is why this
     * cannot be solved by giving the title column `flex-grow` — it competes with a group that
     * is designed to take the rest, and loses.
     *
     * Re-run on `width`, which is the bar's own measured width: when the bar resizes, so does
     * everything in it.
     */
    /**
     * The title's available width is its CONTAINING BLOCK minus whatever shares it — measured,
     * not reconstructed.
     *
     * This used to subtract the action group, the gaps and the icon from the bar's width. That
     * arithmetic held only for the one layout it was written against: give the panel a
     * `description` and the icon moves into an outer grid, so the sum over-reported by 30-80px
     * and the fit under-shrank. The symptom was the worst of both worlds — a title both smaller
     * AND ellipsized, which is the one outcome the feature exists to avoid.
     *
     * Measuring the parent is safe precisely where it looks circular. While the text overflows
     * — the only regime in which anything shrinks — the parent is pinned by the row, not by the
     * text: at a 300px bar it measures 128px at 19px, at 16px, and wrapped to two lines. When
     * the text does fit, the parent has slack and the fit returns the natural size, which is
     * the right answer either way.
     */
    useLayoutEffect(() => {
      const node = labelFitRef.current;
      const parent = node?.parentElement;

      if (!fitLabel || !node || !parent) {
        return;
      }

      const style = getComputedStyle(parent);
      const padding =
        (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const gap = parseFloat(style.columnGap) || parseFloat(style.gap) || 0;
      /* A badge beside the title takes real width from it. A badge on the line under it takes
         none: the badges move there before the title gives anything, so the title then has the
         whole line. Which line a badge is on is read from the layout, after the line has taken
         its items at their full width, and the title's natural size decides it: a title shrinks
         only once its badges are below it, and then keeps them there (`$ownLine`). */
      const nodeBox = node.getBoundingClientRect();
      const besideTitle = Array.from(parent.children).filter(
        (child) => child !== node && child.getBoundingClientRect().top < nodeBox.bottom - 1
      );
      // By the room each takes on the line: a text badge is pulled back by its padding.
      const siblings = besideTitle.reduce((total, child) => {
        const { marginLeft, marginRight } = getComputedStyle(child);

        return (
          total +
          child.getBoundingClientRect().width +
          (parseFloat(marginLeft) || 0) +
          (parseFloat(marginRight) || 0)
        );
      }, 0);
      const gaps = gap * besideTitle.length;
      /* What the title could still gain, which the box measured above does not show: the box is
         only as wide as the title at its present size, so a title shrunk on a narrow bar measured
         that small box when the bar widened again, and stayed shrunk however wide the bar
         became. The room is the title box's own beyond what it holds (it grows; what it holds
         does not), and on a narrow bar the actions group's beyond its least (it gives way to the
         title, down to what its controls cannot do without). Neither moves when the title's font
         does: the sum is the title's whole claim on the bar. */
      const header = node.closest<HTMLElement>('.reqore-panel-title-header');
      /* Where the actions may go under the title (`wrapActionsBelowTitle`), the title's text column
         fills the header, so the room the header has is in that column, past the title's line: up to
         the header's own edge. Read as the header's children's slack, the title's room was its own
         width rounded down, and a short title that fitted ("slack", 50.4px in 50) shrank a step. */
      const headerRoom = !header
        ? 0
        : wrapActions
          ? header.getBoundingClientRect().right -
            (parseFloat(getComputedStyle(header).paddingRight) || 0) -
            parent.getBoundingClientRect().right
          : header.clientWidth -
            Array.from(header.children).reduce(
              (total, child) => total + child.getBoundingClientRect().width,
              0
            );
      const narrowActions = isNarrow
        ? node
            .closest('.reqore-panel-title')
            ?.querySelector<HTMLElement>(`:scope > .${NON_RESPONSIVE_ACTIONS_CLASS}`)
        : undefined;
      const actionsRoom = narrowActions ? getWidthAboveMinimum(narrowActions) : 0;
      const next = Math.max(
        0,
        Math.round(
          parent.clientWidth - padding - siblings - gaps + Math.max(0, headerRoom) + actionsRoom
        )
      );
      const roomKey = [
        typeof label === 'string' ? label : '',
        badgeKey,
        // what the actions say: an action whose words change takes room and gives it back
        badgeSignature(actions),
        width,
        panelSize,
        typeof description === 'string' ? description : !!description,
        clampLines,
        isNarrow,
        wrapActions,
        // the title's claim: a claim made smaller for icons beside it narrows the title's line
        titleBasis,
      ].join('\u0000');

      if (labelRoomsSeen.current.key !== roomKey) {
        labelRoomsSeen.current = { key: roomKey, rooms: [] };
      }

      const seen = labelRoomsSeen.current;

      if (seen.settled === undefined) {
        const last = seen.rooms[seen.rooms.length - 1];

        if (seen.rooms.length && next !== last && seen.rooms.includes(next)) {
          seen.settled = Math.max(next, ...seen.rooms);
        } else {
          seen.rooms = [...seen.rooms.slice(-7), next];
        }
      }

      const room = seen.settled ?? next;

      setLabelAvailable((current) => (current === room ? current : room));
    }, [
      fitLabel,
      label,
      width,
      badgeKey,
      actions,
      panelSize,
      description,
      clampLines,
      isNarrow,
      wrapActions,
      titleBasis,
    ]);

    /**
     * Where the actions may go under the title (`wrapActionsBelowTitle`), what the title claims on its
     * line: its name alone, one line at its natural size, with the icon before it. Its badges are not
     * part of the claim: where the name and the actions fit on a line and the badges do not, the badges
     * go under the name (what is beside the title gives way before the title wraps) and the actions
     * stay beside it; the actions go under only where the name itself and they do not fit. A title's
     * content basis held its badges beside it, so the actions went under first, a line taller for
     * nothing (a template drawer on a phone).
     *
     * Measured at the natural size, by canvas as the fit measures: never from where the actions are,
     * so nothing it decides can change it. A title drawn by the caller (an element) has no text to
     * measure, and keeps its content basis.
     */

    useLayoutEffect(() => {
      const node = labelFitRef.current;
      const header = node?.closest<HTMLElement>('.reqore-panel-title-header');
      let next: number | undefined;
      let shrinksForIcons = false;

      if (wrapActions && node && header && typeof label === 'string' && label.trim()) {
        // the font the name is drawn in: a `labelEffect` family or spacing is the span's, not the heading's
        const style = getComputedStyle(textPaintingElement(node));
        const px = labelEffect?.textSize ? parseFloat(style.fontSize) : labelNaturalPx;
        titleMeasureCanvas = titleMeasureCanvas || document.createElement('canvas');
        const context = titleMeasureCanvas.getContext('2d');

        if (context && px) {
          context.font = `${style.fontStyle} ${style.fontWeight} ${px}px ${style.fontFamily}`;
          const letterSpacing = parseFloat(style.letterSpacing) || 0;
          const measure = (text: string) =>
            context.measureText(text).width + letterSpacing * text.length;
          const name = measure(label);
          const before = node.getBoundingClientRect().left - header.getBoundingClientRect().left;

          next = Math.ceil(before + name) + 1;

          /* The actions go under only where that saves the title something: a line, or a shrink or a cut.
             A title that needs two lines with the whole line to itself needs two beside the actions too
             (when they leave it room for that), and under it they only cost the panel a line (an
             experiment drawer and a funnel widget on a phone, 43px and 37px). So the lines its
             words take at their natural size are counted both ways, as the fit packs them, and where
             beside costs no more the title claims only the room the actions leave, and the bar keeps one
             line. Read from the actions as they are: actions that fold only ever leave more room, so what
             this decides keeps (a group the caller makes fluid, a search, keeps its own share). */
          const bar = header.parentElement;
          const actionsBox = bar?.querySelector<HTMLElement>(`:scope > .${TITLE_ACTIONS_CLASS}`);

          if (bar && actionsBox && actionsBox.style.flexBasis !== '50%') {
            const barStyle = getComputedStyle(bar);
            const barInner =
              bar.clientWidth -
              (parseFloat(barStyle.paddingLeft) || 0) -
              (parseFloat(barStyle.paddingRight) || 0);
            const barGap = parseFloat(barStyle.columnGap) || 0;
            const boxGap = parseFloat(getComputedStyle(actionsBox).columnGap) || 0;
            const boxChildren = (Array.from(actionsBox.children) as HTMLElement[]).filter(
              (child) => child.getBoundingClientRect().width > 0
            );
            /* What each group's controls span, not the group: a group of kept actions stretches across
               the line it is on under the title, and its own width there is the line's. */
            const spanOf = (group: HTMLElement) => {
              const controls = (Array.from(group.children) as HTMLElement[])
                .map((child) => child.getBoundingClientRect())
                .filter((box) => box.width > 0);

              return controls.length
                ? Math.max(...controls.map((box) => box.right)) -
                    Math.min(...controls.map((box) => box.left))
                : group.getBoundingClientRect().width;
            };
            const actionsWidth =
              boxChildren.reduce((sum, child) => sum + spanOf(child), 0) +
              boxGap * Math.max(0, boxChildren.length - 1);
            const words = label.trim().split(/\s+/).map(measure);
            const space = measure(' ');
            const linesIn = (room: number) => {
              for (let lines = 1; lines <= clampLines; lines += 1) {
                if (wordsFitLines(words, space, room, lines)) {
                  return lines;
                }
              }

              return clampLines + 1;
            };
            const besideRoom = barInner - actionsWidth - barGap;
            const linesAlone = linesIn(barInner - before);
            const linesBeside = linesIn(besideRoom - before);

            // a title of one line keeps its claim (its name), which keeps them beside it wherever they fit, and
            // keeps a panel sized by what it holds as wide as its name and its actions
            if (
              actionsWidth > 0 &&
              linesAlone >= 2 &&
              linesAlone <= clampLines &&
              linesBeside <= linesAlone
            ) {
              // it claims nothing, and takes what the actions leave (they do not grow: `actionsBeside`)
              next = 0;
            }

            /* Actions drawn as icons alone stay beside a title that takes one line on its own and fits beside
               them on one line a little smaller (`ICON_ACTIONS_TITLE_SHRINK`): the title claims its name at that
               size, and its fit draws it on one line at the largest size the line leaves. Missed by a few px,
               they took a row of their own (an issue drawer at 599px). Actions with words go under first,
               and a title that cannot shrink (one the caller sizes, breadcrumbs) lets them. */
            const shrunkPx = Math.floor(px * ICON_ACTIONS_TITLE_SHRINK);
            const shrunkClaim = Math.ceil(before + name * (shrunkPx / px)) + 1;
            /* What the line breaks on: the groups as they are drawn, not their controls' span (a folding group
               of one icon is 40px, its button 32). Icons are as wide under the title as beside it. */
            const actionsBoxWidth =
              boxChildren.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0) +
              boxGap * Math.max(0, boxChildren.length - 1);

            if (
              next > 0 &&
              actionsBoxWidth > 0 &&
              titleActionsDrawNoWords &&
              fitsLabel &&
              linesAlone === 1 &&
              shrunkPx >= (labelMinTextSize ?? 0) &&
              next + barGap + actionsBoxWidth > barInner &&
              shrunkClaim + barGap + actionsBoxWidth <= barInner
            ) {
              next = shrunkClaim;
              shrinksForIcons = true;
            }
          }
        }
      }

      // a measurement that could not be taken (no canvas, as in a test's DOM) is no claim: NaN is never
      // equal to itself, and set again on every render it never settled
      const claim = next !== undefined && Number.isFinite(next) ? next : undefined;

      setTitleBasis((current) => (current === claim ? current : claim));
      setTitleShrinksForIcons((current) => (current === shrinksForIcons ? current : shrinksForIcons));
      // what the actions say, not the list's identity: a host that makes its list in its render would
      // run this on every render
    }, [
      wrapActions,
      label,
      labelNaturalPx,
      labelEffect?.textSize,
      icon,
      iconImage,
      panelSize,
      width,
      clampLines,
      badgeSignature(nonFloatingActions),
      titleActionsDrawNoWords,
      fitsLabel,
      labelMinTextSize,
    ]);

    /**
     * Where the icon goes once the badges move under the title: beside the title, centred on it.
     * Centred on the whole label as before, it sat beside the badges' line ("Order Sync Template"
     * on a phone, its kind icon next to "In review"), as if it were theirs. The offset, in px from
     * the top of the title's row, is measured: the title may be one line or two, and at any size.
     * Only for the centred icon (the default); `iconVerticalAlign` 'top' or 'bottom' is the
     * caller's choice and stays.
     */
    const titleLineRef = useRef<HTMLDivElement>(null);
    const [iconBesideTitle, setIconBesideTitle] = useState<number | undefined>(undefined);

    useLayoutEffect(() => {
      const line = titleLineRef.current;
      const title = line?.firstElementChild;
      const iconElement = line
        ?.closest('.reqore-panel-title-header')
        ?.querySelector<HTMLElement>('.reqore-panel-title-icon');
      let next: number | undefined;

      if (line && title && iconElement && iconVerticalAlign === 'center') {
        const titleBox = title.getBoundingClientRect();
        const badgesBelow = Array.from(line.children)
          .slice(1)
          .some((child) => child.getBoundingClientRect().top >= titleBox.bottom - 1);

        if (badgesBelow) {
          next = Math.max(
            0,
            Math.round(
              titleBox.top -
                line.getBoundingClientRect().top +
                (titleBox.height - iconElement.getBoundingClientRect().height) / 2
            )
          );
        }
      }

      setIconBesideTitle((current) => (current === next ? current : next));
    }, [width, label, badgeKey, labelFitPx, icon, iconImage, iconVerticalAlign, description, titleOwnsLine]);

    /**
     * The least the actions' box that fills the bar is, where it holds a search (`SEARCH_BESIDE_TITLE_MIN_PX`):
     * the search at the width its placeholder needs, and the controls beside it as they are drawn. As the box's
     * `min-width` it is what the line breaks on, so where the title leaves less the box takes the line under it.
     * Read off the box as it is: the controls do not change with where the line breaks, and the search's own width
     * is taken out of what is measured, so nothing this sets moves it.
     */
    const fillsTheBar =
      wrapActions && !!responsiveActionsWrapperProps?.fluid && hasResponsiveActions(nonFloatingActions);
    const [fillMinWidth, setFillMinWidth] = useState<number | undefined>(undefined);

    useLayoutEffect(() => {
      const panel = panelRef.current as HTMLElement | null;
      const bar = panel?.querySelector?.<HTMLElement>(':scope > .reqore-panel-title');
      const box = bar?.querySelector<HTMLElement>(`:scope > .${TITLE_ACTIONS_CLASS}`);
      const input = box?.querySelector<HTMLInputElement>('input');
      let next: number | undefined;

      if (fillsTheBar && bar && box && input) {
        const inputStyle = getComputedStyle(input);
        let needs = SEARCH_BESIDE_TITLE_MIN_PX;

        if (input.placeholder) {
          titleMeasureCanvas = titleMeasureCanvas || document.createElement('canvas');
          const context = titleMeasureCanvas.getContext('2d');

          if (context) {
            context.font = `${inputStyle.fontStyle} ${inputStyle.fontWeight} ${inputStyle.fontSize} ${inputStyle.fontFamily}`;
            const text = context.measureText(input.placeholder).width;
            // a measurement that could not be taken (no canvas, as in a test's DOM) leaves the floor
            // the input's own sides: the room for its icon and its clear button, and its border
            const sides =
              (parseFloat(inputStyle.paddingLeft) || 0) +
              (parseFloat(inputStyle.paddingRight) || 0) +
              (parseFloat(inputStyle.borderLeftWidth) || 0) +
              (parseFloat(inputStyle.borderRightWidth) || 0);

            if (Number.isFinite(text)) {
              needs = Math.max(needs, Math.ceil(text + sides) + 2);
            }
          }
        }

        const boxGap = parseFloat(getComputedStyle(box).columnGap) || 0;
        const children = (Array.from(box.children) as HTMLElement[]).filter(
          (child) => child.getBoundingClientRect().width > 0
        );
        const drawn =
          children.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0) +
          boxGap * Math.max(0, children.length - 1);
        const barStyle = getComputedStyle(bar);
        const barInner =
          bar.clientWidth -
          (parseFloat(barStyle.paddingLeft) || 0) -
          (parseFloat(barStyle.paddingRight) || 0);

        const least = Math.min(
          Math.floor(barInner),
          Math.ceil(drawn - input.getBoundingClientRect().width + needs)
        );

        // nothing laid out (a test's DOM) is no least: NaN is never equal to itself, and set again on every
        // render it never settled
        next = Number.isFinite(least) && least > 0 ? least : undefined;
      }

      setFillMinWidth((current) => (current === next ? current : next));
      // what the actions say, not the list's identity: a host that makes its list in its render would run this on
      // every render, and in a test's DOM that never settled
    }, [fillsTheBar, width, badgeSignature(nonFloatingActions)]);

    const iconTooltip = useMemo(
      () => ({
        content: label,
      }),
      [label]
    );

    const handleRef = useCallback(
      (ref) => {
        let _ref = ref;

        if (ref?.resizable) {
          _ref = ref.resizable;
        }

        setRef(_ref);
      },
      [setRef]
    );

    if (skeleton) {
      return <ReqorePanelSkeleton size={panelSize} isCollapsed={_isCollapsed} />;
    }

    return (
      <ReqoreErrorBoundary {...errorBoundaryOptions}>
        <ReqoreTooltipComponent
          {...omit(rest, ['onResize'])}
          onClick={panelOnClick ? handlePanelClick : undefined}
          {..._resizable}
          as={rest.as || (isResizableElement ? Resizable : 'div')}
          isCollapsed={_isCollapsed}
          rounded={rounded}
          flat={flat}
          intent={intent}
          accentPosition={accentPosition}
          $accentSize={accentSizePx}
          className={`${className || ''} reqore-panel${
            _isHovered && size(floatingActionsList) > 0 ? ' reqore-panel-floating-active' : ''
          }`}
          interactive={interactive}
          theme={theme}
          effect={transformedContentEffect}
          opacity={opacity}
          fluid={fluid}
          disabled={disabled}
          Component={StyledPanel}
          ref={(node: any) => {
            handleRef(node);
            panelRef.current = node;
          }}
          onPointerEnter={handlePointerEnter}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {!_isCollapsed && mediaPosition === 'top' ? mediaNode : null}
          {/* Stuck-detection sentinel — 0-height marker at the very top of the
              panel, above the sticky header. See the observer effect above. It goes under
              top media, so it sits where the header starts. */}
          {rest.stickyHeader ? (
            <div ref={stickySentinelRef} aria-hidden='true' style={{ height: 0 }} />
          ) : null}
          {_isHovered &&
            size(floatingActionsList) > 0 &&
            createPortal(
              <StyledFloatingActions
                className='reqore-panel-floating-actions'
                theme={theme}
                size={panelSize}
                intent={intent}
                flat={flat}
                ref={floatingActionsRef}
                onMouseLeave={handleFloatingActionsMouseLeave}
              >
                <ReqoreControlGroup size={panelSize} gapSize={panelSize}>
                  {floatingActionsList.map((action, index) => renderActions(action, index, true))}
                </ReqoreControlGroup>
              </StyledFloatingActions>,
              document.body
            )}
          {hasTitleBar && (
            <StyledPanelTopBar
              flat={flat}
              isCollapsed={_isCollapsed}
              collapsible={collapsible}
              className='reqore-panel-title'
              onClick={handleTitleBarClick}
              theme={theme}
              minimal={minimal || opacity === 0}
              size={contentSize || panelSize}
              opacity={minimal ? 0 : (opacity ?? 1)}
              noHorizontalPadding={noHorizontalPadding}
              responsive={responsiveTitle}
              $descriptionBelow={descriptionBelow}
              $wrapActions={wrapActions}
              $descriptionMaxLines={descriptionIsClamped ? descriptionClamp : 0}
              $descriptionMaxHeight={descriptionIsClamped ? undefined : descriptionMaxHeight}
              $descriptionFontPx={descriptionFontPx}
              // Stamped for the same reason `EntityRow` stamps it: a narrow container is a fact
              // about the box, and a test or a story asserting the narrow treatment should read
              // it rather than infer it from pixels.
              data-narrow={isNarrow ? 'true' : 'false'}
              ref={measureRef}
              padded={padded}
              wrapperPadding={wrapperPadding}
              intent={intent}
              rounded={rounded}
              radiusSize={rest.radiusSize}
              stickyHeader={rest.stickyHeader}
              $pins={!!rest.stickyHeader && isTallEnoughToPin}
              data-pins-header={rest.stickyHeader ? String(isTallEnoughToPin) : undefined}
              stickyHeaderOffset={rest.stickyHeaderOffset}
              stickyHeaderInset={stickyInset}
              isStuck={isHeaderStuck}
              $mediaAbove={hasMedia && mediaPosition === 'top' && !_isCollapsed}
              $cornerInset={cornerInset}
            >
              {hasTitleHeader && (
                <StyledPanelTitleHeader
                  className='reqore-panel-title-header'
                  style={titleBasis === undefined ? undefined : { flexBasis: titleBasis }}
                  data-actions-beside={titleBasis === 0 ? 'true' : undefined}
                >
                  {breadcrumbs ? (
                    <ReqoreBreadcrumbs
                      {...breadcrumbs}
                      padded={false}
                      margin='none'
                      flat
                      responsive
                    />
                  ) : icon || iconImage || label || badge ? (
                    (() => {
                      const hasPanelIcon = !!icon || !!iconImage || loading;
                      // The icon takes the label's place, so there has to BE an icon. Without one
                      // the label is the only thing identifying the panel and it stays put — a
                      // header with neither is not a compact header, it is an empty one. The label
                      // is not lost either way: it is already this icon's tooltip.
                      const hideTitleText = hideTitleForIcon && hasPanelIcon;

                      // Layout decision:
                      // - iconWithLabel=true → render the icon INSIDE the
                      //   label-and-badge row (no outer icon column). The
                      //   description sits flush-left under the icon+label.
                      // - When there is NO description, fall back to the
                      //   inline layout regardless of iconVerticalAlign — the
                      //   outer grid only earns its keep when there is a
                      //   description row to anchor against, and the inline
                      //   layout aligns icon-to-text glyphs more naturally
                      //   via the heading's own line-height.
                      // - Otherwise → outer two-column grid where the icon
                      //   sits in a reserved column. iconVerticalAlign places
                      //   the icon in row 1 (label), row 2 (description), or
                      //   spans both rows (center). The description always
                      //   indents past the icon column.
                      const inlineWithLabel =
                        hasPanelIcon && (iconWithLabel || !description || hideTitleText);
                      const useOuterGrid = hasPanelIcon && !inlineWithLabel;

                      // Outer grid → grid column-gap handles icon→label
                      // spacing, so the icon itself takes no margin.
                      // Inline → keep 'margin=right' so ReqoreIcon adds its
                      // standard side-spacer between icon and label.
                      const iconMargin: 'right' | undefined = useOuterGrid ? undefined : 'right';

                      const panelIcon = hasPanelIcon ? (
                        <ReqoreIcon
                          size={`${
                            ICON_FROM_HEADER_SIZE[labelSize || HEADER_SIZE_TO_NUMBER[panelSize]]
                          }px`}
                          image={loading ? undefined : iconImage}
                          margin={iconMargin}
                          color={iconColor}
                          tooltip={iconTooltip}
                          effect={{
                            opacity: CONTROL_ICON_OPACITY,
                          }}
                          {...iconProps}
                          style={
                            iconBesideTitle === undefined
                              ? iconProps?.style
                              : {
                                  ...iconProps?.style,
                                  // Beside the title, not the badges under it: on the title's
                                  // row alone, from its top.
                                  alignSelf: 'flex-start',
                                  gridRow: useOuterGrid ? '1' : undefined,
                                  marginTop: iconBesideTitle,
                                }
                          }
                          animation={loading ? 'spin' : iconProps?.animation}
                          icon={
                            loading ? `Loader${loadingIconType || ''}Line` : icon || iconProps?.icon
                          }
                          className={`reqore-panel-title-icon ${iconProps?.className || ''}`.trim()}
                        />
                      ) : null;

                      const labelRow = (
                        <StyledPanelTitleHeaderLabelAndBadge className='reqore-panel-title-label-row'>
                          {inlineWithLabel && panelIcon}
                          <ReqoreTitleAndBadges
                            ref={titleLineRef}
                            badge={badge}
                            badgeSize={getOneHigherSize(panelSize)}
                            // The room the badges keep from the title, which a spacer before them
                            // used to hold.
                            gap={PADDING_FROM_SIZE[getOneHigherSize(panelSize)]}
                          >
                            {hideTitleText ? null : typeof label === 'string' ? (
                              // The measured box is this wrapper, not the heading: as a
                              // `min-width: 0` flex child it reports the width the row actually
                              // left for the title, where the heading would report what the text
                              // wants. `overflow: hidden` is what makes it shrinkable at all.
                              // `display: flex` keeps the wrapper from opening a line box around
                              // the inline-flex heading: a block wrapper adds the row's leading on
                              // top of the heading's own box, which made a `tiny` panel 3px taller
                              // than it was before this wrapper existed.
                              <StyledPanelTitleLabelBox
                                ref={labelFitRef}
                                className='reqore-panel-title-label-box'
                                $clampLines={clampLines}
                                $ownLine={titleOwnsLine}
                              >
                              <LabelEditor
                                size={labelSize || panelSize}
                                customTheme={theme}
                                effect={{
                                  // `noWrap` pins the heading to one line; a clamped title is
                                  // allowed to wrap, and the clamp brings its own ellipsis.
                                  noWrap: clampLines === 1,
                                  ...labelEffect,
                                }}
                                style={{
                                  // A clamped title takes its display from the box above, which
                                  // sets `-webkit-box`. Naming a display here would beat that
                                  // rule and quietly turn the clamp off.
                                  ...(clampLines > 1
                                    ? {}
                                    : { display: 'inline-flex', alignItems: 'center' }),
                                  minWidth: 0,
                                  // Capped to the measured wrapper so the heading's own
                                  // `text-overflow: ellipsis` (from `noWrap`) has a box to overflow.
                                  // An `inline-flex` heading otherwise sizes to its text, and the
                                  // wrapper clips it mid-word with no ellipsis at all.
                                  maxWidth: '100%',
                                  // Inline, not through `effect.textSize`: `StyledHeader` sets its
                                  // own `font-size` from the heading level in a rule that lands
                                  // after the effect's, so the effect could never win. An inline
                                  // style beats both. A caller pinning `labelEffect.textSize`
                                  // disables the fit, so this never fights them.
                                  ...(fitLabel !== false && !labelEffect?.textSize
                                    ? { fontSize: `${labelFitPx}px` }
                                    : dialogTitlePx && !labelEffect?.textSize
                                      ? { fontSize: `${dialogTitlePx}px` }
                                      : {}),
                                }}
                                label={label}
                                onSubmit={onLabelEdit}
                                tooltip={showLabelTooltip ? customLabelTooltip || label : undefined}
                              />
                              </StyledPanelTitleLabelBox>
                            ) : (
                              label
                            )}
                          </ReqoreTitleAndBadges>
                        </StyledPanelTitleHeaderLabelAndBadge>
                      );

                      // Description size is driven by the panel size only —
                      // explicitly NOT by `labelSize`. `NUMBER_TO_SIZE` maps
                      // 1..6 → micro..huge, which means bumping `labelSize`
                      // from 4 to 2 to grow the heading would inversely
                      // shrink the description to `tiny`. That's the wrong
                      // pairing: a bigger label should not make supporting
                      // text smaller. Consumers that want to size the
                      // description explicitly pass `descriptionEffect.textSize`.
                      const descriptionRow = description && !hideTitleText && !descriptionBelow ? (
                        <ReqoreSpan {...descriptionProps}>{description}</ReqoreSpan>
                      ) : null;

                      return (
                        <StyledPanelTitleHeaderContent
                          size={panelSize}
                          {...labelProps}
                          hasLabel={!!label && !hideTitleText}
                          hasIcon={useOuterGrid}
                          iconSize={
                            ICON_FROM_HEADER_SIZE[labelSize || HEADER_SIZE_TO_NUMBER[panelSize]]
                          }
                          $hasOuterIcon={useOuterGrid}
                          $iconVerticalAlign={iconVerticalAlign}
                          $hasDescription={!!description && !hideTitleText}
                        >
                          {useOuterGrid ? (
                            <>
                              {panelIcon}
                              {labelRow}
                              {descriptionRow}
                            </>
                          ) : (
                            <StyledPanelTitleHeaderLabelAndDescription>
                              {labelRow}
                              {descriptionRow}
                            </StyledPanelTitleHeaderLabelAndDescription>
                          )}
                        </StyledPanelTitleHeaderContent>
                      );
                    })()
                  ) : null}
                  {breadcrumbs && (badge || badge === 0) ? (
                    <ButtonBadge
                      size={getOneHigherSize(panelSize)}
                      content={badge}
                      wrapGroup={isSmall}
                      margin={label ? 'left' : 'none'}
                    />
                  ) : null}
                  <ReqorePanelNonResponsiveActions
                    // The narrow bar keeps its controls in the trailing group, so this row —
                    // which existed only for the stacked layout — never shows.
                    show={false}
                    isSmall={false}
                    showControlButtons
                    size={panelSize}
                    hasResponsiveActions={hasResponsiveActions(nonFloatingActions)}
                    customTheme={theme}
                    isCollapsed={_isCollapsed}
                    onCollapseClick={collapsible ? handleCollapseClick : undefined}
                    onCloseClick={onClose}
                    closeButtonProps={closeButtonProps}
                    collapseButtonProps={collapseButtonProps}
                    collapseTooltip={collapseTooltip}
                    expandTooltip={expandTooltip}
                    closeTooltip={closeTooltip}
                    fluid={false}
                    style={{ marginLeft: 'auto' }}
                  />
                </StyledPanelTitleHeader>
              )}
              <PanelTitleActions
                wrap={wrapActions}
                beside={titleBasis === 0}
                fill={!!responsiveActionsWrapperProps?.fluid && hasResponsiveActions(nonFloatingActions)}
                fillMinWidth={fillsTheBar ? fillMinWidth : undefined}
              >
                {hasNonResponsiveActions(leadingTitleActions) ? (
                  <ReqoreControlGroup
                    {...PANEL_ACTIONS_MARK}
                    className={LEADING_ACTIONS_CLASS}
                    fixed
                    horizontalAlign='flex-end'
                    verticalAlign='center'
                    customTheme={theme}
                    size={panelSize}
                    // At the bar's trailing edge, as the folding group after it was; sized as the kept
                    // group after it is (see there).
                    style={
                      wrapActions
                        ? KEPT_ACTIONS_AT_THEIR_WIDTH
                        : hasTitleHeader && isNarrow
                          ? { ...NARROW_ACTIONS_BESIDE_TITLE, marginLeft: 'auto' }
                          : { flex: '0 0 auto', marginLeft: 'auto' }
                    }
                  >
                    {leadingTitleActions.map(renderNonResponsiveActions())}
                  </ReqoreControlGroup>
                ) : null}
                {hasResponsiveActions(nonFloatingActions) && (
                  <ReqoreControlGroup
                    responsive={responsiveActions}
                    // Not fluid by default. `fluid` emits `width: 100%`, so the group's flex basis
                    // becomes the whole bar and the title — the only shrinkable thing on the other
                    // side — collapses to nothing: measured at 0px of title on a 400px panel, and
                    // 142px of a 518px bar where the buttons needed 90.
                    //
                    // A caller whose actions include something with no useful width of its own —
                    // Collection puts a search input in here — opts back in through
                    // `responsiveActionsWrapperProps`, because `fluid` is also what ControlGroup
                    // propagates to its children, and that input has nothing to fill without it.
                    fluid={false}
                    horizontalAlign='flex-end'
                    customTheme={theme}
                    size={panelSize}
                    {...responsiveActionsWrapperProps}
                    {...PANEL_ACTIONS_MARK}
                    // The cap is the whole fix. Half the bar guarantees the title the other half,
                    // and the moment the buttons need more than their share the group overflows —
                    // which is what `responsive` collapse watches (`scrollWidth > clientWidth`), so
                    // the fold into the `…` menu still fires. Floored at 40px because shrinking to
                    // nothing clips the buttons rather than folding them, and ControlGroup ignores
                    // its own overflow below that width, which would strand them clipped.
                    style={{
                      // Pushed to the trailing edge. A `fluid` group used to span the bar and its
                      // own `horizontalAlign` put the buttons on the right; a content-sized one is
                      // only as wide as its buttons, so with no title header beside it — Tree has
                      // no label — it would sit at the LEFT of an otherwise empty bar. `auto`
                      // margin restores the edge without giving the group any width back. The kept
                      // actions before it take the edge where there are some, and the actions' own
                      // box where they may go under the title.
                      marginLeft:
                        wrapActions || hasNonResponsiveActions(leadingTitleActions)
                          ? undefined
                          : 'auto',
                      // Content basis that may still shrink. `fluid={false}` alone compiles to
                      // `flex: 0 0 auto`, which pins the group at its content width so it can never
                      // overflow — and `responsive` collapse watches `scrollWidth > clientWidth`,
                      // so the fold into the `…` menu would simply stop happening. A group the
                      // caller made fluid grows in the actions' own box, which then claims its share
                      // of the bar (`FILLING_TITLE_ACTIONS_STYLE`).
                      flex: wrapActions && responsiveActionsWrapperProps?.fluid ? '1 1 auto' : '0 1 auto',
                      // Floored, because shrinking to nothing clips the buttons instead of folding
                      // them, and ControlGroup ignores its own overflow below 40px. At the floor
                      // it folds on, and folded to its "⋯" alone it is that button's width.
                      minWidth: 40,
                      // Capped, so a group that IS opted back into growing cannot take the row —
                      // but only while there is a title header to take it FROM. With no label,
                      // badge, icon or breadcrumbs the bar is the group's alone, and holding a
                      // Collection's search input to half of an empty bar guards nothing. Nor where
                      // the actions go under the title rather than squeeze it: there the line breaks
                      // on the group's whole width, and under the title the line is theirs.
                      maxWidth: hasTitleHeader && !wrapActions ? '50%' : undefined,
                      ...responsiveActionsWrapperProps?.style,
                    }}
                  >
                    {nonFloatingActions.map(renderResponsiveActions())}
                  </ReqoreControlGroup>
                )}
                <ReqorePanelNonResponsiveActions
                  show={showNonResponsiveGroup()}
                  isSmall={false}
                  showControlButtons
                  size={panelSize}
                  hasResponsiveActions={hasResponsiveActions(nonFloatingActions)}
                  customTheme={theme}
                  isCollapsed={_isCollapsed}
                  onCollapseClick={collapsible ? handleCollapseClick : undefined}
                  onCloseClick={onClose}
                  closeButtonProps={closeButtonProps}
                  collapseButtonProps={collapseButtonProps}
                  collapseTooltip={collapseTooltip}
                  expandTooltip={expandTooltip}
                  closeTooltip={closeTooltip}
                  fluid={!hasTitleHeader}
                  {...PANEL_ACTIONS_MARK}
                  className={NON_RESPONSIVE_ACTIONS_CLASS}
                  // Beside a title in a NARROW bar the title comes first. The group is
                  // `0 0 auto`, so a narrow bar - a table in a card on a phone - squeezed the title
                  // to nothing and still pushed its last button past the panel's edge. Narrow, the
                  // title takes its whole width first and the group what is left, at least what its
                  // controls cannot do without (a search field narrows, a button never does) and at
                  // most its own width. A basis of 0 is what gives the title the first claim: the
                  // group is sized from the leftover, so the title shrinks only once the controls
                  // are at their smallest - and its words break only when one is wider than the
                  // space left beside them. Shrinking the two against each other instead, by any
                  // factor, took a fraction of a pixel off the title, and that broke "Services" into
                  // "Servic / es". Room the title does not need goes to the group first (a grow no
                  // title's comes near), so a search field widens before the title's box does. A
                  // wide bar keeps the group at its own width: there the title's claim was its
                  // one-line width, a description beside it included, and a long description
                  // squeezed a table's search to its least instead of wrapping.
                  style={
                    wrapActions
                      ? KEPT_ACTIONS_AT_THEIR_WIDTH
                      : hasTitleHeader && isNarrow
                        ? NARROW_ACTIONS_BESIDE_TITLE
                        : undefined
                  }
                >
                  {trailingTitleActions.map(renderNonResponsiveActions())}
                </ReqorePanelNonResponsiveActions>
              </PanelTitleActions>
              {descriptionBelow ? (
                // `flex-basis: 100%` is what puts it on its own line — the bar is a wrapping
                // flex row, so a full-width item cannot share one with anything before it.
                // `min-width: 0` so a long sentence wraps inside the bar instead of widening it.
                <div
                  className='reqore-panel-title-description-row'
                  style={{ flex: '0 0 100%', minWidth: 0 }}
                >
                  <ReqoreSpan {...descriptionProps}>{description}</ReqoreSpan>
                </div>
              ) : null}
            </StyledPanelTopBar>
          )}
          {!_isCollapsed || (_isCollapsed && !unMountContentOnCollapse) ? (
            <StyledPanelContent
              as={'div'}
              className='reqore-panel-content'
              hasLabel={!!hasTitleBar}
              hasBottomActions={hasBottomActions}
              isCollapsed={_isCollapsed}
              style={contentStyle}
              padded={padded}
              minimal={minimal || opacity === 0}
              size={contentSize || panelSize}
              ref={getContentRef}
              noHorizontalPadding={noHorizontalPadding}
              $cornerInset={cornerInset}
              stickyHeader={rest.stickyHeader}
            >
              {children}
            </StyledPanelContent>
          ) : null}
          {hasBottomActions && !_isCollapsed ? (
            <StyledPanelBottomActions
              flat={flat}
              className='reqore-panel-bottom-actions'
              theme={theme}
              padded={padded}
              intent={intent}
              minimal={minimal || opacity === 0}
              opacity={minimal ? 0 : (opacity ?? 1)}
              size={contentSize || panelSize}
              noHorizontalPadding={noHorizontalPadding}
              $cornerInset={cornerInset}
              $wrapKept={wrapKeptBottomActions}
            >
              {/* In the page's order, whichever may fold (`splitAtFirstFolding`). */}
              {hasNonResponsiveActions(leadingLeftBottomActions) ? (
                <ReqoreControlGroup
                  {...PANEL_ACTIONS_MARK}
                  size={panelSize}
                  wrap
                  style={KEPT_BOTTOM_GROUP_STYLE.left}
                >
                  {leadingLeftBottomActions.map(renderNonResponsiveActions('flex-start'))}
                </ReqoreControlGroup>
              ) : null}
              {hasResponsiveActions(leftBottomActions) && (
                <ReqoreControlGroup
                  {...PANEL_ACTIONS_MARK}
                  fluid={responsiveActions}
                  responsive={responsiveActions}
                  customTheme={theme}
                  size={panelSize}
                  style={{ marginRight: 'auto' }}
                >
                  {leftBottomActions.map(renderResponsiveActions('flex-start'))}
                </ReqoreControlGroup>
              )}
              {hasNonResponsiveActions(trailingLeftBottomActions) ? (
                <ReqoreControlGroup
                  {...PANEL_ACTIONS_MARK}
                  size={panelSize}
                  wrap
                  style={KEPT_BOTTOM_GROUP_STYLE.left}
                >
                  {trailingLeftBottomActions.map(renderNonResponsiveActions('flex-start'))}
                </ReqoreControlGroup>
              ) : null}
              {hasNonResponsiveActions(leadingRightBottomActions) ? (
                <ReqoreControlGroup
                  {...PANEL_ACTIONS_MARK}
                  horizontalAlign='flex-end'
                  size={panelSize}
                  wrap
                  style={KEPT_BOTTOM_GROUP_STYLE.right}
                >
                  {leadingRightBottomActions.map(renderNonResponsiveActions())}
                </ReqoreControlGroup>
              ) : null}
              {hasResponsiveActions(rightBottomActions) && (
                <ReqoreControlGroup
                  {...PANEL_ACTIONS_MARK}
                  fluid={responsiveActions}
                  horizontalAlign='flex-end'
                  responsive={responsiveActions}
                  customTheme={theme}
                  style={
                    hasNonResponsiveActions(leadingRightBottomActions)
                      ? undefined
                      : RIGHT_BOTTOM_GROUP_STYLE
                  }
                  size={panelSize}
                >
                  {rightBottomActions.map(renderResponsiveActions())}
                </ReqoreControlGroup>
              )}
              {hasNonResponsiveActions(trailingRightBottomActions) ? (
                <ReqoreControlGroup
                  {...PANEL_ACTIONS_MARK}
                  horizontalAlign='flex-end'
                  size={panelSize}
                  wrap
                  style={KEPT_BOTTOM_GROUP_STYLE.right}
                >
                  {trailingRightBottomActions.map(renderNonResponsiveActions())}
                </ReqoreControlGroup>
              ) : null}
            </StyledPanelBottomActions>
          ) : null}
          {!_isCollapsed && mediaPosition === 'bottom' ? mediaNode : null}
        </ReqoreTooltipComponent>
      </ReqoreErrorBoundary>
    );
  }
);
