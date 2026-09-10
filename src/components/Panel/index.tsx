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
import styled, { css } from 'styled-components';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import {
  ACCENT_SIZE_TO_PX,
  GAP_FROM_SIZE,
  HEADER_LEVEL_TO_PX,
  HEADER_SIZE_TO_NUMBER,
  ICON_FROM_HEADER_SIZE,
  PADDING_FROM_SIZE,
  resolveRadius,
  SPECIAL_PADDING_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { omitStyleProps } from '../../helpers/styled';
import { getOneLessSize, getOneHigherSize, isActionShown, resolveAccentSize } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useFitTextSize } from '../../hooks/useFitTextSize';
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
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreIconImage,
  IWithReqoreLoading,
  IWithReqoreSize,
  IWithReqoreTooltip,
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

const getPaddingSize = (padded: boolean | TSizes, size: TSizes): number =>
  typeof padded === 'string' ? SPECIAL_PADDING_FROM_SIZE[padded] : PADDING_FROM_SIZE[size];

export interface IReqorePanelSubAction extends Omit<IReqoreDropdownItem, 'value'> {
  show?: boolean;
}
export interface IReqorePanelAction extends IReqoreButtonProps, IWithReqoreTooltip, IReqoreIntent {
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
}

export interface IReqorePanelBottomAction extends IReqorePanelAction {
  position?: 'left' | 'right';
}

export interface IReqorePanelContent {}
export type TReqorePanelActions = IReqorePanelAction[];
export type TReqorePanelBottomActions = IReqorePanelBottomAction[];

export interface IReqorePanelProps
  extends IReqoreComponent,
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
   * @default false
   */
  fitLabel?: boolean;
  /**
   * Step the action buttons down a size on a narrow bar, so the controls give up room the way
   * the title does instead of staying at full size while everything around them shrinks.
   *
   * Separate from `fitLabel` because it is a different trade: `fitLabel` buys the title space by
   * taking it from the action group, while this shrinks the actions themselves. They compose —
   * together the row gets smaller controls AND a title sized to what is left.
   *
   * @default false
   */
  fitActions?: boolean;
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
  /** Tooltip for the collapse control when the panel is expanded. Defaults to `'Collapse'`. */
  collapseTooltip?: string;
  /** Tooltip for the collapse control when the panel is collapsed. Defaults to `'Expand'`. */
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
  /** Always a resolved pixel number — the component maps `TSizes` names before
   *  it reaches the styles, so the css (which interpolates px) never sees a string. */
  $accentSize?: number;
  /** True once a sticky header has pinned to its scroll container (detected at
   *  runtime). The header drops its top radius while stuck so it reads as a
   *  full-width bar, and regains it at rest. */
  isStuck?: boolean;
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

