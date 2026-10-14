import { animated, useTransition } from '@react-spring/web';
import { SPRING_CONFIG } from '../../constants/animations';
import { SIZE_TO_PX } from '../../constants/sizes';
import styled, { omitStyleProps } from '../../helpers/styled';
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
  /** What it is called, for a screen reader and a test: `Clear` unless given. */
  label?: string;
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

const ReqoreInputClearButton = ({
  show,
  enabled,
  size = 'normal',
  shownOpacity = 0.5,
  label = 'Clear',
  ...rest
}: IReqoreInputClearButtonProps) => {
  const transitions = useTransition(show && enabled, {
    from: { opacity: 0, filter: 'blur(10px)' },
    enter: { opacity: shownOpacity, filter: 'blur(0px)' },
    leave: { opacity: 0, filter: 'blur(10px)' },
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

export default ReqoreInputClearButton;
