import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { ReqoreLayoutContent, ReqoreTabs, ReqoreTabsContent, ReqoreUIProvider } from '../src';

// styled-components emits its rules into <style> tags / CSSOM rather than inline
// styles, so to assert on generated CSS (max-height, overscroll) we read the
// combined stylesheet text back out of the document.
const getStyleText = () =>
  Array.from(document.querySelectorAll('style'))
    .map((s) => s.textContent || '')
    .join('\n') +
  Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText);
      } catch {
        return [];
      }
    })
    .join('\n');

const overflowingTabs = [
  { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
  { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
  { label: 'Tab 3', icon: 'Home3Line', id: 'tab3' },
  { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
  { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
] as const;

test('Renders full <Tabs /> properly', () => {
  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3' },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  expect(document.querySelectorAll('.reqore-tabs-list').length).toBe(1);
  expect(document.querySelectorAll('.reqore-tabs').length).toBe(1);
  expect(document.querySelectorAll('.reqore-tabs-list-item').length).toBe(5);
  expect(document.querySelectorAll('.reqore-tabs-content').length).toBe(1);
  expect(screen.getByText('Tab 1 content')).toBeTruthy();
});

test('Renders shortened <Tabs /> properly', () => {
  const fn = vi.fn();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            _testWidth={300}
            onTabChange={fn}
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3' },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-tabs-list-item').length).toBe(3);
  expect(document.querySelectorAll('.reqore-tabs-list-item-menu').length).toBe(1);

  fireEvent.mouseEnter(document.querySelector('.reqore-tabs-list-item-menu')!);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);

  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[0]);

  expect(fn).toBeCalledTimes(1);
  expect(fn).toBeCalledWith('tab3');
});

test('Can select hidden <Tabs /> when shortened', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            _testWidth={300}
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3' },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-tabs-list-item').length).toBe(3);
  expect(document.querySelectorAll('.reqore-tabs-list-item-menu').length).toBe(1);
});

test('Default active tab can be specified', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3' },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
            activeTab='tab4'
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(screen.getByText('Tab 4 content')).toBeTruthy();
});

test('Changes tab and runs callback', () => {
  const cb = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3' },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
            onTabChange={cb}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelectorAll('.reqore-tabs-list-item')[2]);

  expect(screen.getByText('Tab 3 content')).toBeTruthy();
  expect(cb).toHaveBeenCalledWith('tab3');
  expect(document.querySelectorAll('.reqore-tabs-list-item-active').length).toBe(1);
});

test('Does not change tab and run callback when disabled', () => {
  const cb = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3', disabled: true },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
            onTabChange={cb}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelectorAll('.reqore-tabs-list-item')[2]);

  expect(screen.getByText('Tab 1 content')).toBeTruthy();
  expect(cb).not.toHaveBeenCalled();
  expect(document.querySelectorAll('.reqore-tabs-list-item-active').length).toBe(1);
});

test('Does not change tab when mounted and active tab is set', () => {
  const cb = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3', disabled: true },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
            activeTab={'tab4'}
            onTabChange={cb}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(cb).not.toHaveBeenCalled();
});

test('Changes tab programatically and runs callback', () => {
  const cb = vi.fn();

  const Component = () => {
    const [activeTab, setActiveTab] = useState('tab1');

    return (
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3', disabled: true },
              { label: 'Tab 4', icon: 'Home3Line', id: 'tab4' },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
            onTabChange={cb}
            activeTab={activeTab}
          >
            <ReqoreTabsContent tabId='tab1'>
              <button onClick={() => setActiveTab('tab2')}>Change active tab</button>
            </ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  };

  act(() => {
    render(<Component />);
  });

  fireEvent.click(screen.getByText('Change active tab'));

  expect(screen.getByText('Tab 2 content')).toBeTruthy();
  expect(cb).toHaveBeenCalled();
});

test('Closable tab can be closed if not disabled', () => {
  const cb = vi.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
              { label: 'Tab 3', icon: 'Home3Line', id: 'tab3', disabled: true },
              {
                label: 'Tab 4',
                icon: 'Home3Line',
                id: 'tab4',
                onCloseClick: cb,
              },
              { label: 'Tab 5', icon: 'Home3Line', id: 'tab5' },
            ]}
            onTabChange={cb}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelectorAll('.reqore-tabs-list-item-close')[0]);

  expect(cb).toHaveBeenCalledWith('tab4');
  expect(screen.getByText('Tab 1 content')).toBeTruthy();
});

