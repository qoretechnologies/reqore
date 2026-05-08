import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor, getReadableColor } from '../../helpers/colors';
import { getOneLessSize, resolvePadding, TReqorePadded } from '../../helpers/utils';
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
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect, TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreEntityRowAction extends Omit<IReqoreButtonProps, 'children'> {
  /** Visible button label. */
  label?: string;
}

export interface IReqoreEntityRowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Primary text — e.g. the Qog name. */
  label: React.ReactNode;
  /** Secondary text — typically a one-line description. */
  description?: React.ReactNode;
  /** Tertiary text — e.g. "Last run: success · 3 hours ago · 384ms". */
  metadata?: React.ReactNode;
  /** Badge(s) shown next to the label, identical to other Reqore components. */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Icon shown in the leading icon tile. */
  icon?: IReqoreIconName;
  /** Image rendered inside the leading icon tile (overrides `icon` if both set). */
  iconImage?: string;
  /** Custom color for the leading icon (defaults to intent or readable color). */
  iconColor?: TReqoreEffectColor;
  /** Additional props passed to the leading ReqoreIcon. */
  iconProps?: Partial<IReqoreIconProps>;
  /** Right-side action button(s). */
  actions?: IReqoreEntityRowAction[];
  /** Hide the intent-tinted background. Mirrors `transparent` on other components. */
  transparent?: boolean;
  /** Round the row corners. Default `true`. */
  rounded?: boolean;
  /** Show the leading icon tile. Default `true` when icon/iconImage is provided. */
  showIcon?: boolean;
  /**
   * Show the tinted/rounded background tile around the leading icon.
   * - When the row is opaque (`transparent={false}`, the default), defaults
   *   to `true`.
   * - When the row is `transparent={true}`, defaults to `false` so the bare
   *   icon does not sit on a tile that fights the transparent surface.
   * - Pass an explicit boolean to override the default in either direction.
   */
  iconHasBackground?: boolean;
  /**
   * Controls which axes receive the row's outer padding.
   * - `true` (default): padding on both axes
   * - `false`: no padding (e.g. when nested inside another padded surface)
   * - `'horizontal'`: only left/right padding
   * - `'vertical'`: only top/bottom padding
   */
  padded?: TReqorePadded;
  /**
   * Size of the row's outer padding. Defaults to `size`. Use this to scale
   * the padding independently from the row's text/icon scale (e.g. a `big`
   * row with `paddingSize='small'` for a denser layout).
   */
  paddingSize?: TSizes;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border); the highlight is suppressed
   * when `flat={false}` because the border already provides surface definition.
   */
  raised?: boolean;
  /** Effect applied to the label text. */
  labelEffect?: IReqoreEffect;
  /** Effect applied to the description text. */
  descriptionEffect?: IReqoreEffect;
  /** Effect applied to the metadata text. */
  metadataEffect?: IReqoreEffect;
  /**
   * Whether description and metadata wrap when they overflow.
   * - `true` (default): wrap to multiple lines
   * - `false`: single line with ellipsis
   */
  wrap?: boolean;
}

interface IStyledRowProps {
  theme: IReqoreTheme;
  $intent?: TReqoreIntent;
  $transparent?: boolean;
  size: TSizes;
  $fluid?: boolean;
  flat?: boolean;
  $clickable?: boolean;
  rounded?: boolean;
  disabled?: boolean;
  $hasIcon?: boolean;
  $iconHasBackground?: boolean;
  $raised?: boolean;
  $padded: TReqorePadded;
  $paddingSize: TSizes;
}

const ICON_TILE_SIZE_FROM_SIZE: Record<TSizes, number> = {
  micro: 18,
  tiny: 22,
  small: 26,
  normal: 32,
  big: 40,
  huge: 48,
  massive: 56,
};

const tintedBgFor = (theme: IReqoreTheme, intent?: TReqoreIntent) =>
  intent
    ? rgba(theme.intents[intent], 0.06)
    : rgba(changeLightness(getMainBackgroundColor(theme), 0.04), 1);

