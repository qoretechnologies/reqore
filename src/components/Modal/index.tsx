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
  return (
    <ReqoreDrawer
      {...rest}
      width={width}
      height={height}
      position='left'
      _isModal
      className={`${rest.className || ''} reqore-modal`}
    />
  );
};
