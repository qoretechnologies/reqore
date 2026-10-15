import { animated, useTransition } from '@react-spring/web';
import { memo, useMemo } from 'react';
import { SPRING_CONFIG } from '../../constants/animations';
import { SIZE_TO_PX } from '../../constants/sizes';
import styled, { omitStyleProps } from '../../helpers/styled';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { IReqoreButtonProps } from '../Button';
import ReqoreIcon from '../Icon';

export interface IReqoreInputClearButtonProps extends IReqoreButtonProps {
  show: boolean;
  enabled: boolean;
  hasRightIcon?: boolean;
  /** Extra room (px) taken at the field's right edge by something else, e.g. a password toggle. */
  rightOffset?: number;
  /**
   * The opacity the button is drawn at once shown: 0.5 unless given. The field gives the one at which the button
   * still stands out from its background by 3:1 (WCAG 1.4.11).
   */
  shownOpacity?: number;
}

export const StyledInputClearButton = styled(ReqoreIcon).withConfig({
  shouldForwardProp: omitStyleProps('hasRightIcon', 'show', 'rightOffset', 'shownOpacity'),
})<{ hasRightIcon?: boolean; show?: boolean; rightOffset?: number }>`
  position: absolute;
  right: ${({ size, hasRightIcon, rightOffset = 0 }) =>
    (hasRightIcon ? SIZE_TO_PX[size] : 0) + rightOffset}px;
  top: 0;
  justify-content: center;
  align-items: center;
  transition: all 0.1s ease-out;
  cursor: pointer;

  &:hover {
    opacity: 1 !important;
  }
`;

const HIDDEN = { opacity: 0, filter: 'blur(10px)' };

const ReqoreInputClearButton = ({
  show,
  enabled,
  size = 'normal',
  shownOpacity = 0.5,
  ...rest
}: IReqoreInputClearButtonProps) => {
  // Where motion is unwelcome it is shown and hidden at once, at its settled opacity from its first paint.
  const reducedMotion = usePrefersReducedMotion();
  const shown = useMemo(() => ({ opacity: shownOpacity, filter: 'blur(0px)' }), [shownOpacity]);
  const transitions = useTransition(show && enabled, {
    from: reducedMotion ? shown : HIDDEN,
    enter: shown,
    leave: HIDDEN,
    immediate: reducedMotion,
    config: SPRING_CONFIG,
  });

  return transitions((styles, item) =>
    item ? (
      <StyledInputClearButton
        {...rest}
        className='reqore-clear-input-button'
        icon='CloseLine'
        wrapperElement={animated.span}
        size={size}
        wrapperSize={SIZE_TO_PX[size]}
        show={show}
        style={{
          opacity: styles.opacity,
        }}
      />
    ) : null
  );
};

export default memo(ReqoreInputClearButton);
