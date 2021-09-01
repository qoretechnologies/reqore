import { animated, useTransition } from '@react-spring/web';
import { preview } from '@reactpreview/config';
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { SPRING_CONFIG } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getMainBackgroundColor, getReadableColor } from '../../helpers/colors';
import useLatestZIndex from '../../hooks/useLatestZIndex';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';

export interface IReqoreDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  isOpen?: boolean;
  isHidden?: boolean;
  customTheme?: IReqoreTheme;
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
  flat?: boolean;
  floating?: boolean;
  padded?: boolean;
}

export interface IReqoreDrawerStyle extends IReqoreDrawerProps {
  theme: IReqoreTheme;
  width?: number | string;
  height?: number | string;
  w?: number | string;
  h?: number | string;
}

export const StyledDrawer = styled.div<IReqoreDrawerStyle>`
  background-color: ${({ theme, opacity = 1 }) => rgba(getMainBackgroundColor(theme), opacity)};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  border-radius: ${({ floating }) => (floating ? 10 : 0)}px;
  padding: ${({ padded }) => (padded ? 10 : 0)}px;
  box-shadow: ${({ floating }) =>
    floating ? `0px 0px 30px 0px ${rgba('#000000', 0.4)}` : undefined};
  overflow: hidden;
  display: flex;
  flex-flow: column;

  ${({ theme, flat, floating }) =>
    !flat && floating
      ? css`
          border: 1px solid ${changeLightness(getMainBackgroundColor(theme), 0.2)};
        `
      : undefined}
`;

export const StyledVerticalDrawer = styled(StyledDrawer)<IReqoreDrawerStyle>`
  height: 100%;
  width: 100%;

  ${({ position, theme, flat, floating }) =>
    !flat && !floating
      ? css`
    border-${position === 'left' ? 'right' : 'left'}: 1px solid ${changeLightness(
          getMainBackgroundColor(theme),
          0.2
        )};
  `
      : undefined}
`;

export const StyledHorizontalDrawer = styled(StyledDrawer)<IReqoreDrawerStyle>`
  height: 100%;
  width: 100%;

  ${({ position, theme, flat, floating }) =>
    !flat && !floating
      ? css`
    border-${position === 'top' ? 'bottom' : 'top'}: 1px solid ${changeLightness(
          getMainBackgroundColor(theme),
          0.2
        )};
  `
      : undefined}
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
          margin-top: -25px;
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
          margin-left: -30px;
          > * {
            margin-top: 5px;
          }
        `;
    }
  }}
`;

export const StyledBackdrop = styled.div<
  IReqoreDrawerStyle & { closable: boolean; zIndex?: number }
>`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: ${({ zIndex }) => zIndex};
  background-color: ${({ theme }) => rgba(getMainBackgroundColor(theme), 0.8)};
  cursor: ${({ closable }) => (closable ? 'pointer' : 'initial')};
`;

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
  minSize = '55px',
  onClose,
  hasBackdrop,
  size,
  resizable,
  hidable,
  onHideToggle,
  className,
  flat,
  floating,
  ...rest
}: IReqoreDrawerProps) => {
  const theme = useReqoreTheme('main', customTheme);

  const layout = useMemo(
    () => (position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical'),
    [position]
  );

  const [_isHidden, setIsHidden] = useState<boolean>(isHidden || false);

  const [_size, setSize] = useState<any>({
    width: layout === 'horizontal' ? 'auto' : size || '300px',
    height: layout === 'vertical' ? 'auto' : size || '300px',
  });

  const Wrapper = useMemo(
    () =>
      position === 'top' || position === 'bottom' ? StyledHorizontalDrawer : StyledVerticalDrawer,
    [position]
  );

  useEffect(() => {
    setSize({
      width: layout === 'horizontal' ? 'auto' : size || '300px',
      height: layout === 'vertical' ? 'auto' : size || '300px',
    });
  }, [position, size]);

  const transitions = useTransition(isOpen, {
    from: { opacity: 0, [position]: '-30px' },
    enter: { opacity: 1, [position]: floating ? '10px' : '0px' },
    config: SPRING_CONFIG,
  });
  const zIndex = useLatestZIndex();

  return transitions(
    (styles, item) =>
      item &&
      createPortal(
        <ReqoreThemeProvider theme={theme}>
          {hasBackdrop && !_isHidden ? (
            <StyledBackdrop
              className='reqore-drawer-backdrop'
              onClick={() => onClose && onClose()}
              closable={!!onClose}
              zIndex={zIndex}
            />
          ) : null}
          <Resizable
            className='reqore-drawer-resizable'
            maxHeight={layout === 'horizontal' ? maxSize : undefined}
            minHeight={layout === 'horizontal' ? (_isHidden ? 0 : minSize) : undefined}
            maxWidth={layout === 'vertical' ? maxSize : undefined}
            minWidth={layout === 'vertical' ? (_isHidden ? 0 : minSize) : undefined}
            as={animated.div}
            style={
              {
                zIndex,
                display: 'flex',
                position: 'fixed',
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
            {onClose || hidable ? (
              <StyledCloseWrapper
                className='reqore-drawer-controls'
                position={position}
                w={layout === 'vertical' && _isHidden ? 0 : _size.width}
                h={layout === 'horizontal' && _isHidden ? 0 : _size.height}
              >
                {onClose && (
                  <ReqoreButton
                    size='small'
                    flat={flat}
                    icon='CloseLine'
                    onClick={() => onClose && onClose()}
                    className='reqore-drawer-control reqore-drawer-close'
                  />
                )}
                {hidable && (
                  <ReqoreButton
                    size='small'
                    flat={flat}
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
              <Wrapper
                {...rest}
                flat={flat}
                className={`${className || ''} reqore-drawer`}
                width={_size.width}
                height={_size.height}
                position={position}
                floating={floating}
              >
                {children}
              </Wrapper>
            )}
          </Resizable>
        </ReqoreThemeProvider>,
        document.querySelector('#reqore-portal')
      )
  );
};

preview(ReqoreDrawer, {
  base: {
    children: <p>Hello</p>,
    isOpen: true,
    position: 'top',
  },
  Right: {
    position: 'bottom',
    resizable: true,
    hidable: true,
  },
});
