import { Resizable, ResizableProps } from 're-resizable';
import React, { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { ReqoreErrorBoundary } from '../..';
import { HALF_PADDING_FROM_SIZE, RADIUS_FROM_SIZE } from '../../constants/sizes';
import { IReqoreCustomTheme, IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeDarkness, changeLightness, getMainBackgroundColor } from '../../helpers/colors';
import { useCloneThroughFragments } from '../../hooks/useCloneThroughFragments';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreComponent,
  IWithReqoreMinimal,
  IWithReqoreSize,
  IWithReqoreSkeleton,
  IWithReqoreTransparent,
} from '../../types/global';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import { ReqoreSkeleton } from '../Skeleton';

export interface IReqoreMenuProps
  extends IReqoreComponent,
    IWithReqoreMinimal,
    IWithReqoreTransparent,
    IWithReqoreSize,
    IWithReqoreSkeleton,
    React.HTMLAttributes<HTMLDivElement> {
  children: any;
  position?: 'left' | 'right';
  width?: string;
  maxHeight?: string;
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  wrapText?: boolean;
  flat?: boolean;
  rounded?: boolean;
  padded?: boolean;
  itemGap?: IReqoreControlGroupProps['gapSize'];
  resizable?: Omit<ResizableProps, 'enable'> & {
    enable?: Pick<ResizableProps['enable'], 'left' | 'right'>;
  };
  showResizableBorder?: boolean;
}

export interface IReqoreMenuStyle extends IReqoreMenuProps {
  theme: IReqoreTheme;
  $padded?: boolean;
  $size?: string;
  $transparent?: boolean;
  $rounded?: boolean;
  $position?: 'left' | 'right';
  $isResizableLeft?: boolean;
  $isResizableRight?: boolean;
  $showResizableBorder?: boolean;
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: ${({ width }) => width || undefined};
  min-width: ${({ width }) => (width ? undefined : '160px')};
  padding: ${({ $padded = true, $size }) =>
    $padded ? `${HALF_PADDING_FROM_SIZE[$size]}px` : undefined};
  max-height: ${({ maxHeight }) => maxHeight || undefined};
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-flow: column nowrap;

  background-color: ${({ theme, $transparent }) =>
    $transparent ? 'transparent' : changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border-radius: ${({ $rounded, $size }) => ($rounded ? `${RADIUS_FROM_SIZE[$size]}px` : `0`)};

  ${({ theme, $position, $size, $padded, $isResizableLeft, $showResizableBorder }) =>
    $position === 'right' || ($isResizableLeft && $showResizableBorder)
      ? css`
          border-left: 1px ${$isResizableLeft && $showResizableBorder ? 'dashed' : 'solid'}
            ${changeLightness(theme.main, 0.05)};
          padding-left: ${!$padded ? `${HALF_PADDING_FROM_SIZE[$size]}px` : undefined};
        `
      : undefined}

  ${({ theme, $position, $size, $padded, $isResizableRight, $showResizableBorder }) =>
    $position === 'left' || ($isResizableRight && $showResizableBorder)
      ? css`
          border-right: 1px ${$isResizableRight && $showResizableBorder ? 'dashed' : 'solid'}
            ${changeLightness(theme.main, 0.05)};
          padding-right: ${!$padded ? `${HALF_PADDING_FROM_SIZE[$size]}px` : undefined};
        `
      : undefined}
`;

const ReqoreMenu = memo(
  forwardRef<HTMLDivElement, IReqoreMenuProps>(
    (
      {
        children,
        position,
        customTheme,
        intent,
        wrapText,
        flat = true,
        minimal,
        size = 'normal',
        itemGap,
        resizable,
        skeleton,
        closePopover,
        errorBoundaryOptions,
        ...rest
      }: IReqoreMenuProps,
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);
      const { targetRef } = useCombinedRefs(ref);
      const { clone } = useCloneThroughFragments((props) => ({
        customTheme: props?.customTheme || theme,
        wrap: 'wrap' in (props || {}) ? props.wrap : wrapText,
        flat: 'flat' in (props || {}) ? props.flat : flat,
        minimal: 'minimal' in (props || {}) ? props.minimal : minimal,
        size: 'size' in (props || {}) ? props.size : size,
        closePopover,
      }));

      const style = useMemo(() => ({ minHeight: '0', flex: '1 1 auto' }), []);

      return (
        <ReqoreErrorBoundary {...errorBoundaryOptions}>
          <ReqoreThemeProvider theme={theme}>
            <StyledReqoreMenu
              {...rest}
              {...resizable}
              as={!!resizable ? Resizable : 'div'}
              width={rest.width}
              maxHeight={rest.maxHeight}
              $isResizableRight={resizable?.enable?.right}
              $isResizableLeft={resizable?.enable?.left}
              $position={position}
              $size={size}
              $padded={rest.padded}
              $transparent={rest.transparent}
              $rounded={rest.rounded}
              $showResizableBorder={rest.showResizableBorder}
              className={`${rest.className || ''} reqore-menu`}
              theme={theme}
              ref={(curRef) => {
                let _ref = curRef;

                if (curRef?.resizable) {
                  _ref = curRef.resizable;
                }

                targetRef.current = _ref;
              }}
            >
              <ReqoreControlGroup vertical gapSize={itemGap} fluid style={style}>
                {skeleton
                  ? React.Children.map(children, (_child, index) => (
                      <ReqoreSkeleton key={index} size={size} width='100%' />
                    ))
                  : clone(children)}
              </ReqoreControlGroup>
            </StyledReqoreMenu>
          </ReqoreThemeProvider>
        </ReqoreErrorBoundary>
      );
    }
  )
);

export default ReqoreMenu;
