import { fireEvent, render } from '@testing-library/react';
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
  expect(document.querySelectorAll('.reqore-progress-track').length).toBe(1);
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

test('Renders <Progress /> with value label above track', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={75} showValue />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-labels').length).toBe(1);
  expect(document.querySelector('.reqore-progress-value')?.textContent).toBe('75%');
});

test('Renders <Progress /> with custom label on left side', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={45} label='Uploading files...' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-progress-label')?.textContent).toBe('Uploading files...');
});

test('Renders <Progress /> with both label and value', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={60} label='Processing...' showValue />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-progress-label')?.textContent).toBe('Processing...');
  expect(document.querySelector('.reqore-progress-value')?.textContent).toBe('60%');
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
          <ReqoreProgress value={50} max={200} showValue />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // 50/200 = 25%
  expect(document.querySelector('.reqore-progress-value')?.textContent).toBe('25%');
});

test('Renders <Progress /> clamping value to max', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={150} max={100} showValue />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Value should be clamped to 100%
  expect(document.querySelector('.reqore-progress-value')?.textContent).toBe('100%');
});

test('Renders <Progress /> with icons', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress
            value={50}
            icon='DownloadLine'
            rightIcon='CheckLine'
            label='Downloading'
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(2);
  expect(document.querySelector('.reqore-progress-label')?.textContent).toBe('Downloading');
});

test('Renders <Progress /> with flat={false} shows border', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} flat={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-track').length).toBe(1);
});

test('Renders <Progress /> animated with stripes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} animated />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-bar').length).toBe(1);
});

test('Tooltip on <Progress /> works', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreProgress value={50} tooltip='Progress tooltip' />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-progress')[0]);

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

test('Does not show labels section when no label props provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-labels').length).toBe(0);
});

test('Renders <Progress /> with target marker', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} target={80} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-target').length).toBe(1);
  expect(document.querySelectorAll('.reqore-progress-target-label').length).toBe(1);
  expect(document.querySelector('.reqore-progress-target-label')!.textContent).toBe('Target 80%');
});

test('Renders <Progress /> with custom target label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} target={75} targetLabel='Goal' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-progress-target-label')!.textContent).toBe('Goal');
});

test('Hides target label when showTargetLabel is false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} target={75} showTargetLabel={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-target').length).toBe(1);
  expect(document.querySelectorAll('.reqore-progress-target-label').length).toBe(0);
});

test('Does not render target marker when target is not set', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-target').length).toBe(0);
});

test('Does not render target marker when indeterminate', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress indeterminate target={50} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-progress-target').length).toBe(0);
});

test('Clamps target value to max', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreProgress value={50} target={150} max={100} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-progress-target-label')!.textContent).toBe('Target 100%');
});
