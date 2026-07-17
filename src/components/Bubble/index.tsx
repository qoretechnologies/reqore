import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  useMemo,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { rgba } from 'polished';
import styled, { css } from 'styled-components';
import {
  BUBBLE_AVATAR_RADIUS_FROM_SIZE,
  BUBBLE_RADIUS_FROM_RADIUS_SIZE,
  BUBBLE_RADIUS_FROM_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  resolveRadius,
  SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { RaisedElement } from '../../styles';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreMinimal,
  IWithReqoreSize,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { IReqoreEffect, ReqoreEffect, StyledEffect } from '../Effect';
import ReqoreIcon from '../Icon';
import { ReqoreSpan } from '../Span';

export type TReqoreBubbleAlign = 'left' | 'right';
export type TReqoreBubbleGroupPosition = 'single' | 'first' | 'middle' | 'last';

export interface IReqoreBubbleAvatar {
  /** Icon glyph shown in the avatar. Ignored when `image` is set. */
  icon?: IReqoreIconName;
  /** Image shown in the avatar — a user photo, an app logo, … */
  image?: string;
}

export interface IReqoreBubbleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title'>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreSize,
    IWithReqoreMinimal,
    IWithReqoreFlat,
    IReqoreIntent {
  /** Side the bubble hugs within its container. Defaults to `'left'`. */
  align?: TReqoreBubbleAlign;
  /** Upper bound on the bubble's width. Defaults to `'85%'`. */
  maxWidth?: string;
  /** Whether the bubble has rounded corners. Defaults to `true`. */
  rounded?: boolean;
  /**
   * Opts the corners onto the pronounced `radiusSize` scale instead of deriving
   * them from `size` — for both the bubble and its `avatar`. Ignored when
   * `rounded={false}`.
   */
  radiusSize?: TSizes;
  /**
   * Position within a run of same-side bubbles — controls which corners are
   * tightened so a group reads as one cluster. Usually set automatically by
   * `ReqoreBubbleGroup`. Defaults to `'single'`.
   */
  groupPosition?: TReqoreBubbleGroupPosition;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Applied only on a borderless (`flat`), non-`intent` bubble.
   */
  raised?: boolean;
  /**
   * Avatar rendered *outside* the bubble, on the side the bubble hugs, tinted
   * with the bubble's own colour and top-aligned with it. Give it an `icon` or
   * an `image`. Adding one wraps the bubble in a row that takes over the
   * alignment, so the avatar and the bubble travel to the aligned side together.
   */
  avatar?: IReqoreBubbleAvatar;
  /** Bold lead-in on the bubble's first line — typically the author's name. */
  title?: ReactNode;
  /**
   * Muted text beside `title` — typically a time. Unlike `timestamp`, which sits
   * at the bubble's bottom-right, this reads inline with the author.
   */
  detail?: ReactNode;
  /** Effect applied to `title` — merged over its bold default. */
  titleEffect?: IReqoreEffect;
  /** Effect applied to `detail` — merged over its muted default. */
  detailEffect?: IReqoreEffect;
  /** Optional muted timestamp rendered at the bottom of the bubble. */
  timestamp?: ReactNode;
  /** Effect applied to the bubble's content (e.g. gradient or coloured text). */
  contentEffect?: IReqoreEffect;
  /** Makes the bubble interactive — hover feedback + pointer cursor. */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
}

interface IStyledBubbleProps {
  theme: IReqoreTheme;
  $size: TSizes;
  $align: TReqoreBubbleAlign;
  $maxWidth: string;
  $groupPosition: TReqoreBubbleGroupPosition;
  $minimal?: boolean;
  $flat?: boolean;
  $rounded?: boolean;
  $radiusSize?: TSizes;
  $raised?: boolean;
  $clickable?: boolean;
  /** Whether the bubble carries an intent or customTheme — i.e. its own colour. */
  $coloured?: boolean;
  /** Whether an `effect` gradient paints the background (then no solid fill). */
  $hasGradient?: boolean;
  /** Whether an avatar row wraps the bubble and owns the alignment. */
  $inRow?: boolean;
}

// Border radius per group position: a run of same-side bubbles tightens the
// corners that face the neighbour so the cluster reads as one — the pattern
// Qonsole uses for its chat transcript.
function groupRadius(
  position: TReqoreBubbleGroupPosition,
  align: TReqoreBubbleAlign,
  round: number,
  tight: number
): string {
  const r = `${round}px`;
  const t = `${tight}px`;
  if (position === 'single') return r;
  // border-radius order: top-left top-right bottom-right bottom-left
  if (align === 'right') {
    if (position === 'first') return `${r} ${r} ${t} ${r}`;
    if (position === 'middle') return `${r} ${t} ${t} ${r}`;
    return `${r} ${t} ${r} ${r}`;
  }
  if (position === 'first') return `${r} ${r} ${r} ${t}`;
  if (position === 'middle') return `${t} ${r} ${r} ${t}`;
  return `${t} ${r} ${r} ${r}`;
}

export const StyledBubble = styled(StyledEffect)<IStyledBubbleProps>`
  display: block;
  width: fit-content;
  max-width: ${({ $maxWidth }) => $maxWidth};
  /* Standalone, the bubble aligns itself; inside an avatar row the row does. */
  margin-left: ${({ $align, $inRow }) => (!$inRow && $align === 'right' ? 'auto' : 0)};
  margin-right: ${({ $align, $inRow }) => (!$inRow && $align === 'left' ? 'auto' : 0)};
  padding: ${({ $size }) =>
    `${Math.round(PADDING_FROM_SIZE[$size] * 1.3)}px ${Math.round(
      PADDING_FROM_SIZE[$size] * 1.85
    )}px`};
  font-size: ${({ $size }) => TEXT_FROM_SIZE[$size]}px;
  line-height: 1.5;
  word-break: break-word;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background-color 0.15s ease-out, filter 0.15s ease-out;
  border-radius: ${({ $size, $rounded, $radiusSize, $groupPosition, $align }) =>
    $rounded === false
      ? 0
      : groupRadius(
          $groupPosition,
          $align,
          resolveRadius($size, $radiusSize, BUBBLE_RADIUS_FROM_SIZE, BUBBLE_RADIUS_FROM_RADIUS_SIZE),
          // the seam a cluster tightens to stays small whatever the outer curve —
          // that contrast is what makes a run read as one bubble.
          RADIUS_FROM_SIZE[$size]
        )};

  ${({ theme, $minimal, $flat, $coloured, $hasGradient }) => {
    // A coloured bubble (intent / customTheme) tints its own colour; a plain one
    // sits on a lightened wash of the surface. `minimal` makes either translucent
    // so the surface behind shows through — the low-emphasis treatment.
    // When an `effect` gradient is set it *is* the background, so no solid fill
    // is painted — that lets translucent gradient stops show the surface through.
    const background = $coloured
      ? $minimal
        ? rgba(theme.main, 0.16)
        : theme.main
      : $minimal
        ? rgba(changeLightness(theme.main, 0.5), 0.1)
        : changeLightness(theme.main, 0.06);

    return css`
      background-color: ${$hasGradient ? 'transparent' : background};
      color: ${getReadableColor(theme)};
      ${$flat === false
        ? css`
            border: 1px solid ${changeLightness(theme.main, 0.2)};
          `
        : ''}
    `;
  }}

  ${({ $raised }) => $raised && RaisedElement}

  ${({ $clickable }) =>
    $clickable &&
    css`
      &:hover {
        filter: brightness(1.12);
      }
    `}
`;

const StyledTimestamp = styled.div<{ $size: TSizes }>`
  margin-top: 4px;
  font-size: ${({ $size }) => Math.max(TEXT_FROM_SIZE[$size] - 4, 9)}px;
  opacity: 0.55;
  text-align: right;
`;

// Only rendered when there's an avatar: holds the avatar and the bubble side by
// side and takes over the alignment, so both hug the same edge as one unit.
export const StyledBubbleRow = styled.div<{ $align: TReqoreBubbleAlign; $size: TSizes }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ $size }) => PADDING_FROM_SIZE[$size]}px;
  justify-content: ${({ $align }) => ($align === 'right' ? 'flex-end' : 'flex-start')};
