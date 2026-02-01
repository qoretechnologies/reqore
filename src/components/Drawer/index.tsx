import { animated, useTransition } from '@react-spring/web';
import { Resizable } from 're-resizable';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../..';
import { SPRING_CONFIG, SPRING_CONFIG_NO_ANIMATIONS } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import { IReqoreConfirmationModal } from '../../containers/ReqoreProvider';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../Panel';
import { ReqoreBackdrop } from './backdrop';

export type TPosition = 'top' | 'bottom' | 'left' | 'right';

export interface IReqoreDrawerProps extends Omit<IReqorePanelProps, 'size' | 'resizable'> {
  children?: any;
  isOpen?: boolean;
  isHidden?: boolean;
  position?: TPosition;
  hidable?: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onHideToggle?: (isHidden: boolean) => void;
  hasBackdrop?: boolean;
  size?: string | 'auto';
  panelSize?: IReqorePanelProps['size'];
  maxSize?: string;
  minSize?: string;
  opacity?: number;
  floating?: boolean;
  blur?: number;
  _isModal?: boolean;
  width?: number | string;
  height?: number | string;
  customZIndex?: number;
  closeOnEscPress?: boolean;
  confirmOnClose?: boolean | IReqoreConfirmationModal;
  /** Whether to trap focus within the drawer when open. Defaults to true for modals and drawers with backdrop. */
  focusTrap?: boolean;
}

export interface IReqoreDrawerStyle extends IReqoreDrawerProps {
  theme: IReqoreTheme;
  width?: number | string;
  height?: number | string;
  w?: number | string;
  h?: number | string;
}

export const StyledWrapper = styled.div<IReqoreDrawerStyle>`
  z-index: ${({ zIndex }) => zIndex};
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

export const StyledCloseWrapper = styled.div<IReqoreDrawerStyle>`
  position: absolute;

  ${({ position, w, h }) => {
    switch (position) {
      case 'bottom':
        return css`
          display: flex;
          right: 0;
          justify-content: flex-end;
          margin-top: -35px;
          > * {
            margin-right: 5px;
          }
        `;
      case 'top':
        return css`
          display: flex;
          right: 0;
          justify-content: flex-end;
          margin-top: calc(${h || '0px'} + 5px);
          > * {
            margin-right: 5px;
          }
        `;
      case 'left':
        return css`
          display: flex;
          flex-flow: column;
          top: 0;
          margin-left: calc(${w || '0px'} + 5px);
          > * {
            margin-top: 5px;
          }
        `;
      case 'right':
        return css`
          display: flex;
          flex-flow: column;
          top: 0;
          margin-left: -35px;
          > * {
            margin-top: 5px;
          }
        `;
    }
  }}
`;

export const StyledDrawerResizable = styled(animated.div)`
  pointer-events: auto;
