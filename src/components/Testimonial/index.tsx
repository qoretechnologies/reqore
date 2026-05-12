import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import {
  PADDING_FROM_SIZE,
  resolveRadius,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneLessSize, resolvePadding, TReqorePadded } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement, RaisedElement } from '../../styles';
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
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect, TReqoreEffectColor } from '../Effect';
import ReqoreEntityRow from '../EntityRow';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreP } from '../Paragraph';
import ReqoreRating from '../Rating';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreTestimonialAction extends Omit<IReqoreButtonProps, 'children'> {
  /** Visible button label. */
  label?: string;
}

export interface IReqoreTestimonialProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'role'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFixed,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** The testimonial body — the quote / endorsement copy. Falls back to `children`. */
  quote?: React.ReactNode;
  /** Effect applied to the quote text. */
  quoteEffect?: IReqoreEffect;
  /** Author name shown beneath the quote. */
  author?: React.ReactNode;
  /** Effect applied to the author label. */
  authorEffect?: IReqoreEffect;
  /** Author role / company line beneath the author name. */
  role?: React.ReactNode;
  /** Effect applied to the role label. */
  roleEffect?: IReqoreEffect;
  /** Image URL for the author avatar. Takes precedence over `avatarIcon`. */
  avatar?: string;
  /** Icon used as the author avatar when no `avatar` image is provided. */
  avatarIcon?: IReqoreIconName;
  /** Custom color for the avatar icon (defaults to intent or readable color). */
  avatarColor?: TReqoreEffectColor;
  /** Additional props passed to the avatar ReqoreIcon. */
  avatarIconProps?: Partial<IReqoreIconProps>;
  /** Numeric rating shown above the quote (0..maxRating, half-steps supported). */
  rating?: number;
  /** Maximum rating value. Default `5`. */
  maxRating?: number;
  /** Badge(s) shown next to the author name, identical to other Reqore components. */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Action button(s) rendered below the quote. */
  actions?: IReqoreTestimonialAction[];
  /** Show the decorative leading quote glyph above the quote. Default `true`. */
  showQuoteIcon?: boolean;
  /** Round the corners. Default `true`. */
  rounded?: boolean;
  /**
   * Override the size used to derive the testimonial's border-radius. Defaults to `size`.
   */
  radiusSize?: TSizes;
  /** Hide the tinted surface background. */
  transparent?: boolean;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border); the highlight is suppressed
   * when `flat={false}` because the border already provides surface definition.
   */
  raised?: boolean;
  /** Marks the testimonial as clickable; auto-detected from `onClick`. */
  interactive?: boolean;
  /**
   * Whether the quote wraps when it overflows.
   * - `true` (default): wrap to multiple lines (normal blockquote behaviour)
   * - `false`: single line with ellipsis (compact card use)
   */
  wrap?: boolean;
  /**
   * Controls which axes receive the card's outer padding.
   * - `true` (default): padding on both axes
   * - `false`: no padding (e.g. when nested inside another padded surface)
   * - `'horizontal'`: only left/right padding
   * - `'vertical'`: only top/bottom padding
   */
  padded?: TReqorePadded;
  /**
   * Size of the card's outer padding. Defaults to `size`. Use this to scale
   * the padding independently from the card's text scale.
   */
  paddingSize?: TSizes;
}

interface IStyledTestimonialProps {
  theme: IReqoreTheme;
  $intent?: TReqoreIntent;
  $transparent?: boolean;
  size: TSizes;
  $fluid?: boolean;
  $fixed?: boolean;
  flat?: boolean;
  rounded?: boolean;
  radiusSize?: TSizes;
  disabled?: boolean;
  $raised?: boolean;
  $interactive?: boolean;
  $padded: TReqorePadded;
  $paddingSize: TSizes;
}

const tintedBgFor = (theme: IReqoreTheme, intent?: TReqoreIntent) =>
  intent
    ? rgba(theme.intents[intent], 0.06)
    : changeDarkness(getMainBackgroundColor(theme), 0.03);

