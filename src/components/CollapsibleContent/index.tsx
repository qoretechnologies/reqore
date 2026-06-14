import { forwardRef, memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getColorFromMaybeString, getMainBackgroundColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import { StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreCollapsibleContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
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
   * Surface colour the gradient fades into — should match whatever the content sits on so the
   * fade is seamless. Accepts a hex colour or a Reqore colour shorthand (e.g. `'main:lighten:2'`).
   * Defaults to the theme's main background.
   */
  fadeColor?: TReqoreEffectColor;
  /** Extra props forwarded to both the reveal and collapse buttons. */
  buttonProps?: Partial<IReqoreButtonProps>;
}

interface IStyledCollapsibleContentProps {
  theme: IReqoreTheme;
  $fluid?: boolean;
}

const StyledCollapsibleContent = styled(StyledEffect)<IStyledCollapsibleContentProps>`
  display: flex;
  flex-flow: column;
  width: ${({ $fluid }) => ($fluid ? '100%' : undefined)};
  max-width: 100%;
`;

interface IStyledClipProps {
  $collapsed: boolean;
  $maxHeight: number;
  $hoverReveal?: boolean;
}

const StyledClip = styled.div<IStyledClipProps>`
  position: relative;
  ${({ $collapsed, $maxHeight }) =>
    $collapsed &&
    css`
      max-height: ${$maxHeight}px;
      overflow: hidden;
    `}

  ${({ $hoverReveal }) =>
    $hoverReveal &&
    css`
      .reqore-collapsible-content-reveal {
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      &:hover .reqore-collapsible-content-reveal,
      &:focus-within .reqore-collapsible-content-reveal {
        opacity: 1;
      }
    `}
`;

interface IStyledFadeOverlayProps {
  $fade: string;
  $height: number;
  $padding: number;
}

// The reveal button floats centred at the bottom of the fade, matching the IDE's chat-bubble
// disclosure. The gradient is click-through; only the button itself takes pointer events.
const StyledFadeOverlay = styled.div<IStyledFadeOverlayProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  height: ${({ $height }) => $height}px;
  background: linear-gradient(to bottom, transparent, ${({ $fade }) => $fade});
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: ${({ $padding }) => $padding}px;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

/**
 * Height-clipping "Show more" reveal: tall content clips behind a gradient fade with a reveal
 * button (on hover / focus) and expands to a "Show less"; short content shows whole, no fade.
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
        fadeColor,
        buttonProps,
        size = 'normal',
        intent,
        customTheme,
        inheritCustomTheme,
        fluid,
        effect,
        tooltip,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const contentRef = useRef<HTMLDivElement>(null);
      const [isCollapsed, setIsCollapsed] = useState(!defaultExpanded);
      const [needsCollapse, setNeedsCollapse] = useState(false);
      const [hasMeasured, setHasMeasured] = useState(false);

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
          setNeedsCollapse(node.scrollHeight > maxCollapsedHeight);
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
      const fade = useMemo(
        () => getColorFromMaybeString(theme, fadeColor) || getMainBackgroundColor(theme),
        [theme, fadeColor]
      );
      // Fade height tracks the clip (≈⅔), capped at 200 like the IDE so a tall threshold
      // doesn't produce an oversized gradient.
      const fadeHeight = Math.max(40, Math.min(Math.round(maxCollapsedHeight * 0.66), 200));

      const handleExpand = useCallback((event: React.MouseEvent) => {
        // A disclosure toggle should not activate an interactive row it sits inside.
        event.stopPropagation();
        // The click proves the content overflows — record it, covering the brief
        // clip-before-measure window where the pending measure would otherwise be cancelled
        // and the "Show less" button never appear.
        setNeedsCollapse(true);
        setIsCollapsed(false);
      }, []);

      const handleCollapse = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        setIsCollapsed(true);
      }, []);

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
          className={`${className || ''} reqore-collapsible-content`.trim()}
        >
          <StyledClip
            ref={contentRef}
            $collapsed={showCollapsed}
            $maxHeight={maxCollapsedHeight}
            $hoverReveal={revealOn === 'hover'}
            className='reqore-collapsible-content-clip'
          >
            {children}
            {showCollapsed && (
              <StyledFadeOverlay
                $fade={fade}
                $height={fadeHeight}
                $padding={PADDING_FROM_SIZE[size]}
                className='reqore-collapsible-content-fade'
              >
                <ReqoreButton
                  size={size}
                  intent={intent}
                  customTheme={customTheme}
                  icon={showMoreIcon}
                  label={showMoreLabel}
                  minimal
                  flat={false}
                  {...buttonProps}
                  className={`reqore-collapsible-content-reveal ${
                    buttonProps?.className || ''
                  }`.trim()}
                  onClick={handleExpand}
                />
              </StyledFadeOverlay>
            )}
          </StyledClip>
          {needsCollapse && !isCollapsed && (
            <ReqoreButton
              size={size}
              intent={intent}
              customTheme={customTheme}
              icon={showLessIcon}
              label={showLessLabel}
              minimal
              flat={false}
              fluid
              {...buttonProps}
              className={`reqore-collapsible-content-collapse ${
                buttonProps?.className || ''
              }`.trim()}
              onClick={handleCollapse}
            />
          )}
        </ReqoreTooltipComponent>
      );
    }
  )
);

ReqoreCollapsibleContent.displayName = 'ReqoreCollapsibleContent';

export default ReqoreCollapsibleContent;
