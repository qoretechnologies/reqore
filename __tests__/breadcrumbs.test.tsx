import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreBreadcrumbs,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

test('Renders full <Breadcrumbs /> properly', () => {
  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            items={[
              { label: 'Page 1', icon: 'home' },
              { label: 'Page 2', icon: 'home' },
              { label: 'Page 3', icon: 'home' },
              { label: 'Page 4', icon: 'home' },
              { label: 'Page 5', icon: 'home' },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  expect(document.querySelectorAll('.reqore-breadcrumbs-wrapper').length).toBe(
    1
  );
  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(5);
});

test('Renders shortened <Breadcrumbs /> properly', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            _testWidth={300}
            items={[
              { label: 'Page 1', icon: 'home' },
              { label: 'Page 2', icon: 'home' },
              { label: 'Page 3', icon: 'home' },
              { label: 'Page 4', icon: 'home' },
              { label: 'Page 5', icon: 'home' },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-breadcrumbs-wrapper').length).toBe(
    1
  );
  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(3);
});

test('Shows hidden <Breadcrumbs /> items on click', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreBreadcrumbs
            _testWidth={300}
            items={[
              { label: 'Page 1', icon: 'home' },
              { label: 'Page 2', icon: 'home' },
              { label: 'Page 3', icon: 'home' },
              { label: 'Page 4', icon: 'home' },
              { label: 'Page 5', icon: 'home' },
            ]}
          />
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    fireEvent.click(document.querySelectorAll('.reqore-breadcrumbs-item')[1]);
  });

  expect(document.querySelectorAll('.reqore-breadcrumbs-item').length).toBe(3);
});
