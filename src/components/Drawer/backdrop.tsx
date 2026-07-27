import { animated } from '@react-spring/web';
import { rgba } from 'polished';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { IReqoreDrawerStyle } from '.';
import { useReqoreProperty } from '../..';
import { getMainBackgroundColor } from '../../helpers/colors';
import { omitStyleProps } from '../../helpers/styled';

export interface IReqoreBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  zIndex?: number;
  blur?: number;
  onClose?: () => void;
  opacity?: number;
}

export const StyledBackdrop = styled(animated.div).withConfig({
  shouldForwardProp: omitStyleProps('blur', 'closable', 'zIndex'),
})<
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

export const ReqoreBackdrop = memo(
  ({ onClose, zIndex, blur, opacity, ...rest }: IReqoreBackdropProps) => {
    const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
    const finalZIndex = useMemo(
      () => zIndex || getAndIncreaseZIndex(),
      [zIndex, getAndIncreaseZIndex]
    );

    const handleClick = useCallback(
      (event) => {
        event.stopPropagation();
        // Only close if the click is on the backdrop itself
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      },
      [onClose]
    );

    const style = useMemo(
      () => ({
        opacity,
      }),
      [opacity]
    );

    return (
      <StyledBackdrop
        {...rest}
        className={`${rest.className || ''} reqore-drawer-backdrop`}
        onClick={handleClick}
        closable={!!onClose}
        zIndex={finalZIndex}
        blur={blur}
        style={style}
      />
    );
  }
);
