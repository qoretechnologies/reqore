import { Icon, Position, Tooltip } from '@blueprintjs/core';
import classnames from 'classnames';
import map from 'lodash/map';
import * as React from 'react';
import { useMount } from 'react-use';
import { IQorusSidebarItem } from '.';
import { isActiveMulti } from '../../helpers/sidebar';

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

  return isCollapsed ? (
    <Tooltip
      content={itemData.name}
      position={Position.RIGHT}
      wrapperTagName='div'
      className={isSubitem ? 'reqore-sidebar-subitem' : 'reqore-sidebar-item'}
      targetProps={{
        //@ts-ignore
        to: itemData.link,
        onClick: itemData.onClick || onClick,
        role: 'qorus-sidebar-item',
      }}
      targetClassName={classnames('sidebarItem', 'sidebarLink', {
        sidebarSubItem: isSubitem,
        active: isActive,
        submenuCategory: isSubcategory,
      })}
      //@ts-ignore
      targetTagName={Element}
    >
      <>{children}</>
    </Tooltip>
  ) : (
    //@ts-ignore
    <Element
      role='qorus-sidebar-item'
      className={classnames('sidebarItem', 'sidebarLink', {
        sidebarSubItem: isSubitem,
        active: isActive,
        submenuCategory: isSubcategory,
      })}
      onClick={itemData.onClick || onClick}
      to={itemData.link}
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

    //@ts-ignore
    return <Element isCollapsed={isCollapsed} />;
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
