import { omit, size } from 'lodash';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReqoreDropdown, ReqoreInput } from '../..';
import { TSizes } from '../../constants/sizes';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import { IReqoreDropdownProps } from '../Dropdown';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { IReqoreEffect } from '../Effect';
import { IReqoreInputProps } from '../Input';
import { IPopoverControls } from '../Popover';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';

export type TReqoreMultiSelectItem = Omit<IReqoreDropdownItem, 'color'> &
  Pick<IReqoreTagProps, 'asBadge' | 'rightIcon' | 'actions'> & { isNew?: boolean };

/**
 * Everything a multi- and a single-select share. The two differ only in the
 * shape of the value they carry, so `value` / `onValueChange` are declared by
 * each of them and everything else lives here.
 */
export interface IReqoreMultiSelectCommonProps
  extends Omit<IReqoreControlGroupProps, 'children' | 'vertical' | 'stack'> {
  items?: TReqoreMultiSelectItem[];
  onItemClick?: (item: IReqoreDropdownItem) => void;
  onItemClickIcon?: IReqoreTagProps['rightIcon'];
  onItemAdded?: (item: TReqoreMultiSelectItem) => void;
  onItemRemoved?: (item: TReqoreMultiSelectItem) => void;
  canRemoveItems?: boolean;
  canCreateItems?: boolean;
  selectedItemEffect?: IReqoreEffect;
  selectedItemSize?: TSizes;
  selectorProps?: Omit<IReqoreInputProps, 'value' | 'onValueChange'> & IReqoreDropdownProps;
  openOnMount?: IReqoreDropdownProps['isDefaultOpen'];
  enterKeySelects?: boolean;
  disabled?: boolean;

  showNoItemsMessage?: boolean;
  noItemsMessageProps?: IReqoreTagProps;

  /** Label for the tag shown when no items are selected. Defaults to `'No items selected'`. */
  noItemsSelectedLabel?: string;
  /** Label shown in the dropdown when the query matches no existing items. Defaults to `'No existing items found'`. */
  noMatchingItemsLabel?: string;
  /** Label shown in the dropdown when there are no items at all (and `canCreateItems` is true). Defaults to `'No items exist'`. */
  noItemsAvailableLabel?: string;
  /** Divider label preceding the user-created items section. Defaults to `'Custom Items'`. */
  customItemsDividerLabel?: string;
  /** Divider label preceding items that match the current query (shown when `canCreateItems` is true). Defaults to `'Items matching your query'`. */
  matchingItemsDividerLabel?: string;
  /**
   * Prefix used to build the "create new" option label. Rendered as `${createItemLabelPrefix} "${query}"`.
   * Defaults to `'Create new'`.
   */
  createItemLabelPrefix?: string;
  /** Placeholder for the search input when items cannot be created. Defaults to `'Type to search...'`. */
  searchPlaceholder?: string;
  /** Placeholder for the search input when `canCreateItems` is true. Defaults to `'Type to search or create an item...'`. */
  createItemPlaceholder?: string;
}

export interface IReqoreMultiSelectProps extends IReqoreMultiSelectCommonProps {
  value?: string[];
  onValueChange: (value: string[]) => void;
}

/**
 * Internal-only shape. `single` is what `ReqoreSingleSelect` sets to make the
 * selection hold at most one value; it is deliberately not part of
 * `IReqoreMultiSelectProps`, so a multi-select cannot be talked into it.
 */
export interface IReqoreMultiSelectBaseProps extends IReqoreMultiSelectProps {
  single?: boolean;
}

export interface IReqoreMultiSelectItemProps
  extends Pick<IReqoreMultiSelectProps, 'selectedItemEffect' | 'selectedItemSize' | 'disabled'> {
  item: TReqoreMultiSelectItem;
  onClick?: () => void;
  onRemoveClick?: () => void;
  onItemClickIcon?: IReqoreTagProps['rightIcon'];
}

