import { map, size } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../..';
import { TReqorePaginationType } from '../../constants/paging';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { ReqorePaginationContainer } from '../../containers/Paging';
import { useQueryWithDelay } from '../../hooks/useQueryWithDelay';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreColumnsProps, StyledColumns } from '../Columns';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import ReqoreMessage from '../Message';
import {
  IReqorePanelAction,
  IReqorePanelProps,
  IReqorePanelSubAction,
  ReqorePanel,
  TReqorePanelActions,
} from '../Panel';
import { ReqoreVerticalSpacer } from '../Spacer';
import { getZoomActions, sizeToZoom, sortTableData, zoomToSize } from '../Table/helpers';
import { IReqoreCollectionItemProps, ReqoreCollectionItem } from './item';

export interface IReqoreCollectionProps extends IReqorePanelProps, IReqoreColumnsProps {
  items?: IReqoreCollectionItemProps[];
  inputProps?: IReqoreInputProps;
  inputInTitle?: boolean;

  sortButtonProps?: IReqorePanelAction;
  displayButtonProps?: IReqorePanelAction;
  stacked?: boolean;
  rounded?: boolean;
  height?: string;
  fill?: boolean;
  maxItemHeight?: number;

  defaultQuery?: string;
  defaultZoom?: 0 | 0.5 | 1 | 1.5 | 2;
  defaultSort?: 'asc' | 'desc';
  defaultSortBy?: string;

  sortKeys?: Record<string, string>;

  filterable?: boolean;
  sortable?: boolean;
  zoomable?: boolean;

  showAs?: 'list' | 'grid';
  showSelectedFirst?: boolean;
  selectedIcon?: IReqoreIconName;
  searchDelay?: number;

  contentRenderer?: (
    children: React.ReactNode,
    items: IReqoreCollectionItemProps[],
    searchInput?: React.ReactNode
  ) => React.ReactNode;

  onQueryChange?: (query: string | number) => void;

  emptyMessage?: string;
  sortButtonTooltip?: (sort?: 'asc' | 'desc') => string;
  displayButtonTooltip?: (display?: 'list' | 'grid') => string;
  inputPlaceholder?: (items?: IReqoreCollectionItemProps[]) => string;

  paging?: TReqorePaginationType<IReqoreCollectionItemProps>;
}

export const StyledCollectionWrapper = styled(StyledColumns)`
  height: ${({ height }) => (height ? `${height}` : 'auto')};
  flex: ${({ fill }) => (fill ? 1 : undefined)};

  ${({ rounded, stacked }: IReqoreCollectionProps) =>
    (!rounded || stacked) &&
    css`
      border-radius: ${stacked && rounded ? '10px' : undefined};
    `}

  overflow: auto;
  position: relative;
`;

export const zoomToWidth = {
  0: '200px',
  0.5: '300px',
  1: '400px',
  1.5: '500px',
  2: '600px',
};

