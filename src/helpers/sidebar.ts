import { reduce, size } from 'lodash';

export const transformMenu: Function = (menu, favoriteItems: any[]): Object => {
  let newMenu = { ...menu };
  const { _customElements } = newMenu;
  const favorites = [];

  if (size(favoriteItems)) {
    newMenu = reduce(
      newMenu,
      (cur, menuSection, name: string) => {
        let newSection = [...menuSection];

        newSection = newSection
          .map((newSectionItem) => {
            const copySectionItem = { ...newSectionItem };

            if (copySectionItem.submenu) {
              copySectionItem.submenu = copySectionItem.submenu.filter(
                (submenuItem) => {
                  const isItemInSubmenu = favoriteItems.find(
                    (favoriteItem) => favoriteItem === submenuItem.id
                  );

                  if (isItemInSubmenu) {
                    favorites.push(submenuItem);
                  }

                  return !isItemInSubmenu;
                }
              );

              if (size(copySectionItem.submenu)) {
                return copySectionItem;
              }
            } else {
              if (
                !favoriteItems.find(
                  (favoriteItem) => favoriteItem === copySectionItem.id
                )
              ) {
                return copySectionItem;
              } else {
                favorites.push(copySectionItem);
              }
            }
          })
          .filter((newSectionItem) => newSectionItem);

        return { ...cur, [name]: newSection };
      },
      {}
    );

    favorites.unshift({
      divider: true,
      content: 'Bookmarks',
    });

    favorites.push({
      divider: true,
    });

    newMenu = { _customElements, _bookmarks: favorites, ...newMenu };
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
