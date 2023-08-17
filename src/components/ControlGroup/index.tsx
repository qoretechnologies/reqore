import { debounce } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreButton, ReqoreDrawer } from '../..';
import { GAP_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreSize,
} from '../../types/global';
import { StyledEffect } from '../Effect';
import { StyledHeader } from '../Header';
import { StyledParagraph } from '../Paragraph';

export interface IReqoreControlGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreMinimal,
    IReqoreIntent,
    IWithReqoreFluid,
    IWithReqoreCustomTheme {
  stack?: boolean;
  children: any;
  fixed?: boolean;
  rounded?: boolean;
  responsive?: boolean;
  gapSize?: TSizes;
  /*
   * Whether the contents of the control group should be stacked vertically
   */
  vertical?: boolean;
  verticalAlign?: 'flex-start' | 'center' | 'flex-end';
  horizontalAlign?: 'flex-start' | 'center' | 'flex-end';
  wrap?: boolean;
  isInsideStackGroup?: boolean;
  isInsideVerticalGroup?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isLastInFirstGroup?: boolean;
  isLastInLastGroup?: boolean;
  isFirstInLastGroup?: boolean;
  isMasterGroupRounded?: boolean;
  childrenCount?: number;
  childId?: number;
  isChild?: boolean;
  isFirstGroup?: boolean;
  isLastGroup?: boolean;
  fill?: boolean;
}

export interface IReqoreControlGroupStyle extends IReqoreControlGroupProps {
  theme: IReqoreTheme;
}

export const StyledReqoreControlGroup = styled(StyledEffect)<IReqoreControlGroupStyle>`
  display: flex;
  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? undefined : '0 0 auto')};
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  justify-content: ${({ fluid, vertical }) => (vertical && fluid ? 'stretch' : undefined)};
  align-items: ${({ vertical, fluid, horizontalAlign }) =>
    vertical ? (fluid ? 'stretch' : horizontalAlign) : undefined};
  flex-flow: ${({ vertical }) => (vertical ? 'column' : 'row')};
  gap: ${({ gapSize, stack }) => (!stack ? `${GAP_FROM_SIZE[gapSize]}px` : undefined)};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};

  // If the group has the fill prop,
  // we need to make sure that the children are vertically stretched
  // kind of like 'fluid' but vertically
  // ! Only works when the group is horizontal & wrap is false
  ${({ fill, vertical }) => {
    if (fill && !vertical) {
      return css`
        > * {
          max-height: 100%;
          height: unset !important;
          align-self: stretch;
        }
      `;
    }

    return undefined;
  }}

  > *, > ${StyledParagraph}, > ${StyledHeader} {
    margin-top: ${({ fill, verticalAlign }) =>
      !fill && (verticalAlign === 'flex-end' || verticalAlign === 'center') ? 'auto' : undefined};
    margin-bottom: ${({ fill, verticalAlign }) =>
      !fill && (verticalAlign === 'flex-start' || verticalAlign === 'center') ? 'auto' : undefined};
    margin-right: ${({ horizontalAlign }) => (horizontalAlign === 'center' ? 'auto' : undefined)};

    ${({ vertical }) =>
      vertical &&
      css`
        margin-left: ${({ horizontalAlign }) =>
          horizontalAlign === 'flex-end' || horizontalAlign === 'center' ? 'auto' : undefined};
      `}
  }

  ${({ vertical }) =>
    !vertical &&
    css`
      > *:first-child {
        margin-left: ${({ horizontalAlign }) =>
          horizontalAlign === 'flex-end' || horizontalAlign === 'center' ? 'auto' : undefined};
      }
    `}

  > * {
    border-radius: ${({ stack }) => (!stack ? undefined : 0)};
  }
`;

