import { map } from 'lodash';
import { cloneElement, isValidElement, memo } from 'react';
import { createPortal } from 'react-dom';
import { ReqoreErrorBoundary, ReqoreModal, useReqoreProperty } from '../..';
import { modalStore } from '../../containers/ReqoreProvider';

export const ReqoreModalsWrapper = memo(() => {
  const { modals, removeModal } = modalStore();
  const customPortalId = useReqoreProperty('customPortalId');

  return (
    <ReqoreErrorBoundary>
      {map(modals, ({ modal, options: modalOptions }, key) =>
        isValidElement(modal) ? (
          createPortal(
            cloneElement(modal, {
              key,
              isOpen: true,
              onClose: modalOptions?.closable
                ? () => {
                    removeModal(key);
                    modal.props.onClose?.();
                  }
                : undefined,
            }),
            document.querySelector(customPortalId || '#reqore-portal')!
          )
        ) : (
          <ReqoreModal
            {...modal}
            key={key}
            isOpen
            onClose={
              modalOptions?.closable
                ? () => {
                    removeModal(key);
                    modal.onClose?.();
                  }
                : undefined
            }
          />
        )
      )}
    </ReqoreErrorBoundary>
  );
});
