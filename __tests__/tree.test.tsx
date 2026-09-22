import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTree, ReqoreUIProvider } from '../src';
import { GAP_FROM_SIZE } from '../src/constants/sizes';
import MockObject from '../src/mock/object.json';

test('Renders basic <Tree /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-tree-toggle').length).toBe(8);
});

test('<Tree /> items can be expanded and collapsed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-tree-toggle'));

  expect(document.querySelectorAll('.reqore-tree-label').length).toBe(20);

  fireEvent.click(document.querySelector('.reqore-tree-toggle'));

  expect(document.querySelectorAll('.reqore-tree-label').length).toBe(0);
});

test('Renders <Tree /> with clickable items', () => {
  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} onItemClick={fn} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-tree-toggle'));
  fireEvent.click(document.querySelectorAll('.reqore-tree-toggle')[2]);
  fireEvent.click(document.querySelectorAll('.reqore-tree-toggle')[4]);
  fireEvent.click(document.querySelectorAll('.reqore-tree-label')[19]);

  expect(fn).toHaveBeenCalledWith('Rose Farmer', ['0', 'friends', '1', 'name']);
});

/*
 * `size` SEEDS the zoom, and the two must not drift apart.
 *
 * The panel chrome is rendered at `size` directly, while the tree BODY is
 * rendered at the size the zoom names. A `size` that only seeded the zoom at
 * mount left a later `size` change painting the chrome at the new size and the
 * body at the old one. `size` therefore keeps speaking for the zoom — until
 * somebody zooms by hand, at which point the zoom is their answer and a prop
 * re-render must not throw it away.
 */
const treeBodyGap = (): string =>
  getComputedStyle(document.querySelector('.reqore-tree-item')!).gap;

test('<Tree /> body follows a later size change, so chrome and body stay in step', () => {
  const { rerender } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} size='normal' zoomable />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(treeBodyGap()).toBe(`${GAP_FROM_SIZE.normal}px`);

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} size='small' zoomable />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(treeBodyGap()).toBe(`${GAP_FROM_SIZE.small}px`);
});

test('<Tree /> keeps a zoom the user chose when size changes afterwards', () => {
  const { rerender } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} size='normal' zoomable />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // Zoom in by hand: one step up the shared scale, `normal` -> `big`.
  fireEvent.click(document.querySelector('.reqore-tree-more'));
  fireEvent.click(document.querySelector('.reqore-tree-zoom-in'));

  expect(treeBodyGap()).toBe(`${GAP_FROM_SIZE.big}px`);

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} size='small' zoomable />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // The user's zoom survives — a prop change is not an instruction to discard it.
  expect(treeBodyGap()).toBe(`${GAP_FROM_SIZE.big}px`);
});

test('<Tree /> with an explicit defaultZoom ignores size entirely', () => {
  const { rerender } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} size='normal' defaultZoom={0} zoomable />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(treeBodyGap()).toBe(`${GAP_FROM_SIZE.tiny}px`);

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTree data={MockObject} size='huge' defaultZoom={0} zoomable />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(treeBodyGap()).toBe(`${GAP_FROM_SIZE.tiny}px`);
});
