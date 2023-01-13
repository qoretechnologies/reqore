import React, { forwardRef, memo, useContext } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { ReqoreThemeContext } from '../..';
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
  iconProps?: IconBaseProps;
  margin?: 'right' | 'left' | 'both';
  image?: string;
  rounded?: boolean;
}

export const StyledIconWrapper = styled(StyledEffect)<{ margin: 'right' | 'left' | 'both' }>`
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: text-bottom;
  transition: all 0.2s ease-out;
  overflow: hidden;

  border-radius: ${({ rounded }) => (rounded ? '50%' : undefined)};

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
`;

const ReqoreIcon = memo(
  forwardRef<HTMLSpanElement, IReqoreIconProps>(
    (
      {
        icon,
        size = 'normal',
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
      const theme = useContext(ReqoreThemeContext);
      const Icon: IconType = RemixIcons[`Ri${icon}`];
      const finalColor: string | undefined = intent
        ? theme.intents[intent]
        : getColorFromMaybeString(theme, color);
      const finalSize: string = isStringSize(size) ? ICON_FROM_SIZE[size] : size;

      useTooltip(targetRef.current, tooltip);

      if (image) {
        return (
          <StyledIconWrapper
            {...rest}
            ref={targetRef}
            size={size}
            margin={margin}
            className={`${className || ''} reqore-icon`}
            style={{ ...style, width: finalSize, height: finalSize }}
          >
            <img src={image} alt='' />
          </StyledIconWrapper>
        );
      }

      if (!Icon) {
        return (
          <StyledIconWrapper
            {...rest}
            ref={targetRef}
            size={size}
            margin={margin}
            className={`${className || ''} reqore-icon`}
            style={{ ...style, width: finalSize, height: finalSize }}
          />
        );
      }

      return (
        <StyledIconWrapper
          {...rest}
          ref={targetRef}
          margin={margin}
          size={size}
          style={{ ...style, width: finalSize, height: finalSize }}
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
