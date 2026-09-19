import { animated, useTransition } from '@react-spring/web';
import { Resizable } from 're-resizable';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../..';
import { SPRING_CONFIG } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import type { IReqoreConfirmationModal } from '../../containers/ReqoreProvider';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../Panel';
import { ReqoreBackdrop } from './backdrop';

export type TPosition = 'top' | 'bottom' | 'left' | 'right';

/** The floor an EDGE drawer cannot be dragged below, on the axis it resizes. */
export const DRAWER_MIN_SIZE = '150px';

/**
 * The floor a MODAL cannot be dragged below.
 *
 * A modal is resizable from every edge and corner, and until this existed the
 * floor on both axes was 40px: a dialog could be dragged into a sliver that
 * still held its search box, its list and its close button, stacked one atop
 * the other and none of them readable. (Reported against reqraft's "Select from
 * items" picker, dragged to roughly 45px wide.)
 *
 * The numbers are what the drawer's OWN chrome needs — the part reqore can
 * answer for; what the CONTENT needs is the consumer's to declare, through
 * `minWidth` / `minHeight` (or `minSize` for both).
 *
 * Measured on `dialogs-modal--basic` at 1400x1000, sweeping the width and
 * height of `.reqore-drawer-resizable`:
 *
 * - **200px wide.** Two measurements agree on it. The header: below 180px the
 *   panel title is clipped, and below 100px the close control leaves the box
 *   entirely (at 60px it overhangs by 46px). The content: at 200px the panel's
 *   text column is 182px, which at reqore's body size is 47 characters — the
 *   bottom of the 45-75 characters a line has to hold to read as prose rather
 *   than as a column of two-word rows.
 * - **80px tall.** The panel header is 55px and is fully visible from 60px;
 *   80px keeps the header whole and leaves one 20px line of the content the
 *   modal exists to show.
 *
 * Safe for existing modals because it is far below every one of them: the
 * narrowest modal in reqore, reqraft and qorus-ide is 480px, the default width
 * is `80vw`, and no modal's natural height is under the 55px header plus its
 * content. The floor therefore changes nothing until somebody drags.
 */
export const MODAL_MIN_WIDTH = '200px';
/** See {@link MODAL_MIN_WIDTH}. */
export const MODAL_MIN_HEIGHT = '80px';

export interface IReqoreDrawerProps extends Omit<IReqorePanelProps, 'size' | 'resizable'> {
  children?: any;
  isOpen?: boolean;
  isHidden?: boolean;
  position?: TPosition;
  hidable?: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onHideToggle?: (isHidden: boolean) => void;
  hasBackdrop?: boolean;
  size?: string | 'auto';
  panelSize?: IReqorePanelProps['size'];
  maxSize?: string;
  /**
   * The floor the drawer cannot be dragged below, on the axis it resizes.
   *
   * An edge drawer resizes on one axis, and this is it. A MODAL resizes on
   * both, so it reads `minWidth` / `minHeight` first and falls back to this for
   * whichever of them is not given.
   *
   * Defaults to {@link DRAWER_MIN_SIZE} for an edge drawer, and to
   * {@link MODAL_MIN_WIDTH} / {@link MODAL_MIN_HEIGHT} for a modal.
   *
   * UNITS: `px`, `%`, `vw`, `vh`. Nothing else. See the note on `minWidth`.
   */
  minSize?: string;
  /**
   * A modal's width floor. See {@link MODAL_MIN_WIDTH}; overrides `minSize`.
   *
   * UNITS: **`px`, `%`, `vw`, `vh` only.** The value is handed to
   * `re-resizable` twice and the two readers do not agree on anything else:
   * the drag clamp runs it through `getPixelSize()`, which converts exactly
   * those four and returns everything else UNCHANGED for `Number()` to turn
   * into `NaN` — and `clamp()` is `Math.max(Math.min(n, max), min)`, so a
   * `NaN` floor makes the dragged size `NaN`; while the same raw value is also
   * written to the element's inline `min-width`, where CSS reads far more.
   *
   * The result is a half-failure in either direction, and the type cannot
   * catch either one because the prop is a `string`:
   * - `'20rem'`, `'40em'`, `'50vmin'`, `'50vmax'` — valid CSS, so the box looks
   *   floored; `NaN` in the clamp, so the DRAG is not.
   * - `'200'` (a bare number) — the clamp reads it, CSS drops it.
   *
   * Say `'200px'`.
   */
  minWidth?: string;
  /**
   * A modal's height floor. See {@link MODAL_MIN_HEIGHT}; overrides `minSize`.
   *
   * UNITS: `px`, `%`, `vw`, `vh`. Nothing else — see the note on `minWidth`.
   */
  minHeight?: string;
  opacity?: number;
  floating?: boolean;
  blur?: number;
  _isModal?: boolean;
  width?: number | string;
  height?: number | string;
  customZIndex?: number;
  closeOnEscPress?: boolean;
  confirmOnClose?: boolean | IReqoreConfirmationModal;
  /** Whether to trap focus within the drawer when open. Defaults to true for modals and drawers with backdrop. */
  focusTrap?: boolean;
}

