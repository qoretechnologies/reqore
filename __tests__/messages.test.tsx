import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ReqoreMessage, ReqoreUIProvider } from '../src/index';

beforeAll(() => {
  jest.useFakeTimers();
});

test('Renders <Message /> properly', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMessage intent='info'> Hello </ReqoreMessage>
        <ReqoreMessage intent='success'> Hello </ReqoreMessage>
        <ReqoreMessage intent='pending'> Hello </ReqoreMessage>
        <ReqoreMessage intent='warning'> Hello </ReqoreMessage>
        <ReqoreMessage intent='danger'> Hello </ReqoreMessage>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-message').length).toBe(5);
});

test('Runs onFinish on message after duration', async () => {
  const fn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMessage intent='info' duration={3000} onFinish={fn}>
          {' '}
          Hello{' '}
        </ReqoreMessage>
      </ReqoreUIProvider>
    );
  });

  act(() => jest.runAllTimers());

  expect(fn).toHaveBeenCalled();
});

test('Runs onClose when closed', async () => {
  const fn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMessage intent='info' onClose={fn}>
          {' '}
          Hello{' '}
        </ReqoreMessage>
      </ReqoreUIProvider>
    );
  });

  act(() => jest.advanceTimersByTime(1000));

  fireEvent.click(document.querySelector('.reqore-message-close'));

  expect(fn).toHaveBeenCalledWith();
});
