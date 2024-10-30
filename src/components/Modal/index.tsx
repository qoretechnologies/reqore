import { useEffect, useMemo } from 'react';
import shortid from 'shortid';
import { useReqoreProperty } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { IReqoreDrawerProps, ReqoreDrawer } from '../Drawer';

export interface IReqoreModalProps extends Omit<IReqoreDrawerProps, 'position'> {
  position?: 'top' | 'center' | 'bottom';
  width?: string;
  height?: string;
}

export interface IReqoreModalStyle extends IReqoreModalProps {
  theme: IReqoreTheme;
  zIndex?: number;
}

export const ReqoreModal = ({ width = '80vw', height = 'auto', ...rest }: IReqoreModalProps) => {
  const id = useMemo(() => shortid.generate(), []);
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
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      remove(id, rest.onClose);
    }
  };

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
      width={width}
      height={height}
      position='left'
      _isModal
      className={`${rest.className || ''} reqore-modal`}
    />
  );
};
