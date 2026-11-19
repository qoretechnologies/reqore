// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreMenu,
  ReqoreMenuItem,
  ReqorePanel,
  ReqoreUIProvider,
} from '../src';

/**
 * `destructive` means the same wherever an action is drawn: a menu entry that says it
 * destroys is drawn in danger where it gives no intent, a destructive action beside an entry keeps
 * its own look rather than the entry's tint, and a panel action keeps the marker off its button.
 */
/** As a calm theme draws an intent on a quiet button: in its words and icon (`data-intent-text`). */
const CALM_INTENTS = { buttons: { intentLook: { info: 'text', danger: 'text' } } } as const;

const renderInProvider = (element: ReactElement) =>
  render(
    <ReqoreUIProvider theme={CALM_INTENTS}>
      <ReqoreLayoutContent>
        <ReqoreContent>{element}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** The bin a menu entry offers as its own action. */
const BIN = { icon: 'DeleteBinLine' as const, tooltip: 'Delete', flat: true, transparent: true };

describe('a destructive action', () => {
  test('is, as a menu entry with no intent of its own, drawn in danger', () => {
    const { container } = renderInProvider(
      <ReqoreMenu>
        <ReqoreMenuItem className='plain'>Rename</ReqoreMenuItem>
        <ReqoreMenuItem className='remove' destructive>
          Delete every view
        </ReqoreMenuItem>
      </ReqoreMenu>
    );
    const plain = container.querySelector('.reqore-menu-item.plain')!;
    const remove = container.querySelector('.reqore-menu-item.remove')!;

    expect(plain.hasAttribute('data-intent-text')).toBe(false);
    expect(remove.hasAttribute('data-intent-text')).toBe(true);
    expect(remove.hasAttribute('destructive')).toBe(false);
  });

  test("keeps, beside a menu entry, its own look rather than the entry's tint", () => {
    const { container } = renderInProvider(
      <ReqoreMenu>
        <ReqoreMenuItem intent='info' rightAction={{ ...BIN, className: 'tinted' }}>
          EU payers
        </ReqoreMenuItem>
        <ReqoreMenuItem intent='info' rightAction={{ ...BIN, className: 'own', destructive: true }}>
          Last quarter
        </ReqoreMenuItem>
      </ReqoreMenu>
    );
    const tinted = container.querySelector('.reqore-button.tinted')!;
    const own = container.querySelector('.reqore-button.own')!;

    expect(tinted.hasAttribute('data-intent-text')).toBe(true);
    expect(own.hasAttribute('data-intent-text')).toBe(false);
    expect(own.hasAttribute('destructive')).toBe(false);
  });

  test("keeps the marker off a panel action's button", () => {
    const { container } = renderInProvider(
      <ReqorePanel
        label='Template'
        actions={[{ ...BIN, className: 'panel-bin', destructive: true }]}
      />
    );

    expect(container.querySelector('.panel-bin')!.hasAttribute('destructive')).toBe(false);
  });
});
