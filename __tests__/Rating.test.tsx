import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreRating,
  ReqoreUIProvider,
} from '../src';

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
  const onChange = jest.fn();
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
  const onChange = jest.fn();
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
  const onChange = jest.fn();
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
  const onChange = jest.fn();
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
  const onChange = jest.fn();
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
  const onChange = jest.fn();
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
  const onChange = jest.fn();
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
  const onChange = jest.fn();
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
          <ReqoreRating value={3} max={5} onChange={jest.fn()} />
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
