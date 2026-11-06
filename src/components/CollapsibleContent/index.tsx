import { forwardRef, memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { css } from 'styled-components';
import styled from '../../helpers/styled';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getMainBackgroundColor } from '../../helpers/colors';
import { useReqoreProperty } from '../../hooks/useReqoreContext';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
  IWithReqoreTransparent,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { IReqoreEffect, StyledEffect } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreCollapsibleContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip,
    IWithReqoreTransparent {
  /** Content to reveal. Always rendered; clipped behind the fade when taller than the threshold. */
  children: ReactNode;
  /**
   * Natural-height threshold in pixels. Content taller than this is clipped to this height
   * and faded out behind a "Show more" affordance; shorter content shows in full with no fade.
   * @default 300
   */
  maxCollapsedHeight?: number;
  /** Start expanded, skipping the initial clip. @default false */
  defaultExpanded?: boolean;
  /** Reveal-button label. @default 'Show more' */
  showMoreLabel?: string;
  /** Collapse-button label. @default 'Show less' */
  showLessLabel?: string;
  /** Reveal-button icon. @default 'ArrowDownSLine' */
  showMoreIcon?: IReqoreIconName;
  /** Collapse-button icon. @default 'ArrowUpSLine' */
  showLessIcon?: IReqoreIconName;
  /**
   * When the reveal / collapse button is shown. `'always'` keeps it visible; `'hover'` hides it
   * until the content is hovered or keyboard-focused, for a quieter ambient look. Prefer
   * `'always'` — a hover-only affordance is invisible on touch devices and in static snapshots.
   * @default 'always'
   */
  revealOn?: 'always' | 'hover';
  /**
   * Horizontal alignment of the reveal / collapse buttons inside the fade overlay.
   * @default 'center'
   */
  buttonAlign?: 'left' | 'center' | 'right';
  /**
   * Stretch the reveal button to the full width of the overlay (the collapse button below the
   * content is already full-width because it owns its own row).
   * @default false
   */
  buttonFluid?: boolean;
  /**
   * Where the reveal button sits while the content is clipped.
   *
   * - `'overlay'` parks it inside the fade, over the last lines in view — the compact default.
   * - `'below'` gives it its own row under the clipped box, where "Show less" also lives, so the
   *   button never covers content. The fade becomes a mask on the content itself rather than a
   *   painted gradient, so there is no fade colour to match and everything still in view stays
   *   clickable. Use it when the last thing in view is interactive (a tile, a row with actions),
   *   or when the content sits on a surface the ambient theme does not know about.
   * @default 'overlay'
   */
  buttonPlacement?: 'overlay' | 'below';
  /**
   * Animate the expand / collapse transition. Off by default — many surfaces want the
   * disclosure to feel instant. The animation only runs when:
   * 1. `animated` is `true`, AND
   * 2. the global `animations.dialogs` flag isn't disabled in the `ReqoreUIProvider`, AND
   * 3. the user isn't in `prefers-reduced-motion`.
   *
   * Powered by a `max-height` transition with the content's measured `scrollHeight` as the
   * expand target — no `auto` → fixed-value broken animation. The fade overlay's opacity rides
   * along so it doesn't pop.
   * @default false
   */
  animated?: boolean;
  /** Extra props forwarded to both the reveal and collapse buttons. */
  buttonProps?: Partial<IReqoreButtonProps>;

}

interface IStyledCollapsibleContentProps {
  theme: IReqoreTheme;
  $fluid?: boolean;
  $disabled?: boolean;
  $hoverReveal?: boolean;
}

