import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import { rgba } from 'polished';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
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
import { IReqoreEffect, ReqoreEffect, StyledEffect } from '../Effect';

export type TReqoreBubbleAlign = 'left' | 'right';
export type TReqoreBubbleGroupPosition = 'single' | 'first' | 'middle' | 'last';

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
  $raised?: boolean;
  $clickable?: boolean;
  /** Whether the bubble carries an intent or customTheme — i.e. its own colour. */
  $coloured?: boolean;
  /** Whether an `effect` gradient paints the background (then no solid fill). */
  $hasGradient?: boolean;
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
  margin-left: ${({ $align }) => ($align === 'right' ? 'auto' : 0)};
  margin-right: ${({ $align }) => ($align === 'left' ? 'auto' : 0)};
  padding: ${({ $size }) =>
    `${Math.round(PADDING_FROM_SIZE[$size] * 1.3)}px ${Math.round(
      PADDING_FROM_SIZE[$size] * 1.85
    )}px`};
  font-size: ${({ $size }) => TEXT_FROM_SIZE[$size]}px;
  line-height: 1.5;
  word-break: break-word;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background-color 0.15s ease-out, filter 0.15s ease-out;
  border-radius: ${({ $size, $rounded, $groupPosition, $align }) =>
    $rounded === false
      ? 0
      : groupRadius($groupPosition, $align, RADIUS_FROM_SIZE[$size] * 3, RADIUS_FROM_SIZE[$size])};

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

/**
 * A lightweight, themeable chat-style bubble. It sizes to its content (capped
 * by `maxWidth`) and hugs the left or right edge of its container via `align`.
 *
 * Like other Reqore surfaces it accepts `intent`, `customTheme`, `effect`
 * (including gradients), `flat`, `minimal` and `raised` — but carries none of
 * the avatar / title / action weight of `ReqoreComment`. Stack a column of
 * these (see `ReqoreBubbleGroup`) for a chat transcript.
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
        groupPosition = 'single',
        raised,
        timestamp,
        size = 'normal',
        effect,
        contentEffect,
        onClick,
        className,
        children,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const showRaised = !!raised && flat !== false && !intent;

      const bubbleEffect: IReqoreEffect | undefined =
        onClick || effect ? { interactive: !!onClick, ...effect } : undefined;

      return (
        <StyledBubble
          {...rest}
          as='div'
          ref={ref}
          onClick={onClick}
          theme={theme}
          effect={bubbleEffect}
          $size={size}
          $align={align}
          $maxWidth={maxWidth}
          $groupPosition={groupPosition}
          $minimal={minimal}
          $flat={flat}
          $rounded={rounded}
          $raised={showRaised}
          $clickable={!!onClick}
          $coloured={!!intent || !!customTheme}
          $hasGradient={!!effect?.gradient}
          className={`${className || ''} reqore-bubble`.trim()}
        >
          {contentEffect ? <ReqoreEffect effect={contentEffect}>{children}</ReqoreEffect> : children}
          {timestamp != null && timestamp !== '' && (
            <StyledTimestamp $size={size}>{timestamp}</StyledTimestamp>
          )}
        </StyledBubble>
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
