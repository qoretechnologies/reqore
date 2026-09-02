import { memo, useCallback, useMemo } from 'react';
import {
  IReqoreMultiSelectCommonProps,
  ReqoreMultiSelectBase,
  TReqoreMultiSelectItem,
} from '../MultiSelect';

export type TReqoreSingleSelectItem = TReqoreMultiSelectItem;

export interface IReqoreSingleSelectProps extends IReqoreMultiSelectCommonProps {
  /** The selected value, or `undefined` when nothing is selected. */
  value?: string;
  /** Called with the new value, or `undefined` when the selection is cleared. */
  onValueChange: (value?: string) => void;
}

/**
 * A single-value picker with the affordances of `ReqoreMultiSelect`: the chosen
 * value is a chip, the candidates are a searchable list, and with
 * `canCreateItems` a value outside that list can be entered.
 *
 * It shares `ReqoreMultiSelect`'s implementation, so the create / chip / custom
 * item machinery behaves identically — it only differs in holding one value:
 * picking another item replaces the current one rather than adding to it, and
 * the list closes once a value is picked.
 *
 * Unlike the multi-select, the chip is removable by default (`canRemoveItems`),
 * because otherwise there is no obvious way to clear a value once one is set.
 */
export const ReqoreSingleSelect = memo(
  ({
    value,
    onValueChange,
    canRemoveItems = true,
    noItemsSelectedLabel = 'No value selected',
    noMatchingItemsLabel = 'No existing value found',
    noItemsAvailableLabel = 'No values exist',
    customItemsDividerLabel = 'Custom Values',
    matchingItemsDividerLabel = 'Values matching your query',
    searchPlaceholder = 'Type to search...',
    createItemPlaceholder = 'Type to search or enter a value...',
    ...rest
  }: IReqoreSingleSelectProps) => {
    // An empty string is a value the user cannot see and cannot remove, so it
    // counts as "nothing selected" the same way `undefined` and `null` do.
    const selected = useMemo<string[]>(
      () => (value === undefined || value === null || value === '' ? [] : [value]),
      [value]
    );

    const handleValueChange = useCallback(
      (values: string[]) => {
        onValueChange(values.length ? values[values.length - 1] : undefined);
      },
      [onValueChange]
    );

    return (
      <ReqoreMultiSelectBase
        {...rest}
        single
        canRemoveItems={canRemoveItems}
        noItemsSelectedLabel={noItemsSelectedLabel}
        noMatchingItemsLabel={noMatchingItemsLabel}
        noItemsAvailableLabel={noItemsAvailableLabel}
        customItemsDividerLabel={customItemsDividerLabel}
        matchingItemsDividerLabel={matchingItemsDividerLabel}
        searchPlaceholder={searchPlaceholder}
        createItemPlaceholder={createItemPlaceholder}
        value={selected}
        onValueChange={handleValueChange}
      />
    );
  }
);
