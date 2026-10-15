// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render } from '@testing-library/react';
import { StrictMode } from 'react';
import {
  ReqoreContent,
  ReqoreDataView,
  ReqoreLayoutContent,
  ReqoreTimeline,
  ReqoreUIProvider,
} from '../src';

/**
 * qorus#646 (found while fixing the modal's Escape, which called `onClose` inside a state updater): a data view's
 * section and a timeline's collapsible item called the host's `onToggle` / `onCollapseChange` inside the state
 * updater that flipped them. An updater is React's to run: in StrictMode React runs it twice, so the host heard
 * of one click twice, and an updater run while React renders sets the host's state during that render. The new
 * state is worked out first, and the host is told once, from the click.
 */

const wrap = (children: React.ReactNode) => (
  <StrictMode>
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  </StrictMode>
);

test("a data view's section tells the host once per click", () => {
  const onSectionToggle = vi.fn();
  render(
    wrap(
      <ReqoreDataView
        data={{ status: 'COMPLETE', static_data: { customer: 7811 } }}
        collapsibleRoot={false}
        defaultExpandDepth={0}
        onSectionToggle={onSectionToggle}
      />
    )
  );
  const summary = Array.from(document.querySelectorAll('summary')).find((s) =>
    s.textContent?.includes('Object')
  )!;
  const wasOpen = summary.parentElement!.hasAttribute('open');
  fireEvent.click(summary);
  expect(onSectionToggle).toHaveBeenCalledTimes(1);
  expect(onSectionToggle.mock.calls[0][0]).toBe(!wasOpen);
  expect(summary.parentElement!.hasAttribute('open')).toBe(!wasOpen);
  // React works out a first update at once, but runs the next one's updater as it renders - twice in StrictMode
  fireEvent.click(summary);
  expect(onSectionToggle).toHaveBeenCalledTimes(2);
  expect(onSectionToggle.mock.calls[1][0]).toBe(wasOpen);
});

test("a timeline's collapsible item tells the host once per click", () => {
  const onCollapseChange = vi.fn();
  render(
    wrap(
      <ReqoreTimeline
        onCollapseChange={onCollapseChange}
        items={[{ title: 'Item 0', content: 'Content 0', collapsible: true }]}
      />
    )
  );
  fireEvent.click(document.querySelector('.reqore-timeline-collapse')!);
  expect(onCollapseChange).toHaveBeenCalledTimes(1);
  expect(onCollapseChange).toHaveBeenCalledWith(0, true);
  fireEvent.click(document.querySelector('.reqore-timeline-collapse')!);
  expect(onCollapseChange).toHaveBeenCalledTimes(2);
  expect(onCollapseChange).toHaveBeenLastCalledWith(0, false);
});

test("a timeline's item that starts collapsed opens on the first click", () => {
  const onCollapseChange = vi.fn();
  render(
    wrap(
      <ReqoreTimeline
        onCollapseChange={onCollapseChange}
        items={[{ title: 'Item 0', content: 'Content 0', collapsible: true, isCollapsed: true }]}
      />
    )
  );
  fireEvent.click(document.querySelector('.reqore-timeline-collapse')!);
  expect(onCollapseChange).toHaveBeenCalledTimes(1);
  expect(onCollapseChange).toHaveBeenCalledWith(0, false);
});
