import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReqorePopover, ReqoreUIProvider } from '../src/index';

const SimpleContent = (props: any) => {
  return (
    <ReqorePopover
      component='p'
      content={props.content || 'Tooltip content'}
      handler={props.type}
      delay={props.delay}
      blur={props.blur}
      isReqoreComponent
    >
      Hover me
    </ReqorePopover>
  );
};

const FullContent = (props: any) => {
  return (
    <ReqorePopover
      component='p'
      content={props.content || 'test'}
      placement='right'
      componentProps={{ onMouseEnter: () => props.fn() }}
    >
      Hover me
    </ReqorePopover>
  );
};

beforeAll(() => {
  vi.useFakeTimers();
});

test('Shows popover on hover, hides on leave', async () => {
  render(
    <ReqoreUIProvider>
      <SimpleContent />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));
  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Shows popover on click, hides only on click away', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <p>Click me to hide</p>
        <SimpleContent type='click' />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Hover me'));
  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.click(screen.getByText('Tooltip content'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.click(screen.getByText('Click me to hide'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Shows custom content', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <SimpleContent content={<h1>Custom title</h1>} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(screen.getByText('Hover me'));
  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('h1').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));
});

test('Runs callback function', async () => {
  const fn = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <FullContent fn={fn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(screen.getByText('Hover me'));
  vi.advanceTimersByTime(1);

  expect(fn).toHaveBeenCalled();

  fireEvent.mouseLeave(screen.getByText('Hover me'));
});

test('Shows the popover after a local delay, ignoring global delay', async () => {
  render(
    <ReqoreUIProvider options={{ tooltips: { delay: 1000 } }}>
      <SimpleContent delay={500} />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));

  act(() => {
    vi.advanceTimersByTime(100);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  act(() => {
    vi.advanceTimersByTime(400);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Shows the popover after a global delay', async () => {
  render(
    <ReqoreUIProvider options={{ tooltips: { delay: 1000 } }}>
      <SimpleContent />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));

  act(() => {
    vi.advanceTimersByTime(500);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  act(() => {
    vi.advanceTimersByTime(500);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Shows the popover with blur', async () => {
  render(
    <ReqoreUIProvider>
      <SimpleContent blur={3} />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-blur-wrapper').length).toBe(1);
  expect(document.querySelectorAll('p')[0].classList).toContain('reqore-blur-z-index');

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
  expect(document.querySelectorAll('.reqore-blur-wrapper').length).toBe(0);
  expect(document.querySelectorAll('p')[0].classList).not.toContain('reqore-blur-z-index');
});

test('Does not show the popover with delay if time not reached', async () => {
  render(
    <ReqoreUIProvider>
      <SimpleContent delay={500} />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));

  vi.advanceTimersByTime(100);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  vi.advanceTimersByTime(500);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Shows the hoverStay popover after a delay and stays, ', async () => {
  vi.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <SimpleContent delay={500} type='hoverStay' />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));

  act(() => {
    vi.advanceTimersByTime(100);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  act(() => {
    vi.advanceTimersByTime(400);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

test('Correctly passes popover data for non-opened popover', async () => {
  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePopover
        component='p'
        content={'Tooltip content'}
        passPopoverData={(data) => {
          fn(data.isOpen());
        }}
        isReqoreComponent
      >
        Hover me
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
  expect(fn).toHaveBeenCalledWith(false);
});

test('Correctly passes popover data for opened popover', async () => {
  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePopover
        component='p'
        content={'Tooltip content'}
        passPopoverData={(data) => {
          fn(data.isOpen());
        }}
        openOnMount
        isReqoreComponent
      >
        Hover me
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(fn).toHaveBeenCalledWith(true);
});

test('Does not shows popover on click when onBeforeOpen returns false', async () => {
  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePopover
        component='p'
        content={'Tooltip content'}
        onBeforeOpen={() => {
          fn();
          return false;
        }}
        openOnMount
        isReqoreComponent
      >
        Hover me
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
  expect(fn).toHaveBeenCalled();
});

test('Does not hide popover on click when onBeforeClose returns false', async () => {
  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <p>Click me to hide</p>
      <ReqorePopover
        component='p'
        content={'Tooltip content'}
        onBeforeClose={() => {
          fn();
          return false;
        }}
        openOnMount
        isReqoreComponent
      >
        Hover me
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  vi.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.click(screen.getByText('Click me to hide'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

test('Keeps popover open when hovering over target or popover with keepOpenOnHover', async () => {
  const onClickSpy = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePopover
        component='p'
        content={<button onClick={onClickSpy}>Click me</button>}
        handler='hover'
        keepOpenOnHover
        closeOnInsideClick={false}
        isReqoreComponent
      >
        Hover me
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  const trigger = screen.getByText('Hover me');

  // Hover over trigger to open popover
  fireEvent.mouseEnter(trigger);
  act(() => {
    vi.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  // Leave trigger, hover over popover
  fireEvent.mouseLeave(trigger);

  const popover = document.querySelector('.reqore-popover-content') as HTMLElement;
  fireEvent.mouseEnter(popover);

  act(() => {
    vi.advanceTimersByTime(100);
  });

  // Popover should still be open
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  // Click button inside popover
  const button = screen.getByText('Click me');
  fireEvent.click(button);

  act(() => {
    vi.advanceTimersByTime(1);
  });

  // Verify button click was registered
  expect(onClickSpy).toHaveBeenCalled();

  // Popover should still be open (closeOnInsideClick is false)
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  // Leave popover
  fireEvent.mouseLeave(popover);

  act(() => {
    vi.advanceTimersByTime(100);
  });

  // Now popover should close
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Clicking inside popover closes it when closeOnInsideClick is true', async () => {
  const onClickSpy = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePopover
        component='p'
        content={<button onClick={onClickSpy}>Click me</button>}
        handler='click'
        closeOnInsideClick={true}
        isReqoreComponent
      >
        Click to open
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  const trigger = screen.getByText('Click to open');

  // Click trigger to open popover
  fireEvent.click(trigger);
  act(() => {
    vi.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  // Click button inside popover
  const button = screen.getByText('Click me');
  fireEvent.click(button);

  act(() => {
    vi.advanceTimersByTime(1);
  });

  // Verify button click was registered
  expect(onClickSpy).toHaveBeenCalled();

  // Popover should be closed (closeOnInsideClick is true)
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Clicking inside popover does not close it when closeOnInsideClick is false', async () => {
  const onClickSpy = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePopover
        component='p'
        content={<button onClick={onClickSpy}>Click me</button>}
        handler='click'
        closeOnInsideClick={false}
        isReqoreComponent
      >
        Click to open
      </ReqorePopover>
    </ReqoreUIProvider>
  );

  const trigger = screen.getByText('Click to open');

  // Click trigger to open popover
  fireEvent.click(trigger);
  act(() => {
    vi.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  // Click button inside popover
  const button = screen.getByText('Click me');
  fireEvent.click(button);

  act(() => {
    vi.advanceTimersByTime(1);
  });

  // Verify button click was registered
  expect(onClickSpy).toHaveBeenCalled();

  // Popover should still be open (closeOnInsideClick is false)
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});
