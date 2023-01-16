import { size } from 'lodash';
import { useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreColumnsProps, StyledColumns } from '../Columns';
import ReqoreInput from '../Input';
import ReqoreMessage from '../Message';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel } from '../Panel';
import { sortTableData } from '../Table/helpers';
import { IReqoreCollectionItemProps, ReqoreCollectionItem } from './item';

export interface IReqoreCollectionProps
  extends Pick<
      IReqorePanelProps,
      | 'size'
      | 'intent'
      | 'customTheme'
      | 'actions'
      | 'bottomActions'
      | 'label'
      | 'headerSize'
      | 'badge'
      | 'icon'
      | 'flat'
      | 'minimal'
      | 'transparent'
      | 'fluid'
    >,
    IReqoreColumnsProps {
  items?: IReqoreCollectionItemProps[];
  stacked?: boolean;
  rounded?: boolean;
  height?: string;
  fill?: boolean;
  maxItemHeight?: number;
  filterable?: boolean;
  sortable?: boolean;
  showAs?: 'list' | 'grid';
  showSelectedFirst?: boolean;
  selectedIcon?: IReqoreIconName;
  emptyMessage?: string;
}

export const StyledCollectionWrapper = styled(StyledColumns)`
  height: ${({ height }) => (height ? `${height}px` : 'auto')};

  ${({ rounded, stacked }: IReqoreCollectionProps) =>
    (!rounded || stacked) &&
    css`
      border-radius: ${stacked && rounded ? '10px' : undefined};
    `}

  overflow: hidden;
  position: relative;
`;

export const ReqoreCollection = ({
  items,
  columnsGap = '10px',
  stacked,
  rounded = true,
  fill,
  height,
  maxItemHeight,
  filterable,
  sortable,
  showSelectedFirst,
  headerSize = 2,
  showAs = 'grid',
  selectedIcon,
  flat = true,
  minimal,
  transparent = true,
  emptyMessage = 'No data in this collection, try changing your search query or filters',
  ...rest
}: IReqoreCollectionProps) => {
  const [_showAs, setShowAs] = useState<'list' | 'grid'>(showAs);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [query, setQuery] = useState<string>('');

  useUpdateEffect(() => {
    setShowAs(showAs);
  }, [showAs]);

  const sortedItems: IReqoreCollectionItemProps[] = useMemo(() => {
    if (!sortable) {
      return items;
    }

    if (showSelectedFirst) {
      // Filter out the selected items
      const selectedItems = items.filter((item) => item.selected);
      // Filter out the unselected items
      const unselectedItems = items.filter((item) => !item.selected);
      // Sort the selected items
      const sortedSelectedItems = sortTableData(selectedItems, {
        by: 'label',
        direction: sort,
      });
      // Sort the unselected items
      const sortedUnselectedItems = sortTableData(unselectedItems, {
        by: 'label',
        direction: sort,
      });

      return [...sortedSelectedItems, ...sortedUnselectedItems];
    }

    return sortTableData(items, {
      by: 'label',
      direction: sort,
    });
  }, [items, sort]);

  const filteredItems: IReqoreCollectionItemProps[] = useMemo(() => {
    if (!filterable || query === '') {
      return sortedItems;
    }

    return sortedItems.filter((item) => {
      const text = `${item.label}${item.content?.toString()}${item.expandedContent?.toString()}`;

      if (!text) {
        return false;
      }

      return text.toString().toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
  }, [items, query, sortedItems]);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const finalItems = filteredItems;
  const finalActions: (IReqorePanelAction[] | IReqorePanelAction)[] = useMemo(() => {
    let actions: (IReqorePanelAction[] | IReqorePanelAction)[] = rest.actions
      ? [...rest.actions]
      : [];

    if (filterable) {
      actions = [
        ...actions,
        {
          as: ReqoreInput,
          props: {
            placeholder: `Filter ${size(items)} items`,
            onClearClick: () => setQuery(''),
            onChange: handleQueryChange,
            value: query,
            icon: 'Search2Line',
            minimal: false,
          },
        },
      ];
    }

    if (sortable) {
      actions = [
        ...actions,
        {
          icon: sort === 'desc' ? 'SortDesc' : 'SortAsc',
          onClick: () => setSort(sort === 'desc' ? 'asc' : 'desc'),
          tooltip: sort === 'desc' ? 'Sort ascending' : 'Sort descending',
          disabled: !size(finalItems),
          responsive: false,
        },
      ];
    }

    return [
      ...actions,
      {
        icon: _showAs === 'grid' ? 'ListOrdered' : 'GridLine',
        onClick: () => setShowAs(_showAs === 'grid' ? 'list' : 'grid'),
        tooltip: _showAs === 'grid' ? 'Show as list' : 'Show as grid',
        disabled: !size(finalItems),
        responsive: false,
      },
    ];
  }, [filterable, handleQueryChange, query, rest.actions, _showAs, sort, sortable, finalItems]);

  return (
    <ReqorePanel
      {...rest}
      headerSize={headerSize}
      style={{
        ...rest.style,
        height: height ?? undefined,
      }}
      fill={fill}
      padded
      transparent={transparent}
      minimal={minimal}
      flat={flat}
      actions={finalActions}
      className={`reqore-collection ${rest.className || ''}`}
    >
      {!size(finalItems) ? (
        <ReqoreMessage intent='muted' flat title='No items found'>
          {emptyMessage}
        </ReqoreMessage>
      ) : (
        <StyledCollectionWrapper
          columns={_showAs === 'grid' ? 'auto-fit' : 1}
          columnsGap={stacked ? '0px' : columnsGap}
          rounded={rounded}
          stacked={stacked}
          {...rest}
        >
          {finalItems?.map((item) => (
            <ReqoreCollectionItem
              {...item}
              icon={item.icon || (item.selected ? selectedIcon : undefined)}
              key={item.id || item.label.toString()}
              rounded={!stacked}
              maxContentHeight={maxItemHeight}
            />
          ))}
        </StyledCollectionWrapper>
      )}
    </ReqorePanel>
  );
};
