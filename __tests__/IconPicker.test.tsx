import { fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { ALL_REQORE_ICONS, ReqoreIconPicker } from '../src/components/IconPicker';
import { IReqoreIconName } from '../src/types/icons';

const WEATHER_ICONS: IReqoreIconName[] = [
  'SunLine',
  'MoonLine',
  'CloudyLine',
  'RainyLine',
  'SnowyLine',
  'WindyLine',
  'ThunderstormsLine',
  'MistLine',
  'FoggyLine',
  'TornadoLine',
];

const renderPicker = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const openPicker = () => {
  fireEvent.click(document.querySelector('.reqore-icon-picker')!);
  act(() => {
    vi.advanceTimersByTime(1);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('Renders <IconPicker /> trigger button', () => {
  renderPicker(<ReqoreIconPicker />);

  expect(document.querySelectorAll('.reqore-icon-picker').length).toBe(1);
});

test('Opens the popover with the icon grid on click', () => {
  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} />);

  expect(document.querySelectorAll('.reqore-icon-picker-grid').length).toBe(0);

  openPicker();

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon-picker-grid').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon-picker-item').length).toBe(WEATHER_ICONS.length);
});

test('Renders the filter input by default', () => {
  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} />);
  openPicker();

  expect(document.querySelectorAll('.reqore-icon-picker-filter').length).toBe(1);
});

test('Hides the filter input when filterable={false}', () => {
  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} filterable={false} />);
  openPicker();

  expect(document.querySelectorAll('.reqore-icon-picker-filter').length).toBe(0);
});

test('Filters the icon grid by query', () => {
  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} />);
  openPicker();

  expect(document.querySelectorAll('.reqore-icon-picker-item').length).toBe(WEATHER_ICONS.length);

  act(() => {
    fireEvent.change(document.querySelector('.reqore-icon-picker-filter')!, {
      target: { value: 'sun' },
    });
    vi.advanceTimersByTime(1);
  });

  // Only 'SunLine' contains 'sun'
  expect(document.querySelectorAll('.reqore-icon-picker-item').length).toBe(1);
});

test('Shows the no-results message when nothing matches', () => {
  renderPicker(
    <ReqoreIconPicker icons={WEATHER_ICONS} noResultsLabel='Nothing here' />
  );
  openPicker();

  act(() => {
    fireEvent.change(document.querySelector('.reqore-icon-picker-filter')!, {
      target: { value: 'zzzzznomatch' },
    });
    vi.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-icon-picker-grid').length).toBe(0);
  expect(document.querySelector('.reqore-icon-picker-empty')!.textContent).toBe('Nothing here');
});

test('Calls onPick with the chosen icon name', () => {
  const handlePick = vi.fn();

  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} onPick={handlePick} />);
  openPicker();

  act(() => {
    fireEvent.click(document.querySelectorAll('.reqore-icon-picker-item')[0]);
    vi.advanceTimersByTime(1);
  });

  expect(handlePick).toHaveBeenCalledTimes(1);
  expect(handlePick).toHaveBeenCalledWith('SunLine');
});

test('Closes the popover after an icon is picked', () => {
  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} onPick={vi.fn()} />);
  openPicker();

  expect(document.querySelectorAll('.reqore-icon-picker-grid').length).toBe(1);

  act(() => {
    fireEvent.click(document.querySelectorAll('.reqore-icon-picker-item')[0]);
    vi.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-icon-picker-grid').length).toBe(0);
});

test('Virtualizes the grid — only a subset of a large icon set is mounted', () => {
  // The full Remix set is thousands of icons; virtualization must keep the
  // mounted cell count small (only what fits the viewport + overscan).
  expect(ALL_REQORE_ICONS.length).toBeGreaterThan(1000);

  renderPicker(<ReqoreIconPicker />);
  openPicker();

  const renderedCount = document.querySelectorAll('.reqore-icon-picker-item').length;
  expect(renderedCount).toBeGreaterThan(0);
  expect(renderedCount).toBeLessThan(300);
});

test('Scrolling the virtualized grid reveals later icons (no paging dead-end)', () => {
  renderPicker(<ReqoreIconPicker />);
  openPicker();

  const grid = document.querySelector('.reqore-icon-picker-grid')!;
  const firstIcon = ALL_REQORE_ICONS[0];

  // The very first icon is mounted before scrolling.
  expect(document.querySelector(`[aria-label="${firstIcon}"]`)).toBeTruthy();

  // Simulate scrolling far down the virtual surface.
  Object.defineProperty(grid, 'clientHeight', { value: 320, configurable: true });
  Object.defineProperty(grid, 'scrollHeight', { value: 16000, configurable: true });
  Object.defineProperty(grid, 'scrollTop', { value: 6000, configurable: true });

  act(() => {
    fireEvent.scroll(grid);
    vi.advanceTimersByTime(1);
  });

  // The first icon is now scrolled out of the mounted window, and the grid
  // still renders icons — i.e. the user can scroll past the start.
  expect(document.querySelector(`[aria-label="${firstIcon}"]`)).toBeNull();
  expect(document.querySelectorAll('.reqore-icon-picker-item').length).toBeGreaterThan(0);
});

