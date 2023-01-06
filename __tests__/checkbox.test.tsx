import { render, screen } from '@testing-library/react';
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
