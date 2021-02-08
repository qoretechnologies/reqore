import { render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqoreUIProvider,
} from '../src/index';

test('Renders Menu properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem icon='add'> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem icon='add'> Item 1 </ReqoreMenuItem>
        <ReqoreMenuDivider label='Divider' />
        <ReqoreMenuItem icon='add'> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem icon='add'> Item 1 </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(4);
  expect(document.querySelectorAll('.reqore-menu-divider').length).toBe(1);
});