const StyledCollapsibleContent = styled(StyledEffect)<IStyledCollapsibleContentProps>`
  display: flex;
  flex-flow: column;
  width: ${({ $fluid }) => ($fluid ? '100%' : undefined)};
  max-width: 100%;

  ${({ $disabled }) => $disabled && DisabledElement}

  ${({ $hoverReveal }) =>
    $hoverReveal &&
    css`
      /* Hover-reveal is a desktop-only nicety: gated on the pointer actually
         being able to hover, so on touch the reveal button simply stays visible
         rather than becoming an unreachable way to expand the content. Scoped to
         the whole component, not the clip, so it covers a button placed below. */
      @media (hover: hover) and (pointer: fine) {
        .reqore-collapsible-content-reveal {
          opacity: 0;
          /* Not hit-testable while invisible — an opacity:0 button still takes
             clicks, which reads as a control firing out of nowhere. */
          pointer-events: none;
          transition: opacity 0.15s ease;
        }

        &:hover .reqore-collapsible-content-reveal,
        &:focus-within .reqore-collapsible-content-reveal {
          opacity: 1;
          pointer-events: auto;
        }
      }
    `}
`;

interface IStyledClipProps {
  $collapsed: boolean;
  $maxHeight: number;
  $animated?: boolean;
  /**
   * Fade the clipped edge with a mask of this height instead of a painted overlay — the
   * `buttonPlacement='below'` fade. Unset when there is no fade.
   */
  $maskFade?: number;
  /**
   * Measured `scrollHeight` of the content — the animation target when expanding. Falls back to
   * `$maxHeight` when not yet measured so the very first frame isn't `max-height: 0px`.
   */
  $expandedHeight?: number;
}

const StyledClip = styled.div<IStyledClipProps>`
  position: relative;

  ${({ $animated, $collapsed, $maxHeight, $expandedHeight }) =>
    $animated
      ? css`
          // Animating both directions — always control max-height + overflow so the transition
          // has a concrete pair of values to interpolate between.
          max-height: ${$collapsed ? $maxHeight : $expandedHeight ?? $maxHeight}px;
          overflow: hidden;
          transition: max-height 0.25s ease-out;
        `
      : $collapsed &&
        css`
          max-height: ${$maxHeight}px;
          overflow: hidden;
        `}

  ${({ $maskFade, $collapsed }) =>
    $maskFade &&
    $collapsed &&
    css`
      mask-image: linear-gradient(to bottom, black calc(100% - ${$maskFade}px), transparent);
    `}
`;

interface IStyledFadeOverlayProps {
  $fade: string;
  $transparent?: boolean;
  $height: number;
  $padding: number;
  $align: 'left' | 'center' | 'right';
  /** Whether the overlay should be visible — false during the expanded state. */
  $visible: boolean;
  /** Whether opacity should transition rather than snap. */
  $animated?: boolean;
}

// The reveal button anchors to the bottom of the fade. Using column-flex puts the main axis
// vertical (so `justify-content: flex-end` parks the button at the bottom) and the cross axis
// horizontal — that lets the button's `fluid` (stretch on cross-axis) actually do what the
// caller expects, and `align-items` controls left/center/right placement.
const StyledFadeOverlay = styled.div<IStyledFadeOverlayProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  height: ${({ $height }) => $height}px;
  background: ${({ $transparent, $fade }) =>
    $transparent ? 'transparent' : `linear-gradient(to bottom, transparent, ${$fade})`};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: ${({ $align }) =>
    $align === 'left' ? 'flex-start' : $align === 'right' ? 'flex-end' : 'center'};
  padding: ${({ $padding }) => $padding}px;
  pointer-events: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  ${({ $animated }) =>
    $animated &&
    css`
      transition: opacity 0.2s ease-out;
    `}

  // When the overlay is hidden the button must also stop intercepting clicks so the content
  // underneath stays interactive.
  & > * {
    pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  }
`;

// The row a `buttonPlacement='below'` button sits on — the same spot for "Show more" and
// "Show less", so the control does not jump when it flips.
const StyledButtonRow = styled.div<{ $align: 'left' | 'center' | 'right'; $gap: number }>`
  display: flex;
  flex-direction: column;
  padding-top: ${({ $gap }) => $gap}px;
  align-items: ${({ $align }) =>
    $align === 'left' ? 'flex-start' : $align === 'right' ? 'flex-end' : 'center'};
