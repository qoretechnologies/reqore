// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render, screen } from '@testing-library/react';
import { memo, useState } from 'react';
import { ReqoreDrawer, ReqoreModal, ReqoreUIProvider } from '../src';
import { useReqoreProperty } from '../src/hooks/useReqoreContext';

/**
 * A dialog opening or closing, or a toast coming or going, re-renders nothing on the page but itself.
 *
 * The provider kept its Escape stack and its toasts in state and put them in the context's value, so each of
 * those gave the context a new value; every component that reads the context through `useReqoreProperty`
 * (which is nearly every Reqore component) then ran again, whatever property it read. On a page of a few
 * hundred table cells, opening a drawer re-ran all of them.
 */

const runs = { reader: 0 };

/* What a component on the page looks like to the context: it reads one property that never changes. */
const Reader = memo(() => {
  useReqoreProperty('theme');
  runs.reader += 1;
  return null;
});

const Host = () => {
  const [drawer, setDrawer] = useState(false);
  const [modal, setModal] = useState(false);
  const addNotification = useReqoreProperty('addNotification');

  return (
    <>
      <Reader />
      <button data-testid='drawer' onClick={() => setDrawer((open) => !open)}>
        drawer
      </button>
      <button data-testid='modal' onClick={() => setModal((open) => !open)}>
        modal
      </button>
      <button data-testid='toast' onClick={() => addNotification({ id: 'saved', content: 'Saved' })}>
        toast
      </button>
      <ReqoreDrawer isOpen={drawer} onClose={() => setDrawer(false)} label='Drawer'>
        Drawer content
      </ReqoreDrawer>
      {modal ? (
        <ReqoreModal isOpen onClose={() => setModal(false)} label='Modal'>
          Modal content
        </ReqoreModal>
      ) : null}
    </>
  );
};

const press = async (id: string) => {
  await act(async () => {
    fireEvent.click(screen.getByTestId(id));
  });
};

test('opening and closing a drawer and a modal, and a toast, leave a context reader alone', async () => {
  render(
    <ReqoreUIProvider>
      <Host />
    </ReqoreUIProvider>
  );
  const settled = runs.reader;

  await press('drawer');
  await press('modal');
  await press('modal');
  await press('drawer');
  await press('toast');

  expect(runs.reader - settled).toBe(0);
});

test('Escape still closes only the dialog in front', async () => {
  const Front = () => {
    const [drawer, setDrawer] = useState(true);
    const [modal, setModal] = useState(true);
    return (
      <>
        <span data-testid='state'>{`${drawer ? 'drawer' : '-'} ${modal ? 'modal' : '-'}`}</span>
        <ReqoreDrawer isOpen={drawer} onClose={() => setDrawer(false)} label='Drawer'>
          Drawer content
        </ReqoreDrawer>
        <ReqoreModal isOpen={modal} onClose={() => setModal(false)} label='Modal'>
          Modal content
        </ReqoreModal>
      </>
    );
  };
  render(
    <ReqoreUIProvider>
      <Front />
    </ReqoreUIProvider>
  );
  const escape = async () => {
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
  };

  await escape();
  expect(screen.getByTestId('state').textContent).toBe('drawer -');
  await escape();
  expect(screen.getByTestId('state').textContent).toBe('- -');
});
