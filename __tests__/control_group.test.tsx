import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

test('Renders <ControlGroup /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup>
            <ReqoreInput minimal />
            <ReqoreButton>Hello</ReqoreButton>
            <ReqoreInput disabled />
            <ReqoreInput size='big' />
            <ReqoreButton>Hello</ReqoreButton>
            <ReqoreButton>Hello</ReqoreButton>
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input').length).toBe(3);
  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
  expect(document.querySelectorAll('.reqore-control-group').length).toBe(1);
});
