import { size } from 'lodash';
import React from 'react';
import { ReqorePopover } from '../..';
import { IPopoverOptions } from '../../hooks/usePopover';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { IReqoreDropdownItemProps } from './item';
import ReqoreDropdownList from './list';

export interface IReqoreDropdownProps extends IPopoverOptions {
  items?: IReqoreDropdownItemProps[];
  multiSelect?: boolean;
  buttonStyle?: React.CSSProperties;
  listStyle?: React.CSSProperties;
  component?: any;
  componentProps?: { [key: string]: any };
  filterable?: boolean;
  label?: any;
  children?: any;
  width?: string;
  icon?: IReqoreIconName;
  rightIcon?: IReqoreIconName;
  caretPosition?: 'left' | 'right';
}

const ReqoreDropdown = ({
  items,
  component,
  componentProps = {},
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
  ...rest
}: IReqoreDropdownProps) => {
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
          ...componentProps,
        } as IReqoreButtonProps
      }
      noWrapper
      placement={placement || 'bottom-start'}
      handler={handler || 'click'}
      content={
        size(items) ? (
          <ReqoreDropdownList
            multiSelect={multiSelect}
            listStyle={listStyle}
            width={rest.useTargetWidth ? '100%' : rest.width}
            items={items}
            filterable={filterable}
          />
        ) : null
      }
      noArrow
    >
      {children || label}
    </ReqorePopover>
  );
};

export default ReqoreDropdown;
