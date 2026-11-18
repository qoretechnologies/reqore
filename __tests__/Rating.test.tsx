import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreRating,
  ReqoreUIProvider,
} from '../src';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';
import { getContrastRatio, getDrawnColor } from '../src/helpers/colors';

test('Renders <Rating /> with 5 stars by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={0} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-rating').length).toBe(1);
  expect(document.querySelectorAll('.reqore-rating-item').length).toBe(5);
});

test('Renders <Rating /> with custom max', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={3} max={10} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-rating-item').length).toBe(10);
});

test('Calls onChange when clicking a star', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={2} onChange={onChange} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const items = document.querySelectorAll('.reqore-rating-item');
  fireEvent.click(items[3]); // 4th star
  expect(onChange).toHaveBeenCalledWith(4);
});

test('Does not call onChange when disabled', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={2} onChange={onChange} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const items = document.querySelectorAll('.reqore-rating-item');
  fireEvent.click(items[3]);
  expect(onChange).not.toHaveBeenCalled();
});

test('Does not call onChange when readOnly', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={2} onChange={onChange} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const items = document.querySelectorAll('.reqore-rating-item');
  fireEvent.click(items[3]);
  expect(onChange).not.toHaveBeenCalled();
});

test('Keyboard ArrowRight increments value', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={2} onChange={onChange} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.keyDown(document.querySelector('.reqore-rating')!, { key: 'ArrowRight' });
  expect(onChange).toHaveBeenCalledWith(3);
});

test('Keyboard ArrowLeft decrements value', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={3} onChange={onChange} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.keyDown(document.querySelector('.reqore-rating')!, { key: 'ArrowLeft' });
  expect(onChange).toHaveBeenCalledWith(2);
});

test('Keyboard does not go below 0', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={0} onChange={onChange} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.keyDown(document.querySelector('.reqore-rating')!, { key: 'ArrowLeft' });
  expect(onChange).toHaveBeenCalledWith(0);
});

test('Keyboard does not go above max', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={5} max={5} onChange={onChange} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.keyDown(document.querySelector('.reqore-rating')!, { key: 'ArrowRight' });
  expect(onChange).toHaveBeenCalledWith(5);
});

test('allowClear resets value to 0 when clicking current value', () => {
  const onChange = vi.fn();
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={3} onChange={onChange} allowClear />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const items = document.querySelectorAll('.reqore-rating-item');
  fireEvent.click(items[2]); // Click the 3rd star (current value)
  expect(onChange).toHaveBeenCalledWith(0);
});

test('Renders with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={3} size="small" />
          <ReqoreRating value={3} size="big" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-rating').length).toBe(2);
});

test('Renders with intent', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={4} intent="success" />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-rating').length).toBe(1);
});

test('Has correct ARIA attributes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={3} max={5} onChange={vi.fn()} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const rating = document.querySelector('.reqore-rating')!;
  expect(rating.getAttribute('role')).toBe('slider');
  expect(rating.getAttribute('aria-valuenow')).toBe('3');
  expect(rating.getAttribute('aria-valuemin')).toBe('0');
  expect(rating.getAttribute('aria-valuemax')).toBe('5');
});

test('Renders with custom icons', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating
            value={2}
            filledIcon="HeartFill"
            emptyIcon="HeartLine"
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-rating-item').length).toBe(5);
  expect(document.querySelectorAll('.reqore-icon').length).toBe(5);
});

/** A rating that holds the value it is given, and says what it shows. */
const HeldRating = () => {
  const [value, setValue] = useState(3);
  return (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRating value={value} onChange={setValue} allowClear showRatingValue />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

test("A finger's tap previews nothing: a value the tap cleared reads as cleared", () => {
  render(<HeldRating />);
  const third = document.querySelectorAll('.reqore-rating-item')[2];

  // a tap, as a browser sends it: the finger's pointer events, then the mouse events it emulates
  fireEvent.pointerOver(third, { pointerType: 'touch', buttons: 1 });
  fireEvent.pointerDown(third, { pointerType: 'touch', buttons: 1 });
  fireEvent.pointerUp(third, { pointerType: 'touch', buttons: 0 });
  fireEvent.mouseMove(third);
  fireEvent.click(third);

  expect(screen.getByText('0 / 5')).toBeTruthy();
});

test('A mouse resting on a star previews it', () => {
  render(<HeldRating />);
  const second = document.querySelectorAll('.reqore-rating-item')[1];

  fireEvent.pointerMove(second, { pointerType: 'mouse', buttons: 0 });
  fireEvent.mouseMove(second);

  expect(screen.getByText('2 / 5')).toBeTruthy();
});

/*
 * A star in a theme's color (`filledColor='warning'`) is drawn in the shade of it that stands out by 3:1 from what
 * the rating is drawn on, as an icon given that color is; a hex is drawn as given.
 */
describe('a star in a color the caller gives', () => {
  const starColorOn = (surface: string, filledColor: string) => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreSurfaceProvider color={surface as `#${string}`}>
              <ReqoreRating value={3} max={5} filledColor={filledColor as never} />
            </ReqoreSurfaceProvider>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    const star = document.querySelector('.reqore-rating-item svg') as SVGElement;
    return getDrawnColor(getComputedStyle(star).color);
  };

  test("a theme's color stands out by 3:1 on a surface close to it", () => {
    // a brown close to the theme's warning: the warning as it is barely shows on it
    expect(getContrastRatio(starColorOn('#8a5020', 'warning'), '#8a5020')).toBeGreaterThanOrEqual(3);
  });

  test('a hex is drawn as given', () => {
    expect(starColorOn('#ffffff', '#ffee00')).toBe('#ffee00');
  });
});
