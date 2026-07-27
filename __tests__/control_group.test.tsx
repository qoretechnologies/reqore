import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreMessage,
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

test('Does not forward ControlGroup styling props to the DOM', () => {
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreControlGroup fluid vertical spaceBetween gapSize='small'>
        <ReqoreButton>Hello</ReqoreButton>
      </ReqoreControlGroup>
    </ReqoreUIProvider>
  );

  const group = container.querySelector('.reqore-control-group');
  expect(group).toBeTruthy();
  expect(group).not.toHaveAttribute('fluid');
  expect(group).not.toHaveAttribute('vertical');
  expect(group).not.toHaveAttribute('spaceBetween');
  expect(group).not.toHaveAttribute('gapSize');
});

test('Does not forward inherited ControlGroup props through polymorphic components', () => {
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreControlGroup fluid vertical spaceBetween>
        <ReqoreMessage fluid>Review this action</ReqoreMessage>
      </ReqoreControlGroup>
    </ReqoreUIProvider>
  );

  const message = container.querySelector('.reqore-message');
  expect(message).toBeTruthy();
  expect(message).not.toHaveAttribute('fluid');
  expect(message).not.toHaveAttribute('spaceBetween');
  expect(message).not.toHaveAttribute('asMessage');
});

test('Does not clone Reqore styling props onto intrinsic children', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreControlGroup fluid vertical spaceBetween>
        <ul data-testid='native-list'>
          <li>Planned object</li>
        </ul>
      </ReqoreControlGroup>
    </ReqoreUIProvider>
  );

  const list = container.querySelector('[data-testid="native-list"]');
  const warnings = consoleError.mock.calls.flat().join(' ');
  consoleError.mockRestore();
  expect(list).toBeTruthy();
  expect(list).not.toHaveAttribute('fluid');
  expect(list).not.toHaveAttribute('spaceBetween');
  expect(list).not.toHaveAttribute('customTheme');
  expect(warnings).not.toMatch(/fluid|spaceBetween|customTheme/);
});

test('Does not forward a propagated fill flag through a dropdown button', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup fill>
            <ReqoreDropdown items={[{ label: 'First option' }]} />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const button = container.querySelector('.reqore-dropdown-control');
  const warnings = consoleError.mock.calls.flat().join(' ');
  consoleError.mockRestore();
  expect(button).toBeTruthy();
  expect(button).not.toHaveAttribute('fill');
  expect(warnings).not.toMatch(/non-boolean attribute [`'"]?fill/i);
});