test('Marks the selected value in the grid', () => {
  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} value='MoonLine' />);
  openPicker();

  expect(document.querySelectorAll('.reqore-icon-picker-item-selected').length).toBe(1);
});

test('Clamps the column count to the viewport width on narrow screens', () => {
  const originalWidth = window.innerWidth;
  // Force a phone-width viewport before the popover content mounts.
  Object.defineProperty(window, 'innerWidth', { value: 300, configurable: true, writable: true });

  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} columns={8} filterable={false} />);
  openPicker();

  // normal cell = SIZE_TO_PX.normal (38) + gap (4) = 42px.
  // available = 300 - 48 margin = 252 → floor(252 / 42) = 6 columns (< requested 8).
  const grid = document.querySelector('.reqore-icon-picker-grid') as HTMLElement;
  expect(grid.style.width).toBe('252px');

  Object.defineProperty(window, 'innerWidth', {
    value: originalWidth,
    configurable: true,
    writable: true,
  });
});

test('Uses the requested column count when the viewport is wide enough', () => {
  // jsdom default viewport (1024px) easily fits 8 columns.
  renderPicker(<ReqoreIconPicker icons={WEATHER_ICONS} columns={8} filterable={false} />);
  openPicker();

  // 8 columns × 42px cell = 336px.
  const grid = document.querySelector('.reqore-icon-picker-grid') as HTMLElement;
  expect(grid.style.width).toBe('336px');
});

test('Renders <IconPicker /> disabled', () => {
  renderPicker(<ReqoreIconPicker disabled />);

  expect(document.querySelector('.reqore-icon-picker')!.getAttribute('disabled')).not.toBe(null);
});

test('Renders <IconPicker inline /> grid without a trigger button', () => {
  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} />);

  // No popover/trigger interaction needed — the grid is in the layout already.
  expect(document.querySelectorAll('.reqore-icon-picker-grid').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon-picker-item').length).toBe(WEATHER_ICONS.length);
  // No popover is created.
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Renders the filter input in inline mode', () => {
  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} />);

  expect(document.querySelectorAll('.reqore-icon-picker-filter').length).toBe(1);
});

test('Filters the grid in inline mode', () => {
  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} />);

  act(() => {
    fireEvent.change(document.querySelector('.reqore-icon-picker-filter')!, {
      target: { value: 'moon' },
    });
    vi.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-icon-picker-item').length).toBe(1);
});

test('Calls onPick in inline mode', () => {
  const handlePick = vi.fn();

  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} onPick={handlePick} />);

  act(() => {
    fireEvent.click(document.querySelectorAll('.reqore-icon-picker-item')[0]);
    vi.advanceTimersByTime(1);
  });

  expect(handlePick).toHaveBeenCalledTimes(1);
  expect(handlePick).toHaveBeenCalledWith('SunLine');
});

test('Marks the selected value in inline mode', () => {
  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} value='RainyLine' />);

  expect(document.querySelectorAll('.reqore-icon-picker-item-selected').length).toBe(1);
});

test('Shows the selected-icon preview above the grid when value is set', () => {
  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} value='SunLine' />);

  expect(document.querySelectorAll('.reqore-icon-picker-selected').length).toBe(1);
});

test('Does not show the selected preview when no value is set', () => {
  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} />);

  expect(document.querySelectorAll('.reqore-icon-picker-selected').length).toBe(0);
});

test('Shows the selected preview alongside the filter input', () => {
  renderPicker(<ReqoreIconPicker inline icons={WEATHER_ICONS} value='MoonLine' />);

  expect(document.querySelectorAll('.reqore-icon-picker-selected').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon-picker-filter').length).toBe(1);
});

test('Shows the selected preview on its own row when not filterable', () => {
  renderPicker(
    <ReqoreIconPicker inline filterable={false} icons={WEATHER_ICONS} value='CloudyLine' />
  );

  expect(document.querySelectorAll('.reqore-icon-picker-selected').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon-picker-filter').length).toBe(0);
});

test('Renders <IconPicker inline fluid /> grid', () => {
  renderPicker(<ReqoreIconPicker inline fluid icons={WEATHER_ICONS} />);

  expect(document.querySelectorAll('.reqore-icon-picker-grid').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon-picker-item').length).toBe(WEATHER_ICONS.length);
});

test('Renders <IconPicker /> with intents', () => {
  renderPicker(
    <>
      <ReqoreIconPicker intent='info' />
      <ReqoreIconPicker intent='success' />
      <ReqoreIconPicker intent='warning' />
      <ReqoreIconPicker intent='danger' />
    </>
  );

  expect(document.querySelectorAll('.reqore-icon-picker').length).toBe(4);
});
