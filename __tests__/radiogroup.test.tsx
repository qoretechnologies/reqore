import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreRadioGroup,
  ReqoreUIProvider,
} from '../src';

test('Renders <Checkbox /> properly', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRadioGroup
            size='small'
            items={[
              {
                label: 'Option 1',
                value: 'opt1',
              },
              {
                label: 'Option 2',
                value: 'opt2',
              },
              {
                label: 'Option 3',
                value: 'opt3',
                labelDetail: <p className='label-detail' />,
              },
            ]}
            onSelectClick={fn}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-checkbox').length).toBe(3);
  expect(document.querySelectorAll('.label-detail').length).toBe(1);

  fireEvent.click(document.querySelectorAll('.reqore-checkbox')[1]);

  expect(fn).toHaveBeenCalledWith('opt2');
});