`;

/**
 * It returns an icon name based on the position and whether the panel is hidden or not
 * @param {'top' | 'bottom' | 'left' | 'right'} position - The position of the panel.
 * @param {boolean} isHidden - boolean - This is a boolean value that determines whether the panel is
 * hidden or not.
 * @returns A function that takes two arguments, position and isHidden, and returns an IReqoreIconName.
 */
const getHideShowIcon = (
  position: 'top' | 'bottom' | 'left' | 'right',
  isHidden: boolean
): IReqoreIconName => {
  switch (position) {
    case 'top':
      return isHidden ? 'ArrowDownSLine' : 'ArrowUpSLine';
    case 'bottom':
      return isHidden ? 'ArrowUpSLine' : 'ArrowDownSLine';
    case 'left':
      return isHidden ? 'ArrowRightSLine' : 'ArrowLeftSLine';
    case 'right':
      return isHidden ? 'ArrowLeftSLine' : 'ArrowRightSLine';
  }
};

const getSpringConfig = (isModal?: boolean, position?: TPosition, floating?: boolean) =>
  isModal
    ? {
        from: { opacity: 0, transform: 'scale(0.5)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0.5)' },
      }
    : {
        from: { opacity: 0, [position]: '-80px' },
        enter: { opacity: 1, [position]: floating ? '10px' : '0px' },
        leave: { opacity: 0, [position]: '-80px' },
      };

export const ReqoreDrawer: React.FC<IReqoreDrawerProps> = memo(
  ({
    children,
    isOpen,
    isHidden,
    customTheme,
    position = 'right',
    maxSize,
    minSize = '150px',
    onClose,
    hasBackdrop = true,
    size,
    resizable = true,
    hidable,
    onHideToggle,
    className,
    flat,
    floating,
    blur,
    opacity,
    intent,
    _isModal,
    width,
    height,
    actions = [],
    customZIndex,
    panelSize,
    confirmOnClose,
    focusTrap,
    ...rest
  }: IReqoreDrawerProps) => {
    // Ref for the drawer wrapper to enable focus trapping
    const drawerRef = useRef<HTMLDivElement>(null);
    const animations = useReqoreProperty('animations');
    const confirmAction = useReqoreProperty('confirmAction');
    const customPortalId = useReqoreProperty('customPortalId');
    const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
    const theme = useReqoreTheme('main', customTheme, intent);
    const layout = useMemo(
      () =>
        _isModal
          ? 'center'
          : position === 'top' || position === 'bottom'
          ? 'horizontal'
          : 'vertical',
      [position, _isModal]
    );
    const [_isHidden, setIsHidden] = useState<boolean>(isHidden || false);
    const [_size, setSize] = useState<any>({
      width: width || (layout === 'horizontal' ? 'auto' : size || '300px'),
      height: height || (layout === 'vertical' ? 'auto' : size || '300px'),
    });

    // Determine if focus trap should be active
    // By default, enable focus trap for modals and drawers with backdrop
    const shouldTrapFocus = focusTrap ?? (_isModal || hasBackdrop);

    // Use focus trap to keep focus within the drawer when open
    useFocusTrap(drawerRef, {
      active: isOpen && shouldTrapFocus && !_isHidden,
      restoreFocus: true,
      autoFocus: true,
    });

    useEffect(() => {
      setSize({
        width: width || (layout === 'horizontal' ? 'auto' : size || '300px'),
        height: height || (layout === 'vertical' ? 'auto' : size || '300px'),
      });
    }, [position, size, width, height]);

    const transitions = useTransition(isOpen, {
      ...getSpringConfig(_isModal, position, floating),
      config: animations.dialogs ? SPRING_CONFIG : SPRING_CONFIG_NO_ANIMATIONS,
    });

    const zIndex = useMemo(
      () => customZIndex || getAndIncreaseZIndex(),
      [customZIndex, getAndIncreaseZIndex]
    );
    const wrapperZIndex = useMemo(
      () => customZIndex + 1 || getAndIncreaseZIndex(),
      [customZIndex, getAndIncreaseZIndex]
    );
    const _actions: IReqorePanelAction[] = useMemo(() => {
      const builtActions: IReqorePanelAction[] = [...actions];

      /* Adding a hide/show button to the drawer. */
      if (hidable) {
        builtActions.push({
          responsive: false,
          icon: getHideShowIcon(position, _isHidden),
          onClick: () => {
            setIsHidden(!_isHidden);

            if (onHideToggle) {
              onHideToggle(!_isHidden);
            }
          },
          className: 'reqore-drawer-hide-button',
        });
      }

      return builtActions;
    }, [hidable, position, onClose, actions, _isHidden]);

    const positions = useMemo(() => {
      /* Centering the modal. */
      if (_isModal) {
        return {};
      }

      return {
        top: position === 'top' || layout === 'vertical' ? (floating ? '10px' : 0) : undefined,
        bottom:
          position === 'bottom' || layout === 'vertical' ? (floating ? '10px' : 0) : undefined,
        right:
          position === 'right' || layout === 'horizontal' ? (floating ? '10px' : 0) : undefined,
        left: position === 'left' || layout === 'horizontal' ? (floating ? '10px' : 0) : undefined,
      };
    }, [_isModal, position, layout, floating]);

    const handleClose = onClose
      ? () => {
          if (confirmOnClose) {
            confirmAction({
              ...(typeof confirmOnClose === 'object' ? confirmOnClose : {}),
              onConfirm: onClose,
            });
          } else {
            onClose?.();
          }
        }
      : undefined;

    const closeButtonProps = useMemo(
      () => ({
        className: 'reqore-drawer-close-button',
        ...(rest.closeButtonProps || {}),
      }),
      [rest.closeButtonProps]
    );

    const panelStyle = useMemo(
      () => ({
        width: '100%',
        maxHeight: '100%',
        ...rest.style,
      }),
      [JSON.stringify(rest.style)]
    );

    const resizeableStyle = useMemo(
      () =>
        ({
          zIndex: wrapperZIndex,
          display: 'flex',
          position: 'fixed',
          overflow: hidable ? undefined : 'hidden',
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          ...positions,
        } as any),
      [wrapperZIndex, hidable, positions]
    );

    const handleWrapperStyle = useMemo(
      () => ({
        zIndex: wrapperZIndex + 1,
      }),
      [wrapperZIndex]
    );

    const sizeObject = useMemo(
      () => ({
        width: _isModal
          ? _size.width
          : layout === 'vertical'
          ? _isHidden
            ? 0
            : _size.width
          : 'auto',
        height: _isModal
          ? _size.height
          : layout === 'horizontal'
          ? _isHidden
            ? 0
            : _size.height
          : 'auto',
      }),
      [_isModal, layout, _isHidden, _size]
    );

    const onHideToggleClick = useCallback(() => {
      setIsHidden(!_isHidden);
      onHideToggle?.(!_isHidden);
    }, [_isHidden, onHideToggle]);

    const handleResize = useCallback(
      (_, _direction, component: HTMLElement) => {
        if (resizable) {
          setSize({
            width: component.style.width,
            height: component.style.height,
          });
        }
      },

      [resizable]
    );

    const enable = useMemo(
      () => ({
        top: (resizable && position === 'bottom') || _isModal ? true : false,
        right: (resizable && position === 'left') || _isModal ? true : false,
        left: (resizable && position === 'right') || _isModal ? true : false,
        bottom: (resizable && position === 'top') || _isModal ? true : false,
        bottomLeft: _isModal,
        bottomRight: _isModal,
        topLeft: _isModal,
        topRight: _isModal,
      }),
      [resizable, position, _isModal]
    );

    return createPortal(
      transitions((styles: any, item) =>
        item ? (
          <ReqoreThemeProvider theme={theme}>
            {hasBackdrop && !_isHidden ? (
              <ReqoreBackdrop
                onClose={handleClose}
                zIndex={zIndex}
                blur={blur}
                opacity={styles.opacity}
              />
            ) : null}
            <StyledWrapper
              ref={drawerRef}
              zIndex={wrapperZIndex}
              className='reqore-drawer-wrapper'
              role={_isModal || hasBackdrop ? 'dialog' : undefined}
              aria-modal={_isModal || hasBackdrop ? 'true' : undefined}
            >
              <Resizable
                className={`${className || ''} reqore-drawer-resizable`}
                maxHeight={
                  layout === 'horizontal' || layout === 'center' ? maxSize || '90vh' : undefined
                }
                minHeight={
                  layout === 'center'
                    ? '40px'
                    : layout === 'horizontal'
                    ? _isHidden
                      ? 0
                      : minSize || '40px'
                    : undefined
                }
                maxWidth={
                  layout === 'vertical' || layout === 'center' ? maxSize || '90vw' : undefined
                }
                minWidth={
                  layout === 'center'
                    ? '40px'
                    : layout === 'vertical'
                    ? _isHidden
                      ? 0
                      : minSize || '40px'
                    : undefined
                }
                as={StyledDrawerResizable}
                style={{
                  ...resizeableStyle,
                  ...styles,
                }}
                handleWrapperStyle={handleWrapperStyle}
                size={sizeObject}
                onResize={handleResize}
                enable={enable}
              >
                {_isHidden && hidable ? (
                  <StyledCloseWrapper
                    className='reqore-drawer-controls'
                    position={position}
                    w={layout === 'vertical' ? 0 : _size.width}
                    h={layout === 'horizontal' ? 0 : _size.height}
                  >
                    <ReqoreButton
                      flat
                      customTheme={theme}
                      className='reqore-drawer-control reqore-drawer-hide-button'
                      icon={getHideShowIcon(position, _isHidden)}
                      onClick={onHideToggleClick}
                    />
                  </StyledCloseWrapper>
                ) : null}
                {!_isHidden && (
                  <ReqorePanel
                    {...rest}
                    size={panelSize}
                    opacity={opacity}
                    blur={hasBackdrop ? 0 : blur}
                    actions={_actions}
                    customTheme={customTheme}
                    intent={intent}
                    rounded={floating || _isModal ? true : false}
                    flat={flat}
                    onClose={handleClose}
                    closeButtonProps={closeButtonProps}
                    className={`reqore-drawer`}
                    style={panelStyle}
                  >
                    {children}
                  </ReqorePanel>
                )}
              </Resizable>
            </StyledWrapper>
          </ReqoreThemeProvider>
        ) : null
      ),
      document.querySelector(customPortalId || '#reqore-portal')!
    );
  }
);
