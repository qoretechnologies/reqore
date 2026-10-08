import { animated, SpringValue, to, useSpring, useTransition } from '@react-spring/web';
import { Resizable } from 're-resizable';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../..';
import { useReqoreMedia } from '../../hooks/useReqoreMedia';
import { SPRING_CONFIG } from '../../constants/animations';
import { IReqoreTheme } from '../../constants/theme';
import type { IReqoreConfirmationModal } from '../../containers/ReqoreProvider';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getSwipeStep } from '../../helpers/gestures';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import {
  DRAG_CONTROL_SELECTOR,
  IPointerDragDelta,
  usePointerDrag,
} from '../../hooks/usePointerDrag';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton from '../Button';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../Panel';
import { ReqoreBackdrop } from './backdrop';

export type TPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * The viewport width (px, inclusive) at or below which a `responsiveLayout`
 * drawer becomes a sheet when the caller names no breakpoint. 900 is the
 * number qorus-ide converged on for every one of its drawers: a 620–720px
 * side panel in a 900px window leaves a sliver of page that is not usable
 * anyway, so the sheet is the honest layout there. The provider's own
 * `isMobile` (≤ 480px) is too narrow for drawers that wide — at 600px such a
 * panel covers the viewport with its handle off-screen — and
 * `isMobileOrTablet` (≤ 1200px) would put sheets on landscape tablets.
 */
export const DRAWER_SHEET_BREAKPOINT = 900;

/**
 * Which viewport width switches a `responsiveLayout` drawer into a sheet:
 * `'mobile'` is the provider's `isMobile` (≤ 480px), `'tablet'` is its
 * `isMobileOrTablet` (≤ 1200px), and a number is a width in px, inclusive.
 * Omitted, it is `DRAWER_SHEET_BREAKPOINT`. Reqore owns these numbers; a
 * consumer never carries a media query of its own for this.
 */
export type TReqoreDrawerResponsiveBreakpoint = 'mobile' | 'tablet' | number;

export interface IReqoreDrawerResponsiveLayout {
  /** Which viewport width switches the layout. Defaults to `DRAWER_SHEET_BREAKPOINT` (900px). */
  below?: TReqoreDrawerResponsiveBreakpoint;
  /** The edge the sheet attaches to while the layout is active. Defaults to `'bottom'`. */
  position?: TPosition;
  /** The sheet's size on the axis it occupies. Defaults to `'100%'`. */
  size?: string;
  /**
   * The cap on that axis. Defaults to `'90vh'` — the same cap every drawer has
   * on its cross axis by default, so a bottom sheet rises to 90% of the screen
   * and leaves a strip of page above it where a tap on the backdrop closes it.
   * Pass `'100%'` for an edge-to-edge sheet. Separate from the drawer's own
   * `maxSize` on purpose: that one caps the SIDE drawer's width, and a value
   * meant as a width must never become a sheet's height.
   */
  maxSize?: string;
}

export interface IReqoreDrawerResolvedResponsiveLayout {
  /** Whether the sheet layout is in force for the current viewport. */
  active: boolean;
  /** The edge the sheet attaches to; only set while `active`. */
  position?: TPosition;
  /** The sheet's size on its axis; only set while `active`. */
  size?: string;
  /** The cap on that axis; only set while `active`. */
  maxSize?: string;
}

export const DRAWER_RESPONSIVE_LAYOUT_DEFAULTS: Required<IReqoreDrawerResponsiveLayout> = {
  below: DRAWER_SHEET_BREAKPOINT,
  position: 'bottom',
  size: '100%',
  maxSize: '90vh',
};

/**
 * What the resolver needs to know about the viewport. The two named flags are
 * the provider's; `belowSheetBreakpoint` answers "is the viewport at or below
 * the numeric `below` (or `DRAWER_SHEET_BREAKPOINT` when none is given)" and
 * is ignored when `below` names a provider breakpoint. The component evaluates
 * it with one media query; a consumer calling the resolver itself evaluates
 * it however it already measures the viewport.
 */
