import { fireEvent, render } from '@testing-library/react';
import { ReqoreMenu, ReqoreMenuDivider, ReqoreMenuItem, ReqoreUIProvider } from '../src/index';

test('Renders <Menu /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 2 </ReqoreMenuItem>
        <ReqoreMenuDivider label='Divider' />
        <ReqoreMenuItem label={2.5} />
        <ReqoreMenuItem> Item 3 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 4 </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(5);
  expect(document.querySelectorAll('.reqore-menu-divider').length).toBe(1);
});

test('<Menu /> item can be clicked', () => {
  const itemCb = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem onClick={itemCb}>Item 2</ReqoreMenuItem>
        <ReqoreMenuDivider label='Divider' />
        <ReqoreMenuItem> Item 3 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 4 </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[1]);

  expect(itemCb).toHaveBeenCalled();
});

test('<Menu /> item has right clickable button', () => {
  const iconCb = vi.fn();
  const itemCb = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem> Item 1 </ReqoreMenuItem>
        <ReqoreMenuItem
          onClick={itemCb}
          rightIcon='24HoursFill'
          rightAction={{ icon: '24HoursFill', onClick: iconCb }}
        >
          Item 2
        </ReqoreMenuItem>
        <ReqoreMenuDivider label='Divider' />
        <ReqoreMenuItem> Item 3 </ReqoreMenuItem>
        <ReqoreMenuItem> Item 4 </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelectorAll('.reqore-menu-item-right-action')[0]);

  expect(iconCb).toHaveBeenCalled();
  expect(itemCb).not.toHaveBeenCalled();
});

test('<Menu /> item action with `actions` opens a dropdown of grouped shortcuts', () => {
  const itemCb = vi.fn();
  const showAllCb = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreMenu>
        <ReqoreMenuItem
          onClick={itemCb}
          rightAction={{
            icon: 'AddLine',
            actions: [
              { divider: true, label: 'Browse' },
              { icon: 'ListOrdered', label: 'Show all workflows', onClick: showAllCb },
              { divider: true, label: 'Create' },
              { icon: 'AddLine', label: 'Create workflow' },
            ],
          }}
        >
          Workflows Hub
        </ReqoreMenuItem>
      </ReqoreMenu>
    </ReqoreUIProvider>
  );

  // The dropdown control reuses the plain right-action class, so existing
  // selectors keep matching it.
  const control = document.querySelector('.reqore-menu-item-right-action');
  expect(control).toBeTruthy();
  // Closed by default.
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.click(control!);

  // Opening the dropdown must not trigger the row's own click (navigation).
  expect(itemCb).not.toHaveBeenCalled();
  // The popover lists the two shortcut items (dividers group them).
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  const dropdownItems = document.querySelectorAll('.reqore-popover-content .reqore-menu-item');
  expect(dropdownItems.length).toBe(2);

  // Clicking a shortcut fires its handler.
  const showAll = [...dropdownItems].find((node) =>
    node.textContent?.includes('Show all workflows')
  );
  fireEvent.click(showAll!);
  expect(showAllCb).toHaveBeenCalled();
});

describe('<MenuItem /> scrollIntoView', () => {
  /* Inside a menu, the item is scrolled to inside that menu (see menuItemScrollStaysInMenu.test.tsx): the menu
     is laid out as a browser would lay it out, scrollable, with the item below its middle. */
  const renderWithMenuScrollSpy = (options?: Record<string, any>) => {
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const menuScroll = vi.fn();
    const tree = (marked: boolean) => (
      <ReqoreUIProvider options={options}>
        <ReqoreMenu>
          <ReqoreMenuItem label='Item 1' />
          <ReqoreMenuItem label='Item 2' className='second' selected scrollIntoView={marked} />
        </ReqoreMenu>
      </ReqoreUIProvider>
    );
    const { rerender } = render(tree(false));
    const menu = document.querySelector<HTMLElement>('.reqore-menu')!;
    menu.getBoundingClientRect = () => ({ top: 0, height: 100 }) as DOMRect;
    Object.defineProperty(menu, 'scrollHeight', { configurable: true, value: 300 });
    Object.defineProperty(menu, 'clientHeight', { configurable: true, value: 100 });
    menu.scrollTo = menuScroll as never;
    const item = document.querySelector<HTMLElement>('.second.reqore-menu-item')!;
    item.getBoundingClientRect = () => ({ top: 200, height: 20 }) as DOMRect;
    rerender(tree(true));
    return { scrollIntoView, menuScroll };
  };

  test('centres the item in its menu, and does not scroll anything around the menu', () => {
    const { scrollIntoView, menuScroll } = renderWithMenuScrollSpy();

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(menuScroll).toHaveBeenCalledTimes(1);
    // the item's middle (210) to the menu's middle (50)
    expect(menuScroll).toHaveBeenCalledWith(expect.objectContaining({ top: 160 }));
  });

  test('animates the scroll by default', () => {
    const { menuScroll } = renderWithMenuScrollSpy();

    expect(menuScroll).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });

  test('jumps straight to the item when popover animations are disabled', () => {
    const { menuScroll } = renderWithMenuScrollSpy({ animations: { popovers: false } });

    expect(menuScroll).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
  });

  test('an item outside a menu is brought into view by itself, centred without dragging sideways', () => {
    const scrollIntoView = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <ReqoreUIProvider>
        <ReqoreMenuItem label='Item 2' selected scrollIntoView />
      </ReqoreUIProvider>
    );

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'center', inline: 'nearest' })
    );
  });

  test('does not scroll items that are not marked for it', () => {
    const scrollIntoView = vi.fn();

    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <ReqoreUIProvider>
        <ReqoreMenu>
          <ReqoreMenuItem label='Item 1' />
          <ReqoreMenuItem label='Item 2' selected />
        </ReqoreMenu>
      </ReqoreUIProvider>
    );

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
