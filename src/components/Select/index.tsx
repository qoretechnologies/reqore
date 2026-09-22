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
import { selectItemLabel, structuredValueTooltip } from '../../helpers/selectItem';
import { selectItemTooltip } from './valuePreview';

/**
 * What a select can hold. A value is matched against `item.value` by identity,
 * so any scalar works; the props take the kind a consumer holds as a type
 * parameter, defaulting to `string`.
 */
export type TReqoreSelectValue = string | number | boolean;

/**
 * One candidate in the list.
 *
 * `value` follows what the select holds, so an item of another kind — the one
 * identity matching can never select — is a type error rather than a row that
 * silently does nothing when clicked.
 *
 * `object` stays allowed whatever the select holds: a structured value (a hash
 * preset, as Qorus forms use) is matched by reference like any other, and it is
 * the case `selectItemTooltip` exists for. What the select then hands its
 * caller is outside `TReqoreSelectValue`, which is the one place the runtime is
 * wider than the types — see `selectedItemValue`.
 */
export type TReqoreSelectItem<TValue extends TReqoreSelectValue = string> = Omit<
  IReqoreDropdownItem,
  'color' | 'value'
> &
  Pick<IReqoreTagProps, 'asBadge' | 'rightIcon' | 'actions'> & {
    isNew?: boolean;
    value?: TValue | object;
  };

/**
 * The one narrowing between an item's value and the select's.
 *
 * An item may carry a structured value, which `TReqoreSelectValue` does not
 * describe; a select over such values holds them all the same, because holding
 * is identity. Written once, here, rather than at each of the places a picked
 * item becomes the selection.
 */
const selectedItemValue = <TValue extends TReqoreSelectValue>(
  item: Pick<TReqoreSelectItem<TValue>, 'value'>
): TValue => item.value as TValue;

/**
 * The item a user makes by typing.
 *
 * Its value IS the text typed, and `TReqoreSelectCanCreateItems` only offers
 * creation where a string is one of the things the select may hold — so the
 * narrowing here is sound, and it is written once rather than at each of the
 * two places a typed value becomes an item.
 */
const createdSelectItem = <TValue extends TReqoreSelectValue>(
  query: string,
  item: Omit<TReqoreSelectItem<TValue>, 'value'> = {}
): TReqoreSelectItem<TValue> => ({ ...item, value: query as TValue });

/**
 * Whether a select can offer to create what the user typed.
 *
 * A created item's value IS the text typed, so creation is available exactly
 * where a string is one of the things the select may hold — `string`, or a
 * union including it. A select over numbers or flags cannot offer it: its
 * `canCreateItems` is `never`, so passing it is a type error here rather than
 * a string arriving in a consumer's `onValueChange(value: number[])` at
 * runtime.
 */
export type TReqoreSelectCanCreateItems<TValue extends TReqoreSelectValue> = [string] extends (
  [TValue]
) ?
  boolean
: never;

/**
 * Everything a multi- and a single-select share. The two differ only in the
 * shape of the value they carry, so `value` / `onValueChange` are declared by
 * each of them and everything else lives here.
 */
export interface IReqoreSelectCommonProps<TValue extends TReqoreSelectValue = string> extends Omit<
  IReqoreControlGroupProps,
  'children' | 'vertical' | 'stack'
