import { REQORE_MARQUEE_HOST, REQORE_MARQUEE_TEXT } from '../../hooks/useMarqueeOnHover';
import { size } from 'lodash';
import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { css, keyframes } from 'styled-components';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import {
  CONTROL_HORIZONTAL_PADDING_FROM_SIZE,
  CONTROL_TEXT_FROM_SIZE,
  CONTROL_VERTICAL_PADDING_FROM_SIZE,
  CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE,
  ICON_FROM_SIZE,
  INDICATOR_SIZE_TO_PX,
  PADDING_FROM_SIZE,
  PILL_RADIUS_MODIFIER,
  resolveRadius,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getColorAtAlpha,
  getDrawnColor,
  getGradientColorList,
  getGradientMix,
  getReadableAccentColorOn,
  getReadableAlpha,
  getReadableColorOn,
  getReadableFadedColor,
  getReadableIconLook,
  getSaturatedTint,
  getThemeSurfaces,
  isAchromatic,
  READABLE_ICON_CONTRAST,
  TReqoreSurface,
} from '../../helpers/colors';
import { shortcutHasModifier, TReqoreKeyboardShortcut } from '../../helpers/shortcuts';
import styled, {
  listReqoreStyleProps,
  omitStyleProps,
  REQORE_CONTROL_GROUP_CHILD_PROPS,
  TReqoreStylePropKeys,
} from '../../helpers/styled';
import { alignToFlexAlign, getOneLessSize } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreEffect } from '../../hooks/useReqoreEffect';
import { useReqoreTheme } from '../../hooks/useTheme';
import { ReqoreSurfaceProvider, useReqoreSurface } from '../../context/SurfaceContext';
import {
  ActiveIconScale,
  DisabledElement,
  InactiveIconScale,
  RaisedElement,
  ReadOnlyElement,
  ScaleIconOnHover,
  StyledActiveContent,
  StyledContent,
  StyledInActiveContent,
  StyledInvisibleContent,
} from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreEffect,
  IWithReqoreLoading,
  IWithReqoreSize,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import {
  getEffectGradientBackgrounds,
  getPrimaryGradient,
  IReqoreEffect,
  ReqoreTextEffect,
  StyledEffect,
  TReqoreColor,
  TReqoreEffectColor,
  TReqoreHexColor,
} from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { splitIconColor } from '../../helpers/iconProps';
import { ReqoreKeyboardShortcut } from '../KeyboardShortcut';
import { ReqoreHorizontalSpacer, ReqoreSpacer } from '../Spacer';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export type TReqoreBadge = string | number | IReqoreTagProps;

export type TReqoreButtonIndicatorPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export interface IReqoreButtonIndicatorProps {
  /** Intent used to tint the dot. Resolved from the button's theme intents. Defaults to `danger`. */
  intent?: TReqoreIntent;
  /** Explicit color override. Takes precedence over `intent`. */
  color?: TReqoreColor;
  /** Animate the dot with an expanding, fading pulse ring. Defaults to `false` (static). */
  pulse?: boolean;
  /** Corner the dot is anchored to. Defaults to `top-right`. */
  position?: TReqoreButtonIndicatorPosition;
}

const indicatorPulseKeyframes = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.55;
  }
  70% {
    opacity: 0;
  }
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
`;

export interface IReqoreButtonIndicatorStyle {
  $color: TReqoreColor;
  $diameter: number;
  $offset: number;
  $position: TReqoreButtonIndicatorPosition;
  $pulse?: boolean;
}

export const StyledButtonIndicator = styled.span<IReqoreButtonIndicatorStyle>`
  position: absolute;
  z-index: 2;
  width: ${({ $diameter }) => $diameter}px;
  height: ${({ $diameter }) => $diameter}px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  pointer-events: none;

  ${({ $position, $offset }) => {
    const [vertical, horizontal] = $position.split('-');

    return css`
      ${vertical}: ${$offset}px;
      ${horizontal}: ${$offset}px;
    `;
  }}

  ${({ $pulse, $color }) =>
    $pulse
      ? css`
          &::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background-color: ${$color};
            animation: ${indicatorPulseKeyframes} 1.6s ease-out infinite;
          }
        `
      : undefined};
