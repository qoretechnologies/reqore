import React, { memo, useContext } from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { ReqoreThemeContext } from '../..';
import { IReqoreIntent } from '../../constants/theme';
import { IReqoreIconName } from '../../types/icons';

export interface IReqoreIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: IReqoreIconName;
  color?: string;
  size?: string;
  iconProps?: IconBaseProps;
  intent?: IReqoreIntent;
  margin?: 'right' | 'left' | 'both';
}

export const StyledIconWrapper = styled.span<{ margin: 'right' | 'left' | 'both' }>`
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: text-bottom;
  transition: all 0.2s ease-out;

  ${({ margin }) =>
    margin &&
    css`
      margin-left: ${(margin === 'left' || margin === 'both') && '10px'};
      margin-right: ${(margin === 'right' || margin === 'both') && '10px'};
    `}
`;

const ReqoreIcon = memo(
  ({
    icon,
    size = '17px',
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

    if (!Icon) {
      return (
        <StyledIconWrapper
          {...rest}
          margin={margin}
          className={`${className || ''} reqore-icon`}
          style={{ ...style, width: size, height: size }}
        />
      );
    }

    return (
      <StyledIconWrapper
        {...rest}
        margin={margin}
        style={{ ...style, width: size, height: size }}
        className={`${className || ''} reqore-icon`}
      >
        <IconContext.Provider
          value={{
            color: finalColor || 'inherit',
            size,
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
