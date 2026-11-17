// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { ReqoreDrawer, ReqoreModal, ReqoreUIProvider } from '../src';
import { useReqoreProperty } from '../src/hooks/useReqoreContext';

/**
 * Escape closes the dialog in front, and only it (the admin portal's keyboard pass): a drawer declared
 * `closeOnEscPress` and never read it, and the confirmation from `confirmAction` could not be cancelled
 * with Escape.
 */

const escape = () => fireEvent.keyDown(document, { key: 'Escape' });

const Host = ({
  modal,
  drawerEsc,
  confirm,
}: {
  modal?: boolean;
  drawerEsc?: boolean;
  confirm?: () => void;
}) => {
  const [drawer, setDrawer] = useState(true);
  const [dialog, setDialog] = useState(!!modal);
  const confirmAction = useReqoreProperty('confirmAction');

  return (
    <>
      <span data-testid='drawer'>{drawer ? 'open' : 'closed'}</span>
      <span data-testid='modal'>{dialog ? 'open' : 'closed'}</span>
      <button
        data-testid='ask'
        onClick={() => confirmAction({ title: 'Delete it?', onConfirm: () => undefined, onCancel: confirm })}
      >
        Ask
      </button>
      <ReqoreDrawer
        isOpen={drawer}
        onClose={() => setDrawer(false)}
        label='Drawer'
        closeOnEscPress={drawerEsc}
        hasBackdrop={false}
      >
        Drawer content
      </ReqoreDrawer>
      {dialog ? (
        <ReqoreModal isOpen onClose={() => setDialog(false)} label='Modal'>
          Modal content
        </ReqoreModal>
      ) : null}
    </>
  );
};

const mount = (ui: React.ReactElement) => render(<ReqoreUIProvider>{ui}</ReqoreUIProvider>);
const state = (id: string) => screen.getByTestId(id).textContent;

test('Escape closes a drawer', async () => {
  mount(<Host />);
  await waitFor(() => expect(document.querySelector('.reqore-drawer')).not.toBeNull());

  escape();
  await waitFor(() => expect(state('drawer')).toBe('closed'));
});

test('Escape closes only the dialog in front: the modal, then the drawer under it', async () => {
  mount(<Host modal />);
  await waitFor(() => expect(document.querySelector('.reqore-modal')).not.toBeNull());

  escape();
  await waitFor(() => expect(state('modal')).toBe('closed'));
  expect(state('drawer')).toBe('open');

  escape();
  await waitFor(() => expect(state('drawer')).toBe('closed'));
});

test('Escape cancels a confirmation and leaves the drawer under it open', async () => {
  const onCancel = vi.fn();

  mount(<Host confirm={onCancel} />);
  await waitFor(() => expect(document.querySelector('.reqore-drawer')).not.toBeNull());
  fireEvent.click(screen.getByTestId('ask'));
  await screen.findByText('Delete it?');

  escape();
  await waitFor(() => expect(screen.queryByText('Delete it?')).toBeNull());
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(state('drawer')).toBe('open');
});

test('A drawer with closeOnEscPress={false} stays open', async () => {
  mount(<Host drawerEsc={false} />);
  await waitFor(() => expect(document.querySelector('.reqore-drawer')).not.toBeNull());

  escape();
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(state('drawer')).toBe('open');
});
