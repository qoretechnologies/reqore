import { memo } from 'react';
import styled, { css } from 'styled-components';
import { SIZE_TO_NUMBER, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIntent, IWithReqoreCustomTheme, IWithReqoreEffect } from '../../types/global';
import { StyledEffect } from '../Effect';

export const StyledSpacer = styled(StyledEffect)`
  ${({ horizontal, vertical, width, height, lineSize }) => {
    if (horizontal) {
      return css`
        margin-left: ${width / 2}px;
        margin-right: ${width / 2}px;
        width: ${lineSize === 'none' ? 1 : SIZE_TO_NUMBER[lineSize]}px;
        height: ${height ? `${height}px` : `${TEXT_FROM_SIZE.normal}px`};
        vertical-align: middle;
        display: inline-block;
      `;
    }

    if (vertical) {
      return css`
        margin-top: ${height / 2}px;
        margin-bottom: ${height / 2}px;
        height: ${lineSize === 'none' ? 1 : SIZE_TO_NUMBER[lineSize]}px;
        width: ${width ? `${width}px` : '100%'};
      `;
    }
  }}

  background-color: ${({ theme, lineSize }) =>
    lineSize === 'none' ? 'transparent' : changeLightness(theme.main, 0.2)};
  flex-shrink: 0;
`;

export interface IReqoreSpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreEffect,
    IWithReqoreCustomTheme,
    IReqoreIntent {
  width?: number;
  height?: number;
  lineSize?: TSizes | 'none';
}

export const ReqoreSpacer = memo(
  ({
    customTheme,
    intent,
    lineSize = 'none',
    ...rest
  }: IReqoreSpacerProps & { horizontal?: boolean; vertical?: boolean }) => {
    const theme = useReqoreTheme('main', customTheme, intent);
    let { horizontal, vertical } = rest;

    // The user is using old version of the component
    // We will assume that the user wants a spacer based on the width or height
    if (!horizontal && !vertical) {
      if (rest.width) {
        horizontal = true;
      }

      if (rest.height) {
        vertical = true;
      }
    }

    return (
      <StyledSpacer
        as='div'
        {...rest}
        theme={theme}
        lineSize={lineSize}
        horizontal={horizontal}
        vertical={vertical}
        className='reqore-spacer'
      />
    );
  }
);

export const ReqoreHorizontalSpacer = memo(
  ({ width = 1, lineSize = 'none', ...rest }: IReqoreSpacerProps) => {
    return <ReqoreSpacer width={width} lineSize={lineSize} horizontal {...rest} />;
  }
);

export const ReqoreVerticalSpacer = memo(
  ({ height = 1, lineSize = 'none', ...rest }: IReqoreSpacerProps) => {
    return <ReqoreSpacer height={height} lineSize={lineSize} vertical {...rest} />;
  }
);
