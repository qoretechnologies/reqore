import React from 'react';
import styled from 'styled-components';

export interface IReqoreTabsContent extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  id: string;
}

const StyledTabsContent = styled.div`
  display: flex;
  flex-flow: column;
  overflow: hidden;
  flex: 1;
  padding: 10px;
`;

const ReqoreTabsContent = ({ children, className, ...rest }: IReqoreTabsContent) => (
  <StyledTabsContent {...rest} className={`${className || ''} reqore-tabs-content`}>
    {children}
  </StyledTabsContent>
);

export default ReqoreTabsContent;
