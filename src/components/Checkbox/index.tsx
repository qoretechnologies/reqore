import { rgba } from 'polished';
import React, { forwardRef, useMemo } from 'react';
import { useMeasure } from 'react-use';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeLightness,
  getNthGradientColor,
  getReadableColor,
  getReadableColorFrom,
} from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { DisabledElement, ReadOnlyElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreEffect, ReqoreTextEffect, StyledEffect, StyledTextEffect } from '../Effect';
import ReqoreIcon, { StyledIconWrapper } from '../Icon';
import { ReqoreSpacer } from '../Spacer';

export interface IReqoreCheckboxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IReqoreDisabled,
    IReqoreReadOnly,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreCustomTheme {
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
  image?: string;
  onText?: string | number;
  offText?: string | number;
  switchTextEffect?: IReqoreEffect;
  labelEffect?: IReqoreEffect;
  margin?: 'left' | 'right' | 'both' | 'none';
  wrapLabel?: boolean;
}

export interface IReqoreCheckboxStyle extends IReqoreCheckboxProps {
  theme: IReqoreTheme;
}

const StyledSwitchToggle = styled.div`
  transition: all 0.2s ease-in-out;
  content: '';
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  height: ${({ size }) => SIZE_TO_PX[size] - 4}px;
  width: ${({ size, width }) => width || SIZE_TO_PX[size] - 4}px;
  top: 50%;
  transform: translateY(-50%);
  left: ${({ checked, size, width }) =>
    !checked ? '1px' : `calc(100% - ${width || SIZE_TO_PX[size] - 4}px - 1px)`};
  border-radius: 50px;
  background-color: ${({ theme, checked, transparent, parentEffect }) =>
    transparent
      ? 'transparent'
      : !checked
      ? parentEffect?.gradient
        ? changeLightness(getNthGradientColor(theme, parentEffect?.gradient?.colors, 1), 0.2)
        : changeLightness(theme.main, 0.2)
      : parentEffect?.gradient
      ? changeLightness(getNthGradientColor(theme, parentEffect?.gradient?.colors, 2), 0.2)
      : changeLightness(theme.main, 0.25)};
`;

const StyledSwitch = styled(StyledEffect)<IReqoreCheckboxStyle>`
  transition: all 0.2s ease-out;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  height: ${({ size }) => SIZE_TO_PX[size]}px;
  min-width: ${({ size }) => SIZE_TO_PX[size] * 1.8}px;

  border: 1px solid ${({ theme, checked }) => changeLightness(theme.main, checked ? 0.25 : 0.2)};
  border-radius: 50px;

  background-color: ${({ theme }) => rgba(changeLightness(theme.main, 0.3), 0.1)};

  ${StyledIconWrapper} {
    z-index: 1;
  }
`;

const StyledSwitchTextWrapper = styled(StyledTextEffect)`
  margin: 0 ${({ size }) => PADDING_FROM_SIZE[size]}px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const StyledOnSwitchText = styled(StyledSwitchTextWrapper)<IReqoreCheckboxStyle>`
  color: ${({ theme, checked, parentHasGradient }) =>
    !parentHasGradient &&
    getReadableColorFrom(checked ? changeLightness(theme.main, 0.25) : theme.originalMain)};
