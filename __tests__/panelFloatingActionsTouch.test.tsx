// Copyright 2026 Qore Technologies, s.r.o.
/**
 * On a device that cannot hover, a panel's hover actions are in its own bar.
 *
 * `floatingActions` takes the panel's `show: 'hover'` actions out of its bar and floats them above its
 * corner while a pointer hovers it. A phone or a tablet never hovers, so nothing floated them, and with
 * the bar no longer holding them a tap could not reach them at all. Where the device cannot hover
 * (`isHoverCapable` false), the actions stay in the bar, shown, as a panel's hover actions do there
 * without `floatingActions`.
 */
import { fireEvent, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ReqorePanel, ReqoreUIProvider } from '../src';

// the provider asks whether the primary pointer hovers: here it does not (a phone)
vi.mock('../src/hooks/useReqoreMedia', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/hooks/useReqoreMedia')>();

  return {
    ...actual,
    useReqoreMedia: (query: string, defaultState = false) =>
      query.includes('hover') ? false : defaultState,
  };
});

test("a floating panel's hover action is in its bar, and a tap reaches it", () => {
  const onClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePanel
        className='floating-on-touch'
        label='Expression'
        floatingActions
        actions={[
          { icon: 'DeleteBinLine', label: 'Remove', show: 'hover', className: 'remove-me', onClick },
          { icon: 'EditLine', label: 'Edit', className: 'edit-me' },
        ]}
      >
        content
      </ReqorePanel>
    </ReqoreUIProvider>
  );

  const panel = document.querySelector('.floating-on-touch') as HTMLElement;
  const remove = panel.querySelector('.reqore-panel-title .remove-me') as HTMLElement;

  // in the bar, beside the action that is always there - and nothing floats
  expect(remove).toBeTruthy();
  expect(panel.querySelector('.reqore-panel-title .edit-me')).toBeTruthy();
  expect(document.querySelector('.reqore-panel-floating-actions')).toBeNull();

  fireEvent.click(remove);

  expect(onClick).toHaveBeenCalledTimes(1);
});
