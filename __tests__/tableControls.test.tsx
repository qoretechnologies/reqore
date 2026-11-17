import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreLayoutContent,
  ReqoreTable,
  ReqoreUIProvider,
  useReqoreTableControls,
} from '../src';
import { IReqoreDropdownItem } from '../src/components/Dropdown/list';
import { IReqoreTableColumn } from '../src/components/Table';
import { IReqoreTableControls } from '../src/components/Table/controls';
import { getTableColumnsPickerItems } from '../src/components/Table/helpers';

const columns: IReqoreTableColumn[] = [
  { dataId: 'name', header: { label: 'Name' } },
  { dataId: 'status', header: { label: 'Status' } },
  { dataId: 'actions', header: { label: '' } },
];

const data = [
  { _selectId: 1, name: 'Order sync', status: 'Running' },
  { _selectId: 2, name: 'Invoice import', status: 'Stopped' },
];

let latest: IReqoreTableControls | undefined;

const Page = ({ inlineColumns }: { inlineColumns?: boolean }) => {
  const tableControls = useReqoreTableControls();

  latest = tableControls;

  return (
    <ReqoreTable
      // A new array on every render must not make the page and the table draw each other forever.
      columns={inlineColumns ? [...columns] : columns}
      data={data}
      showColumnsOptions
      exportable
      controls={tableControls}
    />
  );
};

const renderPage = (inlineColumns?: boolean) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <Page inlineColumns={inlineColumns} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const columnEntries = () =>
  latest!.columnsActions.filter((item) => !item.divider && item.label !== 'Reset columns');

afterEach(() => {
  latest = undefined;
});

describe('useReqoreTableControls', () => {
  test('Hands the page the column picker and the export, and the table draws neither', () => {
    renderPage();

    expect(latest!.connected).toBe(true);
    expect(columnEntries().map((item) => [item.label, item.selected])).toEqual([
      ['Name', true],
      ['Status', true],
    ]);
    expect(latest!.menuActions.map((item) => item.label)).toEqual([
      'Columns',
      'Export current view',
      'Export full data',
    ]);
    // Asked for, and still not in the table: the page holds them.
    expect(document.querySelector('.reqore-table-columns-options')).toBeNull();
    expect(document.querySelector('.reqore-table-more')).toBeNull();
    expect(document.querySelector('.reqore-panel-title')).toBeNull();
  });

  test('A column toggled from the page hides it, and the entries follow the table', () => {
    renderPage(true);

    act(() => {
      columnEntries()[1].onClick?.(columnEntries()[1]);
    });

    expect(columnEntries().map((item) => [item.label, item.selected])).toEqual([
      ['Name', true],
      ['Status', false],
    ]);
    expect(document.querySelectorAll('.reqore-table-header-cell')).toHaveLength(2);
    // Toggling a column leaves the menu open for the next one.
    expect(columnEntries().every((item) => item.keepOpen)).toBe(true);
    // A changed column offers the reset, in the picker, not in a "⋯" of the table's own.
    expect(latest!.hasColumnChanges).toBe(true);
    expect(latest!.columnsActions.at(-1)?.label).toBe('Reset columns');
    expect(document.querySelector('.reqore-table-more')).toBeNull();

    act(() => {
      latest!.resetColumns();
    });

    expect(columnEntries().map((item) => item.selected)).toEqual([true, true]);
    expect(latest!.hasColumnChanges).toBe(false);
  });

  test('Opens the table\'s export dialog', () => {
    renderPage();

    act(() => {
      latest!.exportActions[0].onClick?.(latest!.exportActions[0]);
    });

    expect(screen.getByText('Export data')).toBeTruthy();
  });

  test('Lets go of the table when it is gone', () => {
    const { unmount } = renderPage();
    const controls = latest!;

    act(() => unmount());

    // The last object the page rendered was connected; the next render would not be.
    expect(controls.connected).toBe(true);
  });
});

describe('the column picker', () => {
  test('Leaves out a column with no name', () => {
    const items = getTableColumnsPickerItems(columns, () => undefined);

    expect(items.map((item) => item.label)).toEqual(['Name', 'Status']);
  });
});

describe('a dropdown item', () => {
  const renderMenu = (items: IReqoreDropdownItem[]) =>
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown label='Menu' items={items} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

  test('With keepOpen leaves the menu open when chosen; without it, closes it', () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    const menuItems = () => document.querySelectorAll('.reqore-popover-content .reqore-menu-item');
    const item = (index: number) => menuItems()[index] as HTMLElement;

    renderMenu([
      { label: 'Toggle me', keepOpen: true, onClick },
      { label: 'Close me', onClick },
    ]);

    fireEvent.click(document.querySelector('.reqore-dropdown-control')!);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(menuItems()).toHaveLength(2);

    fireEvent.click(item(0));
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(menuItems()).toHaveLength(2);
    // Not passed on to the DOM as an attribute.
    expect(document.querySelector('[keepopen]')).toBeNull();

    fireEvent.click(item(1));
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(menuItems()).toHaveLength(0);
    vi.useRealTimers();
  });

  test('An open submenu shows its items as they are now, not as they were when it opened', () => {
    vi.useFakeTimers();
    const menuItems = () =>
      Array.from(document.querySelectorAll('.reqore-popover-content .reqore-menu-item')).map(
        (item) => item.textContent?.trim()
      );
    // A menu item's label may be drawn more than once (the marquee keeps a hidden copy).
    const shows = (label: string) => menuItems().some((text) => text?.includes(label));
    const click = (label: string) => {
      fireEvent.click(
        Array.from(
          document.querySelectorAll<HTMLElement>('.reqore-popover-content .reqore-menu-item')
        ).find((item) => item.textContent?.trim().startsWith(label))!
      );
      act(() => {
        vi.advanceTimersByTime(1);
      });
    };

    const Menu = () => {
      const [shown, setShown] = useState(true);

      return (
        <ReqoreDropdown
          label='Menu'
          items={[
            {
              label: 'Columns',
              items: [
                {
                  label: shown ? 'Status shown' : 'Status hidden',
                  keepOpen: true,
                  onClick: () => setShown((current) => !current),
                },
              ],
            },
            { label: 'Export' },
          ]}
        />
      );
    };

    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <Menu />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    fireEvent.click(document.querySelector('.reqore-dropdown-control')!);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    click('Columns');
    expect(shows('Status shown')).toBe(true);

    click('Status shown');
    expect(shows('Status hidden')).toBe(true);
    expect(shows('Status shown')).toBe(false);
    vi.useRealTimers();
  });
});
