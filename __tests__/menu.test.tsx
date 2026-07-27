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

describe('<MenuItem /> scrollIntoView', () => {
  const renderWithScrollSpy = (options?: Record<string, any>) => {
    const scrollIntoView = vi.fn();

    // jsdom does not implement scrollIntoView, so there is nothing to restore afterwards
    // beyond the spy itself.
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

    render(
      <ReqoreUIProvider options={options}>
        <ReqoreMenu>
          <ReqoreMenuItem label='Item 1' />
          <ReqoreMenuItem label='Item 2' selected scrollIntoView />
        </ReqoreMenu>
      </ReqoreUIProvider>
    );

    return scrollIntoView;
  };

  test('centres the item vertically without dragging a vertical list sideways', () => {
    const scrollIntoView = renderWithScrollSpy();

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ block: 'center', inline: 'nearest' })
    );
  });

  test('animates the scroll by default', () => {
    const scrollIntoView = renderWithScrollSpy();

    expect(scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'smooth' })
    );
  });

  test('jumps straight to the item when popover animations are disabled', () => {
    const scrollIntoView = renderWithScrollSpy({ animations: { popovers: false } });

    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
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
