import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { alignToFlexAlign, getOneHigherSize, getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement, InactiveIconScale, ScaleIconOnHover } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export type TReqoreStatisticTrendDirection = 'up' | 'down' | 'neutral';

export interface IReqoreStatisticTrend {
  /** Direction of the trend */
  direction: TReqoreStatisticTrendDirection;
  /** Optional text to display next to the trend arrow (e.g., "+12%") */
  value?: string | number;
  /** Override the automatic intent color for the trend */
  intent?: TReqoreIntent;
  /** Override the default arrow icon */
  icon?: IReqoreIconName;
}

export interface IReqoreStatisticProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreFluid,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** The primary value to display */
  value: string | number;
  /** Optional label displayed above the value */
  label?: string;
  /** Optional icon */
  icon?: IReqoreIconName;
  /** Optional color for the icon */
  iconColor?: TReqoreEffectColor;
  /** Additional icon props */
  iconProps?: Omit<IReqoreIconProps, 'icon' | 'size' | 'color'>;
  /** Text prepended to the value (e.g., "$") */
  prefix?: string;
  /** Text appended to the value (e.g., "%") */
  suffix?: string;
  /** Trend indicator configuration */
  trend?: IReqoreStatisticTrend;
  /** Effect applied to the value text */
  valueEffect?: IReqoreEffect;
  /** Effect applied to the label text */
  labelEffect?: IReqoreEffect;
  /** Effect applied to the card background (supports gradients) */
  effect?: IReqoreEffect;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Rounded border corners */
  rounded?: boolean;
  /** Transparent background */
  transparent?: boolean;
  /** Background opacity */
  opacity?: number;
}

interface IStyledStatisticWrapper {
  theme: IReqoreTheme;
  size: TSizes;
  $fluid?: boolean;
  disabled?: boolean;
  $hasBackground?: boolean;
  $interactive?: boolean;
  $align?: 'flex-start' | 'center' | 'flex-end';
  rounded?: boolean;
  flat?: boolean;
  intent?: string;
  opacity?: number;
}

const TREND_ICONS: Record<TReqoreStatisticTrendDirection, IReqoreIconName> = {
  up: 'ArrowUpSLine',
  down: 'ArrowDownSLine',
  neutral: 'SubtractLine',
};

const TREND_DEFAULT_INTENTS: Record<TReqoreStatisticTrendDirection, TReqoreIntent> = {
  up: 'success',
  down: 'danger',
  neutral: 'muted',
};

const StyledStatisticWrapper = styled(StyledEffect)<IStyledStatisticWrapper>`
  display: inline-flex;
  justify-content: ${({ $align }) => $align};
  width: ${({ $fluid }) => ($fluid ? '100%' : undefined)};

  ${({ $hasBackground, theme, size, rounded, flat, intent, opacity = 1 }) =>
    $hasBackground &&
    css`
      background-color: ${rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)};
      border-radius: ${rounded ? RADIUS_FROM_SIZE[size] : 0}px;
      border: ${flat
        ? undefined
        : `1px solid ${changeLightness(
            intent ? theme.intents[intent] : getMainBackgroundColor(theme),
            0.08
          )}`};
      color: ${getReadableColor(theme, undefined, undefined, true)};
      padding: ${PADDING_FROM_SIZE[size] * 3}px ${PADDING_FROM_SIZE[size] * 5}px;
    `}

  ${({ $interactive, disabled }) =>
    $interactive && !disabled
      ? css`
          ${InactiveIconScale};
          ${ScaleIconOnHover};
          cursor: pointer;
          transition: all 0.2s ease-out;

          &:active {
            transform: scale(0.98);
          }
        `
      : undefined}

  ${({ disabled }) =>
    disabled &&
    css`
      ${DisabledElement};
    `}
`;

const StyledStatisticValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: nowrap;
`;

const ReqoreStatistic = memo(
  forwardRef<HTMLDivElement, IReqoreStatisticProps>(
    (
      {
        value,
        label,
        icon,
        iconColor,
        iconProps,
        prefix,
        suffix,
        trend,
        valueEffect,
        labelEffect,
        effect,
        align = 'center',
        size = 'normal',
        customTheme,
        intent,
        fluid,
        flat,
        disabled,
        tooltip,
        rounded,
        transparent,
        opacity,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);

      const secondarySize = useMemo(() => getOneLessSize(size), [size]);
      const flexAlign = useMemo(() => alignToFlexAlign(align), [align]);

      const interactive = useMemo(
        () => !!(rest.onClick || rest.onDoubleClick || rest.onContextMenu),
        [rest.onClick, rest.onDoubleClick, rest.onContextMenu]
      );

      const hasBackground = useMemo(
        () => !!(effect || rounded || flat !== undefined || transparent || opacity !== undefined),
        [effect, rounded, flat, transparent, opacity]
      );

      const trendIntent = useMemo(
        () => (trend ? trend.intent || TREND_DEFAULT_INTENTS[trend.direction] : undefined),
        [trend]
      );

      const trendIcon = useMemo(
        () => (trend ? trend.icon || TREND_ICONS[trend.direction] : undefined),
        [trend]
      );

      const transformedEffect: IReqoreEffect = useMemo(() => {
        if (!effect) return undefined;

        const newEffect: IReqoreEffect = { ...effect };

        if (newEffect.gradient && intent) {
          newEffect.gradient.borderColor = theme.intents[intent];
        }

        return newEffect;
      }, [effect, intent, theme]);

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledStatisticWrapper}
          tooltip={tooltip}
          ref={ref}
          theme={theme}
          size={size}
          $fluid={fluid}
          disabled={disabled}
          $hasBackground={hasBackground}
          $interactive={interactive}
          $align={flexAlign}
          rounded={rounded}
          flat={flat}
          intent={intent}
          opacity={transparent ? 0 : opacity}
          effect={transformedEffect}
          className={`${className || ''} reqore-statistic`}
        >
          <ReqoreControlGroup
            vertical
            horizontalAlign={flexAlign}
            className='reqore-statistic-content'
          >
            {icon && (
              <ReqoreIcon
                {...iconProps}
                icon={icon}
                size={size}
                color={iconColor}
                intent={iconColor ? undefined : intent}
                className='reqore-statistic-icon'
              />
            )}
            {label && (
              <ReqoreSpan
                size={secondarySize}
                className='reqore-statistic-label'
                effect={{ opacity: 0.7, uppercase: true, spaced: 1, ...labelEffect }}
              >
                {label}
              </ReqoreSpan>
            )}
            <StyledStatisticValueRow className='reqore-statistic-value-row'>
              {prefix && (
                <ReqoreHeading
                  size={getOneHigherSize(size)}
                  className='reqore-statistic-prefix'
                  effect={{ opacity: 0.6 }}
                >
                  {prefix}
                </ReqoreHeading>
              )}
              <ReqoreHeading
                size={getOneHigherSize(size)}
                className='reqore-statistic-value'
                effect={valueEffect}
              >
                {value}
              </ReqoreHeading>
              {suffix && (
                <ReqoreHeading
                  size={getOneHigherSize(size)}
                  className='reqore-statistic-suffix'
                  effect={{ opacity: 0.6 }}
                >
                  {suffix}
                </ReqoreHeading>
              )}
            </StyledStatisticValueRow>
            {trend && (
              <ReqoreControlGroup
                gapSize='micro'
                verticalAlign='center'
                className='reqore-statistic-trend'
              >
                <ReqoreIcon icon={trendIcon!} size={secondarySize} intent={trendIntent} />
                {trend.value !== undefined && (
                  <ReqoreSpan size={secondarySize} intent={trendIntent}>
                    {trend.value}
                  </ReqoreSpan>
                )}
              </ReqoreControlGroup>
            )}
          </ReqoreControlGroup>
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreStatistic;
