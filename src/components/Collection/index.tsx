import { size } from 'lodash';
import { useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import styled, { css } from 'styled-components';
import { ReqoreIntents } from '../../constants/theme';
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
  headerSize = 2,
  showAs = 'grid',
  ...rest
}: IReqoreCollectionProps) => {
  const [_showAs, setShowAs] = useState<'list' | 'grid'>(showAs);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [query, setQuery] = useState<string>('');

  useUpdateEffect(() => {
    setShowAs(showAs);
  }, [showAs]);

  const sortedItems: IReqoreCollectionItemProps[] = useMemo(
    () => (sortable ? sortTableData(items, { by: 'label', direction: sort }) : items),
    [items, sort]
  );

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
        [
          {
            icon: 'SortAsc',
            intent: sort === 'asc' ? ReqoreIntents.INFO : undefined,
            onClick: () => setSort('asc'),
            active: sort === 'asc',
            tooltip: 'Sort ascending',
            disabled: !size(finalItems),
          },
          {
            icon: 'SortDesc',
            intent: sort === 'desc' ? ReqoreIntents.INFO : undefined,
            onClick: () => setSort('desc'),
            active: sort === 'desc',
            tooltip: 'Sort descending',
            disabled: !size(finalItems),
          },
        ],
      ];
    }

    return [
      ...actions,
      [
        {
          icon: 'GridLine',
          onClick: () => setShowAs('grid'),
          intent: _showAs === 'grid' ? ReqoreIntents.INFO : undefined,
          active: _showAs === 'grid',
          tooltip: 'Show as grid',
          disabled: !size(finalItems),
        },
        {
          icon: 'ListOrdered',
          onClick: () => setShowAs('list'),
          intent: _showAs === 'list' ? ReqoreIntents.INFO : undefined,
          active: _showAs === 'list',
          tooltip: 'Show as list',
          disabled: !size(finalItems),
        },
      ],
    ];
  }, [filterable, handleQueryChange, query, rest.actions, _showAs, sort, sortable, finalItems]);

  return (
    <ReqorePanel
      {...rest}
      headerSize={headerSize}
      style={{
        height: height ?? undefined,
      }}
      fill={fill}
      padded
      opacity={0}
      actions={finalActions}
      className={`reqore-collection ${rest.className || ''}`}
    >
      {!size(finalItems) ? (
        <ReqoreMessage intent='muted' flat title='No items found'>
          No data in this collection, try changing your search query or filters
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
