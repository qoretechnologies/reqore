import { rgba } from 'polished';
import { forwardRef, memo, useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor, getReadableColor } from '../../helpers/colors';
import {
  getOneLessSize,
  resolvePadding,
  TReqorePadded,
  withStoppedPropagation,
} from '../../helpers/utils';
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
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect } from '../Effect';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreSeverityRowAction extends Omit<IReqoreButtonProps, 'children'> {
  /** Visible button label. */
  label?: string;
}

export interface IReqoreSeverityRowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Primary line — e.g. "Payment Processing · stripe-webhook-receiver". */
  label: React.ReactNode;
  /** Secondary line — e.g. "Avg duration 4.7s exceeded 3.5s threshold · just now". */
  description?: React.ReactNode;
  /** Optional inline content rendered before the label (e.g. severity Tag). */
  leading?: React.ReactNode;
  /** Badge(s) shown next to the label, identical to other Reqore components. */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Right-side action buttons (Investigate / Dismiss). */
  actions?: IReqoreSeverityRowAction[];
  /** Hide the intent-tinted background. Mirrors `transparent` on other components. */
  transparent?: boolean;
  /** Show the colored severity strip on the left edge. Default `true`. */
  showStrip?: boolean;
  /** Rounded corners on the row. Default `true`. */
  rounded?: boolean;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border) since a border already provides
   * surface definition; the highlight is suppressed when `flat={false}`.
   */
  raised?: boolean;
  /** Effect applied to the label text. */
  labelEffect?: IReqoreEffect;
  /** Effect applied to the description text. */
  descriptionEffect?: IReqoreEffect;
  /**
   * Whether the description wraps when it overflows.
   * - `true` (default): wrap to multiple lines
   * - `false`: single line with ellipsis
   */
  wrap?: boolean;
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
   * the padding independently from the row's text scale.
   */
  paddingSize?: TSizes;
}

interface IStyledRowProps {
  theme: IReqoreTheme;
  $intent?: TReqoreIntent;
  $transparent?: boolean;
  size: TSizes;
  $fluid?: boolean;
  flat?: boolean;
  $clickable?: boolean;
  rounded?: boolean;
  disabled?: boolean;
  $raised?: boolean;
  $padded: TReqorePadded;
  $paddingSize: TSizes;
}

const stripColorFor = (theme: IReqoreTheme, intent?: TReqoreIntent) =>
  intent ? theme.intents[intent] : changeLightness(getMainBackgroundColor(theme), 0.16);

const tintedBgFor = (theme: IReqoreTheme, intent?: TReqoreIntent) =>
  intent
    ? rgba(theme.intents[intent], 0.06)
    : rgba(changeLightness(getMainBackgroundColor(theme), 0.04), 1);

/* Container that measures its own width via a ResizeObserver and stamps
   `data-narrow="true"` on the row when the container's inline size drops
   below the wrap breakpoint. Delivers the same "actions wrap under
   label on narrow containers" behaviour a CSS container query would —
   without depending on styled-components 5.3.11's stylis 4.0.13
   handling of `@container`, which we confirmed via a CI debug pass
   silently no-ops (the rule emits to the DOM but never matches, even
   when the container is correctly registered with `container-type:
   inline-size` and its width falls under the threshold). Plain
   attribute selectors on the row are bulletproof and match every
   browser Reqore ships to.

   `width` follows the row's `fluid` prop so a `fluid={false}` row
   nested in a flex parent still shrinks to content — the observer sees
   the shrunk width and updates the attribute accordingly. */
const StyledContainer = styled.div<{ $fluid: boolean }>`
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
`;

/** Below this container width, the actions wrap under the label. */
const NARROW_BREAKPOINT_PX = 640;

/** Width of the coloured severity strip on the row's left edge. Constant
 *  across sizes so the marker reads at the same visual weight regardless
 *  of the row's text scale. Referenced by the grid template (wide and
 *  narrow), and by the aria-hidden placeholder rendered when the strip
 *  is suppressed via `showStrip={false}` so the grid geometry stays
 *  identical. */
const STRIP_WIDTH_PX = 4;

const StyledRow = styled(StyledEffect)<IStyledRowProps>`
  display: grid;
  grid-template-columns: ${STRIP_WIDTH_PX}px 1fr auto;
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
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  transition: background-color 0.15s ease-out;

  /* Narrow-container layout — driven by a data-narrow attribute
     stamped on the row by a ResizeObserver on the wrapper. See the
     StyledContainer docstring for why we don't use CSS container
     queries here.

     row-gap is deliberately tighter than the (horizontal) column gap:
     when the actions wrap under the label the row already has extra
     visual breathing room from the description above it, so a full
     column-gap between description and buttons reads as a dead band.
     Uses PADDING_FROM_SIZE[size] directly (half the column gap) so it
     scales with the row's size scale. */
  &[data-narrow='true'] {
    grid-template-columns: ${STRIP_WIDTH_PX}px 1fr;
    grid-auto-rows: max-content;
    row-gap: ${({ size }) => PADDING_FROM_SIZE[size]}px;
  }
  &[data-narrow='true'] > .reqore-severity-row-actions {
    grid-column: 2 / -1;
    grid-row: 2;
    max-width: 100%;
    justify-content: flex-start;
  }

  ${({ $clickable, theme, $intent, $transparent }) =>
    $clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${$intent
          ? rgba(theme.intents[$intent], $transparent ? 0.04 : 0.1)
          : $transparent
          ? rgba(changeLightness(getMainBackgroundColor(theme), 0.08), 0.08)
          : rgba(changeLightness(getMainBackgroundColor(theme), 0.08), 1)};
      }
    `}

  ${({ $raised, flat }) => $raised && flat !== false && RaisedElement}

  ${({ disabled }) => disabled && DisabledElement}
