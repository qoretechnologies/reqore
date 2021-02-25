import { IQorusSidebarItems } from '../components/Sidebar';

export const qorusSidebarItems: IQorusSidebarItems = {
  Menu: {
    title: 'Menu',
    items: [
      {
        name: 'Menu item 1',
        as: 'a',
        props: {
          href: '/item-1',
        },
        icon: 'Home3Line',
        id: 'menu-item-1',
      },
      {
        name: 'Menu item 2',
        as: 'a',
        props: {
          href: '/item-2',
        },
        icon: 'Settings4Fill',
        id: 'menu-item-2',
      },
      {
        name: 'Menu item 3',
        icon: 'File3Line',
        id: 'menu-item-3',
        activePaths: ['/item-3'],
        submenu: [
          {
            name: 'Submenu item 1',
            as: 'a',
            props: {
              href: '/item-3/item-1',
            },
            icon: 'NodeTree',
            id: 'submenu-item-1',
          },
          {
            name: 'Submenu item 2',
            as: 'a',
            props: {
              href: '/item-3/item-2',
            },
            icon: 'Chat3Fill',
            id: 'submenu-item-2',
          },
          {
            name: 'Super really long Submenu item 3',
            as: 'a',
            props: {
              href: '/item-3/item-3',
            },
            icon: 'DatabaseFill',
            id: 'submenu-item-3',
          },
        ],
      },
    ],
  },
  Menu2: {
    items: [
      {
        name: 'Super Long Really Another item 1',
        as: 'a',
        props: {
          href: '/another-item-1',
        },
        icon: 'Home6Line',
        id: 'another-item-1',
      },
      {
        name: 'Another item 2',
        as: 'a',
        props: {
          href: '/another-item-2',
        },
        icon: 'TableFill',
        id: 'another-item-2',
      },
      {
        name: 'Another item 3',
        as: 'a',
        props: {
          onClick: () => {
            alert('Click');
          },
        },
        icon: 'BellLine',
        id: 'another-item-3',
      },
    ],
  },
};
