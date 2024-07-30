import { size } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { IReqoreDropdownProps } from '.';
import { TReqorePaginationType } from '../../constants/paging';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { ReqorePaginationContainer } from '../../containers/Paging';
import { IReqoreComponent } from '../../types/global';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import ReqoreMenu from '../Menu';
import ReqoreMenuDivider, { IReqoreMenuDividerProps } from '../Menu/divider';
import { IReqoreMenuItemProps } from '../Menu/item';
import { ReqoreVerticalSpacer } from '../Spacer';
import { ReqoreDropdownItem } from './item';

export type TDropdownItemOnClick = (
  item: IReqoreDropdownItem,
  event?: React.MouseEvent<HTMLElement>
) => void;
export interface IReqoreDropdownItem
  extends Omit<IReqoreMenuItemProps, 'onClick' | 'onRightIconClick'> {
  value?: any;
  items?: TReqoreDropdownItems;
  onClick?: TDropdownItemOnClick;
  divider?: boolean;
  dividerAlign?: 'left' | 'center' | 'right';
  dividerPadded?: 'top' | 'bottom' | 'both' | 'none';
  line?: boolean;
}

export type TReqoreDropdownItem = IReqoreDropdownItem;
export type TReqoreDropdownItems = TReqoreDropdownItem[];

export interface IReqoreDropdownListProps
  extends IReqoreComponent,
    Pick<IReqoreDropdownProps, 'customElements'> {
  items?: TReqoreDropdownItems;
  multiSelect?: boolean;
  listStyle?: React.CSSProperties;
  width?: string;
  height?: string;

  filterable?: boolean;
  onFilterChange?: (query: string) => void;
  filter?: string | number;
  filterPlaceholder?: string;

  onItemSelect?: TDropdownItemOnClick;
  inputProps?: IReqoreInputProps;
  scrollToSelected?: boolean;
  paging?: TReqorePaginationType<TReqoreDropdownItem>;

  _onBackClick?: () => void;
}

const ReqoreDropdownList = memo(
  ({
    items,
    multiSelect,
    listStyle,
    _popoverId,
    filterable,
    width,
    height,
    onItemSelect,
    inputProps,
    scrollToSelected,
    paging,
    onFilterChange,
    filterPlaceholder,
    filter,
    customElements,
    _onBackClick,
  }: IReqoreDropdownListProps) => {
    const [_items, setItems] = useState<TReqoreDropdownItems>(items);
    const [query, setQuery] = useState<string | number>(onFilterChange ? '' : filter || '');
    const [menuRef, setMenuRef] = useState<HTMLDivElement>(undefined);
    const [selectedItem, setSelectedItem] = useState<IReqoreDropdownItem>(undefined);

    useEffect(() => {
      setItems(items);
    }, [items]);

    const filteredItems: TReqoreDropdownItems = useMemo(() => {
      if (!filterable || query === '') {
        return _items;
      }

      return _items.filter((item) => {
        if (item.divider) {
          return true;
        }

        const text: string | undefined = item.label || item.value || item.children;

        if (!text) {
          return false;
        }

        return text.toString().toLowerCase().indexOf(query.toString().toLowerCase()) !== -1;
      });
    }, [items, query, _items]);

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onFilterChange) {
        onFilterChange(event.target.value);
      } else {
        setQuery(event.target.value);
      }
    };

    const handleItemClick = useCallback(
      (item: IReqoreDropdownItem, event: React.MouseEvent<HTMLElement>): void => {
        if (size(item.items)) {
          setSelectedItem(item);

          return;
        }

        if (item.onClick) {
          item.onClick(item, event);
        }

        if (onItemSelect) {
          onItemSelect(item, event);
        }
      },
      [onItemSelect, selectedItem]
    );

    if (selectedItem) {
      return (
        <ReqoreDropdownList
          {...{
            items: selectedItem.items,
            multiSelect,
            listStyle,
            _popoverId,
            filterable,
            width,
            height,
            onItemSelect,
            inputProps,
            scrollToSelected,
            paging,
            onFilterChange,
            filterPlaceholder,
            filter,
            _onBackClick: () => setSelectedItem(undefined),
          }}
        />
      );
    }

    return (
      <>
        {customElements}
        {customElements && size(customElements) && (size(items) || _onBackClick) ? (
          <ReqoreVerticalSpacer height={PADDING_FROM_SIZE.normal} />
        ) : null}
        {(size(items) && filterable) || _onBackClick ? (
          <>
            <ReqoreControlGroup fluid>
              {_onBackClick && (
                <ReqoreButton
                  icon='ArrowLeftSLine'
                  fluid={!filterable}
                  fixed={filterable}
                  onClick={_onBackClick}
                  className='reqore-dropdown-back-button'
                />
              )}
              {filterable && (
                <ReqoreInput
                  value={onFilterChange ? filter : query}
                  icon='SearchLine'
                  onChange={handleQueryChange}
                  placeholder={
                    filterPlaceholder ||
                    `Search ${size(_items.filter((item) => !item.divider))} items...`
                  }
                  onClearClick={() => (onFilterChange ? onFilterChange('') : setQuery(''))}
                  {...inputProps}
                />
              )}
            </ReqoreControlGroup>
            <ReqoreVerticalSpacer height={PADDING_FROM_SIZE.normal} />
          </>
        ) : null}
        <ReqorePaginationContainer type={paging} items={filteredItems} scrollContainer={menuRef}>
          {(finalItems, Controls, { includeBottomControls }) => (
            <ReqoreMenu
              _insidePopover={!multiSelect}
              _popoverId={_popoverId}
              style={listStyle}
              width={width}
              maxHeight={height || '300px'}
              padded={false}
              ref={setMenuRef}
            >
              {finalItems.map(
                (
                  { dividerAlign, dividerPadded, divider, ...item }: IReqoreDropdownItem,
                  index: number
                ) =>
                  divider ? (
                    <ReqoreMenuDivider
                      key={index}
                      {...(item as unknown as IReqoreMenuDividerProps)}
                      align={dividerAlign}
                      padded={dividerPadded}
                    />
                  ) : (
                    <ReqoreDropdownItem
                      key={item.label || item.value || index}
                      {...item}
                      disabled={'items' in item && !size(item.items) ? true : item.disabled}
                      onItemClick={handleItemClick}
                      scrollIntoView={scrollToSelected && item.selected && !multiSelect}
                    />
                  )
              )}
              {!includeBottomControls && Controls}
            </ReqoreMenu>
          )}
        </ReqorePaginationContainer>
      </>
    );
  }
);

export default ReqoreDropdownList;
