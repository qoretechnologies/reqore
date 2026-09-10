import { animated, useTransition } from '@react-spring/web';
import { getLuminance, rgba } from 'polished';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { SPRING_CONFIG } from '../../constants/animations';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import {
  changeDarkness,
  changeLightness,
  getNotificationIntent,
  getReadableColor,
  getReadableColorFrom,
} from '../../helpers/colors';
import { getOneLessSize, resolvePadding, TReqorePadded } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { RAISED_SHADOWS } from '../../styles';
import {
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreMinimal,
  IWithReqoreOpaque,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { StyledEffect, TReqoreEffectColor, TReqoreHexColor } from '../Effect';
import { ICON_TILE_SIZE_FROM_SIZE } from '../EntityRow';
import ReqoreIcon from '../Icon';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import { ReqoreSpinner } from '../Spinner';
import { IReqoreNotificationsPosition } from './index';
import { IReqoreNotificationType, typeToIcon } from './styles';

/**
 * A notification: frosted glass over whatever is behind it, the intent as a
 * soft bloom behind the icon and a thin line along the bottom that drains as
 * the duration runs out. The surface stays neutral, so a stack of mixed
 * intents reads as one family.
 *
 * `compact` is the one-line form — a pill with the icon, a sentence and an
 * inline action — for acknowledgements ("Saved", "Copied"). It keeps the
 * bloom and drops the timer line.
 *
 * By default the surface is `flat` (no border, no drop shadow) and `raised`
 * (an inset highlight along the top edge). `flat={false}` adds a hairline
 * border, a faint intent ring and a drop shadow; `minimal` removes the
 * surface altogether; `opaque` makes it solid.
 *
 * The classic message-styled surface lives in `./styles` and is used by
 * `ReqoreMessage`; it is re-exported here for anyone who imported it from
 * this module.
 */

export type { IReqoreNotificationStyle, IReqoreNotificationType } from './styles';
export {
  StyledIconWrapper,
  StyledNotificationContent,
  StyledNotificationContentWrapper,
  StyledNotificationInnerContent,
  StyledNotificationTitle,
  StyledReqoreNotification,
  typeToIcon,
} from './styles';

export interface IReqoreNotificationAction
  extends Omit<IReqoreButtonProps, 'onClick' | 'label' | 'children'> {
  label: string;
  onClick?: () => void;
  /** Close the notification once the action ran. Default `true`. */
  closeOnClick?: boolean;
}

export interface IReqoreNotificationProps
  extends IWithReqoreEffect,
    IWithReqoreMinimal,
    IWithReqoreOpaque,
    IWithReqoreCustomTheme {
  /** The intent, under its older name. `intent` wins when both are given. */
  type?: IReqoreNotificationType;
  intent?: TReqoreIntent;
  title?: string;
  content?: string | React.ReactNode;
  /** Replaces the intent's icon. */
  icon?: IReqoreIconName;
  iconColor?: TReqoreEffectColor;
  /**
   * Draws the icon on a round, intent-tinted tile. Default `true`; `compact`
   * shows the bare icon unless this is set.
   */
  iconHasBackground?: boolean;
  onClose?: () => any;
  onClick?: () => any;
  /** Milliseconds until `onFinish`; nothing when unset. */
  duration?: number;
  onFinish?: () => any;
  fluid?: boolean;
  /** No border and no drop shadow. Default `true`. */
  flat?: boolean;
  /** An inset highlight along the top edge. Default `true`; only on a `flat` surface. */
  raised?: boolean;
  size?: TSizes;
  /** Backdrop blur radius in px. Default `18`; `0` turns the frost off. */
  blur?: number;
  /**
   * Controls which axes receive the notification's padding.
   * - `true` (default): padding on both axes
   * - `false`: no padding
   * - `'horizontal'`: only left/right padding
   * - `'vertical'`: only top/bottom padding
   */
  padded?: TReqorePadded;
  /** Size of the notification's padding. Defaults to `size`. */
  paddingSize?: TSizes;
  /** The one-line pill form. */
  compact?: boolean;
  /** Buttons under the content; inline when `compact`. `minimal flat raised` by default. */
  actions?: IReqoreNotificationAction[];
  /**
   * Holds the auto-dismiss timer while the pointer is over the notification,
   * so a reader gets to finish the sentence. Default `true`.
   */
  pauseOnHover?: boolean;
  /**
   * The thin line along the bottom that drains as the duration runs out.
   * Default `true` with a duration; `compact` has none unless this is set.
   */
  showProgress?: boolean;
  /** Accessible name of the close button. */
  closeLabel?: string;
}

/**
 * Defaults every notification added through the provider starts from — set
 * once on `ReqoreUIProvider` (`options.notifications`) to give the whole app
 * one look and one corner. A notification's own props win.
 */
export interface IReqoreNotificationDefaults
  extends Partial<
    Pick<
      IReqoreNotificationProps,
      | 'compact'
      | 'size'
      | 'flat'
      | 'raised'
      | 'minimal'
      | 'opaque'
      | 'blur'
      | 'effect'
      | 'duration'
      | 'pauseOnHover'
      | 'showProgress'
      | 'iconHasBackground'
      | 'closeLabel'
    >
  > {
  position?: IReqoreNotificationsPosition;
}

/* ---------------------------------------------------------------------------
 * Styles
 * ------------------------------------------------------------------------ */

const DARK: TReqoreHexColor = '#000000';
const LIGHT: TReqoreHexColor = '#ffffff';

interface IStyledNotificationProps {
  theme: IReqoreTheme;
  $size: TSizes;
  $compact?: boolean;
  $fluid?: boolean;
  $flat: boolean;
  $raised: boolean;
  $minimal?: boolean;
  $opaque?: boolean;
  $blur: number;
  $clickable?: boolean;
  $hasIcon?: boolean;
  $hasIntent?: boolean;
  $padded: TReqorePadded;
  $paddingSize: TSizes;
  /** The neutral surface. */
  $surface: TReqoreHexColor;
  /** Text on the surface. */
  $text: TReqoreHexColor;
  /** The intent colour, or a neutral stand-in. */
  $accent: TReqoreHexColor;
}

export const StyledNotification = styled(StyledEffect)<IStyledNotificationProps>`
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  transition:
    filter 0.2s ease-out,
    box-shadow 0.2s ease-out;
  color: ${({ $text }) => $text};

  /* ---- shape ---- */
  ${({ $compact, $size, $fluid, $hasIcon, $padded, $paddingSize }) => {
    const gap = Math.round(PADDING_FROM_SIZE[$size] * 0.8);

    if ($compact) {
      return css`
        display: flex;
        align-items: center;
        gap: ${Math.round(gap * 0.75)}px;
        padding: ${resolvePadding({
          padded: $padded,
          paddingSize: $paddingSize,
          verticalMultiplier: 0.5,
          horizontalMultiplier: 0.8,
        })};
        border-radius: 999px;
        width: ${$fluid ? '100%' : 'fit-content'};
        max-width: ${$fluid ? 'none' : 'min(520px, calc(100vw - 60px))'};
      `;
    }

    return css`
      display: grid;
      grid-template-columns: ${$hasIcon ? 'auto minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto'};
      column-gap: ${gap}px;
      align-items: start;
      padding: ${resolvePadding({
        padded: $padded,
        paddingSize: $paddingSize,
        verticalMultiplier: 1,
        horizontalMultiplier: 1,
      })};
      border-radius: ${RADIUS_FROM_SIZE[$size] + 4}px;
      width: ${$fluid ? '100%' : 'min(400px, calc(100vw - 60px))'};
    `;
  }}

  /* ---- surface ---- */
  ${({ $minimal, $opaque, $blur, $flat, $raised, $surface, $accent, $hasIntent }) => {
    if ($minimal) {
      return css`
        background: transparent;
        border: 0;
      `;
    }

    const shadows: string[] = [];

    if (!$flat) {
      if ($hasIntent) {
        shadows.push(`0 0 0 1px ${rgba($accent, 0.28)}`);
      }

      shadows.push(`0 20px 44px -16px ${rgba(DARK, 0.65)}`);
    } else if ($raised) {
      shadows.push(RAISED_SHADOWS);
    }

    return css`
      background: ${rgba($surface, $opaque ? 1 : 0.74)};
      ${!$opaque &&
      $blur > 0 &&
      css`
        backdrop-filter: blur(${$blur}px) saturate(1.5);
        -webkit-backdrop-filter: blur(${$blur}px) saturate(1.5);
      `}
      border: ${$flat ? 0 : `1px solid ${rgba(LIGHT, 0.12)}`};
      box-shadow: ${shadows.length ? shadows.join(', ') : 'none'};
    `;
  }}

  &:not(:first-child) {
    margin-top: ${({ $size }) => PADDING_FROM_SIZE[$size]}px;
  }

  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;

      &:hover {
        filter: brightness(1.08);
      }
    `}