export interface IReqoreDrawerResponsiveViewport {
  isMobile: boolean;
  isMobileOrTablet: boolean;
  belowSheetBreakpoint: boolean;
}

/**
 * Decides whether a drawer's `responsiveLayout` is in force, and with what
 * geometry. Pure, so the decision is unit-testable without a viewport: jsdom
 * has no `matchMedia`, so every breakpoint is fixed `false` in unit tests, and
 * the rendered sheet is proven in a real browser instead — the
 * `Dialogs/Drawer` `ResponsiveSheet*` stories do that at 380px and 800px.
 *
 * A modal (`_isModal`) is never turned into a sheet: it is already centred
 * and sized for its content, and it has no edge to attach to.
 */
export const resolveDrawerResponsiveLayout = (
  responsiveLayout: boolean | IReqoreDrawerResponsiveLayout | undefined,
  viewport: IReqoreDrawerResponsiveViewport,
  isModal?: boolean
): IReqoreDrawerResolvedResponsiveLayout => {
  if (!responsiveLayout || isModal) {
    return { active: false };
  }

  const config: IReqoreDrawerResponsiveLayout =
    responsiveLayout === true ? {} : responsiveLayout;
  const below = config.below ?? DRAWER_RESPONSIVE_LAYOUT_DEFAULTS.below;
  const active =
    below === 'mobile'
      ? viewport.isMobile
      : below === 'tablet'
      ? viewport.isMobileOrTablet
      : viewport.belowSheetBreakpoint;

  if (!active) {
    return { active: false };
  }

  return {
    active: true,
    position: config.position ?? DRAWER_RESPONSIVE_LAYOUT_DEFAULTS.position,
    size: config.size ?? DRAWER_RESPONSIVE_LAYOUT_DEFAULTS.size,
    maxSize: config.maxSize ?? DRAWER_RESPONSIVE_LAYOUT_DEFAULTS.maxSize,
  };
};

/**
 * The px width behind a `responsiveLayout` config's numeric `below`, or the
 * default when it names a provider breakpoint or nothing — the component
 * always subscribes to exactly one query, so a hook never comes and goes.
 */
export const drawerSheetBreakpointPx = (
  responsiveLayout: boolean | IReqoreDrawerResponsiveLayout | undefined
): number =>
  responsiveLayout && responsiveLayout !== true && typeof responsiveLayout.below === 'number'
    ? responsiveLayout.below
    : DRAWER_SHEET_BREAKPOINT;

/** An offset of the drawer's box from where it would otherwise sit, in px. */
export interface IReqoreDrawerDragOffset {
  x: number;
  y: number;
}

/**
 * What a sheet dragged by `delta` does. `offset` is where to draw it meanwhile: it follows the
 * finger toward the edge it is attached to and stays put when pulled the other way — a bottom
 * sheet is not lifted off its edge. `closes` is whether letting go here closes it: past
 * `SWIPE.distance` of its `size` on that axis, or with a flick (`SWIPE.velocity`) toward the edge.
 */
export const getSheetSwipe = (
  position: TPosition,
  delta: IPointerDragDelta,
  size: number
): { offset: IReqoreDrawerDragOffset; closes: boolean } => {
  const vertical = position === 'top' || position === 'bottom';
  const towardEdge = position === 'bottom' || position === 'right' ? 1 : -1;
  const distance = towardEdge * (vertical ? delta.dy : delta.dx);
  const velocity = towardEdge * (vertical ? delta.vy : delta.vx);
  const travel = distance > 0 ? towardEdge * distance : 0;

  return {
    offset: vertical ? { x: 0, y: travel } : { x: travel, y: 0 },
    closes: getSwipeStep(distance, velocity, size) === 1,
  };
};