export const ReqoreCollection = ({
  items,
  stacked,
  rounded = true,
  fill,
  maxItemHeight,
  filterable,
  inputInTitle = true,

  sortable,
  zoomable,

  defaultZoom,
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

  defaultQuery,
  defaultSort = 'asc',
  defaultSortBy = 'label',

  sortKeys = {},

  onQueryChange,
  contentRenderer = (children, _items, searchInput) => (
    <>
      {searchInput}
      {!!searchInput && <ReqoreVerticalSpacer height={PADDING_FROM_SIZE.normal} />}
      {children}
    </>
  ),
  searchDelay = 300,
  emptyMessage = 'No data in this collection, try changing your search query or filters',
  sortButtonTooltip = (sort) => (sort === 'desc' ? 'Sort ascending' : 'Sort descending'),
  displayButtonTooltip = (display) => (display === 'grid' ? 'Show as list' : 'Show as grid'),
  inputPlaceholder = (items) => `Search in ${size(items)} items`,
  paging,
  height,

  // Columns props
  minColumnWidth,
  maxColumnWidth,
  columns,
  alignItems,
  columnsGap = '10px',

  ...rest
}: IReqoreCollectionProps) => {
  const [_showAs, setShowAs] = useState<'list' | 'grid'>(showAs);
  const [sort, setSort] = useState<'asc' | 'desc'>(defaultSort);
  const [sortBy, setSortBy] = useState<string>(defaultSortBy);
  const [contentRef, setContentRef] = useState<HTMLDivElement>(undefined);
  const isMobile = useReqoreProperty('isMobile');
  const [zoom, setZoom] = useState<number>(defaultZoom || sizeToZoom.normal);

  const { query, setQuery, preQuery, setPreQuery } = useQueryWithDelay(
    defaultQuery,
    searchDelay,
    onQueryChange
  );

  useUpdateEffect(() => {
    setShowAs(showAs);
  }, [showAs]);

  const sortedItems: IReqoreCollectionItemProps[] = useMemo(() => {
    if (!sortable) {
      return items;
    }

    const _sortBy = !!sortKeys[sortBy] ? (v) => v?.metadata?.[sortBy] : sortBy;

    if (showSelectedFirst) {
      // Filter out the selected items
      const selectedItems = items.filter((item) => item.selected);
      // Filter out the unselected items
      const unselectedItems = items.filter((item) => !item.selected);
      // Sort the selected items
      const sortedSelectedItems = sortTableData(selectedItems, {
        by: _sortBy,
        direction: sort,
      });
      // Sort the unselected items
      const sortedUnselectedItems = sortTableData(unselectedItems, {
        by: _sortBy,
        direction: sort,
      });

      return [...sortedSelectedItems, ...sortedUnselectedItems];
    }

    return sortTableData(items, {
      by: _sortBy,
      direction: sort,
    });
  }, [items, sort, sortBy, showSelectedFirst, sortable]);

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

  const handlePreQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreQuery(event.target.value);
  };

  const finalActions: TReqorePanelActions = useMemo(() => {
    let actions: TReqorePanelActions = rest.actions ? [...rest.actions] : [];

    const toolbarGroup: IReqorePanelAction = {
      responsive: false,
      icon: 'MoreLine',
      className: 'reqore-collection-more',
      actions: [
        {
          icon: _showAs === 'grid' ? 'ListUnordered' : 'GridLine',
          onClick: () => setShowAs(_showAs === 'grid' ? 'list' : 'grid'),
          tooltip: displayButtonTooltip(_showAs),
          label: displayButtonTooltip(_showAs),
          disabled: !size(filteredItems),
          ...displayButtonProps,
        },
      ],
    };

    if (zoomable) {
      toolbarGroup.actions = [
        ...toolbarGroup.actions,
        { divider: true, line: true },
        ...getZoomActions('reqore-collection', zoom, setZoom, true),
      ];
    }

    if (filterable && inputInTitle) {
      actions = [
        ...actions,
        {
          as: ReqoreInput,
          props: {
            key: 'search',
            fixed: false,
            placeholder: inputPlaceholder(items),
            onClearClick: () => {
              setQuery('');
              setPreQuery('');
            },
            onChange: handlePreQueryChange,
            value: preQuery,
            icon: 'Search2Line',
            minimal: false,
            ...inputProps,
          },
        },
      ];
    }

    if (sortable) {
      const _sortKeys = {
        label: 'Label',
        intent: 'Intent',
        ...sortKeys,
      };

      actions.push({
        icon: sort === 'desc' ? 'SortDesc' : 'SortAsc',
        tooltip: sortButtonTooltip(sort),
        className: 'reqore-collection-sort',
        fixed: true,
        fluid: false,
        disabled: !size(filteredItems),
        actions: [
          {
            divider: true,
            label: 'Sort by',
            dividerAlign: 'left',
            minimal: true,
            dividerPadded: 'bottom',
          },
          ...map(
            _sortKeys,
            (label, key): IReqorePanelSubAction => ({
              label,
              selected: sortBy === key,
              onClick: () => {
                setSortBy(key);
                setSort(sort === 'desc' ? 'asc' : 'desc');
              },
            })
          ),
        ],
        ...sortButtonProps,
      });
    }

    return [...actions, toolbarGroup];
  }, [
    filterable,
    preQuery,
    query,
    rest.actions,
    _showAs,
    sort,
    sortable,
    filteredItems,
    isMobile,
    zoom,
    zoomable,
  ]);

  const renderContent = useCallback(() => {
    return contentRenderer(
      <ReqorePaginationContainer
        key='paging-container'
        items={filteredItems}
        type={paging}
        size={rest.size}
        scrollContainer={contentRef}
      >
        {(_items, _children, { applyPaging }) =>
          !size(applyPaging(filteredItems)) ? (
            <ReqoreMessage flat icon='Search2Line'>
              {emptyMessage}
            </ReqoreMessage>
          ) : (
            <StyledCollectionWrapper
              columns={columns || (_showAs === 'grid' ? 'auto-fit' : 1)}
              columnsGap={stacked ? '0px' : columnsGap}
              rounded={rounded}
              stacked={stacked}
              fill={fill}
              ref={setContentRef}
              height={height}
              alignItems={alignItems}
              minColumnWidth={minColumnWidth || zoomToWidth[zoom]}
              maxColumnWidth={maxColumnWidth}
              className='reqore-collection-content'
            >
              {applyPaging(filteredItems)?.map((item, index) => (
                <ReqoreCollectionItem
                  size={zoomToSize[zoom]}
                  responsiveTitle={false}
                  {...item}
                  icon={item.icon || (item.selected ? selectedIcon : undefined)}
                  key={index}
                  rounded={!stacked}
                  maxContentHeight={maxItemHeight}
                >
                  {item.content}
                </ReqoreCollectionItem>
              ))}
            </StyledCollectionWrapper>
          )
        }
      </ReqorePaginationContainer>,
      filteredItems,
      !inputInTitle && filterable ? (
        <ReqoreControlGroup>
          <ReqoreInput
            key='search'
            fixed={false}
            placeholder={inputPlaceholder(items)}
            onClearClick={() => {
              setQuery('');
              setPreQuery('');
            }}
            onChange={handlePreQueryChange}
            value={preQuery}
            icon='Search2Line'
            minimal={false}
            size={rest.size}
            {...inputProps}
          />
        </ReqoreControlGroup>
      ) : undefined
    );
  }, [
    contentRenderer,
    filteredItems,
    _showAs,
    columnsGap,
    emptyMessage,
    maxItemHeight,
    rest,
    rounded,
    selectedIcon,
    stacked,
    zoom,
  ]);

  return (
    <ReqorePanel
      {...rest}
      headerSize={headerSize}
      style={{
        ...rest.style,
      }}
      fill={fill}
      contentStyle={{
        overflow: fill ? 'hidden' : 'auto',
        display: 'flex',
        flexFlow: 'column',
      }}
      transparent={transparent}
      minimal={minimal}
      flat={flat}
      actions={finalActions}
      className={`reqore-collection ${rest.className || ''}`}
    >
      {renderContent()}
    </ReqorePanel>
  );
};
