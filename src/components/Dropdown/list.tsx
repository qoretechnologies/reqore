import { TReqoreFilterRanking, asSearchText, rankByQuery } from '../../helpers/search';
import { size } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  /**
   * How items that pass the filter are ordered while the box has text. `'none'`
   * (default) keeps the list's order. `'relevance'` ranks the matches by label first,
   * then value, description and children, exact before prefix before mention; dividers
   * are dropped while ranking, since a ranked list has no groups.
   */
  filterRanking?: TReqoreFilterRanking;
  filter?: string | number;
  filterPlaceholder?: string;
  /**
   * Builder for the filter input's placeholder when `filterPlaceholder` is
   * not provided. Receives the count of filterable items (dividers excluded)
   * and must return the placeholder string. Defaults to
   * ``(count) => `Search ${count} items...` ``. Override to translate the
   * default placeholder.
   */
  filterPlaceholderBuilder?: (count: number) => string;
  /**
   * Message rendered inside the list when a filter query yields no matches.
   * Defaults to `'No items found'`. Override to translate.
   */
  noItemsFoundText?: string;

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

  /** Back to the level above: `true` where the keys went back (the left arrow), so it highlights the row they
   *  came from. */
  _onBackClick?: (byKeys?: boolean) => void;
  _onNavigateToLevel?: (level: number) => void;
  _level?: number;

  selectedItems?: Array<IReqoreDropdownItem | undefined>;
  onSelectedItemsChange?: (items: Array<IReqoreDropdownItem | undefined>) => void;
}

/**
 * Whether a row is a CHOICE — what the arrow keys walk, what ENTER picks and what
 * a click selects.
 *
 * Three states, and they are not the same thing:
 *
 * - `disabled` takes the row out of interaction altogether: reqore renders it with
 *   `pointer-events: none`, so nothing on it can be hovered, read or pressed.
 * - `readOnly` leaves the row ALIVE and only marks it `cursor: not-allowed`. Its
 *   tooltip, description, badge and row actions all still work, which is the one
 *   state in which a row can say WHY it cannot be picked. Having said so, it must
 *   not then be pickable — which is what this excludes, and what `ReqoreRating`
 *   and `ReqoreSegmentedControl` already do with the same prop.
 * - a row with a SUBMENU is navigation rather than a choice, so it is walked and
 *   entered but never selected — including when it is read only. One whose submenu
 *   is empty is rendered disabled, so it is neither.
 *
 * Dividers are not rows at all and are filtered by each caller, which knows where
 * its `divider` flag lives.
 */
const isChoosableDropdownItem = (item: IReqoreDropdownItem): boolean => {
  if (item.disabled) {
    return false;
  }

  if ('items' in item) {
    return !!size(item.items);
  }

  return !item.readOnly;
};

/**
 * The key of each row the list draws, one for each item and all different.
 *
 * A row is keyed by what it says, its label or else its value, so it keeps its key (and React keeps
 * the row) when an item is added before it. Items that say the same thing take the next free
 * `#n`; a row that says nothing that can be a key, and a divider, are keyed by their place. Each
 * kind is named in the key, so an item whose value is `1` never meets the divider at place 1.
 *
 * The control group the rows are drawn in keeps a child's own key, so two rows with one key are
 * the same row to React: it warns, and may drop or repeat one of them.
 */
const dropdownRowKeys = (items: IReqoreDropdownItem[]): string[] => {
  const used = new Set<string>();
  const sayable = (said: unknown): said is string | number =>
    (typeof said === 'string' && said !== '') || typeof said === 'number';

  return items.map((item, index) => {
    const said = sayable(item.label) ? item.label : sayable(item.value) ? item.value : undefined;
    const base = item.divider
      ? `divider:${index}`
      : said !== undefined
      ? `item:${said}`
      : `place:${index}`;
    let key = base;

    for (let next = 1; used.has(key); next++) {
      key = `${base}#${next}`;
    }

    used.add(key);

    return key;
  });
};

