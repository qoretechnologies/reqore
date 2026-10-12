import { fireEvent, render } from '@testing-library/react';
import { IPointerDragDelta, usePointerDrag } from '../src/hooks/usePointerDrag';

/**
 * A finger's pointer is captured by the element it lands on. When a drag engages, the element
 * that drags takes the capture, and the element under the finger - a title, a label inside it -
 * reports losing it. That is the drag starting, not ending: the gesture ends only on the capture
 * it took itself. Ended on the inner element's, a swipe stopped after its first few pixels
 * whenever the finger landed on something inside the element (seen with real touch events on a
 * table's header, #710). jsdom has neither touch capture nor PointerEvent: the events are the ones
 * the browser sends, dispatched by hand.
 */

const Probe = ({
  onMove,
  onEnd,
}: {
  onMove: (delta: IPointerDragDelta) => void;
  onEnd: (delta: IPointerDragDelta, committed: boolean) => void;
}) => {
  const { handlers } = usePointerDrag({ axis: 'x', onMove, onEnd });

  return (
    <div className='probe-handle' {...handlers}>
      <span className='probe-child'>Swipe</span>
    </div>
  );
};

const finger = (clientX: number, buttons = 1) => ({
  pointerId: 1,
  pointerType: 'touch',
  isPrimary: true,
  button: 0,
  buttons,
  clientX,
  clientY: 100,
});

const lostCapture = (element: Element) =>
  fireEvent(
    element,
    Object.assign(new Event('lostpointercapture', { bubbles: true }), { pointerId: 1 })
  );

const show = () => {
  const onMove = vi.fn();
  const onEnd = vi.fn();
  const { container } = render(<Probe onMove={onMove} onEnd={onEnd} />);

  return {
    handle: container.querySelector('.probe-handle') as HTMLElement,
    child: container.querySelector('.probe-child') as HTMLElement,
    onMove,
    onEnd,
  };
};

test('a swipe that starts on something inside the element keeps going when that loses the capture', () => {
  const { child, onMove, onEnd } = show();

  fireEvent.pointerDown(child, finger(300));
  fireEvent.pointerMove(child, finger(280));
  // the element that drags took the capture: the one under the finger loses it
  lostCapture(child);
  fireEvent.pointerMove(child, finger(200));
  fireEvent.pointerUp(child, finger(200, 0));

  expect(onMove).toHaveBeenLastCalledWith(expect.objectContaining({ dx: -100 }), expect.anything());
  expect(onEnd).toHaveBeenCalledTimes(1);
  expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ dx: -100 }), true);
});

test('a drag ends when the element that drags loses the capture it took', () => {
  const { handle, child, onMove, onEnd } = show();

  fireEvent.pointerDown(child, finger(300));
  fireEvent.pointerMove(child, finger(260));
  lostCapture(handle);
  fireEvent.pointerMove(child, finger(200));

  expect(onEnd).toHaveBeenCalledTimes(1);
  expect(onEnd).toHaveBeenCalledWith(expect.objectContaining({ dx: -40 }), false);
  // nothing after the gesture ended moved it
  expect(onMove).toHaveBeenLastCalledWith(expect.objectContaining({ dx: -40 }), expect.anything());
});
