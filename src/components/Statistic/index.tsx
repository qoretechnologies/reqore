import { rgba } from 'polished';
import { forwardRef, memo, useMemo, useRef } from 'react';
import { css } from 'styled-components';
import styled from '../../helpers/styled';
import { HEADER_SIZE_TO_NUMBER, resolveRadius, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import {
  alignToFlexAlign,
  getOneHigherSize,
  getOneLessSize,
  resolvePadding,
  TReqorePadded,
} from '../../helpers/utils';
import { IReqoreCountUpOptions, useCountUp } from '../../hooks/useCountUp';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement, InactiveIconScale, RaisedElement, ScaleIconOnHover } from '../../styles';
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
import { IReqoreEffect, patchPrimaryGradient, StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreHeading, StyledHeader } from '../Header';
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

/**
 * The element a statistic's value is written in (`valueAs`): a heading level, or a plain
 * element for a figure that is content rather than the title of a section.
 */
export type TReqoreStatisticValueElement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'div'
  | 'span';

/** How a statistic counts up to its value (`countUp`). */
export type IReqoreStatisticCountUp = IReqoreCountUpOptions;

const HEADING_ELEMENTS: TReqoreStatisticValueElement[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

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
  /**
   * The element the value is written in.
   *
   * Unset (the default), the prefix, the value and the suffix are each a heading (`h1` – `h4`,
   * picked by `size`), so every tile puts one to three headings into the page's outline — a
   * row of KPI tiles reads to a screen reader as a list of section titles.
   *
   * Set it and the whole value — prefix, number and suffix — is ONE element of that kind,
   * drawn exactly as before (the same size, from `size`, and the same weight): a heading level
   * of your choice for a figure that does title a section, or `'p'` / `'div'` / `'span'` for
   * a figure that is content.
   */
  valueAs?: TReqoreStatisticValueElement;
  /**
   * Count the value up once the tile is on screen.
   *
   * The count starts when `threshold` (default `0.35`) of the value is in view and plays once,
   * from `from` (default `0`) over `duration` ms (default `1000`), easing out; until it starts
   * the tile shows `from`. Each frame keeps the value's own format — its decimals, its thousands
   * separator and the text around the number (`'$1.2M'`, `'99.8%'`, `'1,234'`), or `format`
   * writes every frame. The last frame is the value exactly as given.
   *
   * Under `prefers-reduced-motion`, and for a value that is not one number (`'2–4'`, `'24/7'`,
   * `'N/A'`), the value shows at once. While it counts, the moving number is hidden from
   * assistive technology and the value itself is read instead.
   */
  countUp?: boolean | IReqoreStatisticCountUp;
  /** Effect applied to the label text */
  labelEffect?: IReqoreEffect;
  /** Effect applied to the card background (supports gradients) */
  effect?: IReqoreEffect;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Rounded border corners */
  rounded?: boolean;
  /**
   * Override the size used to derive the tile's border-radius. Defaults to `size`.
   * Lets you decouple corner roundness from the text/padding scale.
   */
  radiusSize?: TSizes;
  /** Transparent background */
  transparent?: boolean;
  /** Background opacity */
  opacity?: number;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border) and `rounded` so the surface
   * reads as a tactile card; the highlight is suppressed when `flat={false}`.
   */
  raised?: boolean;
  /**
   * Controls which axes receive the tile's outer padding (only applies when
   * the tile has a background — i.e. when `effect`/`rounded`/`flat`/
   * `transparent`/`opacity` is set or `raised` is true).
   * - `true` (default): padding on both axes
   * - `false`: no padding
   * - `'horizontal'`: only left/right padding
   * - `'vertical'`: only top/bottom padding
   */
  padded?: TReqorePadded;
  /**
   * Size of the tile's outer padding. Defaults to `size`. Use this to scale
   * the padding independently from the tile's text/icon scale.
   */
  paddingSize?: TSizes;
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
  $raised?: boolean;
  $padded: TReqorePadded;
  $paddingSize: TSizes;
  radiusSize?: TSizes;
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
  /* ---- Layout --------------------------------------------------------
     The Statistic is rendered as a real div (see the as=div on the JSX)
     rather than the default StyledEffect span. A span containing block
     children (the value row and the trend group are both divs) is the
     wrong content model and produced a box that did not establish a
     proper containment context, so overflow + min-width did not hold
     the inner text inside the tile. With a div root the wrapper can be
     a proper flex column container. */
  display: flex;
  flex-direction: column;
  align-items: ${({ $align }) =>
    $align === 'center'
      ? 'center'
      : $align === 'flex-end'
      ? 'flex-end'
      : 'flex-start'};
  justify-content: ${({ $align }) => $align};
  width: ${({ $fluid }) => ($fluid ? '100%' : undefined)};
  /* ---- Overflow safety ----------------------------------------------
     Statistic tiles are commonly laid out inside flex or grid parents
     (KPI strips, dashboards). Without bounding the tile intrinsic
     width to its column, the widest unbreakable token in the value,
     trend or label can push past the column edge and bleed into the
     neighbouring tile. min-width 0 lets flex-shrink do its job,
     max-width 100% caps the box at the column it lives in, and
     overflow hidden clips any child that refuses to honour the cap.
     With a div root these all behave as documented. */
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  & .reqore-statistic-label,
  & .reqore-statistic-value-row,
  & .reqore-statistic-trend {
    max-width: 100%;
    min-width: 0;
  }
  /* The trend slot is a ReqoreControlGroup which defaults to
     "flex: 0 0 auto" (ControlGroup/index.tsx). That kills flex-shrink
     so the group keeps its intrinsic content width and would push the
     tile past its grid track when the trend copy is long. Forcing the
     group to shrink lets the text-leaf wrap rules below take effect. */
  & .reqore-statistic-trend {
    flex: 0 1 auto;
    flex-wrap: wrap;
  }
  /* Wrap rather than ellipsis — KPI tiles benefit from the operator
     seeing the whole sub-line rather than a clipped fragment.
     overflow-wrap anywhere covers identifiers, URLs and long codes
     with no natural break point. */
  & .reqore-statistic-label,
  & .reqore-statistic-value,
  & .reqore-statistic-prefix,
  & .reqore-statistic-suffix {
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    max-width: 100%;
  }
  & .reqore-statistic-trend > span {
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
    min-width: 0;
    max-width: 100%;
  }

  ${({
    $hasBackground,
    theme,
    size,
    rounded,
    radiusSize,
    flat,
    intent,
    opacity = 1,
    $padded,
    $paddingSize,
  }) =>
    $hasBackground &&
    css`
      background-color: ${rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)};
      border-radius: ${rounded ? resolveRadius(size, radiusSize) : 0}px;
      border: ${flat
        ? undefined
        : `1px solid ${changeLightness(
            intent ? theme.intents[intent] : getMainBackgroundColor(theme),
            0.08
          )}`};
      color: ${getReadableColor(theme, undefined, undefined, true)};
      padding: ${resolvePadding({
        padded: $padded,
        paddingSize: $paddingSize,
        verticalMultiplier: 3,
        horizontalMultiplier: 5,
      })};
    `}

  ${({ $raised, $hasBackground, flat }) =>
    $raised && $hasBackground && flat !== false && RaisedElement}

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

