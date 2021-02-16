import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  ReqoreLayoutContent,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreUIProvider,
} from '../src';

test('Renders full <Tabs /> properly', () => {
  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'home', id: 'tab1' },
              { label: 'Tab 2', icon: 'home', id: 'tab2' },
              { label: 'Tab 3', icon: 'home', id: 'tab3' },
              { label: 'Tab 4', icon: 'home', id: 'tab4' },
              { label: 'Tab 5', icon: 'home', id: 'tab5' },
            ]}
          >
            <ReqoreTabsContent id='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab5'>Tab 5 content</ReqoreTabsContent>
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
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            _testWidth={300}
            tabs={[
              { label: 'Tab 1', icon: 'home', id: 'tab1' },
              { label: 'Tab 2', icon: 'home', id: 'tab2' },
              { label: 'Tab 3', icon: 'home', id: 'tab3' },
              { label: 'Tab 4', icon: 'home', id: 'tab4' },
              { label: 'Tab 5', icon: 'home', id: 'tab5' },
            ]}
          >
            <ReqoreTabsContent id='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-tabs-list-item').length).toBe(3);
  expect(
    document.querySelectorAll('.reqore-tabs-list .reqore-popover-wrapper')
      .length
  ).toBe(1);
});

test('Default active tab can be specified', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'home', id: 'tab1' },
              { label: 'Tab 2', icon: 'home', id: 'tab2' },
              { label: 'Tab 3', icon: 'home', id: 'tab3' },
              { label: 'Tab 4', icon: 'home', id: 'tab4' },
              { label: 'Tab 5', icon: 'home', id: 'tab5' },
            ]}
            activeTab='tab4'
          >
            <ReqoreTabsContent id='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(screen.getByText('Tab 4 content')).toBeTruthy();
});

test('Changes tab and runs callback', () => {
  const cb = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'home', id: 'tab1' },
              { label: 'Tab 2', icon: 'home', id: 'tab2' },
              { label: 'Tab 3', icon: 'home', id: 'tab3' },
              { label: 'Tab 4', icon: 'home', id: 'tab4' },
              { label: 'Tab 5', icon: 'home', id: 'tab5' },
            ]}
            onTabChange={cb}
          >
            <ReqoreTabsContent id='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    fireEvent.click(document.querySelectorAll('.reqore-tabs-list-item')[2]);
  });

  expect(screen.getByText('Tab 3 content')).toBeTruthy();
  expect(cb).toHaveBeenCalledWith('tab3');
  expect(
    document.querySelectorAll('.reqore-tabs-list-item__active').length
  ).toBe(1);
});

test('Does not change tab and run callback when disabled', () => {
  const cb = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreTabs
            tabs={[
              { label: 'Tab 1', icon: 'home', id: 'tab1' },
              { label: 'Tab 2', icon: 'home', id: 'tab2' },
              { label: 'Tab 3', icon: 'home', id: 'tab3', disabled: true },
              { label: 'Tab 4', icon: 'home', id: 'tab4' },
              { label: 'Tab 5', icon: 'home', id: 'tab5' },
            ]}
            onTabChange={cb}
          >
            <ReqoreTabsContent id='tab1'>Tab 1 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab2'>Tab 2 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab3'>Tab 3 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab4'>Tab 4 content</ReqoreTabsContent>
            <ReqoreTabsContent id='tab5'>Tab 5 content</ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    fireEvent.click(document.querySelectorAll('.reqore-tabs-list-item')[2]);
  });

  expect(screen.getByText('Tab 1 content')).toBeTruthy();
  expect(cb).not.toHaveBeenCalled();
  expect(
    document.querySelectorAll('.reqore-tabs-list-item__active').length
  ).toBe(1);
});
