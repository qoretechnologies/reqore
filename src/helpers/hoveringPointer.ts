import { useMemo } from 'react';

/** What `isHoveringPointer` reads of a pointer event: a DOM `PointerEvent` or React's own. */
export interface IReqoreHoveringPointerEvent {
  pointerType: string;
  buttons: number;
}

/**
 * The pointer can hover: a mouse, or a pen held above the screen. A finger cannot.
 *
 * A tap is followed by the mouse events a browser emulates for pages written for a mouse - `mouseover`,
 * `mouseenter`, `mousemove`, `mousedown`, `mouseup`, `click` - at the tap, with nothing in them to tell them
 * from a mouse's. Whatever opened on `mouseenter` therefore opened at a tap too, and stayed open until the
 * next tap elsewhere: a hover tooltip, a panel's floating actions, a rail's labels.
 *
 * Asked of each event, not of the device (`isHoverCapable` asks about the device's primary pointer): a touch
 * laptop's mouse hovers, and so does a mouse plugged into a tablet, whose screen is still a finger's. A pen
 * hovers while it is held above the screen (`buttons` 0); pressed to it, it is drawing.
 */
export const isHoveringPointer = ({ pointerType, buttons }: IReqoreHoveringPointerEvent): boolean =>
  pointerType === 'mouse' || (pointerType === 'pen' && buttons === 0);

/**
 * Tells a mouse event a hovering pointer sent from one a browser emulated after a finger's tap.
 *
 * A browser sends the pointer events of an input before the mouse events it makes of it - a mouse's
 * `pointerenter` before its `mouseenter`, a finger's `pointerenter` ... `pointerup` before the mouse events
 * that follow its tap - and the pointer event says what the pointer is. So the pointer events that come
 * before are noted (`notePointer`: `pointerenter`, `pointerover`, `pointerdown`, `pointermove`, `pointerup`),
 * and the mouse event after them asks `isHover`, which reads what was noted once.
 *
 * A mouse event no pointer event came before is a mouse's: a browser without pointer events, or a test that
 * fires `mouseenter` alone. So nothing that opened on `mouseenter` before stops opening on it, except at a
 * tap.
 */
export interface IReqoreHoverGate {
  /** Notes the pointer of a pointer event: the mouse events after it are its own. */
  notePointer: (event: IReqoreHoveringPointerEvent) => void;
  /** The mouse event just heard is a hover: its pointer hovers, or no pointer event came before it. */
  isHover: () => boolean;
}

export const createHoverGate = (): IReqoreHoverGate => {
  let noted: IReqoreHoveringPointerEvent | undefined;
  return {
    notePointer: ({ pointerType, buttons }) => {
      noted = { pointerType, buttons };
    },
    isHover: () => {
      const pointer = noted;
      noted = undefined;
      return !pointer || isHoveringPointer(pointer);
    },
  };
};

/** A hover gate for the life of a component: see `createHoverGate`. */
export const useHoverGate = (): IReqoreHoverGate => useMemo(createHoverGate, []);

/** The pointer events a hover gate notes on an element: those a browser sends before its mouse events. */
export const HOVER_GATE_POINTER_EVENTS = [
  'pointerenter',
  'pointerover',
  'pointerdown',
  'pointermove',
  'pointerup',
] as const;

/**
 * Notes, on `target`, the pointer behind the mouse events that come next (see `createHoverGate`). Returns
 * what stops it. Capture phase, so a pointer event a child stops from bubbling is noted too.
 */
export const watchHoverGate = (target: EventTarget, gate: IReqoreHoverGate): (() => void) => {
  const note = (event: Event) => gate.notePointer(event as PointerEvent);
  HOVER_GATE_POINTER_EVENTS.forEach((type) => target.addEventListener(type, note, true));
  return () =>
    HOVER_GATE_POINTER_EVENTS.forEach((type) => target.removeEventListener(type, note, true));
};
