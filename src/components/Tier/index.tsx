import { isNumber } from 'lodash';
import { mix, rgba } from 'polished';
import { memo, useMemo } from 'react';
import styled from '../../helpers/styled';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeDarkness,
  getMainBackgroundColor,
  getOpaqueColor,
  getReadableAccentColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { TReqoreDataAttributes } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, TReqoreHexColor } from '../Effect';
import { ReqoreH1, ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { IReqorePanelProps, ReqorePanel } from '../Panel';
import { IReqoreParagraphProps, ReqoreP } from '../Paragraph';
import { ReqoreVerticalSpacer } from '../Spacer';
import { IReqoreTagProps } from '../Tag';

// One object for every render: the paragraph is memoized, and a fresh style would defeat it.
const TIER_DESCRIPTION_STYLE: React.CSSProperties = { textAlign: 'center', padding: '0 20px' };

export interface IReqoreTierFeature extends Omit<IReqoreParagraphProps, 'content'> {
  icon?: IReqoreIconName;
  iconProps?: IReqoreIconProps;
  rightIcon?: IReqoreIconName;
  rightIconProps?: IReqoreIconProps;
  content: string | React.ReactNode;
}

/**
 * How a tier is drawn.
 *
 * - `'classic'` — the centred card: upper-case name, the price as a heading, the period under
 *   it, the button under the description and the feature list last, on a gradient surface (the
 *   highlighted tier's animates, and it is scaled up). The default, and the look every tier had
 *   before this prop existed.
 * - `'modern'` — a left-aligned card on a flat surface with a hairline border: the name (a
 *   heading) with its badge beside it, a large price with the period on its baseline, the
 *   description, a feature list with the icons on the first line of each feature, and the
 *   button pinned to the bottom edge, so in a row of stretched tiers every button sits on one
 *   line. A highlighted tier is marked by its badge, a border, a faint wash and a soft shadow
 *   in its intent's colour, and a filled button; it is not scaled.
 */
export type TReqoreTierAppearance = 'classic' | 'modern';

export interface IReqoreTierProps extends Omit<IReqorePanelProps, 'description'> {
  name: string;
  nameDetail?: string;
  price: string | number;
  currency: string;
  currencyPosition?: 'before' | 'after';
  /** The line under the price — the billing period ("/ month"), "per seat", "billed yearly". */
  priceDetail?: string;
  /**
   * Effect for `priceDetail`, spread over its defaults (`uppercase`). `{ uppercase: false }`
   * keeps the text as written; a `color` or `opacity` makes the muted line readable.
   */
  priceDetailEffect?: IReqoreEffect;
  /**
   * Props for the `priceDetail` paragraph (a `ReqoreP`), spread over its defaults
   * (`intent: 'muted'`, `size: 'small'`): another `intent` or `size`, `className`, `style`,
   * `aria-*`, `data-*`. Its `effect` is merged with `priceDetailEffect`, which wins.
   */
  priceDetailProps?: Partial<IReqoreParagraphProps> & TReqoreDataAttributes;
  salePrice?: string | number;
  /**
   * Text under the price. Text, inline content or blocks (a `ReqoreP`, a list, a
   * `ReqoreControlGroup`): it is drawn in a block container with paragraph typography, not in a
   * paragraph, which could not hold a block.
   */
  description?: string | React.ReactNode;
  actionButtonProps?: IReqoreButtonProps;
  featureList?: IReqoreTierFeature[];
  highlight?: boolean;
  active?: boolean;
  /**
   * Label rendered on the action button when the tier is `active`.
   * Defaults to `'Active'`. Overridden by `actionButtonProps.label`.
   */
  activeActionLabel?: string;
  /**
   * Label rendered on the action button when the tier is not `active`.
   * Defaults to `'Get Started'`. Overridden by `actionButtonProps.label`.
   */
  actionLabel?: string;
  /**
   * How the tier is drawn: `'classic'` (default) or `'modern'` — see `TReqoreTierAppearance`.
   *
   * In the modern appearance the panel knobs that would otherwise go unused speak for the
   * tier's own parts: `labelSize` is the heading level of the name (default 3, an `<h3>`; the
   * price is a paragraph, never a heading), `labelEffect` styles the name and
   * `descriptionEffect` the description. `priceDetail` sits on the price's baseline, as
   * written and in a muted colour that keeps a 4.5:1 contrast; `priceDetailEffect` and
   * `priceDetailProps` still apply over that.
   */
  appearance?: TReqoreTierAppearance;
}

/* ------------------------------------------------------------------------------------------------
 * Classic
 * ---------------------------------------------------------------------------------------------- */

const ReqoreClassicTier = memo(
  ({
    currency,
    currencyPosition = 'before',
    priceDetail,
    priceDetailEffect,
    priceDetailProps,
    description,
    price,
    actionButtonProps,
    name,
    nameDetail,
    badge,
    featureList,
    highlight,
    salePrice,
    active,
    activeActionLabel = 'Active',
    actionLabel = 'Get Started',
    ...rest
  }: Omit<IReqoreTierProps, 'appearance'>) => {
    const style = useMemo(() => {
      return {
        transform: `scale(${highlight ? 1.05 : 1})`,
        ...rest.style,
      };
    }, [rest.style]);

    const contentEffect = useMemo(
      (): IReqorePanelProps['contentEffect'] => ({
        gradient: {
          type: 'linear',
          direction: 'to right bottom',
          animate: highlight ? 'always' : 'never',
          animationSpeed: 5,
          colors: {
            0: highlight ? 'main:darken:3' : 'transparent',
            150: highlight ? 'info:darken:7:0.8' : 'main:darken:5',
          },
        },
        ...rest.contentEffect,
      }),
      [highlight, rest.contentEffect]
    );

    return (
      <ReqorePanel
        intent={highlight ? 'info' : undefined}
        {...rest}
        className={`${rest.className || ''} reqore-tier`}
        style={style}
        contentEffect={contentEffect}
      >
        <ReqoreVerticalSpacer height={20} />
        {badge && (
          <>
            {/* On a line of its own, like a callout's or an entity row's badge: nothing to
                space it from. Sized with the tier's panel. */}
            <ButtonBadge size={rest.size} content={badge} margin='none' />
            <ReqoreVerticalSpacer height={10} />
          </>
        )}

        <ReqoreControlGroup horizontalAlign='center' vertical gapSize='big'>
          <ReqoreControlGroup horizontalAlign='center' vertical gapSize='tiny'>
            <ReqoreP effect={{ uppercase: true, weight: 'bold' }} size='big'>
              {name}
            </ReqoreP>
            {nameDetail && (
              <ReqoreP intent='muted' effect={{ uppercase: true }} size='small'>
                {nameDetail}
              </ReqoreP>
            )}
          </ReqoreControlGroup>
          <ReqoreControlGroup vertical horizontalAlign='center' gapSize='tiny'>
            {salePrice && (
              <ReqoreP
                effect={{
                  uppercase: true,
                  weight: 'thick',
                  textSize: '40px',
                  color: 'success:lighten:15:1',
                }}
              >
                {currency && currencyPosition === 'before' && isNumber(salePrice)
                  ? currency
                  : undefined}
                {salePrice}
                {currency && currencyPosition === 'after' && isNumber(salePrice)
                  ? currency
                  : undefined}
              </ReqoreP>
            )}
            <ReqoreH1
              effect={{
                weight: 'thick',
                textSize: salePrice ? '20px' : '40px',
                lineThrough: salePrice ? '1px solid line-through red' : undefined,
                opacity: salePrice ? 0.5 : 1,
              }}
            >
              {currency && currencyPosition === 'before' && isNumber(price) ? currency : undefined}
              {price}
              {currency && currencyPosition === 'after' && isNumber(price) ? currency : undefined}
            </ReqoreH1>
            {priceDetail && (
              <ReqoreP
                intent='muted'
                size='small'
                {...priceDetailProps}
                effect={{ uppercase: true, ...priceDetailProps?.effect, ...priceDetailEffect }}
                className={`${priceDetailProps?.className || ''} reqore-tier-price-detail`}
              >
                {priceDetail}
              </ReqoreP>
            )}
          </ReqoreControlGroup>
          {description && (
            <ReqoreP
              as='div'
              className='reqore-tier-description'
              style={TIER_DESCRIPTION_STYLE}
            >
              {description}
            </ReqoreP>
          )}
          <ReqoreControlGroup fluid horizontalAlign='center'>
            <ReqoreButton
              minimal
              textAlign='center'
              iconsAlign='center'
              intent={active ? 'success' : 'info'}
              labelEffect={{ uppercase: true, weight: 'thick', textSize: 'small' }}
              size='big'
              fluid
              pill
              label={active ? activeActionLabel : actionLabel}
              icon={active ? 'CheckLine' : undefined}
              {...actionButtonProps}
              readOnly={active}
            />
          </ReqoreControlGroup>
        </ReqoreControlGroup>
        <ReqoreVerticalSpacer height={20} />
        <ReqoreControlGroup vertical>
          {featureList &&
            featureList.map(
              ({ icon, content, iconProps, rightIcon, rightIconProps, ...contentProps }, index) => (
                <ReqoreControlGroup key={index} spaceBetween fluid>
                  <ReqoreIcon icon={icon || 'CheckLine'} intent='success' {...iconProps} />
                  <ReqoreP {...contentProps}>{content}</ReqoreP>
                  <ReqoreIcon icon={rightIcon} {...rightIconProps} />
                </ReqoreControlGroup>
              )
            )}
        </ReqoreControlGroup>
      </ReqorePanel>
    );
  }
);

/* ------------------------------------------------------------------------------------------------
 * Modern
 * ---------------------------------------------------------------------------------------------- */

/** The modern tier's inner padding, per size. */
export const TIER_PADDING_FROM_SIZE: Record<TSizes, number> = {
  micro: 10,
  tiny: 12,
  small: 18,
  normal: 24,
  big: 28,
  huge: 32,
  massive: 36,
};

/** Space between the modern tier's sections (header, price, description, features, button). */
export const TIER_GAP_FROM_SIZE: Record<TSizes, number> = {
  micro: 6,
  tiny: 8,
  small: 14,
  normal: 18,
  big: 22,
  huge: 26,
  massive: 30,
};

/** The modern tier's plan name, in px. */
export const TIER_NAME_TEXT_FROM_SIZE: Record<TSizes, number> = {
  micro: 11,
  tiny: 13,
  small: 16,
  normal: 18,
  big: 21,
  huge: 24,
  massive: 28,
};

/** The modern tier's price, in px. */
export const TIER_PRICE_TEXT_FROM_SIZE: Record<TSizes, number> = {
  micro: 20,
  tiny: 24,
  small: 32,
  normal: 40,
  big: 48,
  huge: 56,
  massive: 64,
};

/**
 * How much of the text colour a muted line (the period, the description, the name detail)
 * keeps; the rest is the surface. `getReadableAccentColor` then lifts it to 4.5:1 wherever a
 * theme would leave it below.
 */
export const TIER_MUTED_TEXT_MIX = 0.64;

/** A highlighted tier's wash: its accent mixed into the surface, at the top and the bottom. */
export const TIER_HIGHLIGHT_TINT = { top: 0.1, bottom: 0.025 };

/** Line height of the modern tier's body text, as a multiple of the font size. */
const TIER_LINE_HEIGHT = 1.5;

/**
 * The colours a modern tier draws its text with, worked out from the surface it sits on. The
 * muted colour keeps 4.5:1 against that surface (the wash's most tinted stop, for a highlighted
 * tier), and the feature icon 3:1, the minimum for a graphic.
 */
export interface IReqoreTierColors {
  /** The surface: the panel's own colour, or the top of a highlighted tier's wash. */
  surface: TReqoreHexColor;
  /** The bottom of a highlighted tier's wash (the surface otherwise). */
  surfaceBottom: TReqoreHexColor;
  /** The highlight's accent (undefined when the tier is not highlighted). */
  accent?: TReqoreHexColor;
  text: TReqoreHexColor;
  muted: TReqoreHexColor;
  /** The default feature icon. */
  check: TReqoreHexColor;
  /** A sale price. */
  sale: TReqoreHexColor;
  /** The hairline above the feature list. */
  divider: string;
}

export const getTierColors = (
  theme: IReqoreTheme,
  accentIntent?: TReqoreIntent
): IReqoreTierColors => {
  // What the panel paints (see StyledPanel), without its opacity.
  const panelSurface = getOpaqueColor(changeDarkness(getMainBackgroundColor(theme), 0.03));
  const accentColor = accentIntent ? theme.intents[accentIntent] : undefined;
  const accent = accentColor ? getOpaqueColor(accentColor) : undefined;
  const surface = (
    accent ? mix(TIER_HIGHLIGHT_TINT.top, accent, panelSurface) : panelSurface
  ) as TReqoreHexColor;
  const surfaceBottom = (
    accent ? mix(TIER_HIGHLIGHT_TINT.bottom, accent, panelSurface) : panelSurface
  ) as TReqoreHexColor;
  const text = getOpaqueColor(getReadableColor(theme, undefined, undefined, true));

  return {
    surface,
    surfaceBottom,
    accent,
    text,
    muted: getReadableAccentColor(
      mix(TIER_MUTED_TEXT_MIX, text, surface) as TReqoreHexColor,
      surface
    ),
    check: getReadableAccentColor(theme.intents.success, surface, 3),
    sale: getReadableAccentColor(theme.intents.success, surface),
    divider: rgba(text, 0.12),
  };
};

/**
 * The tier's badge(s) as soft status pills: a string becomes a tag in the tier's accent, a tag
 * of the caller's keeps its own colour (and its own `appearance`, if it names one). `align` is
 * dropped — the badge sits beside the name.
 */
const getModernBadges = (
  badge: TReqoreBadge | TReqoreBadge[],
  accentIntent?: TReqoreIntent
): IReqoreTagProps[] =>
  (Array.isArray(badge) ? badge : [badge])
    .filter((item) => item !== undefined && item !== null && item !== '')
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        return { label: item, appearance: 'soft', intent: accentIntent };
      }

      const tag = item as IReqoreTagProps;
      const hasColour = !!(tag.intent || tag.color || tag.effect?.color || tag.effect?.gradient);

      return {
        appearance: 'soft',
        ...(hasColour ? {} : { intent: accentIntent }),
        ...tag,
        align: undefined,
      } as IReqoreTagProps;
    });