const StyledStatisticValueRow = styled.div<{ $element?: TReqoreStatisticValueElement }>`
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: nowrap;

  /* valueAs: the row is the one element the value is written in. A heading or a paragraph
     brings the browser's margins, which the value never had; and the weight the headings
     used to bring is the row's to give where it is not a heading. */
  ${({ $element }) =>
    $element &&
    css`
      margin: 0;
      padding: 0;
      font-size: inherit;
      ${!HEADING_ELEMENTS.includes($element) &&
      css`
        font-weight: bold;
      `}
    `}
`;

/** The value itself while it counts: there for screen readers, not on screen. */
const StyledStatisticValueFinal = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

const PREFIX_SUFFIX_EFFECT: IReqoreEffect = { opacity: 0.6 };

interface IStatisticValuePartProps {
  as?: TReqoreStatisticValueElement;
  size: TSizes;
  theme: IReqoreTheme;
  className: string;
  effect?: IReqoreEffect;
  children: React.ReactNode;
}

/**
 * The prefix, the value or the suffix. Without `valueAs` each is its own heading, as it always
 * was. With it the row is the element and each part is a span inside it, styled exactly as the
 * heading was (the same size and the same component), so nothing moves.
 */
const StatisticValuePart = memo(
  ({ as, size, theme, className, effect, children }: IStatisticValuePartProps) =>
    as ? (
      <StyledHeader
        as='span'
        _size={HEADER_SIZE_TO_NUMBER[size]}
        theme={theme}
        effect={effect}
        className={className}
      >
        {children}
      </StyledHeader>
    ) : (
      <ReqoreHeading size={size} className={className} effect={effect}>
        {children}
      </ReqoreHeading>
    )
);

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
        valueAs,
        countUp,
        labelEffect,
        effect,
        align = 'center',
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        intent,
        fluid,
        flat,
        disabled,
        tooltip,
        rounded,
        radiusSize,
        transparent,
        opacity,
        raised,
        padded = true,
        paddingSize,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      // What a ReqoreHeading resolves for itself: the value's text never takes the intent.
      const valueTheme = useReqoreTheme('main');
      const valueRowRef = useRef<HTMLDivElement>(null);
      const { display, final, counting } = useCountUp(value, countUp, valueRowRef);

      const secondarySize = useMemo(() => getOneLessSize(size), [size]);
      const valueSize = useMemo(() => getOneHigherSize(size), [size]);
      const flexAlign = useMemo(() => alignToFlexAlign(align), [align]);

      const interactive = useMemo(
        () => !!(rest.onClick || rest.onDoubleClick || rest.onContextMenu),
        [rest.onClick, rest.onDoubleClick, rest.onContextMenu]
      );

      const hasBackground = useMemo(
        () =>
          !!(effect || rounded || flat !== undefined || transparent || opacity !== undefined || raised),
        [effect, rounded, flat, transparent, opacity, raised]
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
          newEffect.gradient = patchPrimaryGradient(newEffect.gradient, {
            borderColor: theme.intents[intent] as TReqoreEffectColor,
          });
        }

        return newEffect;
      }, [effect, intent, theme]);

      return (
        <ReqoreTooltipComponent
          {...rest}
          // Render as a real block-level `<div>`. The base styled
          // element (`StyledEffect`) is a `<span>`, which is wrong
          // here — Statistic's children are block-level (the value
          // row is a `<div>`, the trend group is a `<div>`), and an
          // inline-flex `<span>` containing block children breaks
          // HTML's content model. Browsers tolerate it but the
          // resulting box doesn't establish containment cleanly,
          // which is why `overflow: hidden` + `min-width: 0` didn't
          // hold their text inside the tile.
          as='div'
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
          radiusSize={radiusSize}
          flat={flat}
          intent={intent}
          opacity={transparent ? 0 : opacity}
          $raised={raised}
          $padded={padded}
          $paddingSize={paddingSize ?? size}
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
            <StyledStatisticValueRow
              ref={valueRowRef}
              as={valueAs}
              $element={valueAs}
              className='reqore-statistic-value-row'
            >
              {prefix && (
                <StatisticValuePart
                  as={valueAs}
                  size={valueSize}
                  theme={valueTheme}
                  className='reqore-statistic-prefix'
                  effect={PREFIX_SUFFIX_EFFECT}
                >
                  {prefix}
                </StatisticValuePart>
              )}
              <StatisticValuePart
                as={valueAs}
                size={valueSize}
                theme={valueTheme}
                className='reqore-statistic-value'
                effect={valueEffect}
              >
                {counting ? (
                  <>
                    <span aria-hidden='true' className='reqore-statistic-value-count'>
                      {display}
                    </span>
                    <StyledStatisticValueFinal className='reqore-statistic-value-final'>
                      {final}
                    </StyledStatisticValueFinal>
                  </>
                ) : (
                  display
                )}
              </StatisticValuePart>
              {suffix && (
                <StatisticValuePart
                  as={valueAs}
                  size={valueSize}
                  theme={valueTheme}
                  className='reqore-statistic-suffix'
                  effect={PREFIX_SUFFIX_EFFECT}
                >
                  {suffix}
                </StatisticValuePart>
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
