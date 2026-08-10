import { omitStyleProps } from '../src/helpers/styled';

const Component = () => null;

test('omitStyleProps blocks the named props and defers everything else to the default validator', () => {
  const isValidAttribute = (prop: string | number | symbol) => prop !== 'notAnAttribute';
  const shouldForwardProp = omitStyleProps('fill', 'wrap');

  // Named props never reach the DOM, even when the default validator would allow them.
  expect(shouldForwardProp('fill', isValidAttribute, 'div')).toBe(false);
  expect(shouldForwardProp('wrap', isValidAttribute, 'div')).toBe(false);

  // Everything else is the default validator's decision, not ours.
  expect(shouldForwardProp('className', isValidAttribute, 'div')).toBe(true);
  expect(shouldForwardProp('notAnAttribute', isValidAttribute, 'div')).toBe(false);
});

test('omitStyleProps blocks nothing when given no props', () => {
  const shouldForwardProp = omitStyleProps();

  expect(shouldForwardProp('fill', () => true, 'div')).toBe(true);
  expect(shouldForwardProp('wrap', () => true, 'div')).toBe(true);
});

test('omitStyleProps returns independent predicates per call', () => {
  const omitsFill = omitStyleProps('fill');
  const omitsWrap = omitStyleProps('wrap');

  expect(omitsFill('fill', () => true, 'div')).toBe(false);
  expect(omitsFill('wrap', () => true, 'div')).toBe(true);
  expect(omitsWrap('wrap', () => true, 'div')).toBe(false);
  expect(omitsWrap('fill', () => true, 'div')).toBe(true);
});

test('omitStyleProps forwards a component target its own props, which are not HTML attributes', () => {
  // The DOM validator rejects everything that is not an HTML attribute — which is every
  // prop a React component defines. Deferring to it for a component target strips the
  // component's entire API (this blanked the input clear button: `styled(ReqoreIcon)`
  // lost `icon` / `wrapperElement` / `wrapperSize`).
  const isValidAttribute = () => false;
  const shouldForwardProp = omitStyleProps('show');

  expect(shouldForwardProp('icon', isValidAttribute, Component)).toBe(true);
  expect(shouldForwardProp('wrapperElement', isValidAttribute, Component)).toBe(true);
  expect(shouldForwardProp('onResizeStop', isValidAttribute, Component)).toBe(true);
  expect(shouldForwardProp('renderElement', isValidAttribute, Component)).toBe(true);

  // The explicitly omitted props are still blocked, whatever the target is.
  expect(shouldForwardProp('show', isValidAttribute, Component)).toBe(false);
  expect(shouldForwardProp('show', () => true, 'div')).toBe(false);
});

test('omitStyleProps applies the DOM validator only to tag targets', () => {
  const isValidAttribute = (prop: string | number | symbol) => prop === 'className';
  const shouldForwardProp = omitStyleProps();

  expect(shouldForwardProp('enable', isValidAttribute, 'div')).toBe(false);
  expect(shouldForwardProp('enable', isValidAttribute, Component)).toBe(true);
  expect(shouldForwardProp('className', isValidAttribute, 'div')).toBe(true);
  expect(shouldForwardProp('className', isValidAttribute, Component)).toBe(true);
});
