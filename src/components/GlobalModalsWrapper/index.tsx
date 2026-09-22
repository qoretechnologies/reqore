import { map } from 'lodash';
import { cloneElement, isValidElement, memo } from 'react';
import { renderInPortal } from '../../helpers/portal';
import { ReqoreErrorBoundary, ReqoreModal, useReqoreProperty } from '../..';
import { modalStore } from '../../containers/ReqoreProvider';

export const ReqoreModalsWrapper = memo(() => {
  const { modals, removeModal } = modalStore();
  const customPortalId = useReqoreProperty('customPortalId');

  return (
    <ReqoreErrorBoundary>
      {map(modals, ({ modal, options: modalOptions }, key) =>
        isValidElement(modal) ? (
          renderInPortal(
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
            customPortalId
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
