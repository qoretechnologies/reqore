import { reduce, size } from 'lodash';
import {
  IQorusSidebarCustomItem,
  IQorusSidebarItems,
} from '../components/Sidebar';

export const transformMenu: Function = (
  menu: IQorusSidebarItems,
  bookmarks: string[],
  customItems?: IQorusSidebarCustomItem[]
): Object => {
  let newMenu: IQorusSidebarItems = { ...menu };
  let _qorusCustomElements;
  let _qorusBookmarks;

  if (size(bookmarks)) {
    _qorusBookmarks = {
      title: 'Bookmarks',
      items: [],
    };

    newMenu = reduce(
      newMenu,
      (cur, menuSection, name: string) => {
        let newSection = { ...menuSection };

        newSection.items = [...newSection.items]
          .map((newSectionItem) => {
            const copySectionItem = { ...newSectionItem };

            if (copySectionItem.submenu) {
              copySectionItem.submenu = copySectionItem.submenu.filter(
                (submenuItem) => {
                  const isItemInSubmenu = bookmarks.find(
                    (favoriteItem) => favoriteItem === submenuItem.id
                  );

                  if (isItemInSubmenu) {
                    _qorusBookmarks.items.push(submenuItem);
                  }

                  return !isItemInSubmenu;
                }
              );

              if (size(copySectionItem.submenu)) {
                return copySectionItem;
              } else {
                return undefined;
              }
            } else {
              if (
                !bookmarks.find(
                  (favoriteItem) => favoriteItem === copySectionItem.id
                )
              ) {
                return copySectionItem;
              } else {
                _qorusBookmarks.items.push(copySectionItem);
                return undefined;
              }
            }
          })
          .filter((newSectionItem) => newSectionItem);

        return { ...cur, [name]: newSection };
      },
      {}
    );

    newMenu = { _qorusBookmarks, ...newMenu };
  }

  if (size(customItems)) {
    _qorusCustomElements = {
      items: customItems,
    };

    newMenu = { _qorusCustomElements, ...newMenu };
  }

  return newMenu;
};

export const isActive = (
  to: string,
  currentPath: string,
  exact?: boolean
): boolean => (exact ? currentPath === to : currentPath.startsWith(to));

export const isActiveMulti: Function = (
  to: string[],
  currentPath: string,
  exact?: boolean
): boolean => {
  let active: boolean = false;

  to.forEach((path: string) => {
    if (isActive(path, currentPath, exact)) {
      active = true;
    }
  });

  return active;
};