export const ReqoreMultiSelectItem = memo(
  ({
    item,
    onRemoveClick,
    onClick,
    selectedItemEffect,
    selectedItemSize,
    onItemClickIcon,
    disabled,
  }: IReqoreMultiSelectItemProps) => {
    if (!item) {
      return null;
    }

    return (
      <ReqoreTag
        {...item}
        disabled={disabled || item.disabled}
        label={item.label || item.value}
        onRemoveClick={onRemoveClick}
        intent={item.intent}
        effect={!item.intent ? item.effect || selectedItemEffect : undefined}
        size={selectedItemSize}
        onClick={onClick}
        rightIcon={
          item.disabled
            ? undefined
            : item.rightIcon
            ? item.rightIcon
            : onClick
            ? onItemClickIcon
            : undefined
        }
      />
    );
  }
);

export const ReqoreMultiSelectBase = ({
  value = [],
  onValueChange,
  onItemClick,
  single,
  canRemoveItems,
  canCreateItems,
  items = [],
  selectedItemEffect,
  selectedItemSize,
  selectorProps,
  openOnMount,
  enterKeySelects,
  onItemClickIcon,
  onItemAdded,
  onItemRemoved,
  disabled,
  showNoItemsMessage = true,
  noItemsMessageProps = {},
  noItemsSelectedLabel = 'No items selected',
  noMatchingItemsLabel = 'No existing items found',
  noItemsAvailableLabel = 'No items exist',
  customItemsDividerLabel = 'Custom Items',
  matchingItemsDividerLabel = 'Items matching your query',
  createItemLabelPrefix = 'Create new',
  searchPlaceholder = 'Type to search...',
  createItemPlaceholder = 'Type to search or create an item...',
  ...rest
}: IReqoreMultiSelectBaseProps) => {
  const [createdItems, setCreatedItems] = useState<TReqoreMultiSelectItem[]>([]);
  const [query, setQuery] = useState<string>('');
  const popoverData = useRef<IPopoverControls>(undefined);
  const [focused, setFocused] = useState<boolean>(false);
  const isSelectorDisabled = Boolean(
    disabled || selectorProps?.disabled || (!size(items) && !size(createdItems) && !canCreateItems)
  );

  useEffect(() => {
    if (query && !popoverData.current?.isOpen()) {
      popoverData.current?.open();
    }
  }, [query]);

  useEffect(() => {
    if (enterKeySelects) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  const addRemoveItem = useCallback(
    (item: TReqoreMultiSelectItem): void => {
      if (value.includes(item.value)) {
        onValueChange(single ? [] : value.filter((v) => v !== item.value));
        onItemRemoved?.(item.value);
      } else {
        // A single select holds one value, so picking another replaces it
        // rather than adding to it.
        onValueChange(single ? [item.value] : [...value, item.value]);
        onItemAdded?.(item.value);
      }
    },
    [value, onValueChange, onItemAdded, onItemRemoved, single]
  );

  const handleItemSelect = useCallback(
    (item: Partial<TReqoreMultiSelectItem>) => {
      addRemoveItem(item);

      if (item.isNew) {
        setCreatedItems([
          ...createdItems,
          {
            value: item.value,
          },
        ]);
      }

      setQuery('');

      // A single select holds one value, so the list has nothing left to offer
      // once one is picked. The dropdown closes itself on a click
      // (`multiSelect={!single}` below), but the ENTER-key path never reaches
      // it, so close it here too.
      if (single) {
        popoverData.current?.close();
      }
    },
    [createdItems, value, items, addRemoveItem, single]
  );

  /*
    This code creates a list of all items that are available
    for selection in the dropdown. It will include the items
    that are passed in as props, as well as any items that the
    user has created.
    */
  const allItems: TReqoreMultiSelectItem[] = useMemo(() => {
    const customItems: TReqoreMultiSelectItem[] = size(createdItems)
      ? [{ divider: true, label: customItemsDividerLabel }, ...createdItems]
      : [];

    let filteredItems: TReqoreMultiSelectItem[] = [...items, ...customItems].filter((item) =>
      query
        ? item.divider
          ? false
          : (item.label || item.value)?.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1
        : true
    );

    // Mark selected items as selected
    filteredItems = filteredItems.map((item: TReqoreMultiSelectItem) => ({
      ...omit(item, ['actions', 'asBadge', 'rightIcon']),
      selected: value.includes(item.value),
    }));

    const nothingMatched: boolean = Boolean(query) && !size(filteredItems);

    if (nothingMatched) {
      filteredItems = [
        { label: noMatchingItemsLabel, readOnly: true, minimal: true, icon: 'ForbidLine' },
      ];
    }

    // If there is a query and there are filtered items
    // and there is no item that exactly matches the query, add it to the list
    if (
      query &&
      !filteredItems.some((item: TReqoreMultiSelectItem) => item.value === query) &&
      canCreateItems
    ) {
      filteredItems = [
        {
          label: `${createItemLabelPrefix} "${query}"`,
          value: query,
          isNew: true,
          icon: 'AddCircleLine',
          minimal: true,
          flat: false,
          effect: {
            gradient: {
              colors: {
                0: 'success',
                100: 'success:darken:1',
              },
            },
          },
        },
        // No divider when nothing matched: it would head a section whose only
        // content is the line saying the section is empty.
        ...(nothingMatched ? [] : [{ divider: true, label: matchingItemsDividerLabel }]),
        ...filteredItems,
      ];
    }

    return filteredItems;
  }, [
    items,
    createdItems,
    query,
    value,
    customItemsDividerLabel,
    noMatchingItemsLabel,
    matchingItemsDividerLabel,
    createItemLabelPrefix,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && focused) {
        const item = [...items, ...createdItems].find((item) => item.value === query);

        if (item) {
          handleItemSelect(item);
        } else if (canCreateItems && query) {
          handleItemSelect({
            value: query,
            isNew: true,
          });
        }
      }
    },
    [items, createdItems, query, canCreateItems, focused]
  );

  const getItemByValue = useCallback(
    (value: string): TReqoreMultiSelectItem => {
      // A selected value with no matching item still gets a chip — without the
      // fallback the value is held but nothing is drawn for it, which reads as
      // "nothing is selected".
      return [...items, ...createdItems].find((item) => item.value === value) ?? { value };
    },
    [items, createdItems, value]
  );

  return (
    <ReqoreControlGroup vertical fluid {...rest}>
      {size(value) ? (
        <ReqoreTagGroup minimal={rest.minimal} size={rest.size}>
          {value.map((v) => (
            <ReqoreMultiSelectItem
              key={v}
              item={getItemByValue(v)}
              onItemClickIcon={onItemClickIcon}
              onRemoveClick={canRemoveItems ? () => addRemoveItem(getItemByValue(v)) : undefined}
              onClick={
                onItemClick
                  ? () => {
                      onItemClick(getItemByValue(v));
                    }
                  : undefined
              }
              selectedItemEffect={selectedItemEffect}
              selectedItemSize={selectedItemSize}
              disabled={disabled}
            />
          ))}
        </ReqoreTagGroup>
      ) : showNoItemsMessage ? (
        <ReqoreTagGroup minimal={rest.minimal} size={rest.size}>
          <ReqoreTag
            color='transparent'
            icon='ForbidLine'
            label={noItemsSelectedLabel}
            {...noItemsMessageProps}
          />
        </ReqoreTagGroup>
      ) : null}

      <ReqoreControlGroup minimal={rest.minimal} flat={rest.flat} size={rest.size}>
        <ReqoreDropdown<IReqoreInputProps>
          useTargetWidth
          handler='click'
          placement='auto-start'
          placeholder={canCreateItems ? createItemPlaceholder : searchPlaceholder}
          {...selectorProps}
          disabled={isSelectorDisabled}
          multiSelect={!single}
          onFocus={() => {
            setFocused(true);

            if (!isSelectorDisabled) {
              popoverData.current?.open();
            }
          }}
          onBlur={() => setFocused(false)}
          passPopoverData={(data) => (popoverData.current = data)}
          component={ReqoreInput}
          onClearClick={() => setQuery('')}
          value={query}
          isDefaultOpen={openOnMount}
          onItemSelect={handleItemSelect}
          onChange={(e: any) => setQuery(e.target.value)}
          items={
            size(allItems)
              ? allItems
              : canCreateItems
              ? [{ label: noItemsAvailableLabel, readOnly: true, minimal: true, icon: 'ForbidLine' }]
              : []
          }
        />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  );
};

export const ReqoreMultiSelect = (props: IReqoreMultiSelectProps) => (
  <ReqoreMultiSelectBase {...props} />
);
