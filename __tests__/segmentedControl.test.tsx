import { fireEvent, render } from '@testing-library/react';
import { getContrast, getLuminance, parseToRgb } from 'polished';
import { vi } from 'vitest';
import { getSegmentedControlSurfaces } from '../src/components/SegmentedControl';
import { DEFAULT_THEME, IReqoreTheme } from '../src/constants/theme';
import { getReadableColorFrom } from '../src/helpers/colors';
import {
  ReqoreContent,
  ReqoreIcon,
  ReqoreLayoutContent,
  ReqoreSegmentedControl,
  ReqoreUIProvider,
} from '../src';

const defaultItems = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

const renderControl = (props = {}) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSegmentedControl items={defaultItems} value='day' {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Renders <SegmentedControl /> with correct number of items', () => {
  renderControl();

  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
  expect(document.querySelectorAll('.reqore-segmented-control-item').length).toBe(4);
});

test('Renders nothing when items array is empty', () => {
  renderControl({ items: [] });

  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(0);
});

test('Has correct ARIA attributes', () => {
  renderControl();

  const container = document.querySelector('.reqore-segmented-control')!;
  expect(container.getAttribute('role')).toBe('radiogroup');

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  items.forEach((item) => {
    expect(item.getAttribute('role')).toBe('radio');
  });

  // First item is selected
  expect(items[0].getAttribute('aria-checked')).toBe('true');
  expect(items[1].getAttribute('aria-checked')).toBe('false');
});

/* A radio group is ONE tab stop (WAI-ARIA radio group pattern): Tab reaches the
   selected item, and the arrow keys move between items. This used to assert that
   every item was a tab stop — which is what the button did while it overwrote the
   `tabIndex` the control gives each item, not what the control asks for. */
test('The selected item is the one tab stop, and the arrow keys move it', () => {
  renderControl();

  const tabStops = () =>
    Array.from(document.querySelectorAll('.reqore-segmented-control-item')).map((item) =>
      item.getAttribute('tabindex')
    );

  expect(tabStops()).toEqual(['0', '-1', '-1', '-1']);

  fireEvent.keyDown(document.querySelector('.reqore-segmented-control')!, { key: 'ArrowRight' });

  expect(tabStops()).toEqual(['-1', '0', '-1', '-1']);
  expect(document.activeElement).toBe(
    document.querySelectorAll('.reqore-segmented-control-item')[1]
  );
});

test('Calls onChange when clicking an item', () => {
  const onChange = vi.fn();
  renderControl({ onChange });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[2]); // Click "Month"
  expect(onChange).toHaveBeenCalledWith('month');
});

test('Does not call onChange when disabled', () => {
  const onChange = vi.fn();
  renderControl({ onChange, disabled: true });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[2]);
  expect(onChange).not.toHaveBeenCalled();
});

test('Does not call onChange when readOnly', () => {
  const onChange = vi.fn();
  renderControl({ onChange, readOnly: true });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[2]);
  expect(onChange).not.toHaveBeenCalled();
});

test('Skips disabled items in keyboard navigation', () => {
  const onChange = vi.fn();
  renderControl({
    onChange,
    items: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ],
    value: 'a',
  });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'ArrowRight' });
  // Should skip 'b' (disabled) and select 'c'
  expect(onChange).toHaveBeenCalledWith('c');
});

test('Keyboard ArrowRight wraps to first item', () => {
  const onChange = vi.fn();
  renderControl({ onChange, value: 'year' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'ArrowRight' });
  expect(onChange).toHaveBeenCalledWith('day');
});

test('Keyboard ArrowLeft wraps to last item', () => {
  const onChange = vi.fn();
  renderControl({ onChange, value: 'day' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'ArrowLeft' });
  expect(onChange).toHaveBeenCalledWith('year');
});

test('Keyboard Home selects first enabled item', () => {
  const onChange = vi.fn();
  renderControl({ onChange, value: 'month' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'Home' });
  expect(onChange).toHaveBeenCalledWith('day');
});

