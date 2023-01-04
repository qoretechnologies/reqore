import { size } from 'lodash';
import React, { memo, useMemo } from 'react';
import { ReqorePopover } from '../..';
import { IPopoverOptions } from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreDropdownList, { IReqoreDropdownItem, TDropdownItemOnClick } from './list';

export interface IReqoreDropdownProps extends Partial<IPopoverOptions> {
  items?: IReqoreDropdownItem[];
  multiSelect?: boolean;
  buttonStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  component?: any;
  filterable?: boolean;
  label?: any;
  children?: any;
  listWidth?: string;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  caretPosition?: 'left' | 'right';
  isDefaultOpen?: boolean;
  onItemSelect?: TDropdownItemOnClick;
}

function ReqoreDropdown<T extends unknown = IReqoreButtonProps>({
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
  icon,
  rightIcon,
  caretPosition = 'left',
  isDefaultOpen = false,
  onItemSelect,
  closeOnOutsideClick,
  blur,
  closeOnAnyClick,
  content,
  delay,
  maxHeight,
  maxWidth,
  noArrow = true,
  transparent,
  openOnMount,
  show,
  targetElement,
  useTargetWidth,
  listWidth,
  ...rest
}: IReqoreDropdownProps & T) {
  const componentProps = useMemo(
    () =>
      ({
        ...rest,
        icon: caretPosition === 'left' ? icon || 'ArrowDownSFill' : rightIcon,
        rightIcon: caretPosition === 'right' ? icon || 'ArrowDownSFill' : rightIcon,
        style: buttonStyle,
        disabled: !size(items),
        className: `${(rest as any)?.className || ''} reqore-dropdown-control`,
      } as T),
    [items, icon, rightIcon, buttonStyle, caretPosition, rest]
  );

  const popoverContent = useMemo(() => {
    return size(items) ? (
      <ReqoreDropdownList
        multiSelect={multiSelect}
        listStyle={listStyle}
        width={useTargetWidth ? '100%' : listWidth}
        items={items}
        filterable={filterable}
        onItemSelect={onItemSelect}
      />
    ) : undefined;
  }, [items]);

  return (
    <ReqorePopover
      closeOnOutsideClick={closeOnOutsideClick}
      blur={blur}
      closeOnAnyClick={closeOnAnyClick}
      delay={delay}
      maxHeight={maxHeight}
      maxWidth={maxWidth}
      noArrow={noArrow}
      transparent={transparent}
      useTargetWidth={useTargetWidth}
      component={component || ReqoreButton}
      componentProps={componentProps}
      noWrapper
      placement={placement || 'bottom-start'}
      handler={handler || 'click'}
      openOnMount={isDefaultOpen}
      content={popoverContent}
    >
      {children || label}
    </ReqorePopover>
  );
}

export default memo(ReqoreDropdown) as typeof ReqoreDropdown;