`;

const StyledOffSwitchText = styled(StyledSwitchTextWrapper)<IReqoreCheckboxStyle>`
  color: ${({ theme, checked, parentHasGradient }) =>
    !parentHasGradient &&
    getReadableColorFrom(checked ? theme.originalMain : changeLightness(theme.main, 0.2))};
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

  color: ${({ theme, checked }) =>
    getReadableColor(theme, undefined, undefined, !checked, theme.originalMain)};

  &:hover {
    color: ${({ theme }) =>
      getReadableColor(theme, undefined, undefined, false, theme.originalMain)};

    > ${StyledSwitch} {
      border-color: ${({ theme, checked }) => changeLightness(theme.main, checked ? 0.3 : 0.25)};
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
      margin = 'left',
      checked,
      disabled,
      className,
      labelPosition = 'right',
      tooltip,
      asSwitch,
      uncheckedIcon,
      checkedIcon,
      readOnly,
      labelEffect,
      switchTextEffect,
      image,
      onText,
      offText,
      intent,
      effect,
      customTheme,
      wrapLabel,
      ...rest
    }: IReqoreCheckboxProps,
    ref
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const [offRef, { width: offWidth }] = useMeasure();
    const [onRef, { width: onWidth }] = useMeasure();
    const theme = useReqoreTheme('main', customTheme, intent);

    useTooltip(targetRef.current, tooltip);

    const width = useMemo(() => {
      if ((!image && !onText) || !offText) return undefined;

      const selectedWidth = checked ? onWidth : offWidth;

      return selectedWidth + PADDING_FROM_SIZE[size] * 2;
    }, [checked, offWidth, onWidth, size]);

    const hasText = useMemo(() => {
      return !!onText || !!offText;
    }, [onText, offText]);

    return (
      <StyledCheckbox
        {...rest}
        ref={targetRef}
        theme={theme}
        size={size}
        disabled={disabled}
        checked={checked}
        readOnly={readOnly}
        className={`${className || ''} reqore-checkbox reqore-control`}
      >
        {margin === 'left' || margin === 'both' ? (
          <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
        ) : null}
        {label && labelPosition === 'left' ? (
          <>
            {labelDetailPosition === 'left' && labelDetail}
            <ReqoreTextEffect
              active={checked}
              effect={{
                ...labelEffect,
                interactive: !disabled && !readOnly && !checked,
                noWrap: !wrapLabel,
              }}
            >
              {label}
            </ReqoreTextEffect>
            {labelDetailPosition === 'right' && labelDetail}
            <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
          </>
        ) : null}
        {asSwitch ? (
          <StyledSwitch
            size={size}
            labelPosition={labelPosition}
            checked={checked}
            theme={theme}
            as='div'
            effect={
              {
                interactive: !disabled && !readOnly,
                ...effect,
              } as IReqoreEffect
            }
          >
            <>
              {offText || offText === 0 ? (
                <StyledOffSwitchText
                  ref={offRef}
                  size={size}
                  theme={theme}
                  checked={checked}
                  parentHasGradient={!!effect?.gradient}
                  effect={
                    {
                      uppercase: true,
                      textSize: getOneLessSize(size),
                      weight: 'bold',
                      ...switchTextEffect,
                      opacity: checked ? 0.8 : 1,
                    } as IReqoreEffect
                  }
                >
                  {image || uncheckedIcon ? (
                    <ReqoreIcon
                      size={size}
                      image={image}
                      icon={uncheckedIcon}
                      effect={{ grayscale: true }}
                      margin={offText ? 'right' : undefined}
                    />
                  ) : null}
                  {offText}
                </StyledOffSwitchText>
              ) : null}
              {onText || onText === 0 ? (
                <StyledOnSwitchText
                  ref={onRef}
                  size={size}
                  theme={theme}
                  checked={checked}
                  parentHasGradient={!!effect?.gradient}
                  effect={
                    {
                      uppercase: true,
                      textSize: getOneLessSize(size),
                      weight: 'thick',
                      ...switchTextEffect,
                      opacity: checked ? 1 : 0.3,
                    } as IReqoreEffect
                  }
                >
                  {image || checkedIcon ? (
                    <ReqoreIcon
                      size={size}
                      image={image}
                      margin={onText ? 'right' : undefined}
                      icon={checkedIcon}
                    />
                  ) : null}
                  {onText}
                </StyledOnSwitchText>
              ) : null}
            </>
            <StyledSwitchToggle
              size={size}
              checked={checked}
              width={width}
              theme={theme}
              parentEffect={effect}
              transparent={(image || checkedIcon) && !hasText}
            >
              {!onText && !offText ? (
                <ReqoreIcon
                  size={size}
                  image={image}
                  icon={checked ? checkedIcon : uncheckedIcon}
                  effect={{ grayscale: !checked, opacity: checked ? 1 : 0.5 }}
                />
              ) : null}
            </StyledSwitchToggle>
          </StyledSwitch>
        ) : (
          <ReqoreIcon
            size={size}
            icon={
              !image
                ? checked
                  ? checkedIcon || 'CheckboxCircleFill'
                  : uncheckedIcon || 'CheckboxBlankCircleLine'
                : undefined
            }
            image={image}
            effect={{ grayscale: image ? !checked : undefined, opacity: checked ? 1 : 0.5 }}
            color={intent ? changeLightness(theme.main, 0.2) : undefined}
          />
        )}
        {label && labelPosition === 'right' ? (
          <>
            <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
            {labelDetailPosition === 'left' && labelDetail}
            <ReqoreTextEffect
              active={checked}
              effect={{
                ...labelEffect,
                interactive: !disabled && !readOnly && !checked,
                noWrap: !wrapLabel,
              }}
            >
              {label}
            </ReqoreTextEffect>
            {labelDetailPosition === 'right' && labelDetail}
          </>
        ) : null}
        {margin === 'right' || margin === 'both' ? (
          <ReqoreSpacer width={PADDING_FROM_SIZE[size]} />
        ) : null}
      </StyledCheckbox>
    );
  }
);

export default Checkbox;
