import { rgba } from 'polished';
import React, { forwardRef, memo, useMemo } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css, keyframes } from 'styled-components';
import { useReqoreTheme } from '../../hooks/useTheme';
import { ICON_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { getColorFromMaybeString, getReadableColor } from '../../helpers/colors';
import { omitStyleProps } from '../../helpers/styled';
import { isStringSize } from '../../helpers/utils';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { IReqoreIntent, IWithReqoreEffect, IWithReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreIconProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    IWithReqoreEffect,
    IWithReqoreTooltip,
    IReqoreIntent {
  icon?: IReqoreIconName;
  color?: TReqoreEffectColor;
  size?: TSizes | string;
  wrapperSize?: TSizes | string;
  wrapperElement?: any;
  iconProps?: IconBaseProps;

  margin?: 'right' | 'left' | 'both';
  marginSize?: TSizes | string | number;

  image?: string;
  rounded?: boolean;
  rotation?: number;
  animation?: 'spin' | 'heartbeat';
  interactive?: boolean;
  compact?: boolean;
  /**
   * Subtle glow rendered behind the icon shape via `filter: drop-shadow(...)`
   * so it follows the icon's actual contour rather than its bounding box.
   *
   * - `true` — glow with the icon's resolved colour (intent / `color` prop / readable default)
   * - `TReqoreEffectColor` — glow with that specific colour
   * - object — `{ color?, blur?, opacity? }` for full control
   */
  glow?: boolean | TReqoreEffectColor | IReqoreGlowConfig;
}

export interface IReqoreGlowConfig {
  color?: TReqoreEffectColor;
  blur?: number;
  opacity?: number;
}

// When the app-wide `glowingIcons` default glows an icon by its *inherited*
// (`currentColor`) colour, the glow fades out for near-neutral colours — a shade
// of white/grey/black is what shouldn't glow (a white halo reads as a grey
// smudge), and "neutral" is low *chroma*, NOT high lightness (a light-but-vivid
// green must still glow). Done in pure CSS via OKLCH relative-colour syntax, so
// there's no runtime read: alpha = `opacity * (C - FLOOR) / SPAN` (clamped to
// [0,1]), where C is the origin colour's OKLCH chroma (0 = neutral). Below FLOOR
// (off-whites/greys) → 0; FLOOR+SPAN and up → full.
const GLOW_INHERIT_CHROMA_FLOOR = 0.02;
const GLOW_INHERIT_CHROMA_SPAN = 0.06;

const SpinKeyframes = keyframes`
  0% {
    rotate: 0deg;
  }
  100% {
    rotate: 360deg;
  }
`;

export const StyledIconWrapper = styled(StyledEffect).withConfig({
  shouldForwardProp: omitStyleProps(
    'animation',
    'compact',
    'interactive',
    'margin',
    'marginSize',
    'rotation',
    'rounded'
  ),
})<{ margin: 'right' | 'left' | 'both' }>`
  display: inline-flex;
  flex: 0 0 auto;
  justify-content: center;
  align-items: center;
  vertical-align: text-bottom;
  transition: all 0.2s ease-out;
  overflow: hidden;

  border-radius: ${({ rounded }) => (rounded ? '50%' : undefined)};
  rotate: ${({ rotation }) => (rotation ? `${rotation}deg` : undefined)};
  cursor: ${({ interactive }) => (interactive ? 'pointer' : undefined)};

  ${({ margin, marginSize, size, compact }) =>
    margin &&
    css`
      margin-left: ${margin === 'left' || margin === 'both'
        ? marginSize
          ? `${marginSize}px`
          : isStringSize(size)
          ? `${PADDING_FROM_SIZE[size] / (compact ? 2 : 1)}px`
          : compact
          ? '3px'
          : '6px'
        : undefined};
      margin-right: ${margin === 'right' || margin === 'both'
        ? marginSize
          ? `${marginSize}px`
          : isStringSize(size)
          ? `${PADDING_FROM_SIZE[size] / (compact ? 2 : 1)}px`
          : compact
          ? '3px'
          : '6px'
        : undefined};
    `}

  img {
    width: 100%;
  }

  ${({ animation }) =>
    animation === 'spin' &&
    css`
      animation: ${SpinKeyframes} 1s linear infinite;
    `}
`;

const ReqoreIcon = memo(
  forwardRef<HTMLSpanElement, IReqoreIconProps>(
    (
      {
        icon,
        size = 'normal',
        wrapperSize,
        wrapperElement,
        className,
        color,

        margin,
        marginSize,

        style = {},
        iconProps,
        intent,
        image,
        glow,
        ...rest
      }: IReqoreIconProps,
      ref
    ) => {
      const theme = useReqoreTheme();
      const glowingIconsDefault = useReqoreProperty('glowingIcons');
      const Icon: IconType = RemixIcons[`Ri${icon}`];
      const finalColor: string | undefined = useMemo(
        () => (intent ? theme.intents[intent] : getColorFromMaybeString(theme, color)),
        [intent, theme, color]
      );
      const finalSize: string = isStringSize(size) ? ICON_FROM_SIZE[size] : size;
      const finalWrapperSize: string = wrapperSize
        ? isStringSize(wrapperSize)
          ? ICON_FROM_SIZE[wrapperSize]
          : wrapperSize
        : finalSize;
      const finalMarginSize: number = isStringSize(marginSize)
        ? PADDING_FROM_SIZE[marginSize]
        : marginSize;

      // Resolve the glow into a `filter: drop-shadow(...)` so it follows the SVG
      // outline. `glow` undefined falls back to the global `glowingIcons` UI option
      // (one switch, app-wide); `glow={false}` opts a single icon out. Images are
      // exempt from the app-wide default — a coloured halo around a logo/photo reads
      // as noise, not an accent — but an explicit `glow` still applies.
      const effectiveGlow =
        glow === undefined ? (image ? false : glowingIconsDefault) : glow;

      const glowFilter = useMemo(() => {
        if (!effectiveGlow) return undefined;
        const config: IReqoreGlowConfig =
          typeof effectiveGlow === 'boolean'
            ? {}
            : typeof effectiveGlow === 'string'
            ? { color: effectiveGlow }
            : effectiveGlow;
        // The glow's own colour: explicit glow.color → the icon's intent/color prop
        // → (for an explicitly-requested glow) a theme-readable colour. Undefined
        // means the icon has no colour of its own and paints via inherited
        // `currentColor`.
        const explicit = glow !== undefined;
        const ownColor =
          (config.color ? (getColorFromMaybeString(theme, config.color) as string) : undefined) ??
          finalColor ??
          (explicit ? getReadableColor(theme, undefined, undefined, true) : undefined);
        const blur = config.blur ?? 5;
        const opacity = config.opacity ?? 0.8;
        // Own colour → a plain, well-supported rgba glow.
        if (ownColor) {
          return `drop-shadow(0 0 ${blur}px ${rgba(ownColor, opacity)})`;
        }
        // No colour of its own (the app-wide default on an inheritance-coloured
        // icon, e.g. a button glyph): glow the *painted* `currentColor` in pure CSS
        // — no runtime read, no re-render — with the alpha keyed on the colour's
        // OKLCH chroma so near-neutral (white/grey/black) icons don't halo but
        // light-but-vivid ones still glow. Browsers without relative-colour support
        // simply render no glow here (graceful — same as the old behaviour).
        return `drop-shadow(0 0 ${blur}px oklch(from currentColor l c h / calc(${opacity} * (c - ${GLOW_INHERIT_CHROMA_FLOOR}) / ${GLOW_INHERIT_CHROMA_SPAN})))`;
      }, [effectiveGlow, glow, finalColor, theme]);

      const finalStyle = useMemo(
        () => ({
          width: finalWrapperSize,
          height: finalWrapperSize,
          ...(glowFilter ? { filter: glowFilter } : {}),
          ...style,
        }),
        [finalWrapperSize, glowFilter, style]
      );

      if (image) {
        return (
          <ReqoreTooltipComponent
            {...rest}
            Component={StyledIconWrapper}
            as={wrapperElement}
            ref={ref}
            size={size}
            margin={margin}
            marginSize={finalMarginSize}
            className={`${className || ''} reqore-icon`}
            style={finalStyle}
          >
            <img src={image} alt='' />
          </ReqoreTooltipComponent>
        );
      }

      if (!Icon) {
        return (
          <ReqoreTooltipComponent
            {...rest}
            Component={StyledIconWrapper}
            as={wrapperElement}
            ref={ref}
            size={size}
            margin={margin}
            marginSize={finalMarginSize}
            className={`${className || ''} reqore-icon`}
            style={finalStyle}
          />
        );
      }

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledIconWrapper}
          as={wrapperElement}
          ref={ref}
          margin={margin}
          size={size}
          marginSize={finalMarginSize}
          style={finalStyle}
          className={`${className || ''} reqore-icon`}
        >
          <IconContext.Provider
            value={{
              color: finalColor || 'inherit',
              size: finalSize,
              style: {
                verticalAlign: 'super',
              },
            }}
          >
            <Icon {...iconProps} />
          </IconContext.Provider>
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreIcon;
