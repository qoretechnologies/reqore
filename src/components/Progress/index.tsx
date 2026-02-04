import { forwardRef, memo, useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { PROGRESS_HEIGHT_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFluid,
  IWithReqoreSize,
} from '../../types/global';
import { StyledEffect } from '../Effect';

export interface IReqoreProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFluid,
    IWithReqoreSize {
  /** Current progress value */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Show indeterminate animation instead of value-based progress */
  indeterminate?: boolean;
  /** Display the current value as text */
  showValue?: boolean;
  /** Custom label to display instead of percentage */
  label?: string;
  /** Enable animation when value changes */
  animated?: boolean;
  /** Whether the progress bar should have rounded corners */
  rounded?: boolean;
  /** Whether the progress track should be transparent */
  transparent?: boolean;
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

const StyledProgressTrack = styled(StyledEffect)<IReqoreProgressStyle>`
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  width: ${({ fluid }) => (fluid ? '100%' : '200px')};
  height: ${({ size }) => PROGRESS_HEIGHT_FROM_SIZE[size!]}px;
  border-radius: ${({ size, rounded }) =>
    rounded === false ? 0 : `${RADIUS_FROM_SIZE[size!]}px`};
  background-color: ${({ theme, transparent }) =>
    transparent ? 'transparent' : changeLightness(theme.main, 0.1)};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

const StyledProgressBar = styled.div<IReqoreProgressStyle>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: inherit;
  background-color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  transition: ${({ animated }) => (animated ? 'width 0.3s ease-out' : 'none')};
  width: ${({ percentage, indeterminate }) => (indeterminate ? '35%' : `${percentage}%`)};

  ${({ indeterminate }) =>
    indeterminate &&
    css`
      animation: ${indeterminateAnimation} 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    `}
`;

const StyledProgressLabel = styled.span<{ size: TSizes; theme: IReqoreTheme }>`
  position: absolute;
  right: 8px;
  font-size: ${({ size }) => (size === 'micro' || size === 'tiny' ? 8 : size === 'small' ? 10 : 12)}px;
  font-weight: 500;
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined)};
  white-space: nowrap;
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
        animated = true,
        customTheme,
        intent,
        fluid = false,
        rounded = true,
        transparent = false,
        disabled,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);

      const percentage = useMemo(() => {
        if (indeterminate || max === 0) return 0;
        const clampedValue = Math.max(0, Math.min(value, max));
        return (clampedValue / max) * 100;
      }, [value, max, indeterminate]);

      const displayLabel = useMemo(() => {
        if (label) return label;
        if (showValue && !indeterminate) return `${Math.round(percentage)}%`;
        return null;
      }, [label, showValue, percentage, indeterminate]);

      const shouldShowLabel = displayLabel && size !== 'micro' && size !== 'tiny' && size !== 'small';

      return (
        <StyledProgressTrack
          {...rest}
          ref={ref}
          theme={theme}
          size={size}
          fluid={fluid}
          rounded={rounded}
          transparent={transparent}
          disabled={disabled}
          className={`${className || ''} reqore-progress`}
          role="progressbar"
          aria-valuenow={indeterminate ? undefined : Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={rest['aria-label'] || 'Progress'}
        >
          <StyledProgressBar
            theme={theme}
            size={size}
            percentage={percentage}
            indeterminate={indeterminate}
            animated={animated}
            className="reqore-progress-bar"
          />
          {shouldShowLabel && (
            <StyledProgressLabel size={size!} theme={theme} className="reqore-progress-label">
              {displayLabel}
            </StyledProgressLabel>
          )}
        </StyledProgressTrack>
      );
    }
  )
);

export default ReqoreProgress;
