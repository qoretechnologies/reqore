import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreP, ReqoreUIProvider } from '../src';

const renderP = (ui: React.ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('<ReqoreP /> renders a paragraph by default', () => {
  renderP(<ReqoreP className='plain'>Text</ReqoreP>);

  expect(document.querySelector('.plain')?.tagName).toBe('P');
});

/* Block content — a rendered markdown list, a code block — is not allowed
   inside a `<p>`, and the browser "repairs" it by closing the paragraph early,
   which tears the text's styling off the content. `as` is how a caller keeps
   the paragraph's look on an element that may hold blocks, and it is part of
   the typed API so a caller does not have to cast to reach it. */
test('<ReqoreP /> renders as the element it is asked to', () => {
  renderP(
    <ReqoreP className='block' as='div' size='small'>
      <ul>
        <li>one</li>
      </ul>
    </ReqoreP>
  );

  const element = document.querySelector('.block');
  expect(element?.tagName).toBe('DIV');
  expect(element?.className).toContain('reqore-paragraph');
  expect(element?.querySelector('li')?.textContent).toBe('one');
});
