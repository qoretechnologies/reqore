import { animated, useTransition } from '@react-spring/web';
import { rgba } from 'polished';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { SPRING_CONFIG } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getMainBackgroundColor, getReadableColor } from '../../helpers/colors';
import useLatestZIndex from '../../hooks/useLatestZIndex';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../Panel';

export interface IReqoreModalProps extends IReqorePanelProps {
  onClose?: () => void;
  hasBackdrop?: boolean;
  blur?: number;
  position?: 'top' | 'center';
  width?: string;
  height?: string;
  isOpen?: boolean;
  opacity?: number;
}

export interface IReqoreModalStyle extends IReqoreModalProps {
  theme: IReqoreTheme;
  zIndex?: number;
}

const StyledModal = styled(animated.div)<IReqoreModalStyle>`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ zIndex }) => zIndex};
`;

const StyledModalBackdrop = styled(animated.div)<IReqoreModalStyle>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  backdrop-filter: ${({ blur }) => (blur ? `blur(${blur}px)` : undefined)};
  background-color: ${({ theme }) => rgba(getMainBackgroundColor(theme), 0.8)};
  cursor: ${({ onClose }) => (onClose ? 'pointer' : 'initial')};
`;

const StyledModalWrapper = styled(animated.div)<IReqoreModalStyle>`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  display: flex;
  flex-flow: column;

  .reqore-modal-content {
    width: 100%;
    min-height: 150px;
    width: ${({ width }) => width || undefined};
    height: ${({ height }) => height || undefined};
    border-radius: 10px;
    background-color: ${({ theme, opacity = 1, intent }: IReqoreModalStyle) =>
      rgba(intent ? theme.intents[intent]! : getMainBackgroundColor(theme), opacity)};
    box-shadow: 0px 0px 30px 0px ${rgba('#000000', 0.4)};
    // Only apply the blur filter if the modal has no backdrop & transparent background.
    backdrop-filter: ${({ blur, opacity, hasBackdrop }) =>
      blur && !hasBackdrop && opacity < 1 ? `blur(${blur}px)` : undefined};

    ${({ flat }) =>
      !flat &&
      css`
        border: 1px solid
          ${({ theme, intent }) =>
            intent
              ? theme.intents[intent]
              : rgba(theme.text.color || getReadableColor(theme), 0.1)};
      `};
  }
`;

const StyledModalHeader = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5px;
  flex-shrink: 0;
`;

export const ReqoreModal = ({
  children,
  flat,
  hasBackdrop = true,
  opacity,
  onClose,
  position,
  width = '80vw',
  height,
  isOpen,
  blur,
  ...rest
}: IReqoreModalProps) => {
  const transitions = useTransition(isOpen, {
    from: { opacity: 0, scale: 0.9 },
    enter: { opacity: 1, scale: 1 },
    leave: { opacity: 0, scale: 0.9 },
    config: SPRING_CONFIG,
  });

  const zIndex: number = useLatestZIndex();
  let actions: IReqorePanelAction[] = [];

  if (onClose) {
    actions.unshift({
      icon: 'CloseLine',
      onClick: () => onClose(),
    });
  }

  return transitions(
    (style, item) =>
      item &&
      createPortal(
        <ReqoreThemeProvider>
          <StyledModal zIndex={zIndex}>
            {hasBackdrop && (
              <StyledModalBackdrop
                {...{ onClose }}
                onClick={onClose || undefined}
                className='reqore-modal-backdrop'
                opacity={opacity}
                blur={blur}
                style={{
                  opacity: style.opacity,
                }}
              />
            )}
            <ReqorePanel
              {...rest}
              as={animated.div}
              flat={flat}
              className={`${rest.className || ''} reqore-modal`}
              style={
                {
                  boxShadow: `0px 0px 30px 0px ${rgba('#000000', 0.4)}`,
                  width,
                  height,
                  maxHeight: '90vh',
                  maxWidth: '90vw',
                  ...style,
                } as any
              }
              actions={actions}
            >
              {children}
            </ReqorePanel>
          </StyledModal>
        </ReqoreThemeProvider>,
        document.querySelector('#reqore-portal')!
      )
  );
};
