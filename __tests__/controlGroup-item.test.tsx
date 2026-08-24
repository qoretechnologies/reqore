import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreControlGroupItem,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

const wrap = (children: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('Renders <ControlGroupItem /> as a single child of the group', () => {
  // Without the item, a fragment's three elements each become their own flex
  // child of the group; wrapped, the group sees one child.
  wrap(
    <ReqoreControlGroup>
      <ReqoreControlGroupItem>
        <ReqoreButton>One</ReqoreButton>
        <ReqoreButton>Two</ReqoreButton>
        <ReqoreButton>Three</ReqoreButton>
      </ReqoreControlGroupItem>
      <ReqoreButton>Outside</ReqoreButton>
    </ReqoreControlGroup>
  );

  const group = document.querySelector('.reqore-control-group')!;
  const item = document.querySelector('.reqore-control-group-item')!;

  expect(item).toBeTruthy();
  expect(item.parentElement).toBe(group);
  // the group has exactly two children: the item and the sibling button
  expect(group.children.length).toBe(2);
  // and all three buttons live inside the item, not beside it
  expect(item.querySelectorAll('.reqore-button').length).toBe(3);
});

test('<ControlGroupItem /> stacks its children by default and can go horizontal', () => {
  const { rerender } = wrap(
    <ReqoreControlGroupItem>
      <ReqoreButton>One</ReqoreButton>
    </ReqoreControlGroupItem>
  );

  expect(
    getComputedStyle(document.querySelector('.reqore-control-group-item')!).flexFlow
  ).toContain('column');

  rerender(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroupItem horizontal>
            <ReqoreButton>One</ReqoreButton>
          </ReqoreControlGroupItem>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(
    getComputedStyle(document.querySelector('.reqore-control-group-item')!).flexFlow
  ).toContain('row');
});

test('<ControlGroupItem /> mirrors the group’s own child sizing', () => {
  // fluid: fills the slot, no explicit flex (matches StyledReqoreControlGroup)
  wrap(
    <ReqoreControlGroupItem fluid>
      <ReqoreButton>One</ReqoreButton>
    </ReqoreControlGroupItem>
  );
  let style = getComputedStyle(document.querySelector('.reqore-control-group-item')!);
  expect(style.width).toBe('100%');
  // never contributes its content width as a minimum, so it can shrink in a row
  expect(style.minWidth).toBe('0px');

  document.body.innerHTML = '';

  // fixed wins over fluid, exactly as in the group
  wrap(
    <ReqoreControlGroupItem fluid fixed>
      <ReqoreButton>One</ReqoreButton>
    </ReqoreControlGroupItem>
  );
  style = getComputedStyle(document.querySelector('.reqore-control-group-item')!);
  expect(style.flex).toBe('0 0 auto');
  expect(style.width).not.toBe('100%');
});

test('<ControlGroupItem /> keeps group-injected props off the DOM', () => {
  // ReqoreControlGroup clones these onto every non-intrinsic child; rendering
  // them as attributes is the "received `true` for a non-boolean attribute"
  // warning omitStyleProps exists to prevent.
  wrap(
    <ReqoreControlGroup>
      <ReqoreControlGroupItem>
        <ReqoreButton>One</ReqoreButton>
      </ReqoreControlGroupItem>
    </ReqoreControlGroup>
  );

  const item = document.querySelector('.reqore-control-group-item')!;

  ['minimal', 'flat', 'fluid', 'fixed', 'fill', 'stack', 'spaceBetween', 'intent', 'size'].forEach(
    (prop) => {
      expect(item.hasAttribute(prop)).toBe(false);
    }
  );
});
