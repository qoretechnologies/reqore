import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo } from 'react';
import type { IReqoreConfirmationModal } from '../containers/ReqoreProvider';
import { useReqoreProperty } from './useReqoreContext';

export interface IUseReqoreEscCloseOptions {
  /** The dialog is open: it joins the Escape stack, and leaves it when it closes. */
  isOpen?: boolean;
  /** What closing it does. Without it the dialog cannot be closed by Escape. */
  onClose?: () => void;
  disabled?: boolean;
  /** The dialog's own say; unset, the app's `closeModalsOnEscPress`. */
  closeOnEscPress?: boolean;
  /** Asked first, as the close button asks. */
  confirmOnClose?: boolean | IReqoreConfirmationModal;
}

/**
 * Escape closes the dialog in front, and only it: every open dialog (a drawer, a modal, the
 * confirmation over them) joins the provider's Escape stack, and an Escape asks the stack, so the
 * one on top closes - after its confirmation, when it asks for one - and the ones under it stay.
 * A drawer declared `closeOnEscPress` and never read it: only a modal closed on Escape.
 */
export const useReqoreEscClose = ({
  isOpen,
  onClose,
  disabled,
  closeOnEscPress,
  confirmOnClose,
}: IUseReqoreEscCloseOptions): void => {
  const id = useMemo(() => nanoid(), []);
  const closeModalsOnEscPress = useReqoreProperty('closeModalsOnEscPress');
  const add = useReqoreProperty('addEscClosableModal');
  const remove = useReqoreProperty('removeEscClosableModal');

  const isEscClosable =
    !!isOpen && !!onClose && !disabled && (closeOnEscPress ?? closeModalsOnEscPress);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        remove?.(id, onClose, confirmOnClose);
      }
    },
    [id, onClose, remove, confirmOnClose]
  );

  useEffect(() => {
    if (isEscClosable) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEscClosable, handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      add?.(id);
    }

    return () => {
      remove?.(id);
    };
  }, [id, isOpen]);
};
