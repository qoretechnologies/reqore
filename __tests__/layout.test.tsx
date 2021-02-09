import { render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreContent,
  ReqoreHeader,
  ReqoreLayoutContent,
  ReqoreNavbarDivider,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqoreUIProvider,
} from '../src';

test('Renders Layout properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreHeader>
          <ReqoreNavbarGroup>
            <ReqoreNavbarItem>Logo</ReqoreNavbarItem>
          </ReqoreNavbarGroup>
          <ReqoreNavbarGroup position='right'>
            <ReqoreNavbarItem>Item</ReqoreNavbarItem>
            <ReqoreNavbarDivider />
            <ReqoreNavbarItem>Item 2</ReqoreNavbarItem>
          </ReqoreNavbarGroup>
        </ReqoreHeader>
        <ReqoreContent>
          <h1>Hello</h1>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-layout-wrapper').length).toBe(1);
  expect(document.querySelectorAll('.reqore-layout-content').length).toBe(1);
  expect(document.querySelectorAll('h1').length).toBe(1);
});
