import { size } from 'lodash';
import React, { memo, useMemo } from 'react';
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
}

const ReqoreDropdownListWrapper = memo(
  ({
    wrapperProps,
    ...rest
  }: IReqoreDropdownListProps & { wrapperProps?: IReqoreDropdownProps['wrapperProps'] }) => {
    return (
      <ReqorePanel
        size='small'
        customTheme={rest.customTheme}
        intent={rest.intent}
        {...wrapperProps}
      >
        <ReqoreDropdownList {...rest} />
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
  ...rest
}: IReqoreDropdownProps & T) {
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
      />
    ) : undefined;
  }, [items, onItemSelect, customElements]);

  return (
    <ReqorePopover
      closeOnOutsideClick={closeOnOutsideClick}
      closeOnInsideClick={closeOnInsideClick}
      closeOnTargetClick
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
      onToggleChange={onToggleChange}
    >
      {children || label}
    </ReqorePopover>
  );
}

export default memo(ReqoreDropdown) as typeof ReqoreDropdown;
