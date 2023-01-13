import React, { forwardRef, memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { GAP_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  IReqoreIntent,
  IWithReqoreFlat,
  IWithReqoreMinimal,
  IWithReqoreSize,
} from '../../types/global';

export interface IReqoreControlGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreMinimal,
    IReqoreIntent {
  stack?: boolean;
  children: any;
  fluid?: boolean;
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
  width: ${({ fluid }) => (fluid ? '100%' : undefined)};
  justify-content: ${({ fluid, vertical, horizontalAlign, verticalAlign }) =>
    vertical ? verticalAlign : fluid ? 'stretch' : horizontalAlign};
  align-items: ${({ vertical, horizontalAlign, verticalAlign, fluid }) =>
    vertical ? (fluid ? 'stretch' : horizontalAlign) : verticalAlign};
  flex-flow: ${({ vertical }) => (vertical ? 'column' : 'row')};
  gap: ${({ gapSize, stack }) => (!stack ? `${GAP_FROM_SIZE[gapSize]}px` : undefined)};
  flex-wrap: ${({ wrap }) => (wrap ? 'wrap' : 'nowrap')};

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
      const isStack = stack || isInsideStackGroup;
      const isVertical = vertical || isInsideVerticalGroup;
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
                stack:
                  child.props?.stack || child.props?.stack === false ? child.props.stack : isStack,
                intent: child.props?.intent || intent,
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
                  isChild: true,
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

      return (
        <StyledReqoreControlGroup
          {...rest}
          vertical={vertical}
          size={size}
          gapSize={gapSize}
          ref={ref}
          rounded={rounded}
          fluid={fluid}
          wrap={wrap}
          stack={isStack}
          verticalAlign={verticalAlign}
          horizontalAlign={horizontalAlign}
          className={`${className || ''} reqore-control-group`}
        >
          {cloneThroughFragments(children)}
        </StyledReqoreControlGroup>
      );
    }
  )
);

export default ReqoreControlGroup;
