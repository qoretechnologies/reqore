import { nanoid } from 'nanoid';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useReqoreProperty } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { IReqoreDrawerProps, ReqoreDrawer } from '../Drawer';

export interface IReqoreModalProps extends Omit<IReqoreDrawerProps, 'position' | 'draggable'> {
  position?: 'top' | 'center' | 'bottom';
  width?: string;
  height?: string;
  /** Whether to trap focus within the modal when open. Defaults to true. */
  focusTrap?: boolean;
  /**
   * Whether the modal can be moved by dragging its title bar. Opt-in. Only where the pointer can
   * hover (`isHoverCapable`: a mouse or a trackpad) — the `move` cursor on the bar is the
   * affordance, and on a touch screen a press on a header is left to the page. Resizing from the
   * edges and corners works as before; a drag never starts on the close button, a header action
   * or a resize handle; the title bar is held inside the viewport; and the position resets when
   * the modal opens again. The box carries `.reqore-drawer-draggable` while it is on. Not the
   * HTML attribute of the same name: it never reaches the DOM.
   */
  draggable?: boolean;
}

export interface IReqoreModalStyle extends IReqoreModalProps {
  theme: IReqoreTheme;
  zIndex?: number;
}

export const ReqoreModal = memo(
  ({
    width = '80vw',
    height = 'fit-content',
    confirmOnClose,
    draggable,
    ...rest
  }: IReqoreModalProps) => {
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
    }, [escClosableModals, isEscClosable, handleKeyDown]);

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
        _draggable={draggable}
        className={`${rest.className || ''} reqore-modal`}
      />
    );
  }
);
