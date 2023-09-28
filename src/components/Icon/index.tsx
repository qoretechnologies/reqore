import React, { forwardRef, memo } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css, keyframes } from 'styled-components';
import { useReqoreTheme } from '../..';
import { ICON_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { getColorFromMaybeString } from '../../helpers/colors';
import { isStringSize } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import { IReqoreIntent, IWithReqoreEffect, IWithReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect, TReqoreEffectColor } from '../Effect';

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
  image?: string;
  rounded?: boolean;
  rotation?: number;
  animation?: 'spin' | 'heartbeat';
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

  ${({ margin, size }) =>
    margin &&
    css`
      margin-left: ${margin === 'left' || margin === 'both'
        ? isStringSize(size)
          ? `${PADDING_FROM_SIZE[size]}px`
          : '10px'
        : undefined};
      margin-right: ${margin === 'right' || margin === 'both'
        ? isStringSize(size)
          ? `${PADDING_FROM_SIZE[size]}px`
          : '10px'
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
        style = {},
        iconProps,
        intent,
        image,
        tooltip,
        ...rest
      }: IReqoreIconProps,
      ref
    ) => {
      const { targetRef } = useCombinedRefs(ref);
      const [iconRef, setIconRef] = React.useState<HTMLSpanElement>(undefined);
      const theme = useReqoreTheme();
      const Icon: IconType = RemixIcons[`Ri${icon}`];
      const finalColor: string | undefined = intent
        ? theme.intents[intent]
        : getColorFromMaybeString(theme, color);
      const finalSize: string = isStringSize(size) ? ICON_FROM_SIZE[size] : size;
      const finalWrapperSize: string = wrapperSize
        ? isStringSize(wrapperSize)
          ? ICON_FROM_SIZE[wrapperSize]
          : wrapperSize
        : finalSize;

      useTooltip(iconRef, tooltip);

      if (image) {
        return (
          <StyledIconWrapper
            {...rest}
            as={wrapperElement}
            ref={targetRef}
            size={size}
            margin={margin}
            className={`${className || ''} reqore-icon`}
            style={{ width: finalWrapperSize, height: finalWrapperSize, ...style }}
          >
            <img src={image} alt='' />
          </StyledIconWrapper>
        );
      }

      if (!Icon) {
        return (
          <StyledIconWrapper
            {...rest}
            as={wrapperElement}
            ref={targetRef}
            size={size}
            margin={margin}
            className={`${className || ''} reqore-icon`}
            style={{ width: finalWrapperSize, height: finalWrapperSize, ...style }}
          />
        );
      }

      return (
        <StyledIconWrapper
          {...rest}
          as={wrapperElement}
          ref={(ref) => {
            targetRef.current = ref;
            setIconRef(ref);
          }}
          margin={margin}
          size={size}
          style={{ width: finalWrapperSize, height: finalWrapperSize, ...style }}
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
        </StyledIconWrapper>
      );
    }
  )
);

export default ReqoreIcon;
