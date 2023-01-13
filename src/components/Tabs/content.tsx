import React from 'react';
import styled from 'styled-components';

export type TReqoreTabsContentPadding = 'horizontal' | 'vertical' | 'none' | 'both' | true | false;

export interface IReqoreTabsContent extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  tabId: string | number;
  padded?: TReqoreTabsContentPadding;
}

const StyledTabsContent = styled.div`
  display: flex;
  flex-flow: column;
  overflow: hidden;
  flex: 1;
  padding: ${({ padded }: IReqoreTabsContent) =>
    padded === 'none' || padded === false
      ? undefined
      : `${padded === 'both' || padded === true || padded === 'vertical' ? 10 : 0}px ${
          padded === 'both' || padded === true || padded === 'horizontal' ? 10 : 0
        }px}`};
`;

const ReqoreTabsContent = ({ children, className, padded = true, ...rest }: IReqoreTabsContent) => (
  <StyledTabsContent {...rest} padded={padded} className={`${className || ''} reqore-tabs-content`}>
    {children}
  </StyledTabsContent>
);

export default ReqoreTabsContent;
