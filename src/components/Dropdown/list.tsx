import { size } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { IReqoreDropdownProps } from '.';
import { TReqorePaginationType } from '../../constants/paging';
import { ReqorePaginationContainer } from '../../containers/Paging';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent, IReqoreIntent, IWithReqoreCustomTheme } from '../../types/global';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreIcon from '../Icon';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import ReqoreMenu from '../Menu';
import ReqoreMenuDivider, { IReqoreMenuDividerProps } from '../Menu/divider';
import { IReqoreMenuItemProps } from '../Menu/item';
import { ReqoreP } from '../Paragraph';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';
import { ReqoreDropdownItem } from './item';

export type TDropdownItemOnClick = <Metadata extends Record<string, any> = Record<string, any>>(
  item: IReqoreDropdownItem<Metadata>,
  event?: React.MouseEvent<HTMLElement>
) => void;
export interface IReqoreDropdownItem<Metadata extends Record<string, any> = Record<string, any>>
  extends Omit<
    IReqoreMenuItemProps<{
      item?: IReqoreDropdownItem;
      selectItem?: () => void;
    }>,
    'onClick'
  > {
  value?: any;
  metadata?: Metadata;
  items?: TReqoreDropdownItems;
  onClick?: TDropdownItemOnClick;
  divider?: boolean;
  dividerAlign?: 'left' | 'center' | 'right';
  dividerPadded?: 'top' | 'bottom' | 'both' | 'none';
  line?: boolean;
}

export type TReqoreDropdownItem = IReqoreDropdownItem;
export type TReqoreDropdownItems = TReqoreDropdownItem[];

export interface IReqoreDropdownListProps
  extends IReqoreComponent,
    Pick<IReqoreDropdownProps, 'customElements'>,
    IWithReqoreCustomTheme,
    IReqoreIntent {
  items?: TReqoreDropdownItems;
  multiSelect?: boolean;
  listStyle?: React.CSSProperties;
  width?: string;
  height?: string;

  filterable?: boolean;
  onFilterChange?: (query: string) => void;
  filter?: string | number;
  filterPlaceholder?: string;

  onItemSelect?: TDropdownItemOnClick;
  inputProps?: IReqoreInputProps;
  scrollToSelected?: boolean;
  paging?: TReqorePaginationType<TReqoreDropdownItem>;

  labels?: (IReqoreTagProps & { _levelIndex?: number })[];

  keyboardNavigation?: boolean;

  _onBackClick?: () => void;
  _onNavigateToLevel?: (level: number) => void;
  _level?: number;

  selectedItems?: Array<IReqoreDropdownItem | undefined>;
  onSelectedItemsChange?: (items: Array<IReqoreDropdownItem | undefined>) => void;
}

