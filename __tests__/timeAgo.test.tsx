import { render } from '@testing-library/react';
import React from 'react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreP, ReqoreUIProvider } from '../src';
import { TimeAgo } from '../src/components/TimeAgo';

test('Renders <TimeAgo /> data properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreP>
            <TimeAgo time={Date.now()} />
          </ReqoreP>
          <ReqoreP>
            <TimeAgo time='2021-11-29T14:48:35.846576+01:00' />
          </ReqoreP>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const firstPara = document.querySelectorAll('.reqore-paragraph')[0];
  const secondPara = document.querySelectorAll('.reqore-paragraph')[1];

  expect(firstPara.textContent).toBe('just');
  expect(secondPara.textContent).not.toBe('NaN');
});
