import React from 'react';
import styled from 'styled-components';

export interface IReqoreNotificationsWrapperProps {
  children: any;
  position: 'TOP' | 'BOTTOM';
}

const StyledNotificationsWrapper = styled.div``;

const ReqoreNotificationsWrapper: React.FC<IReqoreNotificationsWrapperProps> = ({
  children,
  position,
}) => <StyledNotificationsWrapper>{children}</StyledNotificationsWrapper>;
