import { render } from '@testing-library/react';
import styled, {
  isReqoreElementAttribute,
  omitStyleProps,
  REQORE_AMBIGUOUS_PROP_ELEMENTS,
} from '../src/helpers/styled';

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

  expect(shouldForwardProp('title', () => true, 'div')).toBe(true);
  expect(shouldForwardProp('role', () => true, 'div')).toBe(true);
  expect(shouldForwardProp('fill', () => true, Component)).toBe(true);
});

test('omitStyleProps returns independent predicates per call', () => {
  const omitsFill = omitStyleProps('fill');
  const omitsWrap = omitStyleProps('wrap');

  expect(omitsFill('fill', () => true, 'textarea')).toBe(false);
  expect(omitsFill('wrap', () => true, 'textarea')).toBe(true);
  expect(omitsWrap('wrap', () => true, 'textarea')).toBe(false);
  expect(omitsWrap('fill', () => true, Component)).toBe(true);
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

describe('a Reqore prop name that is an attribute of some elements only', () => {
  test.each([
    ['size', 'div', false],
    ['size', 'span', false],
    ['size', 'input', true],
    ['size', 'select', true],
    ['disabled', 'div', false],
    ['disabled', 'button', true],
    ['checked', 'div', false],
    ['checked', 'input', true],
    ['selected', 'div', false],
    ['selected', 'option', true],
    ['readOnly', 'div', false],
    ['readOnly', 'textarea', true],
    ['placeholder', 'button', false],
    ['placeholder', 'input', true],
    ['width', 'div', false],
    ['width', 'img', true],
    ['wrap', 'span', false],
    ['wrap', 'textarea', true],
    ['color', 'span', false],
    ['type', 'div', false],
    ['type', 'button', true],
    ['value', 'div', false],
    ['value', 'li', true],
    // SVG presentation attributes are real on SVG elements.
    ['fill', 'path', true],
    ['width', 'svg', true],
    // Names Reqore does not use for its own meaning are not this filter's business.
    ['title', 'div', true],
    ['href', 'a', true],
  ])('`%s` on a `%s` is forwarded: %s', (prop, tag, forwarded) => {
    expect(isReqoreElementAttribute(prop, tag)).toBe(forwarded);
    expect(omitStyleProps()(prop, () => true, tag)).toBe(forwarded);
  });

  test('every listed element is a real element name', () => {
    // The table is typed against React's intrinsic elements; this guards the runtime copy.
    Object.values(REQORE_AMBIGUOUS_PROP_ELEMENTS)
      .flat()
      .forEach((tag) => expect(document.createElement(tag)).not.toBeInstanceOf(HTMLUnknownElement));
  });
});

describe("Reqore's `styled`", () => {
  const getReactProps = (element: Element): Record<string, unknown> => {
    const key = Object.keys(element).find((name) => name.startsWith('__reactProps$'));

    return (element as unknown as Record<string, Record<string, unknown>>)[key];
  };

  test('keeps a styling prop off an element it is not an attribute of', () => {
    const StyledBox = styled.div<{ size?: string; disabled?: boolean }>`
      font-size: ${({ size }) => (size === 'small' ? '10px' : '14px')};
    `;
    const StyledInput = styled.input``;
    const { container } = render(
      <>
        <StyledBox className='probe-box' size='small' disabled title='Title' />
        <StyledInput className='probe-input' size={10} disabled readOnly />
      </>
    );
    const box = container.querySelector('.probe-box');
    const input = container.querySelector('.probe-input');

    expect(box).not.toHaveAttribute('size');
    expect(box).not.toHaveAttribute('disabled');
    expect(box).toHaveAttribute('title', 'Title');
    expect(getReactProps(box)).not.toHaveProperty('size');
    // The styles still read it.
    expect(getComputedStyle(box).fontSize).toBe('10px');
    expect(input).toHaveAttribute('size', '10');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('readonly');
  });

  test('uses the element a styled component is rendered `as`', () => {
    const StyledControl = styled.div``;
    const { container } = render(<StyledControl as='button' className='probe' disabled />);

    expect(container.querySelector('.probe')).toBeDisabled();
  });

  test("forwards everything to a component, and a styled component's own filter wins", () => {
    const received: string[] = [];
    const Target = (props: Record<string, unknown>) => {
      received.push(...Object.keys(props));

      return null;
    };
    const StyledTarget = styled(Target)``;
    const StyledOwnFilter = styled.div.withConfig({ shouldForwardProp: omitStyleProps('title') })``;

    render(<StyledTarget {...({ size: 'small', checked: true } as any)} />);
    const { container } = render(
      <StyledOwnFilter className='probe' {...({ size: 'small' } as any)} title='Title' />
    );

    expect(received).toEqual(expect.arrayContaining(['size', 'checked']));
    // Its own `omitStyleProps` keeps the element filter.
    expect(container.querySelector('.probe')).not.toHaveAttribute('size');
    expect(container.querySelector('.probe')).not.toHaveAttribute('title');
  });
});