/** Layout only: the sections, top to bottom, with the button pushed to the bottom edge. */
const StyledModernTierBody = styled.div<{ $padding: number; $gap: number }>`
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  gap: ${({ $gap }) => $gap}px;
  padding: ${({ $padding }) => $padding}px;
  min-width: 0;
  text-align: left;

  .reqore-tier-description {
    line-height: ${TIER_LINE_HEIGHT};
  }
`;

/** Layout only: the name with its badge(s) beside it, wrapping under it when there is no room. */
const StyledModernTierHeader = styled.div<{ $gap: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => Math.round($gap / 4)}px;

  .reqore-tier-name-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${({ $gap }) => Math.round($gap / 3)}px ${({ $gap }) => Math.round($gap / 2)}px;
    min-width: 0;
  }
`;

/**
 * Layout only: one paragraph — the price, a sale's original price and the period — on one
 * baseline, wrapping the period under the price when it does not fit.
 */
const StyledModernTierPrice = styled.p<{ $gap: number }>`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px ${({ $gap }) => Math.round($gap / 3)}px;
  margin: 0;
  padding: 0;
  min-width: 0;

  .reqore-tier-price-value {
    line-height: 1.1;
    letter-spacing: -0.02em;
  }
`;

/** Layout only: the feature list under a hairline, one feature per row. */
const StyledModernTierFeatures = styled.ul<{ $gap: number; $divider: string }>`
  list-style: none;
  margin: 0;
  padding: ${({ $gap }) => $gap}px 0 0;
  border-top: 1px solid ${({ $divider }) => $divider};
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => Math.round($gap / 2)}px;
`;

/** Layout only: the icon held on the first line of its feature, however many lines it wraps. */
const StyledModernTierFeature = styled.li<{ $lineHeight: number; $gap: number }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ $gap }) => Math.round($gap / 2)}px;
  min-width: 0;

  .reqore-tier-feature-icon {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    height: ${({ $lineHeight }) => $lineHeight}px;
  }

  .reqore-tier-feature-content {
    flex: 1 1 auto;
    min-width: 0;
    line-height: ${({ $lineHeight }) => $lineHeight}px;
  }
`;