`;

/**
 * The `<button>` attributes a form reads. `React.HTMLAttributes` (which the button props
 * extend) has none of them, so without these a button could not be a named submit, a reset,
 * or a button that must NOT submit the form it sits in.
 */
export type TReqoreButtonFormAttributes = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'type'
  | 'name'
  | 'value'
  | 'form'
  | 'formAction'
  | 'formEncType'
  | 'formMethod'
  | 'formNoValidate'
  | 'formTarget'
>;

/** The `<a>` attributes a button rendered as a link takes (see `href`). */
export type TReqoreButtonLinkAttributes = Pick<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'rel' | 'download' | 'hrefLang' | 'referrerPolicy'
>;

/**
 * Button props for the primary Reqore action component.
 *
 * Form attributes (`type`, `name`, `value`, `form`, `formAction`, …) reach the `<button>`.
 * There is deliberately NO default `type`: a button inside a `<form>` submits it, as an HTML
 * button does and as a `ReqoreButton` always has — pass `type='button'` for one that must not.
 *
 * `href` renders the button as a real link (`<a href>`), so middle-click, "open in a new tab"
 * and the browser's link semantics work; `target`, `rel`, `download` go with it. A disabled
 * link drops its `href` and is marked `aria-disabled`.
 */
export interface IReqoreButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    TReqoreButtonFormAttributes,
    TReqoreButtonLinkAttributes,
    IReqoreDisabled,
    IReqoreIntent,
    IReqoreReadOnly,
    IWithReqoreLoading,
    IWithReqoreEffect {
  icon?: IReqoreIconName;
  size?: TSizes;
  minimal?: boolean;
  transparent?: boolean;
  tooltip?: TReqoreTooltipProp;
  fluid?: boolean;
  fixed?: boolean;
  alignSelf?: React.CSSProperties['alignSelf'];
  active?: boolean;
  flat?: boolean;
  animated?: boolean;

  compact?: boolean;
  verticalPadding?: TSizes;

  rightIcon?: IReqoreIconName;
  customTheme?: IReqoreCustomTheme;
  wrap?: boolean;
  badge?: TReqoreBadge | TReqoreBadge[];

  /**
   * Renders a small dot in a corner of the button to signal importance or a
   * pending event (unread items, a required action, a live status). Distinct
   * from `badge`, which renders content tags inside the button.
   *
   * Pass `true` for a static, danger-tinted dot in the top-right corner, or an
   * object to customize the `intent`/`color`, enable the `pulse` animation, and
   * pick the `position`.
   */
  indicator?: boolean | IReqoreButtonIndicatorProps;

  /**
   * Keyboard shortcut that triggers the button's `onClick`, following the
   * `react-hotkeys-hook` syntax (e.g. `'mod+k'`, `'ctrl+shift+s'`, or an array
   * of alternatives). The `mod` modifier maps to `⌘` on macOS and `Ctrl`
   * elsewhere. Combos that include a modifier also fire while a form field is
   * focused; bare single-key shortcuts do not, to avoid clashing with typing.
   */
  shortcut?: TReqoreKeyboardShortcut;
  /**
   * Whether to render the badge-style hint for `shortcut`. Defaults to `true`,
   * unless globally disabled via the `shortcutHints` UI option.
   */
  shortcutHint?: boolean;

  /**
   * Secondary line under the label.
   *
   * A NODE, not only a string: a menu row's description is prose, and a host
   * that writes its descriptions in markdown has to be able to hand over the
   * drawn result. Every use of this prop here is either a truthiness test in a
   * styled interpolation or `{description}` inside a `ReqoreTextEffect`, and
   * styled-components filters the prop off the DOM element, so a node is drawn
   * exactly where a string was.
   */
  description?: React.ReactNode;
  maxWidth?: string;
  textAlign?: 'left' | 'center' | 'right';
  iconsAlign?: 'center' | 'sides';
  iconColor?: TReqoreEffectColor;
  leftIconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  leftIconProps?: IReqoreIconProps;
  rightIconProps?: IReqoreIconProps;
  labelEffect?: IReqoreEffect;
  descriptionEffect?: IReqoreEffect;
  label?: React.HTMLAttributes<HTMLButtonElement>['children'];
  as?: string | React.ElementType;
  grow?: 0 | 1 | 2 | 3 | 4;
  shrink?: 0 | 1 | 2 | 3 | 4;
  rounded?: boolean;
  /**
   * Override the size used to derive the button's border-radius. Defaults to `size`.
   * Useful for marketing-style buttons that want a generous radius with a normal text scale.
   */
  radiusSize?: TSizes;

  pill?: boolean;
  circle?: boolean;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border); suppressed when a border is
   * rendered (`flat={false}`) since the border already provides definition,
   * and suppressed when `transparent` since there is no surface to lift.
   */
  raised?: boolean;
  /**
   * Square chip mode — forces the button to render as a fixed-size square
   * (width = height, both derived from the current `size`), and strips
   * horizontal padding so single-character or icon-only content sits
   * centred. Useful for grids of uniform toggle chips like day-of-week
   * pickers (`M T W T F S S`) where every chip must occupy the same slot
   * regardless of content width.
   *
   * Composes with `size` (drives the side length via `SIZE_TO_PX[size]`),
   * `flat`, `minimal`, `raised`, `active`, `intent`, and `customTheme`.
   * Overrides `fluid`, `grow`, `shrink`, and any inline width — the whole
   * point is that neighbouring chips stay in a rigid grid.
   */
  square?: boolean;
}

export interface IReqoreButtonStyle extends IReqoreButtonProps {
  theme: IReqoreTheme;
  /** What the button is drawn on (`useReqoreSurface`): the theme's surface when not known. */
  $surface?: TReqoreSurface;
  animate?: boolean;
  color?: TReqoreHexColor;
  /** Rendered as an `<a>`: no underline from the browser's link style. */
  $isLink?: boolean;
  /** What the button is painted with, worked out once per render (`getButtonPaint`). */
  $paint?: IReqoreButtonPaint;
}

const getButtonMainColor = (
  theme: IReqoreTheme,
  color?: TReqoreHexColor,
  effect?: IReqoreEffect
) => {
  const primary = getPrimaryGradient(effect?.gradient);
  if (primary) {
    return getGradientMix(theme, primary.colors);
  }

  if (color) {
    return color;
  }

  return theme.main;
};

/** A button at rest, under the pointer, or pressed (`active`). */
type TReqoreButtonState = 'rest' | 'hover' | 'active';

/** What a button's colors are worked out from. */
type TReqoreButtonColorProps = Pick<
  IReqoreButtonStyle,
  'theme' | 'color' | 'minimal' | 'transparent' | 'effect' | '$surface'
>;

interface IReqoreButtonColors {
  /** What the button is drawn on, as the browser draws it: one color, or each color of its gradient. */
  backgrounds: TReqoreHexColor[];
  /** Its text, which stands out from every one of them. */
  text: TReqoreHexColor;
}

/**
 * What a button is drawn on and in, in a state. The background as it is drawn: a minimal button's wash and a
 * translucent color (the muted intent) blended over the theme the button sits on, a transparent button as that
 * theme, a gradient as each of its colors. The text is picked against that, and stands out from all of it by 4.5:1;
 * a minimal or transparent button with a color of its own keeps the color in its text, in a shade that reads.
 */
export const getButtonColors = (
  { theme, color, minimal, transparent, effect, $surface }: TReqoreButtonColorProps,
  state: TReqoreButtonState = 'rest'
): IReqoreButtonColors => {
  const main = getButtonMainColor(theme, color, effect);
  // what the button is drawn on: one color, or each color of a gradient
  const unders = getThemeSurfaces(theme, $surface);
  const outlined = minimal || transparent;
  const gradient = getPrimaryGradient(effect?.gradient);
  // an outlined button's text starts from a light tint of its color, lighter hovered
  const tintAmount = state === 'hover' ? 0.9 : 0.8;
  let fills: string[];

  if (gradient && !transparent) {
    const stops = getGradientColorList(theme, gradient.colors);

    if (minimal) {
      // as a minimal gradient is painted: a translucent fill over a translucent ring over the button's wash
      const painted = unders.flatMap((under) =>
        getEffectGradientBackgrounds(
          theme,
          gradient.colors,
          true,
          getColorAtAlpha(main, 0.2),
          under
        )
      );

      return {
        backgrounds: painted,
        text: isAchromatic(main)
          ? getReadableColorOn(painted, state === 'rest')
          : getReadableAccentColorOn(getSaturatedTint(main, tintAmount), painted),
      };
    }

    // as the effect draws it: its colors at rest, each a step lighter hovered or pressed
    fills = state === 'rest' ? stops : stops.map((stop) => changeLightness(stop, 0.05));
  } else if (state === 'active') {
    fills = [changeLightness(main, 0.1)];
  } else if (state === 'hover') {
    fills = [getButtonHoverFill(theme, color, main, minimal, transparent)];
  } else {
    fills = [getButtonRestFill(color, main, minimal, transparent)];
  }

  const backgrounds = unders.flatMap((under) =>
    fills.map((fill) => (fill === 'transparent' ? under : getDrawnColor(fill, under)))
  );
  const dim = state === 'rest';
  let text: TReqoreHexColor;

  if (outlined && state !== 'active' && !isAchromatic(main)) {
    // a color the helpers cannot read (a CSS variable) is as it is given: the text is written in it
    text = getReadableAccentColorOn(getSaturatedTint(main, tintAmount), backgrounds);
  } else {
    text = getReadableColorOn(backgrounds, dim);
  }

  return { backgrounds, text };
};

/**
 * The fill a button paints at rest: nothing when transparent, a wash of its color when minimal (one the helpers
 * cannot read, a CSS variable, is washed by the browser), else its color.
 */
const getButtonRestFill = (
  color: TReqoreHexColor | undefined,
  main: TReqoreHexColor,
  minimal?: boolean,
  transparent?: boolean
): string => (transparent ? 'transparent' : minimal ? getColorAtAlpha(main, 0.2) : color || main);

/** The fill a button paints hovered: a stronger wash when minimal or transparent, else its color a step lighter. */
const getButtonHoverFill = (
  theme: IReqoreTheme,
  color: TReqoreHexColor | undefined,
  main: TReqoreHexColor,
  minimal?: boolean,
  transparent?: boolean
): string =>
  minimal || transparent
    ? getColorAtAlpha(changeLightness(main, 0.1), transparent ? 0.2 : 0.4)
    : changeLightness(getButtonMainColor(theme, color), 0.05);

/** A button's colors in each state it is drawn in: at rest, hovered (when it is not active), and active. */
export interface IReqoreButtonStateColors {
  rest: IReqoreButtonColors;
  hover?: IReqoreButtonColors;
  active?: IReqoreButtonColors;
}

/**
 * How a button draws an icon, at rest and hovered alike: in its own color (`color`, in a shade that stands out by
 * 3:1) or the button's text color, at `CONTROL_ICON_OPACITY` or as much more as it needs to stand out by 3:1.
 */
export const getButtonIconLook = (
  style: TReqoreButtonColorProps,
  color?: TReqoreEffectColor,
  active?: boolean
): { color?: TReqoreHexColor; opacity: number } =>
  getButtonIconLookIn(style.theme, getButtonStateColors(style, active), color);

/** `getButtonIconLook`, from the button's colors worked out already (`IReqoreButtonStateColors`). */
const getButtonIconLookIn = (
  theme: IReqoreTheme,
  states: IReqoreButtonStateColors,
  color?: TReqoreEffectColor
): { color?: TReqoreHexColor; opacity: number } => {
  // an active button (a selected menu item) is drawn in its fill, hovered or not
  const rest = states.active ?? states.rest;
  const hover = states.active ?? states.hover ?? rest;
  const look = getReadableIconLook(
    theme,
    [...rest.backgrounds, ...hover.backgrounds],
    rest.text,
    CONTROL_ICON_OPACITY,
    color
  );

  // hovered, the text (which an icon without a color of its own is drawn in) may be another color
  return look.color
    ? look
    : {
        opacity: Math.max(
          look.opacity,
          getReadableAlpha(
            hover.text,
            hover.backgrounds,
            CONTROL_ICON_OPACITY,
            READABLE_ICON_CONTRAST
          )
        ),
      };
};

/** What a button's styles paint it with, worked out once per render (`getButtonPaint`), not in each style rule. */
export interface IReqoreButtonPaint {
  /** Its fill and text at rest. */
  background: string;
  text: TReqoreHexColor;
  /** Its color a step lighter: the edge (`flat={false}`), the focus ring and an active button's fill. */
  edge: string;
  /** The ring drawn while it is hovered or pressed, and its edge then. */
  ring: string;
  /** Hovered (not when active): its fill and text. */
  hoverBackground?: string;
  hoverText?: TReqoreHexColor;
  /** Active (a selected menu item): its text and edge, at rest and hovered. */
  activeText?: TReqoreHexColor;
  activeEdge: string;
  activeHoverEdge: string;
  /** The description's color, faded as far as it still reads (with a description only). */
  description?: string;
}

/**
 * A button's colors in the states it is drawn in (`IReqoreButtonStateColors`): at rest, and hovered or - when it
 * is `active` - active.
 */
export const getButtonStateColors = (
  style: TReqoreButtonColorProps,
  active?: boolean
): IReqoreButtonStateColors => ({
  rest: getButtonColors(style),
  hover: active ? undefined : getButtonColors(style, 'hover'),
  active: active ? getButtonColors(style, 'active') : undefined,
});

/**
 * Everything a button is painted with (`IReqoreButtonPaint`), from its colors in each state. `description`: whether
 * it has one, whose color is then worked out too.
 */
export const getButtonPaint = (
  style: TReqoreButtonColorProps,
  states: IReqoreButtonStateColors,
  description?: boolean
): IReqoreButtonPaint => {
  const { theme, color, minimal, transparent, effect } = style;
  const main = getButtonMainColor(theme, color, effect);
  const drawn = states.active ?? states.rest;

  return {
    background: transparent ? 'transparent' : minimal ? getColorAtAlpha(main, 0.2) : color,
    text: states.rest.text,
    edge: changeLightness(main, 0.1),
    ring: changeLightness(main, 0.25),
    hoverBackground: states.hover
      ? getButtonHoverFill(theme, color, main, minimal, transparent)
      : undefined,
    hoverText: states.hover?.text,
    activeText: states.active?.text,
    activeEdge: changeLightness(main, 0.175),
    activeHoverEdge: changeLightness(main, 0.275),
    // on the button as it is drawn: at rest, or filled when active (a selected menu item)
    description: description
      ? getReadableFadedColor(drawn.text, drawn.backgrounds, 0.7)
      : undefined,
  };
};

/**
 * What a styled button is painted with: what the button worked out for this render, or - a `StyledButton`
 * rendered on its own - worked out from its props.
 */
const getStyledButtonPaint = (props: IReqoreButtonStyle): IReqoreButtonPaint =>
  props.$paint ??
  getButtonPaint(props, getButtonStateColors(props, props.active), !!props.description);

export const StyledAnimatedTextWrapper = styled.span`
  min-width: 5px;
  overflow: hidden;
  position: relative;
  text-align: ${({ textAlign }) => textAlign};
  display: flex;
  flex-flow: column;
  align-items: ${({ textAlign }) => alignToFlexAlign(textAlign)};
