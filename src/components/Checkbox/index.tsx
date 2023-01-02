import { rgba } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useTooltip } from '../../hooks/useTooltip';
import { DisabledElement, ReadOnlyElement } from '../../styles';
import { IReqoreDisabled, IReqoreReadOnly, TReqoreTooltipProp } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export interface IReqoreCheckboxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IReqoreDisabled,
    IReqoreReadOnly {
  label?: string;
  labelDetail?: any;
  labelDetailPosition?: 'left' | 'right';
  size?: TSizes;
  checked?: boolean;
  labelPosition?: 'right' | 'left';
  fluid?: boolean;
  fixed?: boolean;
  tooltip?: TReqoreTooltipProp;
  asSwitch?: boolean;
  uncheckedIcon?: IReqoreIconName;
  checkedIcon?: IReqoreIconName;
}

export interface IReqoreCheckboxStyle extends IReqoreCheckboxProps {
  theme: IReqoreTheme;
}

const StyledSwitch = styled.div<IReqoreCheckboxStyle>`
  transition: all 0.2s ease-out;
  position: relative;

  height: ${({ size }) => SIZE_TO_PX[size] - 5}px;
  width: ${({ size }) => SIZE_TO_PX[size] * 1.8}px;

  border: 1px solid
    ${({ theme, checked }) =>
      rgba(getReadableColor(theme, undefined, undefined), checked ? 0.6 : 0.3)};
  border-radius: 50px;

  margin-right: ${({ labelPosition }) => labelPosition === 'right' && '8px'};
  margin-left: ${({ labelPosition }) => labelPosition === 'left' && '8px'};

  background-color: ${({ theme, checked }) =>
    checked ? rgba(getReadableColor(theme, undefined, undefined), 0.2) : 'transparent'};

  &::before {
    transition: all 0.2s ease-in-out;
    content: '';
    display: block;
    position: absolute;
    height: ${({ size }) => SIZE_TO_PX[size] - 13}px;
    width: ${({ size }) => SIZE_TO_PX[size] - 13}px;
    top: 50%;
    transform: translateY(-50%);
    left: ${({ checked, size }) =>
      !checked ? '5px' : `${SIZE_TO_PX[size] * 1.8 - (SIZE_TO_PX[size] - 7)}px`};
    border-radius: 100%;
    background-color: ${({ theme, checked }) =>
      !checked
        ? rgba(getReadableColor(theme, undefined, undefined), 0.2)
        : getReadableColor(theme, undefined, undefined)};
  }
`;

const StyledCheckbox = styled.div<IReqoreCheckboxStyle>`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 0px;
  transition: all 0.2s ease-out;

  height: ${({ size }) => SIZE_TO_PX[size]}px;
  font-size: ${({ size }) => TEXT_FROM_SIZE[size]}px;

  flex: ${({ fluid, fixed }) => (fixed ? '0 auto' : fluid ? '1' : '0 0 auto')};

  ${({ disabled }) =>
    disabled &&
    css`
      ${DisabledElement};
    `}

  ${({ readOnly }) =>
    readOnly &&
    css`
      ${ReadOnlyElement};
    `}

  color: ${({ theme, checked }) => getReadableColor(theme, undefined, undefined, !checked)};

  &:hover {
    color: ${({ theme }) => getReadableColor(theme, undefined, undefined, false)};

    > ${StyledSwitch} {
      border-color: ${({ theme, checked }) =>
        rgba(getReadableColor(theme, undefined, undefined, false), checked ? 0.8 : 0.5)};
    }
  }
`;

const Checkbox = forwardRef<HTMLDivElement, IReqoreCheckboxProps>(
  (
    {
      label,
      labelDetail,
      labelDetailPosition = 'right',
      size = 'normal',
      checked,
      disabled,
      className,
      labelPosition = 'right',
      tooltip,
      asSwitch,
      uncheckedIcon = 'CheckboxBlankCircleLine',
      checkedIcon = 'CheckboxCircleFill',
      readOnly,
      ...rest
    }: IReqoreCheckboxProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);

    useTooltip(targetRef.current, tooltip);

    return (
      <StyledCheckbox
        {...rest}
        ref={targetRef}
        size={size}
        disabled={disabled}
        checked={checked}
        readOnly={readOnly}
        className={`${className || ''} reqore-checkbox reqore-control`}
      >
        {label && labelPosition === 'left' ? (
          <>
            {labelDetailPosition === 'left' && labelDetail}
            <span>{label}</span>
            {labelDetailPosition === 'right' && labelDetail}
          </>
        ) : null}
        {asSwitch ? (
          <StyledSwitch size={size} labelPosition={labelPosition} checked={checked} />
        ) : (
          <ReqoreIcon
            size={size}
            icon={checked ? checkedIcon : uncheckedIcon}
            margin={labelPosition}
          />
        )}
        {label && labelPosition === 'right' ? (
          <>
            {labelDetailPosition === 'left' && labelDetail}
            <span>{label}</span>
            {labelDetailPosition === 'right' && labelDetail}
          </>
        ) : null}
      </StyledCheckbox>
    );
  }
);

export default Checkbox;
