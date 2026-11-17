import { memo } from 'react';
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
  /**
   * How many lines the description may wrap to before it is ellipsized. Default `0`: none — a
   * dialog's description is the message it exists to say (a confirmation's warning above all), so
   * it is shown whole, wrapped. A panel's own default of 2 suits a subtitle in a crowded header,
   * not a dialog. See `descriptionMaxHeight` for a message too long for the screen.
   *
   * @default 0
   */
  descriptionMaxLines?: number;
  /**
   * The height a whole description scrolls past, in its own box, with the title and the buttons
   * left on screen. Default `'50vh'`: a message has to be genuinely huge to scroll.
   *
   * @default '50vh'
   */
  descriptionMaxHeight?: string;
  /**
   * The modal's width on a phone (`isMobile`). Default `'100%'`, which the modal's phone maximum
   * (`MODAL_PHONE_WIDTH`, `calc(100vw - 32px)`) holds to the page's own 16px gutter each side,
   * where 80vw left ~40px and a third of the screen's width unused. (Not `calc()` itself: the
   * resizable box does not take one as a width.) `null` keeps `width` on a phone too.
   */
  phoneWidth?: string | null;
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
    phoneWidth = '100%',
    descriptionMaxLines = 0,
    descriptionMaxHeight = '50vh',
    ...rest
  }: IReqoreModalProps) => {
    /* Escape is the drawer's: a modal is a drawer, and the drawer closes on Escape itself
       (`useReqoreEscClose`), the app's `closeModalsOnEscPress` unless the modal says. */
    const isMobile = useReqoreProperty('isMobile');
    const closeModalsOnEscPress = useReqoreProperty('closeModalsOnEscPress');

    return (
      <ReqoreDrawer
        closeOnEscPress={closeModalsOnEscPress}
        {...rest}
        confirmOnClose={confirmOnClose}
        width={isMobile && phoneWidth !== null ? phoneWidth : width}
        height={height}
        descriptionMaxLines={descriptionMaxLines}
        descriptionMaxHeight={descriptionMaxHeight}
        position='left'
        _isModal
        _draggable={draggable}
        className={`${rest.className || ''} reqore-modal`}
      />
    );
  }
);
