import { omit, size } from 'lodash';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReqoreDropdown, ReqoreInput } from '../..';
import { TSizes } from '../../constants/sizes';
import { IPopoverControls } from '../../hooks/usePopover';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import { IReqoreDropdownProps } from '../Dropdown';
import { IReqoreDropdownItem } from '../Dropdown/list';
import { IReqoreEffect } from '../Effect';
import { IReqoreInputProps } from '../Input';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';

export type TReqoreMultiSelectItem = Omit<IReqoreDropdownItem, 'color'> &
  Pick<IReqoreTagProps, 'asBadge' | 'rightIcon' | 'actions'> & { isNew?: boolean };

export interface IReqoreMultiSelectProps
  extends Omit<IReqoreControlGroupProps, 'children' | 'vertical' | 'stack'> {
  value?: string[];
  onValueChange: (value: string[]) => void;
  items?: TReqoreMultiSelectItem[];
  onItemClick?: (item: IReqoreDropdownItem) => void;
  onItemClickIcon?: IReqoreTagProps['rightIcon'];
  canRemoveItems?: boolean;
  canCreateItems?: boolean;
  selectedItemEffect?: IReqoreEffect;
  selectedItemSize?: TSizes;
  selectorProps?: Omit<IReqoreInputProps, 'value' | 'onValueChange'> & IReqoreDropdownProps;
  openOnMount?: IReqoreDropdownProps['openOnMount'];
  enterKeySelects?: boolean;
}

export interface IReqoreMultiSelectItemProps
  extends Pick<IReqoreMultiSelectProps, 'selectedItemEffect' | 'selectedItemSize'> {
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
  }: IReqoreMultiSelectItemProps) => {
    if (!item) {
      return null;
    }

    return (
      <ReqoreTag
        {...item}
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

export const ReqoreMultiSelect = ({
  value = [],
  onValueChange,
  onItemClick,
  canRemoveItems,
  canCreateItems,
  items = [],
  selectedItemEffect,
  selectedItemSize,
  selectorProps,
  openOnMount,
  enterKeySelects,
  onItemClickIcon,
  ...rest
}: IReqoreMultiSelectProps) => {
  const [createdItems, setCreatedItems] = useState<TReqoreMultiSelectItem[]>([]);
  const [query, setQuery] = useState<string>('');
  const popoverData = useRef<IPopoverControls>(undefined);
  const [focused, setFocused] = useState<boolean>(false);

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
        onValueChange(value.filter((v) => v !== item.value));
      } else {
        onValueChange([...value, item.value]);
      }
    },
    [value]
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
    },
    [createdItems, value]
  );

  /*
    This code creates a list of all items that are available
    for selection in the dropdown. It will include the items
    that are passed in as props, as well as any items that the
    user has created.
    */
  const allItems: TReqoreMultiSelectItem[] = useMemo(() => {
    const customItems: TReqoreMultiSelectItem[] = size(createdItems)
      ? [{ divider: true, label: 'Custom Items' }, ...createdItems]
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

    if (query && !size(filteredItems)) {
      filteredItems = [
        { label: 'No existing items found', readOnly: true, minimal: true, icon: 'ForbidLine' },
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
          label: `Create new "${query}"`,
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
        { divider: true, label: 'Items matching your query' },
        ...filteredItems,
      ];
    }

    return filteredItems;
  }, [items, createdItems, query, value]);

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
      return [...items, ...createdItems].find((item) => item.value === value);
    },
    [items, createdItems, value]
  );

  return (
    <ReqoreControlGroup vertical fluid {...rest}>
      <ReqoreTagGroup minimal={rest.minimal} size={rest.size}>
        {size(value) ? (
          value.map((v) => (
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
            />
          ))
        ) : (
          <ReqoreTag color='transparent' icon='ForbidLine' label='No items selected' />
        )}
      </ReqoreTagGroup>
      <ReqoreControlGroup minimal={rest.minimal} flat={rest.flat} size={rest.size}>
        <ReqoreDropdown<IReqoreInputProps>
          {...selectorProps}
          multiSelect
          handler='focus'
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          passPopoverData={(data) => (popoverData.current = data)}
          component={ReqoreInput}
          onClearClick={() => setQuery('')}
          value={query}
          isDefaultOpen={openOnMount}
          onItemSelect={handleItemSelect}
          placeholder={canCreateItems ? 'Type to search or create an item...' : 'Type to search...'}
          onChange={(e: any) => setQuery(e.target.value)}
          items={
            size(allItems)
              ? allItems
              : canCreateItems
              ? [{ label: 'No items exist', readOnly: true, minimal: true, icon: 'ForbidLine' }]
              : []
          }
          useTargetWidth
        />
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  );
};
