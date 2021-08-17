import classnames from 'classnames';
import { size } from 'lodash';
import map from 'lodash/map';
import { darken } from 'polished';
import React, { useState } from 'react';
import Scroll from 'react-scrollbar';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreSidebarTheme, IReqoreTheme } from '../../constants/theme';
import { changeLightness, getMainColor, getReadableColor } from '../../helpers/colors';
import { transformMenu } from '../../helpers/sidebar';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';
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
  props?: any;
  activePaths?: string[];
  submenu?: IQorusSidebarItem[];
  id: string;
  as?: JSX.Element | string;
  icon?: IReqoreIconName;
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
  useNativeTitle?: boolean;
  position?: 'left' | 'right';
  collapsible?: boolean;
  bordered?: boolean;
  customTheme?: IReqoreSidebarTheme;
  flat?: boolean;
  floating?: boolean;
  hasFloatingBackdrop?: boolean;
  onCloseClick?: () => void;
  isOpen?: boolean;
}

export interface IReqoreSidebarStyle {
  expanded?: boolean;
  theme: IReqoreTheme;
  bordered?: boolean;
  position?: 'left' | 'right';
  customThemeId?: string;
  flat?: boolean;
  floating?: boolean;
  isOpen?: boolean;
}

const StyledSidebar = styled.div<IReqoreSidebarStyle>`
  // 80px is header + footer
  font-size: 14px;
  font-weight: 500;
  display: flex;
  overflow: hidden;
  flex-flow: column;
  color: ${({ theme }: IReqoreSidebarStyle) =>
    theme.sidebar?.color ||
    getReadableColor(theme, undefined, undefined, true, getMainColor(theme, 'sidebar'))};
  background-color: ${({ theme }) => theme.sidebar?.main || theme.main};

  ${({ theme, bordered, position, flat, floating }) =>
    !floating &&
    css`
      ${(position === 'left' || bordered) &&
      !flat &&
      css`
        border-right: 1px solid
          ${theme.sidebar?.border || darken(0.05, getMainColor(theme, 'sidebar'))};
      `}
      ${(position === 'right' || bordered) &&
      !flat &&
      css`
        border-left: 1px solid
          ${theme.sidebar?.border || darken(0.05, getMainColor(theme, 'sidebar'))};
      `}
    `}

  ${({ floating, flat, theme, position, isOpen }) =>
    floating
      ? css`
          position: fixed;
          top: 10px;
          ${position}: ${isOpen ? 10 : -200}px;
          bottom: 10px;
          border-radius: 10px;
          border: ${!flat
            ? `1px solid ${theme.sidebar?.border || darken(0.05, getMainColor(theme, 'sidebar'))}`
            : undefined};
        `
      : css`
          height: 100%;
        `}

  // Custom scrollbar
  .sidebarScroll {
    flex: 1;
  }

  transition: all 0.1s ease-in-out;

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
        getReadableColor(theme, undefined, undefined, false, getMainColor(theme, 'sidebar'))};

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
        getReadableColor(theme, undefined, undefined, false, getMainColor(theme, 'sidebar'))};
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
          theme.sidebar?.item?.hoverColor || theme.sidebar?.item?.color || 'inherit'};
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

          return changeLightness(color, 0.17);
        }};
    }

    .sidebarSubItem,
    .bp3-popover-wrapper.reqore-sidebar-subitem {
      color: ${({ theme }) => theme.sidebar?.subItem?.color || 'inherit'};

      background-color: ${({ theme }) =>
        theme.sidebar?.subItem?.background || darken(0.04, getMainColor(theme, 'sidebar'))};

      &:hover {
        color: ${({ theme }) =>
          theme.sidebar?.subItem?.hoverColor || theme.sidebar?.subItem?.color || 'inherit'};
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
      min-height: 50px;
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
    (hasTitle ? darken(0.02, getMainColor(theme, 'sidebar')) : getMainColor(theme, 'sidebar'))};
  color: inherit;
`;

const ReqoreSidebar: React.FC<IQorusSidebarProps> = ({
  isCollapsed,
  onCollapseChange,
  onCloseClick,
  path,
  items,
  bookmarks,
  customItems,
  collapseLabel,
  wrapperStyle,
  onBookmarksChange,
  useNativeTitle,
  position = 'left',
  collapsible = true,
  bordered,
  customTheme,
  flat,
  floating,
  hasFloatingBackdrop,
  isOpen,
}) => {
  const [_isCollapsed, setIsCollapsed] = useState<boolean>(isCollapsed || false);
  useState;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [_bookmarks, setBookmarks] = useState<string[]>(bookmarks || []);
  const theme: IReqoreTheme = useReqoreTheme('sidebar', customTheme);

  useUpdateEffect(() => {
    if (onBookmarksChange) {
      onBookmarksChange(_bookmarks);
    }
  }, [_bookmarks]);

  useUpdateEffect(() => {
    setIsCollapsed(isCollapsed);
  }, [isCollapsed]);

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

  const menu: IQorusSidebarItems = transformMenu(items, _bookmarks, customItems);

  return (
    <StyledSidebar
      className={classnames('sidebar', {
        expanded: !_isCollapsed,
      })}
      style={wrapperStyle}
      role='qorus-sidebar-wrapper'
      position={position}
      bordered={bordered}
      theme={theme}
      flat={flat}
      floating={floating}
      isOpen={isOpen}
    >
      <Scroll horizontal={false} className='sidebarScroll' key='reqore-sidebar-scroll'>
        {map(menu, ({ title, items }, sectionId: string) =>
          size(items) ? (
            <>
              {sectionId !== '_qorusCustomElements' && (
                <StyledDivider hasTitle={!!title} key={sectionId + 'title'} theme={theme}>
                  {!_isCollapsed ? title || '' : ''}
                </StyledDivider>
              )}
              <div className='sidebarSection' key={sectionId} role='qorus-sidebar-section-title'>
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
                    useNativeTitle={useNativeTitle}
                  />
                ))}
              </div>
            </>
          ) : null
        )}
      </Scroll>
      <StyledDivider theme={theme} />
      {collapsible && (
        <div className='sidebarSection' id='menuCollapse'>
          <div
            role='qorus-sidebar-collapse-button'
            className='sidebarItem'
            style={{
              justifyContent: _isCollapsed
                ? 'center'
                : position === 'left'
                ? 'flex-start'
                : 'flex-end',
            }}
            onClick={() => {
              if (floating) {
                onCloseClick?.();
                return;
              }

              setIsCollapsed(!_isCollapsed);

              if (onCollapseChange) {
                onCollapseChange(!_isCollapsed);
              }
            }}
          >
            {position === 'left' && (
              <ReqoreIcon
                icon={floating ? 'CloseLine' : isCollapsed ? 'ArrowRightSLine' : 'ArrowLeftSLine'}
              />
            )}{' '}
            {!_isCollapsed && (collapseLabel || floating ? 'Close' : 'Collapse')}
            {position === 'right' && (
              <ReqoreIcon
                icon={floating ? 'CloseLine' : _isCollapsed ? 'ArrowLeftSLine' : 'ArrowRightSLine'}
              />
            )}{' '}
          </div>
        </div>
      )}
    </StyledSidebar>
  );
};

export default ReqoreSidebar;