test('Keyboard End selects last enabled item', () => {
  const onChange = vi.fn();
  renderControl({ onChange, value: 'day' });

  const container = document.querySelector('.reqore-segmented-control')!;
  fireEvent.keyDown(container, { key: 'End' });
  expect(onChange).toHaveBeenCalledWith('year');
});

test('allowDeselect clears value when clicking active item', () => {
  const onChange = vi.fn();
  renderControl({ onChange, value: 'day', allowDeselect: true });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[0]); // Click currently selected "Day"
  expect(onChange).toHaveBeenCalledWith(undefined);
});

test('Renders with different sizes', () => {
  renderControl({ size: 'small' });
  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
});

test('Renders with intent', () => {
  renderControl({ intent: 'success' });
  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
});

test('Renders with pill shape', () => {
  renderControl({ pill: true });
  expect(document.querySelectorAll('.reqore-segmented-control').length).toBe(1);
});

test('Per-item disabled prevents clicking that item', () => {
  const onChange = vi.fn();
  renderControl({
    onChange,
    items: [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B', disabled: true },
      { value: 'c', label: 'C' },
    ],
    value: 'a',
  });

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  fireEvent.click(items[1]); // Click disabled "B"
  expect(onChange).not.toHaveBeenCalled();
});

test('Selects first item by default when no value or defaultValue provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSegmentedControl items={defaultItems} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const items = document.querySelectorAll('.reqore-segmented-control-item');
  expect(items[0].getAttribute('aria-checked')).toBe('true');
});

test('Shows "More" dropdown when items overflow container width', () => {
  renderControl({
    _testWidth: 150,
    items: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' },
    ],
    value: 'day',
  });

  // Should have a "More" button
  expect(document.querySelectorAll('.reqore-segmented-control-more').length).toBe(1);
  // Should have fewer visible items than total
  const visibleItems = document.querySelectorAll('.reqore-segmented-control-item');
  expect(visibleItems.length).toBeLessThan(4);
});

test('Shows selected item label in "More" button when active item is hidden', () => {
  renderControl({
    _testWidth: 150,
    items: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' },
    ],
    value: 'year', // This item will be hidden in the "More" group
  });

  const moreButton = document.querySelector('.reqore-segmented-control-more');
  expect(moreButton).toBeTruthy();
  // The "More" button should display the hidden selected item's label
  expect(moreButton!.textContent).toContain('Year');
  // ...and is marked the way a visible selected segment is: by the highlight, not a fill
  expect(document.querySelector('.reqore-segmented-control-indicator')).toBeTruthy();
});

/**
 * The geometry a browser reports for a container whose border-box starts at 20, `width` px
 * wide, with a 1px border and 3px padding, so its first 55px item starts at 24. `scale` is
 * an ancestor's transform (a modal zooms in from 0.5): it shrinks every drawn rect, while
 * layout sizes (`offsetWidth`, rounded to a whole pixel, and `clientLeft`) stay as they are.
 * Returns the function that puts the real geometry back.
 */
