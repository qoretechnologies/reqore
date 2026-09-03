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

export type TReqoreSelectItem = Omit<IReqoreDropdownItem, 'color'> &
  Pick<IReqoreTagProps, 'asBadge' | 'rightIcon' | 'actions'> & { isNew?: boolean };

/**
 * Everything a multi- and a single-select share. The two differ only in the
 * shape of the value they carry, so `value` / `onValueChange` are declared by
 * each of them and everything else lives here.
 */
export interface IReqoreSelectCommonProps
  extends Omit<IReqoreControlGroupProps, 'children' | 'vertical' | 'stack'> {
  items?: TReqoreSelectItem[];
  onItemClick?: (item: IReqoreDropdownItem) => void;
  onItemClickIcon?: IReqoreTagProps['rightIcon'];
  onItemAdded?: (item: TReqoreSelectItem) => void;
  onItemRemoved?: (item: TReqoreSelectItem) => void;
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

/** Holding ONE value — the default. */
export interface IReqoreSelectSingleProps extends IReqoreSelectCommonProps {
  multi?: false;
  value?: string;
  onValueChange: (value?: string) => void;
}

/** Holding MANY values — what `ReqoreMultiSelect` has always been. */
export interface IReqoreSelectMultiProps extends IReqoreSelectCommonProps {
  multi: true;
  value?: string[];
  onValueChange: (value: string[]) => void;
}

/**
 * `multi` decides the SHAPE of the value, so these are a discriminated union
 * rather than one interface with a loose type: a single select hands its
 * caller `string | undefined` and a multi hands back `string[]`, and neither
 * has to narrow what it is given.
 */
export type IReqoreSelectProps = IReqoreSelectSingleProps | IReqoreSelectMultiProps;

/**
 * Internal-only shape. The base always speaks arrays; `single` is what the
 * public component derives from `multi` so that one implementation serves both
 * shapes.
 */
export interface IReqoreSelectBaseProps extends IReqoreSelectCommonProps {
  value?: string[];
  onValueChange: (value: string[]) => void;
  single?: boolean;
}

export interface IReqoreSelectItemProps
  extends Pick<IReqoreSelectCommonProps, 'selectedItemEffect' | 'selectedItemSize' | 'disabled'> {
  item: TReqoreSelectItem;
  onClick?: () => void;
  onRemoveClick?: () => void;
  onItemClickIcon?: IReqoreTagProps['rightIcon'];
}

export const ReqoreSelectItem = memo(
  ({
    item,
    onRemoveClick,
    onClick,
    selectedItemEffect,
    selectedItemSize,
    onItemClickIcon,
    disabled,
  }: IReqoreSelectItemProps) => {
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

export const ReqoreSelectBase = ({
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
}: IReqoreSelectBaseProps) => {
  const [createdItems, setCreatedItems] = useState<TReqoreSelectItem[]>([]);
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
    (item: TReqoreSelectItem): void => {
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
    (item: Partial<TReqoreSelectItem>) => {
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
  const allItems: TReqoreSelectItem[] = useMemo(() => {
    const customItems: TReqoreSelectItem[] = size(createdItems)
      ? [{ divider: true, label: customItemsDividerLabel }, ...createdItems]
      : [];

    let filteredItems: TReqoreSelectItem[] = [...items, ...customItems].filter((item) =>
      query
        ? item.divider
          ? false
          : (item.label || item.value)?.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1
        : true
    );

    // Mark selected items as selected
    filteredItems = filteredItems.map((item: TReqoreSelectItem) => ({
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
      !filteredItems.some((item: TReqoreSelectItem) => item.value === query) &&
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
    (value: string): TReqoreSelectItem => {
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
            <ReqoreSelectItem
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

/**
 * One select. `multi` decides whether it holds one value or many — there is a
 * single implementation, because the two only ever differed in the shape of
 * the value and in whether picking a second item replaces the first.
 */
export const ReqoreSelect = ({
  multi,
  value,
  onValueChange,
  // Holding ONE value changes what several defaults should be, so they are set
  // here rather than in the base — the multi path keeps exactly the defaults it
  // always had, which is what makes `ReqoreMultiSelect` a pure rename.
  //
  // The chip is removable by default because otherwise a value once set could
  // only be cleared by finding it in the list and picking it again, and the
  // labels read in the singular because "No items selected" is wrong for a
  // control that holds at most one.
  canRemoveItems,
  noItemsSelectedLabel,
  noMatchingItemsLabel,
  noItemsAvailableLabel,
  customItemsDividerLabel,
  matchingItemsDividerLabel,
  createItemPlaceholder,
  ...rest
}: IReqoreSelectProps) => {
  const handleValueChange = useCallback(
    (values: string[]) => {
      if (multi) {
        (onValueChange as (value: string[]) => void)(values);
        return;
      }
      (onValueChange as (value?: string) => void)(
        values.length ? values[values.length - 1] : undefined
      );
    },
    [multi, onValueChange]
  );

  const selected = useMemo<string[]>(() => {
    if (multi) {
      return (value as string[]) ?? [];
    }
    // An empty string is a value nobody can see and nobody can remove, so it
    // counts as "nothing selected" the way `undefined` and `null` do.
    return value === undefined || value === null || value === '' ? [] : [value as string];
  }, [multi, value]);

  return (
    <ReqoreSelectBase
      {...rest}
      single={!multi}
      canRemoveItems={canRemoveItems ?? !multi}
      noItemsSelectedLabel={noItemsSelectedLabel ?? (multi ? undefined : 'No value selected')}
      noMatchingItemsLabel={noMatchingItemsLabel ?? (multi ? undefined : 'No existing value found')}
      noItemsAvailableLabel={noItemsAvailableLabel ?? (multi ? undefined : 'No values exist')}
      customItemsDividerLabel={customItemsDividerLabel ?? (multi ? undefined : 'Custom Values')}
      matchingItemsDividerLabel={
        matchingItemsDividerLabel ?? (multi ? undefined : 'Values matching your query')
      }
      createItemPlaceholder={
        createItemPlaceholder ?? (multi ? undefined : 'Type to search or enter a value...')
      }
      value={selected}
      onValueChange={handleValueChange}
    />
  );
};
