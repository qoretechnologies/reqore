import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useContext } from 'react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreContext,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
} from '../src';

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
  const reqoreContext = useContext(ReqoreContext);

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

test('Renders confirmation <Modal /> ', () => {
  const confirmFn = jest.fn();
  const cancelFn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
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
