import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * The responsive header path, exercised for the first time.
 *
 * It used to be switched off in tests by `process.env.NODE_ENV !== 'test'`,
 * which was there because `useMeasure` reports `width: 0` in jsdom — nothing
 * measures — and `width < 480` alone would have rendered every panel in every
 * suite as a phone. That guard hid the same defect it was compensating for.
 *
 * With an unmeasured panel no longer counting as a narrow one, the guard is
 * gone and the behaviour can be driven the honest way: give it a width.
 */
const measuredWidth = vi.hoisted(() => ({ value: 0 }));

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>();
  return {
    ...actual,
    useMeasure: () => [() => {}, { width: measuredWidth.value, height: 100 }],
  };
});

import { ReqoreContent, ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';

const renderPanel = (width: number) => {
  measuredWidth.value = width;
  return render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePanel
            label='Rule details'
            collapsible
            onClose={() => {}}
            actions={[{ label: 'Run' }]}
          >
            content
          </ReqorePanel>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

describe('a panel header at different measured widths', () => {
  it('lays out wide when it has been measured wide', () => {
    const { container } = renderPanel(1198);
    expect(container.textContent).toContain('Rule details');
    // The wide header keeps its controls in the title row.
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
  });

  it('lays out narrow when it has been measured narrow', () => {
    const { container } = renderPanel(320);
    expect(container.textContent).toContain('Rule details');
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
  });

  /**
   * The regression that matters: an UNMEASURED panel must render the same as a
   * wide one. Before the fix it rendered like the 320px case, then snapped —
   * which is the layout shift the Qorus IDE saw as a 51px jump.
   */
  it('renders unmeasured exactly as it renders wide', () => {
    const wide = renderPanel(1198).container.innerHTML;
    const unmeasured = renderPanel(0).container.innerHTML;
    // styled-components emits identical class names for identical styles, so
    // the two trees are comparable directly.
    expect(unmeasured).toBe(wide);
  });

  it('renders narrow differently from wide, so the test is not vacuous', () => {
    const wide = renderPanel(1198).container.innerHTML;
    const narrow = renderPanel(320).container.innerHTML;
    expect(narrow).not.toBe(wide);
  });
});
