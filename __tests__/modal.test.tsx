import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
  useReqore,
} from '../src';
import { useReqoreProperty } from '../src/hooks/useReqoreContext';

test('Renders basic <Modal /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreModal isOpen>Basic modal</ReqoreModal>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-modal').length).toBe(1);
});

test('Does not renders <Modal /> if its not open', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreModal>Basic modal</ReqoreModal>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-modal').length).toBe(0);
});

test('Renders <Modal /> with custom dimensions', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreModal width='700px' height='700px'>
            Resized modal
          </ReqoreModal>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-modal').length).toBe(0);
});

const ConfirmButton = ({ confirmFn, cancelFn }) => {
  const reqoreContext = useReqore();

  return (
    <>
      <ReqoreButton
        id='custom-confirm'
        onClick={() => {
          reqoreContext?.confirmAction({
            title: 'Are you sure mate?',
            description: 'Do you really wanna do this?',
            confirmButtonIntent: 'warning',
            confirmIcon: 'SunFill',
            confirmLabel: 'Yep',
            onConfirm: () => confirmFn(),
            onCancel: () => cancelFn(),
          });
        }}
      >
        {' '}
        Custom confirm action{' '}
      </ReqoreButton>
      <br />
      <ReqoreButton
        id='confirm'
        onClick={() => {
          reqoreContext?.confirmAction({
            onConfirm: () => confirmFn(),
            onCancel: () => cancelFn(),
          });
        }}
      >
        {' '}
        Confirm action{' '}
      </ReqoreButton>
      <br />
      {status && <p>{status}</p>}
    </>
  );
};

const ConfirmButtonFromModal = ({ confirmFn, cancelFn }) => {
  const confirmAction = useReqoreProperty('confirmAction');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <ReqoreButton
        id='dialog'
        onClick={() => {
          setIsDialogOpen(true);
        }}
      >
        Open Dialog
      </ReqoreButton>
      {isDialogOpen && (
        <ReqoreModal
          isOpen
          id='confirm'
          actions={[
            {
              label: 'Open Confirm',
              id: 'open-confirm',
              onClick: () => {
                confirmAction({
                  description: 'Do you really wanna do this?',
                  onConfirm: () => confirmFn(),
                  onCancel: () => cancelFn(),
                });
              },
            },
          ]}
        >
          Modal
        </ReqoreModal>
      )}
    </>
  );
};

test('Renders confirmation <Modal /> ', () => {
  const confirmFn = jest.fn();
  const cancelFn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider options={{ animations: { dialogs: false } }}>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ConfirmButton confirmFn={confirmFn} cancelFn={cancelFn} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.getElementById('custom-confirm')!);
  fireEvent.click(screen.getAllByText('Yep')[0]);

  expect(confirmFn).toHaveBeenCalled();

  fireEvent.click(document.getElementById('confirm')!);
  fireEvent.click(screen.getAllByText('Confirm')[0]);

  expect(confirmFn).toHaveBeenCalledTimes(2);

  fireEvent.click(document.getElementById('custom-confirm')!);
  fireEvent.click(screen.getAllByText('Cancel')[0]);

  expect(cancelFn).toHaveBeenCalled();

  fireEvent.click(document.getElementById('confirm')!);
  fireEvent.click(screen.getAllByText('Cancel')[0]);

  expect(cancelFn).toHaveBeenCalledTimes(2);
});

test('Always renders confirmation <Modal /> properly above a normal modal', () => {
  const confirmFn = jest.fn();
  const cancelFn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider options={{ animations: { dialogs: false } }}>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ConfirmButtonFromModal confirmFn={confirmFn} cancelFn={cancelFn} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.getElementById('dialog')!);
  expect(document.querySelectorAll('.reqore-modal').length).toBe(1);

  fireEvent.click(screen.getAllByText('Open Confirm')[0]);
  expect(document.querySelectorAll('.reqore-modal').length).toBe(2);
  expect(document.querySelectorAll('.reqore-confirmation-modal').length).toBe(1);

  // @ts-ignore
  const zIndex = document.querySelectorAll('.reqore-modal')[0].style.zIndex;
  // @ts-ignore
  const zIndexConfirmation = document.querySelectorAll('.reqore-confirmation-modal')[0].style
    .zIndex;

  expect(parseInt(zIndexConfirmation)).toBeGreaterThan(parseInt(zIndex));
});
