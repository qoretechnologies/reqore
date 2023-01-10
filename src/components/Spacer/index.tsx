import { memo } from 'react';
import styled, { css } from 'styled-components';
import { SIZE_TO_NUMBER, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIntent, IWithReqoreCustomTheme, IWithReqoreEffect } from '../../types/global';
import { StyledEffect } from '../Effect';

export const StyledSpacer = styled(StyledEffect)`
  ${({ horizontal, vertical, width, height, size }) => {
    if (horizontal) {
      return css`
        margin-left: ${width / 2}px;
        margin-right: ${width / 2}px;
        width: ${size === 'none' ? 1 : SIZE_TO_NUMBER[size]}px;
        height: ${height ? `${height}px` : `${TEXT_FROM_SIZE.normal}px`};
        vertical-align: middle;
        display: inline-block;
      `;
    }

    if (vertical) {
      return css`
        margin-top: ${height / 2}px;
        margin-bottom: ${height / 2}px;
        height: ${size === 'none' ? 1 : SIZE_TO_NUMBER[size]}px;
        width: ${width ? `${width}px` : '100%'};
      `;
    }
  }}

  background-color: ${({ theme, size }) =>
    size === 'none' ? 'transparent' : changeLightness(theme.main, 0.2)};
  flex-shrink: 0;
`;

export interface IReqoreSpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreEffect,
    IWithReqoreCustomTheme,
    IReqoreIntent {
  width?: number;
  height?: number;
  size?: TSizes | 'none';
}

export const ReqoreSpacer = memo(
  ({
    customTheme,
    intent,
    size = 'none',
    ...rest
  }: IReqoreSpacerProps & { horizontal?: boolean; vertical?: boolean }) => {
    const theme = useReqoreTheme('main', customTheme, intent);
    const { horizontal, vertical } = rest;

    // The user is using old version of the component
    // We will assume that the user wants a spacer based on the width or height
    if (!horizontal && !vertical) {
      if (rest.width) {
        return <StyledSpacer as='div' horizontal {...rest} theme={theme} size={size} />;
      }

      if (rest.height) {
        return <StyledSpacer as='div' vertical {...rest} theme={theme} size={size} />;
      }
    }

    return <StyledSpacer as='div' {...rest} theme={theme} size={size} />;
  }
);

export const ReqoreHorizontalSpacer = memo(
  ({ width = 1, size = 'none', ...rest }: IReqoreSpacerProps) => {
    return <ReqoreSpacer width={width} size={size} horizontal {...rest} />;
  }
);

export const ReqoreVerticalSpacer = memo(
  ({ height = 1, size = 'none', ...rest }: IReqoreSpacerProps) => {
    return <ReqoreSpacer height={height} size={size} vertical {...rest} />;
  }
);
