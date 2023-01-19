import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { GAP_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { IWithReqoreFlat, IWithReqoreMinimal, IWithReqoreSize } from '../../types/global';

export interface IReqoreControlGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreMinimal {
  stack?: boolean;
  children: any;
  fluid?: boolean;
  rounded?: boolean;
  gapSize?: TSizes;
  /*
   * Whether the contents of the control group should be stacked vertically
   */
  vertical?: boolean;
}

export interface IReqoreControlGroupStyle extends IReqoreControlGroupProps {
  theme: IReqoreTheme;
}

export const StyledReqoreControlGroup = styled.div<IReqoreControlGroupStyle>`
  display: flex;
  flex: 0 auto;
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};
  align-items: ${({ fluid }) => (fluid ? 'stretch' : 'flex-start')};
  flex-flow: ${({ vertical }) => (vertical ? 'column' : 'row')};

  > .reqore-control-wrapper .reqore-control {
    border-radius: ${({ stack }) => (!stack ? undefined : 0)};
  }

  ${({ vertical }) =>
    vertical
      ? css`
          > .reqore-control,
          > .reqore-control-wrapper,
          > .reqore-tag,
          > * {
            &:not(:last-child) {
              margin-bottom: ${({ stack, gapSize }) =>
                !stack ? `${GAP_FROM_SIZE[gapSize]}px` : undefined};
              border-bottom: ${({ stack }) => (!stack ? undefined : 0)};
            }

            border-radius: ${({ stack }) => (!stack ? undefined : 0)};

            ${({ rounded, size, stack }) =>
              rounded && stack
                ? css`
                    &:first-child {
                      border-top-left-radius: ${RADIUS_FROM_SIZE[size]}px;
                      border-top-right-radius: ${RADIUS_FROM_SIZE[size]}px;
                    }

                    &:last-child {
                      border-bottom-left-radius: ${RADIUS_FROM_SIZE[size]}px;
                      border-bottom-right-radius: ${RADIUS_FROM_SIZE[size]}px;
                    }
                  `
                : undefined}
          }

          > .reqore-control-wrapper:not(:last-child) .reqore-control {
            margin-bottom: ${({ stack, gapSize }) =>
              !stack ? `${GAP_FROM_SIZE[gapSize]}px` : undefined};
            border-bottom: ${({ stack }) => (!stack ? undefined : 0)};
          }
        `
      : css`
          > .reqore-control,
          > .reqore-control-wrapper,
          > .reqore-tag,
          > * {
            &:not(:last-child) {
              margin-right: ${({ stack, gapSize }) =>
                !stack ? `${GAP_FROM_SIZE[gapSize]}px` : undefined};
              border-right: ${({ stack }) => (!stack ? undefined : 0)};
            }

            border-radius: ${({ stack }) => (!stack ? undefined : 0)};

            ${({ rounded, size, stack }) =>
              rounded && stack
                ? css`
                    &:first-child {
                      border-top-left-radius: ${RADIUS_FROM_SIZE[size]}px;
                      border-bottom-left-radius: ${RADIUS_FROM_SIZE[size]}px;
                    }

                    &:last-child {
                      border-top-right-radius: ${RADIUS_FROM_SIZE[size]}px;
                      border-bottom-right-radius: ${RADIUS_FROM_SIZE[size]}px;
                    }
                  `
                : undefined}
          }
        `}
`;

const ReqoreControlGroup = forwardRef<HTMLDivElement, IReqoreControlGroupProps>(
  (
    {
      children,
      className,
      minimal,
      size = 'normal',
      gapSize = 'normal',
      fluid,
      flat,
      rounded = true,
      ...rest
    }: IReqoreControlGroupProps,
    ref
  ) => (
    <StyledReqoreControlGroup
      {...rest}
      size={size}
      gapSize={gapSize}
      ref={ref}
      rounded={rounded}
      fluid={fluid}
      className={`${className || ''} reqore-control-group`}
    >
      {React.Children.map(children, (child) =>
        child
          ? React.cloneElement(child, {
              minimal:
                child.props?.minimal || child.props?.minimal === false
                  ? child.props.minimal
                  : minimal,
              size: child.props?.size || size,
              flat: child.props?.flat || child.props?.flat === false ? child.props.flat : flat,
              fluid,
            })
          : null
      )}
    </StyledReqoreControlGroup>
  )
);

export default ReqoreControlGroup;