/** Layout only: the button, pinned to the bottom edge of a stretched tier. */
const StyledModernTierAction = styled.div`
  display: flex;
  margin-top: auto;
`;

const ReqoreModernTier = memo(
  ({
    currency,
    currencyPosition = 'before',
    priceDetail,
    priceDetailEffect,
    priceDetailProps,
    description,
    price,
    actionButtonProps,
    name,
    nameDetail,
    badge,
    featureList,
    highlight,
    salePrice,
    active,
    activeActionLabel = 'Active',
    actionLabel = 'Get Started',
    labelSize = 3,
    labelEffect,
    descriptionEffect,
    size = 'normal',
    ...rest
  }: Omit<IReqoreTierProps, 'appearance'>) => {
    const theme = useReqoreTheme(
      'main',
      rest.customTheme,
      undefined,
      undefined,
      rest.inheritCustomTheme
    );
    // The panel's intent: the caller's, else `info` for a highlighted tier (as the classic tier).
    const intent: TReqoreIntent | undefined = rest.intent ?? (highlight ? 'info' : undefined);
    const accentIntent = highlight ? intent : undefined;
    const colors = useMemo(() => getTierColors(theme, accentIntent), [theme, accentIntent]);
    const gap = TIER_GAP_FROM_SIZE[size];
    const textSize = TEXT_FROM_SIZE[size];
    const lineHeight = Math.round(textSize * TIER_LINE_HEIGHT);

    // A highlighted tier: a faint wash of its accent, its border, and a soft shadow in the same
    // colour. Without a highlight the panel keeps its own flat surface.
    const contentEffect = useMemo((): IReqoreEffect | undefined => {
      if (!colors.accent) {
        return rest.contentEffect;
      }

      return {
        gradient: {
          type: 'linear',
          direction: 'to bottom',
          colors: { 0: colors.surface, 100: colors.surfaceBottom },
          borderColor: colors.accent,
        },
        glow: { color: colors.accent, opacity: 0.3, blur: 40, size: -14, y: 18 },
        ...rest.contentEffect,
      };
    }, [colors, rest.contentEffect]);

    // The description is a block (see `description`); one effect object keeps its memo.
    const descriptionTextEffect = useMemo(
      (): IReqoreEffect => ({ color: colors.muted, ...descriptionEffect }),
      [colors.muted, descriptionEffect]
    );
    const contentStyle = useMemo(
      (): React.CSSProperties => ({
        display: 'flex',
        flexDirection: 'column',
        ...rest.contentStyle,
      }),
      [rest.contentStyle]
    );

    const badges = useMemo(
      () => (badge ? getModernBadges(badge, accentIntent) : []),
      [badge, accentIntent]
    );

    const withCurrency = (value: string | number) =>
      currency && isNumber(value)
        ? currencyPosition === 'after'
          ? `${value}${currency}`
          : `${currency}${value}`
        : value;

    const hasSale = salePrice !== undefined && salePrice !== null && salePrice !== '';

    return (
      <ReqorePanel
        rounded
        radiusSize='big'
        flat={false}
        padded={false}
        fluid
        size={size}
        {...rest}
        intent={intent}
        contentEffect={contentEffect}
        contentStyle={contentStyle}
        className={`${rest.className || ''} reqore-tier reqore-tier-modern${
          highlight ? ' reqore-tier-highlighted' : ''
        }`}
      >
        <StyledModernTierBody
          className='reqore-tier-body'
          $padding={TIER_PADDING_FROM_SIZE[size]}
          $gap={gap}
        >
          <StyledModernTierHeader className='reqore-tier-header' $gap={gap}>
            <div className='reqore-tier-name-row'>
              <ReqoreHeading
                size={labelSize}
                className='reqore-tier-name'
                effect={{
                  weight: 'thick',
                  textSize: `${TIER_NAME_TEXT_FROM_SIZE[size]}px`,
                  color: colors.text,
                  ...labelEffect,
                }}
              >
                {name}
              </ReqoreHeading>
              {badges.length ? <ButtonBadge size={size} content={badges} margin='none' /> : null}
            </div>
            {nameDetail ? (
              <ReqoreP
                className='reqore-tier-name-detail'
                size={getOneLessSize(size)}
                effect={{ color: colors.muted, weight: 500 }}
              >
                {nameDetail}
              </ReqoreP>
            ) : null}
          </StyledModernTierHeader>

          <StyledModernTierPrice className='reqore-tier-price' $gap={gap}>
            <ReqoreP
              as='span'
              className='reqore-tier-price-value'
              effect={{
                weight: 700,
                textSize: `${TIER_PRICE_TEXT_FROM_SIZE[size]}px`,
                color: hasSale ? colors.sale : colors.text,
              }}
            >
              {withCurrency(hasSale ? salePrice : price)}
            </ReqoreP>
            {hasSale ? (
              <ReqoreP
                as='del'
                size={size}
                className='reqore-tier-price-original'
                effect={{ color: colors.muted, weight: 500 }}
              >
                {withCurrency(price)}
              </ReqoreP>
            ) : null}
            {priceDetail ? (
              <ReqoreP
                as='span'
                size={size}
                {...priceDetailProps}
                effect={{
                  // A caller's intent colours the line; otherwise it is the muted text colour.
                  color: priceDetailProps?.intent ? undefined : colors.muted,
                  weight: 500,
                  ...priceDetailProps?.effect,
                  ...priceDetailEffect,
                }}
                className={`${priceDetailProps?.className || ''} reqore-tier-price-detail`}
              >
                {priceDetail}
              </ReqoreP>
            ) : null}
          </StyledModernTierPrice>

          {description ? (
            <ReqoreP
              as='div'
              size={size}
              className='reqore-tier-description'
              effect={descriptionTextEffect}
            >
              {description}
            </ReqoreP>
          ) : null}

          {featureList?.length ? (
            <StyledModernTierFeatures
              className='reqore-tier-features'
              $gap={gap}
              $divider={colors.divider}
            >
              {featureList.map(
                (
                  { icon, content, iconProps, rightIcon, rightIconProps, ...contentProps },
                  index
                ) => (
                  <StyledModernTierFeature
                    key={index}
                    className='reqore-tier-feature'
                    $lineHeight={lineHeight}
                    $gap={gap}
                  >
                    <span className='reqore-tier-feature-icon'>
                      <ReqoreIcon
                        icon={icon || 'CheckLine'}
                        size={getOneLessSize(size)}
                        color={iconProps?.intent || iconProps?.color ? undefined : colors.check}
                        {...iconProps}
                      />
                    </span>
                    <ReqoreP
                      size={size}
                      {...contentProps}
                      effect={{
                        color: contentProps.intent ? undefined : colors.text,
                        ...contentProps.effect,
                      }}
                      className={`${contentProps.className || ''} reqore-tier-feature-content`}
                    >
                      {content}
                    </ReqoreP>
                    {rightIcon ? (
                      <span className='reqore-tier-feature-icon'>
                        <ReqoreIcon
                          icon={rightIcon}
                          size={getOneLessSize(size)}
                          {...rightIconProps}
                        />
                      </span>
                    ) : null}
                  </StyledModernTierFeature>
                )
              )}
            </StyledModernTierFeatures>
          ) : null}

          <StyledModernTierAction className='reqore-tier-action'>
            <ReqoreButton
              fluid
              size={size}
              radiusSize='small'
              textAlign='center'
              iconsAlign='center'
              minimal={false}
              intent={active ? 'success' : accentIntent}
              labelEffect={{ weight: 'thick' }}
              label={active ? activeActionLabel : actionLabel}
              icon={active ? 'CheckLine' : undefined}
              {...actionButtonProps}
              readOnly={active}
            />
          </StyledModernTierAction>
        </StyledModernTierBody>
      </ReqorePanel>
    );
  }
);

/* ------------------------------------------------------------------------------------------------
 * Tier
 * ---------------------------------------------------------------------------------------------- */

export const ReqoreTier = memo(({ appearance = 'classic', ...props }: IReqoreTierProps) =>
  appearance === 'modern' ? <ReqoreModernTier {...props} /> : <ReqoreClassicTier {...props} />
);