const StyledRow = styled(StyledEffect)<IStyledRowProps>`
  display: grid;
  grid-template-columns: ${({ $hasIcon, $iconHasBackground, size }) =>
    $hasIcon
      ? `${$iconHasBackground ? `${ICON_TILE_SIZE_FROM_SIZE[size]}px` : 'auto'} 1fr auto`
      : '1fr auto'};
  gap: ${({ size }) => PADDING_FROM_SIZE[size] * 2}px;
  padding: ${({ $padded, $paddingSize }) =>
    resolvePadding({
      padded: $padded,
      paddingSize: $paddingSize,
      verticalMultiplier: 2,
      horizontalMultiplier: 3,
    })};
  border-radius: ${({ rounded, size }) => (rounded ? `${RADIUS_FROM_SIZE[size]}px` : '0')};
  background-color: ${({ theme, $intent, $transparent }) =>
    $transparent ? 'transparent' : tintedBgFor(theme, $intent)};
  border: ${({ flat, theme, $intent }) =>
    flat
      ? 'none'
      : `1px solid ${changeLightness(
          $intent ? theme.intents[$intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  align-items: center;
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  transition: background-color 0.15s ease-out;

  ${({ $clickable, theme, $intent, $transparent }) =>
    $clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${$intent
          ? rgba(theme.intents[$intent], $transparent ? 0.04 : 0.1)
          : $transparent
          ? rgba(changeLightness(getMainBackgroundColor(theme), 0.08), 0.08)
          : rgba(changeLightness(getMainBackgroundColor(theme), 0.08), 1)};
      }
    `}

  ${({ $raised, flat }) => $raised && flat !== false && RaisedElement}

  ${({ disabled }) => disabled && DisabledElement}
`;

interface IStyledIconTileProps {
  $size: TSizes;
  $intent?: TReqoreIntent;
  theme: IReqoreTheme;
}

const StyledIconTile = styled.div<IStyledIconTileProps>`
  width: ${({ $size }) => ICON_TILE_SIZE_FROM_SIZE[$size]}px;
  height: ${({ $size }) => ICON_TILE_SIZE_FROM_SIZE[$size]}px;
  border-radius: ${({ $size }) => RADIUS_FROM_SIZE[$size]}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: ${({ theme, $intent }) =>
    $intent
      ? rgba(theme.intents[$intent], 0.15)
      : rgba(changeLightness(getMainBackgroundColor(theme), 0.06), 1)};
`;

const StyledBody = styled.div`
  display: flex;
  flex-flow: column;
  gap: 2px;
  min-width: 0;
`;

const StyledLabelLine = styled.div<{ $wrap: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: ${({ $wrap }) => ($wrap ? 'wrap' : 'nowrap')};
  min-width: 0;
  font-weight: 500;
`;

// `text-overflow: ellipsis` only works on the actual text-bearing element,
// not its wrapper. Cascade into the inner <ReqoreP>/<ReqoreSpan> via `& > *`
// so the `…` glyph appears. The wrapper itself stays a flex item that can
// shrink below its content (`min-width: 0; flex: 1 1 auto`).
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

const ReqoreEntityRow = memo(
  forwardRef<HTMLDivElement, IReqoreEntityRowProps>(
    (
      {
        label,
        description,
        metadata,
        badge,
        icon,
        iconImage,
        iconColor,
        iconProps,
        actions,
        intent,
        transparent = false,
        showIcon,
        iconHasBackground,
        padded = true,
        paddingSize,
        size = 'normal',
        flat = true,
        fluid = true,
        rounded = true,
        raised,
        customTheme,
        inheritCustomTheme,
        disabled,
        tooltip,
        effect,
        labelEffect,
        descriptionEffect,
        metadataEffect,
        wrap = true,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const secondarySize = useMemo(() => getOneLessSize(size), [size]);

      const hasIcon = (showIcon ?? (!!icon || !!iconImage)) && (!!icon || !!iconImage);
      const interactive = !!(rest.onClick || rest.onDoubleClick);
      const hasBadge = badge !== undefined && badge !== null;
      // Default: tile follows opacity. Transparent rows hide the tile so the
      // bare icon does not sit on a tinted square that fights transparency.
      // Explicit prop overrides in either direction.
      const resolvedIconHasBackground = iconHasBackground ?? !transparent;

      const resolvedIconColor: TReqoreEffectColor = useMemo(() => {
        if (iconColor) return iconColor;
        if (intent) return theme.intents[intent] as TReqoreEffectColor;
        return getReadableColor(theme, undefined, undefined, true) as TReqoreEffectColor;
      }, [iconColor, intent, theme]);

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledRow}
          tooltip={tooltip}
          ref={ref}
          theme={theme}
          $intent={intent}
          $transparent={transparent}
          size={size}
          $fluid={fluid}
          flat={flat}
          rounded={rounded}
          $raised={raised}
          $clickable={interactive}
          disabled={disabled}
          $hasIcon={hasIcon}
          $iconHasBackground={resolvedIconHasBackground}
          $padded={padded}
          $paddingSize={paddingSize ?? size}
          effect={effect}
          className={`${className || ''} reqore-entity-row`}
        >
          {hasIcon &&
            (resolvedIconHasBackground ? (
              <StyledIconTile
                theme={theme}
                $intent={intent}
                $size={size}
                className='reqore-entity-row-icon-tile'
              >
                <ReqoreIcon
                  {...iconProps}
                  icon={icon}
                  image={iconImage}
                  size={size}
                  color={resolvedIconColor}
                />
              </StyledIconTile>
            ) : (
              <ReqoreIcon
                {...iconProps}
                icon={icon}
                image={iconImage}
                size={size}
                color={resolvedIconColor}
                className={`reqore-entity-row-icon ${iconProps?.className || ''}`.trim()}
              />
            ))}
          <StyledBody className='reqore-entity-row-body'>
            <StyledLabelLine $wrap={wrap} className='reqore-entity-row-label'>
              <StyledTextSlot $wrap={wrap}>
                <ReqoreSpan size={size} effect={labelEffect}>
                  {label}
                </ReqoreSpan>
              </StyledTextSlot>
              {hasBadge && (
                <ButtonBadge
                  size={size}
                  content={badge}
                  margin='none'
                />
              )}
            </StyledLabelLine>
            {description && (
              <StyledTextSlot $wrap={wrap}>
                <ReqoreP
                  size={secondarySize}
                  effect={{ opacity: 0.7, ...descriptionEffect }}
                  className='reqore-entity-row-description'
                >
                  {description}
                </ReqoreP>
              </StyledTextSlot>
            )}
            {metadata && (
              <StyledTextSlot $wrap={wrap}>
                <ReqoreSpan
                  size={secondarySize}
                  effect={{ opacity: 0.5, ...metadataEffect }}
                  className='reqore-entity-row-metadata'
                >
                  {metadata}
                </ReqoreSpan>
              </StyledTextSlot>
            )}
          </StyledBody>
          {actions && actions.length > 0 && (
            <ReqoreControlGroup gapSize='small' className='reqore-entity-row-actions'>
              {actions.map((action, idx) => (
                <ReqoreButton
                  key={idx}
                  size={size}
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

export default ReqoreEntityRow;