const mockGeometry = ({ scale = 1, width = 255 }: { scale?: number; width?: number } = {}) => {
  const realRect = Element.prototype.getBoundingClientRect;
  const realClientLeft = Object.getOwnPropertyDescriptor(Element.prototype, 'clientLeft');
  const realOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  const isContainer = (el: Element) => el.classList.contains('reqore-segmented-control');
  // A button carries its label twice (the copy that swaps in on hover), so match a prefix.
  const itemIndex = (el: Element) => {
    const button = el.matches('button') ? el : el.querySelector('button.reqore-segmented-control-item');
    const text = button?.textContent?.trim() ?? '';
    return ['Day', 'Week', 'Month', 'Year'].findIndex((label) => text.startsWith(label));
  };
  const drawn = (left: number, boxWidth: number) =>
    ({
      top: 20 * scale,
      bottom: 66 * scale,
      height: 46 * scale,
      x: left * scale,
      y: 20 * scale,
      left: left * scale,
      right: (left + boxWidth) * scale,
      width: boxWidth * scale,
      toJSON: () => ({}),
    }) as DOMRect;

  Element.prototype.getBoundingClientRect = function (this: Element) {
    if (isContainer(this)) {
      return drawn(20, width);
    }
    // The measured node is an item's wrapper (holding exactly one item button) or the
    // button itself; the container holds them all and was answered above.
    const isItem =
      this.matches('button.reqore-segmented-control-item') ||
      this.querySelectorAll('button.reqore-segmented-control-item').length === 1;
    const index = isItem ? itemIndex(this) : -1;
    return index >= 0 ? drawn(24 + index * 55, 55) : drawn(0, 0);
  };
  Object.defineProperty(Element.prototype, 'clientLeft', {
    configurable: true,
    get(this: Element) {
      return isContainer(this) ? 1 : 0;
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return isContainer(this) ? Math.round(width) : 0;
    },
  });

  return () => {
    Element.prototype.getBoundingClientRect = realRect;
    if (realClientLeft) {
      Object.defineProperty(Element.prototype, 'clientLeft', realClientLeft);
    } else {
      delete (Element.prototype as any).clientLeft;
    }
    if (realOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', realOffsetWidth);
    } else {
      delete (HTMLElement.prototype as any).offsetWidth;
    }
  };
};

const highlightOf = (
  props: Parameters<typeof renderControl>[0],
  geometry?: Parameters<typeof mockGeometry>[0]
) => {
  const restore = mockGeometry(geometry);
  try {
    const { container } = renderControl(props);
    const highlight = container.querySelector<HTMLElement>('.reqore-segmented-control-indicator');
    return { transform: highlight?.style.transform, width: highlight?.style.width };
  } finally {
    restore();
  }
};

/**
 * The highlight's offset is measured from the container's PADDING edge (21), so Week, which
 * starts at 24 + 55 = 79, needs `translateX(58px)`. Measured from the border edge and
 * corrected by the padding, as it was, it came out 2px left of the item.
 */
test('Positions the highlight under the active item from the padding edge', () => {
  expect(highlightOf({ value: 'week' })).toEqual({ transform: 'translateX(58px)', width: '55px' });
});

/**
 * A control in a modal measures itself while the modal zooms in from scale(0.5). The drawn
 * rects are half size there, and the highlight used to keep that half width and offset once
 * the zoom ended. It is measured in layout pixels now, so it matches the item at any scale.
 */
test('Measures the highlight in layout pixels while an ancestor is scaled', () => {
  expect(highlightOf({ value: 'week' }, { scale: 0.5 })).toEqual({
    transform: 'translateX(58px)',
    width: '55px',
  });
  expect(highlightOf({ value: 'month' }, { scale: 0.75 })).toEqual({
    transform: 'translateX(113px)',
    width: '55px',
  });
});

/**
 * `offsetWidth` rounds a 254.6px container to 255. That difference is rounding, not a
 * transform, so the drawn rects are used as they are and the highlight keeps its sub-pixel
 * position instead of drifting by the rounding ratio.
 */
test('Does not take a rounded layout width for a transform', () => {
  expect(highlightOf({ value: 'week' }, { width: 254.6 })).toEqual({
    transform: 'translateX(58px)',
    width: '55px',
  });
});

/* ------------------------------------------------------------------------------------------------
 * Per-item props
 * ---------------------------------------------------------------------------------------------- */

const segments = () =>
  Array.from(
    document.querySelectorAll(
      'button.reqore-segmented-control-item:not(.reqore-segmented-control-more)'
    )
  ) as HTMLElement[];

