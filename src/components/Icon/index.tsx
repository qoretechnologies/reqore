import React, { memo, useContext } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { ReqoreThemeContext } from '../..';
import { ICON_FROM_SIZE, PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';
import { TReqoreIntent } from '../../constants/theme';
import { isStringSize } from '../../helpers/utils';
import { IReqoreIconName } from '../../types/icons';

export interface IReqoreIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: IReqoreIconName;
  color?: string;
  size?: TSizes | string;
  iconProps?: IconBaseProps;
  intent?: TReqoreIntent;
  margin?: 'right' | 'left' | 'both';
}

export const StyledIconWrapper = styled.span<{ margin: 'right' | 'left' | 'both' }>`
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: text-bottom;
  transition: all 0.2s ease-out;

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
    ...rest
  }: IReqoreIconProps) => {
    const theme = useContext(ReqoreThemeContext);
    const Icon: IconType = RemixIcons[`Ri${icon}`];
    const finalColor: string | undefined = intent ? theme.intents[intent] : color;
    const finalSize: string = isStringSize(size) ? ICON_FROM_SIZE[size] : size;

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