`;

/**
 * Every button prop that only styles the button. None of them reaches the rendered element —
 * the `<button>`, the `<a>`, or a component given as `as` (a router link writes every prop it does
 * not know onto its `<a>`). The compiler checks the record against `IReqoreButtonStyle`, so a new
 * styling prop that is not added here fails the build instead of leaking.
 */
export const REQORE_BUTTON_STYLE_PROPS = listReqoreStyleProps<
  TReqoreStylePropKeys<
    IReqoreButtonStyle,
    React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>
  >
>({
  active: true,
  alignSelf: true,
  animate: true,
  animated: true,
  badge: true,
  circle: true,
  compact: true,
  customTheme: true,
  description: true,
  descriptionEffect: true,
  effect: true,
  fixed: true,
  flat: true,
  fluid: true,
  grow: true,
  icon: true,
  iconColor: true,
  iconsAlign: true,
  indicator: true,
  intent: true,
  label: true,
  labelEffect: true,
  leftIconColor: true,
  leftIconProps: true,
  loading: true,
  loadingIconType: true,
  maxWidth: true,
  minimal: true,
  pill: true,
  radiusSize: true,
  raised: true,
  readOnly: true,
  rightIcon: true,
  rightIconColor: true,
  rightIconProps: true,
  rounded: true,
  shortcut: true,
  shortcutHint: true,
  shrink: true,
  size: true,
  skeleton: true,
  square: true,
  textAlign: true,
  theme: true,
  tooltip: true,
  transparent: true,
  verticalPadding: true,
  wrap: true,
});

export const StyledButton = styled(StyledEffect).withConfig({
  // Its own styling props, and the layout flags a containing ControlGroup hands it (`fill`, its
  // place in a stack, ...); `color` is the button's colour, read by its styles.
  shouldForwardProp: omitStyleProps(
    ...REQORE_BUTTON_STYLE_PROPS,
    ...REQORE_CONTROL_GROUP_CHILD_PROPS,
    'color'
  ),
})<IReqoreButtonStyle>`
  display: flex;
  flex-flow: column;
  justify-content: center;
  /* The page's font (or the theme's, which the layout sets), not the browser's control font:
     a button left to the user-agent stylesheet renders in the platform's form-control face
     whatever font the text around it is in. */
  font-family: inherit;
  font-weight: 570;
  position: relative;
  overflow: hidden;
  vertical-align: middle;
  border: ${(props: IReqoreButtonStyle) =>
    !props.flat ? `1px solid ${getStyledButtonPaint(props).edge}` : 0};
  padding: ${({ size, compact, verticalPadding = 'normal', square }) =>
    `${
      CONTROL_VERTICAL_PADDING_FROM_SIZE[size] +
      CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE[verticalPadding]
    }px ${
      square
        ? 0
        : compact
        ? CONTROL_VERTICAL_PADDING_FROM_SIZE[size]
        : CONTROL_HORIZONTAL_PADDING_FROM_SIZE[size]
    }px`};
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;
  outline-offset: -2px;

  min-height: ${({ size, verticalPadding = 'normal' }) =>
    SIZE_TO_PX[size] + CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE[verticalPadding] * 2}px;
  min-width: ${({ size, square, verticalPadding = 'normal' }) =>
    square
      ? SIZE_TO_PX[size] + CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE[verticalPadding] * 2
      : SIZE_TO_PX[size]}px;
  ${({ square, size, verticalPadding = 'normal' }) =>
    square
      ? css`
          width: ${SIZE_TO_PX[size] +
          CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE[verticalPadding] * 2}px;
        `
      : null}
  max-width: ${({ square, maxWidth, fluid, fixed, size, verticalPadding = 'normal' }) =>
    square
      ? `${
          SIZE_TO_PX[size] + CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE[verticalPadding] * 2
        }px`
      : maxWidth || (fluid && !fixed ? '100%' : undefined)};

  ${({ wrap, description }) =>
    !wrap && !description
      ? css`
          max-height: ${({ size, verticalPadding = 'normal' }) =>
            SIZE_TO_PX[size] + CONTROL_VERTICAL_PADDING_MODIFIER_FROM_SIZE[verticalPadding] * 2}px;
        `
      : null}

  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  flex-shrink: ${({ shrink }) => shrink};
  flex-grow: ${({ grow }) => grow};
  align-self: ${({ alignSelf, fixed, fluid }) =>
    alignSelf ?? (fixed ? 'flex-start' : fluid ? 'stretch' : undefined)};

  border-radius: ${({ size, radiusSize, rounded, pill, circle }) =>
    rounded === false
      ? undefined
      : circle
      ? '9999px'
      : `${resolveRadius(size, radiusSize) * (pill ? PILL_RADIUS_MODIFIER : 1)}px`};

  background-color: ${(props: IReqoreButtonStyle) => getStyledButtonPaint(props).background};

  color: ${(props: IReqoreButtonStyle) => getStyledButtonPaint(props).text};

  ${InactiveIconScale};

  ${({ raised, flat, transparent }) => raised && flat && !transparent && RaisedElement}

  ${(props: IReqoreButtonStyle) => {
    const { readOnly, animate, active, flat } = props;

    if (readOnly || active) {
      return readOnly
        ? css`
            ${ReadOnlyElement};
          `
        : undefined;
    }

    const { ring, hoverBackground, hoverText } = getStyledButtonPaint(props);

    return css`
      &:not(:disabled) {
        ${ScaleIconOnHover}

        cursor: pointer;
        transition: all 0.2s ease-out;

        &:active {
          outline: 3px solid ${ring};
          outline-offset: -3px;
          transition: none;
        }

        &:hover:not(:active) {
          outline: 2px solid ${ring};
          transition: none;
        }

        &:hover,
        &:active {
          border-color: ${flat ? undefined : ring};
          background-color: ${hoverBackground};
          /* Ended here: the animated content's rules below ran on into this declaration, which the
             browser then dropped - a hovered button kept its resting text on its hovered fill. */
          color: ${hoverText};

          ${animate
            ? css`
                cursor: pointer;

                ${StyledInActiveContent} {
                  transform: translateY(150%);
                  filter: blur(10px);
                  opacity: 0;
                }

                ${StyledActiveContent} {
                  transform: translateY(0px);
                  filter: blur(0);
                  opacity: 1;
                }
              `
            : undefined};
        }
      }
    `;
  }};

  ${(props: IReqoreButtonStyle) => {
    if (props.active) {
      const { flat } = props;
      const { edge, activeText, activeEdge, activeHoverEdge } = getStyledButtonPaint(props);

      return css`
        cursor: pointer;
        background-color: ${edge};
        color: ${activeText};
        border-color: ${flat ? undefined : activeEdge};

        &:hover,
        &:active,
        &:focus {
          border-color: ${flat ? undefined : activeHoverEdge};
        }

        ${ActiveIconScale}
      `;
    }
  }};

  &:disabled {
    ${DisabledElement};
  }

  ${({ $isLink }) =>
    $isLink
      ? css`
          text-decoration: none;

          /* A link has no :disabled; a disabled one says so with aria-disabled. */
          &[aria-disabled='true'] {
            ${DisabledElement};
          }
        `
      : undefined}

  &:focus,
  &:active {
    outline: 2px solid ${(props: IReqoreButtonStyle) => getStyledButtonPaint(props).edge};
    border-color: ${(props: IReqoreButtonStyle) =>
      props.minimal ? undefined : getStyledButtonPaint(props).edge};
  }

  .reqore-button-description {
    padding-top: ${({ size }) => PADDING_FROM_SIZE[size] / 2}px;
    /* on the button as it is drawn: at rest, or filled when active (a selected menu item) */
    color: ${(props: IReqoreButtonStyle) => getStyledButtonPaint(props).description};
  }
