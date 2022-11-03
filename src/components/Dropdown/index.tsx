import { size } from 'lodash';
import React from 'react';
import { ReqorePopover } from '../..';
import { IPopoverOptions } from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItemProps } from './item';
import ReqoreDropdownList from './list';

export interface IReqoreDropdownProps<T> extends IPopoverOptions {
  items?: IReqoreDropdownItemProps[];
  multiSelect?: boolean;
  buttonStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  component?: any;
  componentProps?: T;
  filterable?: boolean;
  label?: any;
  children?: any;
  width?: string;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  caretPosition?: 'left' | 'right';
  isDefaultOpen?: boolean;
}

const ReqoreDropdown = <T extends unknown = IReqoreButtonProps>({
  items,
  component,
  componentProps,
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
  ...rest
}: IReqoreDropdownProps<T>) => {
  return (
    <ReqorePopover
      {...rest}
      component={component || ReqoreButton}
      componentProps={
        {
          icon: caretPosition === 'left' ? icon || 'ArrowDownSFill' : rightIcon,
          rightIcon: caretPosition === 'right' ? icon || 'ArrowDownSFill' : rightIcon,
          style: buttonStyle,
          disabled: !size(items),
          ...rest,
          ...((componentProps || {}) as Object),
          className: `${(componentProps as any)?.className || ''} reqore-dropdown-control`,
        } as T
      }
      noWrapper
      placement={placement || 'bottom-start'}
      handler={handler || 'click'}
      openOnMount={isDefaultOpen}
      content={
        size(items) ? (
          <ReqoreDropdownList
            multiSelect={multiSelect}
            listStyle={listStyle}
            width={rest.useTargetWidth ? '100%' : rest.width}
            items={items}
            filterable={filterable}
          />
        ) : undefined
      }
      noArrow
    >
      {children || label}
    </ReqorePopover>
  );
};

export default ReqoreDropdown;
