import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import tableData from '../src/mock/tableData';

/**
 * A table wider than its frame, scrolled by pressing and pulling it - on its body and,
 * the part that did not work, on its header.
 *
 * The header is scrolled WITH the body (the body syncs it) but is not a scroller of its
 * own, so neither a finger nor the mouse could move the table from it: a swipe on the
 * header did nothing on a phone while the same swipe on the rows scrolled them.
 */

/** jsdom lays nothing out: say that the body overflows. */
const setOverflow = (element: HTMLElement, { scrollWidth = 2000, clientWidth = 500 } = {}) => {
  Object.defineProperty(element, 'scrollWidth', { value: scrollWidth, configurable: true });
  Object.defineProperty(element, 'clientWidth', { value: clientWidth, configurable: true });
};

/** jsdom has no PointerEvent; these are the fields the gesture branches on. */
const pointer = (
  element: Element,
  type: 'pointerDown' | 'pointerMove' | 'pointerUp',
  { clientX = 0, pointerType = 'mouse', buttons = type === 'pointerUp' ? 0 : 1 } = {}
) => fireEvent[type](element, { clientX, pointerType, button: 0, buttons, pointerId: 1 });

const renderTable = (props: Record<string, unknown> = {}) => {
  // the first column's header reports its clicks
  const onHeaderClick = vi.fn();
  const columns = tableData.columns.map((column, index) =>
    index === 0 ? { ...column, header: { ...column.header, onClick: onHeaderClick } } : column
  );
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTable {...tableData} columns={columns} height={300} {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const body = container.querySelector('.reqore-table-body') as HTMLElement;
  const header = container.querySelector('.reqore-table-header-wrapper') as HTMLElement;
  const headerCell = header.querySelector('.reqore-table-header-cell') as HTMLElement;
  setOverflow(body);
  return { body, header, headerCell, onHeaderClick };
};

test('a finger swiped sideways on the header scrolls the table', () => {
  const { body, headerCell } = renderTable();

  pointer(headerCell, 'pointerDown', { clientX: 300, pointerType: 'touch' });
  pointer(headerCell, 'pointerMove', { clientX: 180, pointerType: 'touch' });
  pointer(headerCell, 'pointerUp', { clientX: 180, pointerType: 'touch' });

  expect(body.scrollLeft).toBe(120);
});

test('the header leaves up-and-down to the page and takes sideways swipes', () => {
  const { header } = renderTable();

  expect(getComputedStyle(header).touchAction).toBe('pan-y');
});

// A header cell's click is its own: it opens the column's options, and the column's own onClick runs.
test('with dragToScroll, the mouse pulls the table by its header, and the press is not a click on it', () => {
  const { body, headerCell, onHeaderClick } = renderTable({ dragToScroll: true });

  pointer(headerCell, 'pointerDown', { clientX: 400 });
  pointer(headerCell, 'pointerMove', { clientX: 250 });
  pointer(headerCell, 'pointerUp', { clientX: 250 });
  fireEvent.click(headerCell);

  expect(body.scrollLeft).toBe(150);
  expect(onHeaderClick).not.toHaveBeenCalled();
});

test('with dragToScroll, a press on the header that does not move is still a click', () => {
  const { body, headerCell, onHeaderClick } = renderTable({ dragToScroll: true });

  pointer(headerCell, 'pointerDown', { clientX: 400 });
  pointer(headerCell, 'pointerMove', { clientX: 398 });
  pointer(headerCell, 'pointerUp', { clientX: 398 });
  fireEvent.click(headerCell);

  expect(body.scrollLeft).toBe(0);
  expect(onHeaderClick).toHaveBeenCalled();
});

test('with dragToScroll, the mouse pulls the table by its body', () => {
  const { body } = renderTable({ dragToScroll: true });
  const cell = body.querySelector('.reqore-table-cell') ?? body;

  pointer(cell, 'pointerDown', { clientX: 400 });
  pointer(cell, 'pointerMove', { clientX: 330 });
  pointer(cell, 'pointerUp', { clientX: 330 });

  expect(body.scrollLeft).toBe(70);
});

test('without dragToScroll the mouse does not drag the table, as before', () => {
  const { body, headerCell } = renderTable();

  pointer(headerCell, 'pointerDown', { clientX: 400 });
  pointer(headerCell, 'pointerMove', { clientX: 250 });
  pointer(headerCell, 'pointerUp', { clientX: 250 });

  expect(body.scrollLeft).toBe(0);
});

test('Shift with a plain wheel on the header scrolls the table sideways', () => {
  const { body, header } = renderTable();
  body.scrollTo = ((options: ScrollToOptions) => {
    body.scrollLeft = options.left ?? body.scrollLeft;
  }) as typeof body.scrollTo;

  fireEvent.wheel(header, { deltaY: 90, shiftKey: true });

  expect(body.scrollLeft).toBe(90);
});

test('with dragToScroll, the body says it can be pulled', () => {
  const { body } = renderTable({ dragToScroll: true });

  expect(body.closest('.reqore-table-wrapper-draggable')).not.toBeNull();
});
