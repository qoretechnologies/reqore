import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ReqoreCheckbox, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

test('Renders <Checkbox /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCheckbox />
          <ReqoreCheckbox size='small' />
          <ReqoreCheckbox size='big' />
          <ReqoreCheckbox disabled />
          <ReqoreCheckbox label='Right' labelDetail={<p className='label-detail'></p>} />
          <ReqoreCheckbox label='Left' />
          <ReqoreCheckbox label='Right' asSwitch />
          <ReqoreCheckbox label='With Text' asSwitch onText='Yes' offText='No' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-checkbox').length).toBe(8);
  expect(document.querySelectorAll('.label-detail').length).toBe(1);
  expect(screen.getByText('Yes')).toBeTruthy();
  expect(screen.getByText('No')).toBeTruthy();
});

test('Tooltip on <Checkbox /> works', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreCheckbox label='With Text' asSwitch onText='Yes' offText='No' tooltip='test' />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-checkbox')[0]);

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});
