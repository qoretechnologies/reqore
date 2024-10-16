import { animated, useTransition } from '@react-spring/web';
import { Resizable } from 're-resizable';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../..';
import { SPRING_CONFIG, SPRING_CONFIG_NO_ANIMATIONS } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
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

export const ReqoreDrawer: React.FC<IReqoreDrawerProps> = ({
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
  ...rest
}: IReqoreDrawerProps) => {
  const animations = useReqoreProperty('animations');
  const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
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

  const zIndex = useMemo(() => customZIndex || getAndIncreaseZIndex(), [customZIndex]);
  const wrapperZIndex = useMemo(() => customZIndex + 1 || getAndIncreaseZIndex(), [customZIndex]);
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
            <ReqoreBackdrop
              onClose={onClose}
              zIndex={zIndex}
              blur={blur}
              opacity={styles.opacity}
            />
          ) : null}
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
            maxWidth={layout === 'vertical' || layout === 'center' ? maxSize || '90vw' : undefined}
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
                w={layout === 'vertical' ? 0 : _size.width}
                h={layout === 'horizontal' ? 0 : _size.height}
              >
                <ReqoreButton
                  flat
                  customTheme={theme}
                  className='reqore-drawer-control reqore-drawer-hide-button'
                  icon={getHideShowIcon(position, _isHidden)}
                  onClick={() => {
                    setIsHidden(!_isHidden);
                    onHideToggle?.(!_isHidden);
                  }}
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
                onClose={onClose}
                closeButtonProps={{
                  className: 'reqore-drawer-close-button',
                }}
                className={`reqore-drawer`}
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