`;

/** The intent, as a soft glow behind the icon. */
const StyledNotificationBloom = styled.div<{ $color: TReqoreHexColor; $compact?: boolean }>`
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(6px);
  ${({ $compact }) =>
    $compact
      ? css`
          width: 120px;
          height: 120px;
          left: -45px;
          top: -60px;
        `
      : css`
          width: 170px;
          height: 170px;
          left: -60px;
          top: -80px;
        `}
  background: radial-gradient(
    circle at center,
    ${({ $color }) => rgba($color, 0.55)} 0%,
    ${({ $color }) => rgba($color, 0)} 70%
  );
`;

const StyledNotificationIconTile = styled.div<{
  $size: TSizes;
  $color: TReqoreHexColor;
  $tinted: boolean;
}>`
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => ICON_TILE_SIZE_FROM_SIZE[$size]}px;
  height: ${({ $size }) => ICON_TILE_SIZE_FROM_SIZE[$size]}px;
  border-radius: 50%;
  background: ${({ $tinted, $color }) => ($tinted ? rgba($color, 0.2) : 'transparent')};
`;

const StyledNotificationBody = styled.div<{ $compact?: boolean }>`
  position: relative;
  z-index: 1;
  min-width: 0;
  display: flex;
  flex-flow: ${({ $compact }) => ($compact ? 'row wrap' : 'column')};
  align-items: ${({ $compact }) => ($compact ? 'baseline' : 'stretch')};
  justify-content: center;
  gap: ${({ $compact }) => ($compact ? '0 6px' : '2px')};
  align-self: center;
  overflow-wrap: anywhere;
