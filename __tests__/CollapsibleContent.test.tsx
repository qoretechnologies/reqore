import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import {
  ReqoreCollapsibleContent,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

// jsdom reports scrollHeight as 0, so the clip path never triggers on its own.
// Override it to force the "tall content" branch for behavioural assertions.
const mockScrollHeight = (value: number) =>
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(value);

const renderContent = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

afterEach(() => {
  vi.restoreAllMocks();
});

test('Renders <CollapsibleContent /> with its children', () => {
  renderContent(
    <ReqoreCollapsibleContent>
      <span>Body content</span>
    </ReqoreCollapsibleContent>
  );

  expect(document.querySelectorAll('.reqore-collapsible-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-collapsible-content-clip').length).toBe(1);
  expect(document.querySelector('.reqore-collapsible-content')!.textContent).toContain(
    'Body content'
  );
});

test('Short content shows no reveal or collapse buttons', async () => {
  mockScrollHeight(120);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300}>
      <span>Short body</span>
    </ReqoreCollapsibleContent>
  );

  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-reveal')).toBeNull()
  );
  expect(document.querySelector('.reqore-collapsible-content-collapse')).toBeNull();
  expect(document.querySelector('.reqore-collapsible-content-fade')).toBeNull();
});

test('Tall content clips behind a fade and reveals on expand', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300}>
      <span>Tall body</span>
    </ReqoreCollapsibleContent>
  );

  // Starts clipped: fade + reveal button, no collapse button.
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-reveal')).not.toBeNull()
  );
  expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull();
  expect(document.querySelector('.reqore-collapsible-content-collapse')).toBeNull();

  fireEvent.click(document.querySelector('.reqore-collapsible-content-reveal')!);

  // Expanding swaps the reveal for a "Show less" button and drops the fade.
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-collapse')).not.toBeNull()
  );
  expect(document.querySelector('.reqore-collapsible-content-fade')).toBeNull();

  // Collapsing again restores the fade.
  fireEvent.click(document.querySelector('.reqore-collapsible-content-collapse')!);
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull()
  );
});

test('defaultExpanded shows full content with a Show less button, and collapses', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300} defaultExpanded>
      <span>Expanded body</span>
    </ReqoreCollapsibleContent>
  );

  // Starts expanded: content in full, no fade/reveal, but a "Show less" since it overflows.
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-collapse')).not.toBeNull()
  );
  expect(document.querySelector('.reqore-collapsible-content')!.textContent).toContain(
    'Expanded body'
  );
  expect(document.querySelector('.reqore-collapsible-content-fade')).toBeNull();
  expect(document.querySelector('.reqore-collapsible-content-reveal')).toBeNull();

  // It is collapsible back down to the clipped state.
  fireEvent.click(document.querySelector('.reqore-collapsible-content-collapse')!);
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull()
  );
});

test('Honours custom reveal / collapse labels', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent
      maxCollapsedHeight={300}
      showMoreLabel='Read full notes'
      showLessLabel='Collapse notes'
    >
      <span>Tall body</span>
    </ReqoreCollapsibleContent>
  );

  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-reveal')!.textContent).toContain(
      'Read full notes'
    )
  );

  fireEvent.click(document.querySelector('.reqore-collapsible-content-reveal')!);

  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-collapse')!.textContent).toContain(
      'Collapse notes'
    )
  );
});

test('Renders without a ResizeObserver implementation', () => {
  const original = globalThis.ResizeObserver;
  // Simulate a non-DOM / older test environment.
  // @ts-expect-error — intentionally removing the global for the assertion.
  delete globalThis.ResizeObserver;

  expect(() =>
    renderContent(
      <ReqoreCollapsibleContent>
        <span>No RO body</span>
      </ReqoreCollapsibleContent>
    )
  ).not.toThrow();

  expect(document.querySelector('.reqore-collapsible-content')!.textContent).toContain(
    'No RO body'
  );

  globalThis.ResizeObserver = original;
});