`;

const StyledStrip = styled.div<{ $intent?: TReqoreIntent; theme: IReqoreTheme }>`
  align-self: stretch;
  border-radius: 2px;
  background-color: ${({ theme, $intent }) => stripColorFor(theme, $intent)};
  // Subtle glow matching the strip colour — same pattern as FeatureCard's
  // line marker. Pulls focus to the row without using a heavier border.
  box-shadow: 0 0 22px ${({ theme, $intent }) => rgba(stripColorFor(theme, $intent), 0.3)};
`;

const StyledBody = styled.div`
  display: flex;
  flex-flow: column;
  gap: 4px;
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
// not its wrapper. Cascade the ellipsis CSS into the child <ReqoreP>/<ReqoreSpan>
// so the `…` glyph actually appears, while keeping the wrapper itself a flex
// item that can shrink (`min-width: 0; flex: 1 1 auto`) inside its parent.
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

const ReqoreSeverityRow = memo(
  forwardRef<HTMLDivElement, IReqoreSeverityRowProps>(
    (
      {
        label,
        description,
        leading,
        badge,
        actions,
        intent,
        transparent = false,
        showStrip = true,
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
        wrap = true,
        padded = true,
        paddingSize,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const secondarySize = useMemo(() => getOneLessSize(size), [size]);

      const interactive = !!(rest.onClick || rest.onDoubleClick);

      const hasBadge = badge !== undefined && badge !== null;

      /* Track container width via a ResizeObserver so the row's grid can
         respond to the WRAPPER's own width (not the viewport's) —
         critical for the drawer / sidebar / split-panel case where a
         narrow container sits on a wide screen. Pass the resolved state
         to StyledRow as a `data-narrow` attribute; the CSS selector on
         `&[data-narrow='true']` rewrites the grid. */
      const containerRef = useRef<HTMLDivElement | null>(null);
      const [isNarrow, setIsNarrow] = useState(false);
      useEffect(() => {
        const node = containerRef.current;
        if (!node || typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            // `contentBoxSize` is the modern read; fall back to the entry's
            // boundingClientRect for older browsers that still call the
            // callback but don't populate the newer field.
            const width = Array.isArray(entry.contentBoxSize)
              ? entry.contentBoxSize[0]?.inlineSize ?? entry.contentRect.width
              : entry.contentRect.width;
            setIsNarrow(width > 0 && width <= NARROW_BREAKPOINT_PX);
          }
        });
        observer.observe(node);
        return () => observer.disconnect();
      }, []);

      return (
        <StyledContainer
          ref={containerRef}
          $fluid={fluid}
          className='reqore-severity-row-container'
        >
          <ReqoreTooltipComponent
            data-narrow={isNarrow || undefined}
            {...rest}
            Component={StyledRow}
            tooltip={tooltip}
            ref={ref}
            theme={theme}
            $intent={intent}
            $transparent={transparent}
            size={size}
            $fluid={fluid}
            flat={flat}
            rounded={rounded}
            $raised={raised}
            $clickable={interactive}
            $padded={padded}
            $paddingSize={paddingSize ?? size}
            disabled={disabled}
            effect={effect}
            className={`${className || ''} reqore-severity-row`}
          >
            {showStrip ? (
              <StyledStrip
                theme={theme}
                $intent={intent}
                className='reqore-severity-row-strip'
                aria-hidden
              />
            ) : (
              <span aria-hidden style={{ width: STRIP_WIDTH_PX }} />
            )}
            <StyledBody className='reqore-severity-row-body'>
              <StyledLabelLine $wrap={wrap} className='reqore-severity-row-label'>
                {leading}
                <StyledTextSlot $wrap={wrap}>
                  <ReqoreSpan size={size} effect={labelEffect}>
                    {label}
                  </ReqoreSpan>
                </StyledTextSlot>
                {hasBadge && (
                  <ButtonBadge
                    size={size}
                    content={badge}
                    margin='none'
                  />
                )}
              </StyledLabelLine>
              {description && (
                <StyledTextSlot $wrap={wrap}>
                  <ReqoreP
                    size={secondarySize}
                    effect={{ opacity: 0.6, ...descriptionEffect }}
                    className='reqore-severity-row-description'
                  >
                    {description}
                  </ReqoreP>
                </StyledTextSlot>
              )}
            </StyledBody>
            {actions && actions.length > 0 && (
              <ReqoreControlGroup gapSize='small' className='reqore-severity-row-actions'>
                {actions.map((action, idx) => (
                  <ReqoreButton
                    key={idx}
                    size={size}
                    intent={action.intent ?? intent}
                    {...action}
                    // After the spread: `action` carries the consumer's raw
                    // handler and this has to be the one that wins. Applied
                    // even when the action has no handler of its own — an
                    // action button is a control, and a click that lands on
                    // one should never read as a click on the row. Without it
                    // an action and the row both fire, and a caret that
                    // toggles what the row toggles cancels itself out.
                    onClick={withStoppedPropagation<HTMLButtonElement>(action.onClick)}
                  >
                    {action.label}
                  </ReqoreButton>
                ))}
              </ReqoreControlGroup>
            )}
          </ReqoreTooltipComponent>
        </StyledContainer>
      );
    }
  )
);

export default ReqoreSeverityRow;
