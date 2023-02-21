import { size } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useDebounce, useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { useReqoreProperty } from '../..';
import { TReqorePaginationType } from '../../constants/paging';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { ReqorePaginationContainer } from '../../containers/Paging';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreColumnsProps, StyledColumns } from '../Columns';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import ReqoreMessage from '../Message';
import { IReqorePanelAction, IReqorePanelProps, ReqorePanel, TReqorePanelActions } from '../Panel';
import { ReqoreVerticalSpacer } from '../Spacer';
import { sortTableData } from '../Table/helpers';
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
  filterable?: boolean;
  sortable?: boolean;
  showAs?: 'list' | 'grid';
  showSelectedFirst?: boolean;
  selectedIcon?: IReqoreIconName;
  searchDelay?: number;

  contentRenderer?: (
    children: React.ReactNode,
    items: IReqoreCollectionItemProps[],
    searchInput?: React.ReactNode
  ) => React.ReactNode;

  onQueryChange?: (query: string) => void;

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

export const ReqoreCollection = ({
  items,
  stacked,
  rounded = true,
  fill,
  maxItemHeight,
  filterable,
  inputInTitle = true,
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
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [query, setQuery] = useState<string>('');
  const [preQuery, setPreQuery] = useState<string>('');
  const [contentRef, setContentRef] = useState<HTMLDivElement>(undefined);
  const isMobile = useReqoreProperty('isMobile');

  useUpdateEffect(() => {
    setShowAs(showAs);
  }, [showAs]);

  useUpdateEffect(() => {
    onQueryChange?.(query);
  }, [query]);

  useDebounce(
    () => {
      setQuery(preQuery);
    },
    searchDelay,
    [preQuery]
  );

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

  const handlePreQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreQuery(event.target.value);
  };

  const finalActions: TReqorePanelActions = useMemo(() => {
    let actions: TReqorePanelActions = rest.actions ? [...rest.actions] : [];

    const toolbarGroup: IReqorePanelAction = {
      responsive: false,
      fluid: isMobile,
      group: [
        {
          icon: _showAs === 'grid' ? 'ListUnordered' : 'GridLine',
          onClick: () => setShowAs(_showAs === 'grid' ? 'list' : 'grid'),
          tooltip: displayButtonTooltip(_showAs),
          disabled: !size(filteredItems),
          textAlign: 'center',
          fixed: !isMobile,
          ...displayButtonProps,
        },
      ],
    };

    if (sortable) {
      toolbarGroup.group.push({
        icon: sort === 'desc' ? 'SortDesc' : 'SortAsc',
        onClick: () => setSort(sort === 'desc' ? 'asc' : 'desc'),
        tooltip: sortButtonTooltip(sort),
        disabled: !size(filteredItems),
        textAlign: 'center',
        fixed: !isMobile,
        ...sortButtonProps,
      });
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

    return [...actions, toolbarGroup];
  }, [filterable, preQuery, query, rest.actions, _showAs, sort, sortable, filteredItems, isMobile]);

  const renderContent = useCallback(() => {
    return contentRenderer(
      <>
        <ReqorePaginationContainer
          key='paging-container'
          items={filteredItems}
          type={paging}
          size={rest.size}
          scrollContainer={contentRef}
        >
          {(finalItems) => (
            <>
              {!size(finalItems) ? (
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
                  minColumnWidth={minColumnWidth}
                  maxColumnWidth={maxColumnWidth}
                  className='reqore-collection-content'
                >
                  {finalItems?.map((item, index) => (
                    <ReqoreCollectionItem
                      size={rest.size}
                      responsiveTitle={false}
                      {...item}
                      icon={item.icon || (item.selected ? selectedIcon : undefined)}
                      key={index}
                      rounded={!stacked}
                      maxContentHeight={maxItemHeight}
                    />
                  ))}
                </StyledCollectionWrapper>
              )}
            </>
          )}
        </ReqorePaginationContainer>
      </>,
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
    size,
    stacked,
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
