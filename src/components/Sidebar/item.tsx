import { Icon } from '@blueprintjs/core';
import classnames from 'classnames';
import map from 'lodash/map';
import React, { useContext, useState } from 'react';
import { useMount } from 'react-use';
import { IQorusSidebarItem } from '.';
import { IReqoreTheme } from '../../constants/theme';
import ThemeContext from '../../context/ThemeContext';
import { getMainColor, getReadableColor } from '../../helpers/colors';
import { isActiveMulti } from '../../helpers/sidebar';
import useSimplePopover from '../../hooks/useSimplePopover';

export interface SidebarItemProps {
  itemData: IQorusSidebarItem;
  isCollapsed: boolean;
  subItem: boolean;
  onSectionToggle: (sectionId: string) => any;
  isExpanded: boolean;
  isActive: boolean;
  tooltip: string;
  children: any;
  expandedSection: string;
  onFavoriteClick?: Function;
  onUnfavoriteClick?: Function;
  favoriteItems?: any;
  formatItemName?: (itemName: string) => string;
  currentPath: string;
  sectionName: string;
  hasFavorites: boolean;
}

export interface ISidebarTooltipProps {
  isCollapsed?: boolean;
  children: any;
  itemData: IQorusSidebarItem;
  isActive: boolean;
  isSubcategory: boolean;
  isSubitem: boolean;
  onClick: any;
}

const SidebarItemTooltip: Function = ({
  isCollapsed,
  children,
  itemData,
  isActive,
  isSubitem,
  isSubcategory,
  onClick,
}: ISidebarTooltipProps) => {
  const Element = itemData.as || 'div';
  const [refElement, setRefElement] = useState(null);
  const hoverPopover = useSimplePopover(
    refElement,
    itemData.name,
    'hover',
    'right'
  );

  return (
    //@ts-ignore
    <Element
      ref={setRefElement}
      role='qorus-sidebar-item'
      className={classnames('sidebarItem', 'sidebarLink', {
        sidebarSubItem: isSubitem,
        active: isActive,
        submenuCategory: isSubcategory,
      })}
      onClick={itemData.onClick || onClick}
      to={itemData.link}
      {...(isCollapsed ? hoverPopover : {})}
    >
      {children}
    </Element>
  );
};

const SidebarItem: Function = ({
  itemData,
  isCollapsed,
  subItem,
  onSectionToggle,
  isExpanded,
  onFavoriteClick,
  onUnfavoriteClick,
  formatItemName,
  currentPath,
  sectionName,
  hasFavorites,
}: SidebarItemProps) => {
  const handleFavoriteClick = (event) => {
    event.stopPropagation();

    if (onFavoriteClick) {
      onFavoriteClick(itemData.id);
    }
  };

  const handleUnfavoriteClick = (event) => {
    event.stopPropagation();

    if (onUnfavoriteClick) {
      onUnfavoriteClick(itemData.id);
    }
  };

  const isActive = isActiveMulti(
    itemData.activePaths || [itemData.link],
    currentPath,
    itemData.exact
  );

  const getItemName: (itemName: string) => string = (itemName) =>
    formatItemName ? formatItemName(itemName) : itemName;

  return (
    <>
      <SidebarItemTooltip
        isCollapsed={isCollapsed}
        itemData={itemData}
        isActive={isActive}
        isSubitem={subItem}
        onClick={
          onSectionToggle
            ? () => {
                onSectionToggle(itemData.name);
              }
            : undefined
        }
      >
        <Icon icon={itemData.icon} />{' '}
        {!isCollapsed && getItemName(itemData.name)}
        {itemData.submenu && (
          <Icon
            icon={isExpanded ? 'caret-up' : 'caret-down'}
            className='submenuExpand'
          />
        )}
        {!itemData.submenu && !isCollapsed && hasFavorites ? (
          <>
            {sectionName === '_qorusBookmarks' ? (
              <Icon
                intent='success'
                icon='star'
                className='favorite'
                onClick={handleUnfavoriteClick}
              />
            ) : (
              <Icon
                icon='star-empty'
                className='favorite'
                onClick={handleFavoriteClick}
              />
            )}
          </>
        ) : null}
      </SidebarItemTooltip>
    </>
  );
};

const SidebarItemWrapper: Function = ({
  itemData,
  isCollapsed,
  onSectionToggle,
  expandedSection,
  favoriteItems,
  currentPath,
  onFavoriteClick,
  onUnfavoriteClick,
  hasFavorites,
  sectionName,
}: SidebarItemProps) => {
  const theme: IReqoreTheme = useContext(ThemeContext);

  useMount(() => {
    if (
      !itemData.element &&
      isActiveMulti(
        itemData.activePaths || [itemData.link],
        currentPath,
        itemData.exact
      )
    ) {
      onSectionToggle(itemData.name);
    }
  });

  if (itemData.element) {
    const { element: Element } = itemData;

    return (
      //@ts-ignore
      <Element
        isCollapsed={isCollapsed}
        backgroundColor={theme.sidebar?.main || theme.main}
        textColor={
          theme.sidebar?.color ||
          getReadableColor(
            getMainColor(theme, 'sidebar'),
            undefined,
            undefined,
            true
          )
        }
      />
    );
  }

  return (
    <>
      <SidebarItem
        itemData={itemData}
        isCollapsed={isCollapsed}
        onSectionToggle={itemData.submenu && onSectionToggle}
        isExpanded={expandedSection === itemData.name}
        currentPath={currentPath}
        favoriteItems={favoriteItems}
        onFavoriteClick={onFavoriteClick}
        onUnfavoriteClick={onUnfavoriteClick}
        sectionName={sectionName}
        hasFavorites={hasFavorites}
      />
      {expandedSection === itemData.name &&
        map(itemData.submenu, (subItemData: any, key: number) => (
          <SidebarItem
            itemData={subItemData}
            key={key}
            isCollapsed={isCollapsed}
            subItem
            currentPath={currentPath}
            favoriteItems={favoriteItems}
            onFavoriteClick={onFavoriteClick}
            onUnfavoriteClick={onUnfavoriteClick}
            sectionName={sectionName}
            hasFavorites={hasFavorites}
          />
        ))}
    </>
  );
};

export default SidebarItemWrapper;
