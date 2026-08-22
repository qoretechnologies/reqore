import { forwardRef, memo, ReactNode } from 'react';
import styled from 'styled-components';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { omitStyleProps } from '../../helpers/styled';
import { IWithReqoreFluid, IWithReqoreSize } from '../../types/global';

export interface IReqoreControlGroupItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IWithReqoreSize,
    IWithReqoreFluid {
  children?: ReactNode;
  /** Lay the item's own children out in a row instead of a column. */
  horizontal?: boolean;
  /**
   * Gap between the item's own children. Defaults to NO gap: the item stands in
   * for a single child, so it must not inject spacing the wrapped elements did
   * not already have. Pass a size to opt in.
   */
  gapSize?: TSizes;
  /** Do not grow — the group leaves the item at its content width. */
  fixed?: boolean;

  /**
   * `ReqoreControlGroup` clones these onto every non-intrinsic child. They are
   * accepted so the item is a valid group child, and dropped before the DOM so
   * React does not warn about unknown attributes. They intentionally do NOT
   * cascade to the item's own children — the item is a layout slot, not a
   * nested group; making it re-apply them is exactly what stops it standing in
   * transparently for the child it replaces.
   */
  minimal?: boolean;
  flat?: boolean;
  fill?: boolean;
  stack?: boolean;
  spaceBetween?: boolean;
  intent?: string;
  customTheme?: any;
}

export const StyledReqoreControlGroupItem = styled.div.withConfig({
  shouldForwardProp: omitStyleProps(
    'customTheme',
    'fill',
    'fixed',
    'flat',
    'fluid',
    'gapSize',
    'horizontal',
    'intent',
    'minimal',
    'size',
    'spaceBetween',
    'stack'
  ),
})<IReqoreControlGroupItemProps>`
  display: flex;
  flex-flow: ${({ horizontal }) => (horizontal ? 'row' : 'column')};
  gap: ${({ gapSize }) => (gapSize ? `${GAP_FROM_SIZE[gapSize]}px` : undefined)};

  /* Mirrors StyledReqoreControlGroup's own child sizing so the item occupies
     the slot exactly as the single child it stands in for would have. */
  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? undefined : '0 0 auto')};
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};

  /* A flex item's automatic minimum size is its content, which is what turns an
     over-wide child into an overflow instead of a shrink. */
  min-width: 0;
`;

/**
 * A neutral slot that makes several elements count as ONE child of a
 * `ReqoreControlGroup`.
 *
 * A control group sizes each of its children individually, and React fragments
 * are transparent in the DOM — so a component that renders `<>…</>` into a group
 * silently becomes N flex items competing for width rather than one. Where the
 * leading element is full-width and cannot shrink, the remaining elements are
 * pushed outside the container entirely.
 *
 * Wrapping them in this item restores the intent. It is deliberately NOT a
 * nested `ReqoreControlGroup`: a nested group applies its own sizing semantics
 * to its children, so it does not stand in transparently for the child it
 * replaced — see reqore#632 for the measurements showing each nested-group
 * variant traded one layout change for another.
 *
 * ```tsx
 * <ReqoreControlGroup>
 *   <ReqoreControlGroupItem fluid>
 *     <ReqorePanel label='Schema type'>…</ReqorePanel>
 *     <ReqoreColumns minColumnWidth='400px'>…</ReqoreColumns>
 *   </ReqoreControlGroupItem>
 *   <ReqoreButton icon='MoreLine' fixed />
 * </ReqoreControlGroup>
 * ```
 */
export const ReqoreControlGroupItem = memo(
  forwardRef<HTMLDivElement, IReqoreControlGroupItemProps>(
    ({ children, className, ...rest }, ref) => (
      <StyledReqoreControlGroupItem
        {...rest}
        ref={ref}
        className={`${className || ''} reqore-control-group-item`.trim()}
      >
        {children}
      </StyledReqoreControlGroupItem>
    )
  )
);

ReqoreControlGroupItem.displayName = 'ReqoreControlGroupItem';

export default ReqoreControlGroupItem;
