import { Icon } from '@blueprintjs/core';
import classnames from 'classnames';
import map from 'lodash/map';
import { darken, lighten } from 'polished';
import React, { useState } from 'react';
import Scroll from 'react-scrollbar';
import { useUpdateEffect } from 'react-use';
import styled from 'styled-components';
import { PRIMARY_DARK, PRIMARY_LIGHT, PURPLE } from '../../constants/colors';
import { transformMenu } from '../../helpers/sidebar';
import SidebarItem from './item';

export interface IQorusSidebarProps {
  isDefaultCollapsed?: boolean;
  isLight?: boolean;
  onMenuToggle?: (isToggled?: boolean) => any;
  menuData: any;
  favoriteItems?: any;
  collapseTitle?: string;
  path: string;
  wrapperStyle?: React.CSSProperties;
  onFavoritesChange?: (items: any[]) => void;
}

const StyledSidebar = styled.div<{ expanded?: boolean }>`
  // 80px is header + footer
  height: 100%;
  font-size: 14px;
  display: flex;
  flex-flow: column;

  // Custom scrollbar
  .sidebarScroll {
    flex: 1;
  }

  &.expanded {
    min-width: 180px !important;
    max-width: 180px !important;

    .sidebarItem {
      text-align: left;

      span.bp3-icon {
        margin-right: 10px;
        vertical-align: text-bottom;
      }

      .submenuExpand {
        margin-left: 10px;
      }

      &:hover {
        .favorite {
          display: block;
        }
      }
    }

    .sidebarSubItem {
      padding-left: 24px;
    }

    .favorite {
      display: none;
      opacity: 0.6;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 10px;

      &:hover {
        opacity: 1;
      }
    }
  }

  &:not(.expanded) {
    min-width: 50px !important;
    max-width: 50px !important;
    .sidebarItem {
      text-align: center;
    }
  }

  &.dark {
    background-color: ${PRIMARY_DARK};
    border-right: 1px solid ${darken(0.02, PRIMARY_DARK)};
    color: #bfccd6;

    .sidebarSection {
      border-top-color: ${darken(0.05, PRIMARY_DARK)} !important;
    }

    .sidebarItem {
      border-top-color: ${darken(0.02, PRIMARY_DARK)} !important;
    }

    .sidebarSubItem {
      background-color: ${lighten(0.07, PRIMARY_DARK)};
      border-left: 5px solid #bfccd6;
    }

    .sidebarItem:hover {
      background-color: ${lighten(0.04, PRIMARY_DARK)};
    }

    .sidebarSubItem.active,
    .sidebarItem.active {
      color: #fff;
      border-left-color: #fff;
      background-color: ${lighten(0.03, PRIMARY_DARK)};
    }
  }

  &.light {
    background-color: #fff;
    border-right: 1px solid ${darken(0.06, PRIMARY_LIGHT)};
    color: #555;

    .sidebarSection {
      border-top-color: ${darken(0.07, PRIMARY_LIGHT)} !important;
    }

    .sidebarItem {
      border-top-color: ${darken(0.06, PRIMARY_LIGHT)} !important;
    }

    .sidebarSubItem {
      background-color: ${darken(0.04, PRIMARY_LIGHT)};
      border-left: 5px solid #555;
    }

    .sidebarItem:hover {
      background-color: ${darken(0.03, PRIMARY_LIGHT)};
    }

    .sidebarSubItem.active,
    .sidebarItem.active {
      color: ${PURPLE};
      border-left-color: ${PURPLE};
      background-color: ${darken(0.05, PRIMARY_LIGHT)};
    }
  }

  // Section
  .sidebarSection {
    &:not(:first-child) {
      border-top: 1.5px solid;
    }

    .sidebarLink {
      display: inline-block;
      color: inherit;
      width: 100%;

      .bp3-popover-target {
        width: 100%;
      }

      &:hover {
        text-decoration: none;
      }
    }

    .sidebarItem {
      &:not(:first-child) {
        border-top: 1px solid;
      }
      position: relative;

      span.bp3-icon:not(.favorite) {
        display: inline-block;
        font-size: 16px;
      }

      padding: 12px;
    }

    .sidebarItem,
    .sidebarSubItem {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
  }
`;

const QorusSidebar: React.FC<IQorusSidebarProps> = ({
  isDefaultCollapsed,
  isLight,
  onMenuToggle,
  path,
  menuData,
  favoriteItems,
  collapseTitle,
  wrapperStyle,
  onFavoritesChange,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    isDefaultCollapsed || false
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [_fav, setFav] = useState<any>(favoriteItems || []);

  useUpdateEffect(() => {
    onFavoritesChange(_fav);
  }, [_fav]);

  const handleSectionToggle: (sectionId: string) => void = (sectionId) => {
    setExpandedSection((currentExpandedSection) =>
      sectionId === currentExpandedSection ? null : sectionId
    );
  };

  const handleFavoriteClick = (id: string) => {
    setFav((current) => {
      return [...current, id];
    });
  };

  const handleUnfavoriteClick = (id: string) => {
    setFav((current) => {
      return [...current].filter((item) => item !== id);
    });
  };

  const menu = transformMenu(menuData, favoriteItems);

  return (
    <StyledSidebar
      className={classnames('sidebar', isLight ? 'light' : 'dark', {
        expanded: !isCollapsed,
      })}
      style={wrapperStyle}
    >
      <Scroll horizontal={false} className='sidebarScroll'>
        {map(menu, (menuData: Array<Object>, menuKey: string) => (
          <div className='sidebarSection' key={menuKey}>
            {map(menuData, (itemData: Object, key: number) => (
              <SidebarItem
                itemData={itemData}
                key={key}
                isCollapsed={isCollapsed}
                expandedSection={expandedSection}
                onSectionToggle={handleSectionToggle}
                favoriteItems={favoriteItems}
                currentPath={path}
                onFavoriteClick={handleFavoriteClick}
                onUnfavoriteClick={handleUnfavoriteClick}
                isLight={isLight}
                sectionName={menuKey}
              />
            ))}
          </div>
        ))}
      </Scroll>
      <div className='sidebarSection' id='menuCollapse'>
        <div
          className='sidebarItem'
          onClick={() => {
            setIsCollapsed(!isCollapsed);

            if (onMenuToggle) {
              onMenuToggle(!isCollapsed);
            }
          }}
        >
          <Icon
            icon={isCollapsed ? 'double-chevron-right' : 'double-chevron-left'}
          />{' '}
          {!isCollapsed && (collapseTitle || 'Collapse')}
        </div>
      </div>
    </StyledSidebar>
  );
};

export default QorusSidebar;