const ReqoreControlGroup = memo(
  ({
    children,
    className,
    minimal,
    size = 'normal',
    gapSize = 'normal',
    fluid,
    flat,
    fixed,
    fill,
    rounded = true,
    wrap,
    stack,
    isInsideStackGroup,
    isInsideVerticalGroup,
    isMasterGroupRounded,
    intent,
    customTheme,
    isFirst,
    isLast,
    vertical,
    childrenCount,
    childId,
    isChild,
    isFirstGroup,
    isLastGroup,
    verticalAlign = 'center',
    horizontalAlign = 'flex-start',
    responsive,
    ...rest
  }: IReqoreControlGroupProps) => {
    const isStack = stack || isInsideStackGroup;
    const isVertical = vertical || isInsideVerticalGroup;

    const [overflowingChildren, setOverflowingChildren] = useState<number | undefined>(0);
    const [lastReSize, setLastReSize] = useState<number>(0);
    const [isOverflownDialogOpen, setIsOverflownDialogOpen] = useState<boolean>(false);
    const observer = useRef<ResizeObserver | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const realChildCount = useMemo((): number => {
      let count = 0;

      const countChildren = (children: React.ReactNode) =>
        React.Children.forEach(children, (child: any) => {
          if (child && React.isValidElement(child)) {
            if (child.type === React.Fragment) {
              // just compare to `React.Fragment`
              countChildren((child.props as any).children);
            } else {
              count++;
            }
          }
        });

      countChildren(children);

      return count < 0 ? 0 : count;
    }, [children]);

    const checkIfOverflowing = useCallback(() => {
      return (
        ref.current &&
        ref.current.clientWidth > 40 &&
        !vertical &&
        responsive &&
        ref.current.scrollWidth > ref.current.clientWidth
      );
    }, [vertical, responsive, ref, children]);

    useMount(() => {
      if (!vertical && responsive) {
        if ('ResizeObserver' in window) {
          observer.current = new ResizeObserver(
            debounce(() => {
              if (ref && ref.current) {
                setOverflowingChildren(0);
                setLastReSize(ref.current.clientWidth);
              }
            }, 200)
          );

          observer.current.observe(ref.current);
        }
      }
    });

    useUnmount(() => {
      if (observer.current) {
        observer.current.disconnect();
      }
    });

    useEffect(() => {
      // Is the control group still overflowing?
      if ((overflowingChildren || overflowingChildren === 0) && checkIfOverflowing()) {
        setOverflowingChildren(overflowingChildren + 1);
      }

      // Hide the dialog if the group was resized and the dialog was open
      if (overflowingChildren === 0) {
        setIsOverflownDialogOpen(false);
      }
    }, [overflowingChildren, lastReSize]);

    const getIsFirst = (index: number): boolean => {
      return !isInsideStackGroup || childrenCount === 1
        ? index === 0
        : (isFirst || isFirst !== false) && index === 0;
    };
    const getIsLast = (index: number): boolean => {
      return !isInsideStackGroup
        ? index === realChildCount - 1
        : (isLast || isLast !== false) && index === realChildCount - 1;
    };
    const getIsLastInFirstGroup = (index: number): boolean => {
      return !isInsideStackGroup
        ? index === 0
        : isFirstGroup && (isLast || isLast !== false) && index === realChildCount - 1;
    };
    const getIsFirstInLastGroup = (index: number): boolean => {
      return !isInsideStackGroup
        ? index === realChildCount - 1
        : isLastGroup && (isFirst || isFirst !== false) && childId === 1 && index === 0;
    };
    const getIsLastInLastGroup = (index: number): boolean => {
      return !isInsideStackGroup
        ? index === realChildCount - 1
        : isLastGroup && (isLast || isLast !== false) && index === realChildCount - 1;
    };

    const getBorderTopLeftRadius = (index: number): number | undefined => {
      if (isMasterGroupRounded === false) {
        return undefined;
      }

      const _isFirstGroup =
        !isInsideStackGroup || childrenCount === 1 ? true : isChild ? isFirstGroup : index === 0;

      // If this is the first item
      if (_isFirstGroup && getIsFirst(index)) {
        return RADIUS_FROM_SIZE[size];
      }

      return undefined;
    };

    const getBorderTopRightRadius = (index: number): number | undefined => {
      if (isMasterGroupRounded === false) {
        return undefined;
      }

      // If this group is not vertical we need to style the very last item
      if (!isVertical || !isStack) {
        const _isLastGroup =
          !isInsideStackGroup || childrenCount === 1
            ? true
            : isChild
            ? isLastGroup
            : index === realChildCount - 1;

        if (_isLastGroup && getIsLast(index)) {
          return RADIUS_FROM_SIZE[size];
        }

        return undefined;
      }

      // This border only needs to apply when this group is vertical
      // AND this item is the last item of the first group
      if (getIsLastInFirstGroup(index)) {
        return RADIUS_FROM_SIZE[size];
      }

      return undefined;
    };

    const getBorderBottomLeftRadius = (index: number): number | undefined => {
      if (isMasterGroupRounded === false) {
        return undefined;
      }

      // If this group is not vertical we need to style the very first item
      if (!isVertical || !isStack) {
        const _isFirstGroup =
          !isInsideStackGroup || childrenCount === 1 ? true : isChild ? isFirstGroup : index === 0;

        if (_isFirstGroup && getIsFirst(index)) {
          return RADIUS_FROM_SIZE[size];
        }

        return undefined;
      }

      // This border only needs to apply when this group is vertical
      // AND this item is the first item of the last group
      if (getIsFirstInLastGroup(index)) {
        return RADIUS_FROM_SIZE[size];
      }

      return undefined;
    };

    const getBorderBottomRightRadius = (index: number): number | undefined => {
      if (isMasterGroupRounded === false) {
        return undefined;
      }

      const _isLastGroup =
        !isInsideStackGroup || childrenCount === 1
          ? true
          : isChild
          ? isLastGroup
          : index === realChildCount - 1;

      // If this is the last item
      if (_isLastGroup && getIsLast(index)) {
        return RADIUS_FROM_SIZE[size];
      }

      return undefined;
    };

    let index = 0;

    const cloneThroughFragments = useCallback(
      (children: React.ReactNode): React.ReactNode => {
        return React.Children.map(children, (child, _index) => {
          if (child && React.isValidElement(child)) {
            if (child.type === React.Fragment) {
              return cloneThroughFragments(child.props.children);
            }

            let newProps = {
              ...child.props,
              key: child.props.reactKey || _index,
              minimal:
                child.props?.minimal || child.props?.minimal === false
                  ? child.props.minimal
                  : minimal,
              size: child.props?.size || size,
              flat: child.props?.flat || child.props?.flat === false ? child.props.flat : flat,
              fluid: child.props?.fluid || child.props?.fluid === false ? child.props.fluid : fluid,
              fixed: child.props?.fixed || child.props?.fixed === false ? child.props.fixed : fixed,
              fill: child.props?.fill || child.props?.fill === false ? child.props.fill : fill,
              stack:
                child.props?.stack || child.props?.stack === false ? child.props.stack : isStack,
              intent: child.props?.intent || intent,
              customTheme: child.props?.customTheme || customTheme,
            };

            if (isStack) {
              newProps = {
                ...newProps,
                style: {
                  borderTopLeftRadius: getBorderTopLeftRadius(index),
                  borderBottomLeftRadius: getBorderBottomLeftRadius(index),
                  borderTopRightRadius: getBorderTopRightRadius(index),
                  borderBottomRightRadius: getBorderBottomRightRadius(index),
                  ...(child.props?.style || {}),
                },
                isChild: true,
                rounded: !isStack,
                isMasterGroupRounded: isChild ? isMasterGroupRounded : rounded,
                isInsideStackGroup: isStack,
                isInsideVerticalGroup: isVertical,
                isFirst: isChild ? getIsFirst(index) : undefined,
                isLast: isChild ? getIsLast(index) : undefined,
                isLastInFirstGroup: getIsLastInFirstGroup(index),
                isLastInLastGroup: getIsLastInLastGroup(index),
                isFirstInLastGroup: getIsFirstInLastGroup(index),
                childrenCount: realChildCount,
                childId: index + 1,

                isFirstGroup: isChild ? isFirstGroup : index === 0,
                isLastGroup: isChild ? isLastGroup : index === realChildCount - 1,
              };
            }

            /*
             * Because of the way React.Children.map works, we have to
             * manually decrement the index for every child that is `null`
             * because react maps through null children and returns them in `Count`
             * We filter these children out in the `realChildCount` variable,
             * but the index is still incremented
             * */
            index = index + 1;

            return React.cloneElement(child, newProps);
          }

          return child;
        });
      },
      [
        children,
        isStack,
        isVertical,
        isChild,
        isLastGroup,
        isFirstGroup,
        realChildCount,
        index,
        fluid,
        flat,
        minimal,
        size,
        intent,
        rounded,
      ]
    );

    // Get the overflown children
    const overflownChildren = useMemo(
      () =>
        overflowingChildren ? React.Children.toArray(children).slice(0, overflowingChildren) : [],
      [children, overflowingChildren]
    );

    // Remove the overflowing children count from the start of the children array
    const _children = useMemo(
      () =>
        overflowingChildren && responsive
          ? [
              children.slice(overflowingChildren),
              <ReqoreButton
                key='control-group-menu'
                icon='MenuLine'
                customTheme={customTheme}
                tooltip={{
                  handler: 'click',
                  content: (
                    <ReqoreControlGroup fluid wrap>
                      {overflownChildren}
                    </ReqoreControlGroup>
                  ),
                }}
                active={isOverflownDialogOpen}
                flat
                fixed
              />,
            ]
          : children,
      [children, overflowingChildren, responsive, overflownChildren]
    );

    return (
      <>
        {isOverflownDialogOpen ? (
          <ReqoreDrawer
            isOpen
            onClose={() => setIsOverflownDialogOpen(false)}
            flat
            floating
            minimal
            position='bottom'
            hasBackdrop={false}
            label='Hidden items'
            minSize='100px'
            size='auto'
          ></ReqoreDrawer>
        ) : null}
        <StyledReqoreControlGroup
          as='div'
          {...rest}
          vertical={vertical}
          style={{
            overflowX: responsive ? 'auto' : undefined,
            ...rest.style,
          }}
          size={size}
          gapSize={gapSize}
          ref={ref}
          rounded={rounded}
          fluid={fluid}
          fixed={fixed}
          fill={fill}
          wrap={wrap}
          stack={isStack}
          verticalAlign={verticalAlign}
          horizontalAlign={horizontalAlign}
          className={`${className || ''} reqore-control-group`}
        >
          {cloneThroughFragments(_children)}
        </StyledReqoreControlGroup>
      </>
    );
  }
);

export default ReqoreControlGroup;
