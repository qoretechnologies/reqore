import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReqoreUIProvider, useReqoreProperty } from '../src/index';

const AddButton = (props: any) => {
  const addNotification = useReqoreProperty('addNotification');

  return (
    <button
      id='add-notification'
      onClick={() =>
        addNotification?.({
          title: 'Test Notification',
          content: 'I am a notification in tests',
          duration: 3000,
          id: props.id,
          ...props,
        })
      }
    >
      Add Notification
    </button>
  );
};

const UpdateButton = (props: any) => {
  const addNotification = useReqoreProperty('addNotification');

  return (
    <button
      id='update-notification'
      onClick={() =>
        addNotification?.({
          title: 'Updated Notification',
          content: 'I am an updated notification in tests',
          duration: 5000,
          ...props,
        })
      }
    >
      Update Notification
    </button>
  );
};

beforeAll(() => {
  vi.useFakeTimers();
});

test('Adds notifications and dismisses them automatically', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));

  expect(document.querySelectorAll('.reqore-notification').length).toBe(5);

  act(() => vi.runAllTimers());

  expect(document.querySelectorAll('.reqore-notification').length).toBe(0);
});

test('Adds a notification and updates it', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' />
        <UpdateButton id='test' />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));

  act(() => vi.advanceTimersByTime(1000));

  expect(document.querySelectorAll('.reqore-notification').length).toBe(1);

  fireEvent.click(screen.getByText('Update Notification'));

  expect(document.querySelectorAll('.reqore-notification').length).toBe(1);

  act(() => vi.runAllTimers());

  expect(document.querySelectorAll('.reqore-notification').length).toBe(0);
});

test('Notification has a click event', async () => {
  const clickFn = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' onClick={clickFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));

  act(() => vi.advanceTimersByTime(1000));

  fireEvent.click(document.querySelector('.reqore-notification'));

  expect(clickFn).toHaveBeenCalledWith('test');
});

test('Notification has a close event', async () => {
  const closeFn = vi.fn();
  const finishFn = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' onClose={closeFn} onFinish={finishFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));

  act(() => vi.advanceTimersByTime(1000));

  fireEvent.click(document.querySelector('.reqore-notification-close'));

  expect(closeFn).toHaveBeenCalledWith('test');
  expect(finishFn).toHaveBeenCalledTimes(0);
});

test('Notification has a finish event', async () => {
  const finishFn = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' onFinish={finishFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));

  act(() => vi.runAllTimers());

  expect(finishFn).toHaveBeenCalledWith('test');
});

test('Maximum of 5 notifications is shown at once', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.click(screen.getByText('Add Notification'));

  expect(document.querySelectorAll('.reqore-notification').length).toBe(5);
});

test('The compact form renders under its class, with a close and neither line nor actions', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' compact duration={3000} actions={[{ label: 'Open' }]} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));

  act(() => vi.advanceTimersByTime(500));

  expect(document.querySelectorAll('.reqore-notification-compact').length).toBe(1);
  expect(document.querySelectorAll('.reqore-notification-close').length).toBe(1);
  expect(document.querySelectorAll('.reqore-notification-progress').length).toBe(0);
  expect(document.querySelectorAll('.reqore-notification-actions').length).toBe(0);
});

test('An action runs and closes the notification', async () => {
  const openFn = vi.fn();
  const closeFn = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' onClose={closeFn} actions={[{ label: 'Open', onClick: openFn }]} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));

  act(() => vi.advanceTimersByTime(500));

  expect(document.querySelectorAll('.reqore-notification-actions button').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-notification-actions button'));

  expect(openFn).toHaveBeenCalledTimes(1);
  expect(closeFn).toHaveBeenCalledWith('test');

  act(() => vi.advanceTimersByTime(1000));

  expect(document.querySelectorAll('.reqore-notification').length).toBe(0);
});

test('The timer line shows with a duration and holds while hovered', async () => {
  const finishFn = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' duration={3000} onFinish={finishFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));

  act(() => vi.advanceTimersByTime(1000));

  expect(document.querySelectorAll('.reqore-notification-progress').length).toBe(1);

  fireEvent.mouseEnter(document.querySelector('.reqore-notification'));

  act(() => vi.advanceTimersByTime(10000));

  expect(finishFn).toHaveBeenCalledTimes(0);

  fireEvent.mouseLeave(document.querySelector('.reqore-notification'));

  act(() => vi.advanceTimersByTime(2500));

  expect(finishFn).toHaveBeenCalledWith('test');
});

test('pauseOnHover false keeps the timer running while hovered', async () => {
  const finishFn = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='test' duration={3000} pauseOnHover={false} onFinish={finishFn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Add Notification'));
  fireEvent.mouseEnter(document.querySelector('.reqore-notification'));

  act(() => vi.advanceTimersByTime(3500));

  expect(finishFn).toHaveBeenCalledWith('test');
});

test('Provider defaults apply under a notification’s own props', async () => {
  act(() => {
    render(
      <ReqoreUIProvider options={{ notifications: { compact: true } }}>
        <AddButton id='defaulted' />
        <AddButton id='own' compact={false} />
      </ReqoreUIProvider>
    );
  });

  const buttons = screen.getAllByText('Add Notification');
  fireEvent.click(buttons[0]);
  fireEvent.click(buttons[1]);

  act(() => vi.advanceTimersByTime(500));

  expect(document.querySelectorAll('.reqore-notification').length).toBe(2);
  expect(document.querySelectorAll('.reqore-notification-compact').length).toBe(1);
});

test('an intent tints the shadow the toast throws, so it reads as lifted', () => {
  // Reported as the toasts not looking like they float.
  //
  // Floating is two dark layers: a tight contact shadow directly under the
  // card so its edge has somewhere to sit, plus a wide ambient one that gives
  // it height. A single wide blur reads as a smudge behind the card. On top of
  // that, a toast that already has something to say says it in the light it
  // casts — so an intent adds a third, coloured layer.
  //
  // Asserted on the computed shadow rather than on the class, because a class
  // differs between intents for reasons that have nothing to do with the
  // shadow and such a test passes whether or not this works.
  act(() => {
    render(
      <ReqoreUIProvider>
        <AddButton id='neutral' />
        <AddButton id='danger' intent='danger' />
      </ReqoreUIProvider>
    );
  });

  const buttons = screen.getAllByText('Add Notification');
  fireEvent.click(buttons[0]);
  fireEvent.click(buttons[1]);

  act(() => vi.advanceTimersByTime(500));

  const [neutral, danger] = Array.from(
    document.querySelectorAll('.reqore-notification')
  ) as HTMLElement[];

  const neutralShadow = getComputedStyle(neutral).boxShadow;
  const dangerShadow = getComputedStyle(danger).boxShadow;

  // The lift every toast gets: ambient + contact.
  for (const shadow of [neutralShadow, dangerShadow]) {
    expect(shadow).toContain('0 2px 6px -1px');
    expect(shadow).toContain('0 18px 36px -12px');
  }

  // A neutral toast throws no coloured light...
  const colouredLayers = (shadow: string) =>
    shadow.split(/,(?![^(]*\))/).filter(
      (layer) => /rgba?\(/.test(layer) && !/rgba?\(\s*0\s*,\s*0\s*,\s*0/.test(layer) && !layer.includes('inset')
    );

  expect(colouredLayers(neutralShadow)).toHaveLength(0);
  // ...and an intent one throws exactly one, in its own colour.
  expect(colouredLayers(dangerShadow)).toHaveLength(1);
  expect(colouredLayers(dangerShadow)[0]).toContain('168,42,42');
});
