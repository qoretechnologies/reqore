import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

export interface IReqoreNotificationsWrapperProps {
  children: any;
  position?: IReqoreNotificationsPosition;
}

export type IReqoreNotificationsPosition =
  | 'TOP'
  | 'BOTTOM'
  | 'TOP LEFT'
  | 'TOP RIGHT'
  | 'BOTTOM LEFT'
  | 'BOTTOM RIGHT';

export interface IReqoreNotificationsStyle {
  positions: string[];
}
const StyledNotificationsWrapper = styled.div<IReqoreNotificationsStyle>`
  position: fixed;
  z-index: 10000;
  padding: 0 20px 20px 20px;
  display: flex;
  flex-flow: column;
  /* Notifications of different widths (a pill under a card) line up with
     the corner they are in; centred on the plain top / bottom positions. */
  align-items: ${({ positions }) =>
    positions.includes('left')
      ? 'flex-start'
      : positions.includes('right')
      ? 'flex-end'
      : 'center'};

  ${({ positions }) => {
    const hasTwoPositions = positions.length > 1;

    if (hasTwoPositions) {
      return css`
        ${positions[0]}: 30px;
        ${positions[1]}: 30px;
      `;
    }

    return css`
      ${positions[0]}: 30px;
      left: 50%;
      transform: translateX(-50%);
    `;
  }}
`;

const ReqoreNotificationsWrapper: React.FC<IReqoreNotificationsWrapperProps> = forwardRef<
  HTMLDivElement,
  IReqoreNotificationsWrapperProps
>(({ children, position = 'TOP' }, ref: any) => (
  <StyledNotificationsWrapper
    positions={position
      .split(' ')
      .map((p: IReqoreNotificationsPosition | string): string => p.toLowerCase())}
    ref={ref}
  >
    {children}
  </StyledNotificationsWrapper>
));

export default ReqoreNotificationsWrapper;
