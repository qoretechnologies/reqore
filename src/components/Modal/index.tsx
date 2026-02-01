import { nanoid } from 'nanoid';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useReqoreProperty } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { IReqoreDrawerProps, ReqoreDrawer } from '../Drawer';

export interface IReqoreModalProps extends Omit<IReqoreDrawerProps, 'position'> {
  position?: 'top' | 'center' | 'bottom';
  width?: string;
  height?: string;
  /** Whether to trap focus within the modal when open. Defaults to true. */
  focusTrap?: boolean;
}

export interface IReqoreModalStyle extends IReqoreModalProps {
  theme: IReqoreTheme;
  zIndex?: number;
}

export const ReqoreModal = memo(
  ({ width = '80vw', height = 'fit-content', confirmOnClose, ...rest }: IReqoreModalProps) => {
    const id = useMemo(() => nanoid(), []);
    const escClosableModals = useReqoreProperty('escClosableModals');
    const closeModalsOnEscPress = useReqoreProperty('closeModalsOnEscPress');
    const add = useReqoreProperty('addEscClosableModal');
    const remove = useReqoreProperty('removeEscClosableModal');

    const isEscClosable =
      rest.isOpen &&
      rest.onClose &&
      !rest.disabled &&
      (rest.closeOnEscPress ?? closeModalsOnEscPress);

    // Close last popover when ESC is pressed
    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          remove(id, rest.onClose, confirmOnClose);
        }
      },
      [id, rest.onClose, remove, confirmOnClose]
    );

    useEffect(() => {
      if (isEscClosable) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [escClosableModals, isEscClosable]);

    useEffect(() => {
      if (rest.isOpen) {
        add(id);
      }

      return () => {
        remove(id);
      };
    }, [id, rest.isOpen]);

    return (
      <ReqoreDrawer
        closeOnEscPress={closeModalsOnEscPress}
        {...rest}
        confirmOnClose={confirmOnClose}
        width={width}
        height={height}
        position='left'
        _isModal
        className={`${rest.className || ''} reqore-modal`}
      />
    );
  }
);
