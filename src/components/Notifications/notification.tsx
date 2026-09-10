import { animated, useTransition } from '@react-spring/web';
import { getLuminance, rgba } from 'polished';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { SPRING_CONFIG } from '../../constants/animations';
import {
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { TReqoreHexColor } from '../Effect';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import {
  changeDarkness,
  changeLightness,
  getNotificationIntent,
  getReadableColor,
  getReadableColorFrom,
} from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { getOneLessSize, TReqorePadded } from '../../helpers/utils';
import {
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreMinimal,
  IWithReqoreOpaque,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreEffectColor } from '../Effect';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { StyledEffect } from '../Effect';
import { ICON_TILE_SIZE_FROM_SIZE } from '../EntityRow';
import { ReqoreHeading } from '../Header';
import ReqoreIcon from '../Icon';
import { IReqoreNotificationsPosition } from './index';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import { ReqoreSpinner } from '../Spinner';
import {
  IReqoreNotificationType,
  StyledIconWrapper,
  StyledNotificationContent,
  StyledNotificationContentWrapper,
  StyledNotificationInnerContent,
  StyledReqoreNotification,
  typeToIcon,
} from './styles';

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

/**
 * The looks a notification can take. Unset keeps the classic message-styled
 * box; every variant below paints the intent on the icon and the timer line
 * and keeps the surface itself neutral (except `filled`), so a stack of mixed
 * intents reads as one family.
 *
 * - `card`    — a neutral card with a hairline border, the icon on a tinted
 *               tile and the timer as a line along the bottom (Sonner, Radix).
 * - `accent`  — the card with a short intent-coloured bar down its left edge
 *               and a plain icon (Mantine).
 * - `filled`  — the whole surface in the intent colour; for the loud ones
 *               (Chakra).
 * - `glass`   — frosted, translucent, an intent bloom behind the icon and a
 *               faint intent ring; Reqore's own look (iOS banners, Vercel).
 * - `compact` — a one-line pill for acknowledgements — "Saved", "Copied" —
 *               with an inline action (Material snackbar, Linear).
 */
export type TReqoreNotificationVariant = 'card' | 'accent' | 'filled' | 'glass' | 'compact';

export interface IReqoreNotificationAction
  extends Omit<IReqoreButtonProps, 'onClick' | 'label' | 'children'> {
  label: string;
  onClick?: () => void;
  /** Close the notification once the action ran. Default `true`. */
  closeOnClick?: boolean;
}

/**
 * Defaults every notification added through the provider starts from — set
 * once on `ReqoreUIProvider` (`options.notifications`) to give the whole app
 * one look. A notification's own props win.
 */
export interface IReqoreNotificationDefaults
  extends Partial<
    Pick<
      IReqoreNotificationProps,
      | 'variant'
      | 'size'
      | 'pauseOnHover'
      | 'showProgress'
      | 'iconHasBackground'
      | 'flat'
      | 'minimal'
      | 'opaque'
      | 'blur'
      | 'effect'
      | 'duration'
      | 'closeLabel'
    >
  > {
  position?: IReqoreNotificationsPosition;
}

export interface IReqoreNotificationProps
  extends IWithReqoreEffect,
    IWithReqoreMinimal,
    IWithReqoreOpaque,
    IWithReqoreCustomTheme {
  type?: IReqoreNotificationType;
  intent?: TReqoreIntent;
  title?: string;
  content: string | React.ReactNode;
  icon?: IReqoreIconName;
  onClose?: () => any;
  onClick?: () => any;
  duration?: number;
  onFinish?: () => any;
  fluid?: boolean;
  flat?: boolean;
  size?: TSizes;
  blur?: number;
  /**
   * Controls which axes receive the notification's outer padding.
   * - `true` (default): padding on both axes
   * - `false`: no padding
   * - `'horizontal'`: only left/right padding
   * - `'vertical'`: only top/bottom padding
   */
  padded?: TReqorePadded;
  /**
   * Size of the notification's outer padding. Defaults to `size`.
   */
  paddingSize?: TSizes;
  /** The look — see `TReqoreNotificationVariant`. Unset keeps the classic box. */
  variant?: TReqoreNotificationVariant;
  /** Buttons under the content; inline in the `compact` variant. */
  actions?: IReqoreNotificationAction[];
  /**
   * Draws the icon on an intent-tinted tile. `card`, `filled` and `glass`
   * do this on their own; pass `false` to turn it off, `true` to get it on
   * `accent`.
   */
  iconHasBackground?: boolean;
  iconColor?: TReqoreEffectColor;
  /**
   * Holds the auto-dismiss timer while the pointer is over the notification,
   * so a reader gets to finish the sentence. Default `true` for variants,
   * `false` for the classic box (which never did).
   */
  pauseOnHover?: boolean;
  /**
   * The thin line that drains as the duration runs out. Default `true`
   * whenever there is a duration.
   */
  showProgress?: boolean;
  /** Accessible name of the close button. */
  closeLabel?: string;
}

/* ---------------------------------------------------------------------------
 * Variants
 * ------------------------------------------------------------------------ */

interface IReqoreNotificationVariantStyle {
  theme: IReqoreTheme;
  $variant: TReqoreNotificationVariant;
  $size: TSizes;
  $fluid?: boolean;
  $clickable?: boolean;
  $hasIcon?: boolean;
  $hasIntent?: boolean;
  /** The neutral surface behind every variant but `filled`. */
  $surface: TReqoreHexColor;
  /** Text on `$surface`. */
  $text: TReqoreHexColor;
  /** The intent colour, or a neutral stand-in when there is no intent. */
  $accent: TReqoreHexColor;
  /** Text on `$accent` (the `filled` variant). */
  $filledText: TReqoreHexColor;
}

const DARK: TReqoreHexColor = '#000000';
const LIGHT: TReqoreHexColor = '#ffffff';

const variantSurface = ({
  $variant,
  $surface,
  $text,
  $accent,
  $filledText,
  $hasIntent,
}: IReqoreNotificationVariantStyle) => {
  const hairline = rgba($text, 0.12);
  const lift = `0 14px 34px -14px ${rgba(DARK, 0.6)}`;

  switch ($variant) {
    case 'filled':
      return css`
        background: linear-gradient(135deg, ${$accent}, ${changeLightness($accent, 0.06)});
        border: 1px solid ${rgba(LIGHT, 0.18)};
        box-shadow: 0 14px 34px -14px ${rgba($accent, 0.7)};
        color: ${$filledText};
      `;
    case 'glass':
      return css`
        background: ${rgba($surface, 0.74)};
        backdrop-filter: blur(18px) saturate(1.5);
        -webkit-backdrop-filter: blur(18px) saturate(1.5);
        border: 1px solid ${rgba(LIGHT, 0.12)};
        box-shadow:
          0 0 0 1px ${$hasIntent ? rgba($accent, 0.28) : 'transparent'},
          0 20px 44px -16px ${rgba(DARK, 0.65)};
        color: ${$text};
      `;
    case 'accent':
      return css`
        background: ${$surface};
        border: 1px solid ${hairline};
        box-shadow: ${lift};
        color: ${$text};

        &::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 9px;
          bottom: 9px;
          width: 3px;
          border-radius: 3px;
          background: ${$hasIntent ? $accent : rgba($text, 0.3)};
        }
      `;
    case 'compact':
    case 'card':
    default:
      return css`
        background: ${$surface};
        border: 1px solid ${hairline};
        box-shadow:
          ${lift},
          inset 0 1px 0 ${rgba(LIGHT, 0.04)};
        color: ${$text};
      `;
  }
};

export const StyledReqoreNotificationVariant = styled(StyledEffect)<IReqoreNotificationVariantStyle>`
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  transition: filter 0.2s ease-out;

  ${({ $variant, $size, $fluid, $hasIcon }) => {
    const pad = PADDING_FROM_SIZE[$size];

    if ($variant === 'compact') {
      return css`
        display: inline-flex;
        align-items: center;
        gap: ${Math.round(pad * 0.6)}px;
        padding: ${Math.round(pad * 0.5)}px ${Math.round(pad * 0.6)}px ${Math.round(pad * 0.5)}px
          ${pad}px;
        border-radius: 999px;
        width: ${$fluid ? '100%' : 'auto'};
        max-width: min(520px, calc(100vw - 60px));
      `;
    }

    return css`
      display: grid;
      grid-template-columns: ${$hasIcon ? 'auto minmax(0, 1fr) auto' : 'minmax(0, 1fr) auto'};
      column-gap: ${Math.round(pad * 0.8)}px;
      align-items: start;
      padding: ${pad}px ${Math.round(pad * 0.8)}px ${pad}px
        ${$variant === 'accent' ? pad + 10 : pad}px;
      border-radius: ${RADIUS_FROM_SIZE[$size] + 4}px;
      width: ${$fluid ? '100%' : 'min(400px, calc(100vw - 60px))'};
    `;
  }}

  ${variantSurface}

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

const StyledNotificationBloom = styled.div<{ $color: TReqoreHexColor }>`
  position: absolute;
  pointer-events: none;
  width: 170px;
  height: 170px;
  left: -60px;
  top: -80px;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    ${({ $color }) => rgba($color, 0.55)} 0%,
    ${({ $color }) => rgba($color, 0)} 70%
  );
  filter: blur(6px);
