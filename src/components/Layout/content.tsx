import React from 'react';
import styled from 'styled-components';

export interface IReqoreLayoutContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  withSidebar?: boolean;
}

const StyledReqoreLayoutContent = styled.div`
  display: flex;
  height: 100%;
  flex: 1;
  overflow: hidden;
  flex-flow: column;
`;

const ReqoreLayoutWrapper = ({
  children,
  className,
  ...rest
}: IReqoreLayoutContentProps) => (
  <StyledReqoreLayoutContent
    {...rest}
    className={`${className || ''} reqore-layout-content`}
  >
    {children}
  </StyledReqoreLayoutContent>
);

export default ReqoreLayoutWrapper;
