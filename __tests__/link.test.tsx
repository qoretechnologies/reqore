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
  const onClick = jest.fn();
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
  const onClick = jest.fn();
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
