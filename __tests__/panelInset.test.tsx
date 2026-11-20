// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';
import { IReqoreTheme } from '../src/constants/theme';

/**
 * A panel says the inset it pads its content's sides by (`--reqore-panel-inset-x`), so a child that
 * bleeds to its edges takes back exactly that: a fixed 16px ran a list 3px past both sides of a
 * small panel padded 13px to clear a 14px corner (Reqraft's OAuth2 client form).
 */
const insetOf = (theme: Partial<IReqoreTheme> | undefined, props: Record<string, unknown>) => {
  render(
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePanel className='under-test' label='Set' {...props}>
            Rows
          </ReqorePanel>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const content = document.querySelector<HTMLElement>('.under-test .reqore-panel-content')!;
  const style = getComputedStyle(content);

  return {
    inset: style.getPropertyValue('--reqore-panel-inset-x').trim(),
    paddingLeft: style.paddingLeft,
  };
};

test("a padded panel's inset is its content's side padding", () => {
  const { inset, paddingLeft } = insetOf(undefined, { size: 'normal' });

  expect(inset).not.toBe('');
  expect(inset).toBe(paddingLeft);
});

test('a small panel under a round corner says the inset that clears it', () => {
  const { inset, paddingLeft } = insetOf({ panel: { radius: 14 } } as Partial<IReqoreTheme>, {
    size: 'small',
    flat: false,
  });

  expect(inset).toBe(paddingLeft);
  expect(parseFloat(inset)).toBeGreaterThanOrEqual(13);
});

test('unpadded content says 0', () => {
  expect(insetOf(undefined, { padded: false }).inset).toBe('0px');
});
