import { forwardRef, memo, useMemo } from 'react';
import { rgba } from 'polished';
import styled, { css } from 'styled-components';
import {
  HEADER_SIZE_TO_NUMBER,
  PADDING_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFixed,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreEffect, StyledEffect } from '../Effect';
import { ReqoreHeading } from '../Header';
import { ReqoreP } from '../Paragraph';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export type TReqoreFeatureCardMarker = 'line' | 'number' | 'none';

export interface IReqoreFeatureCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFixed,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  label: React.ReactNode;
  labelEffect?: IReqoreEffect;
  description?: React.ReactNode;
  descriptionEffect?: IReqoreEffect;
  marker?: TReqoreFeatureCardMarker;
  markerLabel?: string | number;
  markerEffect?: IReqoreEffect;
  rounded?: boolean;
  interactive?: boolean;
}

interface IStyledFeatureCardProps extends IReqoreFeatureCardProps {
  theme: IReqoreTheme;
}

const StyledFeatureCard = styled(StyledEffect)<IStyledFeatureCardProps>`
  display: flex;
  flex-flow: column;
  gap: ${({ size = 'normal' }) => PADDING_FROM_SIZE[size]}px;
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  max-width: 100%;
  padding: ${({ size = 'normal' }) => PADDING_FROM_SIZE[size] * 3}px;
  background-color: ${({ theme }) => changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border: ${({ theme, intent, flat }) =>
    flat
      ? 0
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  border-radius: ${({ rounded }) => (rounded ? '8px' : 0)};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
  position: relative;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};
  transition:
    border-color 0.16s ease,
    background-color 0.16s ease,
    transform 0.16s ease;

  ${({ disabled }) => disabled && DisabledElement}

  ${({ interactive, theme, intent }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            transform: translateY(-1px);
            border-color: ${changeLightness(
              intent ? theme.intents[intent] : getMainBackgroundColor(theme),
              0.18
            )};
          }
        `
      : undefined}
`;

const StyledFeatureCardMarker = styled.div<{
  marker: TReqoreFeatureCardMarker;
  size: TSizes;
  theme: IReqoreTheme;
  intent?: IReqoreIntent['intent'];
}>`
  display: flex;
  align-items: flex-start;
  color: ${({ theme, intent }) =>
    intent ? theme.intents[intent] : changeLightness(getMainBackgroundColor(theme), 0.22)};
  font-size: ${({ size }) => TEXT_FROM_SIZE[size] * 1.4}px;
  font-weight: 900;
  line-height: 0.9;

  ${({ marker, theme, intent }) =>
    marker === 'line'
      ? css`
          &::before {
            content: '';
            width: 32px;
            height: 6px;
            background-color: ${intent
              ? theme.intents[intent]
              : changeLightness(getMainBackgroundColor(theme), 0.22)};
            box-shadow: 0 0 22px
              ${rgba(
                intent ? theme.intents[intent] : changeLightness(getMainBackgroundColor(theme), 0.22),
                0.3
              )};
          }
        `
      : undefined}
`;

const StyledFeatureCardContent = styled.div`
  display: flex;
  flex-flow: column;
  gap: 12px;
`;

export const ReqoreFeatureCard = memo(
  forwardRef<HTMLDivElement, IReqoreFeatureCardProps>(
    (
      {
        label,
        labelEffect,
        description,
        descriptionEffect,
        marker = 'line',
        markerLabel,
        markerEffect,
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        intent,
        className,
        flat,
        fluid,
        fixed,
        disabled,
        tooltip,
        rounded,
        effect,
        interactive,
        onClick,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const labelSize = useMemo(
        () => HEADER_SIZE_TO_NUMBER[size] as 1 | 2 | 3 | 4 | 5 | 6,
        [size]
      );
      const descriptionSize = useMemo(() => getOneLessSize(size), [size]);
      const isInteractive = interactive || !!onClick;

      return (
        <ReqoreTooltipComponent
          {...rest}
          ref={ref}
          Component={StyledFeatureCard}
          theme={theme}
          customTheme={customTheme}
          inheritCustomTheme={inheritCustomTheme}
          intent={intent}
          flat={flat}
          fluid={fluid}
          fixed={fixed}
          disabled={disabled}
          tooltip={tooltip}
          rounded={rounded}
          effect={{ interactive: isInteractive, ...effect }}
          interactive={isInteractive}
          onClick={onClick}
          size={size}
          className={`${className || ''} reqore-feature-card`}
        >
          {marker !== 'none' && (
            <StyledFeatureCardMarker
              marker={marker}
              size={size}
              theme={theme}
              intent={intent}
              className='reqore-feature-card-marker'
            >
              {marker === 'number' && (
                <StyledEffect effect={markerEffect}>{markerLabel}</StyledEffect>
              )}
            </StyledFeatureCardMarker>
          )}
          <StyledFeatureCardContent className='reqore-feature-card-content'>
            <ReqoreHeading
              size={labelSize}
              customTheme={theme}
              effect={labelEffect}
              className='reqore-feature-card-label'
            >
              {label}
            </ReqoreHeading>
            {description && (
              <ReqoreP
                size={descriptionSize}
                customTheme={theme}
                effect={{ opacity: 0.72, ...descriptionEffect }}
                className='reqore-feature-card-description'
              >
                {description}
              </ReqoreP>
            )}
          </StyledFeatureCardContent>
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreFeatureCard;
