import { animated, useTransition } from '@react-spring/web';
import styled from 'styled-components';
import { SPRING_CONFIG } from '../../constants/animations';
import { SIZE_TO_PX } from '../../constants/sizes';
import { IReqoreButtonProps } from '../Button';
import ReqoreIcon from '../Icon';

export interface IReqoreInputClearButtonProps extends IReqoreButtonProps {
  show: boolean;
  enabled: boolean;
  hasRightIcon?: boolean;
}

export const StyledInputClearButton = styled(ReqoreIcon)<{ show?: boolean }>`
  position: absolute;
  right: ${({ size, hasRightIcon }) => (hasRightIcon ? SIZE_TO_PX[size] : 0)}px;
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
  ...rest
}: IReqoreInputClearButtonProps) => {
  const transitions = useTransition(show && enabled, {
    from: { opacity: 0, filter: 'blur(10px)' },
    enter: { opacity: 0.5, filter: 'blur(0px)' },
    leave: { opacity: 0, filter: 'blur(10px)' },
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

export default ReqoreInputClearButton;
