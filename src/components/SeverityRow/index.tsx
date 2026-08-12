import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor, getReadableColor } from '../../helpers/colors';
import { getOneLessSize, resolvePadding, TReqorePadded } from '../../helpers/utils';
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

/* Container-query wrapper. `container-type: inline-size` registers this
   div as a query container; the row inside can then respond to THIS
   div's width via `@container`. Must be a real ancestor: `@container`
   queries look for the nearest ANCESTOR container matching the name,
   and an element cannot query itself. Without this wrapper the row's
   own `@container` rule silently never matches — the fix is DOM-level,
   not just a CSS one. `width` follows the row's `fluid` prop so a
   `fluid={false}` row (nested in a flex parent that wants it to shrink
   to content) still shrinks — the container width tracks the row's. */
const StyledContainer = styled.div<{ $fluid: boolean }>`
  container-type: inline-size;
  container-name: reqore-severity-row;
  width: ${({ $fluid }) => ($fluid ? '100%' : 'auto')};
`;

/* Below ~640px of the WRAPPER's own width there isn't enough room for
   the actions column to sit next to the label without either shrinking
   the description to one-character columns (long unbroken tokens render
   as vertical caterpillars) or pushing the label off-screen. Rewrite
   the grid so the actions wrap into their own row underneath the body,
   spanning the label column, and left-align them so they read as a
   follow-up strip rather than as right-side controls.

   Delivered as a `createGlobalStyle` block rather than a nested
   `@container` inside `StyledRow`'s own styled template because
   styled-components 5.3.11 ships stylis 4.0.13, whose at-rule parser
   silently mangles the `&` selector inside a nested `@container` — the
   rule emits to the DOM but never matches. `createGlobalStyle` bypasses
   that code path; the rule is emitted as-authored and container queries
   match. Same behaviour every consumer needs — no opt-in prop; the
   alternative was every panel wrapping the row in its own styled shim
   (see qorus-ide's earlier `SeverityRowShell` hack). */
const SeverityRowResponsiveStyle = createGlobalStyle`
  @container reqore-severity-row (max-width: 640px) {
    /* Bump specificity via the wrapper class so the global override
       wins the cascade tie against StyledRow's own grid-template-columns
       rule (both are class selectors at 0,1,0, and styled-components 5
       injects component styles AFTER global ones — so the component
       wins ties without this extra selector level). */
    .reqore-severity-row-container > .reqore-severity-row {
      grid-template-columns: 4px 1fr;
      grid-auto-rows: max-content;
    }
    .reqore-severity-row-container > .reqore-severity-row > .reqore-severity-row-actions {
      grid-column: 2 / -1;
      grid-row: 2;
      max-width: 100%;
      justify-content: flex-start;
      padding-top: 4px;
    }
  }
`;

const StyledRow = styled(StyledEffect)<IStyledRowProps>`
  display: grid;
  grid-template-columns: 4px 1fr auto;
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

      return (
        <StyledContainer $fluid={fluid} className='reqore-severity-row-container'>
          <SeverityRowResponsiveStyle />
          <ReqoreTooltipComponent
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
              <span aria-hidden style={{ width: 4 }} />
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
