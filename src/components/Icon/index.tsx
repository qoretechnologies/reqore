import { rgba } from 'polished';
import React, { forwardRef, memo, useMemo } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css, keyframes } from 'styled-components';
import { useReqoreTheme } from '../..';
import { ICON_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { getColorFromMaybeString, getReadableColor } from '../../helpers/colors';
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

const SpinKeyframes = keyframes`
  0% {
    rotate: 0deg;
  }
  100% {
    rotate: 360deg;
  }
`;

export const StyledIconWrapper = styled(StyledEffect)<{ margin: 'right' | 'left' | 'both' }>`
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

      // Resolve the glow shorthand into a `filter: drop-shadow(...)` value so
      // the glow follows the SVG outline rather than the wrapper's bounding box.
      // When the local `glow` prop is undefined, fall back to the global
      // `glowingIcons` UI option so a single switch can turn glows on app-wide.
      // Pass `glow={false}` explicitly to opt a single icon out.
      const effectiveGlow = glow === undefined ? glowingIconsDefault : glow;
      const glowFilter = useMemo(() => {
        if (!effectiveGlow) return undefined;
        const config: IReqoreGlowConfig =
          typeof effectiveGlow === 'boolean'
            ? {}
            : typeof effectiveGlow === 'string'
            ? { color: effectiveGlow }
            : effectiveGlow;
        // Resolution order: explicit glow.color → icon's intent/color prop.
        // When the prop was set explicitly (not via the global `glowingIcons`
        // option), fall back to a theme-readable colour so a plain icon still
        // glows. The global flag intentionally does NOT force-glow uncoloured
        // icons — it only enhances icons that already have an intent/colour.
        const explicit = glow !== undefined;
        const resolved =
          (config.color ? (getColorFromMaybeString(theme, config.color) as string) : undefined) ??
          finalColor ??
          (explicit ? getReadableColor(theme, undefined, undefined, true) : undefined);
        if (!resolved) return undefined;
        const blur = config.blur ?? 5;
        const opacity = config.opacity ?? 0.8;
        return `drop-shadow(0 0 ${blur}px ${rgba(resolved, opacity)})`;
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
