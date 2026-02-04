import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreProgress, ReqoreUIProvider } from '../src';

test('Renders <Progress /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress').length).toBe(1);
  expect(document.querySelectorAll('.reqore-progress-bar').length).toBe(1);
});

test('Renders <Progress /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} size='tiny' />
          <ReqoreProgress value={50} size='small' />
          <ReqoreProgress value={50} size='normal' />
          <ReqoreProgress value={50} size='big' />
          <ReqoreProgress value={50} size='huge' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress').length).toBe(5);
});

test('Renders <Progress /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} intent='info' />
          <ReqoreProgress value={50} intent='success' />
          <ReqoreProgress value={50} intent='warning' />
          <ReqoreProgress value={50} intent='danger' />
          <ReqoreProgress value={50} intent='pending' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress').length).toBe(5);
});

test('Renders <Progress /> with value label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={75} showValue size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-label').length).toBe(1);
  expect(document.querySelector('.reqore-progress-label')?.textContent).toBe('75%');
});

test('Renders <Progress /> with custom label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={45} label='45/100 items' size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-progress-label')?.textContent).toBe('45/100 items');
});

test('Renders <Progress /> indeterminate mode', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress indeterminate />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress').length).toBe(1);
});

test('Renders <Progress /> with proper ARIA attributes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={60} aria-label='Upload progress' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const progress = document.querySelector('.reqore-progress');
  expect(progress?.getAttribute('role')).toBe('progressbar');
  expect(progress?.getAttribute('aria-valuenow')).toBe('60');
  expect(progress?.getAttribute('aria-valuemin')).toBe('0');
  expect(progress?.getAttribute('aria-valuemax')).toBe('100');
  expect(progress?.getAttribute('aria-label')).toBe('Upload progress');
});

test('Renders <Progress /> disabled state', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress').length).toBe(1);
});

test('Renders <Progress /> with custom max value', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} max={200} showValue size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // 50/200 = 25%
  expect(document.querySelector('.reqore-progress-label')?.textContent).toBe('25%');
});

test('Renders <Progress /> clamping value to max', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={150} max={100} showValue size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Value should be clamped to 100%
  expect(document.querySelector('.reqore-progress-label')?.textContent).toBe('100%');
});

test('Does not show label for small sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} showValue size='micro' />
          <ReqoreProgress value={50} showValue size='tiny' />
          <ReqoreProgress value={50} showValue size='small' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Labels should not render for micro, tiny, small sizes
  expect(document.querySelectorAll('.reqore-progress-label').length).toBe(0);
});
