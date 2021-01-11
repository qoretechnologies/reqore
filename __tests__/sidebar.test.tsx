import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import QorusSidebar from '../src/components/Sidebar';
import { qorusSidebarItems } from '../src/mock/menu';

test('Renders sidebar', () => {
  render(<QorusSidebar items={qorusSidebarItems} path='/' />);

  expect(document.querySelectorAll('.sidebarItem').length).toBe(7);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(3);
});

test('Sidebar can be collapsed', () => {
  const handleClick = jest.fn();

  render(
    <QorusSidebar
      items={qorusSidebarItems}
      path='/'
      onCollapseChange={handleClick}
    />
  );

  expect(document.querySelectorAll('.expanded').length).toBe(1);

  fireEvent.click(screen.getByText('Collapse'));

  expect(handleClick).toHaveBeenCalledTimes(1);

  expect(document.querySelectorAll('.expanded').length).toBe(0);
});

test('Can open submenu manually', () => {
  render(<QorusSidebar items={qorusSidebarItems} path='/' />);

  fireEvent.click(screen.getByText('Menu item 3'));

  expect(document.querySelectorAll('.sidebarItem').length).toBe(10);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(3);
});

test('Submenu opens automatically if path matches', () => {
  render(<QorusSidebar items={qorusSidebarItems} path='/item-3/item-1' />);

  expect(document.querySelectorAll('.sidebarItem').length).toBe(10);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(3);
  expect(document.querySelectorAll('.active').length).toBe(2);
});

test('Bookmarks can be added and removed', () => {
  const handleBookmarksChange = jest.fn();

  render(
    <QorusSidebar
      items={qorusSidebarItems}
      path='/'
      onBookmarksChange={handleBookmarksChange}
    />
  );

  const addBookmarkButton = document.querySelector('.favorite');

  fireEvent.click(addBookmarkButton);

  expect(handleBookmarksChange).toHaveBeenCalledWith(['menu-item-1']);
  expect(document.querySelectorAll('.sidebarItem').length).toBe(7);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(4);

  const removeBookmarkButton = document.querySelector('.favorite');

  fireEvent.click(removeBookmarkButton);

  expect(handleBookmarksChange).toHaveBeenCalledWith([]);

  expect(document.querySelectorAll('.sidebarItem').length).toBe(7);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(3);
});

test('Renders item as <p> element with onClick', () => {
  const handleItemClick = jest.fn();

  render(
    <QorusSidebar
      items={{
        ...qorusSidebarItems,
        TestItems: {
          title: 'TestItems',
          items: [
            {
              name: 'Test',
              as: 'p',
              onClick: handleItemClick,
              id: 'test-item-1',
              icon: 'add',
            },
          ],
        },
      }}
      path='/'
    />
  );

  const menuItem = document.querySelector('p.sidebarItem');

  expect(menuItem).toBeTruthy();

  fireEvent.click(menuItem);

  expect(handleItemClick).toHaveBeenCalled();

  expect(document.querySelectorAll('.sidebarItem').length).toBe(8);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(4);
});

test('Renders custom item at the top', () => {
  render(
    <QorusSidebar
      items={qorusSidebarItems}
      path='/'
      customItems={[{ element: () => <span>Hello, I am a custom item!</span> }]}
    />
  );

  expect(document.querySelectorAll('.sidebarItem').length).toBe(7);
  expect(document.querySelectorAll('.sidebarSection').length).toBe(4);
  expect(screen.getByText('Hello, I am a custom item!')).toBeTruthy();
});
