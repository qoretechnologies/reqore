import { rgba } from 'polished';
import { forwardRef, memo, useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE, RATING_GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getColorFromMaybeString, getReadableColor } from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useComponentTooltip } from '../../hooks/useComponentTooltip';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement, ReadOnlyElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreCustomTheme,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreControlGroup from '../ControlGroup';
import { TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { IReqoreParagraphProps, ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';

export interface IReqoreRatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    IReqoreDisabled,
    IReqoreReadOnly,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Current rating value (controlled) */
  value?: number;
  /** Label for the rating component */
  label?: string;
  labelProps?: IReqoreParagraphProps;
  /** Callback fired when rating changes */
  onChange?: (value: number) => void;
  /** Maximum number of icons (default: 5) */
  max?: number;
  /** Allow half-step increments */
  allowHalf?: boolean;
  /** Allow clearing rating by clicking the current value again */
  allowClear?: boolean;
  /** Icon for filled state */
  filledIcon?: IReqoreIconName;
  /** Icon for empty state */
  emptyIcon?: IReqoreIconName;
  /** Icon for half-filled state */
  halfIcon?: IReqoreIconName;
  /** Color for filled icons */
  filledColor?: TReqoreEffectColor;
  /** Color for empty icons */
  emptyColor?: TReqoreEffectColor;
  // Whether to show the numeric rating value next to the icons
  showRatingValue?: boolean;
  /** Additional props passed to each ReqoreIcon */
  iconProps?: Omit<IReqoreIconProps, 'icon' | 'size' | 'color'>;
}

interface IReqoreRatingStyle {
  theme: IReqoreTheme;
  size: TSizes;
  disabled?: boolean;
  readOnly?: boolean;
  isInteractive?: boolean;
}

interface IReqoreRatingItemStyle {
  isInteractive?: boolean;
  size: TSizes;
}

const StyledRating = styled.div<IReqoreRatingStyle>`
  display: inline-flex;
  align-items: center;
  gap: ${({ size }) => RATING_GAP_FROM_SIZE[size]}px;

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

  &:focus-visible {
    outline: 2px solid ${({ theme }) => changeLightness(theme.main, 0.25)};
    outline-offset: 2px;
    border-radius: ${({ size }) => RADIUS_FROM_SIZE[size]}px;
  }
`;

const StyledRatingItem = styled.span<IReqoreRatingItemStyle>`
  display: inline-flex;
  cursor: ${({ isInteractive }) => (isInteractive ? 'pointer' : 'default')};
  transition: transform 0.15s ease-out;

  ${({ isInteractive }) =>
    isInteractive &&
    css`
      &:hover {
        transform: scale(1.2);
      }

      &:active {
        transform: scale(0.85);
        transition: transform 0.05s ease-out;
      }
    `}
`;

const ReqoreRating = memo(
  forwardRef<HTMLDivElement, IReqoreRatingProps>(
    (
      {
        value = 0,
        label,
        onChange,
        max = 5,
        allowHalf = false,
        allowClear = true,
        filledIcon = 'StarFill',
        emptyIcon = 'StarLine',
        halfIcon = 'StarHalfFill',
        filledColor,
        emptyColor,
        size = 'normal',
        disabled,
        readOnly,
        intent,
        customTheme,
        inheritCustomTheme,
        tooltip,
        className,
        labelProps,
        showRatingValue,
        iconProps,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const [hoverValue, setHoverValue] = useState<number | null>(null);

      const isInteractive = !disabled && !readOnly && !!onChange;
      const displayValue = useMemo(
        () => (hoverValue !== null ? hoverValue : value),
        [hoverValue, value]
      );

      const resolvedFilledColor = useMemo(() => {
        if (filledColor) return getColorFromMaybeString(theme, filledColor);
        const hasIntent = theme.main !== theme.originalMain;
        return hasIntent ? theme.main : getReadableColor(theme, undefined, undefined, true);
      }, [filledColor, theme]);

      const resolvedEmptyColor = useMemo(() => {
        if (emptyColor) return getColorFromMaybeString(theme, emptyColor);
        return rgba(changeLightness(theme.main, 0.15), 0.4);
      }, [emptyColor, theme]);

      const handleMouseMove = useCallback(
        (index: number, event: React.MouseEvent<HTMLSpanElement>) => {
          if (!isInteractive) return;
          if (allowHalf) {
            const rect = event.currentTarget.getBoundingClientRect();
            const isLeftHalf = event.clientX - rect.left < rect.width / 2;
            setHoverValue(isLeftHalf ? index + 0.5 : index + 1);
          } else {
            setHoverValue(index + 1);
          }
        },
        [isInteractive, allowHalf]
      );

      const handleMouseLeave = useCallback(() => {
        if (!isInteractive) return;
        setHoverValue(null);
      }, [isInteractive]);

      const handleClick = useCallback(
        (index: number, event: React.MouseEvent<HTMLSpanElement>) => {
          if (!isInteractive || !onChange) return;
          let clickedValue: number;
          if (allowHalf) {
            const rect = event.currentTarget.getBoundingClientRect();
            const isLeftHalf = event.clientX - rect.left < rect.width / 2;
            clickedValue = isLeftHalf ? index + 0.5 : index + 1;
          } else {
            clickedValue = index + 1;
          }
          if (allowClear && clickedValue === value) {
            onChange(0);
          } else {
            onChange(clickedValue);
          }
        },
        [isInteractive, onChange, allowHalf, allowClear, value]
      );

      const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
          if (!isInteractive || !onChange) return;
          const step = allowHalf ? 0.5 : 1;
          switch (event.key) {
            case 'ArrowRight':
            case 'ArrowUp':
              event.preventDefault();
              onChange(Math.min(value + step, max));
              break;
            case 'ArrowLeft':
            case 'ArrowDown':
              event.preventDefault();
              onChange(Math.max(value - step, 0));
              break;
            case 'Home':
              event.preventDefault();
              onChange(0);
              break;
            case 'End':
              event.preventDefault();
              onChange(max);
              break;
          }
        },
        [isInteractive, onChange, value, max, allowHalf]
      );

      const getIconForIndex = useCallback(
        (index: number) => {
          const starValue = index + 1;
          if (displayValue >= starValue) {
            return { icon: filledIcon, color: resolvedFilledColor };
          }
          if (allowHalf && displayValue >= starValue - 0.5) {
            return { icon: halfIcon, color: resolvedFilledColor };
          }
          return { icon: emptyIcon, color: resolvedEmptyColor };
        },
        [
          displayValue,
          filledIcon,
          emptyIcon,
          halfIcon,
          resolvedFilledColor,
          resolvedEmptyColor,
          allowHalf,
        ]
      );

      const stars = useMemo(() => Array.from({ length: max }, (_, i) => i), [max]);

      const { Component, props: componentProps } = useComponentTooltip(
        {
          ...rest,
          theme,
          size,
          tooltip,
          disabled,
          readOnly,
          isInteractive,
          className: `${className || ''} reqore-rating`,
        } as any,
        StyledRating as any,
        ref
      );

      return (
        <ReqoreControlGroup vertical>
          {label && <ReqoreP size={size} {...labelProps}>{label}</ReqoreP>}
          <Component
            {...componentProps}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleKeyDown}
            tabIndex={isInteractive ? 0 : undefined}
            role='slider'
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-label={label || rest['aria-label'] || 'Rating'}
          >
            {stars.map((index) => {
              const { icon, color } = getIconForIndex(index);
              return (
                <StyledRatingItem
                  key={index}
                  className='reqore-rating-item'
                  onMouseMove={(e) => handleMouseMove(index, e)}
                  onClick={(e) => handleClick(index, e)}
                  isInteractive={isInteractive}
                  size={size}
                >
                  <ReqoreIcon {...iconProps} icon={icon} size={size} color={color as TReqoreEffectColor} />
                </StyledRatingItem>
              );
            })}
            {showRatingValue && (
              <ReqoreSpan
                intent='muted'
                size={getOneLessSize(size)}
              >{`${displayValue} / ${max}`}</ReqoreSpan>
            )}
          </Component>
        </ReqoreControlGroup>
      );
    }
  )
);

export default ReqoreRating;
