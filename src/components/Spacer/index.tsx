import { memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { SIZE_TO_NUMBER, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { changeLightness } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIntent, IWithReqoreCustomTheme, IWithReqoreEffect } from '../../types/global';
import { StyledEffect } from '../Effect';

export const StyledSpacer = styled.div`
  display: ${({ horizontal }) => (horizontal ? 'inline-flex' : 'flex')};
  vertical-align: middle;

  ${({ horizontal, vertical }) => {
    if (horizontal) {
      return css`
        flex-flow: row;
      `;
    }

    if (vertical) {
      return css`
        flex-flow: column;
      `;
    }
  }}

  flex-shrink: 0;
`;

export const StyledSpace = styled.div`
  display: inline-block;
  flex: 0 0 auto;

  ${({ horizontal, vertical, width, height, lineSize }) => {
    if (horizontal) {
      return css`
        width: ${width / 2 - lineSize / 2}px;
        height: ${height ? `${height}px` : `${TEXT_FROM_SIZE.normal}px`};
      `;
    }

    if (vertical) {
      return css`
        width: ${width ? `${width}px` : '100%'};
        height: ${height / 2 - lineSize / 2}px;
      `;
    }
  }}
`;

export const StyledLine = styled(StyledEffect)`
  flex-shrink: 0;
  background-color: ${({ theme, lineSize }) =>
    lineSize === 'none' ? 'transparent' : changeLightness(theme.main, 0.2)};

  ${({ horizontal, vertical, width, height, lineSize }) => {
    if (horizontal) {
      return css`
        width: ${lineSize}px;
        height: ${height ? `${height}px` : `${TEXT_FROM_SIZE.normal}px`};
      `;
    }

    if (vertical) {
      return css`
        width: ${width ? `${width}px` : '100%'};
        height: ${lineSize}px;
      `;
    }
  }}
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

    const _lineSize = useMemo(
      () => (lineSize === 'none' ? 0 : SIZE_TO_NUMBER[lineSize]),
      [lineSize]
    );

    return (
      <StyledSpacer
        as='div'
        {...rest}
        horizontal={horizontal}
        vertical={vertical}
        className='reqore-spacer'
      >
        <StyledSpace {...rest} horizontal={horizontal} vertical={vertical} lineSize={_lineSize} />
        <StyledLine
          {...rest}
          horizontal={horizontal}
          vertical={vertical}
          theme={theme}
          lineSize={_lineSize}
        />
        <StyledSpace {...rest} horizontal={horizontal} vertical={vertical} lineSize={_lineSize} />
      </StyledSpacer>
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
