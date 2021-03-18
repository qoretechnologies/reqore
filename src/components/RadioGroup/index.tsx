import React from "react";
import styled from "styled-components";
import { ReqoreCheckbox } from "../..";
import { TSizes } from "../../constants/sizes";
import { IReqoreCheckboxProps } from "../Checkbox";

export interface IReqoreRadioGroupItem extends IReqoreCheckboxProps {
  value: string;
}

export interface IReqoreRadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  items: IReqoreRadioGroupItem[];
  selected?: string;
  onSelectClick?: (value: string) => void;
  size?: TSizes;
  disabled?: boolean;
  asSwitch?: boolean;
}

const StyledRadioGroup = styled.div`
  display: flex;
  flex-flow: column;
`;

const ReqoreRadioGroup = ({
  items = [],
  selected,
  onSelectClick,
  size,
  disabled,
  asSwitch,
  ...rest
}: IReqoreRadioGroupProps) => (
  <StyledRadioGroup {...rest}>
    {items.map(({ value, ...itemRest }) => (
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
    ))}
  </StyledRadioGroup>
);

export default ReqoreRadioGroup;