const StyledTestimonial = styled(StyledEffect)<IStyledTestimonialProps>`
  position: relative;
  display: flex;
  flex-flow: column;
  gap: ${({ size }) => PADDING_FROM_SIZE[size] * 1.5}px;
  width: ${({ $fluid, $fixed }) => ($fluid && !$fixed ? '100%' : undefined)};
  max-width: 100%;
  padding: ${({ $padded, $paddingSize }) =>
    resolvePadding({
      padded: $padded,
      paddingSize: $paddingSize,
      verticalMultiplier: 3,
      horizontalMultiplier: 3,
    })};
  background-color: ${({ theme, $intent, $transparent }) =>
    $transparent ? 'transparent' : tintedBgFor(theme, $intent)};
  border: ${({ flat, theme, $intent }) =>
    flat
      ? 'none'
      : `1px solid ${changeLightness(
          $intent ? theme.intents[$intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  border-radius: ${({ rounded, size, radiusSize }) =>
    rounded ? `${resolveRadius(size, radiusSize)}px` : '0'};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  flex: ${({ $fluid }) => ($fluid ? '1 auto' : '0 0 auto')};
  margin: 0;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;

  ${({ $raised, flat }) => $raised && flat !== false && RaisedElement}

  ${({ disabled }) => disabled && DisabledElement}

  ${({ $interactive, theme, $intent, $transparent }) =>
    $interactive &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-1px);
        background-color: ${$intent
          ? rgba(theme.intents[$intent], $transparent ? 0.04 : 0.1)
          : $transparent
          ? rgba(changeLightness(getMainBackgroundColor(theme), 0.08), 0.08)
          : changeLightness(getMainBackgroundColor(theme), 0.04)};
      }
    `}
`;

const StyledQuoteIconWrapper = styled.div<{
  theme: IReqoreTheme;
  $intent?: TReqoreIntent;
}>`
  display: flex;
  color: ${({ theme, $intent }) =>
    $intent ? theme.intents[$intent] : changeLightness(getMainBackgroundColor(theme), 0.22)};
  opacity: 0.7;
`;

const StyledQuote = styled.div<{ $wrap: boolean; size: TSizes; theme: IReqoreTheme }>`
  font-size: ${({ size }) => TEXT_FROM_SIZE[size] * 1.1}px;
  line-height: 1.5;
  font-weight: 500;
  font-style: italic;
  min-width: 0;

  ${({ $wrap }) =>
    !$wrap &&
    css`
      overflow: hidden;

      & > * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;
        max-width: 100%;
      }
    `}
`;

const ReqoreTestimonial = memo(
  forwardRef<HTMLDivElement, IReqoreTestimonialProps>(
    (
      {
        children,
        quote,
        quoteEffect,
        author,
        authorEffect,
        role,
        roleEffect,
        avatar,
        avatarIcon,
        avatarColor,
        avatarIconProps,
        rating,
        maxRating = 5,
        badge,
        actions,
        intent,
        transparent = false,
        showQuoteIcon = true,
        size = 'normal',
        flat = true,
        fluid = true,
        fixed,
        rounded = true,
        radiusSize,
        raised,
        customTheme,
        inheritCustomTheme,
        disabled,
        tooltip,
        effect,
        interactive,
        onClick,
        wrap = true,
        padded = true,
        paddingSize,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const secondarySize = useMemo(() => getOneLessSize(size), [size]);
      const isInteractive = interactive || !!onClick;
      const hasBadge = badge !== undefined && badge !== null;
      const hasAvatar = !!avatar || !!avatarIcon;
      const hasAttribution = !!author || !!role || hasAvatar || hasBadge;
      const quoteContent = quote ?? children;

      const resolvedAvatarColor: TReqoreEffectColor = useMemo(() => {
        if (avatarColor) return avatarColor;
        if (intent) return theme.intents[intent] as TReqoreEffectColor;
        return getReadableColor(theme, undefined, undefined, true) as TReqoreEffectColor;
      }, [avatarColor, intent, theme]);

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledTestimonial}
          tooltip={tooltip}
          ref={ref}
          theme={theme}
          $intent={intent}
          $transparent={transparent}
          size={size}
          $fluid={fluid}
          $fixed={fixed}
          flat={flat}
          rounded={rounded}
          radiusSize={radiusSize}
          $raised={raised}
          $interactive={isInteractive}
          $padded={padded}
          $paddingSize={paddingSize ?? size}
          disabled={disabled}
          effect={effect}
          onClick={onClick}
          className={`${className || ''} reqore-testimonial`}
        >
          {showQuoteIcon && (
            <StyledQuoteIconWrapper
              theme={theme}
              $intent={intent}
              className='reqore-testimonial-quote-icon'
              aria-hidden
            >
              <ReqoreIcon icon='DoubleQuotesL' size={size} color={resolvedAvatarColor} />
            </StyledQuoteIconWrapper>
          )}
          {rating !== undefined && (
            <ReqoreRating
              className='reqore-testimonial-rating'
              value={rating}
              max={maxRating}
              size={secondarySize}
              intent={intent}
              readOnly
              allowHalf
              aria-label={`Rating: ${rating} out of ${maxRating}`}
            />
          )}
          {quoteContent && (
            <StyledQuote
              theme={theme}
              size={size}
              $wrap={wrap}
              className='reqore-testimonial-quote'
            >
              <ReqoreP size={size} effect={quoteEffect}>
                {quoteContent}
              </ReqoreP>
            </StyledQuote>
          )}
          {hasAttribution && (
            <ReqoreEntityRow
              className='reqore-testimonial-footer'
              label={author}
              labelEffect={{ weight: 'bold', italic: false, ...authorEffect }}
              description={role}
              descriptionEffect={{ italic: false, ...roleEffect }}
              icon={avatarIcon}
              iconImage={avatar}
              iconColor={resolvedAvatarColor}
              iconProps={avatarIconProps}
              iconHasBackground={false}
              showIcon={hasAvatar}
              badge={badge}
              size={size}
              intent={intent}
              transparent
              flat
              fluid
              padded={false}
              wrap={wrap}
              customTheme={customTheme}
              inheritCustomTheme={inheritCustomTheme}
            />
          )}
          {actions && actions.length > 0 && (
            <ReqoreControlGroup gapSize='small' className='reqore-testimonial-actions'>
              {actions.map((action, idx) => (
                <ReqoreButton
                  key={idx}
                  size={secondarySize}
                  intent={action.intent ?? intent}
                  {...action}
                >
                  {action.label}
                </ReqoreButton>
              ))}
            </ReqoreControlGroup>
          )}
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreTestimonial;
