import {
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import { GAP_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { TReqoreHexColor } from '../Effect';
import { getMainBackgroundColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFluid,
  IWithReqoreTooltip,
} from '../../types/global';
import { ReqoreTooltipComponent } from '../TooltipComponent';

/**
 * Width of the edge fade, in pixels. Wide enough to read as a gradient rather than
 * a hard edge, narrow enough not to obscure a whole item.
 */
const FADE_WIDTH = 36;

export interface IReqoreFadeScrollerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreFluid,
    IWithReqoreTooltip {
  /** The row's contents. Laid out horizontally and never wrapped. */
  children: ReactNode;
  /**
   * Gap between children, on the standard size scale.
   * @default normal
   */
  gapSize?: TSizes;
  /**
   * Cross-axis alignment of the row.
   * @default center
   */
  verticalAlign?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /**
   * Keep children at their natural width (`flex: 0 0 auto`) so they overflow into
   * the scroll area instead of being squashed. Right for text, tags and chips.
   * Pass `false` for a row of self-sizing grow-tiles (a stat rail) whose own
   * `flex` should win.
   * @default true
   */
  rigid?: boolean;
  /**
   * Edge fade colour. Defaults to the surface the row sits on — the resolved
   * `intent` colour when one is set, otherwise the main background — so the fade
   * reads as the content dissolving into its surface rather than as a grey smudge.
   * Set it explicitly when the row sits on something neither of those describes.
   */
  fadeColor?: TReqoreHexColor;
  /**
   * Show a fade on an edge that has content scrolled out of view.
   * @default true
   */
  fade?: boolean;
}

interface IStyledFadeScrollerProps {
  $fadeLeft?: boolean;
  $fadeRight?: boolean;
  $fadeColor: string;
  $fluid?: boolean;
  theme: IReqoreTheme;
}

/*
 * The fades are overlay gradients on the wrapper rather than a mask on the scroller,
 * so they sit above the content without entering the scroll flow — a `::before` inside
 * the scrolling element would scroll away with everything else. `pointer-events: none`
 * keeps them from swallowing clicks on the items underneath.
 */
const StyledFadeScrollerWrapper = styled.div<IStyledFadeScrollerProps>`
  position: relative;
  /* Fluid fills its container (a rail spanning a panel). Non-fluid sizes to its
     content, so the row can sit BESIDE something in a flex layout — a forced 100%
     makes a wrapping flex parent break it onto its own line. */
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
  max-width: 100%;
  min-width: 0;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: ${FADE_WIDTH}px;
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.15s ease-out;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, ${({ $fadeColor }) => $fadeColor}, transparent);
    opacity: ${({ $fadeLeft }) => ($fadeLeft ? 1 : 0)};
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, ${({ $fadeColor }) => $fadeColor}, transparent);
    opacity: ${({ $fadeRight }) => ($fadeRight ? 1 : 0)};
  }
`;

interface IStyledScrollProps {
  $gap: number;
  $verticalAlign: string;
  $rigid: boolean;
  $fluid?: boolean;
}

/*
 * The scrollbar is hidden on purpose: the fade IS the affordance, and a native
 * horizontal bar under a single row of chips is thicker than the row it describes.
 * The row stays scrollable by wheel, trackpad, touch and keyboard regardless.
 */
const StyledFadeScrollerContent = styled.div<IStyledScrollProps>`
  display: flex;
  flex-wrap: nowrap;
  align-items: ${({ $verticalAlign }) => $verticalAlign};
  gap: ${({ $gap }) => $gap}px;
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  /* Keeps a focus ring on the last item from being clipped by the overflow box. */
  padding-bottom: 2px;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  ${({ $rigid }) =>
    $rigid &&
    `
    & > * {
      flex: 0 0 auto;
    }
  `}
`;

/**
 * A single-line horizontal scroller that fades whichever edge has content out of
 * view — for chip strips, tag rows, stat rails, breadcrumb trails and any other row
 * of peers that would otherwise wrap into a ragged block on a narrow screen.
 *
 * Wrapping is the wrong answer for a row of equal-weight items: on a phone five
 * tiles become five lines and push the page's actual content below the fold. One
 * swipeable band keeps the row one row. The fade is what makes the overflow
 * discoverable — without it a clipped row looks like a complete one.
 *
 * @example
 * <ReqoreFadeScroller gapSize='small'>
 *   {tags.map((tag) => <ReqoreTag key={tag} label={tag} />)}
 * </ReqoreFadeScroller>
 */
export const ReqoreFadeScroller = memo(
  forwardRef<HTMLDivElement, IReqoreFadeScrollerProps>(
    (
      {
        children,
        gapSize = 'normal',
        verticalAlign = 'center',
        rigid = true,
        fadeColor,
        fade = true,
        fluid = true,
        intent,
        customTheme,
        tooltip,
        className,
        ...rest
      }: IReqoreFadeScrollerProps,
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);
      const scrollRef = useRef<HTMLDivElement>(null);
      const { targetRef } = useCombinedRefs<HTMLDivElement>(ref);
      const [edges, setEdges] = useState<{ left: boolean; right: boolean }>({
        left: false,
        right: false,
      });

      const update = useCallback(() => {
        const element = scrollRef.current;

        if (!element) {
          return;
        }

        const left = element.scrollLeft > 1;
        const right = element.scrollLeft + element.clientWidth < element.scrollWidth - 1;

        // Only commit a real change — this runs after every render (below), and an
        // unconditional setState would loop.
        setEdges((current) =>
          current.left === left && current.right === right ? current : { left, right }
        );
      }, []);

      // After every render, because the children can change width without the
      // scroller resizing (a chip's label loads, an item is removed).
      useLayoutEffect(update);

      useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
          return undefined;
        }

        element.addEventListener('scroll', update, { passive: true });

        const observer =
          typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);

        observer?.observe(element);

        return () => {
          element.removeEventListener('scroll', update);
          observer?.disconnect();
        };
      }, [update]);

      /* An intent tints the fade, because the fade IS this component's only
         surface — there is no border or background for an intent to colour
         instead. Without this, `intent` would type-check and paint nothing. */
      const resolvedFadeColor = useMemo(
        () => fadeColor ?? (intent ? theme.intents[intent] : getMainBackgroundColor(theme)),
        [fadeColor, intent, theme]
      );

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledFadeScrollerWrapper}
          tooltip={tooltip}
          ref={targetRef}
          theme={theme}
          className={`${className || ''} reqore-fade-scroller`.trim()}
          $fadeColor={resolvedFadeColor}
          $fadeLeft={fade && edges.left}
          $fadeRight={fade && edges.right}
          $fluid={fluid}
        >
          <StyledFadeScrollerContent
            ref={scrollRef}
            className='reqore-fade-scroller-content'
            $gap={GAP_FROM_SIZE[gapSize]}
            $verticalAlign={verticalAlign}
            $rigid={rigid}
            $fluid={fluid}
          >
            {children}
          </StyledFadeScrollerContent>
        </ReqoreTooltipComponent>
      );
    }
  )
);

ReqoreFadeScroller.displayName = 'ReqoreFadeScroller';

export default ReqoreFadeScroller;