test('An item’s props reach its button: data, aria, id, class merged, style', () => {
  renderControl({
    items: [
      {
        value: 'monthly',
        label: 'Monthly',
        props: {
          'data-track-click': 'pricing-cycle',
          'data-track-label': 'monthly',
          'aria-label': 'Bill monthly',
          id: 'cycle-monthly',
          className: 'cycle',
          style: { minWidth: 120 },
        },
      },
      { value: 'yearly', label: 'Yearly', props: { 'data-track-click': 'pricing-cycle' } },
    ],
    value: 'monthly',
  });

  const [monthly, yearly] = segments();

  expect(monthly.getAttribute('data-track-click')).toBe('pricing-cycle');
  expect(monthly.getAttribute('data-track-label')).toBe('monthly');
  expect(monthly.getAttribute('aria-label')).toBe('Bill monthly');
  expect(monthly.id).toBe('cycle-monthly');
  expect(monthly.classList.contains('cycle')).toBe(true);
  expect(monthly.classList.contains('reqore-segmented-control-item')).toBe(true);
  expect(monthly.style.minWidth).toBe('120px');
  expect(yearly.getAttribute('data-track-click')).toBe('pricing-cycle');
  expect(yearly.hasAttribute('data-track-label')).toBe(false);
});

test('An item’s props cannot break the radio group the control runs', () => {
  const onChange = vi.fn();

  renderControl({
    items: [
      { value: 'a', label: 'A' },
      {
        value: 'b',
        label: 'B',
        props: { disabled: true, 'aria-disabled': false, minimal: true },
      },
    ],
    value: 'a',
    onChange,
  });

  const [, b] = segments();

  expect(b.getAttribute('role')).toBe('radio');
  expect(b.getAttribute('aria-checked')).toBe('false');
  expect(b.getAttribute('tabindex')).toBe('-1');
  // `disabled` is the control's: the item does not set it, so the segment stays enabled.
  expect(b).not.toBeDisabled();

  fireEvent.click(b);
  expect(onChange).toHaveBeenCalledWith('b');
});

test('The item’s own fields win over its props; its props fill the ones it leaves unset', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSegmentedControl
            items={[
              { value: 'a', label: 'A', icon: 'SunLine', props: { icon: 'MoonLine', badge: 2 } },
              { value: 'b', label: 'B', props: { icon: 'MoonLine' } },
            ]}
            value='a'
          />
          <ReqoreIcon icon='SunLine' className='reference-sun' />
          <ReqoreIcon icon='MoonLine' className='reference-moon' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const glyph = (element: Element) => element.querySelector('svg')?.innerHTML;
  const sun = glyph(document.querySelector('.reference-sun'));
  const moon = glyph(document.querySelector('.reference-moon'));
  const [a, b] = segments();
  const icons = (segment: HTMLElement) =>
    Array.from(segment.querySelectorAll('.reqore-icon')).map(glyph).filter(Boolean);

  expect(sun).not.toBe(moon);
  // A's own icon wins; the badge it does not set comes from its props.
  expect(icons(a)).toContain(sun);
  expect(icons(a)).not.toContain(moon);
  expect(a.querySelector('.reqore-tag')).toBeTruthy();
  // B sets no icon, so its props' icon is used.
  expect(icons(b)).toContain(moon);
});

test('A segment folded into the More menu passes its props to its menu item', () => {
  renderControl({
    _testWidth: 150,
    items: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year', props: { 'data-track-label': 'year' } },
    ],
    value: 'day',
  });

  const more = document.querySelector('.reqore-segmented-control-more') as HTMLElement;

  expect(more).toBeTruthy();
  fireEvent.mouseEnter(more);
  fireEvent.click(more);

  const menuItem = document.querySelector('.reqore-menu-item[data-track-label="year"]');

  expect(menuItem).toBeTruthy();
});

