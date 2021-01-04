import { Icon, Position, Tooltip } from '@blueprintjs/core';
import classnames from 'classnames';
import map from 'lodash/map';
import { darken } from 'polished';
import * as React from 'react';
import { useMount } from 'react-use';
import styled, { css } from 'styled-components';
import { PRIMARY_DARK, PRIMARY_LIGHT } from '../../constants/colors';
import { isActiveMulti } from '../../helpers/sidebar';

export interface SidebarItemProps {
  itemData: any;
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
  isLight?: boolean;
  sectionName: string;
}

const StyledDivider = styled.div<{ isLight?: boolean }>`
  min-height: 5px;
  width: 100%;
  margin: 6px 0;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;

  &:first-child {
    margin-top: 0;
    padding: 2px;
  }

  &:last-child {
    margin-bottom: 0;
  }

  ${({ isLight }) =>
    isLight
      ? css`
          background-color: ${darken(0.12, PRIMARY_LIGHT)};
        `
      : css`
          background-color: ${darken(0.08, PRIMARY_DARK)};
        `}
`;

const SidebarItemTooltip: Function = ({
  isCollapsed,
  tooltip,
  children,
}: SidebarItemProps) =>
  isCollapsed ? (
    <Tooltip content={tooltip} position={Position.RIGHT}>
      {children}
    </Tooltip>
  ) : (
    <>{children}</>
  );

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
}: SidebarItemProps) => {
  const Link = itemData.as || 'div';

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
      {!itemData.submenu ? (
        <Link
          to={itemData.link}
          className='sidebarLink'
          onClick={itemData.onClick}
        >
          <SidebarItemTooltip
            isCollapsed={isCollapsed}
            tooltip={getItemName(itemData.name)}
          >
            <div
              className={classnames('sidebarItem', {
                sidebarSubItem: subItem,
                active: isActive,
              })}
            >
              <Icon icon={itemData.icon} />{' '}
              {!isCollapsed && getItemName(itemData.name)}
              {!isCollapsed && (
                <>
                  {sectionName === '_bookmarks' ? (
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
              )}
            </div>
          </SidebarItemTooltip>
        </Link>
      ) : (
        <SidebarItemTooltip
          isCollapsed={isCollapsed}
          tooltip={getItemName(itemData.name)}
        >
          <div
            className={classnames('sidebarItem', {
              sidebarSubItem: subItem,
              active: isActive,
              submenuCategory: !!onSectionToggle,
            })}
            onClick={() => {
              onSectionToggle(itemData.name);
            }}
          >
            <Icon icon={itemData.icon} />{' '}
            {!isCollapsed && getItemName(itemData.name)}
            {!!onSectionToggle && (
              <Icon
                icon={isExpanded ? 'caret-up' : 'caret-down'}
                className='submenuExpand'
              />
            )}
          </div>
        </SidebarItemTooltip>
      )}
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
  isLight,
  sectionName,
}: SidebarItemProps) => {
  useMount(() => {
    if (
      !itemData.customElement &&
      isActiveMulti(
        itemData.activePaths || [itemData.link],
        currentPath,
        itemData.exact
      )
    ) {
      onSectionToggle(itemData.name);
    }
  });

  if (itemData.customElement) {
    const { customElement: Element, customElementProps } = itemData;

    return <Element {...customElementProps} isCollapsed={isCollapsed} />;
  }

  if (itemData.divider) {
    return (
      <StyledDivider isLight={isLight}>
        {!isCollapsed ? itemData.content || '' : ''}
      </StyledDivider>
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
          />
        ))}
    </>
  );
};

export default SidebarItemWrapper;
