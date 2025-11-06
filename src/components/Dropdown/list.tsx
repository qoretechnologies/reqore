import { size } from 'lodash';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { IReqoreDropdownProps } from '.';
import { TReqorePaginationType } from '../../constants/paging';
import { ReqorePaginationContainer } from '../../containers/Paging';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreComponent, IReqoreIntent, IWithReqoreCustomTheme } from '../../types/global';
import ReqoreButton from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreIcon from '../Icon';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import ReqoreMenu from '../Menu';
import ReqoreMenuDivider, { IReqoreMenuDividerProps } from '../Menu/divider';
import { IReqoreMenuItemProps } from '../Menu/item';
import { ReqoreP } from '../Paragraph';
import ReqoreTag, { IReqoreTagProps } from '../Tag';
import ReqoreTagGroup from '../Tag/group';
import { ReqoreDropdownItem } from './item';

export type TDropdownItemOnClick = <Metadata extends Record<string, any> = Record<string, any>>(
  item: IReqoreDropdownItem<Metadata>,
  event?: React.MouseEvent<HTMLElement>
) => void;
export interface IReqoreDropdownItem<Metadata extends Record<string, any> = Record<string, any>>
  extends Omit<
    IReqoreMenuItemProps<{
      item?: IReqoreDropdownItem;
      selectItem?: () => void;
    }>,
    'onClick'
  > {
  value?: any;
  metadata?: Metadata;
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
    Pick<IReqoreDropdownProps, 'customElements'>,
    IWithReqoreCustomTheme,
    IReqoreIntent {
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

  labels?: IReqoreTagProps[];

  _onBackClick?: () => void;
  _level?: number;
}

const ReqoreDropdownList = memo(
  ({
    items,
    multiSelect,
    listStyle,
    closePopover,
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
    customTheme,
    intent,

    labels = [],
    _onBackClick,
    _level = 0,
  }: IReqoreDropdownListProps) => {
    const [_items, setItems] = useState<TReqoreDropdownItems>(items);
    const [query, setQuery] = useState<string | number>(onFilterChange ? '' : filter || '');
    const [menuRef, setMenuRef] = useState<HTMLDivElement>(undefined);
    const [selectedItem, setSelectedItem] = useState<IReqoreDropdownItem>(
      size(items) === 1 && items[0].items && _level === 0 ? items[0] : undefined
    );
    const theme = useReqoreTheme('main', customTheme, intent);

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

    const handleItemSelectClick = useCallback(
      (item: IReqoreDropdownItem, event: React.MouseEvent<HTMLElement>): void => {
        if (item.onClick) {
          item.onClick(item, event);

          if (!multiSelect) {
            closePopover?.();
          }
        }

        if (onItemSelect) {
          onItemSelect(item, event);

          if (!multiSelect) {
            closePopover?.();
          }
        }
      },
      [onItemSelect, selectedItem, closePopover, multiSelect]
    );

    const handleItemClick = useCallback(
      (item: IReqoreDropdownItem, event: React.MouseEvent<HTMLElement>): void => {
        if (size(item.items)) {
          setSelectedItem(item);

          return;
        }

        handleItemSelectClick(item, event);
      },
      [onItemSelect, selectedItem, closePopover, multiSelect]
    );

    const getAction = useCallback((item: TReqoreDropdownItem, position: 'left' | 'right') => {
      const action = position === 'left' ? item.leftAction : item.rightAction;

      if (!action) {
        return undefined;
      }

      if (!action.onClick) {
        return action;
      }

      return {
        ...action,
        onClick: (event, itemId, _closePopover) => {
          action.onClick(event, itemId, _closePopover || closePopover, {
            item,
            selectItem: () => {
              handleItemSelectClick(item, event);
            },
          });
        },
      };
    }, []);

    if (selectedItem) {
      return (
        <ReqoreDropdownList
          {...{
            items: selectedItem.items,
            multiSelect,
            listStyle,
            filterable,
            closePopover,
            width,
            height,
            onItemSelect,
            inputProps,
            scrollToSelected,
            paging,
            onFilterChange,
            filterPlaceholder,
            filter,
            customTheme,
            intent,
            labels: [
              ...labels,
              {
                label: selectedItem.label,
                icon: selectedItem.icon,
                leftIconProps: selectedItem.leftIconProps,
                customTheme: selectedItem.customTheme || customTheme,
                intent: selectedItem.intent || intent,
              },
            ],
            _onBackClick: () => setSelectedItem(undefined),
            _level: _level + 1,
          }}
        />
      );
    }

    return (
      <ReqoreControlGroup vertical fluid>
        {customElements}
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
                  customTheme={theme}
                  intent={intent}
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
                  customTheme={theme}
                  intent={intent}
                  {...inputProps}
                />
              )}
            </ReqoreControlGroup>
          </>
        ) : null}
        {size(labels) ? (
          <ReqoreTagGroup size='small'>
            {labels.map((label, index) => (
              <ReqoreTag key={index} {...label} />
            ))}
          </ReqoreTagGroup>
        ) : null}
        <ReqorePaginationContainer type={paging} items={filteredItems} scrollContainer={menuRef}>
          {(_finalItems, Controls, { includeBottomControls, applyPaging }) => (
            <ReqoreMenu
              style={listStyle}
              width={width}
              maxHeight={height || '300px'}
              padded={false}
              ref={setMenuRef}
              transparent
              customTheme={theme}
              intent={intent}
            >
              {query && size(filteredItems) === 0 ? (
                <ReqoreControlGroup horizontalAlign='center'>
                  <ReqoreP intent='muted'>
                    <ReqoreIcon icon='ForbidLine' intent='muted' margin='right' />
                    No items found
                  </ReqoreP>
                </ReqoreControlGroup>
              ) : null}
              {applyPaging(filteredItems).map(
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
                      rightIcon={
                        'items' in item && size(item.items) ? 'ArrowRightSLine' : item.rightIcon
                      }
                      customTheme={theme}
                      intent={intent}
                      {...item}
                      rightAction={getAction(item, 'right')}
                      leftAction={getAction(item, 'left')}
                      disabled={'items' in item && !size(item.items) ? true : item.disabled}
                      onItemClick={handleItemClick}
                      scrollIntoView={scrollToSelected && item.selected && !multiSelect}
                      closePopover={closePopover}
                    />
                  )
              )}
              {!includeBottomControls && Controls}
            </ReqoreMenu>
          )}
        </ReqorePaginationContainer>
      </ReqoreControlGroup>
    );
  }
);

export default ReqoreDropdownList;
