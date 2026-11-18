import { fireEvent, render } from '@testing-library/react';
import { getLuminance } from 'polished';
import { vi } from 'vitest';
import {
  ReqoreContent,
  ReqoreIcon,
  ReqoreLayoutContent,
  ReqoreSegmentedControl,
  ReqoreUIProvider,
} from '../src';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';

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

test('The "More" button is drawn on the track, and reads on it, as the items beside it do', () => {
  render(
    <ReqoreUIProvider>
      {/* a white page around a track drawn in the dark theme: what reads on the one does not on the other */}
      <ReqoreSurfaceProvider color='#ffffff'>
        {/* room for two items and the "More" button, the selected one among the two */}
        <ReqoreSegmentedControl _testWidth={260} items={defaultItems} value='day' />
      </ReqoreSurfaceProvider>
    </ReqoreUIProvider>
  );

  const more = document.querySelector('.reqore-segmented-control-more') as HTMLElement;
  const [, beside] = document.querySelectorAll(
    'button.reqore-segmented-control-item:not(.reqore-segmented-control-more)'
  );

  // light, as it reads on the dark track; it was dark, as it read on the white page around it
  expect(getLuminance(getComputedStyle(more).color)).toBeGreaterThan(0.5);
  expect(getComputedStyle(more).color).toBe(getComputedStyle(beside).color);
});

test('a click answers to the onChange the control has now, not the one it was first given', () => {
  const first = vi.fn();
  const now = vi.fn();
  const control = (onChange: (value?: string) => void) => (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSegmentedControl items={defaultItems} value='day' onChange={onChange} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const { rerender } = render(control(first));

  rerender(control(now));
  fireEvent.click(document.querySelectorAll('.reqore-segmented-control-item')[2]);

  expect(now).toHaveBeenCalledWith('month');
  expect(first).not.toHaveBeenCalled();
});
