import React, { memo, useContext } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { ReqoreThemeContext } from '../..';
import { ICON_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { TReqoreIntent } from '../../constants/theme';
import { isStringSize } from '../../helpers/utils';
import { IWithReqoreEffect } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect } from '../Effect';

export interface IReqoreIconProps extends React.HTMLAttributes<HTMLSpanElement>, IWithReqoreEffect {
  icon?: IReqoreIconName;
  color?: string;
  size?: TSizes | string;
  iconProps?: IconBaseProps;
  intent?: TReqoreIntent;
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
  ({
    icon,
    size = 'normal',
    className,
    color,
    margin,
    style = {},
    iconProps,
    intent,
    image,
    ...rest
  }: IReqoreIconProps) => {
    const theme = useContext(ReqoreThemeContext);
    const Icon: IconType = RemixIcons[`Ri${icon}`];
    const finalColor: string | undefined = intent ? theme.intents[intent] : color;
    const finalSize: string = isStringSize(size) ? ICON_FROM_SIZE[size] : size;

    if (image) {
      return (
        <StyledIconWrapper
          {...rest}
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
);

export default ReqoreIcon;
