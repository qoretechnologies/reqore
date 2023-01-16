import styled, { css } from 'styled-components';

export interface IReqoreColumnProps
  extends Pick<
    React.CSSProperties,
    'alignItems' | 'justifyContent' | 'flexFlow' | 'flex' | 'flexShrink' | 'flexGrow'
  > {}

export const ReqoreColumn = styled.div<IReqoreColumnProps>`
  ${({
    alignItems = 'flex-start',
    justifyContent,
    flex = '1 0 auto',
    flexFlow = 'row',
    flexGrow,
    flexShrink,
  }: IReqoreColumnProps) => css`
    display: flex;
    align-items: ${alignItems};
    justify-content: ${justifyContent};
    flex-flow: ${flexFlow};
    flex: ${flex};
    flex-grow: ${flexGrow};
    flex-shrink: ${flexShrink};
    overflow-x: hidden;
  `}
`;
