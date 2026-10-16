import { render, screen } from '@testing-library/react';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

/* An icon-only button is read by its name. With no label of its own and no `aria-label`, it had none: assistive
   technology heard "button", and a test that finds buttons by name found nothing to test (the Qorus IDE's
   Interfaces view had 24 of 29 visible buttons unnamed, qorus#646). A string tooltip is the words such a button
   would say, so it names it. A tooltip that is a node or an object is left to the caller, and a button that has
   a label, or is named already, is not named twice. */

const draw = (button: JSX.Element) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{button}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('an icon-only button is named by its string tooltip', () => {
  draw(<ReqoreButton icon='Home7Line' tooltip='Go home' />);

  expect(screen.getByRole('button', { name: 'Go home' })).toBeTruthy();
});

test('a button with a label is named by the label, not again by its tooltip', () => {
  draw(
    <ReqoreButton icon='SaveLine' tooltip='Saves the draft'>
      Save
    </ReqoreButton>
  );

  const button = screen.getByRole('button', { name: 'Save' });
  expect(button.getAttribute('aria-label')).toBeNull();
});

test('an explicit aria-label wins over the tooltip', () => {
  draw(<ReqoreButton icon='Home7Line' tooltip='Go home' aria-label='Back to the start' />);

  expect(screen.getByRole('button', { name: 'Back to the start' })).toBeTruthy();
});

test('a button named by aria-labelledby is not also given an aria-label', () => {
  draw(
    <>
      <span id='the-name'>Close panel</span>
      <ReqoreButton icon='CloseLine' tooltip='Close' aria-labelledby='the-name' />
    </>
  );

  const button = screen.getByRole('button', { name: 'Close panel' });
  expect(button.getAttribute('aria-label')).toBeNull();
});

test('a tooltip that is not a string does not name the button', () => {
  draw(<ReqoreButton icon='Home7Line' tooltip={{ content: 'Go home' }} />);

  expect(document.querySelector('.reqore-button')?.getAttribute('aria-label')).toBeNull();
});
