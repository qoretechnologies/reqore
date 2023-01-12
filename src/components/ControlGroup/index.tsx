import React, { forwardRef, memo, useMemo } from 'react';
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
  wrap?: boolean;
  isInsideStackGroup?: boolean;
  isInsideVerticalGroup?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isLastInFirstGroup?: boolean;
  isLastInLastGroup?: boolean;
  isFirstInLastGroup?: boolean;
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
        ...rest
      }: IReqoreControlGroupProps,
      ref
    ) => {
      const isStack = stack || isInsideStackGroup;
      const isVertical = vertical || isInsideVerticalGroup;
      const realChildCount = useMemo((): number => {
        const count = React.Children.toArray(children).filter((child: any) => child).length;

        return count < 0 ? 0 : count;
      }, [children]);

      const getIsFirst = (index: number): boolean => {
        return !isInsideStackGroup ? index === 0 : (isFirst || isFirst !== false) && index === 0;
      };
      const getIsLast = (index: number): boolean => {
        return !isInsideStackGroup
          ? index === realChildCount - 1
          : (isLast || isLast !== false) && index === realChildCount - 1;
      };
      const getIsLastInFirstGroup = (index: number): boolean => {
        return !isInsideStackGroup
          ? index === 0
          : (isFirst || isFirst !== false) && index === realChildCount - 1;
      };
      const getIsFirstInLastGroup = (index: number): boolean => {
        return !isInsideStackGroup
          ? index === realChildCount - 1
          : (isLast || isLast !== false) && index === 0;
      };
      const getIsLastInLastGroup = (index: number): boolean => {
        return !isInsideStackGroup
          ? index === realChildCount - 1
          : (isLast || isLast !== false) && index === realChildCount - 1;
      };

      const getBorderTopLeftRadius = (index: number): number | undefined => {
        // IF this group does not stack
        if (!isStack) {
          return undefined;
        }
        // If this is the first item
        if (getIsFirst(index)) {
          return RADIUS_FROM_SIZE[size];
        }

        return undefined;
      };

      const getBorderTopRightRadius = (index: number): number | undefined => {
        // IF this group does not stack
        if (!isStack) {
          return undefined;
        }

        // If this group is not vertical we need to style the very last item
        if (!isVertical) {
          if (getIsLast(index)) {
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
        // IF this group does not stack
        if (!isStack) {
          return undefined;
        }

        // If this group is not vertical we need to style the very first item
        if (!isVertical) {
          if (getIsFirst(index)) {
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
        // IF this group does not stack
        if (!isStack) {
          return undefined;
        }

        // If this is the last item
        if (getIsLast(index)) {
          return RADIUS_FROM_SIZE[size];
        }

        return undefined;
      };

      let index = 0;

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
          className={`${className || ''} reqore-control-group`}
        >
          {React.Children.map(children, (child) => {
            /*
             * Because of the way React.Children.map works, we have to
             * manually decrement the index for every child that is `null`
             * because react maps through null children and returns them in `Count`
             * We filter these children out in the `realChildCount` variable,
             * but the index is still incremented
             * */
            const result = child
              ? React.cloneElement(child, {
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
                    child.props?.stack || child.props?.stack === false
                      ? child.props.stack
                      : isStack,
                  intent: child.props?.intent || intent,
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
                  isFirst: getIsFirst(index),
                  isLast: getIsLast(index),
                  isLastInFirstGroup: getIsLastInFirstGroup(index),
                  isLastInLastGroup: getIsLastInLastGroup(index),
                  isFirstInLastGroup: getIsFirstInLastGroup(index),
                })
              : null;

            /*
             * Because of the way React.Children.map works, we have to
             * manually decrement the index for every child that is `null`
             * because react maps through null children and returns them in `Count`
             * We filter these children out in the `realChildCount` variable,
             * but the index is still incremented
             * */
            index = !child ? index : index + 1;

            return result;
          })}
        </StyledReqoreControlGroup>
      );
    }
  )
);

export default ReqoreControlGroup;
