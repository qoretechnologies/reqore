import { animated } from '@react-spring/web';
import { rgba } from 'polished';
import { memo } from 'react';
import styled from 'styled-components';
import { IReqoreDrawerStyle } from '.';
import { getMainBackgroundColor } from '../../helpers/colors';

export interface IReqoreBackdropProps {
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

export const ReqoreBackdrop = memo(({ onClose, zIndex, blur, opacity }: IReqoreBackdropProps) => (
  <StyledBackdrop
    className='reqore-drawer-backdrop'
    onClick={() => onClose?.()}
    closable={!!onClose}
    zIndex={zIndex}
    blur={blur}
    style={{
      opacity,
    }}
  />
));
