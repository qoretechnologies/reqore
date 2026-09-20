import { render } from '@testing-library/react';
import { ReqoreLayoutContent, ReqoreTable, ReqoreTree, ReqoreUIProvider } from '../src';
import { IReqoreTableProps } from '../src/components/Table';
import {
  clampZoom,
  getZoomActions,
  getZoomLabel,
  getZoomSize,
  getZoomWidth,
  MAX_ZOOM,
  MIN_ZOOM,
  sizeToZoom,
  ZOOM_RESET,
  ZOOM_STEP,
  zoomToLabel,
  zoomToSize,
  zoomToWidth,
} from '../src/components/Table/helpers';
import { SIZES, SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../src/constants/sizes';
import MockObject from '../src/mock/object.json';
import tableData from '../src/mock/tableData';

/**
 * The size a table or tree is asked for is carried internally as a zoom level, and
 * the pair of maps that convert between the two used to hold five of the seven
 * `TSizes` — so `micro` and `massive` turned into `undefined` and came back out of
 * the reverse map as `normal`. Both sizes rendered at exactly the `normal` height
 * and the `normal` font, which is why `micro` looked LARGER than `small`.
 *
 * These tests pin the invariant that makes that impossible: the mapping is TOTAL
 * over `TSizes` in both directions, and the zoom control's bounds are read off the
 * map instead of being written out again as literals.
 */

const sizes = SIZES as readonly TSizes[];

describe('the size ⇄ zoom scale', () => {
  test('every size round-trips through zoom, and every zoom level names a size', () => {
    sizes.forEach((size) => {
      expect(sizeToZoom[size]).toBeTypeOf('number');
      expect(zoomToSize[sizeToZoom[size]]).toBe(size);
      expect(getZoomSize(sizeToZoom[size])).toBe(size);
    });

    // and nothing else is in the maps: a stale entry is as wrong as a missing one
    expect(Object.keys(zoomToSize).length).toBe(sizes.length);
    expect(Object.keys(sizeToZoom).length).toBe(sizes.length);
  });

  test('the scale is contiguous, ordered, and centred on normal', () => {
    const zooms = sizes.map((size) => sizeToZoom[size]);

    expect(sizeToZoom.normal).toBe(ZOOM_RESET);
    zooms.slice(1).forEach((zoom, index) => {
      expect(zoom - zooms[index]).toBeCloseTo(ZOOM_STEP, 10);
    });
    // the five levels the control has always had keep the values it had
    expect(sizeToZoom.tiny).toBe(0);
    expect(sizeToZoom.small).toBe(0.5);
    expect(sizeToZoom.normal).toBe(1);
    expect(sizeToZoom.big).toBe(1.5);
    expect(sizeToZoom.huge).toBe(2);
  });

  test('the bounds are the ends of the map, not literals', () => {
    expect(MIN_ZOOM).toBe(Math.min(...Object.values(sizeToZoom)));
    expect(MAX_ZOOM).toBe(Math.max(...Object.values(sizeToZoom)));
    expect(zoomToSize[MIN_ZOOM]).toBe(sizes[0]);
    expect(zoomToSize[MAX_ZOOM]).toBe(sizes[sizes.length - 1]);
  });

  test('a zoom off the scale resolves to a real size instead of undefined', () => {
    expect(clampZoom(MIN_ZOOM - 5)).toBe(MIN_ZOOM);
    expect(clampZoom(MAX_ZOOM + 5)).toBe(MAX_ZOOM);
    expect(clampZoom(0.7)).toBe(0.5);

    expect(getZoomSize(MIN_ZOOM - 5)).toBe(sizes[0]);
    expect(getZoomSize(MAX_ZOOM + 5)).toBe(sizes[sizes.length - 1]);
    expect(getZoomSize(0.7)).toBe('small');
    // garbage in, still a renderable size out
    expect(getZoomSize(Number.NaN)).toBe('normal');
    expect(getZoomSize(undefined as unknown as number)).toBe('normal');
  });

  test('every zoom level has a label and a column width', () => {
    sizes.forEach((size) => {
      const zoom = sizeToZoom[size];

      expect(zoomToLabel[zoom]).toMatch(/^\d+%$/);
      expect(getZoomLabel(zoom)).toBe(zoomToLabel[zoom]);
      expect(zoomToWidth[zoom]).toMatch(/^\d+px$/);
      expect(getZoomWidth(zoom)).toBe(zoomToWidth[zoom]);
    });

    // the widths the collection layout has always used for the original five levels
    expect(zoomToWidth[0]).toBe('200px');
    expect(zoomToWidth[0.5]).toBe('300px');
    expect(zoomToWidth[1]).toBe('400px');
    expect(zoomToWidth[1.5]).toBe('500px');
    expect(zoomToWidth[2]).toBe('600px');
    // and the labels it has always shown
    expect(zoomToLabel[0]).toBe('30%');
    expect(zoomToLabel[0.5]).toBe('60%');
    expect(zoomToLabel[1]).toBe('100%');
    expect(zoomToLabel[1.5]).toBe('130%');
    expect(zoomToLabel[2]).toBe('160%');

    // widths are monotonic across the whole scale
    const widths = sizes.map((size) => parseFloat(zoomToWidth[sizeToZoom[size]]));
    widths.slice(1).forEach((width, index) => {
      expect(width).toBeGreaterThan(widths[index]);
    });
  });
});

describe('the zoom controls', () => {
  const actionsAt = (zoom: number) => {
    const setter = vi.fn();
    const [zoomIn, reset, zoomOut] = getZoomActions('reqore-table', zoom, setter, true);

    return { zoomIn, reset, zoomOut, setter };
  };

  test('at the smallest size only zoom-out is disabled', () => {
    const { zoomIn, zoomOut, setter } = actionsAt(MIN_ZOOM);

    expect(zoomOut.disabled).toBe(true);
    expect(zoomIn.disabled).toBe(false);

    zoomIn.onClick(undefined);
    expect(setter).toHaveBeenCalledWith(MIN_ZOOM + ZOOM_STEP);
  });

  test('at the largest size only zoom-in is disabled', () => {
    const { zoomIn, zoomOut, setter } = actionsAt(MAX_ZOOM);

    expect(zoomIn.disabled).toBe(true);
    expect(zoomOut.disabled).toBe(false);

    zoomOut.onClick(undefined);
    expect(setter).toHaveBeenCalledWith(MAX_ZOOM - ZOOM_STEP);
  });

  test('a disabled end cannot be stepped past even if it is clicked', () => {
    const { zoomIn, setter } = actionsAt(MAX_ZOOM);

    zoomIn.onClick(undefined);
    expect(setter).toHaveBeenCalledWith(MAX_ZOOM);
  });

  test('reset returns to normal, and is disabled only there', () => {
    const { reset, setter } = actionsAt(MAX_ZOOM);

    expect(reset.disabled).toBe(false);
    expect(reset.label).toBe(`${zoomToLabel[MAX_ZOOM]} (reset)`);

    reset.onClick(undefined);
    expect(setter).toHaveBeenCalledWith(sizeToZoom.normal);

    expect(actionsAt(sizeToZoom.normal).reset.disabled).toBe(true);
  });

  test('every level in between has both directions available', () => {
    sizes
      .filter((size) => sizeToZoom[size] !== MIN_ZOOM && sizeToZoom[size] !== MAX_ZOOM)
      .forEach((size) => {
        const { zoomIn, zoomOut } = actionsAt(sizeToZoom[size]);

        expect(zoomIn.disabled).toBe(false);
        expect(zoomOut.disabled).toBe(false);
      });
  });
});

describe('<Table /> renders at the size it is given', () => {
  const renderTableAt = (size: TSizes) => {
    const props: IReqoreTableProps = {
      ...(tableData as IReqoreTableProps),
      size,
      width: 500,
      height: 400,
    };

    const { container, unmount } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable {...props} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    return { container, unmount };
  };

  test.each(sizes)('size "%s" gives its rows their own height and text', (size) => {
    const { container, unmount } = renderTableAt(size);

    const rows = container.querySelectorAll<HTMLElement>('.reqore-table-row');
    expect(rows.length).toBeGreaterThan(0);
    // `flat` is undefined here, so a row is its size plus the separator line
    rows.forEach((row) => {
      expect(row.style.height).toBe(`${SIZE_TO_PX[size] + 1}px`);
    });

    const cells = container.querySelectorAll<HTMLElement>('.reqore-table-cell');
    expect(cells.length).toBeGreaterThan(0);
    cells.forEach((cell) => {
      expect(getComputedStyle(cell).fontSize).toBe(`${TEXT_FROM_SIZE[size]}px`);
    });

    unmount();
  });

  test('defaultZoom mounts the table at that level instead of the one size implies', () => {
    /* The prop was declared and then never read — it landed in `...rest` and was
       spread onto the panel, so asking for it did nothing at all. */
    const { container } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTable
            {...(tableData as IReqoreTableProps)}
            size='normal'
            defaultZoom={sizeToZoom.big}
            width={500}
            height={400}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(container.querySelector<HTMLElement>('.reqore-table-row').style.height).toBe(
      `${SIZE_TO_PX.big + 1}px`
    );
    // and it is not forwarded to the DOM as an unknown attribute
    expect(container.querySelector('[defaultZoom]')).toBeNull();
  });

  // The two tests below mount the table once per size — seven full renders of a
  // 1000-row fixture each. That is ~35s on a CI runner against the 30s default,
  // which is why the second failed there while passing on a dev machine. The
  // cost is inherent to asserting a size MATRIX rather than one size, so the
  // timeout is raised rather than the coverage narrowed.
  const SIZE_MATRIX_TIMEOUT_MS = 120000;

  test(
    'the sizes are strictly ordered — no two render alike',
    () => {
      const heights = sizes.map((size) => {
        const { container, unmount } = renderTableAt(size);
        const row = container.querySelector<HTMLElement>('.reqore-table-row');
        const height = parseFloat(row.style.height);

        unmount();
        return height;
      });

      heights.slice(1).forEach((height, index) => {
        expect(height).toBeGreaterThan(heights[index]);
      });
    },
    SIZE_MATRIX_TIMEOUT_MS
  );

  test(
    'a flat table drops the separator line at every size',
    () => {
      sizes.forEach((size) => {
        const { container, unmount } = render(
          <ReqoreUIProvider>
            <ReqoreLayoutContent>
              <ReqoreTable
                {...(tableData as IReqoreTableProps)}
                size={size}
                flat
                width={500}
                height={400}
              />
            </ReqoreLayoutContent>
          </ReqoreUIProvider>
        );

        expect(container.querySelector<HTMLElement>('.reqore-table-row').style.height).toBe(
          `${SIZE_TO_PX[size]}px`
        );

        unmount();
      });
    },
    SIZE_MATRIX_TIMEOUT_MS
  );
});

describe('<Tree /> renders at the size it is given', () => {
  const renderTreeAt = (size: TSizes) => {
    const { container, unmount } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTree data={MockObject} size={size} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    return { container, unmount };
  };

  test.each(sizes)('size "%s" gives its items their own text size', (size) => {
    const { container, unmount } = renderTreeAt(size);

    const toggles = container.querySelectorAll<HTMLElement>('.reqore-tree-toggle');
    expect(toggles.length).toBeGreaterThan(0);
    toggles.forEach((toggle) => {
      expect(getComputedStyle(toggle).fontSize).toBe(`${TEXT_FROM_SIZE[size]}px`);
    });

    unmount();
  });

  test('a defaultZoom of 0 is honoured rather than falling back to the size', () => {
    const { container, unmount } = render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTree data={MockObject} size='massive' defaultZoom={0} />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(getComputedStyle(container.querySelector('.reqore-tree-toggle')).fontSize).toBe(
      `${TEXT_FROM_SIZE.tiny}px`
    );

    unmount();
  });

  test('the sizes are strictly ordered — no two render alike', () => {
    const fontSizes = sizes.map((size) => {
      const { container, unmount } = renderTreeAt(size);
      const fontSize = parseFloat(
        getComputedStyle(container.querySelector('.reqore-tree-toggle')).fontSize
      );

      unmount();
      return fontSize;
    });

    fontSizes.slice(1).forEach((fontSize, index) => {
      expect(fontSize).toBeGreaterThan(fontSizes[index]);
    });
  });
});
