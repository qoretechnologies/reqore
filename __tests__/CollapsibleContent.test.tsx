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

test('disabled short-circuits reveal and collapse handlers', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300} disabled>
      <span>Locked body</span>
    </ReqoreCollapsibleContent>
  );

  // Disabled still renders the reveal button (it's a visual affordance), but clicks have no
  // effect — the collapse button must never appear because we cannot expand.
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-reveal')).not.toBeNull()
  );

  fireEvent.click(document.querySelector('.reqore-collapsible-content-reveal')!);

  // Wait a tick to let any (incorrectly-allowed) state update flush.
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(document.querySelector('.reqore-collapsible-content-collapse')).toBeNull();
  expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull();
});

test('transparent drops the fade gradient background but keeps the reveal button', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300} transparent>
      <span>Tall body</span>
    </ReqoreCollapsibleContent>
  );

  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-reveal')).not.toBeNull()
  );

  const fade = document.querySelector<HTMLDivElement>('.reqore-collapsible-content-fade')!;
  expect(fade).not.toBeNull();
  // The transient $transparent prop drives `background: transparent`. Confirm it lands.
  expect(getComputedStyle(fade).background).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
});

test('intent tints the fade — verified by passing through and rendering without error', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300} intent='danger'>
      <span>Tall body</span>
    </ReqoreCollapsibleContent>
  );

  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull()
  );

  // The fade's inline style includes `linear-gradient(... to <fade-color>)` — when intent is
  // set the trailing color is the intent color, not the theme background. Sniff that the
  // gradient string is present; the exact rgb depends on theme.intents.danger.
  const fade = document.querySelector<HTMLDivElement>('.reqore-collapsible-content-fade')!;
  expect(fade.style.background || getComputedStyle(fade).background).toContain('linear-gradient');
});

test('buttonAlign places the reveal button on the requested side', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300} buttonAlign='right'>
      <span>Tall body</span>
    </ReqoreCollapsibleContent>
  );

  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull()
  );

  const fade = document.querySelector<HTMLDivElement>('.reqore-collapsible-content-fade')!;
  // `align-items: flex-end` is what places the reveal button on the right (column flex).
  expect(getComputedStyle(fade).alignItems).toBe('flex-end');
});

test('animated keeps the fade mounted while expanded so the opacity can transition', async () => {
  mockScrollHeight(1000);

  renderContent(
    <ReqoreCollapsibleContent maxCollapsedHeight={300} animated>
      <span>Tall body</span>
    </ReqoreCollapsibleContent>
  );

  // Starts clipped — fade visible, reveal button mounted.
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull()
  );

  fireEvent.click(document.querySelector('.reqore-collapsible-content-reveal')!);

  // After expand: the fade stays in the DOM (so its opacity can transition to 0) while the
  // collapse button appears below. Non-animated behavior unmounted the fade entirely — the new
  // behavior is gated on `animated`.
  await waitFor(() =>
    expect(document.querySelector('.reqore-collapsible-content-collapse')).not.toBeNull()
  );
  expect(document.querySelector('.reqore-collapsible-content-fade')).not.toBeNull();
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
