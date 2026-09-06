import { render, screen } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { ReqoreSelectItem } from '../src/components/Select';

/**
 * A select item carries how it should LOOK and what it MEANS. Only the first
 * belongs on the tag that renders it.
 *
 * `ReqoreTag` extends `React.HTMLAttributes` and spreads whatever it does not
 * consume onto the rendered element, so passing the whole item put the item's
 * own data on the DOM node. `value` is a real HTML attribute, so React kept it
 * — and a structured value has no string form, so it arrived as
 * `value="[object Object]"`. Qorus forms hit this with every hash allowed
 * value: the operator's DOM showed the fact that an object exists, where its
 * contents should be.
 */
const renderItem = (item: Record<string, unknown>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSelectItem item={item as never} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const tag = () => document.querySelector('.reqore-tag') as HTMLElement;

test('a structured value never reaches the DOM', () => {
  renderItem({ label: 'Hash Allowed Value 1', value: { option1: { subOption1: 'test' } } });

  expect(document.body.innerHTML).not.toContain('[object Object]');
  expect(tag().getAttribute('value')).toBeNull();
  // The label is presentation and still shows.
  expect(screen.getByText('Hash Allowed Value 1')).toBeTruthy();
});

test('a scalar value is data too, and is not published as an attribute', () => {
  // It stringifies cleanly, so it never announced itself as a bug — but the
  // value a select item stands for is no more the tag's business than a hash is.
  renderItem({ label: 'Plain', value: 'plain-value' });

  expect(tag().getAttribute('value')).toBeNull();
  expect(screen.getByText('Plain')).toBeTruthy();
});

test("the item's other data keys stay off the DOM as well", () => {
  renderItem({
    label: 'With data',
    value: 'v',
    metadata: { origin: 'catalogue' },
    isNew: true,
    items: [{ value: 'child' }],
  });

  expect(document.body.innerHTML).not.toContain('[object Object]');
  ['value', 'metadata', 'items', 'isNew'].forEach((attribute) => {
    expect(tag().getAttribute(attribute), `${attribute} reached the DOM`).toBeNull();
  });
});

test('an unlabelled item still shows a scalar value as its label', () => {
  // The long-standing fallback, unchanged: this is what an item with no label
  // has to show, and it is readable.
  renderItem({ value: 'just-the-value' });

  expect(screen.getByText('just-the-value')).toBeTruthy();
});

test('an unlabelled item with a structured value renders instead of throwing', () => {
  // `label` is rendered as a React child, so the old fallback handed React a
  // plain object — "Objects are not valid as a React child", a crash rather
  // than a degraded label.
  expect(() => renderItem({ value: { a: 1 } })).not.toThrow();
  expect(document.body.innerHTML).not.toContain('[object Object]');
});

test('the presentation half of an item still reaches the tag', () => {
  // The other side of the same coin: stripping the item's data must not take
  // its appearance with it. These are the props a caller sets expecting the
  // chip to honour them.
  renderItem({
    label: 'Styled',
    labelKey: 'KEY',
    icon: 'CheckLine',
    intent: 'success',
    className: 'my-own-class',
  });

  expect(screen.getByText('Styled')).toBeTruthy();
  expect(screen.getByText('KEY')).toBeTruthy();
  expect(document.querySelector('.my-own-class')).toBeTruthy();
  expect(document.querySelector('.reqore-icon')).toBeTruthy();
});
