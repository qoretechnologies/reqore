import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import {
  HEADER_SIZE_TO_NUMBER,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  resolveRadius,
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
import {
  getOneLessSize,
  resolvePadding,
  TReqorePadded,
  withStoppedPropagation,
} from '../../helpers/utils';
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
  TReqoreDataAttributes,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreControlGroup, { IReqoreControlGroupProps } from '../ControlGroup';
import ReqoreControlGroupItem from '../ControlGroup/item';
import { IReqoreEffect, StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreP } from '../Paragraph';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export type TReqoreFeatureCardMarker = 'line' | 'number' | 'icon' | 'none';

export interface IReqoreFeatureCardAction extends Omit<IReqoreButtonProps, 'children'> {
  /** Visible button label. */
  label?: string;
}

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
  /** Card heading. */
  label: React.ReactNode;
  /** Effect applied to the label heading. */
  labelEffect?: IReqoreEffect;
  /** Body copy under the label. */
  description?: React.ReactNode;
  /** Effect applied to the description paragraph. */
  descriptionEffect?: IReqoreEffect;
  /** Visual marker rendered above the label. */
  marker?: TReqoreFeatureCardMarker;
  /** Used when `marker === 'number'`. */
  markerLabel?: string | number;
  /** Effect applied to the marker label. */
  markerEffect?: IReqoreEffect;
  /** Icon rendered when `marker === 'icon'`. */
  icon?: IReqoreIconName;
  /** Color for the marker icon (defaults to the marker's standard color). */
  iconColor?: TReqoreEffectColor;
  /** Additional props forwarded to the marker icon. */
  iconProps?: Omit<IReqoreIconProps, 'icon' | 'color'>;
  /** Badge(s) shown next to the label, identical to other Reqore components. */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Round the card corners. Default `true`. */
  rounded?: boolean;
  /**
   * Override the size used to derive the card's border-radius. Defaults to `size`.
   * Useful when the card's text/padding scale should differ from its corner roundness.
   */
  radiusSize?: TSizes;
  /** Marks the card as clickable; auto-detected from `onClick`. */
  interactive?: boolean;
  /** Hide the card's tinted background. */
  transparent?: boolean;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border); the highlight is suppressed
   * when `flat={false}` because the border already provides surface definition.
   */
  raised?: boolean;
  /**
   * Whether the description wraps when it overflows.
   * - `true` (default): wrap to multiple lines
   * - `false`: single line with ellipsis
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
  /**
   * Buttons in the card's footer, after `footer`. Each is a `ReqoreButton` (`label` is its
   * text) at the card's `size`, `intent` and `customTheme` unless it sets its own, and disabled
   * with the card; `fluid` makes one span the footer. A click on one does not reach the card's
   * own `onClick`.
   */
  actions?: IReqoreFeatureCardAction[];
  /**
   * Content for the card's footer, before the `actions`: a link, a tag group, a price, a note.
   * A string or a number is written at the description's size. The footer is the card's last
   * row and sits at its bottom edge, so in a row of cards of equal height the footers line up
   * whatever the length of each description.
   */
  footer?: React.ReactNode;
  /**
   * Props for the footer row, a `ReqoreControlGroup` (wrapping, `gapSize` small, centred on
   * the cross axis by default): `horizontalAlign='flex-end'` to right-align it, `vertical` to
   * stack it, `spaceBetween`, `gapSize`, `className`, `style`.
   */
  footerProps?: Partial<IReqoreControlGroupProps> & TReqoreDataAttributes;
}

interface IStyledFeatureCardProps extends Omit<IReqoreFeatureCardProps, 'transparent' | 'raised'> {
  theme: IReqoreTheme;
  $transparent?: boolean;
  $raised?: boolean;
  $padded: TReqorePadded;
  $paddingSize: TSizes;
}

const StyledFeatureCard = styled(StyledEffect)<IStyledFeatureCardProps>`
  display: flex;
  flex-flow: column;
  gap: ${({ size = 'normal' }) => PADDING_FROM_SIZE[size]}px;
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  max-width: 100%;
  padding: ${({ $padded, $paddingSize }) =>
    resolvePadding({
      padded: $padded,
      paddingSize: $paddingSize,
      verticalMultiplier: 3,
      horizontalMultiplier: 3,
    })};
  background-color: ${({ theme, $transparent }) =>
    $transparent ? 'transparent' : changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border: ${({ theme, intent, flat }) =>
    flat
      ? 0
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  border-radius: ${({ rounded, size = 'normal' as TSizes, radiusSize }) =>
    rounded === false ? 0 : `${resolveRadius(size, radiusSize)}px`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
  position: relative;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};
  transition: border-color 0.16s ease, background-color 0.16s ease, transform 0.16s ease;

  ${({ $raised, flat }) => $raised && flat !== false && RaisedElement}

  ${({ disabled }) => disabled && DisabledElement}

  /* The footer is the last row and takes whatever height the card has spare above it, so
     the footers of a row of stretched cards share one line. */
  > .reqore-feature-card-footer {
    margin-top: auto;
  }

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
                intent
                  ? theme.intents[intent]
                  : changeLightness(getMainBackgroundColor(theme), 0.22),
                0.8
              )};
          }
        `
      : undefined}

  ${({ marker, size, theme, intent }) =>
    marker === 'icon'
      ? css`
          align-items: center;
          justify-content: center;
          width: ${TEXT_FROM_SIZE[size] * 2.2}px;
          height: ${TEXT_FROM_SIZE[size] * 2.2}px;
          border-radius: ${RADIUS_FROM_SIZE[size]}px;
          background: ${rgba(
            intent
              ? theme.intents[intent]
              : changeLightness(getMainBackgroundColor(theme), 0.18),
            0.18
          )};
          color: ${intent
            ? theme.intents[intent]
            : changeLightness(getMainBackgroundColor(theme), 0.6)};
          box-shadow: inset 0 0 0 1px
            ${rgba(
              intent
                ? theme.intents[intent]
                : changeLightness(getMainBackgroundColor(theme), 0.22),
              0.35
            )};
        `
      : undefined}
