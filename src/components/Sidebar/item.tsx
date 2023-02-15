import classnames from 'classnames';
import map from 'lodash/map';
import { useMount } from 'react-use';
import { IQorusSidebarItem } from '.';
import { ReqorePopover, useReqoreTheme } from '../..';
import { IReqoreTheme } from '../../constants/theme';
import { getMainColor, getReadableColor } from '../../helpers/colors';
import { isActiveMulti } from '../../helpers/sidebar';
import ReqoreIcon from '../Icon';

export interface SidebarItemProps {
  itemData: IQorusSidebarItem;
  isCollapsed?: boolean;
  subItem?: boolean;
  onSectionToggle?: (sectionId: string) => any;
  isExpanded?: boolean;
  isActive?: boolean;
  tooltip?: string;
  children?: any;
  expandedSection?: string;
  onFavoriteClick?: Function;
  onUnfavoriteClick?: Function;
  favoriteItems?: any;
  formatItemName?: (itemName: string) => string;
  currentPath?: string;
  sectionName?: string;
  hasFavorites?: boolean;
  useNativeTitle?: boolean;
  bookmarks?: string[];
  onClick(): void;
}

export interface ISidebarTooltipProps {
  isCollapsed?: boolean;
  children: any;
  itemData: IQorusSidebarItem;
  isActive: boolean;
  isSubcategory: boolean;
  isSubitem: boolean;
  onClick: any;
  useNativeTitle?: boolean;
}

const SidebarItemTooltip: Function = ({
  isCollapsed,
  children,
  itemData,
  isActive,
  isSubitem,
  isSubcategory,
  onClick,
  useNativeTitle,
}: ISidebarTooltipProps) => {
  const Element = itemData.as || 'div';

  if (useNativeTitle) {
    return (
      //@ts-ignore
      <Element
        {...itemData.props}
        onClick={(e) => {
          itemData.props?.onClick?.(e);
          onClick?.(e);
        }}
        className={classnames('sidebarItem', 'sidebarLink', {
          sidebarSubItem: isSubitem,
          active: isActive,
          submenuCategory: isSubcategory,
        })}
        title={itemData.name}
      >
        {children}
      </Element>
    );
  }

  return (
    //@ts-ignore
    <ReqorePopover
      component={Element}
      componentProps={{
        ...itemData.props,
        onClick: (e) => {
          itemData.props?.onClick?.(e);
          onClick?.(e);
        },
        className: classnames('sidebarItem', 'sidebarLink', {
          sidebarSubItem: isSubitem,
          active: isActive,
          submenuCategory: isSubcategory,
        }),
      }}
      content={itemData.name}
      placement='right'
      isReqoreComponent
      show={isCollapsed}
    >
      {children}
    </ReqorePopover>
  );
};

const SidebarItem = ({
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
  useNativeTitle,
  onClick,
}: SidebarItemProps) => {
  const handleFavoriteClick = (event) => {
    event.persist();
    event.stopPropagation();
    event.preventDefault();

    if (onFavoriteClick) {
      onFavoriteClick(itemData.id);
    }
  };

  const handleUnfavoriteClick = (event) => {
    event.persist();
    event.stopPropagation();
    event.preventDefault();

    if (onUnfavoriteClick) {
      onUnfavoriteClick(itemData.id);
    }
  };

  const isActive = isActiveMulti(
    itemData.activePaths || [itemData.props?.href],
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
        useNativeTitle={useNativeTitle}
        onClick={
          onSectionToggle
            ? () => {
                onSectionToggle(itemData.name);
              }
            : () => void onClick?.()
        }
      >
        <ReqoreIcon icon={itemData.icon} margin={isCollapsed ? undefined : 'right'} />{' '}
        {!isCollapsed && getItemName(itemData.name)}
        {itemData.submenu && (
          <ReqoreIcon
            icon={isExpanded ? 'ArrowUpSFill' : 'ArrowDownSFill'}
            className='submenuExpand'
          />
        )}
        {!itemData.submenu && !isCollapsed && hasFavorites ? (
          <>
            {sectionName === '_qorusBookmarks' ? (
              <ReqoreIcon
                icon='Bookmark3Fill'
                className='favorite'
                onClick={handleUnfavoriteClick}
              />
            ) : (
              <ReqoreIcon icon='Bookmark3Line' className='favorite' onClick={handleFavoriteClick} />
            )}
          </>
        ) : null}
      </SidebarItemTooltip>
    </>
  );
};

const SidebarItemWrapper = ({
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
  useNativeTitle,
  onClick,
}: SidebarItemProps) => {
  const theme: IReqoreTheme = useReqoreTheme();

  useMount(() => {
    if (
      !itemData.element &&
      isActiveMulti(itemData.activePaths || [itemData.props?.href], currentPath, itemData.exact)
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
          getReadableColor(theme, undefined, undefined, true, getMainColor(theme, 'sidebar'))
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
        useNativeTitle={useNativeTitle}
        onClick={onClick}
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
            useNativeTitle={useNativeTitle}
            onClick={onClick}
          />
        ))}
    </>
  );
};

export default SidebarItemWrapper;
