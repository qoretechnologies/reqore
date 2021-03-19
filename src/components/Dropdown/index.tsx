import { size } from 'lodash';
import React from 'react';
import { ReqorePopover } from '../..';
import { IPopoverOptions } from '../../hooks/usePopover';
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
}

const ReqoreDropdown = ({
  items,
  component,
  componentProps = {},
  label,
  multiSelect,
  buttonStyle,
  listStyle,
  handler,
  placement,
  filterable,
  ...rest
}: IReqoreDropdownProps) => {
  return (
    <ReqorePopover
      {...rest}
      component={component || ReqoreButton}
      componentProps={
        {
          icon: 'ArrowDownSFill',
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
            width={rest.useTargetWidth ? '100%' : undefined}
            items={items}
            filterable={filterable}
          />
        ) : null
      }
      noArrow
    >
      {label}
    </ReqorePopover>
  );
};

export default ReqoreDropdown;