`;

// The avatar echoes the bubble's own colour at the same strength a `minimal`
// bubble uses, so the pair reads as one object whatever the bubble is themed to.
export const StyledBubbleAvatar = styled.div<{
  theme: IReqoreTheme;
  $size: TSizes;
  $radiusSize?: TSizes;
  $coloured?: boolean;
}>`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: ${({ $size }) => SIZE_TO_PX[$size]}px;
  height: ${({ $size }) => SIZE_TO_PX[$size]}px;
  border-radius: ${({ $size, $radiusSize }) =>
    resolveRadius($size, $radiusSize, BUBBLE_AVATAR_RADIUS_FROM_SIZE)}px;
  background-color: ${({ theme, $coloured }) =>
    $coloured ? rgba(theme.main, 0.16) : rgba(changeLightness(theme.main, 0.5), 0.1)};
  color: ${({ theme }) => getReadableColor(theme)};
`;

const StyledBubbleHeader = styled.div<{ $size: TSizes }>`
  display: flex;
  align-items: baseline;
  gap: ${({ $size }) => PADDING_FROM_SIZE[$size]}px;
  margin-bottom: 4px;
`;

/**
 * A lightweight, themeable chat-style bubble. It sizes to its content (capped
 * by `maxWidth`) and hugs the left or right edge of its container via `align`.
 *
 * Like other Reqore surfaces it accepts `intent`, `customTheme`, `effect`
 * (including gradients), `flat`, `minimal` and `raised`. Stack a column of these
 * (see `ReqoreBubbleGroup`) for a chat transcript.
 *
 * An optional `avatar` sits outside the bubble on the aligned side, and optional
 * `title` / `detail` render as an inline header — enough for a comment feed
 * without reaching for `ReqoreComment`, which is a full-width panel with room
 * for actions rather than an aligned, content-width bubble.
 */
export const ReqoreBubble = memo(
  forwardRef<HTMLDivElement, IReqoreBubbleProps>(
    (
      {
        align = 'left',
        maxWidth = '85%',
        intent,
        customTheme,
        inheritCustomTheme,
        minimal,
        flat = true,
        rounded = true,
        radiusSize,
        groupPosition = 'single',
        raised,
        avatar,
        title,
        detail,
        titleEffect,
        detailEffect,
        timestamp,
        size = 'normal',
        effect,
        contentEffect,
        onClick,
        className,
        style,
        children,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const showRaised = !!raised && flat !== false && !intent;
      const coloured = !!intent || !!customTheme;
      const isSet = (value: ReactNode) => value != null && value !== '';
      const hasHeader = isSet(title) || isSet(detail);

      const bubbleEffect: IReqoreEffect | undefined =
        onClick || effect ? { interactive: !!onClick, ...effect } : undefined;

      // The header's spans are memoised components, so their merged effect has to
      // keep its identity between renders — a fresh literal would re-render them
      // on every parent render. The caller's effect still wins on conflicts.
      const resolvedTitleEffect = useMemo<IReqoreEffect>(
        () => ({ weight: 'bold', ...titleEffect }),
        [titleEffect]
      );
      const resolvedDetailEffect = useMemo<IReqoreEffect>(
        () => ({ opacity: 0.5, ...detailEffect }),
        [detailEffect]
      );

      const bubble = (
        <StyledBubble
          {...rest}
          as='div'
          ref={ref}
          onClick={onClick}
          theme={theme}
          effect={bubbleEffect}
          // Standalone, the bubble carries the caller's style; inside an avatar
          // row the row carries it, so a group's spacing offsets the whole pair
          // rather than sliding the bubble out of line with its avatar.
          style={avatar ? undefined : style}
          $size={size}
          $align={align}
          $maxWidth={maxWidth}
          $groupPosition={groupPosition}
          $minimal={minimal}
          $flat={flat}
          $rounded={rounded}
          $radiusSize={radiusSize}
          $raised={showRaised}
          $clickable={!!onClick}
          $coloured={coloured}
          $hasGradient={!!effect?.gradient}
          $inRow={!!avatar}
          className={`${className || ''} reqore-bubble`.trim()}
        >
          {hasHeader && (
            <StyledBubbleHeader $size={size} className='reqore-bubble-header'>
              {isSet(title) && (
                <ReqoreSpan
                  className='reqore-bubble-title'
                  size={size}
                  effect={resolvedTitleEffect}
                >
                  {title}
                </ReqoreSpan>
              )}
              {isSet(detail) && (
                <ReqoreSpan
                  className='reqore-bubble-detail'
                  size={getOneLessSize(size)}
                  effect={resolvedDetailEffect}
                >
                  {detail}
                </ReqoreSpan>
              )}
            </StyledBubbleHeader>
          )}
          {contentEffect ? <ReqoreEffect effect={contentEffect}>{children}</ReqoreEffect> : children}
          {timestamp != null && timestamp !== '' && (
            <StyledTimestamp $size={size}>{timestamp}</StyledTimestamp>
          )}
        </StyledBubble>
      );

      if (!avatar) {
        return bubble;
      }

      const avatarNode = (
        <StyledBubbleAvatar
          theme={theme}
          $size={size}
          $radiusSize={radiusSize}
          $coloured={coloured}
          className='reqore-bubble-avatar'
        >
          <ReqoreIcon
            icon={avatar.icon}
            image={avatar.image}
            size={size}
            // an image fills the avatar box; a glyph keeps its natural size, centred
            wrapperSize={avatar.image ? `${SIZE_TO_PX[size]}px` : undefined}
          />
        </StyledBubbleAvatar>
      );

      return (
        <StyledBubbleRow $align={align} $size={size} style={style} className='reqore-bubble-row'>
          {align === 'left' && avatarNode}
          {bubble}
          {align === 'right' && avatarNode}
        </StyledBubbleRow>
      );
    }
  )
);

ReqoreBubble.displayName = 'ReqoreBubble';

export interface IReqoreBubbleGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Gap between consecutive bubbles within the same side-run. */
  gap?: string;
  /** Gap inserted where the side switches (one cluster ends, another starts). */
  groupGap?: string;
  children?: ReactNode;
}

const StyledBubbleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

/**
 * Lays out a column of `ReqoreBubble`s and assigns each one a `groupPosition`
 * based on consecutive `align` values, so runs of same-side bubbles render as
 * one cluster with tightened inner corners. Also spaces clusters apart.
 */
export const ReqoreBubbleGroup = ({
  children,
  gap = '2px',
  groupGap = '12px',
  ...rest
}: IReqoreBubbleGroupProps) => {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<
    IReqoreBubbleProps
  >[];

  return (
    <StyledBubbleGroup {...rest}>
      {items.map((child, index) => {
        const align = child.props.align ?? 'left';
        const prevAlign = index > 0 ? items[index - 1].props.align ?? 'left' : null;
        const nextAlign =
          index < items.length - 1 ? items[index + 1].props.align ?? 'left' : null;
        const samePrev = prevAlign === align;
        const sameNext = nextAlign === align;

        let groupPosition: TReqoreBubbleGroupPosition = 'single';
        if (samePrev && sameNext) groupPosition = 'middle';
        else if (!samePrev && sameNext) groupPosition = 'first';
        else if (samePrev && !sameNext) groupPosition = 'last';

        return cloneElement(child, {
          key: child.key ?? index,
          groupPosition,
          style: {
            marginTop: index === 0 ? undefined : samePrev ? gap : groupGap,
            ...child.props.style,
          },
        });
      })}
    </StyledBubbleGroup>
  );
};

export default ReqoreBubble;
