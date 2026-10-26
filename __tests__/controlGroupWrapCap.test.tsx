// A wrapped control group never lets a child be wider than itself (qorus#646). Its children had no cap: a child
// as wide as content that does not wrap - a select saying its value and description, or a group holding one - stayed
// that wide, and a data provider's path ran 487-712px wide in a 346px card on a phone. The browser stories
// (Form/Control Group · Wrapped Group Keeps A Long Button Inside, and On A Phone) measure the layout; these check
// the rule that makes it, in reqore's global style.
import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqorePanel,
  ReqoreUIProvider,
} from '../src';
import { WRAPPED_CONTROL_GROUP_CHILD_SELECTOR } from '../src/containers/UIProvider';

const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** Whether the provider's global rule caps `element` at the width of the group it is in. */
const isCapped = (element: Element) => element.matches(WRAPPED_CONTROL_GROUP_CHILD_SELECTOR);

const WRAPPED_ROW = (
  <ReqoreControlGroup fluid wrap className='wrapped'>
    <ReqoreButton fixed label='Datasource' />
    <ReqoreControlGroup fluid={false} className='step'>
      <ReqoreButton fluid label='omquser' description='The Qorus system datasource' />
    </ReqoreControlGroup>
    <ReqorePanel label='A card in the row'>Its content</ReqorePanel>
  </ReqoreControlGroup>
);

test('a wrapped group caps each of its children at its width', () => {
  const { container } = inLayout(WRAPPED_ROW);
  const children = Array.from(container.querySelector('.wrapped')!.children);

  // a button, a group holding one, and a card
  expect(children).toHaveLength(3);
  for (const child of children) {
    expect(isCapped(child), child.className).toBe(true);
  }
});

test("the cap weighs nothing, so a child's own width limits win over it", () => {
  // what is left outside `:where()` names no class, attribute, id or element: the rule has no weight at all
  expect(WRAPPED_CONTROL_GROUP_CHILD_SELECTOR.replace(/:where\([^)]*\)/g, '').trim()).toBe('> *');
});

test('a group that does not wrap does not cap its children', () => {
  const { container } = inLayout(
    <ReqoreControlGroup fluid className='one-line'>
      <ReqoreButton fixed label='Datasource' />
      <ReqoreControlGroup fluid={false}>
        <ReqoreButton fluid label='omquser' description='The Qorus system datasource' />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  );
  const group = container.querySelector('.one-line')!;

  expect(group.classList.contains('reqore-control-group-wrapped')).toBe(false);
  for (const child of Array.from(group.children)) {
    expect(isCapped(child), child.className).toBe(false);
  }
});

test("a nested group's children are capped by the nested group only when it wraps", () => {
  const { container } = inLayout(
    <ReqoreControlGroup fluid wrap>
      <ReqoreControlGroup fluid={false} className='step'>
        <ReqoreButton fluid label='omquser' description='The Qorus system datasource' />
      </ReqoreControlGroup>
      <ReqoreControlGroup fluid={false} wrap className='wrapped-step'>
        <ReqoreButton fluid label='bb_local' description='A table of business data' />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  );

  // both steps are in the wrapped row and capped by it; only the step that wraps caps its own button
  expect(isCapped(container.querySelector('.step')!)).toBe(true);
  expect(isCapped(container.querySelector('.step')!.firstElementChild!)).toBe(false);
  expect(isCapped(container.querySelector('.wrapped-step')!.firstElementChild!)).toBe(true);
});