test('Overflow "More" menu is capped to a viewport-safe height by default', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs _testWidth={300} tabs={overflowingTabs as any}>
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(document.querySelector('.reqore-tabs-list-item-menu')!);

  const overflowMenu = document.querySelector('.reqore-menu') as HTMLElement;
  expect(overflowMenu).toBeTruthy();

  // Overscroll containment is tied to the concrete menu element so a long
  // overflow menu can't scroll the page behind it.
  expect(getComputedStyle(overflowMenu).overscrollBehavior).toBe('contain');

  // The generated rule caps the menu height to the viewport-safe default.
  const styles = getStyleText();
  expect(styles).toContain('min(520px');
  expect(styles).toContain('calc(100vh - 96px)');
});

test('overflowMenuProps overrides the default overflow-menu height', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            _testWidth={300}
            tabs={overflowingTabs as any}
            overflowMenuProps={{ maxHeight: '111px' }}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(document.querySelector('.reqore-tabs-list-item-menu')!);

  // Assert on the concrete element (not the module-global stylesheet, which
  // accumulates the default rule from other tests): the caller's value wins
  // over the built-in default.
  const overflowMenu = document.querySelector('.reqore-menu') as HTMLElement;
  expect(getComputedStyle(overflowMenu).maxHeight).toBe('111px');
});

test('overflowMenuProps.className is forwarded to the overflow menu', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            _testWidth={300}
            tabs={overflowingTabs as any}
            overflowMenuProps={{ className: 'custom-overflow-menu' }}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.mouseEnter(document.querySelector('.reqore-tabs-list-item-menu')!);

  const overflowMenu = document.querySelector('.custom-overflow-menu');
  expect(overflowMenu).toBeTruthy();
  expect(overflowMenu?.classList.contains('reqore-menu')).toBe(true);
});

test('overflowPopoverProps overrides the popover trigger behaviour', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            _testWidth={300}
            tabs={overflowingTabs as any}
            overflowPopoverProps={{ handler: 'click' }}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  const trigger = document.querySelector('.reqore-tabs-list-item-menu')!;

  // Default handler is 'hoverStay'; overriding to 'click' means hovering must
  // no longer open the menu.
  fireEvent.mouseEnter(trigger);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.click(trigger);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu').length).toBe(1);
});

test('hideTabsList suppresses the strip while still rendering the active tab content', () => {
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            hideTabsList
            activeTab='tab2'
            tabs={[
              { label: 'Tab 1', icon: 'Home3Line', id: 'tab1' },
              { label: 'Tab 2', icon: 'Home3Line', id: 'tab2' },
            ]}
          >
            <ReqoreTabsContent tabId='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent tabId='tab2'>Tab 2 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  // The strip and every list item are gone — hideTabsList short-circuits the
  // whole list render, not just its visibility (so `display: none`-style CSS
  // hacks in consumers are unnecessary).
  expect(document.querySelectorAll('.reqore-tabs-list').length).toBe(0);
  expect(document.querySelectorAll('.reqore-tabs-list-item').length).toBe(0);
  // The active tab's content is still rendered exactly as if the strip were
  // there, so consumers can drive the active tab from a parent state.
  expect(screen.getByText('Tab 2 content')).toBeTruthy();
  // The outer container class is preserved so height / flex rules on
  // `.reqore-tabs` still apply.
  expect(document.querySelectorAll('.reqore-tabs').length).toBe(1);
});
