import React from 'react';
import styled from 'styled-components';

export interface IReqoreNotificationsWrapperProps {
  children: any;
  position: 'TOP' | 'BOTTOM';
}

export type IReqoreNotificationsPosition =
  | 'TOP'
  | 'BOTTOM'
  | 'LEFT'
  | 'RIGHT'
  | 'TOP-LEFT'
  | 'TOP-RIGHT'
  | 'BOTTOM-LEFT'
  | 'BOTTOM-RIGHT';

const StyledNotificationsWrapper = styled.div<{
  position: IReqoreNotificationsPosition;
}>`
  position: fixed;
`;

const ReqoreNotificationsWrapper: React.FC<IReqoreNotificationsWrapperProps> = ({
  children,
  position,
}) => <StyledNotificationsWrapper>{children}</StyledNotificationsWrapper>;