test('foldToFit draws the control inside a slot and keeps every segment at its own width', () => {
  renderControl({ foldToFit: true, fluid: true });

  const slot = document.querySelector('.reqore-segmented-control-slot');
  expect(slot).toBeTruthy();
  expect(slot!.querySelector('.reqore-segmented-control')).toBeTruthy();
  // `fluid` does not stretch the segments while folding: they keep their own width.
  const wrapper = document.querySelector('.reqore-segmented-control-item')!
    .parentElement as HTMLElement;
  expect(getComputedStyle(wrapper).flex).toBe('0 0 auto');
});

test('A segment folded to fit keeps its count in the More menu', () => {
  renderControl({
    foldToFit: true,
    _testWidth: 150,
    items: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year', badge: { label: '42', appearance: 'text' } },
    ],
    value: 'day',
  });

  const more = document.querySelector('.reqore-segmented-control-more') as HTMLElement;
  expect(more).toBeTruthy();
  fireEvent.mouseEnter(more);
  fireEvent.click(more);

  const yearItem = Array.from(document.querySelectorAll('.reqore-menu-item')).find((item) =>
    item.textContent?.includes('Year')
  );
  expect(yearItem?.textContent).toContain('42');
});

test('foldToFit folds on the widths segments are drawn at, and "More" by the label it shows', () => {
  // jsdom lays nothing out, so the drawn widths are given: a segment is 100px, "More" 60px,
  // and "More" carrying a folded segment's label (once that one is picked) 40px — narrower
  // than an estimate from that label, which is what folded a segment that had room.
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: HTMLElement) {
    let width = 0;
    if (this.parentElement?.classList.contains('reqore-segmented-control')) {
      const more = this.querySelector('.reqore-segmented-control-more');
      width = more ? (more.textContent?.includes('More') ? 60 : 40) : 100;
    }
    return { width, height: 30, top: 0, left: 0, right: width, bottom: 30, x: 0, y: 0 } as DOMRect;
  };

  try {
    // 290px of room: two segments and "More" (260) fit, a third does not.
    renderControl({ foldToFit: true, _testWidth: 290, value: 'day' });
    const shown = () =>
      Array.from(document.querySelectorAll('.reqore-segmented-control-item'))
        .filter((item) => !item.classList.contains('reqore-segmented-control-more'))
        // the button draws its label more than once (for its bold width); read which one it is
        .map((item) => defaultItems.find((def) => item.textContent?.startsWith(def.label))?.label);
    expect(shown()).toEqual(['Day', 'Week']);

    const more = document.querySelector('.reqore-segmented-control-more') as HTMLElement;
    fireEvent.mouseEnter(more);
    fireEvent.click(more);
    const year = Array.from(document.querySelectorAll('.reqore-menu-item')).find((item) =>
      item.textContent?.includes('Year')
    ) as HTMLElement;
    fireEvent.click(year);

    // "More" now reads "Year" and is drawn 40px: Day, Week and it (240) still fit, so Week
    // stays — measured, not estimated from the label.
    expect(document.querySelector('.reqore-segmented-control-more')?.textContent).toContain(
      'Year'
    );
    expect(shown()).toEqual(['Day', 'Week']);
  } finally {
    Element.prototype.getBoundingClientRect = original;
  }
});