`;

const StyledNotificationIconTile = styled.div<{
  $size: TSizes;
  $color: TReqoreHexColor;
  $tinted: boolean;
  $round: boolean;
  $onFilled: boolean;
}>`
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => ICON_TILE_SIZE_FROM_SIZE[$size]}px;
  height: ${({ $size }) => ICON_TILE_SIZE_FROM_SIZE[$size]}px;
  border-radius: ${({ $round, $size }) => ($round ? '50%' : `${RADIUS_FROM_SIZE[$size]}px`)};
  background: ${({ $tinted, $onFilled, $color }) =>
    !$tinted ? 'transparent' : $onFilled ? rgba(LIGHT, 0.18) : rgba($color, 0.2)};
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

const VARIANT_ICON: Record<
  TReqoreNotificationVariant,
  { hasBackground: boolean; round: boolean }
> = {
  card: { hasBackground: true, round: false },
  accent: { hasBackground: false, round: false },
  filled: { hasBackground: true, round: false },
  glass: { hasBackground: true, round: true },
  compact: { hasBackground: false, round: false },
};

/** Filled glyphs: on a tile or a pill a hairline check reads as a smudge. */
const VARIANT_TYPE_ICON: Partial<Record<TReqoreIntent, IReqoreIconName>> = {
  info: 'InformationFill',
  success: 'CheckboxCircleFill',
  warning: 'AlertFill',
  danger: 'ErrorWarningFill',
  muted: 'ForbidFill',
};