`;

const StyledFeatureCardContent = styled.div`
  display: flex;
  flex-flow: column;
  gap: 12px;
`;

const StyledLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
`;

// Cascade ellipsis CSS into the inner ReqoreP — `text-overflow: ellipsis`
// only takes effect on the actual text-bearing element.
const StyledTextSlot = styled.div<{ $wrap: boolean }>`
  min-width: 0;
  ${({ $wrap }) =>
    !$wrap &&
    css`
      flex: 1 1 auto;
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

export const ReqoreFeatureCard = memo(
  forwardRef<HTMLDivElement, IReqoreFeatureCardProps>(
    (
      {
        label,
        labelEffect,
        description,
        descriptionEffect,
        marker: markerProp,
        markerLabel,
        markerEffect,
        icon,
        iconColor,
        iconProps,
        badge,
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
        rounded = true,
        transparent = false,
        raised,
        wrap = true,
        effect,
        interactive,
        onClick,
        padded = true,
        paddingSize,
        actions,
        footer,
        footerProps,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const labelSize = useMemo(() => HEADER_SIZE_TO_NUMBER[size] as 1 | 2 | 3 | 4 | 5 | 6, [size]);
      const descriptionSize = useMemo(() => getOneLessSize(size), [size]);
      const isInteractive = interactive || !!onClick;
      const hasBadge = badge !== undefined && badge !== null;
      const marker: TReqoreFeatureCardMarker = markerProp ?? (icon ? 'icon' : 'line');
      const hasActions = !!actions?.length;
      const hasFooter = (footer !== undefined && footer !== null && footer !== false) || hasActions;

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
          $transparent={transparent}
          $raised={raised}
          $padded={padded}
          $paddingSize={paddingSize ?? size}
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
              {marker === 'icon' && icon && (
                <ReqoreIcon
                  icon={icon}
                  size={size}
                  color={iconColor}
                  {...iconProps}
                />
              )}
            </StyledFeatureCardMarker>
          )}
          <StyledFeatureCardContent className='reqore-feature-card-content'>
            <StyledLabelRow className='reqore-feature-card-label-row'>
              <StyledTextSlot $wrap={wrap}>
                <ReqoreHeading
                  size={labelSize}
                  customTheme={theme}
                  effect={labelEffect}
                  className='reqore-feature-card-label'
                >
                  {label}
                </ReqoreHeading>
              </StyledTextSlot>
              {hasBadge && <ButtonBadge size={size} content={badge} margin='none' />}
            </StyledLabelRow>
            {description && (
              <StyledTextSlot $wrap={wrap}>
                <ReqoreP
                  size={descriptionSize}
                  customTheme={theme}
                  effect={{ opacity: 0.72, ...descriptionEffect }}
                  className='reqore-feature-card-description'
                >
                  {description}
                </ReqoreP>
              </StyledTextSlot>
            )}
          </StyledFeatureCardContent>
          {hasFooter && (
            <ReqoreControlGroup
              wrap
              gapSize='small'
              verticalAlign='center'
              size={size}
              {...footerProps}
              className={`${footerProps?.className || ''} reqore-feature-card-footer`}
            >
              {footer !== undefined && footer !== null && footer !== false ? (
                <ReqoreControlGroupItem className='reqore-feature-card-footer-content'>
                  {typeof footer === 'string' || typeof footer === 'number' ? (
                    // Text gets the description's size, so a footer note reads as card text.
                    <ReqoreP size={descriptionSize} customTheme={theme}>
                      {footer}
                    </ReqoreP>
                  ) : (
                    footer
                  )}
                </ReqoreControlGroupItem>
              ) : null}
              {actions?.map(({ label: actionLabel, ...action }, index) => (
                <ReqoreButton
                  key={index}
                  size={size}
                  intent={intent}
                  customTheme={customTheme}
                  // A disabled card is out of the pointer's reach, but not the keyboard's.
                  disabled={disabled}
                  {...action}
                  className={`${action.className || ''} reqore-feature-card-action`}
                  // After the spread, so it wraps the consumer's handler: an action is a
                  // control, and a click on it is never a click on the card.
                  onClick={withStoppedPropagation<HTMLButtonElement>(action.onClick)}
                >
                  {actionLabel}
                </ReqoreButton>
              ))}
            </ReqoreControlGroup>
          )}
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreFeatureCard;
