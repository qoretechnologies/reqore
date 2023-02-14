import { size } from 'lodash';
import { useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreColumnsProps, StyledColumns } from '../Columns';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import ReqoreMessage from '../Message';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel, TReqorePanelActions } from '../Panel';
import { ReqoreVerticalSpacer } from '../Spacer';
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
      | 'responsiveActions'
      | 'padded'
    >,
    IReqoreColumnsProps {
  items?: IReqoreCollectionItemProps[];
  inputProps?: IReqoreInputProps;
  sortButtonProps?: IReqorePanelAction;
  displayButtonProps?: IReqorePanelAction;
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

  childrenBefore?: React.ReactNode;
  childrenAfter?: React.ReactNode;

  onQueryChange?: (query: string) => void;

  emptyMessage?: string;
  sortButtonTooltip?: (sort?: 'asc' | 'desc') => string;
  displayButtonTooltip?: (display?: 'list' | 'grid') => string;
  inputPlaceholder?: (items?: IReqoreCollectionItemProps[]) => string;
}

export const StyledCollectionWrapper = styled(StyledColumns)`
  height: ${({ height }) => (height ? `${height}` : 'auto')};

  ${({ rounded, stacked }: IReqoreCollectionProps) =>
    (!rounded || stacked) &&
    css`
      border-radius: ${stacked && rounded ? '10px' : undefined};
    `}

  overflow: auto;
  position: relative;
`;

export const ReqoreCollection = ({
  items,
  columnsGap = '10px',
  stacked,
  rounded = true,
  fill,
  maxItemHeight,
  filterable,
  sortable,
  showSelectedFirst,
  inputProps,
  sortButtonProps,
  displayButtonProps,
  headerSize = 2,
  showAs = 'grid',
  selectedIcon,
  flat = true,
  minimal,
  transparent = true,
  onQueryChange,
  childrenBefore,
  childrenAfter,
  emptyMessage = 'No data in this collection, try changing your search query or filters',
  sortButtonTooltip = (sort) => (sort === 'desc' ? 'Sort ascending' : 'Sort descending'),
  displayButtonTooltip = (display) => (display === 'grid' ? 'Show as list' : 'Show as grid'),
  inputPlaceholder = (items) => `Search in ${size(items)} items`,
  ...rest
}: IReqoreCollectionProps) => {
  const [_showAs, setShowAs] = useState<'list' | 'grid'>(showAs);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [query, setQuery] = useState<string>('');

  useUpdateEffect(() => {
    setShowAs(showAs);
  }, [showAs]);

  useUpdateEffect(() => {
    onQueryChange?.(query);
  }, [query]);

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
      const text = `${item.label}${item.content?.toString()}${item.expandedContent?.toString()}${
        item.searchString || ''
      }`;

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
  const finalActions: TReqorePanelActions = useMemo(() => {
    let actions: TReqorePanelActions = rest.actions ? [...rest.actions] : [];

    const toolbarGroup: IReqorePanelAction = {
      responsive: false,
      group: [
        {
          icon: _showAs === 'grid' ? 'ListOrdered' : 'GridLine',
          onClick: () => setShowAs(_showAs === 'grid' ? 'list' : 'grid'),
          tooltip: displayButtonTooltip(_showAs),
          disabled: !size(finalItems),
          ...displayButtonProps,
        },
      ],
    };

    if (sortable) {
      toolbarGroup.group.push({
        icon: sort === 'desc' ? 'SortDesc' : 'SortAsc',
        onClick: () => setSort(sort === 'desc' ? 'asc' : 'desc'),
        tooltip: sortButtonTooltip(sort),
        disabled: !size(finalItems),
        ...sortButtonProps,
      });
    }

    if (filterable) {
      actions = [
        ...actions,
        {
          as: ReqoreInput,
          props: {
            key: 'search',
            fixed: false,
            placeholder: inputPlaceholder(finalItems),
            onClearClick: () => setQuery(''),
            onChange: handleQueryChange,
            value: query,
            icon: 'Search2Line',
            minimal: false,
            ...inputProps,
          },
        },
      ];
    }

    return [...actions, toolbarGroup];
  }, [filterable, handleQueryChange, query, rest.actions, _showAs, sort, sortable, finalItems]);

  return (
    <ReqorePanel
      {...rest}
      headerSize={headerSize}
      style={{
        ...rest.style,
      }}
      fill={fill}
      transparent={transparent}
      minimal={minimal}
      flat={flat}
      actions={finalActions}
      className={`reqore-collection ${rest.className || ''}`}
    >
      {childrenBefore ? (
        <>
          {childrenBefore}
          <ReqoreVerticalSpacer height={PADDING_FROM_SIZE[rest.size || 'normal']} />
        </>
      ) : null}
      {!size(finalItems) ? (
        <ReqoreMessage flat icon='Search2Line'>
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
          {finalItems?.map((item, index) => (
            <ReqoreCollectionItem
              size={rest.size}
              {...item}
              icon={item.icon || (item.selected ? selectedIcon : undefined)}
              key={index}
              rounded={!stacked}
              maxContentHeight={maxItemHeight}
            />
          ))}
        </StyledCollectionWrapper>
      )}
      {childrenAfter ? (
        <>
          <ReqoreVerticalSpacer height={PADDING_FROM_SIZE[rest.size || 'normal']} />
          {childrenAfter}
        </>
      ) : null}
    </ReqorePanel>
  );
};
