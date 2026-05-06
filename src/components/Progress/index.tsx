import { darken, rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import {
  CONTROL_TEXT_FROM_SIZE,
  PROGRESS_HEIGHT_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFluid,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Current progress value */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Show indeterminate animation instead of value-based progress */
  indeterminate?: boolean;
  /** Display the current value as text above the track */
  showValue?: boolean;
  /** Custom label to display above the track (left side) */
  label?: string;
  /** Show animated diagonal stripes on the progress bar */
  animated?: boolean;
  /** Whether the progress bar should have rounded corners */
  rounded?: boolean;
  /** Whether the progress track should be transparent */
  transparent?: boolean;
  /** Left icon */
  icon?: IReqoreIconName;
  /** Left icon color */
  iconColor?: TReqoreEffectColor;
  /** Left icon props */
  leftIconProps?: IReqoreIconProps;
  /** Right icon */
  rightIcon?: IReqoreIconName;
  /** Right icon color */
  rightIconColor?: TReqoreEffectColor;
  /** Right icon props */
  rightIconProps?: IReqoreIconProps;
  /**
   * Target marker drawn on top of the track at this value (must be between 0 and `max`).
   * Useful for visualising goals (e.g. "90% target coverage"). Hidden when not set.
   */
  target?: number;
  /** Optional label rendered above the target marker. Defaults to the target percentage. */
  targetLabel?: string;
  /** Whether to render the marker label above the marker line. Defaults to `true`. */
  showTargetLabel?: boolean;
  /** Custom color for the target marker line/label. Falls back to a theme-readable colour. */
  targetColor?: TReqoreEffectColor;
}

export interface IReqoreProgressStyle extends IReqoreProgressProps {
  theme: IReqoreTheme;
  percentage: number;
}

const indeterminateAnimation = keyframes`
  0% {
    left: -35%;
    right: 100%;
  }
  60% {
    left: 100%;
    right: -90%;
  }
  100% {
    left: 100%;
    right: -90%;
  }
`;

const stripesAnimation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
`;

const StyledProgressWrapper = styled.div<IReqoreProgressStyle>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: ${({ fluid }) => (fluid ? '100%' : '200px')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

const StyledProgressLabels = styled.div<{ size: TSizes; theme: IReqoreTheme }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
  gap: 8px;
`;

const StyledProgressLabelLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledProgressLabelRight = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

// Returns the progress bar color - uses intent color if applied, otherwise a readable default
const getProgressColor = (theme: IReqoreTheme) => {
  // If theme.main differs from originalMain, an intent was applied
  const hasIntent = theme.main !== theme.originalMain;
  return hasIntent ? theme.main : getReadableColor(theme, undefined, undefined, true);
};

const StyledProgressTrack = styled.div<IReqoreProgressStyle>`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: ${({ size }) => PROGRESS_HEIGHT_FROM_SIZE[size!]}px;
  border-radius: ${({ size, rounded }) => (rounded === false ? 0 : `${RADIUS_FROM_SIZE[size!]}px`)};
  background-color: ${({ theme, transparent }) =>
    transparent ? 'transparent' : rgba(getProgressColor(theme), 0.2)};
  border: ${({ flat, theme }) =>
    flat === false ? `1px solid ${rgba(getProgressColor(theme), 0.6)}` : 'none'};
`;

interface IStyledProgressTargetProps {
  $left: number;
  $color: string;
}

const StyledProgressTargetMarker = styled.div<IStyledProgressTargetProps>`
  position: absolute;
  top: -2px;
  bottom: -2px;
  left: ${({ $left }) => $left}%;
  width: 2px;
  background-color: ${({ $color }) => $color};
  border-radius: 1px;
  pointer-events: none;
  z-index: 2;
`;

const StyledProgressTargetLabel = styled.div<{ $left: number; $color: string }>`
  position: absolute;
  bottom: calc(100% + 4px);
  left: ${({ $left }) => $left}%;
  transform: translateX(-50%);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $color }) => $color};
  white-space: nowrap;
  pointer-events: none;
  z-index: 2;
`;

const StyledProgressBar = styled.div<IReqoreProgressStyle>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: inherit;
  background-color: ${({ theme }) => getProgressColor(theme)};
  transition: width 0.3s ease-out;
  width: ${({ percentage, indeterminate }) => (indeterminate ? '35%' : `${percentage}%`)};

  ${({ indeterminate }) =>
    indeterminate &&
    css`
      animation: ${indeterminateAnimation} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `}

  ${({ animated, indeterminate, theme }) =>
    animated &&
    !indeterminate &&
    css`
      background-image: linear-gradient(
        -45deg,
        ${rgba(darken(0.1, getProgressColor(theme)), 0.5)} 25%,
        transparent 25%,
        transparent 50%,
        ${rgba(darken(0.1, getProgressColor(theme)), 0.5)} 50%,
        ${rgba(darken(0.1, getProgressColor(theme)), 0.5)} 75%,
        transparent 75%,
        transparent
      );
      background-size: 40px 40px;
      animation: ${stripesAnimation} 1s linear infinite;
    `}
`;

const ReqoreProgress = memo(
  forwardRef<HTMLDivElement, IReqoreProgressProps>(
    (
      {
        value = 0,
        max = 100,
        size = 'normal',
        indeterminate = false,
        showValue = false,
        label,
        animated = false,
        customTheme,
        inheritCustomTheme,
        intent,
        fluid = false,
        rounded = true,
        transparent = false,
        flat = true,
        disabled,
        className,
        tooltip,
        icon,
        iconColor,
        leftIconProps,
        rightIcon,
        rightIconColor,
        rightIconProps,
        target,
        targetLabel,
        showTargetLabel = true,
        targetColor,
        ...rest
      },
      ref
    ) => {
      // Theme with intent for the progress bar
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      // Base theme without intent for labels
      const baseTheme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);

      const percentage = useMemo(() => {
        if (indeterminate || max === 0) return 0;
        const clampedValue = Math.max(0, Math.min(value, max));
        return (clampedValue / max) * 100;
      }, [value, max, indeterminate]);

      const valueLabel = useMemo(() => {
        if (!showValue || indeterminate) return null;
        return `${Math.round(percentage)}%`;
      }, [showValue, percentage, indeterminate]);

      const targetPercent = useMemo(() => {
        if (target === undefined || indeterminate || max <= 0) return null;
        const clamped = Math.max(0, Math.min(target, max));
        return (clamped / max) * 100;
      }, [target, max, indeterminate]);

      const resolvedTargetColor = useMemo(() => {
        if (targetColor) return targetColor as string;
        return getReadableColor(baseTheme, undefined, undefined, true);
      }, [targetColor, baseTheme]);

      const resolvedTargetLabel = useMemo(() => {
        if (targetPercent === null) return null;
        if (targetLabel !== undefined) return targetLabel;
        return `Target ${Math.round(targetPercent)}%`;
      }, [targetPercent, targetLabel]);

      const hasLabels = !!(
        label ||
        icon ||
        leftIconProps ||
        valueLabel ||
        rightIcon ||
        rightIconProps
      );
      const leftIcon = icon || leftIconProps?.icon;
      const hasLeftIcon = !!leftIcon || !!leftIconProps?.image;
      const hasRightIcon = !!rightIcon || !!rightIconProps?.image;

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledProgressWrapper}
          tooltip={tooltip}
          ref={ref}
          theme={theme}
          size={size}
          fluid={fluid}
          disabled={disabled}
          className={`${className || ''} reqore-progress`}
          role='progressbar'
          aria-valuenow={indeterminate ? undefined : Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={rest['aria-label'] || label || 'Progress'}
        >
          {hasLabels && (
            <StyledProgressLabels size={size} theme={baseTheme} className='reqore-progress-labels'>
              <StyledProgressLabelLeft className='reqore-progress-label-left'>
                {hasLeftIcon && (
                  <ReqoreIcon icon={leftIcon} size={size} color={iconColor} {...leftIconProps} />
                )}
                {label && <span className='reqore-progress-label'>{label}</span>}
              </StyledProgressLabelLeft>
              <StyledProgressLabelRight className='reqore-progress-label-right'>
                {valueLabel && <span className='reqore-progress-value'>{valueLabel}</span>}
                {hasRightIcon && (
                  <ReqoreIcon
                    icon={rightIcon}
                    size={size}
                    color={rightIconColor}
                    {...rightIconProps}
                  />
                )}
              </StyledProgressLabelRight>
            </StyledProgressLabels>
          )}
          <StyledProgressTrack
            theme={theme}
            size={size}
            rounded={rounded}
            transparent={transparent}
            flat={flat}
            className='reqore-progress-track'
          >
            <StyledProgressBar
              theme={theme}
              size={size}
              percentage={percentage}
              indeterminate={indeterminate}
              animated={animated}
              className='reqore-progress-bar'
            />
            {targetPercent !== null && (
              <>
                {showTargetLabel && resolvedTargetLabel && (
                  <StyledProgressTargetLabel
                    $left={targetPercent}
                    $color={resolvedTargetColor}
                    className='reqore-progress-target-label'
                  >
                    {resolvedTargetLabel}
                  </StyledProgressTargetLabel>
                )}
                <StyledProgressTargetMarker
                  $left={targetPercent}
                  $color={resolvedTargetColor}
                  className='reqore-progress-target'
                  aria-hidden
                />
              </>
            )}
          </StyledProgressTrack>
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreProgress;
