import { animated, useTransition } from '@react-spring/web';
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { SPRING_CONFIG } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getMainBackgroundColor } from '../../helpers/colors';
import useLatestZIndex from '../../hooks/useLatestZIndex';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../Panel';

export interface IReqoreDrawerProps extends IReqorePanelProps {
  children?: any;
  isOpen?: boolean;
  isHidden?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
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
  ...rest
}: IReqoreDrawerProps) => {
  const theme = useReqoreTheme('main', customTheme, intent);

  const layout = useMemo(
    () => (position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical'),
    [position]
  );

  const [_isHidden, setIsHidden] = useState<boolean>(isHidden || false);

  const [_size, setSize] = useState<any>({
    width: layout === 'horizontal' ? 'auto' : size || '300px',
    height: layout === 'vertical' ? 'auto' : size || '300px',
  });

  useEffect(() => {
    setSize({
      width: layout === 'horizontal' ? 'auto' : size || '300px',
      height: layout === 'vertical' ? 'auto' : size || '300px',
    });
  }, [position, size]);

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, [position]: '-80px' },
    enter: { opacity: 1, [position]: floating ? '10px' : '0px' },
    leave: { opacity: 0, [position]: '-80px' },
    config: SPRING_CONFIG,
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
      });
    }

    /* Adding a close button to the drawer. */
    if (onClose) {
      actions.push({
        icon: 'CloseLine',
        onClick: onClose,
      });
    }

    return actions;
  }, [hidable, position, onClose]);

  return createPortal(
    transitions((styles, item) =>
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
            maxHeight={layout === 'horizontal' ? maxSize : undefined}
            minHeight={layout === 'horizontal' ? (_isHidden ? 0 : minSize) : undefined}
            maxWidth={layout === 'vertical' ? maxSize : undefined}
            minWidth={layout === 'vertical' ? (_isHidden ? 0 : minSize) : undefined}
            as={StyledDrawerResizable}
            style={
              {
                zIndex: wrapperZIndex,
                display: 'flex',
                position: 'fixed',
                overflow: hidable ? undefined : 'hidden',
                top:
                  position === 'top' || layout === 'vertical' ? (floating ? '10px' : 0) : undefined,
                bottom:
                  position === 'bottom' || layout === 'vertical'
                    ? floating
                      ? '10px'
                      : 0
                    : undefined,
                right:
                  position === 'right' || layout === 'horizontal'
                    ? floating
                      ? '10px'
                      : 0
                    : undefined,
                left:
                  position === 'left' || layout === 'horizontal'
                    ? floating
                      ? '10px'
                      : 0
                    : undefined,
                ...styles,
              } as any
            }
            handleWrapperStyle={{
              zIndex: wrapperZIndex + 1,
            }}
            size={{
              width: layout === 'vertical' ? (_isHidden ? 0 : _size.width) : 'auto',
              height: layout === 'horizontal' ? (_isHidden ? 0 : _size.height) : 'auto',
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
              top: resizable && position === 'bottom' ? true : false,
              right: resizable && position === 'left' ? true : false,
              left: resizable && position === 'right' ? true : false,
              bottom: resizable && position === 'top' ? true : false,
              bottomLeft: false,
              bottomRight: false,
              topLeft: false,
              topRight: false,
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
                    className='reqore-drawer-control reqore-drawer-hide'
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
                rounded={floating}
                flat={flat}
                className={`${className || ''} reqore-drawer`}
                style={{
                  width: _size.width,
                  height: _size.height,
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
