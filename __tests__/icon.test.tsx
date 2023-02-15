import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ReqoreContent, ReqoreIcon, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

test('Renders <Icon /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='AccountBoxFill' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(1);
  expect(document.querySelectorAll('svg').length).toBe(1);
});

test('Renders empty <Icon /> if icon does not exist', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          {/*@ts-expect-error*/}
          <ReqoreIcon icon='SomeNonExistingIcon' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(1);
  expect(document.querySelector('.reqore-icon').textContent).toBe('');
  expect(document.querySelectorAll('svg').length).toBe(0);
});

test('Tooltip on <Icon /> works', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreIcon icon='24HoursLine' tooltip='test' />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-icon')[0]);

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});
