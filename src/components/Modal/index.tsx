import { rgba } from 'polished';
import React from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { fadeIn } from '../../helpers/animations';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import ReqoreIcon from '../Icon';

export interface IReqoreModalProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  onClose?: (
    event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) => void;
  backdropVisible?: boolean;
  minimal?: boolean;
  position?: 'top' | 'center';
  width?: string;
  height?: string;
  isOpen?: boolean;
  title?: string;
  icon?: IReqoreIconName;
}

export interface IReqoreModalStyle extends IReqoreModalProps {
  theme: IReqoreTheme;
}

const StyledModal = styled.div<IReqoreModalStyle>`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  animation: 0.2s ${fadeIn} ease-in-out;
`;

const StyledModalBackdrop = styled.div<IReqoreModalStyle>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  background-color: ${({ theme }) => rgba(theme.main, 0.8)};
  z-index: 9999;
  cursor: ${({ onClose }) => (onClose ? 'pointer' : 'initial')};
`;

const StyledModalWrapper = styled.div<IReqoreModalStyle>`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  z-index: 9999;
  display: flex;
  flex-flow: column;

  .reqore-modal-content {
    min-width: 500px;
    min-height: 150px;
    width: ${({ width }) => width || undefined};
    height: ${({ height }) => height || undefined};

    ${({ minimal }) =>
      !minimal &&
      css`
        border: 1px solid
          ${({ theme }) =>
            rgba(theme.text.color || getReadableColor(theme), 0.1)};
        border-radius: 5px;
        background-color: ${({ theme }) => changeLightness(theme.main, 0.02)};
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
  minimal,
  backdropVisible = true,
  onClose,
  position,
  width,
  height,
  title,
  icon,
  isOpen,
  ...rest
}: IReqoreModalProps) => {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <ReqoreThemeProvider>
      <StyledModal>
        <StyledModalBackdrop
          {...{ onClose }}
          onClick={onClose || undefined}
          className='reqore-modal-backdrop'
        />
        <StyledModalWrapper
          {...rest}
          width={width}
          height={height}
          minimal={minimal}
          className={`${rest.className || ''} reqore-modal`}
        >
          <StyledModalHeader>
            <h3>
              {icon && <ReqoreIcon icon={icon} margin='right' />}
              {title && <>{title}</>}
            </h3>
            {onClose && (
              <ReqoreButton
                icon='CloseLine'
                minimal
                onClick={onClose}
                className='reqore-modal-close-button'
              />
            )}
          </StyledModalHeader>
          {children}
        </StyledModalWrapper>
      </StyledModal>
    </ReqoreThemeProvider>,
    document.querySelector('#reqore-modal-portal')
  );
};
