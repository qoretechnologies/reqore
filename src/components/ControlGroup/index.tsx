import React, { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMount } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreButton } from '../..';
import { GAP_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import {
  IReqoreIntent,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreSize,
} from '../../types/global';

export interface IReqoreControlGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreMinimal,
    IReqoreIntent,
    IWithReqoreFluid {
  stack?: boolean;
  children: any;
  fixed?: boolean;
  rounded?: boolean;
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
  childrenCount?: number;
  childId?: number;
  isChild?: boolean;
  isFirstGroup?: boolean;
  isLastGroup?: boolean;
}

export interface IReqoreControlGroupStyle extends IReqoreControlGroupProps {
  theme: IReqoreTheme;
}

export const StyledReqoreControlGroup = styled.div<IReqoreControlGroupStyle>`
  display: flex;
  flex: 0 auto;
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  justify-content: ${({ fluid, vertical }) => (vertical && fluid ? 'stretch' : undefined)};
  align-items: ${({ vertical, fluid }) => (vertical && fluid ? 'stretch' : undefined)};
  flex-flow: ${({ vertical }) => (vertical ? 'column' : 'row')};
  gap: ${({ gapSize, stack }) => (!stack ? `${GAP_FROM_SIZE[gapSize]}px` : undefined)};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};

  > * {
    margin-top: ${({ verticalAlign }) =>
      verticalAlign === 'flex-end' || verticalAlign === 'center' ? 'auto' : undefined};
    margin-bottom: ${({ verticalAlign }) =>
      verticalAlign === 'flex-start' || verticalAlign === 'center' ? 'auto' : undefined};
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
  forwardRef<HTMLDivElement, IReqoreControlGroupProps>(
    (
      {
        children,
        className,
        minimal,
        size = 'normal',
        gapSize = 'normal',
        fluid,
        flat,
        fixed,
        rounded = true,
        wrap,
        stack,
        isInsideStackGroup,
        isInsideVerticalGroup,
        isFirstInLastGroup,
        isLastInFirstGroup,
        isLastInLastGroup,
        intent,
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
        ...rest
      }: IReqoreControlGroupProps,
      ref
    ) => {
      const { targetRef } = useCombinedRefs(ref);
      const isStack = stack || isInsideStackGroup;
      const isVertical = vertical || isInsideVerticalGroup;
      const [overflowingChildren, setOverflowingChildren] = useState<number | undefined>(0);
      const [lastReSize, setLastReSize] = useState<number>(0);
      const [visibility, setVisibility] = useState<'hidden' | 'visible'>('visible');
      const observer = useRef<ResizeObserver | null>(null);

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

      const checkIfOverflowing = () => {
        return (
          !isChild &&
          targetRef.current &&
          targetRef.current.scrollWidth > targetRef.current.clientWidth
        );
      };

      // useEffect(() => {
      //   if (isResizing) {
      //     if (checkIfOverflowing()) {
      //       setOverflowingChildren(0);
      //     } else {
      //       setIsResizing(false);
      //     }
      //   }
      // }, [isResizing]);

      useMount(() => {
        if (!isChild && !vertical) {
          if ('ResizeObserver' in window) {
            observer.current = new ResizeObserver(() => {
              if (targetRef && targetRef.current) {
                setOverflowingChildren(0);
                setLastReSize(targetRef.current.clientWidth);
                // console.log(targetRef.current.scrollWidth, targetRef.current.clientWidth);
                // if (checkIfOverflowing()) {
                //   setOverflowingChildren((cur) =>
                //     cur === React.Children.count(children) - 1 ? cur : cur + 1
                //   );
                // } else {
                //   console.log('not overflowing');
                //   setOverflowingChildren((cur) => (cur === 0 ? cur : cur - 1));
                // }
              }
            });

            observer.current.observe(targetRef.current);
          }
        }
      });

      useEffect(() => {
        // Is the control group still overflowing?
        if ((overflowingChildren || overflowingChildren === 0) && checkIfOverflowing()) {
          setVisibility('hidden');
          setOverflowingChildren(overflowingChildren + 1);
        } else {
          setVisibility('visible');
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
        const _isFirstGroup =
          !isInsideStackGroup || childrenCount === 1 ? true : isChild ? isFirstGroup : index === 0;

        // If this is the first item
        if (_isFirstGroup && getIsFirst(index)) {
          return RADIUS_FROM_SIZE[size];
        }

        return undefined;
      };

      const getBorderTopRightRadius = (index: number): number | undefined => {
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
        // If this group is not vertical we need to style the very first item
        if (!isVertical || !isStack) {
          const _isFirstGroup =
            !isInsideStackGroup || childrenCount === 1
              ? true
              : isChild
              ? isFirstGroup
              : index === 0;

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
          return React.Children.map(children, (child) => {
            if (child && React.isValidElement(child)) {
              if (child.type === React.Fragment) {
                // just compare to `React.Fragment`
                return cloneThroughFragments(child.props.children);
              }

              let newProps = {
                ...child.props,
                key: index,
                minimal:
                  child.props?.minimal || child.props?.minimal === false
                    ? child.props.minimal
                    : minimal,
                size: child.props?.size || size,
                flat: child.props?.flat || child.props?.flat === false ? child.props.flat : flat,
                fluid:
                  child.props?.fluid || child.props?.fluid === false ? child.props.fluid : fluid,
                fixed:
                  child.props?.fixed || child.props?.fixed === false ? child.props.fixed : fixed,
                stack:
                  child.props?.stack || child.props?.stack === false ? child.props.stack : isStack,
                intent: child.props?.intent || intent,
                isChild: true,
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
                  rounded: !isStack,
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
        ]
      );

      // Remove the overflowing children count from the end of the children array
      const _children = overflowingChildren
        ? [
            ...React.Children.toArray(children).slice(
              0,
              React.Children.toArray(children).length - overflowingChildren
            ),
          ]
        : children;

      return (
        <StyledReqoreControlGroup
          {...rest}
          vertical={vertical}
          style={{
            overflowX: !isChild && React.Children.count(_children) !== 1 ? 'auto' : undefined,
            visibility,
            ...rest.style,
          }}
          size={size}
          gapSize={gapSize}
          ref={targetRef}
          rounded={rounded}
          fluid={fluid}
          fixed={fixed}
          wrap={wrap}
          stack={isStack}
          verticalAlign={verticalAlign}
          horizontalAlign={horizontalAlign}
          className={`${className || ''} reqore-control-group`}
        >
          {cloneThroughFragments(_children)}
          {!isChild && overflowingChildren ? (
            <ReqoreButton icon='More2Line' fixed minimal flat>
              ({overflowingChildren})
            </ReqoreButton>
          ) : null}
        </StyledReqoreControlGroup>
      );
    }
  )
);

export default ReqoreControlGroup;
