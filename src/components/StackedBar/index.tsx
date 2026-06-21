import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { getColorFromMaybeString, getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement, RaisedElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
  TReqoreTooltipProp,
} from '../../types/global';
import { StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

/**
 * Height scale tuned for a stacked bar — comfortably taller than the thin
 * `PROGRESS_HEIGHT` scale so the bar reads as a substantial element and
 * inline value labels are never clipped. A bar with `showValues` clamps to
 * at least {@link MIN_LABEL_HEIGHT}px.
 */
const STACKED_BAR_HEIGHT_FROM_SIZE: Record<TSizes, number> = {
  micro: 10,
  tiny: 14,
  small: 18,
  normal: 24,
  big: 32,
  huge: 40,
  massive: 52,
};

/** Min height when only the value is shown. */
const MIN_VALUE_HEIGHT = 18;
/** Min height when the label is stacked under the value (two lines). */
const MIN_VALUE_AND_LABEL_HEIGHT = 34;

export interface IReqoreStackedBarItem {
  /** Magnitude of this segment. Segments with `value <= 0` are skipped. */
  value: number;
  /**
   * Segment colour. Accepts the same flexible forms as the rest of Reqore:
   * an intent name (`'success'`), a hex colour (`'#57801a'`), or a shaded
   * form (`'danger:lighten:2'`). When omitted, falls back to `intent`, then
   * to a readable default.
   */
  color?: TReqoreEffectColor;
  /** Shorthand intent — used as the colour when `color` is not provided. */
  intent?: TReqoreIntent;
  /** Human label for the segment, used in the default tooltip. */
  label?: string;
  /**
   * Tooltip shown on hover. Defaults to `"<label>: <value>"` (or just the
   * value when there is no label).
   */
  tooltip?: TReqoreTooltipProp;
  /** Click handler. When set, the segment becomes interactive (pointer cursor + button role). */
  onClick?: () => void;
  /** Stable key for the segment. Falls back to the index when omitted. */
  id?: string;
}

export interface IReqoreStackedBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFluid,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Ordered segments rendered left-to-right as one continuous bar. */
  items: IReqoreStackedBarItem[];
  /**
   * Total to normalise segment widths against. Defaults to the sum of all
   * item values. When larger than the sum, the remainder renders as empty
   * track — useful for "X of Y" style bars.
   */
  total?: number;
  /** Rounded (pill) ends. Defaults to `true`. */
  rounded?: boolean;
  /** Transparent (rather than tinted) empty track. Defaults to `false`. */
  transparent?: boolean;
  /** Subtle 3D "raised" treatment (inset top highlight + bottom shadow). */
  raised?: boolean;
  /** Explicit track height in px. Overrides the size-derived height. */
  height?: number;
  /**
   * Minimum width, in percent, for any non-zero segment so a tiny count
   * stays visible and clickable. Defaults to `2`.
   */
  minSegmentPercent?: number;
  /** Render each segment's value centred inside it when it fits. Defaults to `false`. */
  showValues?: boolean;
  /**
   * Render each segment's `label` stacked beneath the value, in a smaller
   * uppercase, letter-spaced style. Implies a taller bar so both lines fit.
   * Defaults to `false`.
   */
  showLabels?: boolean;
  /**
   * Only print a segment's value/label when it occupies at least this percent
   * of the bar, so narrow segments don't show a cramped/clipped number.
   * Defaults to `8`.
   */
  valueLabelMinPercent?: number;
  /** Content shown when there is nothing to plot (total resolves to 0). Defaults to the empty track. */
  emptyContent?: React.ReactNode;
}

interface IStyledTrackProps {
  theme: IReqoreTheme;
  $height: number;
  $radius: number;
  $rounded?: boolean;
  $transparent?: boolean;
  $flat?: boolean;
  $fluid?: boolean;
  $raised?: boolean;
  $disabled?: boolean;
}

// Extends `StyledEffect` so the standard `effect` prop (gradients, glow,
// filters, …) works exactly as it does on every other Reqore surface.
const StyledStackedBarTrack = styled(StyledEffect)<IStyledTrackProps>`
  position: relative;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  width: ${({ $fluid }) => ($fluid ? '100%' : '200px')};
  height: ${({ $height }) => $height}px;
  border-radius: ${({ $radius, $rounded }) => ($rounded === false ? 0 : `${$radius}px`)};
  background-color: ${({ theme, $transparent }) =>
    $transparent
      ? 'transparent'
      : rgba(getReadableColor(theme, undefined, undefined, true), 0.1)};
  border: ${({ $flat, theme }) =>
    $flat === false
      ? `1px solid ${rgba(getReadableColor(theme, undefined, undefined, true), 0.4)}`
      : 'none'};

  ${({ $raised }) => $raised && RaisedElement}
  ${({ $disabled }) => $disabled && DisabledElement}
`;

interface IStyledSegmentProps {
  $color: string;
  $percent: number;
  $interactive: boolean;
}

const StyledStackedBarSegment = styled.div<IStyledSegmentProps>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  min-width: 0;
  background-color: ${({ $color }) => $color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 0 5px;
  overflow: hidden;
  color: #ffffff;
  line-height: 1;
  text-shadow: 0 1px 1px ${rgba('#000000', 0.35)};
  white-space: nowrap;
  transition: width 0.3s ease-out, filter 0.15s ease-out;
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};

  &:hover {
    ${({ $interactive }) =>
      $interactive &&
      css`
        filter: brightness(1.1);
      `}
  }