export interface IReqoreDrawerStyle extends IReqoreDrawerProps {
  theme: IReqoreTheme;
  width?: number | string;
  height?: number | string;
  w?: number | string;
  h?: number | string;
}

export const StyledWrapper = styled.div<IReqoreDrawerStyle>`
  z-index: ${({ zIndex }) => zIndex};
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

export const StyledCloseWrapper = styled.div<IReqoreDrawerStyle>`
  position: absolute;

  ${({ position, w, h }) => {
    switch (position) {
      case 'bottom':
        return css`
          display: flex;
          right: 0;
          justify-content: flex-end;
          margin-top: -35px;
          > * {
            margin-right: 5px;
          }
        `;
      case 'top':
        return css`
          display: flex;
          right: 0;
          justify-content: flex-end;
          margin-top: calc(${h || '0px'} + 5px);
          > * {
            margin-right: 5px;
          }
        `;
      case 'left':
        return css`
          display: flex;
          flex-flow: column;
          top: 0;
          margin-left: calc(${w || '0px'} + 5px);
          > * {
            margin-top: 5px;
          }
        `;
      case 'right':
        return css`
          display: flex;
          flex-flow: column;
          top: 0;
          margin-left: -35px;
          > * {
            margin-top: 5px;
          }
        `;
    }
  }}
`;

export const StyledDrawerResizable = styled(animated.div)<{
  $edgelessPosition?: TPosition;
}>`
  pointer-events: auto;

  ${({ $edgelessPosition }) => {
    if (!$edgelessPosition) {
      return undefined;
    }

    // The edges touching the viewport don't need a border. Strip the three sides that meet the
    // document edge so only the single side facing the content keeps its stroke.
    const sidesToStrip: Record<TPosition, ('top' | 'right' | 'bottom' | 'left')[]> = {
      right: ['top', 'right', 'bottom'],
      left: ['top', 'left', 'bottom'],
      top: ['top', 'left', 'right'],
      bottom: ['bottom', 'left', 'right'],
    };

    return css`
      > .reqore-drawer {
        ${sidesToStrip[$edgelessPosition].map(
          (side) => css`
            border-${side}: none;
          `
        )}
      }
    `;
  }}
