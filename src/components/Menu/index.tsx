import { Resizable, ResizableProps } from 're-resizable';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
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
  IWithReqoreTransparent,
} from '../../types/global';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';

export interface IReqoreMenuProps
  extends IReqoreComponent,
    IWithReqoreMinimal,
    IWithReqoreTransparent,
    IWithReqoreSize,
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
}

const StyledReqoreMenu = styled.div<IReqoreMenuStyle>`
  width: ${({ width }) => width || undefined};
  min-width: ${({ width }) => (width ? undefined : '160px')};
  padding: ${({ padded = true, _size }) =>
    padded ? `${HALF_PADDING_FROM_SIZE[_size]}px` : undefined};
  max-height: ${({ maxHeight }) => maxHeight || undefined};
  overflow-y: auto;
  overflow-x: hidden;

  background-color: ${({ theme, transparent }) =>
    transparent ? 'transparent' : changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border-radius: ${({ rounded, _size }) => (rounded ? `${RADIUS_FROM_SIZE[_size]}px` : `0`)};

  ${({ theme, position, _size, padded, isResizableLeft, showResizableBorder }) =>
    position === 'right' || (isResizableLeft && showResizableBorder)
      ? css`
          border-left: 1px ${isResizableLeft && showResizableBorder ? 'dashed' : 'solid'}
            ${changeLightness(theme.main, 0.05)};
          padding-left: ${!padded ? `${HALF_PADDING_FROM_SIZE[_size]}px` : undefined};
        `
      : undefined}

  ${({ theme, position, _size, padded, isResizableRight, showResizableBorder }) =>
    position === 'left' || (isResizableRight && showResizableBorder)
      ? css`
          border-right: 1px ${isResizableRight && showResizableBorder ? 'dashed' : 'solid'}
            ${changeLightness(theme.main, 0.05)};
          padding-right: ${!padded ? `${HALF_PADDING_FROM_SIZE[_size]}px` : undefined};
        `
      : undefined}
`;

const ReqoreMenu = forwardRef<HTMLDivElement, IReqoreMenuProps>(
  (
    {
      children,
      position,
      _insidePopover,
      _popoverId,
      customTheme,
      intent,
      wrapText,
      flat = true,
      minimal,
      size = 'normal',
      itemGap,
      resizable,
      ...rest
    }: IReqoreMenuProps,
    ref
  ) => {
    const theme = useReqoreTheme('main', customTheme, intent);
    const { targetRef } = useCombinedRefs(ref);
    const { clone } = useCloneThroughFragments((props) => ({
      _insidePopover: props?._insidePopover ?? _insidePopover,
      _popoverId: props?._popoverId ?? _popoverId,
      customTheme: props?.customTheme || theme,
      wrap: 'wrap' in (props || {}) ? props.wrap : wrapText,
      flat: 'flat' in (props || {}) ? props.flat : flat,
      minimal: 'minimal' in (props || {}) ? props.minimal : minimal,
      size: 'size' in (props || {}) ? props.size : size,
    }));

    return (
      <ReqoreThemeProvider theme={theme}>
        <StyledReqoreMenu
          {...rest}
          {...resizable}
          as={!!resizable ? Resizable : 'div'}
          isResizableRight={resizable?.enable?.right}
          isResizableLeft={resizable?.enable?.left}
          flat={flat}
          position={position}
          _size={size}
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
          <ReqoreControlGroup vertical gapSize={itemGap} fluid>
            {clone(children)}
          </ReqoreControlGroup>
        </StyledReqoreMenu>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMenu;
