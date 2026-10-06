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
  onText?: string;
  offText?: string;
  margin?: 'left' | 'right' | 'both' | 'none';
  /**
   * Form field name shared by the options' native radio inputs. With it the options are one
   * native group: the form posts the selected `value` under this name, the group is a single
   * tab stop and the arrow keys move the choice. Without it each option is still a native
   * radio (focusable, `Space` selects it), but they are not grouped and nothing is posted.
   */
  name?: string;
  /** A choice must be made before the form submits. */
  required?: boolean;
}

const ReqoreRadioGroup = ({
  items = [],
  selected,
  onSelectClick,
  size,
  disabled,
  asSwitch,
  vertical = true,
  onText,
  offText,
  margin = 'left',
  name,
  required,
  ...rest
}: IReqoreRadioGroupProps) => (
  <ReqoreControlGroup role='radiogroup' {...rest} vertical={vertical}>
    {items.map(({ value, divider, ...itemRest }, index) =>
      divider ? (
        <ReqoreMenuDivider
          {...itemRest}
          key={index}
          size={size || itemRest.size}
          effect={{ textAlign: 'left', ...itemRest.effect }}
          margin={margin}
          label={vertical ? itemRest.label : undefined}
        />
      ) : (
        <ReqoreCheckbox
          asSwitch={asSwitch}
          onText={onText}
          offText={offText}
          margin={margin}
          {...itemRest}
          key={value}
          type='radio'
          name={name}
          value={value}
          required={required || itemRest.required}
          checked={value === selected}
          size={size || itemRest.size}
          disabled={disabled || itemRest.disabled}
          /* A read-only option stays readable and hoverable — `readOnly` only marks
             it `cursor: not-allowed`, it does not take its pointer events away, so
             its tooltip and description are still the place its reason can be read.
             Having said it cannot be picked, it must not then pick: the handler is
             withheld rather than the option being deadened. Same rule the dropdown
             list, ReqoreRating and ReqoreSegmentedControl follow. */
          onClick={
            itemRest.readOnly
              ? undefined
              : () => {
                  onSelectClick(value);
                }
          }
        />
      )
    )}
  </ReqoreControlGroup>
);

export default ReqoreRadioGroup;