`;

const StyledSegmentValue = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
`;

const StyledSegmentLabel = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 9px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  opacity: 0.82;
`;

interface IResolvedSegment {
  key: string;
  color: string;
  percent: number;
  value: number;
  label?: string;
  tooltip?: TReqoreTooltipProp;
  onClick?: () => void;
  showValue: boolean;
  showLabel: boolean;
}

/**
 * A horizontal bar split into proportional, individually-coloured segments —
 * the multi-value counterpart to `ReqoreProgress`. Each segment can carry its
 * own intent/colour, label, tooltip, and click handler, so a single bar can
 * summarise a breakdown (status counts, a budget split, …) and let the user
 * drill into any slice. Segments with a non-positive value are dropped.
 *
 * Supports the standard Reqore surface props: `fluid`, `flat` (border),
 * `rounded`, `raised`, `transparent`, `intent`, `customTheme`, `effect`,
 * `size`, `disabled`, and a bar-level `tooltip`.
 */
const ReqoreStackedBar = memo(
  forwardRef<HTMLDivElement, IReqoreStackedBarProps>(
    (
      {
        items,
        total,
        size = 'normal',
        intent,
        customTheme,
        inheritCustomTheme,
        effect,
        fluid = false,
        rounded = true,
        transparent = false,
        flat = true,
        raised = false,
        height,
        disabled,
        minSegmentPercent = 2,
        showValues = false,
        showLabels = false,
        valueLabelMinPercent = 8,
        emptyContent,
        className,
        tooltip,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      const resolvedHeight = useMemo(() => {
        const base = height ?? STACKED_BAR_HEIGHT_FROM_SIZE[size];
        if (showLabels) return Math.max(base, MIN_VALUE_AND_LABEL_HEIGHT);
        if (showValues) return Math.max(base, MIN_VALUE_HEIGHT);
        return base;
      }, [height, size, showValues, showLabels]);

      const trackRadius = rounded === false ? 0 : RADIUS_FROM_SIZE[size];

      const positiveItems = useMemo(() => items.filter((item) => item.value > 0), [items]);

      const sum = useMemo(
        () => positiveItems.reduce((acc, item) => acc + item.value, 0),
        [positiveItems]
      );

      const resolvedTotal = useMemo(() => {
        const candidate = total ?? sum;
        return candidate > 0 ? candidate : 0;
      }, [total, sum]);

      const segments = useMemo<IResolvedSegment[]>(() => {
        if (resolvedTotal <= 0) return [];
        return positiveItems.map((item, index) => {
          const rawPercent = (item.value / resolvedTotal) * 100;
          const percent = rawPercent > 0 ? Math.max(rawPercent, minSegmentPercent) : 0;
          const color =
            getColorFromMaybeString(theme, item.color || (item.intent as TReqoreEffectColor)) ||
            getReadableColor(theme, undefined, undefined, true);
          const tooltipContent: TReqoreTooltipProp | undefined =
            item.tooltip ??
            (item.label !== undefined ? `${item.label}: ${item.value}` : `${item.value}`);
          const fits = rawPercent >= valueLabelMinPercent;
          return {
            key: item.id ?? `${item.label ?? 'segment'}-${index}`,
            color,
            percent,
            value: item.value,
            label: item.label,
            tooltip: tooltipContent,
            onClick: item.onClick,
            showValue: showValues && fits,
            showLabel: showLabels && item.label !== undefined && fits,
          };
        });
      }, [
        positiveItems,
        resolvedTotal,
        minSegmentPercent,
        theme,
        showValues,
        showLabels,
        valueLabelMinPercent,
      ]);

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledStackedBarTrack}
          tooltip={tooltip}
          ref={ref}
          as='div'
          theme={theme}
          effect={effect}
          $height={resolvedHeight}
          $radius={trackRadius}
          $rounded={rounded}
          $transparent={transparent}
          $flat={flat}
          $fluid={fluid}
          $raised={raised}
          $disabled={disabled}
          className={`${className || ''} reqore-stacked-bar`}
          role='img'
        >
          {segments.length === 0
            ? emptyContent ?? null
            : segments.map((segment) => (
                <ReqoreTooltipComponent
                  key={segment.key}
                  Component={StyledStackedBarSegment}
                  tooltip={segment.tooltip}
                  $color={segment.color}
                  $percent={segment.percent}
                  $interactive={!!segment.onClick}
                  onClick={segment.onClick}
                  className='reqore-stacked-bar-segment'
                  role={segment.onClick ? 'button' : undefined}
                  tabIndex={segment.onClick ? 0 : undefined}
                  onKeyDown={
                    segment.onClick
                      ? (event: React.KeyboardEvent) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            segment.onClick?.();
                          }
                        }
                      : undefined
                  }
                >
                  {segment.showValue ? <StyledSegmentValue>{segment.value}</StyledSegmentValue> : null}
                  {segment.showLabel ? (
                    <StyledSegmentLabel>{segment.label}</StyledSegmentLabel>
                  ) : null}
                </ReqoreTooltipComponent>
              ))}
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreStackedBar;
