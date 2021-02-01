import { act, fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import usePopover from '../src/hooks/usePopover';
import useSimplePopover from '../src/hooks/useSimplePopover';
import { ReqoreUIProvider } from '../src/index';

const SimpleContent = (props: any) => {
  const [refElement, setRefElement] = useState(null);
  const hoverPopover = useSimplePopover(
    refElement,
    props?.content || 'Tooltip content',
    props.type
  );

  return (
    <p id='popover-content' ref={setRefElement} {...hoverPopover}>
      Hover me
    </p>
  );
};

const FullContent = (props: any) => {
  const [refElement, setRefElement] = useState(null);
  const { reqoreAddPopover, reqoreRemovePopover } = usePopover(refElement);

  return (
    <p
      id='popover-content'
      ref={setRefElement}
      onMouseEnter={reqoreAddPopover('test', 'right', () => props.fn())}
      onMouseLeave={reqoreRemovePopover()}
    >
      Hover me
    </p>
  );
};

beforeAll(() => {
  jest.useFakeTimers();
});

test('Shows popover on hover, hides on leave', async () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <SimpleContent />
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(screen.getByText('Hover me'));

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

  expect(fn).toHaveBeenCalled();

  fireEvent.mouseLeave(screen.getByText('Hover me'));
});
