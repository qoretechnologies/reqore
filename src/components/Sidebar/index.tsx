import { Icon, IconName, MaybeElement } from '@blueprintjs/core';
import classnames from 'classnames';
import { size } from 'lodash';
import map from 'lodash/map';
import { darken, lighten } from 'polished';
import React, { useState } from 'react';
import Scroll from 'react-scrollbar';
import { useUpdateEffect } from 'react-use';
import styled from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import {
  getMainColor,
  getReadableColor,
  shouldDarken,
} from '../../helpers/colors';
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

  #menuCollapse {
    border-top: 1px solid
      ${({ theme }) =>
        theme.sidebar?.item?.border ||
        darken(0.04, getMainColor(theme, 'sidebar'))};
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
    .sidebarItem,
    .sidebarSubItem {
      text-align: center;
      justify-content: center;
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

    .sidebarItem.active {
      color: ${({ theme }) =>
        theme.sidebar?.item?.activeColor ||
        theme.sidebar?.item?.color ||
        getReadableColor(getMainColor(theme, 'sidebar'), undefined, undefined)};

      background-color: ${({ theme }) =>
        theme.sidebar?.item?.activeBackground ||
        theme.sidebar?.item?.background ||
        darken(0.06, getMainColor(theme, 'sidebar'))};

      span.bp3-icon:not(.favorite) {
        color: ${({ theme }) =>
          theme.sidebar?.icon?.activeColor ||
          theme.sidebar?.item?.activeColor ||
          theme.sidebar?.icon?.color ||
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
        darken(0.08, getMainColor(theme, 'sidebar'))};
      span.bp3-icon:not(.favorite) {
        color: ${({ theme }) =>
          theme.sidebar?.icon?.activeColor ||
          theme.sidebar?.subItem?.activeColor ||
          theme.sidebar?.item?.activeColor ||
          theme.sidebar?.icon?.color ||
          theme.sidebar?.subItem?.color ||
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
            theme.sidebar?.item?.hoverColor ||
            theme.sidebar?.icon?.color ||
            theme.sidebar?.item?.color ||
            'inherit'};
        }
      }
    }

    .sidebarSubItem {
      border-left: 5px solid
        ${({ theme }) => {
          if (theme.sidebar?.subItem?.border) {
            return theme.sidebar?.subItem?.border;
          }

          const color = getMainColor(theme, 'sidebar');

          if (shouldDarken(color)) {
            return darken(0.17, color);
          }

          return lighten(0.17, color);
        }};
    }

    .sidebarSubItem,
    .bp3-popover-wrapper.reqore-sidebar-subitem {
      color: ${({ theme }) => theme.sidebar?.subItem?.color || 'inherit'};

      background-color: ${({ theme }) =>
        theme.sidebar?.subItem?.background ||
        darken(0.04, getMainColor(theme, 'sidebar'))};

      &:hover {
        color: ${({ theme }) =>
          theme.sidebar?.subItem?.hoverColor ||
          theme.sidebar?.subItem?.color ||
          'inherit'};
        background-color: ${({ theme }) =>
          theme.sidebar?.subItem?.hoverBackground ||
          theme.sidebar?.subItem?.background ||
          darken(0.06, getMainColor(theme, 'sidebar'))};

        span.bp3-icon:not(.favorite) {
          color: ${({ theme }) =>
            theme.sidebar?.icon?.hoverColor ||
            theme.sidebar?.subItem?.hoverColor ||
            theme.sidebar?.icon?.color ||
            theme.sidebar?.subItem?.color ||
            'inherit'};
        }
      }
    }

    .sidebarItem,
    .sidebarSubItem {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.2s ease-in-out;

      &.active {
        font-weight: 500;
      }
    }
  }
`;

const StyledDivider = styled.div<{ theme?: any; hasTitle?: boolean }>`
  width: 100%;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
  letter-spacing: 1.8px;
  margin-top: 0;
  padding: 8px;

  background-color: ${({ theme, hasTitle }) =>
    theme.sidebar?.section?.background ||
    (hasTitle
      ? darken(0.02, getMainColor(theme, 'sidebar'))
      : getMainColor(theme, 'sidebar'))};
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
        <Scroll
          horizontal={false}
          className='sidebarScroll'
          key='reqore-sidebar-scroll'
        >
          {map(menu, ({ title, items }, sectionId: string) =>
            size(items) ? (
              <>
                {sectionId !== '_qorusCustomElements' && (
                  <StyledDivider hasTitle={!!title} key={sectionId + 'title'}>
                    {!_isCollapsed ? title || '' : ''}
                  </StyledDivider>
                )}
                <div
                  className='sidebarSection'
                  key={sectionId}
                  role='qorus-sidebar-section-title'
                >
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
              </>
            ) : null
          )}
        </Scroll>
        <StyledDivider />
        <div className='sidebarSection' id='menuCollapse'>
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
