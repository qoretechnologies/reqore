import { IQorusSidebarItems } from '../components/Sidebar';

export const qorusSidebarItems: IQorusSidebarItems = {
  Menu: {
    title: 'Menu',
    items: [
      {
        name: 'Menu item 1',
        as: 'a',
        link: '/item-1',
        icon: 'home',
        id: 'menu-item-1',
      },
      {
        name: 'Menu item 2',
        as: 'a',
        link: '/item-2',
        icon: 'cog',
        id: 'menu-item-2',
      },
      {
        name: 'Menu item 3',
        icon: 'document',
        id: 'menu-item-3',
        activePaths: ['/item-3'],
        submenu: [
          {
            name: 'Submenu item 1',
            as: 'a',
            link: '/item-3/item-1',
            icon: 'tree',
            id: 'submenu-item-1',
          },
          {
            name: 'Submenu item 2',
            as: 'a',
            link: '/item-3/item-2',
            icon: 'chat',
            id: 'submenu-item-2',
          },
          {
            name: 'Submenu item 3',
            as: 'a',
            link: '/item-3/item-3',
            icon: 'database',
            id: 'submenu-item-3',
          },
        ],
      },
    ],
  },
  Menu2: {
    items: [
      {
        name: 'Another item 1',
        as: 'a',
        link: '/another-item-1',
        icon: 'home',
        id: 'another-item-1',
      },
      {
        name: 'Another item 2',
        as: 'a',
        link: '/another-item-2',
        icon: 'cog',
        id: 'another-item-2',
      },
      {
        name: 'Another item 3',
        as: 'a',
        link: '/another-item-3',
        icon: 'document',
        id: 'another-item-3',
      },
    ],
  },
};
