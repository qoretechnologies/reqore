import * as Slider from '@radix-ui/react-slider';
import React, { useState } from 'react';
import styled from 'styled-components';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useTooltip } from '../../hooks/useTooltip';
import { IReqoreTooltip } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';

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
  tooltipProps?: IReqoreTooltip;
}

const StyledWrapper = styled.div`
  display: flex;

  &[data-orientation='horizontal'] {
    &[data-fluid='true'] {
      width: 100%;
    }
    &[data-fluid='false'] {
      max-width: 200px;
      min-width: 200px;
    }
  }
  &[data-orientation='vertical'] {
    align-items: center;
    width: 20px;

    &[data-fluid='true'] {
      height: 100%;
    }
    &[data-fluid='false'] {
      max-height: 200px;
    }
  }
`;
const StyledTrack = styled(Slider.Track)`
  background-color: ${(props) => changeLightness(props.theme.main, 0.2)};
  position: relative;
  border-radius: 9999px;
`;
const StyledRange = styled(Slider.Range)`
  position: absolute;
  background-color: ${(props) => getReadableColor(props.theme, undefined, undefined, true)};
  border-radius: 9999px;
`;
const StyledRoot: React.FC<Slider.SliderProps> = styled(Slider.Root)`
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-grow: 1;

  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &[data-orientation='horizontal'] {
    width: 100%;
    height: 20px;

    ${StyledTrack} {
      height: 3px;
      flex-grow: 1;
    }
    ${StyledRange} {
      height: 100%;
    }
  }
  &[data-orientation='vertical'] {
    flex-direction: column;
    justify-content: center;
    width: 20px;
    height: 200px;

    ${StyledTrack} {
      width: 3px;
      flex-grow: 1;
    }
    ${StyledRange} {
      width: 100%;
    }
  }
`;
const SliderRootWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 8px;
  width: 100%;

  &[data-orientation='vertical'] {
    flex-direction: column;
  }
`;
const StyledThumb = styled(Slider.Thumb)`
  display: block;
  width: 20px;
  height: 20px;
  background-color: ${(props) => getReadableColor(props.theme, undefined, undefined, true)};
  border-radius: 10px;
  transition: all 0.2s ease-out;

  &:focus {
    box-shadow: 0 0 0 8px ${(props) => changeLightness(props.theme.main, 0.5)}15;
    outline: none;
  }
`;

const StyledLabel = styled.label`
  font-weight: 600;
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
  tooltipProps = {},
  ...props
}: ISliderProps<T>) {
  const isRange = Array.isArray(value);
  const [minRef, setMinRef] = useState<HTMLSpanElement>();
  const [maxRef, setMaxRef] = useState<HTMLSpanElement>();

  const tooltipOptions: IReqoreTooltip = {
    handler: 'hoverStay',
    placement: orientation === 'horizontal' ? 'bottom' : 'right',
    ...tooltipProps,
  };
  useTooltip(minRef, {
    ...tooltipOptions,
    content: isRange ? value[0].toString() : value.toString(),
  });
  useTooltip(maxRef, {
    ...tooltipOptions,
    content: isRange ? value[1].toString() : undefined,
  });

  return (
    <StyledWrapper data-orientation={orientation} data-fluid={fluid}>
      <SliderRootWrapper data-orientation={orientation} data-fluid={fluid}>
        {icon && <ReqoreIcon icon={icon} color={iconColor || iconColor} {...iconProps} />}
        {showLabels && <StyledLabel>{props.min}</StyledLabel>}

        <StyledRoot
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
          <StyledTrack>
            <StyledRange />
          </StyledTrack>

          <StyledThumb ref={(node) => setMinRef(node)} />
          {isRange && <StyledThumb ref={(node) => setMaxRef(node)} />}
        </StyledRoot>

        {showLabels && <StyledLabel>{props.max}</StyledLabel>}
        {rightIcon && (
          <ReqoreIcon icon={rightIcon} color={rightIconColor || iconColor} {...rightIconProps} />
        )}
      </SliderRootWrapper>
    </StyledWrapper>
  );
}

export default ReqoreSlider;
