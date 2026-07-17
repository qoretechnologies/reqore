import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  useMemo,
  type CSSProperties,
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
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, ReqoreEffect, StyledEffect } from '../Effect';
import ReqoreIcon from '../Icon';
import { ReqoreSpan } from '../Span';

// Hoisted so the memoised timestamp span keeps a stable `effect` identity.
// 0.35 matches Qonsole's timestamp — fainter than the label, clearly secondary.
const TIMESTAMP_EFFECT: IReqoreEffect = { opacity: 0.35 };

export type TReqoreBubbleAlign = 'left' | 'right';
export type TReqoreBubbleGroupPosition = 'single' | 'first' | 'middle' | 'last';

export interface IReqoreBubbleAvatar {
  /** Icon glyph shown in the avatar. Ignored when `image` is set. */
  icon?: IReqoreIconName;
  /** Image shown in the avatar — a user photo, an app logo, … */
  image?: string;
}

export interface IReqoreBubbleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'color'>,
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
  label?: ReactNode;
  /** Effect applied to `label` — merged over its bold default. */
  labelEffect?: IReqoreEffect;
  /**
   * Muted timestamp rendered *below* the bubble, hugging the same side. Inside a
   * `ReqoreBubbleGroup` only the last bubble of a same-side run renders it, so a
   * cluster of messages reads as one moment rather than repeating the time.
   */
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
  /** Whether a wrapper (avatar row / timestamp stack) owns the alignment. */
  $wrapped?: boolean;
  /** Whether a timestamp stack wraps the bubble and carries the width cap. */
  $stacked?: boolean;
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
  /* Inside a timestamp stack the wrapper carries the cap and the bubble fills it;
     standalone (or directly in the avatar row) the bubble carries it. */
  max-width: ${({ $stacked, $maxWidth }) => ($stacked ? '100%' : $maxWidth)};
  /* Standalone, the bubble aligns itself; once wrapped, the wrapper does. */
  margin-left: ${({ $align, $wrapped }) => (!$wrapped && $align === 'right' ? 'auto' : 0)};
  margin-right: ${({ $align, $wrapped }) => (!$wrapped && $align === 'left' ? 'auto' : 0)};
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

// The below-bubble timestamp, styled the way Qonsole treats its own: a small
// inset so it doesn't sit hard against the bubble's edge, and non-selectable so
// dragging across the transcript skips the clock. `padding`/`user-select` aren't
// ReqoreSpan props, which is why this is a styled wrapper rather than props.
const StyledBubbleTimestamp = styled(ReqoreSpan)`
  padding: 2px 4px;
  user-select: none;
`;

/**
 * A lightweight, themeable chat-style bubble. It sizes to its content (capped
 * by `maxWidth`) and hugs the left or right edge of its container via `align`.
 *
 * Like other Reqore surfaces it accepts `intent`, `customTheme`, `effect`
 * (including gradients), `flat`, `minimal` and `raised`. Stack a column of these
 * (see `ReqoreBubbleGroup`) for a chat transcript.
 *
 * An optional `avatar` sits outside the bubble on the aligned side and an optional
 * `label` reads as a bold lead-in — enough for a comment feed without reaching for
 * `ReqoreComment`, which is a full-width panel with room for actions rather than an
 * aligned, content-width bubble. A `timestamp` prints below the bubble, and inside
 * a `ReqoreBubbleGroup` only the last bubble of a same-side run shows one, so a
 * cluster reads as a single moment.
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
        label,
        labelEffect,
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
      // A run of same-side bubbles shares one time, printed under its last one —
      // the way conversational UIs read a cluster as a single moment.
      const showTimestamp =
        isSet(timestamp) && (groupPosition === 'single' || groupPosition === 'last');
      // Only the timestamp needs the bubble stacked under something; an avatar
      // needs it beside one. Either way a wrapper owns the alignment from here.
      const wrapped = !!avatar || showTimestamp;

      const bubbleEffect: IReqoreEffect | undefined =
        onClick || effect ? { interactive: !!onClick, ...effect } : undefined;

      // The label is a memoised component, so its merged effect has to keep its
      // identity between renders — a fresh literal would re-render it on every
      // parent render. The caller's effect still wins on conflicts.
      const resolvedLabelEffect = useMemo<IReqoreEffect>(
        () => ({ weight: 'bold', ...labelEffect }),
        [labelEffect]
      );

      // The wrappers are memoised ControlGroups, so their `style` has to keep a
      // stable identity between renders. The stack carries the width cap (and can
      // shrink); the row just lets its children shrink past the aligned edge.
      const stackStyle = useMemo<CSSProperties>(
        () => ({ minWidth: 0, maxWidth, ...(avatar ? undefined : style) }),
        [maxWidth, avatar, style]
      );
      const rowStyle = useMemo<CSSProperties>(() => ({ minWidth: 0, ...style }), [style]);

      const bubble = (
        <StyledBubble
          {...rest}
          as='div'
          ref={ref}
          onClick={onClick}
          theme={theme}
          effect={bubbleEffect}
          // Standalone, the bubble carries the caller's style; once wrapped, the
          // wrapper carries it, so a group's spacing offsets the whole unit
          // rather than sliding the bubble out of line with its avatar or time.
          style={wrapped ? undefined : style}
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
          $wrapped={wrapped}
          $stacked={showTimestamp}
          className={`${className || ''} reqore-bubble`.trim()}
        >
          {isSet(label) && (
            <StyledBubbleHeader $size={size} className='reqore-bubble-header'>
              <ReqoreSpan className='reqore-bubble-label' size={size} effect={resolvedLabelEffect}>
                {label}
              </ReqoreSpan>
            </StyledBubbleHeader>
          )}
          {contentEffect ? <ReqoreEffect effect={contentEffect}>{children}</ReqoreEffect> : children}
        </StyledBubble>
      );

      const timestampNode = showTimestamp ? (
        <StyledBubbleTimestamp
          className='reqore-bubble-timestamp'
          size={getOneLessSize(size)}
          effect={TIMESTAMP_EFFECT}
        >
          {timestamp}
        </StyledBubbleTimestamp>
      ) : null;

      // Nothing to hang off the bubble — render it bare, exactly as it did before
      // `avatar` and the below-bubble timestamp existed.
      if (!wrapped) {
        return bubble;
      }

      const avatarNode = avatar ? (
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
      ) : null;

      // The time hangs off the bubble, not off the row — otherwise it lines up
      // under the avatar instead of under the message it belongs to. The stack
      // carries the width cap (the bubble fills it at 100%) and can shrink
      // (`min-width: 0`), so a capped bubble still wraps rather than overflowing.
      const stack = showTimestamp ? (
        <ReqoreControlGroup
          vertical
          gapSize='tiny'
          horizontalAlign={align === 'right' ? 'flex-end' : 'flex-start'}
          style={stackStyle}
          className='reqore-bubble-stack'
        >
          {bubble}
          {timestampNode}
        </ReqoreControlGroup>
      ) : (
        bubble
      );

      if (!avatar) {
        return stack;
      }

      return (
        <ReqoreControlGroup
          verticalAlign='flex-start'
          gapSize={size}
          // let the stack/bubble shrink instead of pushing off the aligned edge
          style={rowStyle}
          horizontalAlign={align === 'right' ? 'flex-end' : 'flex-start'}
          className='reqore-bubble-row'
        >
          {align === 'left' && avatarNode}
          {stack}
          {align === 'right' && avatarNode}
        </ReqoreControlGroup>
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
