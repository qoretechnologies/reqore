import { animated } from '@react-spring/web';
import { rgba } from 'polished';
import { memo } from 'react';
import styled from 'styled-components';
import { IReqoreDrawerStyle } from '.';
import { useReqoreProperty } from '../..';
import { getMainBackgroundColor } from '../../helpers/colors';

export interface IReqoreBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  zIndex?: number;
  blur?: number;
  onClose?: () => void;
  opacity?: number;
}

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

export const ReqoreBackdrop = memo(
  ({ onClose, zIndex, blur, opacity, ...rest }: IReqoreBackdropProps) => {
    const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');

    return (
      <StyledBackdrop
        {...rest}
        className={`${rest.className || ''} reqore-drawer-backdrop`}
        onClick={(event) => {
          // Only close if the click is on the backdrop itself
          if (event.target === event.currentTarget) {
            onClose?.();
          }
        }}
        closable={!!onClose}
        zIndex={zIndex || getAndIncreaseZIndex()}
        blur={blur}
        style={{
          opacity,
        }}
      />
    );
  }
);
