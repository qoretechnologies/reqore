import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
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
  jest.useFakeTimers();
});

test('Shows popover on hover, hides on leave', async () => {
  render(
    <ReqoreUIProvider>
      <SimpleContent />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));
  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Shows popover on click, hides only on click away', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <SimpleContent type='click' />
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(screen.getByText('Hover me'));
  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.click(screen.getByText('Tooltip content'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.click(screen.getByText('Hover me'));

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
  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('h1').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));
});

test('Runs callback function', async () => {
  const fn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <FullContent fn={fn} />
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(screen.getByText('Hover me'));
  jest.advanceTimersByTime(1);

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

  jest.advanceTimersByTime(100);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  jest.advanceTimersByTime(400);

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

  jest.advanceTimersByTime(500);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  jest.advanceTimersByTime(500);

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

  jest.advanceTimersByTime(1);

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

  jest.advanceTimersByTime(100);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  jest.advanceTimersByTime(500);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
});

test('Shows the hoverStay popover after a delay and stays, ', async () => {
  render(
    <ReqoreUIProvider>
      <SimpleContent delay={500} type='hoverStay' />
    </ReqoreUIProvider>
  );

  fireEvent.mouseEnter(screen.getByText('Hover me'));

  jest.advanceTimersByTime(100);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  jest.advanceTimersByTime(400);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);

  fireEvent.mouseLeave(screen.getByText('Hover me'));

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

test('Correctly passes popover data for non-opened popover', async () => {
  const fn = jest.fn();

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

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);
  expect(fn).toHaveBeenCalledWith(false);
});

test('Correctly passes popover data for opened popover', async () => {
  const fn = jest.fn();

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

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(fn).toHaveBeenCalledWith(true);
});
