import React from 'react';
import styled from 'styled-components';
import { PADDING_FROM_SIZE, TSizes } from '../../constants/sizes';

export type TReqoreTabsContentPadding =
  | 'horizontal'
  | 'vertical'
  | 'none'
  | 'both'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | true
  | false;

export interface IReqoreTabsContent extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  tabId: string | number;
  padded?: TReqoreTabsContentPadding;
  size?: TSizes;
}

const StyledTabsContent = styled.div`
  display: flex;
  flex-flow: column;
  overflow: hidden;
  flex: 1;
  padding: ${({ $padded, $size }: { $padded: TReqoreTabsContentPadding; $size: TSizes }) =>
    $padded === 'none' || $padded === false
      ? undefined
      : `${
          $padded === 'both' || $padded === true || $padded === 'vertical'
            ? `${PADDING_FROM_SIZE[$size]}px`
            : 0
        } ${
          $padded === 'both' || $padded === true || $padded === 'horizontal'
            ? `${PADDING_FROM_SIZE[$size]}px`
            : 0
        }`};
  padding-top: ${({ $padded, $size }: { $padded: TReqoreTabsContentPadding; $size: TSizes }) =>
    $padded === 'top' ? `${PADDING_FROM_SIZE[$size]}px` : undefined};
  padding-bottom: ${({ $padded, $size }: { $padded: TReqoreTabsContentPadding; $size: TSizes }) =>
    $padded === 'bottom' ? `${PADDING_FROM_SIZE[$size]}px` : undefined};
  padding-left: ${({ $padded, $size }: { $padded: TReqoreTabsContentPadding; $size: TSizes }) =>
    $padded === 'left' ? `${PADDING_FROM_SIZE[$size]}px` : undefined};
  padding-right: ${({ $padded, $size }: { $padded: TReqoreTabsContentPadding; $size: TSizes }) =>
    $padded === 'right' ? `${PADDING_FROM_SIZE[$size]}px` : undefined};
`;

const ReqoreTabsContent = ({
  children,
  className,
  padded = true,
  size = 'normal',
  ...rest
}: IReqoreTabsContent) => (
  <StyledTabsContent
    {...rest}
    $size={size}
    $padded={padded}
    className={`${className || ''} reqore-tabs-content`}
  >
    {children}
  </StyledTabsContent>
);

export default ReqoreTabsContent;
