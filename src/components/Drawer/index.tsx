import { preview } from '@reactpreview/types';
import { noop } from 'lodash';
import { rgba } from 'polished';
import { Resizable } from 're-resizable';
import { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';

export interface IReqoreDrawerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: any;
  isOpen?: boolean;
  isHidden?: boolean;
  customTheme?: IReqoreTheme;
  position?: 'top' | 'bottom' | 'left' | 'right';
  hidable?: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onHide?: () => void;
  hasBackdrop?: boolean;
  size?: string;
  maxSize?: string;
  minSize?: string;
  opacity?: number;
}

export interface IReqoreDrawerStyle extends IReqoreDrawerProps {
  theme: IReqoreTheme;
  width?: number;
  height?: number;
}

export const StyledDrawer = styled.div<IReqoreDrawerStyle>`
  background-color: ${({ theme, opacity = 1 }) => rgba(theme.main, opacity)};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
`;

export const StyledVerticalDrawer = styled(StyledDrawer)<IReqoreDrawerStyle>`
  top: 0;
  bottom: 0;
  height: ${({ height }: IReqoreDrawerStyle) => height};
  width: ${({ width }: IReqoreDrawerStyle) => width};

  ${({ position, theme }) => css`
    border-${
      position === 'left' ? 'right' : 'left'
    }: 1px solid ${changeLightness(theme.main, 0.2)};
  `}
`;

export const StyledHorizontalDrawer = styled(StyledDrawer)<IReqoreDrawerStyle>`
  left: 0;
  right: 0;
  height: ${({ height }: IReqoreDrawerStyle) => height};
  width: ${({ width }: IReqoreDrawerStyle) => width};

  ${({ position, theme }) => css`
    border-${
      position === 'top' ? 'bottom' : 'top'
    }: 1px solid ${changeLightness(theme.main, 0.2)};
  `}
`;

export const StyledCloseWrapper = styled.div<IReqoreDrawerStyle>`
  position: absolute;

  ${({ position }) => {
    switch (position) {
      case 'bottom':
        return css`
          display: flex;
          width: 100%;
          justify-content: flex-end;
          margin-top: -40px;
          > * {
            margin-right: 10px;
          }
        `;
      case 'top':
        return css`
          display: flex;
          width: 100%;
          justify-content: flex-end;
          margin-top: 40px;
          > * {
            margin-right: 10px;
          }
        `;
      case 'left':
        return css`
          display: flex;
          flex-flow: column;
          height: 100%;
          margin-left: 40px;
          > * {
            margin-top: 10px;
          }
        `;
      case 'right':
        return css`
          display: flex;
          flex-flow: column;
          height: 100%;
          margin-left: -40px;
          > * {
            margin-top: 10px;
          }
        `;
    }
  }}
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
  minSize = '50px',
  onClose,
  onOpen,
  hasBackdrop,
  size,
  resizable,
  hidable,
  onHide,
  ...rest
}: IReqoreDrawerProps) => {
  const theme = useReqoreTheme('main', customTheme);

  const layout = useMemo(
    () =>
      position === 'top' || position === 'bottom' ? 'horizontal' : 'vertical',
    [position]
  );

  const [_isHidden, setIsHidden] = useState<boolean>(isHidden || false);

  const [_size, setSize] = useState<any>({
    width: layout === 'horizontal' ? '100vw' : size || '300px',
    height: layout === 'vertical' ? '100vh' : size || '300px',
  });

  const Wrapper = useMemo(
    () =>
      position === 'top' || position === 'bottom'
        ? StyledHorizontalDrawer
        : StyledVerticalDrawer,
    [position]
  );

  useEffect(() => {
    setSize({
      width: layout === 'horizontal' ? '100vw' : size || '300px',
      height: layout === 'vertical' ? '100vh' : size || '300px',
    });
  }, [position, size]);

  if (!isOpen) {
    return null;
  }

  return (
    <ReqoreThemeProvider theme={theme}>
      <Resizable
        maxHeight={layout === 'horizontal' ? maxSize : undefined}
        minHeight={
          layout === 'horizontal' ? (_isHidden ? 0 : minSize) : undefined
        }
        maxWidth={layout === 'vertical' ? maxSize : undefined}
        minWidth={layout === 'vertical' ? (_isHidden ? 0 : minSize) : undefined}
        style={{
          position: 'fixed',
          top: position === 'top' || layout === 'vertical' ? 0 : undefined,
          bottom:
            position === 'bottom' || layout === 'vertical' ? 0 : undefined,
          right:
            position === 'right' || layout === 'horizontal' ? 0 : undefined,
          left: position === 'left' || layout === 'horizontal' ? 0 : undefined,
        }}
        size={{
          width: layout === 'vertical' && _isHidden ? 0 : _size.width,
          height: layout === 'horizontal' && _isHidden ? 0 : _size.height,
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
          <StyledCloseWrapper position={position}>
            {onClose && (
              <ReqoreButton icon='CloseLine' onClick={() => onClose()} />
            )}
            {hidable && (
              <ReqoreButton
                icon={getHideShowIcon(position, _isHidden)}
                onClick={() => {
                  setIsHidden(!_isHidden);
                }}
              />
            )}
          </StyledCloseWrapper>
        ) : null}
        {!_isHidden && (
          <Wrapper
            {...rest}
            width={_size.width}
            height={_size.height}
            position={position}
          >
            {children}
          </Wrapper>
        )}
      </Resizable>
    </ReqoreThemeProvider>
  );
};

preview(
  ReqoreDrawer,
  {
    base: {
      children: 'Hello',
    },
    Top: {
      position: 'top',
      isOpen: false,
      resizable: true,
      hidable: true,
      onClose: noop,
    },
    Bottom: {
      position: 'bottom',
      isOpen: true,
      hidable: true,
      onClose: noop,
    },
    Left: {
      position: 'left',
      maxSize: '80vw',
      minSize: '30vw',
    },
    Right: {
      position: 'right',
      isOpen: true,
      resizable: true,
      hidable: true,
      onClose: noop,
    },
  },
  {
    layout: 'tabbed',
  }
);
