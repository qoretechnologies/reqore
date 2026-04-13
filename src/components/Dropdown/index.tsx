import { size } from 'lodash';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { ReqorePanel, ReqorePopover } from '../..';
import { TReqorePaginationType } from '../../constants/paging';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { IReqoreInputProps } from '../Input';
import { IReqorePanelProps } from '../Panel';
import { IPopoverOptions } from '../Popover';
import ReqoreDropdownList, {
  IReqoreDropdownItem,
  IReqoreDropdownListProps,
  TDropdownItemOnClick,
} from './list';

export interface IReqoreDropdownProps
  extends Partial<Omit<IPopoverOptions, 'openOnMount' | 'targetElement' | 'wrapperProps'>> {
  items?: IReqoreDropdownItem[];
  multiSelect?: boolean;
  buttonStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  component?: any;
  filterable?: boolean;
  onFilterChange?: (query: string) => void;
  filter?: string | number;
  filterPlaceholder?: string;
  label?: any;
  children?: any;
  listWidth?: string;
  listHeight?: string;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  caretPosition?: 'left' | 'right';
  isDefaultOpen?: boolean;
  onItemSelect?: TDropdownItemOnClick;
  style?: React.CSSProperties;
  inputProps?: IReqoreInputProps;
  wrapperProps?: IReqorePanelProps;
  scrollToSelected?: boolean;
  paging?: TReqorePaginationType<IReqoreDropdownItem>;
  customElements?: React.ReactNode[];
  listCustomTheme?: IReqoreCustomTheme;
  listIntent?: TReqoreIntent;
  showCaret?: boolean;
  // Whether the button should be shown as read-only when there are no items instead of disabled
  readOnlyOnEmpty?: boolean;
  // Whether keyboard navigation is enabled (arrow keys, enter, etc.)
  keyboardNavigation?: boolean;
  /** Callback that receives keyboard controls, allowing external components
   *  (e.g., a text input) to forward arrow/enter key events to the dropdown list.
   *  This enables the aria-activedescendant pattern where focus stays on the input
   *  while arrow keys navigate the dropdown. */
  passKeyHandler?: IReqoreDropdownListProps['passKeyHandler'];
  /** Unique ID for the dropdown list, used for aria-activedescendant support.
   *  When set, each dropdown item gets an id of `${listId}-option-${index}`. */
  listId?: string;

  popoverId?: string;
}

const ReqoreDropdownListWrapper = memo(
  ({
    wrapperProps,
    selectedItems,
    onSelectedItemsChange,
    _onNavigateToLevel,
    ...rest
  }: IReqoreDropdownListProps & {
    wrapperProps?: IReqoreDropdownProps['wrapperProps'];
    selectedItems?: Array<IReqoreDropdownItem | undefined>;
    onSelectedItemsChange?: (items: Array<IReqoreDropdownItem | undefined>) => void;
  }) => {
    return (
      <ReqorePanel
        size='small'
        customTheme={rest.customTheme}
        intent={rest.intent}
        {...wrapperProps}
      >
        <ReqoreDropdownList
          {...rest}
          selectedItems={selectedItems}
          onSelectedItemsChange={onSelectedItemsChange}
          _onNavigateToLevel={_onNavigateToLevel}
        />
      </ReqorePanel>
    );
  }
);