`;

export const StyledButtonContent = styled.div.withConfig({
  shouldForwardProp: omitStyleProps('wrap'),
})`
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  min-width: ${({ size }) => ICON_FROM_SIZE[size]}px;
  flex: 1;
  flex-shrink: 0;

  ${({ wrap, description }) =>
    !wrap && !description
      ? css`
          max-height: ${({ size }) => SIZE_TO_PX[size]}px;
        `
      : null}
`;

export interface IReqoreButtonBadgeProps extends IWithReqoreSize {
  color?: TReqoreEffectColor;
  theme?: IReqoreTheme;
  content?: TReqoreBadge | TReqoreBadge[];
  wrap?: boolean;
  wrapGroup?: boolean;
  compact?: boolean;
  active?: boolean;
  margin?: 'left' | 'none';
}

export const ButtonBadge = memo(
  ({
    wrapGroup,
    compact,
    active,
    margin = 'left',
    // Without a size the spacer before the badge computed `NaNpx`.
    size: badgeSize = 'normal',
    ...rest
  }: IReqoreButtonBadgeProps) => {
    const props = { ...rest, size: badgeSize };
    const renderTag = useCallback(
      ({ size, color, theme, content, key }: IReqoreButtonBadgeProps & { key: number }) => (
        <ReqoreTag
          key={key}
          size={getOneLessSize(size)}
          asBadge
          color={color}
          customTheme={theme}
          className='reqore-button-badge'
          labelAlign='center'
          minimal={!active && !(content as IReqoreTagProps)?.effect?.gradient}
          {...(typeof content === 'string' || typeof content === 'number'
            ? { label: content }
            : (content as IReqoreTagProps))}
        />
      ),
      // The tag is built from its arguments; only `active` comes from the closure.
      [active]
    );

    const content = useMemo(
      () => (Array.isArray(rest.content) ? rest.content : [rest.content]),
      [rest.content]
    );

    const leftBadges = useMemo(
      () =>
        content.filter(
          (badge) => typeof badge === 'string' || typeof badge === 'number' || !badge?.align
        ),
      [content]
    );

    const rightBadges = useMemo(
      () =>
        content.filter(
          (badge) =>
            typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'right'
        ),
      [content]
    );

    const middleBadges = useMemo(
      () =>
        content.filter(
          (badge) =>
            typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'center'
        ),
      [content]
    );

    const buildContent = useCallback((badge: TReqoreBadge) => {
      if (typeof badge === 'string' || typeof badge === 'number') {
        return { label: badge, align: undefined };
      }

      return { ...badge, align: undefined };
    }, []);

    return (
      <>
        {margin === 'left' && (
          <ReqoreSpacer
            width={props.wrap ? undefined : PADDING_FROM_SIZE[props.size] / (compact ? 2 : 1)}
            height={!props.wrap ? undefined : PADDING_FROM_SIZE[props.size] / 2}
          />
        )}
        {size(leftBadges) ? (
          <ReqoreTagGroup wrap={wrapGroup} align='left'>
            {leftBadges.map((badge, index) =>
              renderTag({ ...props, content: buildContent(badge), key: index })
            )}
          </ReqoreTagGroup>
        ) : null}
        {size(middleBadges) ? (
          <ReqoreTagGroup wrap={wrapGroup} fluid align='center'>
            {middleBadges.map((badge, index) =>
              renderTag({ ...props, content: buildContent(badge), key: index })
            )}
          </ReqoreTagGroup>
        ) : null}
        {size(rightBadges) ? (
          <ReqoreTagGroup wrap={wrapGroup} align='right'>
            {rightBadges.map((badge, index) =>
              renderTag({ ...props, content: buildContent(badge), key: index })
            )}
          </ReqoreTagGroup>
        ) : null}
      </>
    );
  }
);

/**
 * Primary Reqore button component that supports intents, icons, and badges.
 */
const ReqoreButton = memo(
  forwardRef<HTMLButtonElement, IReqoreButtonProps>(
    (
      {
        icon,
        size = 'normal',
        minimal,
        transparent,
        children,
        tooltip,
        className,
        fluid,
        fixed,
        alignSelf,
        intent,
        active,
        flat,
        rightIcon,
        customTheme,
        wrap,
        readOnly,
        badge,
        indicator,
        description,
        maxWidth,
        textAlign: textAlignProp,
        effect,
        labelEffect,
        descriptionEffect,
        leftIconColor,
        rightIconColor,
        iconColor,
        iconsAlign: iconsAlignProp,
        leftIconProps,
        rightIconProps,
        label,
        compact,
        square,
        as,
        animated,
        loading,
        shortcut,
        shortcutHint,
        loadingIconType,
        href,
        type,
        ...rest
      }: IReqoreButtonProps,
      ref
    ) => {
      const animations = useReqoreProperty('animations');
      const shortcutHintsEnabled = useReqoreProperty('shortcutHints');
      const theme = useReqoreTheme('main', customTheme, intent);
      const surface = useReqoreSurface();
      const fixedEffect = useReqoreEffect('buttons', theme, effect);
      const { targetRef, setRef } = useCombinedRefs(ref);

      // Square chips have no horizontal padding, so the content would
      // stick to the left edge if we kept `textAlign`'s usual `'left'`
      // default. Default `textAlign` and `iconsAlign` to `'center'` for
      // square buttons so text + icons sit in the middle of the chip.
      // Consumer can still override both explicitly.
      const textAlign = textAlignProp ?? (square ? 'center' : 'left');
      const iconsAlign = iconsAlignProp ?? (square ? 'center' : undefined);

      const shortcutEnabled = !!shortcut && !rest.disabled && !readOnly && !loading;

      useHotkeys(
        shortcut ?? [],
        (event) => {
          event.preventDefault();
          (targetRef.current as HTMLButtonElement)?.click();
        },
        {
          enabled: shortcutEnabled,
          enableOnFormTags: shortcut ? shortcutHasModifier(shortcut) : false,
          preventDefault: true,
        },
        [shortcut, shortcutEnabled]
      );

      const showShortcutHint =
        !!shortcut && shortcutHint !== false && shortcutHintsEnabled !== false;

      // An `href` makes the button a link, unless the caller picked the element themselves
      // (`as`). A link has no `disabled` and no form `type`: a disabled one keeps no `href`
      // to follow and says so with `aria-disabled` instead.
      const element = as || (href !== undefined ? 'a' : 'button');
      const isLink = element === 'a';
      const elementProps = useMemo(
        () =>
          isLink
            ? {
                href: rest.disabled ? undefined : href,
                disabled: undefined,
                'aria-disabled': rest.disabled || undefined,
                $isLink: true,
              }
            : // Only the keys that were given: a custom `as` (a router link, say) that derives
              // its own `href` must not receive an injected `href={undefined}`.
              {
                ...(href !== undefined ? { href } : {}),
                ...(type !== undefined ? { type } : {}),
              },
        [isLink, href, type, rest.disabled]
      );

      // If color or intent was specified, set the color
      const customColor = useMemo(
        () => (intent ? theme.main : changeLightness(theme.main, 0.07)),
        [intent, theme.main]
      );
      const _flat = minimal ? flat : flat === true;
      const _children = useMemo(() => label || children, [label, children]);
      const _compact = compact ?? theme.buttons?.compact ?? !children;
      const hasLeftIcon = icon || leftIconProps?.image;
      const hasRightIcon = rightIcon || rightIconProps?.image;

      const hasRightAlignedBadge = useMemo(() => {
        if (Array.isArray(badge)) {
          return badge.some(
            (badge) =>
              typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'right'
          );
        }

        return typeof badge !== 'string' && typeof badge !== 'number' && badge?.align === 'right';
      }, [badge]);

      const animate = animated === true || (animations.buttons && animated !== false);
      const leftIcon: IReqoreIconName = loading
        ? `Loader${loadingIconType || ''}Line`
        : icon || leftIconProps?.icon;
      const memoEffect = useMemo(
        () => ({
          interactive: !readOnly && !rest.disabled,
          ...fixedEffect,
          gradient: intent ? undefined : fixedEffect?.gradient,
        }),
        [fixedEffect, intent, readOnly, rest.disabled]
      );
      /* The button's colors depend on its gradient alone of its effect: an effect the caller writes inline (a new
         object each render) with the same gradient keeps them. */
      const gradientKey = memoEffect?.gradient ? JSON.stringify(memoEffect.gradient) : undefined;
      // The icons stand out from what the button is drawn on, as its text does.
      const colorProps: TReqoreButtonColorProps = useMemo(
        () => ({
          theme,
          color: customColor,
          minimal,
          transparent,
          effect: memoEffect,
          $surface: surface,
        }),
        [theme, customColor, minimal, transparent, gradientKey, surface]
      );
      /* Its colors in the states it is drawn in, and what its styles paint it with, worked out once per render
         rather than in each of its style rules. */
      const states = useMemo(() => getButtonStateColors(colorProps, active), [colorProps, active]);
      // whether it has a description, not the description: a node given inline is new each render
      const hasDescription = !!description;
      const paint = useMemo(
        () => getButtonPaint(colorProps, states, hasDescription),
        [colorProps, states, hasDescription]
      );
      // an icon's own color: in its props (which win, as they are spread over the rest), else the button's
      const [leftIconPropsColor, leftIconRest] = splitIconColor(leftIconProps);
      const [rightIconPropsColor, rightIconRest] = splitIconColor(rightIconProps);
      const leftIconOwn = leftIconPropsColor || leftIconColor || iconColor;
      const rightIconOwn = rightIconPropsColor || rightIconColor || iconColor;
      // only for the icons the button draws
      const leftIconLook = useMemo(
        () => (hasLeftIcon ? getButtonIconLookIn(theme, states, leftIconOwn) : undefined),
        [hasLeftIcon, theme, states, leftIconOwn]
      );
      const rightIconLook = useMemo(
        () => (hasRightIcon ? getButtonIconLookIn(theme, states, rightIconOwn) : undefined),
        [hasRightIcon, theme, states, rightIconOwn]
      );
      /* What the button holds (its badges, a label given as a node) is drawn on the button: at rest, or in its
         fill when it is active (a selected menu item, whose badges were picked for the resting wash). */
      const restingBackground = (states.active ?? states.rest).backgrounds;
      /* Its effect's color is written on its own fill, at rest and hovered (or active), not on the surface
         around it: an info text on a success button was read on the page, 2.7:1 on the green. */
      const fillBackgrounds = useMemo(
        () =>
          states.active
            ? states.active.backgrounds
            : [...states.rest.backgrounds, ...(states.hover?.backgrounds ?? [])],
        [states]
      );
      // one object for as long as the opacity holds: an icon is a memo component
      const leftIconEffect = useMemo(
        () => ({ opacity: leftIconLook?.opacity }),
        [leftIconLook?.opacity]
      );
      const rightIconEffect = useMemo(
        () => ({ opacity: rightIconLook?.opacity }),
        [rightIconLook?.opacity]
      );

      const indicatorConfig = useMemo(() => {
        if (!indicator) {
          return undefined;
        }

        const config: IReqoreButtonIndicatorProps = indicator === true ? {} : indicator;
        const diameter = INDICATOR_SIZE_TO_PX[size];

        return {
          color: config.color ?? theme.intents?.[config.intent ?? 'danger'] ?? theme.intents?.danger,
          diameter,
          offset: Math.round(diameter * 0.6),
          position: config.position ?? 'top-right',
          pulse: config.pulse ?? false,
        };
      }, [indicator, size, theme.intents]);

      return (
        <ReqoreTooltipComponent
          {...{
            ...rest,
            effect: memoEffect,
            // The caller's tab stop wins — a grid or a diagram keeps one of its
            // buttons in the tab order and moves it — except that a disabled
            // button is never one.
            tabIndex: rest.disabled ? -1 : (rest.tabIndex ?? 0),
            ...elementProps,
            as: element,
            theme,
            fluid,
            fixed,
            alignSelf,
            maxWidth,
            minimal,
            transparent,
            size,
            intent,
            color: customColor,
            $surface: surface,
            $backgrounds: fillBackgrounds,
            $paint: paint,
            animate,
            flat: _flat,
            active,
            readOnly: readOnly || loading,
            wrap,
            description,
            className: `${className || ''} reqore-control reqore-button`,
            compact: _compact,
            square,
            tooltip,
            // The label lives in two copies that swap on hover; hovering anywhere
            // on the button scrolls a clipped label in both (see useMarqueeOnHover).
            ...REQORE_MARQUEE_HOST,
          }}
          Component={StyledButton}
          ref={setRef}
        >
          <ReqoreSurfaceProvider color={restingBackground}>
            <StyledButtonContent size={size} wrap={wrap} description={description} flat={_flat}>
              {hasLeftIcon ? (
                <>
                  <ReqoreIcon
                    size={size}
                    color={leftIconLook?.color ?? leftIconOwn}
                    compact
                    effect={leftIconEffect}
                    {...leftIconRest}
                    style={
                      textAlign !== 'left' || iconsAlign === 'center' || !_children
                        ? {
                            marginRight: iconsAlign !== 'center' || !_children ? 'auto' : undefined,
                            marginLeft:
                              iconsAlign === 'center' ||
                              !_children ||
                              (textAlign === 'center' && !_children)
                                ? 'auto'
                                : undefined,
                          }
                        : undefined
                    }
                    animation={loading ? 'spin' : leftIconProps?.animation}
                    icon={leftIcon}
                  />
                  {_children || hasRightIcon ? (
                    <ReqoreSpacer width={PADDING_FROM_SIZE[size] / 2} />
                  ) : null}
                </>
              ) : _children ? (
                <ReqoreHorizontalSpacer
                  width={1}
                  style={textAlign !== 'left' ? { marginRight: 'auto' } : undefined}
                />
              ) : null}
              {_children && (
                <StyledAnimatedTextWrapper
                  textAlign={textAlign}
                  style={
                    textAlign === 'center' && iconsAlign !== 'center'
                      ? { margin: 'auto' }
                      : undefined
                  }
                >
                  {!animate && (
                    <StyledContent
                      wrap={wrap}
                      effect={labelEffect}
                      className='reqore-button-text-content'
                      {...REQORE_MARQUEE_TEXT}
                    >
                      {_children}
                    </StyledContent>
                  )}
                  {animate && (
                    <StyledActiveContent
                      wrap={wrap}
                      effect={labelEffect}
                      className='reqore-button-text-content reqore-animated reqore-active'
                      {...REQORE_MARQUEE_TEXT}
                    >
                      {_children}
                    </StyledActiveContent>
                  )}
                  {animate && (
                    <StyledInActiveContent
                      wrap={wrap}
                      effect={labelEffect}
                      className='reqore-button-text-content reqore-animated reqore-inactive'
                      {...REQORE_MARQUEE_TEXT}
                      aria-hidden='true'
                    >
                      {_children}
                    </StyledInActiveContent>
                  )}
                  {animate && (
                    <StyledInvisibleContent
                      wrap={wrap}
                      effect={labelEffect}
                      className='reqore-button-text-content reqore-animated reqore-invisible'
                      aria-hidden='true'
                    >
                      {_children}
                    </StyledInvisibleContent>
                  )}
                  {(badge || badge === 0) && wrap ? (
                    <ButtonBadge content={badge} size={size} wrap active={active} />
                  ) : null}
                </StyledAnimatedTextWrapper>
              )}
              {(badge || badge === 0) && !wrap ? (
                <ButtonBadge
                  content={badge}
                  size={size}
                  compact={_compact}
                  wrapGroup={false}
                  wrap={false}
                  active={active}
                />
              ) : null}
              {!hasRightIcon ? (
                _children ? (
                  <ReqoreHorizontalSpacer
                    width={1}
                    style={
                      textAlign !== 'right' && !hasRightAlignedBadge
                        ? { marginLeft: 'auto' }
                        : undefined
                    }
                  />
                ) : null
              ) : (
                <>
                  {_children || badge ? <ReqoreSpacer width={PADDING_FROM_SIZE[size] / 2} /> : null}
                  <ReqoreIcon
                    icon={rightIcon}
                    size={size}
                    color={rightIconLook?.color ?? rightIconOwn}
                    effect={rightIconEffect}
                    {...rightIconRest}
                    style={
                      textAlign !== 'right' || iconsAlign === 'center'
                        ? {
                            marginLeft:
                              !hasRightAlignedBadge && (iconsAlign !== 'center' || !_children)
                                ? 'auto'
                                : undefined,
                            marginRight:
                              iconsAlign === 'center' || (textAlign === 'center' && !_children)
                                ? 'auto'
                                : undefined,
                          }
                        : undefined
                    }
                  />
                </>
              )}
              {showShortcutHint ? (
                <>
                  <ReqoreSpacer width={PADDING_FROM_SIZE[size] / 2} />
                  <ReqoreKeyboardShortcut shortcut={shortcut} size={size} compact={_compact} />
                </>
              ) : null}
            </StyledButtonContent>

            {description && (
              <ReqoreTextEffect
                className='reqore-button-description'
                effect={{
                  textSize: getOneLessSize(size),
                  weight: 'light',
                  textAlign,
                  ...descriptionEffect,
                }}
              >
                {description}
              </ReqoreTextEffect>
            )}
          </ReqoreSurfaceProvider>

          {indicatorConfig && (
            <StyledButtonIndicator
              className='reqore-button-indicator'
              $color={indicatorConfig.color}
              $diameter={indicatorConfig.diameter}
              $offset={indicatorConfig.offset}
              $position={indicatorConfig.position}
              $pulse={indicatorConfig.pulse}
              aria-hidden='true'
            />
          )}
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreButton;