`;

// Backdrop-blur the reveal / collapse buttons by default so they stay legible against whatever
// content sits behind them — the fade alone leaves the button text fighting the half-faded
// paragraphs. Consumers can override via `buttonProps.effect`.
const DEFAULT_BUTTON_EFFECT: IReqoreEffect = { backgroundBlur: 12 };

const mergeButtonEffect = (
  consumerEffect: IReqoreButtonProps['effect']
): IReqoreButtonProps['effect'] => ({ ...DEFAULT_BUTTON_EFFECT, ...consumerEffect });

/**
 * Height-clipping "Show more" reveal: tall content clips behind a gradient fade with a reveal
 * button (on hover / focus) and expands to a "Show less"; short content shows whole, no fade.
 *
 * `customTheme.main` doubles as the fade color: the gradient ends ON the color given, so a reveal
 * nested in a callout, a panel or a tile fades into THAT surface instead of into the app
 * background. Left unset, the fade follows the ambient theme background.
 */
export const ReqoreCollapsibleContent = memo(
  forwardRef<HTMLDivElement, IReqoreCollapsibleContentProps>(
    (
      {
        children,
        maxCollapsedHeight = 300,
        defaultExpanded = false,
        showMoreLabel = 'Show more',
        showLessLabel = 'Show less',
        showMoreIcon = 'ArrowDownSLine',
        showLessIcon = 'ArrowUpSLine',
        revealOn = 'always',
        buttonAlign = 'center',
        buttonFluid = false,
        buttonPlacement = 'overlay',
        animated = false,
        buttonProps,
        size = 'normal',
        intent,
        customTheme,
        inheritCustomTheme,
        fluid,
        transparent,
        disabled,
        effect,
        tooltip,
        className,
        ...rest
      },
      ref
    ) => {
      // Drive theme.main and theme.intents off `customTheme` + `intent` so consumers control the
      // fade and the button color through the standard contract — there is no separate
      // `fadeColor` knob. See `fade` below for what an explicit `customTheme.main` means.
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const contentRef = useRef<HTMLDivElement>(null);
      const [isCollapsed, setIsCollapsed] = useState(!defaultExpanded);
      const [needsCollapse, setNeedsCollapse] = useState(false);
      const [hasMeasured, setHasMeasured] = useState(false);
      // Measured `scrollHeight`; the expand-direction target for the max-height transition.
      const [contentHeight, setContentHeight] = useState(0);

      // Respect the global animations toggle from `ReqoreUIProvider` (same family as the Drawer
      // — content panels share the `dialogs` flag) and the OS reduced-motion preference.
      const animations = useReqoreProperty('animations');
      const prefersReducedMotion = useMemo(
        () =>
          typeof window !== 'undefined' &&
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        []
      );
      // Whether the consumer wants animation, after factoring the global toggle and OS pref.
      // Drives the mount-vs-fade strategy (fade overlay stays mounted so its opacity can
      // transition). Independent of whether we've measured yet.
      const animationsEnabled =
        animated && animations?.dialogs !== false && !prefersReducedMotion;
      // Whether we're actually applying the CSS max-height transition. Needs the measured
      // `scrollHeight` as the expand target — without it the transition would interpolate to 0.
      const shouldAnimate = animationsEnabled && hasMeasured;

      // Measure regardless of collapse state: `needsCollapse` means "tall enough to collapse",
      // which an expanded start (`defaultExpanded`) still needs so it can show "Show less".
      // `scrollHeight` reports full height even while the wrapper is clipped; a ResizeObserver
      // re-checks on late layout (web fonts, animated mounts), guarded like DataView / Table so
      // non-DOM environments degrade instead of throwing.
      useEffect(() => {
        const node = contentRef.current;

        if (!node) {
          return undefined;
        }

        const observer =
          typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

        function measure() {
          const measured = node.scrollHeight;
          setContentHeight(measured);
          setNeedsCollapse(measured > maxCollapsedHeight);
          setHasMeasured(true);
          // Observe the children, not just the wrapper: while clipped the wrapper's box never
          // resizes, only its (possibly late-mounting) children do. observe() is idempotent.
          Array.from(node.children).forEach((child) => observer?.observe(child));
        }

        observer?.observe(node);
        const frame = requestAnimationFrame(measure);

        return () => {
          cancelAnimationFrame(frame);
          observer?.disconnect();
        };
      }, [children, maxCollapsedHeight]);

      // Clip until measured (avoids a flash of full content), then only when it overflows.
      const showCollapsed = isCollapsed && (!hasMeasured || needsCollapse);
      // The fade is the surface — when `intent` is set we fade into the intent color so the
      // hint reads visually (a danger intent fades into red, success into green).
      //
      // Otherwise it is the background, and which background that is depends on who said so. An
      // explicit `customTheme.main` IS the surface this content sits on: the caller is naming the
      // color the gradient has to land on, so it is used as given. Only the AMBIENT theme goes
      // through `getMainBackgroundColor`, whose slight lightening exists because the app's
      // background sits a hair above `theme.main`.
      //
      // Applying that lightening to a caller's own color was a bug: the fade ended one step
      // lighter than the surface underneath it, so a reveal nested in anything that is not the
      // app background — a callout, a panel, a tile — drew a lighter rectangle across the text
      // instead of fading into it. Compensating for it meant passing a color a step BELOW the
      // real surface, which is not something a consumer can be expected to know.
      const fade = useMemo(
        () =>
          intent
            ? theme.intents[intent]
            : customTheme?.main
              ? theme.main
              : getMainBackgroundColor(theme),
        [theme, intent, customTheme?.main]
      );
      // Fade height scales with `size` so a tiny picker doesn't get a hero-sized gradient and a
      // huge one doesn't look weak. Still bounded by the clip height so the fade never overruns
      // it. Multipliers tuned to keep the button vertically centred in the gradient.
      const fadeHeight = useMemo(() => {
        const target = PADDING_FROM_SIZE[size] * 12;
        return Math.max(48, Math.min(target, Math.round(maxCollapsedHeight * 0.66), 220));
      }, [size, maxCollapsedHeight]);

      const handleExpand = useCallback(
        (event: React.MouseEvent) => {
          if (disabled) return;
          // A disclosure toggle should not activate an interactive row it sits inside.
          event.stopPropagation();
          // The click proves the content overflows — record it, covering the brief
          // clip-before-measure window where the pending measure would otherwise be cancelled
          // and the "Show less" button never appear.
          setNeedsCollapse(true);
          setIsCollapsed(false);
          buttonProps?.onClick?.(event as React.MouseEvent<HTMLButtonElement>);
        },
        [disabled, buttonProps]
      );

      const handleCollapse = useCallback(
        (event: React.MouseEvent) => {
          if (disabled) return;
          event.stopPropagation();
          setIsCollapsed(true);
          buttonProps?.onClick?.(event as React.MouseEvent<HTMLButtonElement>);
        },
        [disabled, buttonProps]
      );

      const mergedButtonEffect = useMemo(
        () => mergeButtonEffect(buttonProps?.effect),
        [buttonProps?.effect]
      );

      const below = buttonPlacement === 'below';

      const revealButton = (
        <ReqoreButton
          size={size}
          intent={intent}
          customTheme={customTheme}
          icon={showMoreIcon}
          label={showMoreLabel}
          minimal
          flat={false}
          fluid={buttonFluid}
          disabled={disabled}
          aria-expanded={false}
          {...buttonProps}
          effect={mergedButtonEffect}
          onClick={handleExpand}
          className={`reqore-collapsible-content-reveal ${buttonProps?.className || ''}`.trim()}
        />
      );

      // Below the box it shares the reveal's row and width, so the control stays put when it
      // flips; over the box it owns its own full-width row, as it always has.
      const collapseButton = (
        <ReqoreButton
          size={size}
          intent={intent}
          customTheme={customTheme}
          icon={showLessIcon}
          label={showLessLabel}
          minimal
          flat={false}
          fluid={below ? buttonFluid : true}
          disabled={disabled}
          aria-expanded
          {...buttonProps}
          effect={mergedButtonEffect}
          onClick={handleCollapse}
          className={`reqore-collapsible-content-collapse ${buttonProps?.className || ''}`.trim()}
        />
      );

      return (
        <ReqoreTooltipComponent
          {...rest}
          ref={ref}
          Component={StyledCollapsibleContent}
          theme={theme}
          customTheme={customTheme}
          inheritCustomTheme={inheritCustomTheme}
          tooltip={tooltip}
          effect={effect}
          $fluid={fluid}
          $disabled={disabled}
          $hoverReveal={revealOn === 'hover'}
          className={`${className || ''} reqore-collapsible-content`.trim()}
        >
          <StyledClip
            ref={contentRef}
            $collapsed={showCollapsed}
            $maxHeight={maxCollapsedHeight}
            $animated={shouldAnimate}
            $expandedHeight={contentHeight}
            $maskFade={below && !transparent ? fadeHeight : undefined}
            className='reqore-collapsible-content-clip'
          >
            {children}
            {/*
              When animated, keep the overlay mounted whenever the content COULD overflow
              (`needsCollapse`) and fade its opacity — otherwise the fade would pop in/out and
              fight the smooth max-height transition. When not animated we still only mount it
              while showing, so consumers without `animated` don't pay for a dormant overlay.
              Uses `animationsEnabled` (not `shouldAnimate`) so the strategy doesn't flip when a
              user clicks before the first measurement lands.
              Pre-measure (`!hasMeasured`) and `isCollapsed` we mount optimistically — same
              "treat as overflowing until proven otherwise" rule the non-animated path applies
              via `showCollapsed` — so the reveal button is in the DOM on first paint instead
              of materializing after the first ResizeObserver tick.
             */}
            {!below &&
              (animationsEnabled
                ? needsCollapse || (!hasMeasured && isCollapsed)
                : showCollapsed) && (
                <StyledFadeOverlay
                  $fade={fade}
                  $transparent={transparent}
                  $height={fadeHeight}
                  $padding={PADDING_FROM_SIZE[size]}
                  $align={buttonAlign}
                  $visible={showCollapsed}
                  $animated={animationsEnabled}
                  className='reqore-collapsible-content-fade'
                >
                  {revealButton}
                </StyledFadeOverlay>
              )}
          </StyledClip>
          {/*
            Below the box, the reveal waits for the measurement: mounting it optimistically (as
            the overlay does) would push the layout down and back up for content that fits.
          */}
          {below && isCollapsed && needsCollapse && (
            <StyledButtonRow
              $align={buttonAlign}
              $gap={PADDING_FROM_SIZE[size]}
              className='reqore-collapsible-content-actions'
            >
              {revealButton}
            </StyledButtonRow>
          )}
          {needsCollapse &&
            !isCollapsed &&
            (below ? (
              <StyledButtonRow
                $align={buttonAlign}
                $gap={PADDING_FROM_SIZE[size]}
                className='reqore-collapsible-content-actions'
              >
                {collapseButton}
              </StyledButtonRow>
            ) : (
              collapseButton
            ))}
        </ReqoreTooltipComponent>
      );
    }
  )
);

ReqoreCollapsibleContent.displayName = 'ReqoreCollapsibleContent';

export default ReqoreCollapsibleContent;