> {
  items?: TReqoreSelectItem<TValue>[];
  onItemClick?: (item: TReqoreSelectItem<TValue>) => void;
  onItemClickIcon?: IReqoreTagProps['rightIcon'];
  /** Called with the VALUE that was added, once it is part of the selection. */
  onItemAdded?: (value: TValue) => void;
  /** Called with the VALUE that was removed, once it has left the selection. */
  onItemRemoved?: (value: TValue) => void;
  canRemoveItems?: boolean;
  /**
   * Lets the user add a value that no item offers. The value created is the
   * text they typed, so this is offered only by a select over strings — see
   * `TReqoreSelectCanCreateItems`.
   */
  canCreateItems?: TReqoreSelectCanCreateItems<TValue>;
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
export interface IReqoreSelectSingleProps<
  TValue extends TReqoreSelectValue = string,
> extends IReqoreSelectCommonProps<TValue> {
  multi?: false;
  value?: TValue;
  onValueChange: (value?: TValue) => void;
}

/** Holding MANY values — what `ReqoreMultiSelect` has always been. */
export interface IReqoreSelectMultiProps<
  TValue extends TReqoreSelectValue = string,
> extends IReqoreSelectCommonProps<TValue> {
  multi: true;
  value?: TValue[];
  onValueChange: (value: TValue[]) => void;
}

/**
 * `multi` decides the SHAPE of the value, so these are a discriminated union
 * rather than one interface with a loose type: a single select hands its
 * caller `string | undefined` and a multi hands back `string[]`, and neither
 * has to narrow what it is given.
 */
export type IReqoreSelectProps<TValue extends TReqoreSelectValue = string> =
  IReqoreSelectSingleProps<TValue> | IReqoreSelectMultiProps<TValue>;

/**
 * Internal-only shape. The base always speaks arrays; `single` is what the
 * public component derives from `multi` so that one implementation serves both
 * shapes.
 */
export interface IReqoreSelectBaseProps<
  TValue extends TReqoreSelectValue = string,
> extends IReqoreSelectCommonProps<TValue> {
  value?: TValue[];
  onValueChange: (value: TValue[]) => void;
  single?: boolean;
}

export interface IReqoreSelectItemProps
  extends Pick<IReqoreSelectCommonProps, 'selectedItemEffect' | 'selectedItemSize' | 'disabled'> {
  /** Whatever a select holds: the chip draws an item, it does not match one. */
  item: TReqoreSelectItem<TReqoreSelectValue>;
  onClick?: () => void;
  onRemoveClick?: () => void;
  onItemClickIcon?: IReqoreTagProps['rightIcon'];
}

/* The item-label and preview-string rules live in `helpers/selectItem`, because
   the dropdown's own rows apply them too and reaching back into this module for
   them closed a cycle (see the note there); the rendered preview they feed is
   `./valuePreview`, which only this module reaches. Both re-exported here
   because this is where consumers and tests have always found them. */
export { selectItemLabel, structuredValueTooltip };
export { selectItemTooltip } from './valuePreview';

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

    /**
     * A select item carries two different things: how it should LOOK (label,
     * icon, actions, intent — what a tag renders) and what it MEANS (the value
     * it stands for, its metadata, whether the user just created it).
     *
     * Only the first belongs on the tag. `ReqoreTag` extends
     * `React.HTMLAttributes` and spreads whatever it does not consume straight
     * onto the rendered element, so passing the whole item put the item's own
     * data on the DOM node — and `value` is a real HTML attribute, so React
     * kept it. A structured value (a hash allowed-value, as Qorus forms use)
     * has no string form, so it arrived as `value="[object Object]"`: the fact
     * that an object exists, rendered where its contents should be.
     *
     * Stripped here rather than at every call site, because the item shape is
     * this file's own and a consumer has no way to know which of its keys the
     * tag would forward.
     */
    const {
      value,
      metadata,
      items,
      divider,
      dividerAlign,
      dividerPadded,
      line,
      isNew,
      ...presentation
    } = item;

    return (
      <ReqoreTag
        {...presentation}
        disabled={disabled || item.disabled}
        /* An unlabelled item falls back to showing its own value — see
           `selectItemLabel`, which the dropdown's rows use too. */
        label={selectItemLabel(item)}
        /* The item's own tooltip always wins — this only fills the gap where a
           structured value would otherwise be invisible behind its label. */
        tooltip={selectItemTooltip(item)}
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

export const ReqoreSelectBase = <TValue extends TReqoreSelectValue = string>({
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
}: IReqoreSelectBaseProps<TValue>) => {
  const [createdItems, setCreatedItems] = useState<TReqoreSelectItem<TValue>[]>([]);
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
    (item: TReqoreSelectItem<TValue>): void => {
      const itemValue = selectedItemValue(item);

      if (value.includes(itemValue)) {
        onValueChange(single ? [] : value.filter((v) => v !== itemValue));
        onItemRemoved?.(itemValue);
      } else {
        // A single select holds one value, so picking another replaces it
        // rather than adding to it.
        onValueChange(single ? [itemValue] : [...value, itemValue]);
        onItemAdded?.(itemValue);
      }
    },
    [value, onValueChange, onItemAdded, onItemRemoved, single]
  );

  const handleItemSelect = useCallback(
    (item: Partial<TReqoreSelectItem<TValue>>) => {
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
  const allItems: TReqoreSelectItem<TValue>[] = useMemo(() => {
    const customItems: TReqoreSelectItem<TValue>[] = size(createdItems)
      ? [{ divider: true, label: customItemsDividerLabel }, ...createdItems]
      : [];

    let filteredItems: TReqoreSelectItem<TValue>[] = [...items, ...customItems].filter((item) =>
      query
        ? item.divider
          ? false
          : (item.label || item.value)?.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1
        : true
    );

    // Mark selected items as selected
    filteredItems = filteredItems.map((item: TReqoreSelectItem<TValue>) => ({
      ...omit(item, ['actions', 'asBadge', 'rightIcon']),
      selected: value.includes(selectedItemValue(item)),
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
      !filteredItems.some((item: TReqoreSelectItem<TValue>) => item.value === query) &&
      canCreateItems
    ) {
      filteredItems = [
        createdSelectItem<TValue>(query, {
          label: `${createItemLabelPrefix} "${query}"`,
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
        }),
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
          handleItemSelect(createdSelectItem<TValue>(query, { isNew: true }));
        }
      }
    },
    [items, createdItems, query, canCreateItems, focused]
  );

  const getItemByValue = useCallback(
    (value: TValue): TReqoreSelectItem<TValue> => {
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
              // a value may be a boolean, which is not a valid key
              key={`${typeof v}:${v}`}
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
 *
 * One signature per shape: through the union, JSX cannot tell which `value` a
 * consumer passed, so it could not infer what the select holds.
 */
export function ReqoreSelect<TValue extends TReqoreSelectValue = string>(
  props: IReqoreSelectMultiProps<TValue>
): JSX.Element;
export function ReqoreSelect<TValue extends TReqoreSelectValue = string>(
  props: IReqoreSelectSingleProps<TValue>
): JSX.Element;
export function ReqoreSelect<TValue extends TReqoreSelectValue = string>({
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
}: IReqoreSelectProps<TValue>): JSX.Element {
  const handleValueChange = useCallback(
    (values: TValue[]) => {
      if (multi) {
        (onValueChange as (value: TValue[]) => void)(values);
        return;
      }
      (onValueChange as (value?: TValue) => void)(
        values.length ? values[values.length - 1] : undefined
      );
    },
    [multi, onValueChange]
  );

  const selected = useMemo<TValue[]>(() => {
    if (multi) {
      return (value as TValue[]) ?? [];
    }
    // An empty string is a value nobody can see and nobody can remove, so it
    // counts as "nothing selected" the way `undefined` and `null` do.
    return value === undefined || value === null || value === '' ? [] : [value as TValue];
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
}
