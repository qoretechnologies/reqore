import React from 'react';
import { ReqoreCheckbox, ReqoreControlGroup } from '../..';
import { TSizes } from '../../constants/sizes';
import { IReqoreCheckboxProps } from '../Checkbox';
import { IReqoreControlGroupProps } from '../ControlGroup';
import ReqoreMenuDivider from '../Menu/divider';

export interface IReqoreRadioGroupItem extends IReqoreCheckboxProps {
  value?: string;
  divider?: boolean;
}

export interface IReqoreRadioGroupProps
  extends Omit<IReqoreControlGroupProps, 'children'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  items: IReqoreRadioGroupItem[];
  selected?: string;
  onSelectClick?: (value: string) => void;
  size?: TSizes;
  disabled?: boolean;
  asSwitch?: boolean;
}

const ReqoreRadioGroup = ({
  items = [],
  selected,
  onSelectClick,
  size,
  disabled,
  asSwitch,
  vertical = true,
  ...rest
}: IReqoreRadioGroupProps) => (
  <ReqoreControlGroup {...rest} vertical={vertical}>
    {items.map(({ value, divider, ...itemRest }) =>
      divider ? (
        <ReqoreMenuDivider
          {...itemRest}
          size={size || itemRest.size}
          effect={{ ...itemRest.effect, textAlign: 'left' }}
          margin='left'
          label={vertical ? itemRest.label : undefined}
        />
      ) : (
        <ReqoreCheckbox
          asSwitch={asSwitch}
          {...itemRest}
          key={value}
          checked={value === selected}
          size={size || itemRest.size}
          disabled={disabled || itemRest.disabled}
          onClick={() => {
            onSelectClick(value);
          }}
        />
      )
    )}
  </ReqoreControlGroup>
);

export default ReqoreRadioGroup;
