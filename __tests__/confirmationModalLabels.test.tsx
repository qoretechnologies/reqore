// Copyright 2026 Qore Technologies, s.r.o.
/**
 * The confirmation dialog keeps its two words, at any width.
 *
 * A panel short of room drops its actions' LABELS first and leaves the icons —
 * a good trade for a toolbar, where the label is a verb the icon already
 * carries. The confirmation modal is built out of the same bottom actions, and
 * there the trade is a bad one: the dialog exists to say which of two buttons
 * throws the work away, and at 375px it offered two unlabelled squares — a
 * tick and a cross, side by side, with the destructive one named nowhere.
 *
 * Reported from the Qorus IDE: removing a row from a case on a narrow surface
 * "did nothing" — the dialog opened, and the button that would have confirmed
 * it could not be told from the one that would not.
 */
import { render } from '@testing-library/react';
import { noop } from 'lodash';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ReqoreLayoutContent, ReqoreUIProvider, useReqoreProperty } from '../src';

/** See `panel.test.tsx`: jsdom never measures, so the width is fed in. */
let mockedPanelWidth = 0;

vi.mock('react-use', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-use')>();
  return { ...actual, useMeasure: () => [noop, { width: mockedPanelWidth }] };
});

/** Opens the shared confirmation the moment it mounts, as a caller's click would. */
const AsksToRemove = () => {
  const confirmAction = useReqoreProperty('confirmAction');
  React.useEffect(() => {
    confirmAction({
      title: 'Remove assertion',
      description: 'Remove "create_ok"? It will no longer be checked as part of this case.',
      confirmLabel: 'Remove assertion',
      cancelLabel: 'Keep it',
      intent: 'danger',
      confirmButtonIntent: 'danger',
      onConfirm: noop,
    });
  }, [confirmAction]);
  return null;
};

const openDialog = (width: number) => {
  mockedPanelWidth = width;
  return render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <AsksToRemove />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

/**
 * The words on the dialog's own buttons, in DOM order.
 *
 * A button's marquee renders its label more than once, so the repeat is folded
 * back to the one label — `^(.+?)\1*$` takes the shortest unit the whole
 * string is made of, and leaves anything that does not repeat alone.
 */
const dialogButtonLabels = () =>
  Array.from(document.querySelectorAll('.reqore-confirmation-modal .reqore-button')).map(
    (button) => {
      const text = (button.textContent ?? '').trim();
      return text.match(/^(.+?)\1*$/)?.[1] ?? text;
    }
  );

describe('the confirmation dialog at a narrow width', () => {
  beforeEach(() => {
    mockedPanelWidth = 0;
  });

  test('names both of its buttons on a phone, where an icon alone would not', () => {
    openDialog(342);
    /* Both of them, by name: at this width they are two 38px squares, and a
       tick and a cross beside each other say nothing about which is which. */
    expect(dialogButtonLabels()).toEqual(expect.arrayContaining(['Keep it', 'Remove assertion']));
  });

  test('names both of its buttons on a desktop, as it always did', () => {
    openDialog(500);

    expect(dialogButtonLabels()).toEqual(expect.arrayContaining(['Keep it', 'Remove assertion']));
  });
});
