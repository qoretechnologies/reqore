import { omitStyleProps } from '../src/helpers/styled';

test('omitStyleProps blocks the named props and defers everything else to the default validator', () => {
  const isValidAttribute = (prop: string | number | symbol) => prop !== 'notAnAttribute';
  const shouldForwardProp = omitStyleProps('fill', 'wrap');

  // Named props never reach the DOM, even when the default validator would allow them.
  expect(shouldForwardProp('fill', isValidAttribute)).toBe(false);
  expect(shouldForwardProp('wrap', isValidAttribute)).toBe(false);

  // Everything else is the default validator's decision, not ours.
  expect(shouldForwardProp('className', isValidAttribute)).toBe(true);
  expect(shouldForwardProp('notAnAttribute', isValidAttribute)).toBe(false);
});

test('omitStyleProps blocks nothing when given no props', () => {
  const shouldForwardProp = omitStyleProps();

  expect(shouldForwardProp('fill', () => true)).toBe(true);
  expect(shouldForwardProp('wrap', () => true)).toBe(true);
});

test('omitStyleProps returns independent predicates per call', () => {
  const omitsFill = omitStyleProps('fill');
  const omitsWrap = omitStyleProps('wrap');

  expect(omitsFill('fill', () => true)).toBe(false);
  expect(omitsFill('wrap', () => true)).toBe(true);
  expect(omitsWrap('wrap', () => true)).toBe(false);
  expect(omitsWrap('fill', () => true)).toBe(true);
});
