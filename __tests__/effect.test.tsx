import { render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreContent,
  ReqoreEffect,
  ReqoreLayoutContent,
  ReqoreTextEffect,
  ReqoreUIProvider,
} from '../src';

test('Renders <ReqoreEffect /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEffect
            as='div'
            effect={{
              gradient: {
                type: 'radial',
                shape: 'circle',
                colors: {
                  0: 'danger:lighten:2',
                  100: 'info:darken:1',
                },
              },
              spaced: 10,
              uppercase: true,
              weight: 'bold',
              color: 'main',
            }}
          >
            This is a test
          </ReqoreEffect>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-effect').length).toBe(1);
});

test('Renders <ReqoreTextEffect /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextEffect
            as='p'
            effect={{
              gradient: {
                colors: {
                  0: '#ff0000',
                  100: '#00ff00',
                },
              },
              spaced: 10,
              uppercase: true,
              weight: 'thin',
            }}
          >
            This is a test
          </ReqoreTextEffect>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-text-effect').length).toBe(1);
});
