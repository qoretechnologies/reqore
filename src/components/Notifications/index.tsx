import React from 'react';
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
  z-index: 9999;
  padding: 0 20px 20px 20px;

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

const ReqoreNotificationsWrapper: React.FC<IReqoreNotificationsWrapperProps> = ({
  children,
  position = 'TOP',
}) => (
  <StyledNotificationsWrapper
    positions={position
      .split(' ')
      .map((p: IReqoreNotificationsPosition | string): string =>
        p.toLowerCase()
      )}
  >
    {children}
  </StyledNotificationsWrapper>
);

export default ReqoreNotificationsWrapper;