`;

/**
 * It returns an icon name based on the position and whether the panel is hidden or not
 * @param {'top' | 'bottom' | 'left' | 'right'} position - The position of the panel.
 * @param {boolean} isHidden - boolean - This is a boolean value that determines whether the panel is
 * hidden or not.
 * @returns A function that takes two arguments, position and isHidden, and returns an IReqoreIconName.
 */
const getHideShowIcon = (
  position: 'top' | 'bottom' | 'left' | 'right',
  isHidden: boolean
): IReqoreIconName => {
  switch (position) {
    case 'top':
      return isHidden ? 'ArrowDownSLine' : 'ArrowUpSLine';
    case 'bottom':
      return isHidden ? 'ArrowUpSLine' : 'ArrowDownSLine';
    case 'left':
      return isHidden ? 'ArrowRightSLine' : 'ArrowLeftSLine';
    case 'right':
      return isHidden ? 'ArrowLeftSLine' : 'ArrowRightSLine';
  }
};

const getSpringConfig = (isModal?: boolean, position?: TPosition, floating?: boolean) =>
  isModal
    ? {
        from: { opacity: 0, transform: 'scale(0.5)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0.5)' },
      }
    : {
        from: { opacity: 0, [position]: '-80px' },
        enter: { opacity: 1, [position]: floating ? '10px' : '0px' },
        leave: { opacity: 0, [position]: '-80px' },
      };

export const ReqoreDrawer: React.FC<IReqoreDrawerProps> = memo(
  ({
    children,
    isOpen,
    isHidden,
    customTheme,
    inheritCustomTheme,
    position = 'right',
    maxSize,
    // No default here: the fallback differs per layout (see the Resizable
    // below), and a default would make "the caller said nothing" unreadable.
    minSize,
    minWidth,
    minHeight,
    onClose,
    hasBackdrop = true,
    size,
    resizable = true,
    hidable,
    onHideToggle,
    className,
    flat,
    floating,
    blur,
    opacity,
    intent,
    _isModal,
    width,
    height,
    actions = [],
    customZIndex,
    panelSize,
    confirmOnClose,
    focusTrap,
    ...rest
  }: IReqoreDrawerProps) => {
    // Ref for the drawer wrapper to enable focus trapping
    const drawerRef = useRef<HTMLDivElement>(null);
    const animations = useReqoreProperty('animations');
    const confirmAction = useReqoreProperty('confirmAction');
    const customPortalId = useReqoreProperty('customPortalId');
    const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
    const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
    const layout = useMemo(
      () =>
        _isModal
          ? 'center'
          : position === 'top' || position === 'bottom'
          ? 'horizontal'
          : 'vertical',
      [position, _isModal]
    );
    const [_isHidden, setIsHidden] = useState<boolean>(isHidden || false);
    const [_size, setSize] = useState<any>({
      width: width || (layout === 'horizontal' ? 'auto' : size || '300px'),
      height: height || (layout === 'vertical' ? 'auto' : size || '300px'),
    });

    // Determine if focus trap should be active
    // By default, enable focus trap for modals and drawers with backdrop
    const shouldTrapFocus = focusTrap ?? (_isModal || hasBackdrop);

    // Use focus trap to keep focus within the drawer when open
    useFocusTrap(drawerRef, {
      active: isOpen && shouldTrapFocus && !_isHidden,
      restoreFocus: true,
      autoFocus: true,
    });

    useEffect(() => {
      setSize({
        width: width || (layout === 'horizontal' ? 'auto' : size || '300px'),
        height: height || (layout === 'vertical' ? 'auto' : size || '300px'),
      });
    }, [position, size, width, height]);

    const transitions = useTransition(isOpen, {
      ...getSpringConfig(_isModal, position, floating),
      config: SPRING_CONFIG,
      // A zero-tension spring never advances from its `from` state. When
      // dialog animations are disabled, apply the entered / left styles
      // immediately so drawers and modals remain visible and interactive.
      immediate: animations.dialogs === false,
    });

    const zIndex = useMemo(
      () => customZIndex || getAndIncreaseZIndex(),
      [customZIndex, getAndIncreaseZIndex]
    );
    const wrapperZIndex = useMemo(
      () => customZIndex + 1 || getAndIncreaseZIndex(),
      [customZIndex, getAndIncreaseZIndex]
    );
    const _actions: IReqorePanelAction[] = useMemo(() => {
      const builtActions: IReqorePanelAction[] = [...actions];

      /* Adding a hide/show button to the drawer. */
      if (hidable) {
        builtActions.push({
          responsive: false,
          icon: getHideShowIcon(position, _isHidden),
          onClick: () => {
            setIsHidden(!_isHidden);

            if (onHideToggle) {
              onHideToggle(!_isHidden);
            }
          },
          className: 'reqore-drawer-hide-button',
        });
      }

      return builtActions;
    }, [hidable, position, onClose, actions, _isHidden]);

    const positions = useMemo(() => {
      /* Centering the modal. */
      if (_isModal) {
        return {};
      }

      return {
        top: position === 'top' || layout === 'vertical' ? (floating ? '10px' : 0) : undefined,
        bottom:
          position === 'bottom' || layout === 'vertical' ? (floating ? '10px' : 0) : undefined,
        right:
          position === 'right' || layout === 'horizontal' ? (floating ? '10px' : 0) : undefined,
        left: position === 'left' || layout === 'horizontal' ? (floating ? '10px' : 0) : undefined,
      };
    }, [_isModal, position, layout, floating]);

    const handleClose = onClose
      ? () => {
          if (confirmOnClose) {
            confirmAction({
              ...(typeof confirmOnClose === 'object' ? confirmOnClose : {}),
              onConfirm: onClose,
            });
          } else {
            onClose?.();
          }
        }
      : undefined;

    const closeButtonProps = useMemo(
      () => ({
        className: 'reqore-drawer-close-button',
        ...(rest.closeButtonProps || {}),
      }),
      [rest.closeButtonProps]
    );

    const panelStyle = useMemo(
      () => ({
        width: '100%',
        maxHeight: '100%',
        ...rest.style,
      }),
      [JSON.stringify(rest.style)]
    );

    const resizeableStyle = useMemo(
      () =>
        ({
          zIndex: wrapperZIndex,
          display: 'flex',
          position: 'fixed',
          /**
           * Not clipped while anything is allowed to hang outside the box.
           *
           * `re-resizable` centres every handle ON the edge it drags: the four
           * side handles are 10px bands hung at -5px, and the four corners are
           * 20x20 squares hung at -10px on BOTH axes. A clip on this box
           * amputates whatever hangs outside it, which cost the corners three
           * quarters of their area and left a 10x10 target buried INSIDE the
           * dialog: measured on `dialogs-modal--basic` at 1400x1000, a corner
           * handle declared 20x20 was reachable only between 10px and 1px in
           * from the corner, and `document.elementFromPoint()` at the corner
           * itself — and anywhere outside it — returned the backdrop, whose
           * click closes the dialog. A corner drag started there did nothing
           * (1120x500 -> 1120x500); the same drag with the clip gone resized
           * both axes (1120x500 -> 920x350).
           *
           * So the clip is dropped for exactly the two layouts that put
           * something outside the box — a `resizable` one, whose handles do,
           * and a `hidable` one, whose hide control always has and which has
           * therefore always run unclipped. A drawer that is NEITHER draws
           * nothing outside itself and keeps the clip it has always had:
           * `resizable={false}` is a promise that the box is the box, and
           * there is no reason to spend the blast radius there.
           *
           * MEASURED: removing it changed no geometry on any drawer or modal
           * story and moved 17 subpixels of edge antialiasing (max channel
           * delta 1/255) on `dialogs-modal--basic`.
           *
           * REASONED, NOT MEASURED — say so, because the measurement above
           * could not have covered it: `stickyHeader` sets a panel's own
           * wrapper to `overflow: visible` so the header can escape, and
           * `overflow: hidden` on an ancestor makes that ancestor a sticky
           * containing block, so this box was in that chain. No drawer or
           * modal story passes `stickyHeader`, while qorus-ide ships it as a
           * default in panels that render inside drawers — so the geometry
           * sweep says nothing about the case that matters most.
           *
           * The argument that it is nonetheless inert: sticky resolves against
           * the NEAREST scrollport, and a panel's header is a flex sibling
           * ABOVE its `overflow: auto` content, never inside it. So a panel
           * whose header could scroll out of view is one nested in another
           * scroller — a panel inside a panel's content — and that scroller is
           * INSIDE this box, which leaves it the nearest scrollport whether
           * this box clips or not. Where there is no such scroller, this box
           * was the nearest one, and it has never scrolled: sticky had nothing
           * to stick to either way. Deliberately not "covered" by a story,
           * because a story here would assert that a header sitting above a
           * scroller stays above it, which is true before the change, after
           * it, and with `stickyHeader` left off entirely.
           */
          overflow: resizable || hidable ? undefined : 'hidden',
          transformOrigin: 'center center',
          backfaceVisibility: 'hidden',
          ...positions,
        } as any),
      [wrapperZIndex, resizable, hidable, positions]
    );

    const handleWrapperStyle = useMemo(
      () => ({
        zIndex: wrapperZIndex + 1,
      }),
      [wrapperZIndex]
    );

    const sizeObject = useMemo(
      () => ({
        width: _isModal
          ? _size.width
          : layout === 'vertical'
          ? _isHidden
            ? 0
            : _size.width
          : 'auto',
        height: _isModal
          ? _size.height
          : layout === 'horizontal'
          ? _isHidden
            ? 0
            : _size.height
          : 'auto',
      }),
      [_isModal, layout, _isHidden, _size]
    );

    const onHideToggleClick = useCallback(() => {
      setIsHidden(!_isHidden);
      onHideToggle?.(!_isHidden);
    }, [_isHidden, onHideToggle]);

    const handleResize = useCallback(
      (_, _direction, component: HTMLElement) => {
        if (resizable) {
          setSize({
            width: component.style.width,
            height: component.style.height,
          });
        }
      },

      [resizable]
    );

    /**
     * Which edges and corners can be dragged.
     *
     * `resizable` is the whole answer first: a modal used to ignore it, because
     * every direction read `... || _isModal`. The handles were rendered anyway,
     * and because `handleResize` DOES check `resizable`, dragging one moved the
     * box through `re-resizable`'s own inline style and then snapped it back on
     * the next render — a modal that says it cannot be resized could be
     * resized, and then lost the result.
     */
    const enable = useMemo(
      () =>
        resizable
          ? {
              top: position === 'bottom' || !!_isModal,
              right: position === 'left' || !!_isModal,
              left: position === 'right' || !!_isModal,
              bottom: position === 'top' || !!_isModal,
              bottomLeft: !!_isModal,
              bottomRight: !!_isModal,
              topLeft: !!_isModal,
              topRight: !!_isModal,
            }
          : {
              top: false,
              right: false,
              left: false,
              bottom: false,
              bottomLeft: false,
              bottomRight: false,
              topLeft: false,
              topRight: false,
            },
      [resizable, position, _isModal]
    );

    return createPortal(
      transitions((styles: any, item) =>
        item ? (
          <ReqoreThemeProvider theme={theme} customTheme={customTheme}>
            {hasBackdrop && !_isHidden ? (
              <ReqoreBackdrop
                onClose={handleClose}
                zIndex={zIndex}
                blur={blur}
                opacity={styles.opacity}
              />
            ) : null}
            <StyledWrapper
              ref={drawerRef}
              zIndex={wrapperZIndex}
              className='reqore-drawer-wrapper'
              role={_isModal || hasBackdrop ? 'dialog' : undefined}
              aria-modal={_isModal || hasBackdrop ? 'true' : undefined}
            >
              <Resizable
                className={`${className || ''} reqore-drawer-resizable`}
                maxHeight={
                  layout === 'horizontal' || layout === 'center' ? maxSize || '90vh' : undefined
                }
                minHeight={
                  layout === 'center'
                    ? minHeight || minSize || MODAL_MIN_HEIGHT
                    : layout === 'horizontal'
                    ? _isHidden
                      ? 0
                      : minSize || DRAWER_MIN_SIZE
                    : undefined
                }
                maxWidth={
                  layout === 'vertical' || layout === 'center' ? maxSize || '90vw' : undefined
                }
                minWidth={
                  layout === 'center'
                    ? minWidth || minSize || MODAL_MIN_WIDTH
                    : layout === 'vertical'
                    ? _isHidden
                      ? 0
                      : minSize || DRAWER_MIN_SIZE
                    : undefined
                }
                as={StyledDrawerResizable}
                {...({
                  $edgelessPosition: !floating && !_isModal ? position : undefined,
                } as any)}
                style={{
                  ...resizeableStyle,
                  ...styles,
                }}
                handleWrapperStyle={handleWrapperStyle}
                size={sizeObject}
                onResize={handleResize}
                enable={enable}
              >
                {_isHidden && hidable ? (
                  <StyledCloseWrapper
                    className='reqore-drawer-controls'
                    position={position}
                    w={layout === 'vertical' ? 0 : _size.width}
                    h={layout === 'horizontal' ? 0 : _size.height}
                  >
                    <ReqoreButton
                      flat
                      customTheme={theme}
                      className='reqore-drawer-control reqore-drawer-hide-button'
                      icon={getHideShowIcon(position, _isHidden)}
                      onClick={onHideToggleClick}
                    />
                  </StyledCloseWrapper>
                ) : null}
                {!_isHidden && (
                  <ReqorePanel
                    {...rest}
                    size={panelSize}
                    opacity={opacity}
                    blur={hasBackdrop ? 0 : blur}
                    actions={_actions}
                    customTheme={customTheme}
                    intent={intent}
                    rounded={floating || _isModal ? true : false}
                    flat={flat}
                    onClose={handleClose}
                    closeButtonProps={closeButtonProps}
                    className={`reqore-drawer`}
                    style={panelStyle}
                  >
                    {children}
                  </ReqorePanel>
                )}
              </Resizable>
            </StyledWrapper>
          </ReqoreThemeProvider>
        ) : null
      ),
      document.querySelector(customPortalId || '#reqore-portal')!
    );
  }
);