/** What a modal's drag is held within. */
export interface IReqoreModalDragBounds {
  /** The box with no offset applied: where the modal sits at rest. */
  box: { left: number; top: number; width: number; height: number };
  viewport: { width: number; height: number };
  /** The height of the title bar, the part that has to stay reachable. */
  handleHeight: number;
}

const clampBetween = (value: number, a: number, b: number): number =>
  Math.min(Math.max(value, Math.min(a, b)), Math.max(a, b));

/**
 * `offset` held so the modal's title bar stays whole in the viewport: the box's left and right
 * edges inside it, the bar fully below the top and above the bottom. The title bar is what the
 * modal is dragged and closed by, and one pushed off-screen has no way back. A box wider than
 * the viewport cannot satisfy that on its axis; it is held to always span the viewport instead.
 */
export const clampModalDragOffset = (
  offset: IReqoreDrawerDragOffset,
  { box, viewport, handleHeight }: IReqoreModalDragBounds
): IReqoreDrawerDragOffset => ({
  x: clampBetween(offset.x, -box.left, viewport.width - box.left - box.width),
  y: clampBetween(offset.y, -box.top, viewport.height - box.top - handleHeight),
});

/**
 * Whether a press at `target` lands on the drawer's own title bar — the handle a sheet is swiped
 * and a modal dragged by — and not on a control in it. The bar is the drawer panel's direct
 * `.reqore-panel-title`; a panel in the drawer's content has one of its own, and that one is
 * not a handle. A press on a button (the close control, an action), a link, a field or the
 * actions' control group is theirs.
 */
export const isDrawerHeaderGrab = (target: EventTarget | null, box: HTMLElement): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }

  const bar = target.closest('.reqore-panel-title');

  if (!bar || !bar.parentElement?.classList.contains('reqore-drawer') || !box.contains(bar)) {
    return false;
  }

  const control = target.closest(DRAG_CONTROL_SELECTOR);

  return !control || !bar.contains(control);
};