function ReqoreDropdown<T = IReqoreButtonProps>({
  items,
  component,
  label,
  children,
  multiSelect,
  buttonStyle,
  listStyle,
  handler,
  placement,
  filterable,
  onFilterChange,
  filterPlaceholder,
  filter,
  icon,
  rightIcon,
  caretPosition = 'left',
  isDefaultOpen = false,
  onItemSelect,
  closeOnOutsideClick,
  closeOnInsideClick,
  closeOnTargetClick,
  blur,
  closeOnAnyClick,
  delay,
  maxHeight,
  maxWidth,
  minWidth,
  noArrow = true,
  transparent,
  useTargetWidth,
  listWidth,
  listHeight,
  passPopoverData,
  inputProps,
  scrollToSelected,
  paging,
  show,
  onToggleChange,
  customElements,
  wrapperProps,
  listCustomTheme,
  listIntent,
  showCaret = true,
  readOnlyOnEmpty,
  keyboardNavigation = true,
  passKeyHandler,
  listId,
  onBeforeClose,
  onBeforeOpen,
  popoverId,
  ...rest
}: IReqoreDropdownProps & T) {
  // Track the selected item at each navigation level
  // selectedItems[0] is the root level item, selectedItems[1] is the first submenu item, etc.
  const [selectedItems, setSelectedItems] = useState<Array<IReqoreDropdownItem | undefined>>([]);

  const componentProps = useMemo(
    () =>
      ({
        ...rest,
        icon:
          caretPosition === 'left' ? icon || (showCaret ? 'ArrowDownSFill' : undefined) : rightIcon,
        rightIcon:
          caretPosition === 'right'
            ? icon || (showCaret ? 'ArrowDownSFill' : undefined)
            : rightIcon,
        style: buttonStyle || rest.style,
        disabled: (!size(items) && !readOnlyOnEmpty) || (rest as any).disabled,
        readOnly: (!size(items) && readOnlyOnEmpty) || (rest as any).readOnly,
        className: `${(rest as any)?.className || ''} reqore-dropdown-control`,
      } as T),
    [items, icon, rightIcon, buttonStyle, caretPosition, rest]
  );

  // Handle navigation to a specific submenu level via breadcrumb click
  const handleNavigateToLevel = useCallback((level: number) => {
    // Trim to requested level and explicitly clear the slot to prevent auto-entering
    // a submenu when there's a single item at that level (breadcrumb click).
    setSelectedItems((prev) => {
      const next = prev.slice(0, level + 1);
      next[level] = undefined;
      return next;
    });
  }, []);

  // Reset selection when the dropdown closes so auto-enter works again on next open
  const handleToggleChange = useCallback(
    (isOpen: boolean, data?: any) => {
      if (!isOpen) {
        setSelectedItems([]);
      }

      onToggleChange?.(isOpen, data);
    },
    [onToggleChange]
  );

  const popoverContent = useMemo(() => {
    return size(items) || size(customElements) ? (
      <ReqoreDropdownListWrapper
        multiSelect={multiSelect}
        listStyle={listStyle}
        width={useTargetWidth ? '100%' : listWidth}
        height={listHeight}
        items={items || []}
        filterable={filterable}
        onItemSelect={onItemSelect}
        inputProps={inputProps}
        scrollToSelected={scrollToSelected}
        paging={paging}
        onFilterChange={onFilterChange}
        filterPlaceholder={filterPlaceholder}
        filter={filter}
        customElements={customElements}
        wrapperProps={wrapperProps}
        customTheme={listCustomTheme}
        intent={listIntent}
        keyboardNavigation={keyboardNavigation}
        passKeyHandler={passKeyHandler}
        listId={listId}
        _onNavigateToLevel={handleNavigateToLevel}
        selectedItems={selectedItems}
        onSelectedItemsChange={setSelectedItems}
      />
    ) : undefined;
  }, [items, onItemSelect, customElements, selectedItems, handleNavigateToLevel]);

  return (
    <ReqorePopover
      closeOnOutsideClick={closeOnOutsideClick}
      closeOnInsideClick={closeOnInsideClick ?? false}
      closeOnTargetClick={closeOnTargetClick}
      blur={blur}
      closeOnAnyClick={closeOnAnyClick}
      delay={delay}
      maxHeight={maxHeight}
      maxWidth={maxWidth}
      minWidth={minWidth}
      noArrow={noArrow}
      transparent={transparent}
      useTargetWidth={useTargetWidth}
      component={component || ReqoreButton}
      componentProps={componentProps}
      isReqoreComponent
      noWrapper
      placement={placement || 'bottom-start'}
      handler={handler || 'click'}
      openOnMount={isDefaultOpen}
      content={popoverContent}
      passPopoverData={passPopoverData}
      show={show}
      onToggleChange={handleToggleChange}
      onBeforeClose={onBeforeClose}
      onBeforeOpen={onBeforeOpen}
      id={popoverId}
    >
      {children || label}
    </ReqorePopover>
  );
}

export default memo(ReqoreDropdown) as typeof ReqoreDropdown;
