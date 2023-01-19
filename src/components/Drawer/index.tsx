import { animated, useTransition } from '@react-spring/web';
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { ReqoreContext } from '../..';
import { SPRING_CONFIG, SPRING_CONFIG_NO_ANIMATIONS } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getMainBackgroundColor } from '../../helpers/colors';
import useLatestZIndex from '../../hooks/useLatestZIndex';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../Panel';

export type TPosition = 'top' | 'bottom' | 'left' | 'right';

export interface IReqoreDrawerProps extends Omit<IReqorePanelProps, 'size'> {
  children?: any;
  isOpen?: boolean;
  isHidden?: boolean;
  position?: TPosition;
  hidable?: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onHideToggle?: (isHidden: boolean) => void;
  hasBackdrop?: boolean;
  size?: string;
  maxSize?: string;
  minSize?: string;
  opacity?: number;
  floating?: boolean;
  blur?: number;
  _isModal?: boolean;
  width?: number | string;
  height?: number | string;
}

export interface IReqoreDrawerStyle extends IReqoreDrawerProps {
  theme: IReqoreTheme;
  width?: number | string;
  height?: number | string;
  w?: number | string;
  h?: number | string;
}

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

export const StyledDrawerResizable = styled(animated.div)``;

export const StyledBackdrop = styled(animated.div)<
  IReqoreDrawerStyle & { closable: boolean; zIndex?: number }
