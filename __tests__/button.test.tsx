import { render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreButton,
  ReqoreButtonGroup,
  ReqoreContent,

  ReqoreLayoutContent,
  ReqoreUIProvider
} from '../src';

test('Renders <Icon /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButtonGroup>
            <ReqoreButton minimal>Hello</ReqoreButton>
            <ReqoreButton icon="4KFill">Another</ReqoreButton>
          </ReqoreButtonGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button').length).toBe(2);
  expect(document.querySelectorAll('.reqore-button-group').length).toBe(1);
});