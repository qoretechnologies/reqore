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

export type TDropdownKeyHandler = (event: React.KeyboardEvent | KeyboardEvent) => void;

export interface IDropdownKeyboardControls {
  /** Forward keyboard events (ArrowUp/Down, Enter) to the dropdown list. */
  handleKeyDown: TDropdownKeyHandler;
  /** The DOM id of the currently highlighted item, for aria-activedescendant. Null when nothing is highlighted. */
  focusedItemId: string | null;
}

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

  /** Callback that receives keyboard controls, allowing external components
   *  to forward arrow key events to the dropdown (aria-activedescendant pattern).
   *  Called on every render with updated focusedItemId. */
  passKeyHandler?: (controls: IDropdownKeyboardControls) => void;

  /** Unique ID prefix for dropdown items, used for aria-activedescendant support. */
  listId?: string;

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
    passKeyHandler,
    listId,

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

    // When an item is auto-selected at root level, ensure it gets marked in selectedItems
    // so that sub-selections work correctly
    useEffect(() => {
      if (
        _level === 0 &&
        currentSelectedItem &&
        selectedItems.length === 0 &&
        onSelectedItemsChange
      ) {
        // Mark the auto-selected item so future clicks work correctly
        onSelectedItemsChange([currentSelectedItem]);
      }
    }, [currentSelectedItem, selectedItems, _level, onSelectedItemsChange]);

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
    // Use the SAME disabled logic as rendering to ensure consistency
    const selectableItems = useMemo(() => {
      return filteredItems.filter((item) => {
        // Skip dividers
        if (item.divider) {
          return false;
        }
        // Skip items that are explicitly disabled
        if (item.disabled) {
          return false;
        }
        // Skip items with empty items array or falsy items (rendered as disabled)
        // An item is considered "parent-like" if it has the items property
        if ('items' in item && (!item.items || !size(item.items))) {
          return false;
        }
        return true;
      });
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
    const handleKeyDown: TDropdownKeyHandler = useCallback(
      (event: React.KeyboardEvent | KeyboardEvent) => {
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
          if (focusedItemIndex !== null && selectableItems[focusedItemIndex]) {
            event.preventDefault();
            event.stopPropagation();
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

    // Compute the focused item's DOM id for aria-activedescendant
    const focusedItemDomId = useMemo(() => {
      if (focusedItemIndex === null || !listId) return null;
      return `${listId}-option-${focusedItemIndex}`;
    }, [focusedItemIndex, listId]);

    // Register document-level keyboard listener so arrow keys work
    // regardless of which element has focus (button, external input, etc.)
    // Skip if the event target is already inside the dropdown (handled by input/menu onKeyDown)
    useEffect(() => {
      if (!keyboardNavigation) {
        return () => {};
      }

      const listener = (event: KeyboardEvent) => {
        const key = event.key;
        if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter' &&
            key !== 'ArrowRight' && key !== 'ArrowLeft') {
          return;
        }

        // Don't intercept if the event target is inside the dropdown's own elements
        // (the filter input or menu already handle these via their onKeyDown)
        if (menuRef && (event.target as HTMLElement)?.closest?.('.reqore-popover-content')) {
          return;
        }

        handleKeyDown(event);
      };

      document.addEventListener('keydown', listener, true);
      return () => document.removeEventListener('keydown', listener, true);
    }, [keyboardNavigation, handleKeyDown, menuRef]);

    // Expose keyboard controls to external components (aria-activedescendant pattern)
    useEffect(() => {
      if (passKeyHandler && keyboardNavigation) {
        passKeyHandler({ handleKeyDown, focusedItemId: focusedItemDomId });
      }
    }, [passKeyHandler, handleKeyDown, keyboardNavigation, focusedItemDomId]);

    const getAction = useCallback(
      (item: TReqoreDropdownItem, position: 'left' | 'right') => {
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
      },
      [closePopover, handleItemSelectClick]
    );

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
                _levelIndex: _level + 1,
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
                  {...inputProps}
                  onKeyDown={keyboardNavigation ? handleKeyDown : inputProps?.onKeyDown}
                />
              )}
            </ReqoreControlGroup>
          </>
        ) : null}
        {size(labels) ? (
          <ReqoreTagGroup size='small'>
            <ReqoreTag
              icon='Home4Line'
              size='small'
              intent={intent}
              customTheme={customTheme}
              onClick={() => {
                _onNavigateToLevel?.(0);
              }}
            />
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
                    // Check if this item is actually selectable (same logic as selectableItems filter)
                    const isSelectableItem =
                      !divider &&
                      !item.disabled &&
                      !('items' in item && (!item.items || !size(item.items)));

                    // Assign selectableIndex BEFORE incrementing
                    const itemSelectableIndex = isSelectableItem ? selectableIndexCounter : -1;

                    // Increment counter for next selectable item
                    if (isSelectableItem) {
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
                        id={listId ? `${listId}-option-${itemSelectableIndex}` : undefined}
                        rightIcon={
                          'items' in item && size(item.items) ? 'ArrowRightSLine' : item.rightIcon
                        }
                        customTheme={theme}
                        intent={intent}
                        {...item}
                        rightAction={getAction(item, 'right')}
                        leftAction={getAction(item, 'left')}
                        disabled={
                          'items' in item && (!item.items || !size(item.items))
                            ? true
                            : item.disabled
                        }
                        onItemClick={handleItemClick}
                        keyboardFocused={
                          keyboardNavigation &&
                          isSelectableItem &&
                          focusedItemIndex === itemSelectableIndex
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