export const StyledPanelTitleHeader = styled.div`

  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex: 1 1 auto;
  width: 100%;
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
            ${$iconVerticalAlign === 'top'
              ? css`
                  grid-row: 1;
                `
              : $iconVerticalAlign === 'bottom' && $hasDescription
              ? css`
                  grid-row: 2;
                `
              : css`
                  grid-row: 1 / ${$hasDescription ? 3 : 2};
                `}
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

export const StyledPanel: TPanelStyle = styled(StyledEffect).withConfig({
  // `fill` controls panel layout and must not become a boolean DOM attribute. Neither must
  // `accentPosition`: when the panel renders as a `Resizable` (a COMPONENT target) the rule
  // below forwards everything, and re-resizable spreads the leftovers onto its wrapper div.
  // Filtering here still leaves the styled-component's own interpolations reading the prop.
  // Everything else follows styled-components' own rule, so re-resizable still receives its
  // `enable` / size / handle config — those are component props, not HTML attributes.
  shouldForwardProp: omitStyleProps('fill', 'accentPosition'),
})<IStyledPanel>`
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)};
  border-radius: ${({ rounded, radiusSize }) =>
    rounded ? resolveRadius('normal', radiusSize) : 0}px;
  border: ${({ theme, flat, intent, accentPosition }) =>
    hasPanelBorder({ flat, intent, accentPosition })
      ? `1px solid ${changeLightness(
          getPanelBorderBaseColor(theme, { intent, accentPosition }),
          0.08
        )}`
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
            resolveRadius('normal', radiusSize) -
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
        ${accentPosition === 'left'
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
            `}
        ${stripRadius
          ? accentPosition === 'left'
            ? css`
                border-top-left-radius: ${stripRadius}px;
                border-bottom-left-radius: ${stripRadius}px;
              `
            : css`
                border-top-left-radius: ${stripRadius}px;
                border-top-right-radius: ${stripRadius}px;
              `
          : undefined}
        background-color: ${intent
          ? theme.intents[intent]
          : changeLightness(getMainBackgroundColor(theme), 0.22)};
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

            background-color: ${opacity === 0 && flat
              ? undefined
              : rgba(
                  darken(0.025, rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)),
                  opacity
                )};

            border-color: ${hasPanelBorder({ flat, intent, accentPosition })
              ? changeLightness(getPanelBorderBaseColor(theme, { intent, accentPosition }), 0.25)
              : undefined};

            ${opacity !== 0 &&
            css`
              ${StyledCollectionItemContent}:after {
                background: linear-gradient(
                  to top,
                  ${rgba(
                      darken(
                        0.025,
                        rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)
                      ),
                      opacity
                    )}
                    0%,
                  transparent 100%
                );
              }
            `}
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

export const StyledPanelTitle = styled.div<IStyledPanel>`
  display: flex;
  /* Always a row. The title bar used to flip to a column when narrow; it now ellipsizes its
     label and lets the responsive action group collapse instead, which is what the "hidden when
     small" actions are for and what the stack was quietly defeating (a column made the group
     fluid, and a full-width group had room not to collapse). */
  flex-flow: row;
  background-color: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeLightness(getMainBackgroundColor(theme), 0.03), opacity)};
  justify-content: space-between;

  padding: ${({ noHorizontalPadding, size, padded, opacity, flat, intent }: IStyledPanel) =>
    `${opacity === 0 && flat && !intent ? 0 : getPaddingSize(padded, size)}px ${
      noHorizontalPadding ? 0 : `${getPaddingSize(padded, size)}px`
    }`};

  align-items: center;
  border-bottom: ${({ theme, isCollapsed, flat, opacity = 1 }) =>
    !isCollapsed && !flat && opacity
      ? `1px solid ${rgba(changeLightness(getMainBackgroundColor(theme), 0.08), opacity)}`
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
          rgba(changeLightness(getMainBackgroundColor(theme), 0.05), opacity)};
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
  position: ${({ stickyHeader }) => (stickyHeader ? 'sticky' : 'relative')};
  /* \`top: 0\` must mean "flush with the visible top edge of whatever scrolls",
     which is what every call site assumes. Sticky resolves against the scroll
     container's CONTENT box, so on a padded scrollport — which every default
     panel/drawer/modal body is, since StyledPanelContent puts padding and
     overflow on one element — an uncompensated 0 parks the header below the
     padding and lets content scroll through the gap. \`stickyHeaderInset\` is
     that padding, measured from the real scroll ancestor at runtime;
     \`stickyHeaderOffset\` stays a deliberate caller offset on top of a now
     correct zero. */
  top: ${({ stickyHeader, stickyHeaderOffset = 0, stickyHeaderInset = 0 }) =>
    stickyHeader ? `${stickyHeaderOffset - stickyHeaderInset}px` : undefined};
  z-index: ${({ stickyHeader }) => (stickyHeader ? 2 : undefined)};
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
  }: IStyledPanel) =>
    stickyHeader && rounded
      ? isStuck
        ? '0px'
        : `${Math.max(
            0,
            resolveRadius('normal', radiusSize) -
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
  }: IStyledPanel) =>
    stickyHeader && rounded
      ? isStuck
        ? '0px'
        : `${Math.max(
            0,
            resolveRadius('normal', radiusSize) -
              (hasPanelBorder({ flat, intent, accentPosition }) ? 1 : 0)
          )}px`
      : undefined};
  background: ${({ theme, opacity = 1 }: IStyledPanel) =>
    rgba(changeLightness(getMainBackgroundColor(theme), 0.03), opacity)};
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
      ? `1px solid ${rgba(changeLightness(getMainBackgroundColor(theme), 0.08), opacity)}`
      : null};
`;

