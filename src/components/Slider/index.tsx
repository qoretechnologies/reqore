import * as Slider from '@radix-ui/react-slider';
import { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { HALF_PADDING_FROM_SIZE, ICON_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { TReqoreTooltipProp } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import { IReqoreEffect, IReqoreTextEffectProps, StyledEffect, TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { IReqoreParagraphProps, ReqoreP } from '../Paragraph';
import ReqoreTag, { IReqoreTagProps } from '../Tag';

export interface ISliderProps<T extends number | [number, number] = number>
  extends Omit<Slider.SliderProps, 'onChange' | 'value' | 'defaultValue' | 'onValueChange'> {
  value: T;
  onChange(values: T): void;
  fluid?: boolean;

  icon?: IReqoreIconName;
  iconColor?: TReqoreEffectColor;
  iconProps?: IReqoreIconProps;

  rightIcon?: IReqoreIconName;
  rightIconColor?: TReqoreEffectColor;
  rightIconProps?: IReqoreIconProps;

  showLabels?: boolean;
  size?: TSizes;
  labelsPosition: 'top' | 'bottom';
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  effect?: IReqoreEffect;
  tooltip: TReqoreTooltipProp;

  trackProps?: Partial<IReqoreTextEffectProps>;
  rangeProps?: Partial<IReqoreTextEffectProps>;
  thumbProps?: Partial<IReqoreTextEffectProps>;

  minLabelProps?: IReqoreParagraphProps;
  currentMinLabelProps?: IReqoreTagProps;
  maxLabelProps?: IReqoreParagraphProps;
  currentMaxLabelProps?: IReqoreTagProps;
  wrapperProps?: IReqoreControlGroupProps;

  displayCurrentValueOverThumb?: boolean;
}

const StyledControlGroupWrapper = styled(ReqoreControlGroup)`
  &[data-orientation='horizontal'] {
    &[data-fluid='false'] {
      max-width: 200px;
      min-width: 200px;
    }
  }
  &[data-orientation='vertical'] {
    &[data-fluid='false'] {
      max-height: 200px;
    }
  }
`;

const StyledTrack = styled(Slider.Track)`
  background-color: ${(props) => props.background};
  position: relative;
  border-radius: 9999px;
`;
const StyledRange = styled(Slider.Range)`
  position: absolute;
  background-color: ${(props) => props.background};
  border-radius: 9999px;
`;
const StyledThumb = styled(Slider.Thumb)`
  display: block;
  background-color: ${(props) => props.background};
  border-radius: 9999px;
  transition: all 0.2s ease-out;

  &:focus {
    box-shadow: 0 0 0 8px ${(props) => props.background}15;
    outline: none;
  }
`;
const StyledRoot = styled(Slider.Root)`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-grow: 1;

  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  ${({ 'data-size': size }) => css`
    ${StyledThumb} {
      width: ${ICON_FROM_SIZE[size]}px;
      height: ${ICON_FROM_SIZE[size]}px;
      min-width: ${ICON_FROM_SIZE[size]}px;
    }
  `}

  &[data-orientation='horizontal'] {
    width: 100%;

    ${({ 'data-size': size }) => css`
      height: ${ICON_FROM_SIZE[size]}px;

      ${StyledTrack} {
        height: ${HALF_PADDING_FROM_SIZE[size]}px;
      }
    `}

    ${StyledTrack} {
      flex-grow: 1;
    }
    ${StyledRange} {
      height: 100%;
    }
  }

  &[data-orientation='vertical'] {
    flex-direction: column;
    justify-content: center;
    height: 200px;

    ${({ 'data-size': size }) => css`
      width: ${ICON_FROM_SIZE[size]}px;

      ${StyledTrack} {
        width: ${HALF_PADDING_FROM_SIZE[size]}px;
      }
    `}

    ${StyledTrack} {
      flex-grow: 1;
    }
    ${StyledRange} {
      width: 100%;
    }
  }
`;

const StyledCurrentValue = styled(ReqoreTag)`
  position: absolute;
  ${({ position, isAboveThreshold, isBelowThreshold }) =>
    css`
      ${position}: ${isAboveThreshold || isBelowThreshold ? '-5px' : '-35px'};
      ${position === 'left' || position === 'right' ? 'top' : 'left'}: 50%;
      transform: ${position === 'left' || position === 'right'
        ? 'translateY(-50%)'
        : 'translateX(-50%)'};
    `}
`;

const SliderRootWrapper = styled(ReqoreControlGroup)`
  align-items: center;
  flex-grow: 1;
  width: 100%;
`;

export function ReqoreSlider<T extends number | [number, number] = number>({
  value,
  onChange,
  step = 0.1,
  orientation = 'horizontal',
  fluid = true,
  showLabels,
  icon,
  iconColor,
  iconProps,
  rightIcon,
  rightIconColor,
  rightIconProps,
  customTheme,
  intent,
  effect,
  trackProps,
  rangeProps,
  thumbProps,
  minLabelProps,
  maxLabelProps,
  size = 'normal',
  wrapperProps,
  labelsPosition = 'top',
  tooltip,
  currentMaxLabelProps,
  currentMinLabelProps,
  displayCurrentValueOverThumb,
  ...props
}: ISliderProps<T>) {
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement>(undefined);
  const theme = useReqoreTheme('main', customTheme, intent);

  useTooltip(wrapperRef, tooltip);

  const background = intent
    ? changeLightness(theme.main, 0.2)
    : getReadableColor(theme, undefined, undefined, true);
  const trackBackground = intent
    ? changeLightness(theme.main, 0.05)
    : changeLightness(theme.main, 0.2);
  const isRange = Array.isArray(value);

  const renderLabels = useCallback(() => {
    if (!showLabels) {
      return null;
    }

    return (
      <ReqoreControlGroup fluid spaceBetween vertical={orientation === 'vertical'} fill>
        <ReqoreControlGroup fixed vertical={orientation === 'vertical'} horizontalAlign='center'>
          {icon && (
            <ReqoreIcon icon={icon} size={size} color={iconColor} intent={intent} {...iconProps} />
          )}
          {props.min || props.min === 0 ? (
            <ReqoreP size={size} intent={intent} effect={effect} {...minLabelProps}>
              {props.min}
            </ReqoreP>
          ) : null}
        </ReqoreControlGroup>
        <ReqoreControlGroup fixed vertical={orientation === 'vertical'} horizontalAlign='center'>
          {props.max || props.max === 0 ? (
            <ReqoreP size={size} intent={intent} effect={effect} {...maxLabelProps}>
              {props.max}
            </ReqoreP>
          ) : null}
          {rightIcon && (
            <ReqoreIcon
              icon={rightIcon}
              size={size}
              color={rightIconColor}
              intent={intent}
              {...rightIconProps}
            />
          )}
        </ReqoreControlGroup>
      </ReqoreControlGroup>
    );
  }, [
    icon,
    rightIcon,
    iconProps,
    rightIconProps,
    minLabelProps,
    maxLabelProps,
    size,
    intent,
    props.min,
    props.max,
    showLabels,
    orientation,
    effect,
  ]);

  const currentValuePosition = useMemo(() => {
    return orientation === 'horizontal'
      ? labelsPosition === 'top'
        ? 'top'
        : 'bottom'
      : labelsPosition === 'top'
      ? 'left'
      : 'right';
  }, [orientation, labelsPosition]);

  const isMinValueBelowThreshold = useMemo(() => {
    const _value: number = isRange ? value[0] : value;

    return _value < props.min + step * 5;
  }, [value, props.min]);

  const isMaxValueAboveThreshold = useMemo(() => {
    if (!isRange) return false;

    const _value: number = value[1];

    return _value > props.max - step * 5;
  }, [value, props.max]);

  return (
    <StyledControlGroupWrapper
      ref={setWrapperRef}
      data-orientation={orientation}
      data-labels-position={labelsPosition}
      data-fluid={fluid}
      fluid={fluid}
      vertical={orientation === 'horizontal'}
      fill
      gapSize={orientation === 'horizontal' ? 'big' : 'normal'}
      {...wrapperProps}
    >
      {labelsPosition === 'top' && renderLabels()}
      <SliderRootWrapper vertical={orientation === 'vertical'}>
        <StyledRoot
          data-size={size}
          orientation={orientation}
          minStepsBetweenThumbs={step}
          inverted={orientation === 'vertical'}
          step={step}
          {...props}
          value={isRange ? value : [value]}
          onValueChange={(values) => {
            onChange((isRange ? values : values[0]) as T);
          }}
        >
          <StyledTrack background={trackBackground} asChild>
            <StyledEffect effect={effect} {...trackProps}>
              <StyledRange background={background} asChild>
                <StyledEffect effect={effect} {...rangeProps} />
              </StyledRange>
            </StyledEffect>
          </StyledTrack>

          <StyledThumb background={background} asChild>
            <StyledEffect effect={effect} {...thumbProps}>
              {showLabels && (
                <StyledCurrentValue
                  size={size}
                  effect={effect}
                  intent={intent}
                  position={currentValuePosition}
                  label={isRange ? value[0] : value}
                  isBelowThreshold={displayCurrentValueOverThumb || isMinValueBelowThreshold}
                  {...currentMinLabelProps}
                />
              )}
            </StyledEffect>
          </StyledThumb>
          {isRange && (
            <StyledThumb background={background} asChild>
              <StyledEffect effect={effect} {...thumbProps}>
                {showLabels && (
                  <StyledCurrentValue
                    size={size}
                    effect={effect}
                    intent={intent}
                    position={currentValuePosition}
                    isAboveThreshold={displayCurrentValueOverThumb || isMaxValueAboveThreshold}
                    label={value[1]}
                    {...currentMaxLabelProps}
                  />
                )}
              </StyledEffect>
            </StyledThumb>
          )}
        </StyledRoot>
      </SliderRootWrapper>
      {labelsPosition === 'bottom' && renderLabels()}
    </StyledControlGroupWrapper>
  );
}

export default ReqoreSlider;
