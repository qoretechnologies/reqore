import { animated, useTransition } from '@react-spring/web';
import { memo } from 'react';
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
  /** What it is called, for a screen reader and a test: `Clear` unless given. */
  label?: string;
}

export const StyledInputClearButton = styled(ReqoreIcon).withConfig({
  shouldForwardProp: omitStyleProps('hasRightIcon', 'show', 'rightOffset'),
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
const SHOWN = { opacity: 0.5, filter: 'blur(0px)' };

const ReqoreInputClearButton = ({
  show,
  enabled,
  size = 'normal',
  label = 'Clear',
  ...rest
}: IReqoreInputClearButtonProps) => {
  // Where motion is unwelcome it is shown and hidden at once, at its settled opacity from its first paint.
  const reducedMotion = usePrefersReducedMotion();
  const transitions = useTransition(show && enabled, {
    from: reducedMotion ? SHOWN : HIDDEN,
    enter: SHOWN,
    leave: HIDDEN,
    immediate: reducedMotion,
    config: SPRING_CONFIG,
  });

  return transitions((styles, item) =>
    item ? (
      <StyledInputClearButton
        {...rest}
        className='reqore-clear-input-button'
        // a control, named: an icon with a click on it was nothing a screen reader or a test could find
        role='button'
        aria-label={label}
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
