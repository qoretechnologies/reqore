import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreSpan, ReqoreUIProvider } from '../src';

const renderSpan = (props: Record<string, unknown>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSpan {...props}>svc-qorus-saas-10-svc-qorus-saas-2</ReqoreSpan>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const span = () => document.querySelector('.reqore-span') as HTMLElement;

test('Renders <Span /> bounded by maxWidth', () => {
  renderSpan({ maxWidth: '32ch' });

  expect(getComputedStyle(span()).maxWidth).toBe('32ch');
});

test('Renders <Span /> unbounded by default', () => {
  // The bound must be opt-in: a span is inline text, and capping every one of them
  // would silently reshape every existing layout.
  renderSpan({});

  expect(getComputedStyle(span()).maxWidth).toBe('none');
});

test('Ellipsizes a bounded <Span /> only when asked to', () => {
  // `maxWidth` says how wide this may be; `effect.noWrap` says what happens to text
  // that does not fit. Separate questions, and callers want one without the other —
  // so the bound alone must not silently start clipping text.
  const { rerender } = renderSpan({ maxWidth: '20ch' });

  expect(getComputedStyle(span()).textOverflow).toBe('clip');

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSpan maxWidth='20ch' effect={{ noWrap: true }}>
            svc-qorus-saas-10-svc-qorus-saas-2
          </ReqoreSpan>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const style = getComputedStyle(span());

  expect(style.maxWidth).toBe('20ch');
  expect(style.textOverflow).toBe('ellipsis');
  expect(style.overflow).toBe('hidden');
  expect(style.whiteSpace).toBe('nowrap');
});