`;

const StyledNotificationText = styled.div<{ $size: TSizes; $dim: boolean }>`
  font-size: ${({ $size }) => TEXT_FROM_SIZE[getOneLessSize($size)]}px;
  line-height: 1.4;
  opacity: ${({ $dim }) => ($dim ? 0.78 : 1)};
`;

const StyledNotificationTrailing = styled.div`
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 2px;
  align-self: start;
`;

const drain = keyframes`
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
`;

const StyledNotificationProgress = styled.div<{
  $color: TReqoreHexColor;
  $duration: number;
  $paused: boolean;
  $height: number;
}>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${({ $height }) => $height}px;
  transform-origin: left center;
  background: ${({ $color }) => $color};
  animation: ${drain} ${({ $duration }) => $duration}ms linear forwards;
  animation-play-state: ${({ $paused }) => ($paused ? 'paused' : 'running')};
`;

/** Filled glyphs: on a tile a hairline check reads as a smudge. */
const INTENT_ICON: Partial<Record<TReqoreIntent, IReqoreIconName>> = {
  info: 'InformationFill',
  success: 'CheckboxCircleFill',
  warning: 'AlertFill',
  danger: 'ErrorWarningFill',
  muted: 'ForbidFill',
};

/** A theme colour may carry an alpha suffix (`muted` does); the paint helpers want six digits. */
const sixDigits = (color: string): TReqoreHexColor =>
  (color.length > 7 ? color.slice(0, 7) : color) as TReqoreHexColor;

const BIG_SIZES: TSizes[] = ['big', 'huge', 'massive'];

/* ---------------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------------ */