/** A theme colour may carry an alpha suffix (`muted` does); the paint helpers want six digits. */
const sixDigits = (color: string): TReqoreHexColor =>
  (color.length > 7 ? color.slice(0, 7) : color) as TReqoreHexColor;


const ReqoreNotification = forwardRef<HTMLDivElement, IReqoreNotificationProps>(
  (
    {
      type,
      intent,
      icon,
      iconColor,
      title,
      content,
      onClose,
      onClick,
      duration,
      onFinish,
      flat,
      minimal,
      opaque = true,
      blur,
      size = 'normal',
      customTheme,
      inheritCustomTheme,
      padded = true,
      paddingSize,
      variant,
      actions,
      iconHasBackground,
      pauseOnHover,
      showProgress,
      closeLabel = 'Close',
      effect,
      fluid,
    },
    ref: any
  ) => {
    const resolvedIntent = intent || type;
    // The classic box paints its surface in the intent (the theme hook swaps
    // `main` for it); a variant keeps the app's surface and paints the intent
    // on the icon, the bar and the timer line instead.
    const theme = useReqoreTheme(
      'main',
      customTheme,
      resolvedIntent,
      'notifications',
      inheritCustomTheme
    );
    const surfaceTheme = useReqoreTheme(
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

    /* ---- auto-dismiss timer, with an optional hold while hovered ---- */
    const shouldPause = pauseOnHover ?? !!variant;
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
      if (!shouldPause || !duration || !timerRef.current) {
        return;
      }

      remainingRef.current = Math.max(
        (remainingRef.current ?? duration) - (Date.now() - startedAtRef.current),
        0
      );
      clearTimer();
      setPaused(true);
    }, [shouldPause, duration, clearTimer]);

    const handleMouseLeave = useCallback(() => {
      if (!shouldPause || !duration) {
        return;
      }

      setPaused(false);
      // A reader who hovered at the very end still gets a beat to click.
      startTimer(Math.max(remainingRef.current ?? 0, 400));
    }, [shouldPause, duration, startTimer]);

    /* ---- the colours a variant paints with ---- */
    const palette = useMemo(() => {
      const surface = changeLightness(surfaceTheme.main, 0.05);
      const text = getReadableColor(surfaceTheme, undefined, undefined, true);
      const accent = resolvedIntent
        ? sixDigits(getNotificationIntent(surfaceTheme, resolvedIntent))
        : changeLightness(surfaceTheme.main, 0.3);

      // The intents are mid-dark colours; on a dark surface an icon painted in
      // one, on a tile tinted with the same one, loses its edge. Lift it there,
      // deepen it on a light surface.
      const glyph =
        getLuminance(surface) < 0.4 ? changeLightness(accent, 0.18) : changeDarkness(accent, 0.1);

      return { surface, text, accent, glyph, filledText: getReadableColorFrom(accent, false) };
    }, [surfaceTheme, resolvedIntent]);

    const handleClose = useCallback(
      (event?: React.MouseEvent) => {
        event?.stopPropagation();
        onClose?.();
      },
      [onClose]
    );

    if (variant) {
      const isFilled = variant === 'filled';
      const isCompact = variant === 'compact';
      const textColor = isFilled ? palette.filledText : palette.text;
      const hasIcon = !!(icon || resolvedIntent);
      const tinted = iconHasBackground ?? VARIANT_ICON[variant].hasBackground;
      const controlSize = getOneLessSize(size);
      const buttonTheme = isFilled ? { main: changeLightness(palette.accent, 0.12) } : undefined;
      const progressVisible = !!duration && (showProgress ?? !isCompact);
      const iconNode =
        resolvedIntent === 'pending' && !icon ? (
          <ReqoreSpinner size={size} type={5} intent={isFilled ? undefined : 'pending'} />
        ) : (
          <ReqoreIcon
            icon={icon || VARIANT_TYPE_ICON[resolvedIntent] || typeToIcon[resolvedIntent]}
            size={size}
            color={iconColor ?? (isFilled ? palette.filledText : palette.glyph)}
          />
        );
      const actionButtons = actions?.length
        ? actions.map(({ label, onClick: onActionClick, closeOnClick, ...rest }, index) => (
            <ReqoreButton
              key={`${label}-${index}`}
              size={controlSize}
              flat
              compact={isCompact}
              minimal={isCompact || index > 0}
              intent={index === 0 && !isFilled ? resolvedIntent : undefined}
              customTheme={buttonTheme}
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
            <StyledReqoreNotificationVariant
              as={animated.div}
              ref={ref}
              style={styles}
              theme={surfaceTheme}
              effect={effect}
              role={
                resolvedIntent === 'danger' || resolvedIntent === 'warning' ? 'alert' : 'status'
              }
              className={`reqore-notification reqore-notification-${variant}`}
              $variant={variant}
              $size={size}
              $fluid={fluid}
              $clickable={!!onClick}
              $hasIcon={hasIcon}
              $hasIntent={!!resolvedIntent}
              $surface={palette.surface}
              $text={palette.text}
              $accent={palette.accent}
              $filledText={palette.filledText}
              onClick={onClick ? () => onClick() : undefined}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {variant === 'glass' && resolvedIntent ? (
                <StyledNotificationBloom $color={palette.accent} />
              ) : null}
              {hasIcon ? (
                isCompact ? (
                  iconNode
                ) : (
                  <StyledNotificationIconTile
                    $size={size}
                    $color={palette.accent}
                    $tinted={tinted}
                    $round={VARIANT_ICON[variant].round}
                    $onFilled={isFilled}
                    className='reqore-notification-icon'
                  >
                    {iconNode}
                  </StyledNotificationIconTile>
                )
              ) : null}
              <StyledNotificationBody $compact={isCompact}>
                {title ? (
                  isCompact ? (
                    <ReqoreSpan
                      size={getOneLessSize(size)}
                      effect={{ weight: 'bold', color: textColor }}
                      className='reqore-notification-title'
                    >
                      {title}
                    </ReqoreSpan>
                  ) : (
                    <ReqoreP
                      size={size}
                      effect={{ weight: 'bold', color: textColor }}
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
                {actionButtons && !isCompact ? (
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
              {actionButtons && isCompact ? (
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
                    customTheme={buttonTheme}
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
                  $color={isFilled ? rgba(LIGHT, 0.55) : palette.accent}
                  $duration={duration}
                  $paused={paused}
                  $height={size === 'big' || size === 'huge' || size === 'massive' ? 3 : 2}
                />
              ) : null}
            </StyledReqoreNotificationVariant>
          </ReqoreThemeProvider>
        ) : null
      );
    }

    return transitions((styles, item) =>
      item ? (
        <ReqoreThemeProvider>
          <StyledReqoreNotification
            as={animated.div}
            key={`${duration}${type || intent}${title}${content}`}
            type={type || intent}
            hasShadow
            timeout={duration}
            clickable={!!onClick}
            onClick={() => onClick?.()}
            flat={flat}
            minimal={minimal}
            className='reqore-notification'
            ref={ref}
            style={styles}
            size={size}
            opaque={opaque}
            blur={blur}
            theme={theme}
            maxWidth='450px'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <StyledNotificationContentWrapper
              size={size}
              theme={theme}
              $padded={padded}
              $paddingSize={paddingSize}
            >
              {type || intent || icon ? (
                <>
                  {intent === 'pending' || type === 'pending' ? (
                    <ReqoreSpinner size={size} type={5} iconMargin={'right'} />
                  ) : (
                    <ReqoreIcon
                      icon={icon || typeToIcon[type || intent]}
                      margin={'right'}
                      size={size}
                    />
                  )}
                </>
              ) : null}
              <StyledNotificationInnerContent>
                {title && <ReqoreHeading size={size}>{title}</ReqoreHeading>}
                <StyledNotificationContent theme={theme} hasTitle={!!title} size={size}>
                  {content}
                </StyledNotificationContent>
              </StyledNotificationInnerContent>
            </StyledNotificationContentWrapper>
            {onClose ? (
              <StyledIconWrapper
                type={type || intent}
                size={size}
                clickable
                className='reqore-notification-close'
                onClick={handleClose}
              >
                <ReqoreIcon icon='CloseFill' margin='both' size={size} />
              </StyledIconWrapper>
            ) : null}
          </StyledReqoreNotification>
        </ReqoreThemeProvider>
      ) : null
    );
  }
);

export default ReqoreNotification;
