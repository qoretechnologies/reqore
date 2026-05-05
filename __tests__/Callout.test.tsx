import { fireEvent, render } from '@testing-library/react';
import { ReqoreCallout, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

test('Renders <Callout /> with content', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout>No records match the current filters.</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
  expect(document.querySelectorAll('.reqore-callout-content').length).toBe(1);
  expect(document.querySelector('.reqore-callout')!.textContent).toBe(
    'No records match the current filters.'
  );
});

test('Calls <Callout /> onClick handler', () => {
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout onClick={handleClick}>Open details</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-callout')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Renders <Callout /> with content effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout contentEffect={{ frost: true }}>Frosted text</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
  expect(document.querySelectorAll('.reqore-callout-content').length).toBe(1);
  expect(document.querySelector('.reqore-callout')!.textContent).toBe('Frosted text');
});

test('Renders <Callout /> with container effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout effect={{ gradient: { colors: { 0: 'info', 100: 'success' } } }}>
            Gradient surface
          </ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
  expect(document.querySelector('.reqore-callout')!.textContent).toBe('Gradient surface');
});
