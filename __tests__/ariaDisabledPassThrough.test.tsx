/**
 * `aria-disabled`: a component that is disabled says so, and one that is not keeps the caller's own. An accordion
 * item says it on its header, the control.
 */
import { render } from '@testing-library/react';
import {
  ReqoreAccordion,
  ReqoreCollapsibleContent,
  ReqoreProgress,
  ReqoreSeverityRow,
  ReqoreStackedBar,
  ReqoreUIProvider,
} from '../src';

const ownAriaDisabled = { 'aria-disabled': true } as const;

test.each([
  ['a progress bar', <ReqoreProgress key='p' value={50} {...ownAriaDisabled} />, '.reqore-progress'],
  [
    'a stacked bar',
    <ReqoreStackedBar key='s' items={[{ value: 1 }]} {...ownAriaDisabled} />,
    '.reqore-stacked-bar',
  ],
  [
    'a severity row',
    <ReqoreSeverityRow key='r' label='Row' {...ownAriaDisabled} />,
    '.reqore-severity-row',
  ],
  [
    'a collapsible content',
    <ReqoreCollapsibleContent key='c' {...ownAriaDisabled}>
      Text
    </ReqoreCollapsibleContent>,
    '.reqore-collapsible-content',
  ],
  [
    'an accordion',
    <ReqoreAccordion key='a' items={[{ label: 'One', content: 'Body' }]} {...ownAriaDisabled} />,
    '.reqore-accordion',
  ],
])("%s that is not disabled keeps the caller's own aria-disabled", (_name, element, selector) => {
  render(<ReqoreUIProvider>{element}</ReqoreUIProvider>);

  expect(document.querySelector(selector)!.getAttribute('aria-disabled')).toBe('true');
});

/** The same components, given `props`. */
const withProps = (props: Record<string, unknown>): [string, JSX.Element, string][] => [
  ['a progress bar', <ReqoreProgress key='p' value={50} {...props} />, '.reqore-progress'],
  ['a stacked bar', <ReqoreStackedBar key='s' items={[{ value: 1 }]} {...props} />, '.reqore-stacked-bar'],
  ['a severity row', <ReqoreSeverityRow key='r' label='Row' {...props} />, '.reqore-severity-row'],
  [
    'a collapsible content',
    <ReqoreCollapsibleContent key='c' {...props}>
      Text
    </ReqoreCollapsibleContent>,
    '.reqore-collapsible-content',
  ],
];

test.each(withProps({ disabled: true }))('%s that is disabled says so', (_name, element, selector) => {
  render(<ReqoreUIProvider>{element}</ReqoreUIProvider>);

  expect(document.querySelector(selector)!.getAttribute('aria-disabled')).toBe('true');
});

test.each(withProps({ disabled: true, 'aria-disabled': false }))(
  '%s that is disabled says so, whatever the caller says',
  (_name, element, selector) => {
    render(<ReqoreUIProvider>{element}</ReqoreUIProvider>);

    expect(document.querySelector(selector)!.getAttribute('aria-disabled')).toBe('true');
  }
);

test.each(withProps({}))('%s that is neither disabled nor told says nothing', (_name, element, selector) => {
  render(<ReqoreUIProvider>{element}</ReqoreUIProvider>);

  expect(document.querySelector(selector)!.hasAttribute('aria-disabled')).toBe(false);
});

test('a disabled accordion item says so on its header, the control', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreAccordion items={[{ label: 'One', content: 'Body', disabled: true }]} />
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-accordion-header')!.getAttribute('aria-disabled')).toBe(
    'true'
  );
  expect(document.querySelector('.reqore-accordion-item')!.hasAttribute('aria-disabled')).toBe(
    false
  );
});