>`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  backdrop-filter: ${({ blur }) => (blur ? `blur(${blur}px)` : undefined)};
  z-index: ${({ zIndex }) => zIndex};
  background-color: ${({ theme }) => rgba(getMainBackgroundColor(theme), 0.3)};
  cursor: ${({ closable }) => (closable ? 'pointer' : 'initial')};
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
        from: { opacity: 0, transform: 'scale(0.5) translate(-50%, -50%)', filter: 'blur(10px)' },
        enter: { opacity: 1, transform: 'scale(1) translate(-50%, -50%)', filter: 'blur(0px)' },
        leave: { opacity: 0, transform: 'scale(0.5) translate(-50%, -50%)', filter: 'blur(10px)' },
      }
    : {
        from: { opacity: 0, [position]: '-80px' },
        enter: { opacity: 1, [position]: floating ? '10px' : '0px' },
        leave: { opacity: 0, [position]: '-80px' },
      };

export const ReqoreDrawer = ({
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
  ...rest
}: IReqoreDrawerProps) => {
  const { animations } = useContext(ReqoreContext);
  const theme = useReqoreTheme('main', customTheme, intent);
  const layout = useMemo(
    () =>
      _isModal ? 'center' : position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical',
    [position, _isModal]
  );
  const [_isHidden, setIsHidden] = useState<boolean>(isHidden || false);
  const [_size, setSize] = useState<any>({
    width: width || (layout === 'horizontal' ? 'auto' : size || '300px'),
    height: height || (layout === 'vertical' ? 'auto' : size || '300px'),
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

  const zIndex = useLatestZIndex();
  const wrapperZIndex = useLatestZIndex();
  const actions: IReqorePanelAction[] = useMemo(() => {
    const actions: IReqorePanelAction[] = [];

    /* Adding a hide/show button to the drawer. */
    if (hidable) {
      actions.push({
        icon: getHideShowIcon(position, _isHidden),
        onClick: () => {
          setIsHidden(!_isHidden);
          if (onHideToggle) {
            onHideToggle(_isHidden);
          }
        },
        className: 'reqore-drawer-hide-button',
      });
    }

    /* Adding a close button to the drawer. */
    if (onClose) {
      actions.push({
        icon: 'CloseLine',
        onClick: onClose,
        className: 'reqore-drawer-close-button',
      });
    }

    return actions;
  }, [hidable, position, onClose]);

  const positions = useMemo(() => {
    /* Centering the modal. */
    if (_isModal) {
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%)',
      };
    }

    return {
      top: position === 'top' || layout === 'vertical' ? (floating ? '10px' : 0) : undefined,
      bottom: position === 'bottom' || layout === 'vertical' ? (floating ? '10px' : 0) : undefined,
      right: position === 'right' || layout === 'horizontal' ? (floating ? '10px' : 0) : undefined,
      left: position === 'left' || layout === 'horizontal' ? (floating ? '10px' : 0) : undefined,
    };
  }, [_isModal, position, layout, floating]);

  return createPortal(
    transitions((styles: any, item) =>
      item ? (
        <ReqoreThemeProvider theme={theme}>
          {hasBackdrop && !_isHidden ? (
            <StyledBackdrop
              className='reqore-drawer-backdrop'
              onClick={() => onClose && onClose()}
              closable={!!onClose}
              zIndex={zIndex}
              blur={blur}
              style={{
                opacity: styles.opacity,
              }}
            />
          ) : null}
          <Resizable
            className='reqore-drawer-resizable'
            maxHeight={
              layout === 'horizontal' || layout === 'center' ? maxSize || '90vh' : undefined
            }
            minHeight={
              layout === 'center'
                ? '140px'
                : layout === 'horizontal'
                ? _isHidden
                  ? 0
                  : minSize || '140px'
                : undefined
            }
            maxWidth={layout === 'vertical' || layout === 'center' ? maxSize || '90vw' : undefined}
            minWidth={
              layout === 'center'
                ? '140px'
                : layout === 'vertical'
                ? _isHidden
                  ? 0
                  : minSize || '140px'
                : undefined
            }
            as={StyledDrawerResizable}
            style={
              {
                zIndex: wrapperZIndex,
                display: 'flex',
                position: 'fixed',
                overflow: hidable ? undefined : 'hidden',
                transformOrigin: 'top left',
                ...positions,
                ...styles,
              } as any
            }
            handleWrapperStyle={{
              zIndex: wrapperZIndex + 1,
            }}
            size={{
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
            }}
            onResize={
              resizable
                ? (_, _direction, component: HTMLElement) => {
                    setSize({
                      width: component.style.width,
                      height: component.style.height,
                    });
                  }
                : undefined
            }
            enable={{
              top: (resizable && position === 'bottom') || _isModal ? true : false,
              right: (resizable && position === 'left') || _isModal ? true : false,
              left: (resizable && position === 'right') || _isModal ? true : false,
              bottom: (resizable && position === 'top') || _isModal ? true : false,
              bottomLeft: _isModal,
              bottomRight: _isModal,
              topLeft: _isModal,
              topRight: _isModal,
            }}
          >
            {_isHidden && hidable ? (
              <StyledCloseWrapper
                className='reqore-drawer-controls'
                position={position}
                w={layout === 'vertical' && _isHidden ? 0 : _size.width}
                h={layout === 'horizontal' && _isHidden ? 0 : _size.height}
              >
                {hidable && (
                  <ReqoreButton
                    flat
                    customTheme={theme}
                    className='reqore-drawer-control reqore-drawer-hide-button'
                    icon={getHideShowIcon(position, _isHidden)}
                    onClick={() => {
                      setIsHidden(!_isHidden);
                      onHideToggle && onHideToggle(!_isHidden);
                    }}
                  />
                )}
              </StyledCloseWrapper>
            ) : null}
            {!_isHidden && (
              <ReqorePanel
                {...rest}
                opacity={opacity}
                blur={hasBackdrop ? 0 : blur}
                actions={actions}
                customTheme={customTheme}
                intent={intent}
                rounded={floating || _isModal ? true : false}
                flat={flat}
                className={`${className || ''} reqore-drawer`}
                style={{
                  width: '100%',
                  maxHeight: '100%',
                  ...rest.style,
                }}
              >
                {children}
              </ReqorePanel>
            )}
          </Resizable>
        </ReqoreThemeProvider>
      ) : null
    ),
    document.querySelector('#reqore-portal')!
  );
};
