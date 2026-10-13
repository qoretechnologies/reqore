// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render } from '@testing-library/react';
import { ReqoreMenu, ReqoreMenuItem, ReqoreMenuSection, ReqoreUIProvider } from '../src/index';

/**
 * qorus#646 (found by the IDE agent): a menu cloned its own props - customTheme, wrap, flat, minimal, size and
 * closePopover - onto every child, plain DOM elements included, so React warned about unknown props on a
 * div, and the props reached the DOM. A host element takes none of them: the menu and its sections now
 * pass them only to components.
 */

/** What React says when a component's prop lands on a DOM element. React says it once per prop and element
 * type in a run, so each test also checks the element's attributes, which do not depend on test order. */
const DOM_PROP_WARNING =
  /React does not recognize|Invalid value for prop|non-boolean attribute|Unknown event handler property/;

const MENU_PROPS = ['customtheme', 'wrap', 'flat', 'minimal', 'size', 'closepopover'];

/** Renders `ui` and gives back what React wrote to console.error while it did. */
const renderCollectingErrors = (ui: React.ReactElement) => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    const result = render(ui);
    return { ...result, errors: consoleError.mock.calls.map((call) => call.map(String).join(' ')) };
  } finally {
    consoleError.mockRestore();
  }
};

const expectNoMenuPropsOn = (element: Element | null) => {
  expect(element).not.toBeNull();
  for (const name of MENU_PROPS) {
    expect(element).not.toHaveAttribute(name);
  }
};

test('a menu with a plain div child passes it none of its props', () => {
  const closePopover = vi.fn();
  const { container, errors } = renderCollectingErrors(
    <ReqoreUIProvider>
      <ReqoreMenu minimal wrapText flat size='small' closePopover={closePopover}>
        <div data-testid='plain-child'>Not a menu item</div>
        <ReqoreMenuItem onClick={(_event, _id, close) => close?.()}>Item</ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  expect(errors.filter((error) => DOM_PROP_WARNING.test(error))).toEqual([]);
  expectNoMenuPropsOn(container.querySelector('[data-testid="plain-child"]'));
  expect(container.querySelector('[data-testid="plain-child"]')).toHaveTextContent(
    'Not a menu item'
  );

  // a component child still gets them: the item closes the menu's popover
  fireEvent.click(container.querySelector('.reqore-menu-item') as Element);
  expect(closePopover).toHaveBeenCalledTimes(1);
});

test('a plain div inside a fragment in a menu gets none of its props either', () => {
  const { container, errors } = renderCollectingErrors(
    <ReqoreUIProvider>
      <ReqoreMenu
        minimal
        flat
        size='small'
        customTheme={{ main: '#225588' }}
        closePopover={() => undefined}
      >
        <>
          <div data-testid='fragment-child'>Inside a fragment</div>
        </>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  expect(errors.filter((error) => DOM_PROP_WARNING.test(error))).toEqual([]);
  expectNoMenuPropsOn(container.querySelector('[data-testid="fragment-child"]'));
});

test('a menu section with a plain div child passes it none of its props', () => {
  const { container, errors } = renderCollectingErrors(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuSection label='Section' minimal flat wrap customTheme={{ main: '#225588' }}>
          <div data-testid='section-child'>Not a menu item</div>
          <ReqoreMenuItem>Item</ReqoreMenuItem>
        </ReqoreMenuSection>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  expect(errors.filter((error) => DOM_PROP_WARNING.test(error))).toEqual([]);
  expectNoMenuPropsOn(container.querySelector('[data-testid="section-child"]'));
  expect(container.querySelectorAll('.reqore-menu-item').length).toBe(1);
});
