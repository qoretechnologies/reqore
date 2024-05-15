import * as Slider from '@radix-ui/react-slider';
import { useState } from 'react';
import styled from 'styled-components';
import { TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { TReqoreTooltipProp } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import {
  IReqoreEffect,
  IReqoreTextEffectProps,
  ReqoreTextEffect,
  StyledEffect,
  TReqoreEffectColor,
} from '../Effect';
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
  size?: TSizes;
  labelsPosition: 'top' | 'bottom';
  customTheme?: IReqoreCustomTheme;
  intent?: TReqoreIntent;
  effect?: IReqoreEffect;
  tooltip: TReqoreTooltipProp;

  trackProps?: Partial<IReqoreTextEffectProps>;
  rangeProps?: Partial<IReqoreTextEffectProps>;
  thumbProps?: Partial<IReqoreTextEffectProps>;

  minLabelProps?: IReqoreTextEffectProps;
  maxLabelProps?: IReqoreTextEffectProps;
  wrapperProps?: IReqoreControlGroupProps;
}

const StyledLabelsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;
const StyledControlGroupWrapper = styled(ReqoreControlGroup)`
  &[data-orientation='horizontal'] {
    &[data-fluid='false'] {
      max-width: 200px;
      min-width: 200px;
    }
    &[data-labels-position='bottom'] {
      flex-direction: column-reverse;
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
  }
  &[data-size='tiny'] ${StyledThumb} {
    width: 16px;
    min-width: 16px;
    height: 16px;
  }
  &[data-size='small'] ${StyledThumb} {
    width: 18px;
    min-width: 18px;
    height: 18px;
  }
  &[data-size='normal'] ${StyledThumb} {
    width: 20px;
    min-width: 20px;
    height: 20px;
  }
  &[data-size='big'] ${StyledThumb} {
    width: 24px;
    min-width: 24px;
    height: 24px;
  }
  &[data-size='huge'] ${StyledThumb} {
    width: 28px;
    min-width: 28px;
    height: 28px;
  }

  &[data-orientation='horizontal'] {
    width: 100%;
    height: 20px;

    &[data-size='tiny'] {
      height: 16px;

      ${StyledTrack} {
        height: 1px;
      }
      ${StyledThumb} {
        width: 16px;
        min-width: 16px;
        height: 16px;
      }
    }
    &[data-size='small'] {
      height: 18px;

      ${StyledTrack} {
        height: 2px;
      }
      ${StyledThumb} {
        width: 18px;
        min-width: 18px;
        height: 18px;
      }
    }
    &[data-size='normal'] {
      height: 20px;

      ${StyledTrack} {
        height: 3px;
      }
      ${StyledThumb} {
        width: 20px;
        min-width: 20px;
        height: 20px;
      }
    }
    &[data-size='big'] {
      height: 24px;

      ${StyledTrack} {
        height: 6px;
      }
      ${StyledThumb} {
        width: 24px;
        min-width: 24px;
        height: 24px;
      }
    }
    &[data-size='huge'] {
      height: 28px;
      ${StyledTrack} {
        height: 10px;
      }
      ${StyledThumb} {
        width: 28px;
        min-width: 28px;
        height: 28px;
      }
    }

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
    width: 20px;
    height: 200px;

    &[data-size='tiny'] {
      width: 16px;

      ${StyledTrack} {
        width: 1px;
      }
    }
    &[data-size='small'] {
      width: 18px;

      ${StyledTrack} {
        width: 2px;
      }
    }
    &[data-size='normal'] {
      width: 20px;

      ${StyledTrack} {
        width: 3px;
      }
    }
    &[data-size='big'] {
      width: 24px;

      ${StyledTrack} {
        width: 6px;
      }
    }
    &[data-size='huge'] {
      width: 28px;
      ${StyledTrack} {
        width: 10px;
      }
    }

    ${StyledTrack} {
      flex-grow: 1;
    }
    ${StyledRange} {
      width: 100%;
    }
  }
`;
const SliderRootWrapper = styled(ReqoreControlGroup)`
  align-items: center;
  flex-grow: 1;
  width: 100%;
`;
const StyledLabel = styled(ReqoreTextEffect)`
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

  return (
    <StyledControlGroupWrapper
      ref={setWrapperRef}
      data-orientation={orientation}
      data-labels-position={labelsPosition}
      data-fluid={fluid}
      fluid={fluid}
      vertical={orientation === 'horizontal'}
      {...wrapperProps}
    >
      {showLabels && orientation === 'horizontal' && (
        <StyledLabelsWrapper>
          <StyledLabel effect={effect} {...minLabelProps}>
            {props.min}
          </StyledLabel>
          <StyledLabel effect={effect} {...maxLabelProps}>
            {props.max}
          </StyledLabel>
        </StyledLabelsWrapper>
      )}
      <SliderRootWrapper vertical={orientation === 'vertical'}>
        {icon && (
          <ReqoreIcon
            size={size}
            effect={effect}
            icon={icon}
            color={iconColor || iconColor}
            {...iconProps}
          />
        )}
        {showLabels && orientation === 'vertical' && (
          <StyledLabel effect={effect} {...minLabelProps}>
            {props.min}
          </StyledLabel>
        )}

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
            <StyledEffect effect={effect} {...thumbProps} />
          </StyledThumb>
          {isRange && (
            <StyledThumb background={background} asChild>
              <StyledEffect effect={effect} {...thumbProps} />
            </StyledThumb>
          )}
        </StyledRoot>
        {showLabels && orientation === 'vertical' && (
          <StyledLabel effect={effect} {...maxLabelProps}>
            {props.max}
          </StyledLabel>
        )}
        {rightIcon && (
          <ReqoreIcon
            size={size}
            icon={rightIcon}
            effect={effect}
            color={rightIconColor || iconColor}
            {...rightIconProps}
          />
        )}
      </SliderRootWrapper>
    </StyledControlGroupWrapper>
  );
}

export default ReqoreSlider;
