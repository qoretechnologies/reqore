import React from 'react';
import { IconContext } from 'react-icons';
import { IconBaseProps, IconType } from 'react-icons/lib';
import * as RemixIcons from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { IReqoreIconName } from '../../types/icons';

export interface IReqoreIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: IReqoreIconName;
  color?: string;
  size?: string;
  iconProps?: IconBaseProps;
  margin?: 'right' | 'left' | 'both';
}

const StyledIconWrapper = styled.span<{ margin: 'right' | 'left' | 'both' }>`
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

const ReqoreIcon = ({
  icon,
  size = '17px',
  className,
  color,
  margin,
  style = {},
  iconProps,
  ...rest
}: IReqoreIconProps) => {
  console.log(iconProps, size);
  const Icon: IconType = RemixIcons[`Ri${icon}`];

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
          color: color || 'inherit',
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
};

export default ReqoreIcon;
