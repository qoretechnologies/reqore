import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreMessage,
  ReqoreUIProvider,
} from '../src';

test('Renders <Message /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreMessage intent='info'>Heads up</ReqoreMessage>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.body.textContent).toContain('Heads up');
});

test('Renders <Message /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreMessage intent='info' flat raised>
            Raised
          </ReqoreMessage>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.body.textContent).toContain('Raised');
});
