import classNames from 'classnames';
import _size from 'lodash/size';
import { rgba, saturate, tint } from 'polished';
import React, { forwardRef, HTMLAttributes, useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { ReqorePopover, useReqoreTheme } from '../..';
import { CONTROL_ICON_OPACITY } from '../../constants/colors';
import { SYSTEM_FONT } from '../../constants/fonts';
import {
  BADGE_RADIUS_FROM_RADIUS_SIZE,
  BADGE_RADIUS_FROM_SIZE,
  BADGE_SIZE_TO_PX,
  CONTROL_TEXT_FROM_SIZE,
  resolveRadius,
  TAG_HORIZONTAL_PADDING_FROM_SIZE,
  TAG_VERTICAL_PADDING_FROM_SIZE,
  TAG_ICON_FROM_SIZE,
  TAG_RADIUS_FROM_RADIUS_SIZE,
  TAG_RADIUS_FROM_SIZE,
  TAG_SIZE_TO_PX,
  TAG_TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import {
  changeLightness,
  getColorFromMaybeString,
  getReadableColor,
  getReadableColorFrom,
  isAchromatic,
} from '../../helpers/colors';
import { ActiveIconScale, InactiveIconScale, RaisedElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreLoading,
  IWithReqoreMinimal,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import {
  IReqoreEffect,
  StyledEffect,
  StyledTextEffect,
  TReqoreColor,
  TReqoreEffectColor,
  TReqoreHexColor,
} from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreTagAction
  extends IWithReqoreTooltip, IReqoreDisabled, IReqoreIntent, HTMLAttributes<HTMLSpanElement> {
  icon: IReqoreIconName;
  show?: boolean | 'hover';
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export interface IReqoreCustomTagProps
  extends
    IWithReqoreTooltip,
    IReqoreDisabled,
    IWithReqoreMinimal,
    IWithReqoreFluid,
    IWithReqoreEffect,
    IWithReqoreLoading,
    IWithReqoreFlat,
    IWithReqoreCustomTheme {
  fixed?: boolean | 'key' | 'label';
  align?: 'left' | 'right' | 'center';
  size?: TSizes;
  label?: string | number;
  labelKey?: string | number;
  onRemoveClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  icon?: IReqoreIconName;
  leftIconProps?: IReqoreIconProps;
  rightIcon?: IReqoreIconName;
  iconColor?: TReqoreEffectColor;
  leftIconColor?: TReqoreEffectColor;
  rightIconColor?: TReqoreEffectColor;
  rightIconProps?: IReqoreIconProps;
  color?: TReqoreEffectColor;
  actions?: IReqoreTagAction[];
  width?: string;
  /**
   * Upper bound on the tag's width, as any CSS length (`'30ch'`, `'240px'`,
   * `'min(100%, 30ch)'`). A label longer than the box is truncated with an ellipsis.
   *
   * This is not `width`. `width` FIXES the box, so a short label is padded out to it
   * and a long one is still clipped; `maxWidth` only caps it, so a short tag keeps its
   * natural size and only a long one shortens.
   *
   * Only the LABEL truncates. The icons, the label key and the actions keep their full
   * size, because they are the parts a reader cannot reconstruct — a truncated `POST`
   * key or a half-drawn remove button tells them nothing, while a shortened URL still
   * shows what kind of thing it is. Pair it with `tooltip` so the whole value stays
   * reachable.
   *
   * Has no effect with `wrap`, which makes the label flow onto more lines instead, or
   * with `width`, which has already fixed the box.
   */
  maxWidth?: string;
  /**
   * Which part of a capped label is dropped. Defaults to `'end'`.
   *
   * - `'end'` — the tail goes: `https://host/webhooks/paddle-notif…`
   * - `'middle'` — the middle goes, and both ends survive:
   *   `https://host/we…paddle-notifications`
   *
   * Reach for `'middle'` when the values share a prefix and differ at the end — URLs
   * on one host, paths under one root, ids with a common namespace. Dropping the tail
   * there renders every one of them identically, which is the opposite of what a label
   * is for.
   *
   * Both are pure CSS: the whole label stays in the DOM either way, so it is still
   * selectable, copyable, findable with the browser's own search and read out in full
   * by a screen reader. Nothing about the value is thrown away to make it fit.
   *
   * Needs `maxWidth` — there is nothing to drop until the label is capped.
   */
  truncate?: 'end' | 'middle';
  asBadge?: boolean;
  intent?: TReqoreIntent;
  wrap?: boolean;
  rounded?: boolean;
  /**
   * Override the size used to derive the tag's border-radius. Defaults to `size`.
   */
  radiusSize?: TSizes;
  labelAlign?: 'left' | 'right' | 'center';
  labelEffect?: IReqoreEffect;
  labelKeyAlign?: 'left' | 'right' | 'center';
  labelKeyEffect?: IReqoreEffect;
  as?: string | React.ElementType;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow. The same
   * `RaisedElement` used by Panel, Button, Callout and EntityRow, so a raised tag sits
   * in the same material as the raised surfaces around it.
   */
  raised?: boolean;
  /**
   * Size of the tag's vertical padding. Defaults to `'normal'` (4px), the value the
   * tag used before this was configurable.
   *
   * Worth knowing when sizing a tag down: with `wrap` set the tag uses `min-height`
   * rather than a fixed height, so the box grows to its label and `size` stops
   * governing the height — the label's own text size and this padding are what
   * remain. Scaling it independently is what lets a tag sit inline in prose without
   * pushing the line apart.
   */
  paddingSize?: TSizes;
  /**
   * How the tag aligns against surrounding text. Defaults to `'middle'`, which centres
   * the box on the text's midline and is right for a tag standing on its own.
   *
   * `'baseline'` instead sits the tag's own label on the text baseline, which is what
   * you want for a tag used inline in a sentence — the label lines up with the words
   * either side rather than the box floating between them.
   */
  verticalAlign?: 'baseline' | 'middle' | 'top' | 'bottom';
  compact?: boolean;
  /**
   * Tooltip shown on the remove ("X") affordance rendered when `onRemoveClick`
   * is set. Defaults to `'Remove'`.
   */
  removeTooltip?: string;
}
export interface IReqoreTagProps
  extends
    Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'color'>,
    IReqoreCustomTagProps {}

export interface IReqoreTagStyle extends IReqoreTagProps {
  theme: IReqoreTheme;
  removable?: boolean;
  interactive?: boolean;
  color?: TReqoreColor;
  $wrap?: boolean;
  $hasWidth?: boolean;
  $maxWidth?: string;
  /** True when the label is capped and must shorten rather than push the box wider. */
  $capped?: boolean;
}

export const StyledTag = styled(StyledEffect)<IReqoreTagStyle>`
  display: inline-flex;
  justify-content: center;
  flex-shrink: 0;
  align-items: stretch;
  /* Only when the caller has not asked for a family. StyledTag extends StyledEffect,
     so an unconditional declaration here always won the cascade over effect.fontFamily
     — which is why ReqoreDataView had to force monospace back on with a specificity-
     boosted descendant override instead of just setting the effect.
     NO BACKTICKS in this comment: it lives inside a template literal and they end it. */
  ${({ effect }: IReqoreTagStyle) =>
    !effect?.fontFamily &&
    css`
      font-family: ${SYSTEM_FONT};
    `}
  overflow: hidden;
  vertical-align: ${({ verticalAlign = 'middle' }) => verticalAlign};
  font-size: ${({ size }) => TAG_TEXT_FROM_SIZE[size]}px;
  line-height: 1.1;

  min-width: ${({ size, asBadge }) => (asBadge ? BADGE_SIZE_TO_PX[size] : TAG_SIZE_TO_PX[size])}px;
  /* An explicit cap wins over the implicit one: a caller asking for 30ch means 30ch
     even inside a container wider than that, and 100% would let the tag grow past it. */
  max-width: ${({ $maxWidth, fixed }) =>
    $maxWidth ?? (fixed !== true ? '100%' : undefined)};
  flex: ${({ fluid, fixed }) => (fixed === true ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  justify-self: ${({ fixed, fluid }) =>
    fixed === true ? 'flex-start' : fluid ? 'stretch' : undefined};
  border: ${({ theme, color, flat = true }) =>
    !flat ? `1px solid ${changeLightness(color || theme.main, 0.2)}` : 0};
  /* Same flat !== false guard as EntityRow / FeatureCard / Callout: the inset
     highlight and the border are two ways of drawing the same edge, so a tag that
     already has a border does not also get the raised shading. */
  ${({ raised, flat = true }) => raised && flat !== false && RaisedElement}
  border-radius: ${({ asBadge, size, radiusSize, rounded }) =>
    rounded === false
      ? undefined
      : asBadge
        ? `${resolveRadius(size, radiusSize, BADGE_RADIUS_FROM_SIZE, BADGE_RADIUS_FROM_RADIUS_SIZE)}px`
        : `${resolveRadius(size, radiusSize, TAG_RADIUS_FROM_SIZE, TAG_RADIUS_FROM_RADIUS_SIZE)}px`};
  width: ${({ width }) => width || undefined};
  transition: all 0.2s ease-out;

  ${({ align }) => {
    if (align === 'left') {
      return css`
        margin-right: auto;
      `;
    }

    if (align === 'right') {
      return css`
        margin-left: auto;
      `;
    }

    if (align === 'center') {
      return css`
        margin: 0 auto;
      `;
    }
  }}

  ${InactiveIconScale};

  ${({ $wrap, $hasWidth }) =>
    $wrap || $hasWidth
      ? css`
          min-height: ${({ size, asBadge }) =>
            asBadge ? BADGE_SIZE_TO_PX[size] : TAG_SIZE_TO_PX[size]}px;
        `
      : css`
          height: ${({ size, asBadge }) =>
            asBadge ? BADGE_SIZE_TO_PX[size] : TAG_SIZE_TO_PX[size]}px;
        `}

  ${({ theme, color, labelKey, minimal }: IReqoreTagStyle) => {
    return css`
      background-color: ${minimal
        ? color
          ? rgba(color, 0.2)
          : rgba(changeLightness('#000000', 0.05), 0.3)
        : color || changeLightness(theme.main, 0.1)};
      color: ${minimal && color && color !== 'transparent' && !isAchromatic(color)
        ? saturate(1, tint(0.8, color))
        : color && color !== 'transparent'
          ? getReadableColorFrom(color)
          : getReadableColorFrom(changeLightness(theme.main, 0.1))};

      ${StyledTagKeyWrapper} {
        background-color: ${labelKey ? rgba('#000000', minimal ? 0.1 : 0.3) : undefined};
      }
    `;
  }}

  ${({ theme, color, interactive, minimal, effect }) =>
    interactive
      ? css`
          cursor: pointer;
          &:hover {
            .reqore-tag-content,
            .reqore-tag-key-content {
              ${ActiveIconScale}
            }

            ${!effect?.gradient &&
            css`
              background-color: ${minimal
                ? color
                  ? rgba(color, 0.5)
                  : rgba(changeLightness('#000000', 0.05), 0.4)
                : color || changeLightness(theme.main, 0.15)};
              color: ${minimal
                ? getReadableColor(theme, undefined, undefined, false, theme.originalMain)
                : color
                  ? getReadableColorFrom(color)
                  : getReadableColor(theme, undefined, undefined)};
            `}
          }
        `
      : undefined}


  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
      cursor: not-allowed;
    `}

  /* Only gate on hover where hover exists — see the same guard on ReqorePanel.
     On touch a \`show: 'hover'\` tag action would otherwise be display:none with
     no route to it at all. */
  @media (hover: hover) and (pointer: fine) {
    &:not(:hover) {
      .reqore-tag-action-hidden {
        display: none;
      }
    }
  }

  &:focus,
  &:active {
    outline: 2px solid ${({ theme, color }) => changeLightness(color || theme.main, 0.25)};
    outline-offset: -2px;
  }
`;

const StyledTagKeyWrapper = styled.span<{ size: TSizes; $wrap?: boolean; $hasWidth?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: ${({ hasKey, fixed }) => (hasKey ? (fixed === 'key' ? '0 0 auto' : 1) : undefined)};
  flex-shrink: 0;
  min-height: 100%;
  padding-left: ${({ size, hasIcon }) => hasIcon && `${TAG_HORIZONTAL_PADDING_FROM_SIZE[size]}px`};
  padding-right: ${({ size, padOnRight }) =>
    padOnRight && `${TAG_HORIZONTAL_PADDING_FROM_SIZE[size]}px`};
`;

const StyledTagContentWrapper = styled.span<{
  size: TSizes;
  $wrap?: boolean;
  $hasWidth?: boolean;
  $capped?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: ${({ fixed }) => (fixed === 'label' ? '0 0 auto' : 1)};
  min-height: 100%;

  /* This wrapper is what makes a capped tag possible, and by default it is what makes
     it impossible. It refuses to shrink so a label is never squashed inside a fluid
     tag — correct when the tag sizes to its content, but with a cap it means the box
     cannot get narrower than the text, so the tag's own overflow:hidden clips it. And
     because the content is CENTRED, it clips at BOTH ends: "https://host/a/b" renders
     as "ps://host/a/", and a label key disappears off the left entirely.

     min-width is the other half: a flex item defaults to min-width:auto, which is its
     content's width, so flex-shrink alone still cannot take it below the text. */
  ${({ $capped }) =>
    $capped
      ? css`
          flex-shrink: 1;
          min-width: 0;
          justify-content: flex-start;
        `
      : css`
          flex-shrink: 0;
        `}
`;

const StyledTagContent = styled(StyledTextEffect)<{
  size: TSizes;
  $paddingSize?: TSizes;
  $wrap?: boolean;
  $hasWidth?: boolean;
  $capped?: boolean;
}>`
  ${({ $capped }) =>
    $capped &&
    css`
      min-width: 0;
    `}
  padding: ${({ $paddingSize = 'normal' }) => TAG_VERTICAL_PADDING_FROM_SIZE[$paddingSize]}px
    ${({ size }) => TAG_HORIZONTAL_PADDING_FROM_SIZE[size]}px;
  min-height: 100%;
  display: flex;
  align-items: center;
  flex: 1;

  ${({ labelAlign }) => css`
    justify-content: ${labelAlign === 'left'
      ? 'flex-start'
      : labelAlign === 'right'
        ? 'flex-end'
        : 'center'};
  `}

  ${({ $wrap, $hasWidth }) =>
    !$wrap && !$hasWidth
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        `
      : css`
          word-break: break-word;
        `}
`;

const StyledTagContentKey = styled(StyledTagContent)`
  flex: 1;

  ${({ $wrap, $hasWidth }) =>
    !$wrap && !$hasWidth
      ? undefined
      : css`
          word-break: break-word;
        `}
`;

/**
 * The label's own box when the tag is capped.
 *
 * text-overflow needs a block box: StyledTagContent is a flex container (that is how
 * the label is vertically centred), and its text child is an ANONYMOUS flex item,
 * which cannot take text-overflow — the declaration already on StyledTagContent has
 * therefore never produced an ellipsis, only a hard clip. Giving the label a real
 * element of its own is what turns the clip into an ellipsis, and it is rendered only
 * for a capped tag so every other tag keeps exactly the DOM it had.
 *
 * This is Appendix A.9 ("cascade ellipsis, never apply to the wrapper") applied to the
 * tag: the slot clips, the text-bearing element inside it ellipsizes, and only the
 * LABEL is wrapped so the icons and the label key keep their natural width.
 */
const StyledTruncatedLabel = styled.span`
  min-width: 0;
  max-width: 100%;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * A label that drops its MIDDLE rather than its tail.
 *
 * CSS has no middle ellipsis, so the label is split in two and flexbox is left to do
 * the work: the head may shrink and ellipsizes when it does, the tail never shrinks.
 * The result reads `head…tail`, and it re-flows with the box — no measuring, no
 * resize observer, and no character count that is wrong at a different font size.
 *
 * The whole label is still in the DOM, in order, so selecting the tag copies the
 * complete value and a screen reader reads it out whole. That is the part a JS
 * shortener cannot match: it deletes the characters it hides.
 */
const StyledMiddleTruncatedLabel = styled.span`
  min-width: 0;
  max-width: 100%;
  display: flex;
  white-space: nowrap;
`;

const StyledTruncatedLabelHead = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/* Never shrinks: it is the half the caller asked to keep. */
const StyledTruncatedLabelTail = styled.span`
  flex-shrink: 0;
  white-space: nowrap;
`;

/**
 * Where to cut a label whose middle is dropped.
 *
 * The last third is pinned. Enough to tell apart values that differ only at the end —
 * two webhooks on one host, two ids in one namespace — without pinning so much that
 * the head has no room left to say what kind of thing it is.
 */
const MIDDLE_TRUNCATE_TAIL_RATIO = 3;

/** Split a label for middle truncation, by code point so a surrogate pair survives. */
const splitTagLabel = (label: string): [string, string] => {
  const characters = Array.from(label);
  const tailLength = Math.floor(characters.length / MIDDLE_TRUNCATE_TAIL_RATIO);

  if (!tailLength) {
    return [label, ''];
  }

  return [
    characters.slice(0, characters.length - tailLength).join(''),
    characters.slice(characters.length - tailLength).join(''),
  ];
};

const StyledButtonWrapper = styled.span<IReqoreTagStyle>`
  flex-shrink: 0;
  font-size: ${({ size }) => CONTROL_TEXT_FROM_SIZE[size]}px;
  width: ${({ size }) => BADGE_SIZE_TO_PX[size]}px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;

  ${({ color, effect }) => css`
    .reqore-icon {
      transform: scale(0.85);
    }
    &:hover {
      cursor: pointer;
      background-color: ${color && !effect?.gradient
        ? changeLightness(color, 0.09)
        : rgba('#000000', 0.2)};

      .reqore-icon {
        transform: scale(1);
      }
    }
  `}
`;

const ReqoreTag = forwardRef<HTMLSpanElement, IReqoreTagProps>(
  (
    {
      tooltip,
      label,
      labelKey,
      icon,
      rightIcon,
      className,
      onClick,
      size = 'normal',
      paddingSize,
      onRemoveClick,
      actions,
      asBadge,
      intent,
      color,
      minimal,
      customTheme,
      inheritCustomTheme,
      wrap = false,
      width,
      maxWidth,
      truncate = 'end',
      leftIconColor,
      rightIconColor,
      iconColor,
      labelKeyAlign = 'left',
      labelAlign,
      labelEffect,
      labelKeyEffect,
      leftIconProps,
      rightIconProps,
      loading,
      loadingIconType,
      compact,
      removeTooltip = 'Remove',
      ...rest
    }: IReqoreTagProps,
    ref
  ) => {
    const theme: IReqoreTheme = useReqoreTheme(
      'main',
      customTheme,
      undefined,
      undefined,
      inheritCustomTheme
    );

    // If color or intent was specified, set the color
    const getCustomColor = useCallback(
      (itemIntent?: TReqoreIntent): TReqoreHexColor => {
        const customColor: TReqoreHexColor = itemIntent
          ? theme.intents[itemIntent]
          : getColorFromMaybeString(theme, color);

        if (customColor?.length === 9) {
          return customColor;
        }

        return customColor;
      },
      [theme, color]
    );

    const leftIcon: IReqoreIconName = loading
      ? `Loader${loadingIconType || ''}Line`
      : icon || leftIconProps?.icon;

    const hasLeftIcon = !!leftIcon || !!leftIconProps?.image;
    const hasRightIcon = !!rightIcon || !!rightIconProps?.image;

    /* A cap only truncates when there is nothing else already deciding the label's
       shape: `wrap` asks for more lines instead of fewer characters, and `width` has
       already fixed the box. Honouring all three at once would mean guessing which
       the caller meant. */
    const capped = !!maxWidth && !wrap && !width;

    /* Split once per label rather than per render. Only a string can be cut in the
       middle — a numeric label is short by nature and has no meaningful halves. */
    const middleParts = useMemo(
      () =>
        capped && truncate === 'middle' && typeof label === 'string'
          ? splitTagLabel(label)
          : undefined,
      [capped, truncate, label]
    );

    const effect = useMemo(
      () => ({
        ...rest.effect,
        gradient: intent ? undefined : rest.effect?.gradient,
        interactive: !!onClick && !rest.disabled,
      }),
      [intent, !!onClick, rest.disabled, JSON.stringify(rest.effect)]
    );

    return (
      <ReqoreTooltipComponent
        {...rest}
        Component={StyledTag}
        tooltip={tooltip}
        theme={theme}
        effect={effect}
        width={width}
        $maxWidth={maxWidth}
        labelKey={labelKey}
        color={getCustomColor(intent)}
        className={`${className || ''} reqore-tag`}
        size={size}
        ref={ref}
        asBadge={asBadge}
        minimal={minimal}
        removable={!!onRemoveClick}
        interactive={!!onClick && !rest.disabled}
        tabIndex={onClick && !rest.disabled ? 0 : undefined}
        $wrap={wrap}
        $hasWidth={!!width}
      >
        {labelKey || hasLeftIcon ? (
          <StyledTagKeyWrapper
            size={size}
            className='reqore-tag-key-content'
            onClick={rest.disabled ? undefined : onClick}
            $wrap={wrap}
            $hasWidth={!!width}
            hasKey={!!labelKey}
            hasIcon={hasLeftIcon}
            padOnRight={!label && !labelKey && !hasRightIcon}
            fixed={rest.fixed}
          >
            {leftIcon || leftIconProps?.image ? (
              <ReqoreIcon
                size={`${TAG_ICON_FROM_SIZE[size]}px`}
                color={leftIconColor || iconColor}
                compact={compact}
                effect={{
                  opacity: CONTROL_ICON_OPACITY,
                }}
                {...leftIconProps}
                animation={loading ? 'spin' : leftIconProps?.animation}
                icon={leftIcon}
              />
            ) : null}
            {labelKey && (
              <StyledTagContentKey
                $wrap={wrap}
                $hasWidth={!!width}
                size={size}
                $paddingSize={paddingSize}
                labelAlign={labelKeyAlign}
                compact={compact}
                effect={
                  {
                    weight: 'bold',
                    ...labelKeyEffect,
                  } as IReqoreEffect
                }
              >
                {labelKey}
              </StyledTagContentKey>
            )}
          </StyledTagKeyWrapper>
        ) : null}
        {label || label === 0 || hasRightIcon ? (
          <StyledTagContentWrapper
            size={size}
            className='reqore-tag-content'
            onClick={rest.disabled ? undefined : onClick}
            $wrap={wrap}
            $hasWidth={!!width}
            $capped={capped}
            hasKey={!!labelKey}
            fixed={rest.fixed}
          >
            {label || label === 0 ? (
              <StyledTagContent
                size={size}
                $paddingSize={paddingSize}
                $wrap={wrap}
                $hasWidth={!!width}
                $capped={capped}
                labelAlign={labelAlign || (labelKey ? 'left' : 'center')}
                compact={compact}
                effect={
                  {
                    weight: 'bold',
                    ...labelEffect,
                  } as IReqoreEffect
                }
              >
                {!capped ? (
                  label
                ) : middleParts ? (
                  <StyledMiddleTruncatedLabel className='reqore-tag-label'>
                    <StyledTruncatedLabelHead className='reqore-tag-label-head'>
                      {middleParts[0]}
                    </StyledTruncatedLabelHead>
                    <StyledTruncatedLabelTail className='reqore-tag-label-tail'>
                      {middleParts[1]}
                    </StyledTruncatedLabelTail>
                  </StyledMiddleTruncatedLabel>
                ) : (
                  <StyledTruncatedLabel className='reqore-tag-label'>{label}</StyledTruncatedLabel>
                )}
              </StyledTagContent>
            ) : null}
            {hasRightIcon ? (
              <ReqoreIcon
                icon={rightIcon}
                size={`${TAG_ICON_FROM_SIZE[size]}px`}
                margin={label || (!icon && !labelKey) ? 'right' : 'both'}
                color={rightIconColor || iconColor}
                compact={compact}
                effect={{
                  opacity: CONTROL_ICON_OPACITY,
                }}
                {...rightIconProps}
              />
            ) : null}
          </StyledTagContentWrapper>
        ) : null}
        {_size(actions)
          ? actions
              .filter((action) => action.show !== false)
              .map(({ intent, onClick, icon, tooltip, className, ...action }, index) => (
                <React.Fragment key={index}>
                  <ReqorePopover
                    component={StyledButtonWrapper}
                    componentProps={{
                      size,
                      color: getCustomColor(intent),
                      onClick: onClick,
                      effect: rest.effect,
                      ...action,
                      // MERGED, not replaced, and after the spread: a consumer
                      // passing `className` used to clobber `reqore-tag-action`
                      // and `reqore-tag-action-hidden`, so a `show: 'hover'`
                      // action with a custom class silently stopped hiding.
                      className: classNames(
                        'reqore-tag-action',
                        action.show === 'hover' ? 'reqore-tag-action-hidden' : '',
                        className
                      ),
                    }}
                    {...(tooltip
                      ? typeof tooltip === 'string'
                        ? { tooltip: tooltip }
                        : tooltip
                      : {})}
                    isReqoreComponent
                  >
                    <ReqoreIcon
                      icon={icon}
                      size={`${TAG_ICON_FROM_SIZE[size]}px`}
                      effect={{
                        opacity: CONTROL_ICON_OPACITY,
                      }}
                    />
                  </ReqorePopover>
                </React.Fragment>
              ))
          : null}
        {onRemoveClick && !rest.disabled ? (
          <ReqorePopover
            component={StyledButtonWrapper}
            componentProps={{
              size,
              color: getCustomColor(intent),
              className: 'reqore-tag-remove',
              onClick: onRemoveClick,
              effect: rest.effect,
            }}
            isReqoreComponent
            content={removeTooltip}
          >
            <ReqoreIcon icon='CloseLine' size={size} />
          </ReqorePopover>
        ) : null}
      </ReqoreTooltipComponent>
    );
  }
);

export default ReqoreTag;