export const StyledPanelContent = styled.div<IStyledPanel>`
  display: ${({ isCollapsed }) => (isCollapsed ? 'none !important' : undefined)};
  padding: ${({ padded, size, noHorizontalPadding }) =>
    !padded
      ? undefined
      : noHorizontalPadding
      ? `${getPaddingSize(padded, size)}px 0`
      : `${getPaddingSize(padded, size)}px ${getPaddingSize(padded, size)}px`};
  flex: 1;
  /* A flex child's min-height defaults to its content size, so without this the
     scrollable content can't shrink: a panel/drawer body taller than the panel
     pushes the (flex: 0 0 auto) bottom-actions footer past the panel's clipped
     edge and strands it, instead of scrolling. */
  min-height: 0;
  overflow: auto;
  overflow-wrap: anywhere;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;
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
  background-color: ${({ theme }) => rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), 1)};
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
      contentSize,
      minimal,
      badge,
      iconColor,
      iconProps = {},
      fluid,
      responsiveActions = true,
      responsiveTitle = true,
      compactTitle = false,
      fitLabel = false,
      fitActions = false,
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
      floatingActions,
      collapseTooltip = 'Collapse',
      expandTooltip = 'Expand',
      closeTooltip = 'Close',
      accentPosition,
      accentSize,
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
    const { targetRef } = useCombinedRefs(ref);
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

    useEffect(() => {
      if (!rest.stickyHeader) {
        setIsHeaderStuck(false);
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
      setStickyInset(inset.padding);
      const measure = () => {
        frame = 0;
        const sentinelTop = sentinel.getBoundingClientRect().top;
        // Border box plus the border, which is the line the compensated header
        // pins to. Comparing against the bare border box flips `isHeaderStuck`
        // late by the scrollport's inset, so a pinned header keeps its top
        // radius through exactly the gap this fix closes.
        const rootTop = scrollParent
          ? scrollParent.getBoundingClientRect().top + inset.border
          : 0;
        // 1px deadzone so the exact at-rest position (sentinel flush against the
        // top) never reads as stuck.
        setIsHeaderStuck(sentinelTop < rootTop + offset - 1);
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(measure);
      };
      const onLayout = () => {
        inset = getScrollportInset(scrollParent);
        setStickyInset(inset.padding);
        onScroll();
      };
      measure();
      document.addEventListener('scroll', onScroll, { capture: true, passive: true });
      window.addEventListener('resize', onLayout, { passive: true });
      // Responsive padding changes the inset without a window resize or a
      // scroll, and the header would stay compensated by the old value.
      const observer =
        scrollParent && typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(onLayout)
          : undefined;
      observer?.observe(scrollParent as HTMLElement);
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
      const floatingRect = floatingActionsRef.current.getBoundingClientRect();

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
      floatingActionsRef.current.style.top = `${
        panelRect.top - floatingRect.height + (flat ? 0 : 1)
      }px`;
      floatingActionsRef.current.style.left = `${panelRect.right - floatingRect.width}px`;
    }, [flat]);

    useEffect(() => {
      if (!_isHovered || !floatingActions || !size(floatingActionsList)) return undefined;

      updateFloatingActionsPosition();

      const onScroll = () => updateFloatingActionsPosition();

      window.addEventListener('scroll', onScroll, true);
      return () => window.removeEventListener('scroll', onScroll, true);
    }, [_isHovered, floatingActions, floatingActionsList, updateFloatingActionsPosition]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (floatingActions) {
          if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
          hoverTimerRef.current = setTimeout(() => setIsHovered(true), 150);
        }
        rest.onMouseEnter?.(e);
      },
      [floatingActions, rest.onMouseEnter]
    );

    const cancelHover = useCallback(() => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
      setIsHovered(false);
    }, []);

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

          cancelHover();
        }
        rest.onMouseLeave?.(e);
      },
      [floatingActions, rest.onMouseLeave, cancelHover]
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

        cancelHover();
      },
      [cancelHover]
    );

    const _resizable: ResizableProps = useMemo(() => {
      // Only carry re-resizable's props when the panel actually renders as a
      // `Resizable` (the same condition the `as` below uses). Otherwise the
      // element is a plain `div`, and — now that these props are forwarded
      // through the panel — spreading `enable` / `defaultSize` / … onto a div
      // would emit invalid-DOM-attribute warnings. A non-resizable (or
      // collapsed / disabled) panel therefore carries no resizable props.
      const isResizableElement = !!resizable && !disabled && !_isCollapsed;
      return isResizableElement && resizable ? resizable : {};
    }, [resizable, _isCollapsed, disabled]);

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
    const isSmall = useMemo(
      () => responsiveTitle && width > 0 && width < 480,
      [width, responsiveTitle]
    );
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
     * The size the action buttons render at, stepped down as the bar narrows.
     *
     * Progressive rather than a single switch at the narrow threshold: one step taken once means
     * every panel below 480px renders identical buttons, which reads as "the buttons never
     * change" precisely where the room is tightest. Each step is worth roughly 8px per button,
     * so a three-button row buys the title ~25px per step.
     */
    const actionSize: TSizes = useMemo(() => {
      if (!fitActions || !width) {
        return panelSize;
      }

      const steps = width >= 480 ? 0 : width >= 380 ? 1 : 2;

      return steps === 0
        ? panelSize
        : steps === 1
          ? getOneLessSize(panelSize)
          : getOneLessSize(getOneLessSize(panelSize));
    }, [fitActions, width, panelSize]);
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

    const leftBottomActions: IReqorePanelBottomAction[] = useMemo(
      () => bottomActions.filter(({ position }) => position === 'left' || !position),
      [bottomActions]
    );

    const rightBottomActions: IReqorePanelBottomAction[] = useMemo(
      () => bottomActions.filter(({ position }) => position === 'right'),
      [bottomActions]
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
      (data: TReqorePanelActions) =>
        (!responsiveActions && size(data)) ||
        data.some((action) => action.responsive === false && action.show !== false),
      [actions, bottomActions, responsiveActions, showActionsWhenCollapsed, _isCollapsed]
    );

    const hasResponsiveActions = useCallback(
      (data: TReqorePanelActions) =>
        responsiveActions &&
        data.some((action) => action.responsive !== false && action.show !== false),
      [actions, bottomActions, responsiveActions, showActionsWhenCollapsed, _isCollapsed]
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
        align: 'flex-start' | 'center' | 'flex-end' = 'flex-end'
      ) => {
        if (
          action.show === false ||
          (showActionsWhenCollapsed === false && _isCollapsed === true) ||
          (includeResponsive && action.responsive === false) ||
          (!includeResponsive &&
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
          ...rest
        }: IReqorePanelAction = action;

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
              {group.map((action, index) => renderActions(action, index, true))}
            </ReqoreControlGroup>
          );
        }

        if (size(actions)) {
          return (
            <ReqoreDropdown
              fixed
              {...rest}
              key={index}
              label={label}
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
        const actionLabelTooltip = typeof label === 'number' ? String(label) : label;
        const dropActionLabel = isNarrow && !!rest.icon && !!label;

        return (
          <ReqoreButton
            fixed
            {...rest}
            id={id}
            key={index}
            className={className}
            customTheme={rest.customTheme || theme}
            intent={intent}
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
      if (hasNonResponsiveActions(nonFloatingActions)) {
        show = true;
      }

      return show;
    }, [collapsible, onClose, nonFloatingActions, hasNonResponsiveActions]);

    /**
     * The title's natural size in px, from the heading level it renders at — the same
     * `labelSize || HEADER_SIZE_TO_NUMBER[panelSize]` the icon is sized from.
     */
    const labelNaturalPx =
      HEADER_LEVEL_TO_PX[labelSize || HEADER_SIZE_TO_NUMBER[panelSize]] ?? HEADER_LEVEL_TO_PX[3];
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
    const [labelAvailable, setLabelAvailable] = useState<number | undefined>(undefined);
    const [labelFitRef, labelFitPx] = useFitTextSize<HTMLDivElement>({
      text: typeof label === 'string' ? label : '',
      available: labelAvailable,
      max: labelNaturalPx,
      min: labelMinTextSize,
      enabled: fitLabel !== false && typeof label === 'string' && !labelEffect?.textSize,
    });

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
    useLayoutEffect(() => {
      const node = labelFitRef.current;
      const bar = node?.closest('.reqore-panel-title') as HTMLElement | null;
      const header = bar?.querySelector('.reqore-panel-title-header') as HTMLElement | null;

      if (!fitLabel || !node || !bar || !header) {
        return;
      }

      const barStyle = getComputedStyle(bar);
      const horizontalPadding =
        (parseFloat(barStyle.paddingLeft) || 0) + (parseFloat(barStyle.paddingRight) || 0);
      const barGap = parseFloat(barStyle.columnGap) || parseFloat(barStyle.gap) || 0;

      // Everything on the bar that is not the title's own header.
      const competing = Array.from(bar.children).reduce(
        (total, child) =>
          child === header ? total : total + (child as HTMLElement).getBoundingClientRect().width,
        0
      );
      const barGaps = barGap * Math.max(0, bar.children.length - 1);

      // …and everything inside the header that is not the title itself: the icon, the badge,
      // and the description column's gap.
      const insideHeader = Array.from(header.querySelectorAll(':scope *')).reduce(
        (total, child) => {
          const el = child as HTMLElement;

          return el === node || node.contains(el) || el.contains(node)
            ? total
            : total + (el.parentElement === node.parentElement ? el.getBoundingClientRect().width : 0);
        },
        0
      );

      const next = Math.max(
        0,
        Math.round(bar.clientWidth - horizontalPadding - barGaps - competing - insideHeader)
      );

      setLabelAvailable((current) => (current === next ? current : next));
    }, [fitLabel, label, width, labelFitPx, badge, actions, panelSize]);

    const iconTooltip = useMemo(
      () => ({
        content: label,
      }),
      [label]
    );

    const handleRef = useCallback((ref) => {
      let _ref = ref;

      if (ref?.resizable) {
        _ref = ref.resizable;
      }

      targetRef.current = _ref;
    }, []);

    if (skeleton) {
      return <ReqorePanelSkeleton size={panelSize} isCollapsed={_isCollapsed} />;
    }

    return (
      <ReqoreErrorBoundary {...errorBoundaryOptions}>
        <ReqoreTooltipComponent
          {...omit(rest, ['onResize'])}
          {..._resizable}
          as={rest.as || (!!resizable && !disabled && !_isCollapsed) ? Resizable : 'div'}
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
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Stuck-detection sentinel — 0-height marker at the very top of the
              panel, above the sticky header. See the observer effect above. */}
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
              onClick={handleCollapseClick}
              theme={theme}
              minimal={minimal || opacity === 0}
              size={contentSize || panelSize}
              opacity={minimal ? 0 : opacity ?? 1}
              noHorizontalPadding={noHorizontalPadding}
              responsive={responsiveTitle}
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
              stickyHeaderOffset={rest.stickyHeaderOffset}
              stickyHeaderInset={stickyInset}
              isStuck={isHeaderStuck}
            >
              {hasTitleHeader && (
                <StyledPanelTitleHeader className='reqore-panel-title-header'>
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
                          {hideTitleText ? null : typeof label === 'string' ? (
                            // The measured box is this wrapper, not the heading: as a
                            // `min-width: 0` flex child it reports the width the row actually
                            // left for the title, where the heading would report what the text
                            // wants. `overflow: hidden` is what makes it shrinkable at all.
                            <div
                              ref={labelFitRef}
                              style={{ minWidth: 0, overflow: 'hidden', flex: '0 1 auto' }}
                            >
                            <LabelEditor
                              size={labelSize || panelSize}
                              customTheme={theme}
                              effect={{
                                noWrap: true,
                                ...labelEffect,
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
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
                                  : {}),
                              }}
                              label={label}
                              onSubmit={onLabelEdit}
                              tooltip={showLabelTooltip ? customLabelTooltip || label : undefined}
                            />
                            </div>
                          ) : (
                            label
                          )}
                          {badge || badge === 0 ? (
                            <ButtonBadge
                              size={getOneHigherSize(panelSize)}
                              content={badge}
                              wrapGroup={isSmall}
                              margin={label ? 'left' : 'none'}
                            />
                          ) : null}
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
                      const descriptionRow = description && !hideTitleText ? (
                        <ReqoreSpan
                          className='reqore-panel-title-description'
                          size={panelSize}
                          effect={{ opacity: 0.7, ...descriptionEffect }}
                          intent={descriptionIntent}
                        >
                          {description}
                        </ReqoreSpan>
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
                    size={actionSize}
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
              {hasResponsiveActions(nonFloatingActions) && (
                <ReqoreControlGroup
                  responsive={responsiveActions}
                  // `fitLabel` means "give the title a fair share of the row", and it cannot have
                  // one while this group stretches: measured at 206px to hold 90px of buttons on a
                  // 518px bar, leaving the title 142px. Content-sizing it hands that space back.
                  // The cost is the group's own overflow — `responsive` collapse tests
                  // `scrollWidth > clientWidth`, which a content-sized group never trips, so the
                  // fold into the `…` menu stops happening. That trade rides with the opt-in
                  // rather than being taken on everyone's behalf.
                  fluid={responsiveActions && !fitLabel}
                  horizontalAlign='flex-end'
                  customTheme={theme}
                  size={actionSize}
                  {...responsiveActionsWrapperProps}
                >
                  {nonFloatingActions.map(renderResponsiveActions())}
                </ReqoreControlGroup>
              )}
              <ReqorePanelNonResponsiveActions
                show={showNonResponsiveGroup()}
                isSmall={false}
                showControlButtons
                size={actionSize}
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
              >
                {nonFloatingActions.map(renderNonResponsiveActions())}
              </ReqorePanelNonResponsiveActions>
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
              opacity={minimal ? 0 : opacity ?? 1}
              size={contentSize || panelSize}
              noHorizontalPadding={noHorizontalPadding}
            >
              {hasNonResponsiveActions(leftBottomActions) ? (
                <ReqoreControlGroup size={panelSize} style={{ marginRight: 'auto' }}>
                  {leftBottomActions.map(renderNonResponsiveActions('flex-start'))}
                </ReqoreControlGroup>
              ) : null}
              {hasResponsiveActions(leftBottomActions) && (
                <ReqoreControlGroup
                  fluid={responsiveActions}
                  responsive={responsiveActions}
                  customTheme={theme}
                  size={panelSize}
                  style={{ marginRight: 'auto' }}
                >
                  {leftBottomActions.map(renderResponsiveActions('flex-start'))}
                </ReqoreControlGroup>
              )}
              {hasResponsiveActions(rightBottomActions) && (
                <ReqoreControlGroup
                  fluid={responsiveActions}
                  horizontalAlign='flex-end'
                  responsive={responsiveActions}
                  customTheme={theme}
                  style={{ marginLeft: 'auto' }}
                  size={panelSize}
                >
                  {rightBottomActions.map(renderResponsiveActions())}
                </ReqoreControlGroup>
              )}
              {hasNonResponsiveActions(rightBottomActions) ? (
                <ReqoreControlGroup
                  horizontalAlign='flex-end'
                  size={panelSize}
                  style={{ marginLeft: 'auto' }}
                >
                  {rightBottomActions.map(renderNonResponsiveActions())}
                </ReqoreControlGroup>
              ) : null}
            </StyledPanelBottomActions>
          ) : null}
        </ReqoreTooltipComponent>
      </ReqoreErrorBoundary>
    );
  }
);
