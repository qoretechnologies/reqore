import { Icon, IconName, MaybeElement } from '@blueprintjs/core';
import classnames from 'classnames';
import map from 'lodash/map';
import { darken } from 'polished';
import React, { useState } from 'react';
import Scroll from 'react-scrollbar';
import { useUpdateEffect } from 'react-use';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getMainColor, getReadableColor } from '../../helpers/colors';
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
  as?: JSX.Element | string;
  icon?: IconName | MaybeElement;
  exact?: boolean;
  element?: JSX.Element;
}

export interface IQorusSidebarProps {
  isCollapsed?: boolean;
  onCollapseChange?: (isCollapsed?: boolean) => void;
  items: IQorusSidebarItems;
  bookmarks?: string[];
  customItems?: IQorusSidebarCustomItem[];
  collapseLabel?: string;
  path: string;
  wrapperStyle?: React.CSSProperties;
  onBookmarksChange?: (bookmarks: string[]) => void;
}

const StyledSidebar = styled.div<{ expanded?: boolean; theme: IReqoreTheme }>`
  // 80px is header + footer
  height: 100%;
  font-size: 14px;
  display: flex;
  flex-flow: column;
  color: ${({ theme }) =>
    theme.sidebar?.color ||
    getReadableColor(
      getMainColor(theme, 'sidebar'),
      undefined,
      undefined,
      true
    )};
  background-color: ${({ theme }) => theme.sidebar?.main || theme.main};
  border-right: 1px solid
    ${({ theme }) =>
      theme.sidebar?.border || darken(0.1, getMainColor(theme, 'sidebar'))};

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

    .sidebarItem.active {
      color: ${({ theme }) =>
        theme.sidebar?.item?.activeColor ||
        theme.sidebar?.item?.color ||
        getReadableColor(getMainColor(theme, 'sidebar'), undefined, undefined)};

      background-color: ${({ theme }) =>
        theme.sidebar?.item?.activeBackground ||
        theme.sidebar?.item?.background ||
        darken(0.08, getMainColor(theme, 'sidebar'))};

      span.bp3-icon:not(.favorite) {
        color: ${({ theme }) =>
          theme.sidebar?.icon?.activeColor ||
          theme.sidebar?.icon?.color ||
          theme.sidebar?.item?.activeColor ||
          theme.sidebar?.item?.color ||
          'inherit'};
      }
    }

    .sidebarSubItem.active {
      color: ${({ theme }) =>
        theme.sidebar?.subItem?.activeColor ||
        theme.sidebar?.subItem?.color ||
        getReadableColor(getMainColor(theme, 'sidebar'), undefined, undefined)};
      background-color: ${({ theme }) =>
        theme.sidebar?.subItem?.activeBackground ||
        theme.sidebar?.subItem?.background ||
        darken(0.1, getMainColor(theme, 'sidebar'))};
      span.bp3-icon:not(.favorite) {
        color: ${({ theme }) =>
          theme.sidebar?.icon?.activeColor ||
          theme.sidebar?.icon?.color ||
          theme.sidebar?.subItem?.activeColor ||
          theme.sidebar?.subItem?.color ||
          theme.sidebar?.item?.activeColor ||
          theme.sidebar?.item?.color ||
          'inherit'};
      }
    }

    .sidebarItem {
      position: relative;

      span.bp3-icon:not(.favorite) {
        display: inline-block;
        font-size: 16px;
        color: ${({ theme }) => theme.sidebar?.icon?.color || 'inherit'};
      }

      padding: 12px;
    }

    .sidebarItem,
    .bp3-popover-wrapper.reqore-sidebar-item {
      color: ${({ theme }) => theme.sidebar?.item?.color || 'inherit'};

      background-color: ${({ theme }) =>
        theme.sidebar?.item?.background || getMainColor(theme, 'sidebar')};

      &:not(:first-child) {
        border-top: 1px solid
          ${({ theme }) =>
            theme.sidebar?.item?.border ||
            darken(0.05, getMainColor(theme, 'sidebar'))};
      }

      &:hover {
        color: ${({ theme }) =>
          theme.sidebar?.item?.hoverColor ||
          theme.sidebar?.item?.color ||
          'inherit'};
        background-color: ${({ theme }) =>
          theme.sidebar?.item?.hoverBackground ||
          theme.sidebar?.item?.background ||
          darken(0.03, getMainColor(theme, 'sidebar'))};

        span.bp3-icon:not(.favorite) {
          color: ${({ theme }) =>
            theme.sidebar?.icon?.hoverColor ||
            theme.sidebar?.icon?.color ||
            theme.sidebar?.item?.hoverColor ||
            theme.sidebar?.item?.color ||
            'inherit'};
        }
      }
    }

    .sidebarSubItem {
      border-left: 5px solid
        ${({ theme }) =>
          theme.sidebar?.subItem?.border ||
          darken(0.08, getMainColor(theme, 'sidebar'))};
    }

    .sidebarSubItem,
    .bp3-popover-wrapper.reqore-sidebar-subitem {
      color: ${({ theme }) => theme.sidebar?.subItem?.color || 'inherit'};

      background-color: ${({ theme }) =>
        theme.sidebar?.subItem?.background ||
        darken(0.05, getMainColor(theme, 'sidebar'))};

      &:not(:first-child) {
        border-top: 1px solid
          ${({ theme }) =>
            theme.sidebar?.subItem?.border ||
            darken(0.07, getMainColor(theme, 'sidebar'))};
      }

      &:hover {
        color: ${({ theme }) =>
          theme.sidebar?.subItem?.hoverColor ||
          theme.sidebar?.subItem?.color ||
          'inherit'};
        background-color: ${({ theme }) =>
          theme.sidebar?.subItem?.hoverBackground ||
          theme.sidebar?.subItem?.background ||
          darken(0.08, getMainColor(theme, 'sidebar'))};

        span.bp3-icon:not(.favorite) {
          color: ${({ theme }) =>
            theme.sidebar?.icon?.hoverColor ||
            theme.sidebar?.icon?.color ||
            theme.sidebar?.subItem?.hoverColor ||
            theme.sidebar?.subItem?.color ||
            'inherit'};
        }
      }
    }

    .sidebarItem,
    .sidebarSubItem {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }
  }
`;

const StyledDivider = styled.div<{ theme?: any }>`
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

  background-color: ${({ theme }) =>
    theme.sidebar?.section?.background ||
    darken(0.15, getMainColor(theme, 'sidebar'))};
  color: inherit;
`;

const QorusSidebar: React.FC<IQorusSidebarProps> = ({
  isCollapsed,
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
    <ReqoreThemeProvider>
      <StyledSidebar
        className={classnames('sidebar', {
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
              <StyledDivider>{!_isCollapsed ? title || '' : ''}</StyledDivider>
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
                  sectionName={sectionId}
                  hasFavorites={!!onBookmarksChange}
                />
              ))}
            </div>
          ))}
        </Scroll>
        <div className='sidebarSection' id='menuCollapse'>
          <StyledDivider />

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
              icon={
                _isCollapsed ? 'double-chevron-right' : 'double-chevron-left'
              }
            />{' '}
            {!_isCollapsed && (collapseLabel || 'Collapse')}
          </div>
        </div>
      </StyledSidebar>
    </ReqoreThemeProvider>
  );
};

export default QorusSidebar;
