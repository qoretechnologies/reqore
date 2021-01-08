import { Icon, IconName, MaybeElement } from '@blueprintjs/core';
import classnames from 'classnames';
import map from 'lodash/map';
import { darken, lighten } from 'polished';
import React, { useState } from 'react';
import Scroll from 'react-scrollbar';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { PRIMARY_DARK, PRIMARY_LIGHT, PURPLE } from '../../constants/colors';
import { transformMenu } from '../../helpers/sidebar';
import SidebarItem from './item';

export interface IQorusSidebarCustomItem {
  element: React.FC<any>;
}

export interface IQorusSidebarItems {
  [sectionId: string]: {
    title?: string | undefined;
    items: IQorusSidebarItem[];
  };
}

export interface IQorusSidebarItem {
  name: string;
  link?: string;
  activePaths?: string[];
  onClick?: () => any;
  submenu?: IQorusSidebarItem[];
  id: string;
  as?: React.ElementType | keyof JSX.IntrinsicElements;
  icon?: IconName | MaybeElement;
  exact?: boolean;
  element?: React.ElementType;
}

export interface IQorusSidebarProps {
  isCollapsed?: boolean;
  isLight?: boolean;
  onCollapseChange?: (isCollapsed?: boolean) => void;
  items: IQorusSidebarItems;
  bookmarks?: string[];
  customItems?: IQorusSidebarCustomItem[];
  collapseLabel?: string;
  path: string;
  wrapperStyle?: React.CSSProperties;
  onBookmarksChange?: (bookmarks: string[]) => void;
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

    .sidebarItem,
    .bp3-popover-wrapper {
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

    .sidebarItem,
    .bp3-popover-wrapper {
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

    .sidebarItem,
    .bp3-popover-wrapper {
      &:not(:first-child) {
        border-top: 1px solid;
      }
    }

    .sidebarItem {
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

const StyledDivider = styled.div<{ isLight?: boolean }>`
  width: 100%;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;

  &:first-child {
    margin-top: 0;
    padding: 1px;
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

const QorusSidebar: React.FC<IQorusSidebarProps> = ({
  isCollapsed,
  isLight,
  onCollapseChange,
  path,
  items,
  bookmarks,
  customItems,
  collapseLabel,
  wrapperStyle,
  onBookmarksChange,
}) => {
  const [_isCollapsed, setIsCollapsed] = useState<boolean>(
    isCollapsed || false
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [_bookmarks, setBookmarks] = useState<string[]>(bookmarks || []);

  useUpdateEffect(() => {
    if (onBookmarksChange) {
      onBookmarksChange(_bookmarks);
    }
  }, [_bookmarks]);

  const handleSectionToggle: (sectionId: string) => void = (sectionId) => {
    setExpandedSection((currentExpandedSection) =>
      sectionId === currentExpandedSection ? null : sectionId
    );
  };

  const handleFavoriteClick = (id: string) => {
    setBookmarks((current) => {
      return [...current, id];
    });
  };

  const handleUnfavoriteClick = (id: string) => {
    setBookmarks((current) => {
      return [...current].filter((item) => item !== id);
    });
  };

  const menu: IQorusSidebarItems = transformMenu(
    items,
    _bookmarks,
    customItems
  );

  return (
    <StyledSidebar
      className={classnames('sidebar', isLight ? 'light' : 'dark', {
        expanded: !_isCollapsed,
      })}
      style={wrapperStyle}
      role='qorus-sidebar-wrapper'
    >
      <Scroll horizontal={false} className='sidebarScroll'>
        {map(menu, ({ title, items }, sectionId: string) => (
          <div
            className='sidebarSection'
            key={sectionId}
            role='qorus-sidebar-section-title'
          >
            <StyledDivider isLight={isLight}>
              {!_isCollapsed ? title || '' : ''}
            </StyledDivider>
            {map(items, (itemData, key) => (
              <SidebarItem
                itemData={itemData}
                key={key}
                isCollapsed={_isCollapsed}
                expandedSection={expandedSection}
                onSectionToggle={handleSectionToggle}
                bookmarks={bookmarks}
                currentPath={path}
                onFavoriteClick={handleFavoriteClick}
                onUnfavoriteClick={handleUnfavoriteClick}
                isLight={isLight}
                sectionName={sectionId}
                hasFavorites={!!onBookmarksChange}
              />
            ))}
          </div>
        ))}
      </Scroll>
      <div className='sidebarSection' id='menuCollapse'>
        <StyledDivider isLight={isLight} />

        <div
          role='qorus-sidebar-collapse-button'
          className='sidebarItem'
          onClick={() => {
            setIsCollapsed(!_isCollapsed);

            if (onCollapseChange) {
              onCollapseChange(!_isCollapsed);
            }
          }}
        >
          <Icon
            icon={_isCollapsed ? 'double-chevron-right' : 'double-chevron-left'}
          />{' '}
          {!_isCollapsed && (collapseLabel || 'Collapse')}
        </div>
      </div>
    </StyledSidebar>
  );
};

export default QorusSidebar;