const ReqoreDropdownList = memo(
  ({
    items,
    multiSelect,
    listStyle,
    closePopover,
    filterable,
    filterRanking = 'none',
    width,
    height,
    onItemSelect,
    inputProps,
    scrollToSelected,
    paging,
    onFilterChange,
    filterPlaceholder,
    filterPlaceholderBuilder = (count) => `Search ${count} items...`,
    noItemsFoundText = 'No items found',
    filter,
    customElements,
    customTheme,
        inheritCustomTheme,
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

    const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

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

      const matches = _items.filter((item) => {
        if (item.divider) {
          return filterRanking !== 'relevance';
        }

        const text: string | undefined = item.label || item.value || item.children;

        if (!text) {
          return false;
        }

        return text.toString().toLowerCase().indexOf(query.toString().toLowerCase()) !== -1;
      });

      if (filterRanking !== 'relevance') {
        return matches;
      }

      // Opted-in relevance: typing "tele" into a long picker puts Telegram first.
      return rankByQuery(matches, query.toString().toLowerCase(), [
        (item) => asSearchText(item.label),
        (item) => asSearchText(item.value),
        (item) => asSearchText((item as { description?: unknown }).description),
        (item) => asSearchText(item.children),
      ]);
    }, [items, query, _items, filterRanking]);

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onFilterChange) {
        onFilterChange(event.target.value);
      } else {
        setQuery(event.target.value);
      }
      // Reset focused item when filtering
      setFocusedItemIndex(null);
    };

    // What the keyboard walks. The SAME predicate the rows are rendered with, so
    // the arrow keys and the list can never disagree about which row is which.
    const selectableItems = useMemo(
      () => filteredItems.filter((item) => !item.divider && isChoosableDropdownItem(item)),
      [filteredItems]
    );

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

        // A read-only row keeps its pointer events on purpose — that is what lets it
        // carry the reason it cannot be picked — so the click DOES land here, and the
        // choice is refused rather than the row being made untouchable.
        if (item.readOnly) {
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
          // Only consume the event when there is actually a submenu to enter.
          // Otherwise let it through so cursor movement in external inputs works.
          if (focusedItemIndex !== null && selectableItems[focusedItemIndex]) {
            const item = selectableItems[focusedItemIndex];
            if (size(item.items)) {
              event.preventDefault();
              handleSelectItemAtLevel(item);
              setFocusedItemIndex(null);
            }
          }
        } else if (key === 'ArrowLeft' && _onBackClick) {
          event.preventDefault();
          _onBackClick(true);
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

    // the back button: a click, which says nothing of the keys
    const goBackByClick = useCallback(() => _onBackClick?.(), [_onBackClick]);

    // Compute the focused item's DOM id for aria-activedescendant
    const focusedItemDomId = useMemo(() => {
      if (focusedItemIndex === null || !listId) return null;
      return `${listId}-option-${focusedItemIndex}`;
    }, [focusedItemIndex, listId]);

    // Register document-level keyboard listener so arrow keys work
    // regardless of which element has focus (button, external input, etc.)
    // Skip if the event target is already inside the dropdown (handled by input/menu onKeyDown)
    //
    // Only the level the list shows hears them. The list of an opened level is drawn by the
    // list of the level above it, which kept its own listener: each key was handled twice,
    // and Enter in an opened level also selected the row the level above had highlighted.
    const showsItsOwnRows = !currentSelectedItem;

    /* Back at this level from the level it showed by the keys (the left arrow), the row that level came
       from is highlighted, as the keys left it: the right arrow opens it again and Enter acts on it.
       Opening it cleared the highlight, and it showed again on the way back only while this level also
       heard the keys pressed in the level it showed (qorus#646, Foxhoundn). The same holds for a lone row
       the list opened by itself. Back by a click (the back button, a crumb) says nothing of the keys:
       nothing is highlighted, as before - a highlighted row looks picked to a pointer. */
    const levelItShowed = useRef<IReqoreDropdownItem | undefined>(undefined);
    const wentBackByKeys = useRef(false);
    useEffect(() => {
      const cameFrom = levelItShowed.current;
      const byKeys = wentBackByKeys.current;
      levelItShowed.current = currentSelectedItem;
      if (!cameFrom || currentSelectedItem) {
        return;
      }
      wentBackByKeys.current = false;
      if (!byKeys) {
        return;
      }
      const index = selectableItems.findIndex(
        (item) =>
          item === cameFrom || (item.value === cameFrom.value && item.label === cameFrom.label)
      );
      setFocusedItemIndex(index === -1 ? null : index);
    }, [currentSelectedItem, selectableItems]);

    useEffect(() => {
      if (!keyboardNavigation || !showsItsOwnRows) {
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

        // When focus is in an editable element outside the dropdown, leave horizontal
        // arrow keys alone so the caret can move. Vertical arrows and Enter still
        // navigate the open list (matches typical combobox behavior).
        if (key === 'ArrowLeft' || key === 'ArrowRight') {
          const target = event.target as HTMLElement | null;
          if (target) {
            const tag = target.tagName;
            if (
              tag === 'INPUT' ||
              tag === 'TEXTAREA' ||
              target.isContentEditable
            ) {
              return;
            }
          }
        }

        handleKeyDown(event);
      };

      document.addEventListener('keydown', listener, true);
      return () => document.removeEventListener('keydown', listener, true);
    }, [keyboardNavigation, handleKeyDown, menuRef, showsItsOwnRows]);

    // Expose keyboard controls to external components (aria-activedescendant pattern)
    useEffect(() => {
      if (passKeyHandler && keyboardNavigation && showsItsOwnRows) {
        passKeyHandler({ handleKeyDown, focusedItemId: focusedItemDomId });
      }
    }, [passKeyHandler, handleKeyDown, keyboardNavigation, focusedItemDomId, showsItsOwnRows]);

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

    // The trail of levels' tags keeps its handlers while the trail holds: a tag is a memo component.
    const handleHomeTagClick = useCallback(() => {
      _onNavigateToLevel?.(0);
    }, [_onNavigateToLevel]);
    const labelClickHandlers = useMemo(
      () =>
        labels.map((label, index): IReqoreTagProps['onClick'] => (event) => {
          // Navigate back to the clicked label's level
          const targetLevel = label._levelIndex ?? index;

          if (_onNavigateToLevel) {
            _onNavigateToLevel(targetLevel);
          }

          // Call any original onClick if provided
          if (label.onClick) {
            label.onClick(event);
          }
        }),
      [labels, _onNavigateToLevel]
    );

    if (currentSelectedItem) {
      return (
        <ReqoreDropdownList
          {...{
            items: currentSelectedItem.items,
            multiSelect,
            listStyle,
            filterable,
            // an opened level is the same list: it ranks, says and is reached as the list does
            filterRanking,
            closePopover,
            width,
            height,
            onItemSelect,
            inputProps,
            scrollToSelected,
            paging,
            onFilterChange,
            filterPlaceholder,
            filterPlaceholderBuilder,
            noItemsFoundText,
            filter,
            customTheme,
            intent,
            keyboardNavigation,
            passKeyHandler,
            listId,
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
            _onBackClick: (byKeys?: boolean) => {
              wentBackByKeys.current = byKeys === true;
              handleSelectItemAtLevel(undefined);
            },
            _onNavigateToLevel,
            _level: _level + 1,
            selectedItems,
            onSelectedItemsChange,
          }}
        />
      );
    }

    return (
      // In a popover held to the room below its field, the list shrinks to it (min-height 0 in the panel's
      // column) and its rows, the menu, take what its search and tags leave: one place scrolls (qorus#646).
      <ReqoreControlGroup vertical fluid style={{ minHeight: 0 }}>
        {/* An array prop: keyed here, so a caller passing elements without keys draws no warning.
            `toArray` keeps the keys a caller gave rather than putting keys by position over them,
            and takes a single node too, which `map` threw on. */}
        {React.Children.toArray(customElements)}
        {(size(items) && filterable) || _onBackClick ? (
          <>
            <ReqoreControlGroup fluid>
              {_onBackClick && (
                <ReqoreButton
                  icon='ArrowLeftSLine'
                  fluid={!filterable}
                  fixed={filterable}
                  onClick={goBackByClick}
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
                    filterPlaceholderBuilder(size(_items.filter((item) => !item.divider)))
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
              onClick={handleHomeTagClick}
            />
            {labels.map((label, index) => (
              <ReqoreTag key={index} {...label} onClick={labelClickHandlers[index]} />
            ))}
          </ReqoreTagGroup>
        ) : null}
        <ReqorePaginationContainer type={paging} items={filteredItems} scrollContainer={menuRef}>
          {(_finalItems, Controls, { includeBottomControls, applyPaging }) => {
            // Track which selectable index we're at
            let selectableIndexCounter = 0;
            const pagedItems: IReqoreDropdownItem[] = applyPaging(filteredItems);
            const rowKeys = dropdownRowKeys(pagedItems);

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
                      {noItemsFoundText}
                    </ReqoreP>
                  </ReqoreControlGroup>
                ) : null}
                {pagedItems.map(
                  (
                    { dividerAlign, dividerPadded, divider, ...item }: IReqoreDropdownItem,
                    index: number
                  ) => {
                    // One predicate, shared with `selectableItems`, so the index the
                    // keyboard counts and the index the row advertises stay the same.
                    const isSelectableItem = !divider && isChoosableDropdownItem(item);

                    // Assign selectableIndex BEFORE incrementing
                    const itemSelectableIndex = isSelectableItem ? selectableIndexCounter : -1;

                    // Increment counter for next selectable item
                    if (isSelectableItem) {
                      selectableIndexCounter++;
                    }

                    return divider ? (
                      <ReqoreMenuDivider
                        key={rowKeys[index]}
                        {...(item as unknown as IReqoreMenuDividerProps)}
                        align={dividerAlign}
                        padded={dividerPadded}
                      />
                    ) : (
                      <ReqoreDropdownItem
                        key={rowKeys[index]}
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
