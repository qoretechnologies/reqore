import { map, size } from 'lodash';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreErrorBoundary, ReqoreP, useReqoreProperty } from '../..';
import { TReqorePaginationType } from '../../constants/paging';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { ReqorePaginationContainer } from '../../containers/Paging';
import { useQueryWithDelay } from '../../hooks/useQueryWithDelay';
import { IReqoreComponent } from '../../types/global';
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
  ReqorePanelSkeleton,
} from '../Panel';
import { ReqoreSkeleton } from '../Skeleton';
import { ReqoreVerticalSpacer } from '../Spacer';
import { getZoomActions, sizeToZoom, sortTableData, zoomToSize } from '../Table/helpers';
import { IReqoreCollectionItemProps, ReqoreCollectionItem } from './item';

export type TReqoreCollectionActions = (IReqorePanelAction & { position?: 'left' | 'right' })[];
export interface IReqoreCollectionProps
  extends IReqoreComponent,
    Omit<IReqorePanelProps, 'actions'>,
    IReqoreColumnsProps {
  items?: IReqoreCollectionItemProps[];
  inputProps?: IReqoreInputProps;
  inputInTitle?: boolean;

  actions?: TReqoreCollectionActions;

  sortButtonProps?: IReqorePanelAction;
  displayButtonProps?: IReqorePanelSubAction;
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
  showLayoutSwitch?: boolean;
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

interface IStyledCollectionWrapperInternal {
  $height?: string;
  $fill?: boolean;
  $rounded?: boolean;
  $stacked?: boolean;
}

export const StyledCollectionWrapper = styled(StyledColumns).withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<IStyledCollectionWrapperInternal>`
  height: ${({ $height }) => ($height ? `${$height}` : 'auto')};
  flex: ${({ $fill }) => ($fill ? 1 : undefined)};

  ${({ $rounded, $stacked }: IStyledCollectionWrapperInternal) =>
    (!$rounded || $stacked) &&
    css`
      border-radius: ${$stacked && $rounded ? '10px' : undefined};
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

export const ReqoreCollection = memo(
  ({
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
    labelSize = 2,
    showAs = 'grid',
    showLayoutSwitch = true,
    selectedIcon,
    flat = true,
    minimal,
    transparent = true,

    defaultQuery,
    defaultSort = 'asc',
    defaultSortBy = 'label',

    skeleton,

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

    errorBoundaryOptions,

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
      if (!size(items)) {
        return [];
      }

      const _sortBy = !!sortKeys[sortBy] ? (v) => v?.metadata?.[sortBy] : sortBy;

      if (!_sortBy && !showSelectedFirst) {
        return items;
      }

      if (showSelectedFirst) {
        // Filter out the selected items
        const selectedItems = items.filter((item) => item.selected);
        // Filter out the unselected items
        const unselectedItems = items.filter((item) => !item.selected);
        // Sort the selected items
        const sortedSelectedItems = sortTableData(selectedItems, {
          by: 'group',
          thenBy: _sortBy,
          direction: sort,
        });
        // Sort the unselected items
        const sortedUnselectedItems = sortTableData(unselectedItems, {
          by: 'group',
          thenBy: _sortBy,
          direction: sort,
        });

        return [...sortedSelectedItems, ...sortedUnselectedItems];
      }

      return sortTableData(items, {
        by: 'group',
        thenBy: _sortBy,
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

    const handlePreQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      setPreQuery(event.target.value);
    }, []);

    const handlePreQueryClearClick = useCallback(() => {
      setQuery('');
      setPreQuery('');
    }, []);

    const finalActions: TReqoreCollectionActions = useMemo(() => {
      const leftActions: TReqoreCollectionActions = (rest.actions || []).filter(
        (action) => action.position !== 'right'
      );
      const rightActions: TReqoreCollectionActions = (rest.actions || []).filter(
        (action) => action.position === 'right'
      );
      const actions: TReqoreCollectionActions = [];

      const toolbarGroup: IReqorePanelAction = {
        responsive: false,
        icon: 'MoreLine',
        className: 'reqore-collection-more',
        actions: [],
      };

      if (showLayoutSwitch) {
        toolbarGroup.actions = [
          {
            icon: _showAs === 'grid' ? 'ListUnordered' : 'GridLine',
            onClick: () => setShowAs(_showAs === 'grid' ? 'list' : 'grid'),
            tooltip: displayButtonTooltip(_showAs),
            label: displayButtonTooltip(_showAs),
            disabled: !size(filteredItems),
            ...displayButtonProps,
          },
        ];
      }

      if (zoomable) {
        toolbarGroup.actions = [
          ...toolbarGroup.actions,
          { divider: true, line: true },
          ...getZoomActions('reqore-collection', zoom, setZoom, true),
        ];
      }

      if (filterable && inputInTitle) {
        actions.push({
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
        });
      }

      if (sortable) {
        const _sortKeys = {
          label: 'Label',
          intent: 'Intent',
          ...sortKeys,
        };

        rightActions.push({
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

      if (size(toolbarGroup.actions)) {
        return [...leftActions, ...actions, ...rightActions, toolbarGroup];
      }

      return [...leftActions, ...actions, ...rightActions];
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
      showLayoutSwitch,
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
                $columns={columns || (_showAs === 'grid' ? 'auto-fit' : 1)}
                $columnsGap={stacked ? '0px' : columnsGap}
                $rounded={rounded}
                $stacked={stacked}
                $fill={fill}
                ref={setContentRef}
                $height={height}
                $alignItems={alignItems}
                $minColumnWidth={minColumnWidth || zoomToWidth[zoom]}
                $maxColumnWidth={maxColumnWidth}
                className='reqore-collection-content'
              >
                {(() => {
                  // Group items by their 'group' property
                  const grouped = applyPaging(filteredItems).reduce((acc, item) => {
                    const group = item.group && !paging ? item.group : 'Ungrouped';

                    if (!acc[group]) {
                      acc[group] = [];
                    }

                    acc[group].push(item);

                    return acc;
                  }, {} as Record<string, IReqoreCollectionItemProps[]>);

                  // Render groups
                  return Object.entries(grouped).map(([groupName, groupItems]) => (
                    <React.Fragment key={groupName}>
                      {groupName !== 'Ungrouped' && (
                        <ReqoreP
                          style={{ gridColumn: '1 / -1' }}
                          effect={{
                            opacity: 0.8,
                            uppercase: true,
                            weight: 'bold',
                            textSize: 'small',
                            spaced: 1,
                          }}
                        >
                          {groupName}
                        </ReqoreP>
                      )}
                      {groupItems.map((item, index) => (
                        <ReqoreErrorBoundary {...errorBoundaryOptions} key={index}>
                          <ReqoreCollectionItem
                            size={zoomToSize[zoom]}
                            responsiveTitle={false}
                            {...item}
                            icon={item.icon || (item.selected ? selectedIcon : undefined)}
                            rounded={!stacked}
                            maxContentHeight={maxItemHeight}
                          />
                        </ReqoreErrorBoundary>
                      ))}
                    </React.Fragment>
                  ));
                })()}
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
              onClearClick={handlePreQueryClearClick}
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

    const contentStyle = useMemo(
      () => ({
        overflow: fill ? 'hidden' : 'auto',
        display: 'flex',
        flexFlow: 'column',
      }),
      [fill]
    );

    if (skeleton) {
      return (
        <ReqorePanelSkeleton size={rest.size}>
          <StyledCollectionWrapper
            $columns={columns || (_showAs === 'grid' ? 'auto-fit' : 1)}
            $columnsGap={stacked ? '0px' : columnsGap}
            $rounded={rounded}
            $stacked={stacked}
            $fill={fill}
            $height={height}
            $alignItems={alignItems}
            $minColumnWidth={minColumnWidth || zoomToWidth[zoom]}
            $maxColumnWidth={maxColumnWidth}
            className='reqore-collection-content'
          >
            <ReqoreSkeleton height='100px' width='100%' />
            <ReqoreSkeleton height='100px' width='100%' />
            <ReqoreSkeleton height='100px' width='100%' />
          </StyledCollectionWrapper>
        </ReqorePanelSkeleton>
      );
    }

    return (
      <ReqorePanel
        {...rest}
        labelSize={labelSize}
        fill={fill}
        contentStyle={contentStyle}
        transparent={transparent}
        minimal={minimal}
        flat={flat}
        actions={finalActions}
        className={`reqore-collection ${rest.className || ''}`}
      >
        {renderContent()}
      </ReqorePanel>
    );
  }
);
