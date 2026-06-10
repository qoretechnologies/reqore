import { act, fireEvent, render } from '@testing-library/react';
import { ReqoreMessage, ReqoreUIProvider } from '../src/index';

beforeAll(() => {
  vi.useFakeTimers();
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
  const fn = vi.fn();

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

  act(() => vi.runAllTimers());

  expect(fn).toHaveBeenCalled();
});

test('Runs onClose when closed', async () => {
  const fn = vi.fn();

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

  act(() => vi.advanceTimersByTime(1000));

  fireEvent.click(document.querySelector('.reqore-message-close'));

  expect(fn).toHaveBeenCalledWith();
});

test('Tooltip on <Message /> works', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreMessage tooltip='Hello'>Hello</ReqoreMessage>
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-message')[0]);

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});
