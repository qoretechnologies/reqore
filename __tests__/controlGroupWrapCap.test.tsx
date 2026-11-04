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
import { CONTROL_GROUP_COLLAPSE_VARIABLE } from '../src/constants/controlGroup';
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

/** What the group says it pulls `element` over by, in the child's own style. */
const collapse = (element: Element) =>
  (element as HTMLElement).style.getPropertyValue(CONTROL_GROUP_COLLAPSE_VARIABLE);

test('a stacked wrapped group says what it pulls a child with a margin over by', () => {
  const { container } = inLayout(
    <ReqoreControlGroup stack wrap className='rail'>
      <ReqoreButton label='Clone' flat={false} />
      <ReqoreButton label='Edit' />
    </ReqoreControlGroup>
  );
  const [clone, edit] = Array.from(container.querySelector('.rail')!.children);

  expect((clone as HTMLElement).style.marginLeft).toBe('-1px');
  expect(collapse(clone)).toBe('1px');
  expect(collapse(edit)).toBe('1px');
});

test('a flat child of a stacked wrapped group has no margin, and so nothing to add to its cap', () => {
  const { container } = inLayout(
    <ReqoreControlGroup stack wrap flat className='rail'>
      <ReqoreButton label='Clone' />
    </ReqoreControlGroup>
  );
  const clone = container.querySelector('.rail')!.children[0] as HTMLElement;

  expect(clone.style.marginLeft).toBe('');
  expect(collapse(clone)).toBe('');
});

test('a child that fills its row keeps its cap, so the rows of a stack stay in line', () => {
  const { container } = inLayout(
    <ReqoreControlGroup stack wrap fluid className='rows'>
      <ReqoreButton label='Fills, as the group does' />
      <ReqoreButton label='Fills' fluid />
      <ReqoreButton label='Does not' fixed />
      <ReqoreButton label='Does not' fluid={false} />
    </ReqoreControlGroup>
  );
  const [inherits, own, fixed, notFluid] = Array.from(container.querySelector('.rows')!.children);

  expect(collapse(inherits)).toBe('');
  expect(collapse(own)).toBe('');
  expect(collapse(fixed)).toBe('1px');
  expect(collapse(notFluid)).toBe('1px');
});

test("a child that sets its own left margin adds nothing: the group's margin is not in effect", () => {
  const { container } = inLayout(
    <ReqoreControlGroup stack wrap className='rail'>
      <ReqoreButton label='Clone' flat={false} style={{ marginLeft: 4 }} />
    </ReqoreControlGroup>
  );
  const clone = container.querySelector('.rail')!.children[0] as HTMLElement;

  expect(clone.style.marginLeft).toBe('4px');
  expect(collapse(clone)).toBe('');
});

test('a stack that does not wrap, and a wrapped group that is not a stack, pull nothing over', () => {
  const { container } = inLayout(
    <>
      <ReqoreControlGroup stack className='one-line'>
        <ReqoreButton label='One' flat={false} />
        <ReqoreButton label='Two' flat={false} />
      </ReqoreControlGroup>
      <ReqoreControlGroup wrap className='spaced'>
        <ReqoreButton label='One' flat={false} />
      </ReqoreControlGroup>
    </>
  );

  for (const child of [
    ...Array.from(container.querySelector('.one-line')!.children),
    ...Array.from(container.querySelector('.spaced')!.children),
  ]) {
    expect(collapse(child)).toBe('');
  }
});
