import { CSSProperties, memo, useCallback } from 'react';
import { useReqoreProperty } from '../..';
import { ReqoreModal } from '../Modal';
import ReqoreTextarea from '../Textarea';

export interface IReqoreButtonDescriptionModalProps {
  /** Modal heading — the button's label when it is a plain string. */
  label?: string;
  /** The FULL description text. */
  value: string;
  onClose: () => void;
  copyLabel?: string;
}

/* Fill the modal's fixed-height body instead of scaling with content: a
   content-scaled textarea stops short of the body (dead space below, a
   partial-height scrollbar) or explodes it on huge values. Filling hands the
   whole body to the textarea, so its scrollbar spans the modal body. Module
   scope for stable identity. */
const FILL_STYLE: CSSProperties = { height: '100%' };

/**
 * The full-value viewer behind `ReqoreButton.descriptionModal` — the whole
 * description in a selectable, scrollable body with a Copy action (modeled on
 * `ReqoreExportModal`). Lives in its own module and is imported LAZILY by
 * Button: Modal transitively imports Button (Modal → Drawer → Panel → Button),
 * so a static import from Button would close a module cycle.
 */
export const ReqoreButtonDescriptionModal = memo(
  ({ label, value, onClose, copyLabel = 'Copy' }: IReqoreButtonDescriptionModalProps) => {
    const addNotification = useReqoreProperty('addNotification');

    const handleCopyClick = useCallback(async () => {
      // Clipboard access can be denied (permissions, insecure context) — the
      // failure surfaces as a notification instead of an unhandled rejection.
      try {
        await navigator.clipboard.writeText(value);
        addNotification({
          content: 'Copied to clipboard',
          intent: 'success',
          duration: 3000,
        });
      } catch (error) {
        addNotification({
          content: 'Could not copy to clipboard',
          intent: 'danger',
          duration: 3000,
        });
      }
    }, [value, addNotification]);

    return (
      <ReqoreModal
        isOpen
        label={label || 'Full value'}
        icon='FileTextLine'
        height='70vh'
        onClose={onClose}
        className='reqore-button-description-modal'
        bottomActions={[
          {
            position: 'right',
            label: copyLabel,
            icon: 'ClipboardLine',
            onClick: () => {
              handleCopyClick();
            },
          },
        ]}
      >
        <ReqoreTextarea
          readOnly
          value={value}
          minimal
          fluid
          style={FILL_STYLE}
          wrapperStyle={FILL_STYLE}
        />
      </ReqoreModal>
    );
  }
);

ReqoreButtonDescriptionModal.displayName = 'ReqoreButtonDescriptionModal';

export default ReqoreButtonDescriptionModal;