/** What a header drag measured when it began. */
interface IDrawerDragStart {
  /** The offset the box already had. */
  offset: IReqoreDrawerDragOffset;
  /** The sheet's size on the axis it moves along. */
  size: number;
  /** A modal's bounds; a sheet has none. */
  bounds?: IReqoreModalDragBounds;
}

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
 * THE FLOOR ALSO APPLIES AT REST, which is worth stating plainly because it is
 * easy to assume otherwise. `re-resizable` takes `minWidth` / `minHeight` both
 * as the drag clamp and as the element's inline `min-width` / `min-height`, so
 * a modal SMALLER than the floor is grown to it without anybody touching it.
 * Measured on a freshly rendered `ReqoreModal`: `min-height: 80px;
 * min-width: 200px` on `.reqore-drawer-resizable`, and `utilities-global-modal
 * --cannot-be-closed` went from ~42px tall to 80px, its one line of text at the
 * top and the rest empty.
 *
 * Width is inert in practice — the default is `80vw` and the narrowest modal in
 * reqore, reqraft and qorus-ide is 480px — so what this actually changes is the
 * height of a modal with less than 80px of content, which in practice means one
 * with no header. Such a modal reserves room for chrome it does not have. That
 * is accepted rather than worked around: 80px is a reasonable smallest dialog,
 * and the alternative — handing `re-resizable` its bounds only once a drag is
 * under way — buys a little dead space back in exchange for a clamp that
 * silently stops clamping if the library ever snapshots its bounds at drag
 * start. If a caller wants a smaller resting modal, `minHeight` takes any value
 * this does, including one below the default floor.
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
  /**
   * Become a full-width sheet on small screens instead of a fixed-size edge
   * panel. OPT-IN, because it changes geometry a caller may have sized for.
   *
   * A `size='720px'` right-hand drawer is unusable at 380px: it covers the
   * whole viewport, its resize handle sits off-screen and nothing says why
   * the page behind it stopped responding. With `responsiveLayout`, at or
   * below the breakpoint — `DRAWER_SHEET_BREAKPOINT` (900px) unless `below`
   * says `'mobile'` (≤ 480px), `'tablet'` (≤ 1200px) or a px number — the
   * drawer attaches to the bottom edge (or the `position` given), takes
   * `100%` of that axis (or the `size` given) up to a `maxSize` of `90vh`
   * (or the one given; `'100%'` for edge to edge), and drops the affordances
   * that make no sense on a sheet — `resizable`, `hidable` and `floating` are
   * off while the layout is active, and a drawer the user had hidden on a
   * wide screen is shown again rather than left hidden with no control to
   * bring it back. Above the breakpoint nothing changes.
   *
   * These defaults are qorus-ide's `useResponsiveDrawerProps` behaviour moved
   * into the library: bottom, full width, 90% of the height, at 900px. Pass
   * `true` for them, or `{ below, position, size, maxSize }` to tune them.
   * The root carries `.reqore-drawer-sheet` while the layout is active, so a
   * story or test can assert which branch rendered.
   *
   * Reqore owns the breakpoints: consumers must not hand-roll a `matchMedia`
   * for this — that is exactly the local workaround this prop replaces.
   * Modals (`ReqoreModal`) ignore it; they are centred and content-sized
   * already.
   */
  responsiveLayout?: boolean | IReqoreDrawerResponsiveLayout;
  /**
   * Whether the sheet can be pushed away. While `responsiveLayout` has made the drawer a sheet,
   * dragging its title bar toward the edge it is attached to follows the finger, and letting go
   * past `SWIPE.distance` (18%) of the sheet's size on that axis — or with a flick toward the
   * edge — closes it through the same path as the close button, so `confirmOnClose` still asks
   * first. A shorter drag springs back; at once under `prefers-reduced-motion` or with
   * `animations.dialogs` off. The title bar alone is the handle (not a button, an action or a
   * field in it), so the content scrolls as it always did, and every sheet `position` swipes
   * toward its own edge. The box carries `.reqore-drawer-swipeable` while it is on and
   * `.reqore-drawer-dragging` during a drag. Default `true`: a sheet a finger cannot push away
   * reads as stuck. Nothing outside the sheet layout, and nothing without an `onClose`.
   */
  swipeToClose?: boolean;
  /**
   * `ReqoreModal`'s `draggable`, handed over under another name so that the HTML attribute of
   * that name never reaches the DOM — it would start the browser's own drag of the panel.
   * @internal
   */
  _draggable?: boolean;
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
  /** The title bar is a handle: `'swipe'` pushes a sheet away, `'drag'` moves a modal. */
  $handle?: 'swipe' | 'drag';
  $dragging?: boolean;
}>`
  pointer-events: auto;

  ${({ $handle }) =>
    $handle &&
    css`
      /* The drawer's own title bar, not that of a panel in its content. The browser must not
         pan or zoom from a press there: the drag is ours. */
      > .reqore-drawer > .reqore-panel-title {
        touch-action: none;
        cursor: ${$handle === 'drag' ? 'move' : 'grab'};
      }
    `}

  ${({ $handle, $dragging }) =>
    $dragging &&
    css`
      user-select: none;

      > .reqore-drawer > .reqore-panel-title {
        cursor: ${$handle === 'drag' ? 'move' : 'grabbing'};
      }
    `}

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
    position: positionProp = 'right',
    maxSize: maxSizeProp,
    // No default here: the fallback differs per layout (see the Resizable
    // below), and a default would make "the caller said nothing" unreadable.
    minSize,
    minWidth,
    minHeight,
    onClose,
    hasBackdrop = true,
    size: sizeProp,
    resizable: resizableProp = true,
    hidable: hidableProp,
    onHideToggle,
    className,
    flat,
    floating: floatingProp,
    responsiveLayout,
    swipeToClose,
    _draggable,
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
    const isMobile = useReqoreProperty('isMobile');
    const isMobileOrTablet = useReqoreProperty('isMobileOrTablet');
    // One query, always subscribed (a hook cannot come and go with the prop):
    // the numeric sheet breakpoint, or the default when a provider breakpoint
    // is named and this flag is ignored anyway.
    const belowSheetBreakpoint = useReqoreMedia(
      `(max-width: ${drawerSheetBreakpointPx(responsiveLayout)}px)`
    );
    // The sheet decision is made once per render from the breakpoints, and
    // every geometry input below is derived from it, so the rest of the
    // component never has to ask "is the layout active?" again.
    const sheet = useMemo(
      () =>
        resolveDrawerResponsiveLayout(
          responsiveLayout,
          { isMobile, isMobileOrTablet, belowSheetBreakpoint },
          _isModal
        ),
      [responsiveLayout, isMobile, isMobileOrTablet, belowSheetBreakpoint, _isModal]
    );
    const position = sheet.active ? sheet.position : positionProp;
    const size = sheet.active ? sheet.size : sizeProp;
    const maxSize = sheet.active ? sheet.maxSize : maxSizeProp;
    const resizable = sheet.active ? false : resizableProp;
    const hidable = sheet.active ? false : hidableProp;
    const floating = sheet.active ? false : floatingProp;
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
    // A sheet has no hide control, so a drawer hidden on a wide screen is shown
    // again when the layout becomes active; the user's choice is kept in
    // `_isHidden` and honoured again once the viewport widens.
    const hidden = sheet.active ? false : _isHidden;
    const [_size, setSize] = useState<any>({
      width: width || (layout === 'horizontal' ? 'auto' : size || '300px'),
      height: height || (layout === 'vertical' ? 'auto' : size || '300px'),
    });

    // Determine if focus trap should be active
    // By default, enable focus trap for modals and drawers with backdrop
    const shouldTrapFocus = focusTrap ?? (_isModal || hasBackdrop);

    // Use focus trap to keep focus within the drawer when open
    useFocusTrap(drawerRef, {
      active: isOpen && shouldTrapFocus && !hidden,
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

    const isHoverCapable = useReqoreProperty('isHoverCapable');
    const reducedMotion = usePrefersReducedMotion();
    // Motion that is not the finger's own — a sheet let go early springing back — is instant
    // when the user asked for less of it, or when dialog animations are off.
    const immediateMotion = animations.dialogs === false || reducedMotion;
    // A sheet with nothing to close into cannot be swiped. A modal is dragged only where the
    // pointer can hover: the `move` cursor on its title bar is the affordance, and on a touch
    // screen a press on a header belongs to the page.
    const swipeable = sheet.active && swipeToClose !== false && !!onClose;
    const draggable = !!_isModal && !!_draggable && isHoverCapable;
    const [drag, dragApi] = useSpring(() => ({ x: 0, y: 0, config: SPRING_CONFIG }));
    const dragStartRef = useRef<IDrawerDragStart | null>(null);
    const [closedBySwipe, setClosedBySwipe] = useState(false);

    const { dragging, handlers: dragHandlers } = usePointerDrag({
      enabled: swipeable || draggable,
      // A sheet moves on one axis, so a press that scrolls along the other is not a swipe.
      axis: draggable ? 'both' : layout === 'horizontal' ? 'y' : 'x',
      canStart: (event) => isDrawerHeaderGrab(event.target, event.currentTarget),
      onStart: (box) => {
        const rect = box.getBoundingClientRect();
        const offset = { x: drag.x.get(), y: drag.y.get() };

        dragStartRef.current = {
          offset,
          size: layout === 'horizontal' ? rect.height : rect.width,
          bounds: draggable
            ? {
                box: {
                  left: rect.left - offset.x,
                  top: rect.top - offset.y,
                  width: rect.width,
                  height: rect.height,
                },
                viewport: {
                  width: document.documentElement.clientWidth,
                  height: document.documentElement.clientHeight,
                },
                handleHeight:
                  box
                    .querySelector(':scope > .reqore-drawer > .reqore-panel-title')
                    ?.getBoundingClientRect().height ?? 0,
              }
            : undefined,
        };
      },
      onMove: (delta) => {
        const start = dragStartRef.current;

        if (!start) {
          return;
        }

        dragApi.set(
          start.bounds
            ? clampModalDragOffset(
                { x: start.offset.x + delta.dx, y: start.offset.y + delta.dy },
                start.bounds
              )
            : getSheetSwipe(position, delta, start.size).offset
        );
      },
      onEnd: (delta, committed) => {
        const start = dragStartRef.current;

        dragStartRef.current = null;

        // A modal stays where it was let go.
        if (!start || start.bounds) {
          return;
        }

        if (committed && getSheetSwipe(position, delta, start.size).closes) {
          // Closed from where the finger left it: the leave transition carries on from there.
          setClosedBySwipe(true);
          handleClose?.();
        } else {
          dragApi.start({ x: 0, y: 0, immediate: immediateMotion });
        }
      },
    });

    // A sheet whose swipe asked to close but is still open — `confirmOnClose` is asking, or the
    // caller closes it later — springs back meanwhile; one that did close keeps its offset, so
    // the leave transition carries on from where the finger left it.
    useEffect(() => {
      if (!closedBySwipe) {
        return;
      }

      setClosedBySwipe(false);

      if (isOpen) {
        dragApi.start({ x: 0, y: 0, immediate: immediateMotion });
      }
    }, [closedBySwipe, isOpen]);

    // Wherever the box was dragged to, it opens in its place next time.
    useEffect(() => {
      if (isOpen) {
        dragApi.set({ x: 0, y: 0 });
      }
    }, [isOpen]);

    // The box's `transform`: the drag's own translate ahead of whatever the enter / leave spring
    // sets (a modal scales in), so neither overwrites the other. Nothing at rest, so a sheet
    // keeps the plain box it always had.
    const dragTransform = useCallback(
      (spring?: SpringValue<string>) => {
        const own = to([drag.x, drag.y], (x, y) =>
          x || y ? `translate3d(${x}px, ${y}px, 0)` : ''
        );

        return spring ? to([own, spring], (a, b) => `${a} ${b}`.trim()) : own;
      },
      [drag.x, drag.y]
    );

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
          ? hidden
            ? 0
            : _size.width
          : 'auto',
        height: _isModal
          ? _size.height
          : layout === 'horizontal'
          ? hidden
            ? 0
            : _size.height
          : 'auto',
      }),
      [_isModal, layout, hidden, _size]
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
            {hasBackdrop && !hidden ? (
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
                className={`${className || ''} reqore-drawer-resizable${
                  sheet.active ? ' reqore-drawer-sheet' : ''
                }${swipeable ? ' reqore-drawer-swipeable' : ''}${
                  draggable ? ' reqore-drawer-draggable' : ''
                }${dragging ? ' reqore-drawer-dragging' : ''}`}
                maxHeight={
                  layout === 'horizontal' || layout === 'center' ? maxSize || '90vh' : undefined
                }
                minHeight={
                  layout === 'center'
                    ? minHeight || minSize || MODAL_MIN_HEIGHT
                    : layout === 'horizontal'
                    ? hidden
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
                    ? hidden
                      ? 0
                      : minSize || DRAWER_MIN_SIZE
                    : undefined
                }
                as={StyledDrawerResizable}
                {...({
                  $edgelessPosition: !floating && !_isModal ? position : undefined,
                  $handle: draggable ? 'drag' : swipeable ? 'swipe' : undefined,
                  $dragging: dragging,
                } as any)}
                {...dragHandlers}
                style={{
                  ...resizeableStyle,
                  ...styles,
                  transform: dragTransform(styles.transform),
                }}
                handleWrapperStyle={handleWrapperStyle}
                size={sizeObject}
                onResize={handleResize}
                enable={enable}
              >
                {hidden && hidable ? (
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
                {!hidden && (
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
