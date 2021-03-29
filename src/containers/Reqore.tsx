import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { ReqoreNotificationsContext } from '..';
import ReqoreButton from '../components/Button';
import { ReqoreModal } from '../components/Modal';
import {
  ReqoreModalActions,
  ReqoreModalActionsGroup,
} from '../components/Modal/actions';
import { ReqoreModalContent } from '../components/Modal/content';
import { IReqoreIntent } from '../constants/theme';
import PopoverContext from '../context/PopoverContext';
import ReqoreContext from '../context/ReqoreContext';
import { IReqoreIconName } from '../types/icons';

export interface IReqoreConfirmationModal {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonIntent?: IReqoreIntent;
  confirmLabel?: string;
  confirmIcon?: IReqoreIconName;
  cancelLabel?: string;
}

const StyledConfirmContent = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  min-height: 150px;
`;

export const ReqoreProvider = ({ children }) => {
  const notifications = useContext(ReqoreNotificationsContext);
  const popover = useContext(PopoverContext);
  const [
    confirmationModal,
    setConfirmationModal,
  ] = useState<IReqoreConfirmationModal>(null);

  const confirmAction = (data: IReqoreConfirmationModal): void => {
    setConfirmationModal(data);
  };

  return (
    <ReqoreContext.Provider
      value={{
        ...notifications,
        ...popover,
        confirmAction,
      }}
    >
      {children}
      {confirmationModal && (
        <ReqoreModal
          isOpen
          minimal
          title={confirmationModal.title || 'Confirm your action'}
          icon='ErrorWarningFill'
        >
          <ReqoreModalContent>
            <StyledConfirmContent>
              {confirmationModal.description ||
                'Are you sure you want to proceed?'}
            </StyledConfirmContent>
          </ReqoreModalContent>
          <ReqoreModalActions>
            <ReqoreModalActionsGroup>
              <ReqoreButton
                icon='CloseLine'
                onClick={() => {
                  setConfirmationModal(null);

                  if (confirmationModal.onCancel) {
                    confirmationModal.onCancel();
                  }
                }}
              >
                {confirmationModal.cancelLabel || 'Cancel'}
              </ReqoreButton>
            </ReqoreModalActionsGroup>
            <ReqoreModalActionsGroup position='right'>
              <ReqoreButton
                icon={confirmationModal.confirmIcon || 'CheckLine'}
                intent={confirmationModal.confirmButtonIntent || 'success'}
                onClick={() => {
                  setConfirmationModal(null);

                  if (confirmationModal.onConfirm) {
                    confirmationModal.onConfirm();
                  }
                }}
              >
                {confirmationModal.confirmLabel || 'Confirm'}
              </ReqoreButton>
            </ReqoreModalActionsGroup>
          </ReqoreModalActions>
        </ReqoreModal>
      )}
    </ReqoreContext.Provider>
  );
};