const ReqoreNotification = forwardRef<HTMLDivElement, IReqoreNotificationProps>(
  (
    {
      type,
      intent,
      icon,
      iconColor,
      iconHasBackground,
      title,
      content,
      onClose,
      onClick,
      duration,
      onFinish,
      flat = true,
      raised = true,
      minimal,
      opaque = false,
      blur = 18,
      size = 'normal',
      customTheme,
      inheritCustomTheme,
      padded = true,
      paddingSize,
      compact,
      actions,
      pauseOnHover = true,
      showProgress,
      closeLabel = 'Close',
      effect,
      fluid,
    },
    ref: any
  ) => {
    const resolvedIntent = intent || type;
    // The app's surface, not the intent's: the intent is painted on the icon,
    // the bloom and the timer line.
    const theme = useReqoreTheme(
      'main',
      customTheme,
      undefined,
      'notifications',
      inheritCustomTheme
    );

    const transitions = useTransition(true, {
      from: { opacity: 0, transform: 'scale(0.9)' },
      enter: { opacity: 1, transform: 'scale(1)' },
      leave: { opacity: 0, transform: 'scale(0.9)' },
      config: SPRING_CONFIG,
    });

    /* ---- auto-dismiss timer, held while hovered ---- */
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const remainingRef = useRef<number | undefined>(duration);
    const startedAtRef = useRef<number>(0);
    const onFinishRef = useRef(onFinish);
    onFinishRef.current = onFinish;
    const [paused, setPaused] = useState(false);

    const clearTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    }, []);

    const startTimer = useCallback(
      (ms?: number) => {
        clearTimer();

        if (!ms) {
          return;
        }

        startedAtRef.current = Date.now();
        timerRef.current = setTimeout(() => {
          onFinishRef.current?.();
        }, ms);
      },
      [clearTimer]
    );

    useEffect(() => {
      remainingRef.current = duration;
      setPaused(false);
      startTimer(duration);

      return clearTimer;
    }, [duration, type, intent, content, title, startTimer, clearTimer]);

    const handleMouseEnter = useCallback(() => {
      if (!pauseOnHover || !duration || !timerRef.current) {
        return;
      }

      remainingRef.current = Math.max(
        (remainingRef.current ?? duration) - (Date.now() - startedAtRef.current),
        0
      );
      clearTimer();
      setPaused(true);
    }, [pauseOnHover, duration, clearTimer]);

    const handleMouseLeave = useCallback(() => {
      if (!pauseOnHover || !duration) {
        return;
      }

      setPaused(false);
      // A reader who hovered at the very end still gets a beat to click.
      startTimer(Math.max(remainingRef.current ?? 0, 400));
    }, [pauseOnHover, duration, startTimer]);

    /* ---- colours ---- */
    const palette = useMemo(() => {
      const surface = changeLightness(theme.main, 0.05);
      const text = getReadableColor(theme, undefined, undefined, true);
      // `muted` is the readable colour at 30% alpha — as a bloom or a line it
      // would paint white — so it takes the neutral grey a notification
      // without an intent gets.
      const accent =
        resolvedIntent && resolvedIntent !== 'muted'
          ? sixDigits(getNotificationIntent(theme, resolvedIntent))
          : changeLightness(theme.main, 0.3);
      // The intents are mid-dark colours; on a dark surface an icon painted in
      // one, on a tile tinted with the same one, loses its edge. Lift it there,
      // deepen it on a light surface.
      const glyph =
        getLuminance(surface) < 0.4 ? changeLightness(accent, 0.18) : changeDarkness(accent, 0.1);

      return { surface, text, accent, glyph, onAccent: getReadableColorFrom(accent, false) };
    }, [theme, resolvedIntent]);

    const handleClose = useCallback(
      (event?: React.MouseEvent) => {
        event?.stopPropagation();
        onClose?.();
      },
      [onClose]
    );

    const hasIcon = !!(icon || resolvedIntent);
    const tinted = iconHasBackground ?? !compact;
    const controlSize = getOneLessSize(size);
    const progressVisible = !!duration && (showProgress ?? !compact);
    const iconNode =
      resolvedIntent === 'pending' && !icon ? (
        <ReqoreSpinner size={size} type={5} intent='pending' />
      ) : (
        <ReqoreIcon
          icon={icon || INTENT_ICON[resolvedIntent] || typeToIcon[resolvedIntent]}
          size={size}
          color={iconColor ?? palette.glyph}
        />
      );
    const actionButtons = actions?.length
      ? actions.map(({ label, onClick: onActionClick, closeOnClick, ...rest }, index) => (
          <ReqoreButton
            key={`${label}-${index}`}
            size={controlSize}
            minimal
            flat
            raised
            compact={compact}
            intent={index === 0 ? resolvedIntent : undefined}
            {...rest}
            onClick={(event) => {
              event.stopPropagation();
              onActionClick?.();

              if (closeOnClick !== false) {
                onClose?.();
              }
            }}
          >
            {label}
          </ReqoreButton>
        ))
      : null;

    return transitions((styles, item) =>
      item ? (
        <ReqoreThemeProvider>
          <StyledNotification
            as={animated.div}
            ref={ref}
            style={styles}
            theme={theme}
            effect={effect}
            role={resolvedIntent === 'danger' || resolvedIntent === 'warning' ? 'alert' : 'status'}
            className={`reqore-notification${compact ? ' reqore-notification-compact' : ''}`}
            $size={size}
            $compact={compact}
            $fluid={fluid}
            $flat={flat}
            $raised={raised}
            $minimal={minimal}
            $opaque={opaque}
            $blur={blur}
            $clickable={!!onClick}
            $hasIcon={hasIcon}
            $hasIntent={!!resolvedIntent}
            $padded={padded}
            $paddingSize={paddingSize ?? size}
            $surface={palette.surface}
            $text={palette.text}
            $accent={palette.accent}
            onClick={onClick ? () => onClick() : undefined}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {resolvedIntent && !minimal ? (
              <StyledNotificationBloom $color={palette.accent} $compact={compact} />
            ) : null}
            {hasIcon ? (
              compact && !tinted ? (
                iconNode
              ) : (
                <StyledNotificationIconTile
                  $size={compact ? getOneLessSize(size) : size}
                  $color={palette.accent}
                  $tinted={tinted}
                  className='reqore-notification-icon'
                >
                  {iconNode}
                </StyledNotificationIconTile>
              )
            ) : null}
            <StyledNotificationBody $compact={compact}>
              {title ? (
                compact ? (
                  <ReqoreSpan
                    size={controlSize}
                    effect={{ weight: 'bold', color: palette.text }}
                    className='reqore-notification-title'
                  >
                    {title}
                  </ReqoreSpan>
                ) : (
                  <ReqoreP
                    size={size}
                    effect={{ weight: 'bold', color: palette.text }}
                    className='reqore-notification-title'
                  >
                    {title}
                  </ReqoreP>
                )
              ) : null}
              {content ? (
                <StyledNotificationText
                  $size={size}
                  $dim={!!title}
                  className='reqore-notification-content'
                >
                  {content}
                </StyledNotificationText>
              ) : null}
              {actionButtons && !compact ? (
                <ReqoreControlGroup
                  size={controlSize}
                  gapSize='small'
                  wrap
                  style={{ marginTop: PADDING_FROM_SIZE[controlSize] }}
                  className='reqore-notification-actions'
                >
                  {actionButtons}
                </ReqoreControlGroup>
              ) : null}
            </StyledNotificationBody>
            {actionButtons && compact ? (
              <StyledNotificationTrailing className='reqore-notification-actions'>
                {actionButtons}
              </StyledNotificationTrailing>
            ) : null}
            {onClose ? (
              <StyledNotificationTrailing>
                <ReqoreButton
                  icon='CloseLine'
                  size={controlSize}
                  minimal
                  flat
                  compact
                  className='reqore-notification-close'
                  aria-label={closeLabel}
                  onClick={handleClose}
                />
              </StyledNotificationTrailing>
            ) : null}
            {progressVisible ? (
              <StyledNotificationProgress
                key={`${duration}${resolvedIntent}${title}${content}`}
                className='reqore-notification-progress'
                data-paused={paused || undefined}
                $color={palette.accent}
                $duration={duration}
                $paused={paused}
                $height={BIG_SIZES.includes(size) ? 3 : 2}
              />
            ) : null}
          </StyledNotification>
        </ReqoreThemeProvider>
      ) : null
    );
  }
);

export default ReqoreNotification;