const ReqoreDropdownList = memo(
  ({
    items,
    multiSelect,
    listStyle,
    closePopover,
    filterable,
    width,
    height,
    onItemSelect,
    inputProps,
    scrollToSelected,
    paging,
    onFilterChange,
    filterPlaceholder,
    filter,
    customElements,
    customTheme,
    intent,
    keyboardNavigation = true,

    labels = [],
    _onBackClick,
    _onNavigateToLevel,
    _level = 0,
    selectedItems = [],
    onSelectedItemsChange,
  }: IReqoreDropdownListProps) => {
    const [_items, setItems] = useState<TReqoreDropdownItems>(items);
    const [query, setQuery] = useState<string | number>(onFilterChange ? '' : filter || '');
    const [menuRef, setMenuRef] = useState<HTMLDivElement>(undefined);
    const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);

    // Determine which item is currently selected based on selectedItems stack
    const currentSelectedItem = useMemo(() => {
      if (_level < selectedItems.length) {
        return selectedItems[_level];
      }
      // If no selected item at this level, auto-select first item with subitems if at root level
      if (size(items) === 1 && size(items[0].items) && !items[0]?.disabled && _level === 0) {
        return items[0];
      }
      return undefined;
    }, [selectedItems, _level, items]);

    const theme = useReqoreTheme('main', customTheme, intent);

    useEffect(() => {
      setItems(items);
    }, [items]);

    const handleSelectItemAtLevel = useCallback(
      (item: IReqoreDropdownItem | undefined) => {
        if (onSelectedItemsChange) {
          const newItems = [...selectedItems];
          newItems[_level] = item;
          // Remove any items beyond this level
          newItems.splice(_level + 1);
          onSelectedItemsChange(newItems);
        }
      },
      [_level, selectedItems, onSelectedItemsChange]
    );

    const filteredItems: TReqoreDropdownItems = useMemo(() => {
      if (!filterable || query === '') {
        return _items;
      }

      return _items.filter((item) => {
        if (item.divider) {
          return true;
        }

        const text: string | undefined = item.label || item.value || item.children;

        if (!text) {
          return false;
        }

        return text.toString().toLowerCase().indexOf(query.toString().toLowerCase()) !== -1;
      });
    }, [items, query, _items]);

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onFilterChange) {
        onFilterChange(event.target.value);
      } else {
        setQuery(event.target.value);
      }
      // Reset focused item when filtering
      setFocusedItemIndex(null);
    };

    // Get selectable items (non-dividers, non-disabled, non-empty submenus)
    const selectableItems = useMemo(() => {
      return filteredItems.filter(
        (item) => !item.divider && !item.disabled && !('items' in item && !size(item.items)) // Exclude items with empty subitems array
      );
    }, [filteredItems]);

    const handleItemSelectClick = useCallback(
      (item: IReqoreDropdownItem, event: React.MouseEvent<HTMLElement>): void => {
        if (item.onClick) {
          item.onClick(item, event);

          if (!multiSelect) {
            closePopover?.();
          }
        }

        if (onItemSelect) {
          onItemSelect(item, event);

          if (!multiSelect) {
            closePopover?.();
          }
        }
      },
      [onItemSelect, closePopover, multiSelect]
    );

    const handleItemClick = useCallback(
      (item: IReqoreDropdownItem, event: React.MouseEvent<HTMLElement>): void => {
        if (size(item.items)) {
          handleSelectItemAtLevel(item);

          return;
        }

        handleItemSelectClick(item, event);
      },
      [handleSelectItemAtLevel, handleItemSelectClick]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) => {
        if (!keyboardNavigation) {
          return;
        }

        const key = event.key;

        if (key === 'ArrowDown') {
          event.preventDefault();
          setFocusedItemIndex((prev) => {
            if (prev === null) {
              return 0;
            }
            return Math.min(prev + 1, selectableItems.length - 1);
          });
        } else if (key === 'ArrowUp') {
          event.preventDefault();
          setFocusedItemIndex((prev) => {
            if (prev === null) {
              return selectableItems.length - 1;
            }
            return Math.max(prev - 1, 0);
          });
        } else if (key === 'Enter') {
          event.preventDefault();
          if (focusedItemIndex !== null && selectableItems[focusedItemIndex]) {
            const item = selectableItems[focusedItemIndex];
            handleItemClick(item, event as any);
          }
        } else if (key === 'ArrowRight') {
          event.preventDefault();
          if (focusedItemIndex !== null && selectableItems[focusedItemIndex]) {
            const item = selectableItems[focusedItemIndex];
            if (size(item.items)) {
              handleSelectItemAtLevel(item);
              setFocusedItemIndex(null);
            }
          }
        } else if (key === 'ArrowLeft' && _onBackClick) {
          event.preventDefault();
          _onBackClick();
        }
      },
      [
        keyboardNavigation,
        focusedItemIndex,
        selectableItems,
        handleItemClick,
        _onBackClick,
        handleSelectItemAtLevel,
      ]
    );

    const getAction = useCallback((item: TReqoreDropdownItem, position: 'left' | 'right') => {
      const action = position === 'left' ? item.leftAction : item.rightAction;

      if (!action) {
        return undefined;
      }

      if (!action.onClick) {
        return action;
      }

      return {
        ...action,
        onClick: (event, itemId, _closePopover) => {
          action.onClick(event, itemId, _closePopover || closePopover, {
            item,
            selectItem: () => {
              handleItemSelectClick(item, event);
            },
          });
        },
      };
    }, []);

    if (currentSelectedItem) {
      return (
        <ReqoreDropdownList
          {...{
            items: currentSelectedItem.items,
            multiSelect,
            listStyle,
            filterable,
            closePopover,
            width,
            height,
            onItemSelect,
            inputProps,
            scrollToSelected,
            paging,
            onFilterChange,
            filterPlaceholder,
            filter,
            customTheme,
            intent,
            keyboardNavigation,
            labels: [
              ...labels,
              {
                label: currentSelectedItem.label,
                icon: currentSelectedItem.icon,
                leftIconProps: currentSelectedItem.leftIconProps,
                customTheme: currentSelectedItem.customTheme || customTheme,
                intent: currentSelectedItem.intent || intent,
                _levelIndex: _level,
              },
            ],
            _onBackClick: () => handleSelectItemAtLevel(undefined),
            _onNavigateToLevel,
            _level: _level + 1,
            selectedItems,
            onSelectedItemsChange,
          }}
        />
      );
    }

    return (
      <ReqoreControlGroup vertical fluid>
        {customElements}
        {(size(items) && filterable) || _onBackClick ? (
          <>
            <ReqoreControlGroup fluid>
              {_onBackClick && (
                <ReqoreButton
                  icon='ArrowLeftSLine'
                  fluid={!filterable}
                  fixed={filterable}
                  onClick={_onBackClick}
                  className='reqore-dropdown-back-button'
                  customTheme={theme}
                  intent={intent}
                />
              )}
              {filterable && (
                <ReqoreInput
                  value={onFilterChange ? filter : query}
                  icon='SearchLine'
                  onChange={handleQueryChange}
                  placeholder={
                    filterPlaceholder ||
                    `Search ${size(_items.filter((item) => !item.divider))} items...`
                  }
                  onClearClick={() => (onFilterChange ? onFilterChange('') : setQuery(''))}
                  customTheme={theme}
                  intent={intent}
                  autoFocus={keyboardNavigation}
                  {...inputProps}
                  onKeyDown={keyboardNavigation ? handleKeyDown : inputProps?.onKeyDown}
                />
              )}
            </ReqoreControlGroup>
          </>
        ) : null}
        {size(labels) ? (
          <ReqoreTagGroup size='small'>
            {labels.map((label, index) => (
              <ReqoreTag
                key={index}
                {...label}
                onClick={(event) => {
                  // Navigate back to the clicked label's level
                  const targetLevel = label._levelIndex ?? index;

                  if (_onNavigateToLevel) {
                    _onNavigateToLevel(targetLevel);
                  }

                  // Call any original onClick if provided
                  if (label.onClick) {
                    label.onClick(event);
                  }
                }}
              />
            ))}
          </ReqoreTagGroup>
        ) : null}
        <ReqorePaginationContainer type={paging} items={filteredItems} scrollContainer={menuRef}>
          {(_finalItems, Controls, { includeBottomControls, applyPaging }) => {
            // Track which selectable index we're at
            let selectableIndexCounter = 0;

            return (
              <ReqoreMenu
                style={listStyle}
                width={width}
                maxHeight={height || '300px'}
                padded={false}
                ref={setMenuRef}
                transparent
                customTheme={theme}
                intent={intent}
                tabIndex={-1}
                onKeyDown={keyboardNavigation && !filterable ? handleKeyDown : undefined}
              >
                {query && size(filteredItems) === 0 ? (
                  <ReqoreControlGroup horizontalAlign='center'>
                    <ReqoreP intent='muted'>
                      <ReqoreIcon icon='ForbidLine' intent='muted' margin='right' />
                      No items found
                    </ReqoreP>
                  </ReqoreControlGroup>
                ) : null}
                {applyPaging(filteredItems).map(
                  (
                    { dividerAlign, dividerPadded, divider, ...item }: IReqoreDropdownItem,
                    index: number
                  ) => {
                    // Assign selectableIndex BEFORE incrementing
                    const itemSelectableIndex =
                      divider || item.disabled ? -1 : selectableIndexCounter;

                    // Increment counter for next selectable item
                    if (!divider && !item.disabled) {
                      selectableIndexCounter++;
                    }

                    return divider ? (
                      <ReqoreMenuDivider
                        key={index}
                        {...(item as unknown as IReqoreMenuDividerProps)}
                        align={dividerAlign}
                        padded={dividerPadded}
                      />
                    ) : (
                      <ReqoreDropdownItem
                        key={item.label || item.value || index}
                        rightIcon={
                          'items' in item && size(item.items) ? 'ArrowRightSLine' : item.rightIcon
                        }
                        customTheme={theme}
                        intent={intent}
                        {...item}
                        rightAction={getAction(item, 'right')}
                        leftAction={getAction(item, 'left')}
                        disabled={'items' in item && !size(item.items) ? true : item.disabled}
                        onItemClick={handleItemClick}
                        keyboardFocused={
                          keyboardNavigation && focusedItemIndex === itemSelectableIndex
                        }
                        scrollIntoView={scrollToSelected && item.selected && !multiSelect}
                        closePopover={closePopover}
                      />
                    );
                  }
                )}
                {!includeBottomControls && Controls}
              </ReqoreMenu>
            );
          }}
        </ReqorePaginationContainer>
      </ReqoreControlGroup>
    );
  }
);

export default ReqoreDropdownList;
