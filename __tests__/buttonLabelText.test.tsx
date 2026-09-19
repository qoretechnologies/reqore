import { render, screen } from '@testing-library/react';
import { ReqoreButton, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

/*
 * An animated button (`animated`, or the provider's `animations.buttons`, on by
 * default) draws its label three times: the copy you see, the copy that slides
 * in for the active state, and an invisible copy that holds the button's width
 * while the other two move. Only the first may reach assistive technology, and
 * a plain text query — which does not skip `aria-hidden` — sees all three, so a
 * test that wants "the label" asks for the button by its name.
 */

const renderInLayout = (children: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const visibleToAssistiveTech = (elements: HTMLElement[]) =>
  elements.filter((element) => !element.closest('[aria-hidden="true"]'));

test('an animated button exposes its label once to assistive technology', () => {
  renderInLayout(<ReqoreButton label='Slack — Send message' animated />);

  const copies = screen.getAllByText('Slack — Send message');
  expect(copies.length).toBeGreaterThan(1);
  expect(visibleToAssistiveTech(copies)).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Slack — Send message' })).toHaveLength(1);
});

test('text a button is composed of is one accessible name', () => {
  const app = 'Slack';
  const action = 'send_message';

  renderInLayout(
    <ReqoreButton animated>
      {app} / {action}
    </ReqoreButton>
  );

  expect(visibleToAssistiveTech(screen.getAllByText('Slack / send_message'))).toHaveLength(1);
  expect(screen.getAllByRole('button', { name: 'Slack / send_message' })).toHaveLength(1);
});

test('a button that does not animate draws its label once', () => {
  renderInLayout(<ReqoreButton label='Slack — Send message' animated={false} />);

  expect(screen.getAllByText('Slack — Send message')).toHaveLength(1);
});
