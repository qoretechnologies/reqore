// Copyright 2026 Qore Technologies, s.r.o.
/**
 * `options.confirmations`: what an app decides once for every confirmation, under each call's
 * own data — its words (so they can be translated), its primary, and its look.
 *
 * Reported from the Qorus IDE: every confirmation drew a 0.9 backdrop with a blur, washed the
 * dialog in its intent, added "Are you sure you want to proceed?" under a title that already
 * asked, and spoke English whatever the app's language — with no way to change any of it but at
 * each of the call sites.
 */
import { render, screen } from '@testing-library/react';
import { noop } from 'lodash';
import React from 'react';
import { describe, expect, test } from 'vitest';
import { ReqoreLayoutContent, ReqoreUIProvider, useReqoreProperty } from '../src';
import { IReqoreConfirmationDefaults, IReqoreConfirmationModal } from '../src';
import { IReqoreTheme } from '../src/constants/theme';

const Asks = ({ data }: { data: IReqoreConfirmationModal }) => {
  const confirmAction = useReqoreProperty('confirmAction');
  React.useEffect(() => {
    confirmAction({ onConfirm: noop, ...data });
  }, [confirmAction, data]);
  return null;
};

const open = (
  data: IReqoreConfirmationModal,
  confirmations?: IReqoreConfirmationDefaults,
  theme?: Partial<IReqoreTheme>
) =>
  render(
    <ReqoreUIProvider options={{ confirmations }} theme={theme}>
      <ReqoreLayoutContent>
        <Asks data={data} />
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const DELETE = {
  title: 'Delete this job?',
  intent: 'danger',
  confirmButtonIntent: 'danger',
} as const;

describe('options.confirmations', () => {
  test('with no defaults a confirmation reads as it always has', () => {
    open({});
    expect(screen.getAllByText('Confirm your action').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Are you sure you want to proceed?').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Confirm').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
  });

  test("the app's words stand in for the defaults, and a call's own words still win", () => {
    open(
      { title: 'Delete this job?', confirmLabel: 'Delete' },
      { cancelLabel: 'Zrušit', confirmLabel: 'Potvrdit', title: 'Potvrďte akci', content: null }
    );
    expect(screen.getAllByText('Delete this job?').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Delete').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Zrušit').length).toBeGreaterThan(0);
    expect(screen.queryByText('Confirm your action')).toBeNull();
    expect(screen.queryByText('Potvrdit')).toBeNull();
  });

  test('content: null leaves out the line under the title', () => {
    open(DELETE, { content: null });
    expect(screen.queryByText('Are you sure you want to proceed?')).toBeNull();
  });

  test("intentLook 'icon' leaves the dialog's edge its own, and surfaceOpacity makes it solid", () => {
    const panelStyle = (confirmations?: IReqoreConfirmationDefaults) => {
      const { unmount } = open(DELETE, confirmations);
      const panel = document.querySelector('.reqore-confirmation-modal .reqore-panel') as Element;
      const { borderTopColor, backgroundColor } = getComputedStyle(panel);
      unmount();
      document.body.innerHTML = '';
      return { borderTopColor, backgroundColor };
    };
    const washed = panelStyle();
    const calm = panelStyle({ intentLook: 'icon', surfaceOpacity: 1 });
    // Washed, the edge is the intent's; on the icon only, it is the dialog's own hairline.
    expect(calm.borderTopColor).not.toBe(washed.borderTopColor);
    expect(washed.backgroundColor).toMatch(/0\.9\)$/);
    expect(calm.backgroundColor).not.toMatch(/0\.9\)$/);
  });

  test("a confirm with no intent of its own takes the theme's primary", () => {
    const background = (theme?: Partial<IReqoreTheme>) => {
      const { unmount } = open({}, undefined, theme);
      const buttons = Array.from(document.querySelectorAll('.reqore-confirmation-modal button'));
      const confirm = buttons.find((button) => button.textContent?.includes('Confirm'));
      const value = getComputedStyle(confirm as Element).backgroundColor;
      unmount();
      document.body.innerHTML = '';
      return value;
    };
    expect(background({ primaryActionIntent: 'danger' })).not.toBe(background());
  });
});
