import { fireEvent, render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreLink, ReqoreUIProvider } from '../src';

const renderLink = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Renders <Link /> as a button by default and fires onClick', () => {
  const onClick = vi.fn();
  renderLink(<ReqoreLink onClick={onClick}>Open issue list</ReqoreLink>);

  const link = document.querySelector('button.reqore-link');
  expect(link).toBeTruthy();

  fireEvent.click(link!);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('Renders <Link href> as an anchor with the URL + new-tab rel', () => {
  renderLink(
    <ReqoreLink href='https://example.com' external>
      Docs
    </ReqoreLink>
  );

  const link = document.querySelector('a.reqore-link') as HTMLAnchorElement | null;
  expect(link).toBeTruthy();
  expect(link!.getAttribute('href')).toBe('https://example.com');
  expect(link!.getAttribute('target')).toBe('_blank');
  expect(link!.getAttribute('rel')).toBe('noopener noreferrer');
});

test('Disabled <Link> renders a disabled button that does not fire onClick', () => {
  const onClick = vi.fn();
  renderLink(
    <ReqoreLink onClick={onClick} disabled>
      Disabled
    </ReqoreLink>
  );

  const link = document.querySelector('button.reqore-link') as HTMLButtonElement;
  expect(link.disabled).toBe(true);

  fireEvent.click(link);
  expect(onClick).not.toHaveBeenCalled();
});

test('Disabled <Link href> drops the href so it cannot navigate', () => {
  renderLink(
    <ReqoreLink href='https://example.com' disabled>
      Docs
    </ReqoreLink>
  );

  const link = document.querySelector('a.reqore-link') as HTMLAnchorElement;
  expect(link.getAttribute('href')).toBeNull();
  expect(link.getAttribute('aria-disabled')).toBe('true');
});

test('Renders a leading icon when `icon` is provided', () => {
  renderLink(
    <ReqoreLink href='https://example.com' icon='ExternalLinkLine'>
      Docs
    </ReqoreLink>
  );

  const link = document.querySelector('a.reqore-link') as HTMLAnchorElement;
  expect(link).toBeTruthy();
  expect(link.querySelector('.reqore-icon')).toBeTruthy();
  expect(link.textContent).toContain('Docs');
});

test('Renders a custom element via `as` and passes element props through', () => {
  const RouterLinkStub = ({ to, children, ...rest }: any) => (
    <a href={to} data-router-link {...rest}>
      {children}
    </a>
  );

  renderLink(
    <ReqoreLink as={RouterLinkStub} to='/issues'>
      Issues
    </ReqoreLink>
  );

  const link = document.querySelector('a.reqore-link') as HTMLAnchorElement;
  expect(link).toBeTruthy();
  expect(link.getAttribute('href')).toBe('/issues');
  expect(link.hasAttribute('data-router-link')).toBe(true);
});

test('Truncates a capped link from the end by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreLink href='https://example.com/a/very/long/path' maxWidth='120px'>
            https://example.com/a/very/long/path
          </ReqoreLink>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // One head, no tail: the end is what gives way.
  expect(document.querySelectorAll('.reqore-link-text-head').length).toBe(1);
  expect(document.querySelectorAll('.reqore-link-text-tail').length).toBe(0);
  expect(document.querySelector('.reqore-link')!.textContent).toBe(
    'https://example.com/a/very/long/path'
  );
});

test('Keeps both ends when a capped link truncates in the middle', () => {
  /* An address is told apart from its neighbours by its tail — two webhooks on
     one host differ only there — so the middle is what may be dropped. */
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreLink href='https://example.com/webhooks/paddle' maxWidth='120px' truncate='middle'>
            https://example.com/webhooks/paddle
          </ReqoreLink>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const head = document.querySelector('.reqore-link-text-head')!;
  const tail = document.querySelector('.reqore-link-text-tail')!;

  // The last third, floored: 35 characters keeps 11.
  expect(tail.textContent).toBe('ooks/paddle');
  expect(`${head.textContent}${tail.textContent}`).toBe('https://example.com/webhooks/paddle');
});

test('Leaves an uncapped link whole', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreLink href='https://example.com' truncate='middle'>
            https://example.com
          </ReqoreLink>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-link-text-head').length).toBe(0);
  expect(document.querySelector('.reqore-link')!.textContent).toBe('https://example.com');
});
