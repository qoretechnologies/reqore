import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';

/*
 * Every observer reports the width it is told, now and again on `resize`. Installed before the
 * table is imported: react-use's `useMeasure`, which measures the table, settles at import time on
 * a version that measures nothing where there is no ResizeObserver, as under jsdom.
 */
const SizedResizeObserver = vi.hoisted(() => {
  class Observer {
    static width = 900;
    static instances: Observer[] = [];
    readonly targets: Element[] = [];
    constructor(readonly callback: ResizeObserverCallback) {
      Observer.instances.push(this);
    }
    observe(target: Element) {
      this.targets.push(target);
      this.report(target);
    }
    unobserve() {}
    disconnect() {}
    report(target: Element) {
      const width = Observer.width;
      this.callback(
        [
          {
            target,
            contentRect: { x: 0, y: 0, top: 0, left: 0, width, height: 400, right: width },
            contentBoxSize: [{ inlineSize: width, blockSize: 400 }],
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver
      );
    }
  }

  (globalThis as Record<string, unknown>).ResizeObserver = Observer;

  return Observer;
});

beforeEach(() => {
  SizedResizeObserver.width = 900;
  SizedResizeObserver.instances = [];
});

const table = (filter: string) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreTable
        label='Workflows'
        filterable
        filter={filter}
        columns={[{ dataId: 'name', header: { label: 'Name' }, width: 200 }]}
        data={[{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Gamma' }]}
        height={300}
      />
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const names = () =>
  Array.from(document.querySelectorAll('.reqore-table-row')).map((row) => row.textContent?.trim());

/**
 * `filter` is the table's query whenever the caller changes it. It used to seed the query
 * once, so a page that set or cleared the search from outside changed nothing.
 */
describe('a table follows its filter prop', () => {
  it('narrows, widens and clears with the prop', () => {
    let rerender: (ui: JSX.Element) => void = () => undefined;
    act(() => {
      ({ rerender } = render(table('')));
    });
    expect(names()).toHaveLength(3);

    act(() => rerender(table('beta')));
    expect(names()).toEqual(['Beta']);

    act(() => rerender(table('')));
    expect(names()).toHaveLength(3);
  });
});