test('fitSize makes the whole control the size of a button beside it', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSegmentedControl
            size='small'
            fitSize
            items={[
              { value: 'a', label: 'All' },
              { value: 'b', label: 'Open' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const item = document.querySelector('.reqore-segmented-control-item') as HTMLElement;
  // small = 32: the frame's 3px padding and 1px border, top and bottom, come out of the item.
  expect(item.style.height).toBe('24px');
});

describe('getSegmentedControlSurfaces: the chosen segment on the surfaces a theme names', () => {
  const CALM_DARK = {
    ...DEFAULT_THEME,
    main: '#121212',
    panel: { main: '#141417', border: '#2d2d33' },
    buttons: { main: '#1c1c20' },
  } as IReqoreTheme;
  const CALM_LIGHT = {
    ...DEFAULT_THEME,
    main: '#f4f4f6',
    panel: { main: '#ffffff', border: '#e2e2e8' },
    buttons: { main: '#efeff3' },
  } as IReqoreTheme;

  test('a theme that names no panel surface keeps the look derived from main', () => {
    expect(getSegmentedControlSurfaces({ ...DEFAULT_THEME, main: '#121212' })).toBeUndefined();
  });

  test('a control with a surface of its own (a customTheme or an intent) keeps it', () => {
    expect(
      getSegmentedControlSurfaces({ ...CALM_DARK, main: '#2a1a40', originalMain: '#121212' })
    ).toBeUndefined();
  });

  test.each([
    ['dark', CALM_DARK],
    ['light', CALM_LIGHT],
  ])('on a %s calm theme the chosen segment stands off its track', (_name, theme) => {
    const surfaces = getSegmentedControlSurfaces(theme)!;

    // The track is the button surface, edged with the panel hairline.
    expect(surfaces.track).toBe(theme.buttons!.main);
    expect(surfaces.trackEdge).toBe(theme.panel!.border);
    // The thumb is a step lighter than the track (it was darker on a dark theme)...
    expect(getLuminance(surfaces.thumb)).toBeGreaterThan(getLuminance(surfaces.track));
    // ...edged in a line that stands 3:1 against the track (WCAG 1.4.11)...
    expect(getContrast(surfaces.thumbEdge, surfaces.track)).toBeGreaterThanOrEqual(3);
    // ...and the other segments' words are quieter than the chosen one's, and still read.
    const text = getReadableColorFrom(surfaces.track);
    expect(getContrast(surfaces.otherText, surfaces.track)).toBeLessThan(
      getContrast(text, surfaces.track)
    );
    expect(getContrast(surfaces.otherText, surfaces.track)).toBeGreaterThanOrEqual(4.5);
    expect(surfaces.chosenText).toBeUndefined();
  });

  test.each([
    ['dark', CALM_DARK],
    ['light', CALM_LIGHT],
  ])('on a %s calm theme a chosen intent edges and words the segment so it reads', (_name, theme) => {
    const surfaces = getSegmentedControlSurfaces(theme, 'info')!;

    expect(getContrast(surfaces.thumbEdge, surfaces.track)).toBeGreaterThanOrEqual(3);
    expect(getContrast(surfaces.chosenText!, surfaces.thumb)).toBeGreaterThanOrEqual(4.5);
    // In the intent's hue, not grey.
    for (const color of [surfaces.thumbEdge, surfaces.chosenText!]) {
      const { red, blue } = parseToRgb(color);
      expect(blue - red).toBeGreaterThan(40);
    }
  });

  test("the theme's secondary grey says the other segments' words where it reads", () => {
    expect(
      getSegmentedControlSurfaces({ ...CALM_DARK, text: { secondary: '#a6a6af' } })!.otherText
    ).toBe('#a6a6af');
  });

  test('a calm theme draws the thumb with its edge; the default draws it unedged', () => {
    const renderOn = (theme: Partial<IReqoreTheme>) =>
      render(
        <ReqoreUIProvider theme={theme}>
          <ReqoreLayoutContent>
            <ReqoreContent>
              <ReqoreSegmentedControl items={defaultItems} value='week' />
            </ReqoreContent>
          </ReqoreLayoutContent>
        </ReqoreUIProvider>
      );
    const thumbStyle = () =>
      getComputedStyle(document.querySelector('.reqore-segmented-control-indicator')!);

    const calm = renderOn({
      main: '#121212',
      panel: { main: '#141417', border: '#2d2d33' },
      buttons: { main: '#1c1c20' },
    });
    expect(thumbStyle().borderTopStyle).toBe('solid');
    calm.unmount();

    renderOn({ main: '#121212' });
    expect(thumbStyle().borderTopStyle).not.toBe('solid');
  });
});
