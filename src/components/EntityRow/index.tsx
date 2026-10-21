import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import { css } from 'styled-components';
import styled, { omitStyleProps, REQORE_CONTROL_GROUP_CHILD_PROPS } from '../../helpers/styled';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TOUCH_TARGET_PX, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getDrawnColor,
  getMainBackgroundColor,
  getReadableAlpha,
  getReadableFadedColor,
} from '../../helpers/colors';
import { ReqoreSurfaceProvider } from '../../context/SurfaceContext';
import {
  getOneLessSize,
  resolvePadding,
  TReqorePadded,
  withStoppedPropagation,
} from '../../helpers/utils';
import { useNarrowContainer } from '../../hooks/useNarrowContainer';
import { useReqoreDrawnSurface } from '../../hooks/useDrawnSurface';
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
import ReqoreDropdown, { IReqoreDropdownProps } from '../Dropdown';
import {
  IReqoreEffect,
  StyledEffect,
  TReqoreEffectColor,
  TReqoreHexColor,
} from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { IReqorePanelSubAction } from '../Panel';
import { getCardHoverFill, getCardMarkColor, getDrawnEffectTextColor } from '../../helpers/surface';
import { getReqoreTextElement, ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import ReqoreRowActionsMenu, {
  getCompactRowAction,
  getRowActionLabel,
  hasRowActionLabel,
  IReqoreRowActionShortLabel,
  rowLabelText,
  TReqoreNarrowRowActions,
} from '../RowActionsMenu';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreEntityRowAction
  extends Omit<IReqoreButtonProps, 'children'>, IReqoreRowActionShortLabel {
  /** Visible button label. */
  label?: string;
  /**
   * Turns this action into an overflow menu instead of a plain button — the row
   * equivalent of `IReqorePanelAction.actions`, and named to match it.
   *
   * Typical use is a "three dots" menu: `{ icon: 'More2Line', actions: [...] }`.
   * Entries with `show: false` are dropped.
   */
  actions?: IReqorePanelSubAction[];
  /** Extra props for the dropdown rendered when `actions` is set. */
  actionsProps?: IReqoreDropdownProps;
}

/**
 * Opening a row's overflow menu must not also fire the row underneath it.
 *
 * Defined at module scope rather than inline: `ReqoreDropdown` is memoised, and a
 * fresh arrow on every render is a new prop identity that defeats the memo. This
 * handler closes over nothing, so one shared instance is all that is ever needed —
 * `useCallback` would still allocate one per row.
 */
const stopRowClick = withStoppedPropagation<HTMLElement>();

/** Same reasoning: a stable predicate instead of a new closure per render. */
const isSubActionShown = ({ show }: IReqorePanelSubAction) => show !== false;

export interface IReqoreEntityRowProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
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
  /**
   * Secondary text — typically a one-line description.
   *
   * Text, inline content or blocks (a `ReqoreP`, a list, a `ReqoreControlGroup`): it is drawn in
   * a block container with the description's typography, not in a paragraph, which could not
   * hold a block.
   */
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
  /**
   * How two or more actions are shown when the row is narrow (below 480px of its container):
   * `'row'` (default) keeps them under the label as a row of buttons, onto another line where they do not
   * fit; `'stack'` puts them under the label one to a line, each the row's width (a narrow entity row's
   * container is a phone's width or narrower, where a control spans its row); `'menu'`, opted into, folds
   * them into one menu button at the end of the label's line - an action that is itself a menu becomes a
   * submenu there. See `TReqoreNarrowRowActions`. A single action is a button under the label, the row's
   * width, in every mode.
   */
  narrowActions?: TReqoreNarrowRowActions;
  /** What the menu button of `narrowActions='menu'` is called (its accessible name and tooltip). */
  actionsMenuLabel?: string;
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
  /** The row's text: what reads on the row as it is drawn, its gradient's colors included. */
  $text?: TReqoreHexColor;
  /** Each color the row is drawn in: an `effect.color` is read against them. */
  $backgrounds?: TReqoreHexColor[];
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

export const ICON_TILE_SIZE_FROM_SIZE: Record<TSizes, number> = {
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

/** The icon's tile: a wash of the intent, or the row's surface a step lighter. */
const iconTileFillFor = (theme: IReqoreTheme, intent?: TReqoreIntent) =>
  intent
    ? rgba(theme.intents[intent], 0.15)
    : rgba(changeLightness(getMainBackgroundColor(theme), 0.06), 1);

/* Wrapper the ResizeObserver measures. Width follows the row's `fluid` prop so a
   `fluid={false}` row nested in a flex parent still shrinks to content and the
   observer sees the shrunk width. Mirrors ReqoreSeverityRow. */
/** The row's fill while hovered, when it is clickable: its rule paints it, and what it holds is read on it. */
const getEntityRowHoverFill = (
  theme: IReqoreTheme,
  intent?: TReqoreIntent,
  transparent?: boolean
) =>
  getCardHoverFill(
    theme,
    intent,
    transparent,
    changeLightness(getMainBackgroundColor(theme), 0.08)
  );

const StyledContainer = styled.div<{ $fluid: boolean }>`
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
`;

// Its styling flags, and the layout flags a containing `ReqoreControlGroup` hands it, are not
// its element's (nor a component it is rendered `as`). `disabled` still reaches an element that
// has it, when the component is rendered `as` one (see `omitStyleProps`).
const StyledRow = styled(StyledEffect).withConfig({
  shouldForwardProp: omitStyleProps(
    'disabled',
    'inheritCustomTheme',
    'radiusSize',
    ...REQORE_CONTROL_GROUP_CHILD_PROPS
  ),
})<IStyledRowProps>`
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
  color: ${({ $text }) => $text};
  transition: background-color 0.15s ease-out;

  /* Narrow-container layout, driven by the data-narrow attribute the row's
     ResizeObserver stamps on it. See useNarrowContainer for why this is an
     attribute selector rather than a CSS container query.

     row-gap is deliberately tighter than the (horizontal) column gap: once the
     actions sit under the label the row already has breathing room from the
     description above them, so a full column-gap reads as a dead band. */
  &[data-narrow='true'] {
    grid-template-columns: ${({ $hasIcon, $iconHasBackground, size }) =>
      $hasIcon
        ? `${$iconHasBackground ? `${ICON_TILE_SIZE_FROM_SIZE[size]}px` : 'auto'} 1fr`
        : '1fr'};
    grid-auto-rows: max-content;
    row-gap: ${({ size }) => PADDING_FROM_SIZE[size]}px;
  }
  &[data-narrow='true'] > .reqore-entity-row-actions {
    grid-column: ${({ $hasIcon }) => ($hasIcon ? '2 / -1' : '1 / -1')};
    grid-row: 2;
    max-width: 100%;
    justify-content: flex-start;
  }

  /* Narrow, the actions are under the label: a row of buttons that goes onto another line where it does not
     fit, or with narrowActions='stack' one to a line (each the row's width in a phone-width container), as
     ReqoreSeverityRow's (qorus#646): on one line that does not wrap, labelled actions reached past the row on
     a phone. A finger gets a target it can hit. */
  @media (pointer: coarse) {
    &[data-narrow='true'] > .reqore-entity-row-actions > .reqore-button {
      min-height: ${TOUCH_TARGET_PX}px;
    }
  }

  /* Narrow, two or more actions are one menu button at the end of the label's line (qorus#646), not
     a line each under it: the label keeps its width, and a list of rows does not grow by a line per
     action. A row of that mode with one action keeps it there too, as a button of its own ('end'): under the
     label it was a line of its own for one button, where a row with more had none (David, qorus#646). The
     columns are the wide row's. */
  &[data-narrow='true'][data-actions='menu'],
  &[data-narrow='true'][data-actions='end'] {
    grid-template-columns: ${({ $hasIcon, $iconHasBackground, size }) =>
      $hasIcon
        ? `${$iconHasBackground ? `${ICON_TILE_SIZE_FROM_SIZE[size]}px` : 'auto'} 1fr auto`
        : '1fr auto'};
  }
  /* The last column, named: an item placed in a row with its column left to the grid is placed before
     the items around it, in the first column. */
  &[data-narrow='true'][data-actions='menu'] > .reqore-entity-row-actions,
  &[data-narrow='true'][data-actions='end'] > .reqore-entity-row-actions {
    grid-column: -2 / -1;
    grid-row: 1;
    align-self: start;
  }

  ${({ $clickable, theme, $intent, $transparent }) =>
    $clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${getEntityRowHoverFill(theme, $intent, $transparent)};
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
  background-color: ${({ theme, $intent }) => iconTileFillFor(theme, $intent)};
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

/**
 * How an entity row writes its description or its metadata: fainter than its label (`opacity`), as far as it stays
 * readable on the row. Its text is written in the faded color - not the slot faded as a whole - so what it holds
 * with a color of its own (a tag, a link, readable on the row) is drawn as it is: faded twice, a warning tag read
 * 4.0:1 (qorus#646). A color a caller gives is the caller's, faded as before, as far as that color stays readable.
 * An opacity a caller gives (`effect.opacity`) is the caller's, as given.
 */
const getSecondaryTextEffect = (
  theme: IReqoreTheme,
  effect: IReqoreEffect | undefined,
  opacity: number,
  text: TReqoreHexColor,
  backgrounds: TReqoreHexColor[]
): IReqoreEffect => {
  if (effect?.color) {
    return {
      ...effect,
      opacity:
        effect.opacity ??
        getReadableAlpha(
          getDrawnEffectTextColor(theme, effect.color, backgrounds) ?? text,
          backgrounds,
          opacity
        ),
    };
  }

  return {
    ...effect,
    opacity: undefined,
    color: (effect?.opacity !== undefined
      ? rgba(text, effect.opacity)
      : getReadableFadedColor(text, backgrounds, opacity)) as TReqoreHexColor,
  };
};

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
        narrowActions = 'row',
        actionsMenuLabel,
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

      /* Track the WRAPPER's own width (not the viewport's) so the grid responds to
         the box the row actually sits in — a narrow drawer on a wide screen. The
         result is stamped as `data-narrow`; an attribute selector rewrites the
         grid so the actions move under the label. Shared with ReqoreSeverityRow. */
      const [containerRef, isNarrow, isPhoneWidth] = useNarrowContainer<HTMLDivElement>();
      const loneAction = actions?.length === 1;
      // Narrow, two or more actions are one menu button only where the caller asks for it.
      const actionsAsMenu = isNarrow && narrowActions === 'menu' && (actions?.length ?? 0) > 1;
      /* Narrow, a row that folds two or more into a menu keeps its one action where the menu would be - only
         while its container is wider than a phone. As narrow as a phone, the action goes under the label and
         spans the row like any lone action there (David and Foxhoundn, qorus#646). */
      const loneActionAtLineEnd =
        isNarrow && !isPhoneWidth && narrowActions === 'menu' && loneAction;
      // Narrow and stacked: one to a line. Otherwise narrow, they are a row of buttons under the label.
      const actionsStacked = isNarrow && narrowActions === 'stack';
      /* Under the label, stacked actions and a lone action are the row's width where the row's container is a
         phone's width or narrower - on a phone, or in as narrow a container on any screen - where a full-width
         row is the easiest target there is (Fitts's law). In a container wider than a phone, each is as wide as
         its label (David's width rule, qorus#646). The container is measured, not the screen. */
      const actionsSpanRow = isNarrow && isPhoneWidth && (actionsStacked || loneAction);
      // an action on a line of its own: it is written out (an icon-only one says its tooltip), and may span it
      const actionsOnTheirOwnLine = actionsStacked || actionsSpanRow;

      /* What the row is drawn on and in - its tint over what is under it, and the icon's tile over
         that - and its text: what it holds, its fainter description and metadata and its icon are read
         against them. */
      const { backgrounds, text } = useReqoreDrawnSurface({
        theme,
        customTheme,
        transparent,
        fill: tintedBgFor(theme, intent),
        effect,
        // clickable, it is hovered too: what it holds is read on its hover fill as well
        hoverFill: interactive ? getEntityRowHoverFill(theme, intent, transparent) : undefined,
      });
      /* The description and the metadata are fainter than the label, as far as they stay readable (see
         getSecondaryTextEffect): one object while it holds, for memo components. */
      const descriptionLook = useMemo(
        () => getSecondaryTextEffect(theme, descriptionEffect, 0.7, text, backgrounds),
        [theme, descriptionEffect, text, backgrounds]
      );
      const metadataLook = useMemo(
        () => getSecondaryTextEffect(theme, metadataEffect, 0.5, text, backgrounds),
        [theme, metadataEffect, text, backgrounds]
      );
      const iconBackgrounds = useMemo(
        () =>
          resolvedIconHasBackground
            ? backgrounds.map((under) => getDrawnColor(iconTileFillFor(theme, intent), under))
            : backgrounds,
        [resolvedIconHasBackground, theme, intent, backgrounds]
      );
      // The icon is in its own color, or the intent's, in a shade that stands out by 3:1 from its tile.
      const resolvedIconColor: TReqoreEffectColor = useMemo(
        () => getCardMarkColor(theme, iconBackgrounds, text, iconColor, intent),
        [iconColor, intent, theme, iconBackgrounds, text]
      );

      return (
        <StyledContainer ref={containerRef} $fluid={fluid} className='reqore-entity-row-container'>
          <ReqoreTooltipComponent
            // A div, not the effect's span: the row holds blocks, which a span may not.
            as='div'
            data-narrow={isNarrow || undefined}
            data-actions={
              !isNarrow || !actions?.length ? undefined
              : actionsAsMenu ? 'menu'
              : loneActionAtLineEnd ? 'end'
              : actionsStacked ? 'stack'
              : 'row'
            }
            {...rest}
            Component={StyledRow}
            tooltip={tooltip}
            ref={ref}
            theme={theme}
            $intent={intent}
            $transparent={transparent}
            $text={text}
            $backgrounds={backgrounds}
            size={size}
            $fluid={fluid}
            flat={flat}
            rounded={rounded}
            $raised={raised}
            $clickable={interactive}
            disabled={disabled}
            // a disabled row says so; any other keeps what the caller says
            aria-disabled={disabled ? true : rest['aria-disabled']}
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
            {/* its text and its actions are drawn on the row: they read against it, not what is around it */}
            <ReqoreSurfaceProvider color={backgrounds}>
              <StyledBody className='reqore-entity-row-body'>
                <StyledLabelLine $wrap={wrap} className='reqore-entity-row-label'>
                  <StyledTextSlot $wrap={wrap}>
                    <ReqoreSpan size={size} effect={labelEffect}>
                      {label}
                    </ReqoreSpan>
                  </StyledTextSlot>
                  {hasBadge && <ButtonBadge size={size} content={badge} margin='none' />}
                </StyledLabelLine>
                {description && (
                  <StyledTextSlot $wrap={wrap}>
                    <ReqoreP
                      as={getReqoreTextElement(description)}
                      size={secondarySize}
                      effect={descriptionLook}
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
                      effect={metadataLook}
                      className='reqore-entity-row-metadata'
                    >
                      {metadata}
                    </ReqoreSpan>
                  </StyledTextSlot>
                )}
              </StyledBody>
              {actionsAsMenu && (
                <ReqoreRowActionsMenu
                  className='reqore-entity-row-actions'
                  actions={actions}
                  size={size}
                  intent={intent}
                  label={actionsMenuLabel}
                  rowLabel={rowLabelText(label)}
                />
              )}
              {!actionsAsMenu && actions && actions.length > 0 && (
                <ReqoreControlGroup
                  gapSize='small'
                  className='reqore-entity-row-actions'
                  /* narrow and stacked: one to a line, each the row's width in a container a phone's width or
                     narrower and as wide as its label in a wider one; narrow in a row: as wide as they are, onto
                     another line where they do not fit - a lone one the row's width as narrow as a phone */
                  vertical={actionsStacked}
                  fluid={actionsSpanRow}
                  wrap={isNarrow && !actionsStacked && !loneActionAtLineEnd}
                >
                  {actions.map(
                    ({ actions: subActions, actionsProps, shortLabel, ...action }, idx) => {
                      /* At the end of a narrow row's label line, an action says its short label, or is its icon
                       alone where it has a tooltip (`getCompactRowAction`): a long label took the line's room
                       (David, qorus#646). On a line of its own, and wide, it says its label. */
                      const compact = loneActionAtLineEnd
                        ? getCompactRowAction({ ...action, shortLabel })
                        : undefined;

                      return subActions?.length ? (
                        // An action carrying sub-actions is a menu, not a button — same
                        // contract as ReqorePanel. The click is stopped here because the row
                        // itself is commonly clickable: opening the menu must not also
                        // trigger the row.
                        <ReqoreDropdown
                          key={idx}
                          fixed
                          size={size}
                          intent={action.intent ?? intent}
                          {...action}
                          {...actionsProps}
                          /* Stacked, a menu is a button like the others (the row's width in a phone-width container), and an
                           icon-only one says what it is: its tooltip is its label, as a finger gets no tooltip
                           to read. */
                          {...(actionsOnTheirOwnLine
                            ? {
                                fluid: actionsSpanRow,
                                fixed: !actionsSpanRow,
                                label: hasRowActionLabel(action.label)
                                  ? action.label
                                  : getRowActionLabel({ tooltip: action.tooltip }),
                              }
                            : {})}
                          {...compact}
                          items={subActions.filter(isSubActionShown)}
                          onClick={stopRowClick}
                        />
                      ) : (
                        <ReqoreButton
                          key={idx}
                          size={size}
                          intent={action.intent ?? intent}
                          {...action}
                          {...(actionsOnTheirOwnLine ? { fluid: actionsSpanRow, wrap: true } : {})}
                          {...compact}
                          // After the spread, so it wraps the consumer's handler rather
                          // than being replaced by it. Applied even to an action with no
                          // handler of its own: an action button is a control, and a click
                          // that lands on one should never read as a click on the row.
                          // Without it both fire, and an action that toggles what the row
                          // toggles cancels itself out. Matches ReqoreSeverityRow.
                          onClick={withStoppedPropagation<HTMLButtonElement>(action.onClick)}
                        >
                          {/* Stacked, an icon-only action is a button of its own line: its tooltip is its
                            label, as a finger gets no tooltip to read. */}
                          {compact
                            ? compact.label
                            : hasRowActionLabel(action.label)
                              ? action.label
                              : actionsOnTheirOwnLine
                                ? getRowActionLabel({ tooltip: action.tooltip })
                                : undefined}
                        </ReqoreButton>
                      );
                    }
                  )}
                </ReqoreControlGroup>
              )}
            </ReqoreSurfaceProvider>
          </ReqoreTooltipComponent>
        </StyledContainer>
      );
    }
  )
);

export default ReqoreEntityRow;
