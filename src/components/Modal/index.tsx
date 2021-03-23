import { rgba } from 'polished';
import React from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { fadeIn } from '../../helpers/animations';
import { getReadableColor } from '../../helpers/colors';

export interface IReqoreModalProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: any;
  onClose?: (event: React.MouseEvent<HTMLDivElement>) => void;
  backdropVisible?: boolean;
  backdropType?: 'default' | 'match-theme';
  minimal?: boolean;
  position?: 'top' | 'center';
}

export interface IReqoreModalStyle extends IReqoreModalProps {
  theme: IReqoreTheme;
}

const StyledModalBackdrop = styled.div<IReqoreModalStyle>`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  animation: 0.2s ${fadeIn} ease-in-out;
  background-color: ${rgba(0, 0, 0, 0.6)};
  z-index: 9999;
`;

const StyledModalWrapper = styled.div`
  min-width: 500px;
  max-width: 90vw;
  min-height: 150px;
  max-height: 90vh;
  position: relative;

  border: 1px solid
    ${({ theme }) => rgba(theme.text.color || getReadableColor(theme), 0.1)};
  border-radius: 5px;
`;

export const ReqoreModal = ({
  children,
  minimal,
  backdropVisible = true,
  backdropType,
  onClose,
  position,
  ...rest
}: IReqoreModalProps) => {
  return createPortal(
    <ReqoreThemeProvider>
      <StyledModalBackdrop
        {...{ minimal, onClose, backdropType, backdropVisible, position }}
      >
        <StyledModalWrapper
          {...rest}
          className={`${rest.className || ''} reqore-modal`}
        >
          {children}
        </StyledModalWrapper>
      </StyledModalBackdrop>
    </ReqoreThemeProvider>,
    document.querySelector('#reqore-modal-portal')
  );
};
