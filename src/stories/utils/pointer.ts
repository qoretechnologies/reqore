import { sleep } from '../../helpers/utils';

export interface IDragPointerOptions {
  /** Default `'touch'`. */
  pointerType?: 'touch' | 'mouse' | 'pen';
  /** How many moves the drag is made of. Default 6. */
  steps?: number;
  /**
   * A rest, in ms, before letting go: the finger stops, so the release carries no speed and
   * only the distance counts. Default 0, which with moves dispatched back to back reads as a
   * flick.
   */
  settle?: number;
  /**
   * Whether to let go at the end. `false` leaves the drag under way — the pointer is still
   * down at its last position — for a story captured mid-drag. Default `true`.
   */
  release?: boolean;
  pointerId?: number;
}

/**
 * A drag on `target` from `from` by `by`, the way a finger or a mouse does it: a press, a run of
 * moves and a release, as real `PointerEvent`s so the component's own pointer handling is what
 * is exercised.
 */
export const dragPointer = async (
  target: Element,
  from: { x: number; y: number },
  by: { dx: number; dy: number },
  {
    pointerType = 'touch',
    steps = 6,
    settle = 0,
    release = true,
    pointerId = 11,
  }: IDragPointerOptions = {}
) => {
  const fire = (type: string, x: number, y: number, buttons: number) =>
    target.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        pointerId,
        pointerType,
        isPrimary: true,
        button: 0,
        buttons,
      })
    );
  const toX = from.x + by.dx;
  const toY = from.y + by.dy;

  fire('pointerdown', from.x, from.y, 1);

  for (let step = 1; step <= steps; step++) {
    fire('pointermove', from.x + (by.dx * step) / steps, from.y + (by.dy * step) / steps, 1);
  }

  if (settle) {
    await sleep(settle);
    fire('pointermove', toX, toY, 1);
  }

  if (release) {
    fire('pointerup', toX, toY, 0);
  }
};
