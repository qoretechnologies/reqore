import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import {
  HEADER_SIZE_TO_NUMBER,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement, RaisedElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFixed,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { ButtonBadge, TReqoreBadge } from '../Button';
import { IReqoreEffect, StyledEffect } from '../Effect';
import { ReqoreHeading } from '../Header';
import { ReqoreP } from '../Paragraph';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export type TReqoreFeatureCardMarker = 'line' | 'number' | 'none';

export interface IReqoreFeatureCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFixed,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Card heading. */
  label: React.ReactNode;
  /** Effect applied to the label heading. */
  labelEffect?: IReqoreEffect;
  /** Body copy under the label. */
  description?: React.ReactNode;
  /** Effect applied to the description paragraph. */
  descriptionEffect?: IReqoreEffect;
  /** Visual marker rendered above the label. */
  marker?: TReqoreFeatureCardMarker;
  /** Used when `marker === 'number'`. */
  markerLabel?: string | number;
  /** Effect applied to the marker label. */
  markerEffect?: IReqoreEffect;
  /** Badge(s) shown next to the label, identical to other Reqore components. */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Round the card corners. Default `true`. */
  rounded?: boolean;
  /** Marks the card as clickable; auto-detected from `onClick`. */
  interactive?: boolean;
  /** Hide the card's tinted background. */
  transparent?: boolean;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border); the highlight is suppressed
   * when `flat={false}` because the border already provides surface definition.
   */
  raised?: boolean;
  /**
   * Whether the description wraps when it overflows.
   * - `true` (default): wrap to multiple lines
   * - `false`: single line with ellipsis
   */
  wrap?: boolean;
}

interface IStyledFeatureCardProps extends Omit<IReqoreFeatureCardProps, 'transparent' | 'raised'> {
  theme: IReqoreTheme;
  $transparent?: boolean;
  $raised?: boolean;
}

const StyledFeatureCard = styled(StyledEffect)<IStyledFeatureCardProps>`
  display: flex;
  flex-flow: column;
  gap: ${({ size = 'normal' }) => PADDING_FROM_SIZE[size]}px;
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  max-width: 100%;
  padding: ${({ size = 'normal' }) => PADDING_FROM_SIZE[size] * 3}px;
  background-color: ${({ theme, $transparent }) =>
    $transparent ? 'transparent' : changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border: ${({ theme, intent, flat }) =>
    flat
      ? 0
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  border-radius: ${({ rounded, size = 'normal' }) =>
    rounded === false ? 0 : `${RADIUS_FROM_SIZE[size]}px`};
  color: ${({ theme }) => getReadableColor(theme, undefined, undefined, true)};
  overflow: hidden;
  position: relative;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};
  transition: border-color 0.16s ease, background-color 0.16s ease, transform 0.16s ease;

  ${({ $raised, flat }) => $raised && flat !== false && RaisedElement}

  ${({ disabled }) => disabled && DisabledElement}

  ${({ interactive, theme, intent }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            transform: translateY(-1px);
            border-color: ${changeLightness(
              intent ? theme.intents[intent] : getMainBackgroundColor(theme),
              0.18
            )};
          }
        `
      : undefined}
`;

const StyledFeatureCardMarker = styled.div<{
  marker: TReqoreFeatureCardMarker;
  size: TSizes;
  theme: IReqoreTheme;
  intent?: IReqoreIntent['intent'];
}>`
  display: flex;
  align-items: flex-start;
  color: ${({ theme, intent }) =>
    intent ? theme.intents[intent] : changeLightness(getMainBackgroundColor(theme), 0.22)};
  font-size: ${({ size }) => TEXT_FROM_SIZE[size] * 1.4}px;
  font-weight: 900;
  line-height: 0.9;

  ${({ marker, theme, intent }) =>
    marker === 'line'
      ? css`
          &::before {
            content: '';
            width: 32px;
            height: 6px;
            background-color: ${intent
              ? theme.intents[intent]
              : changeLightness(getMainBackgroundColor(theme), 0.22)};
            box-shadow: 0 0 22px
              ${rgba(
                intent
                  ? theme.intents[intent]
                  : changeLightness(getMainBackgroundColor(theme), 0.22),
                0.8
              )};
          }
        `
      : undefined}
`;

const StyledFeatureCardContent = styled.div`
  display: flex;
  flex-flow: column;
  gap: 12px;
`;

const StyledLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
`;

// Cascade ellipsis CSS into the inner ReqoreP — `text-overflow: ellipsis`
// only takes effect on the actual text-bearing element.
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

export const ReqoreFeatureCard = memo(
  forwardRef<HTMLDivElement, IReqoreFeatureCardProps>(
    (
      {
        label,
        labelEffect,
        description,
        descriptionEffect,
        marker = 'line',
        markerLabel,
        markerEffect,
        badge,
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        intent,
        className,
        flat,
        fluid,
        fixed,
        disabled,
        tooltip,
        rounded = true,
        transparent = false,
        raised,
        wrap = true,
        effect,
        interactive,
        onClick,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const labelSize = useMemo(() => HEADER_SIZE_TO_NUMBER[size] as 1 | 2 | 3 | 4 | 5 | 6, [size]);
      const descriptionSize = useMemo(() => getOneLessSize(size), [size]);
      const isInteractive = interactive || !!onClick;
      const hasBadge = badge !== undefined && badge !== null;

      return (
        <ReqoreTooltipComponent
          {...rest}
          ref={ref}
          Component={StyledFeatureCard}
          theme={theme}
          customTheme={customTheme}
          inheritCustomTheme={inheritCustomTheme}
          intent={intent}
          flat={flat}
          fluid={fluid}
          fixed={fixed}
          disabled={disabled}
          tooltip={tooltip}
          rounded={rounded}
          $transparent={transparent}
          $raised={raised}
          effect={{ interactive: isInteractive, ...effect }}
          interactive={isInteractive}
          onClick={onClick}
          size={size}
          className={`${className || ''} reqore-feature-card`}
        >
          {marker !== 'none' && (
            <StyledFeatureCardMarker
              marker={marker}
              size={size}
              theme={theme}
              intent={intent}
              className='reqore-feature-card-marker'
            >
              {marker === 'number' && (
                <StyledEffect effect={markerEffect}>{markerLabel}</StyledEffect>
              )}
            </StyledFeatureCardMarker>
          )}
          <StyledFeatureCardContent className='reqore-feature-card-content'>
            <StyledLabelRow className='reqore-feature-card-label-row'>
              <StyledTextSlot $wrap={wrap}>
                <ReqoreHeading
                  size={labelSize}
                  customTheme={theme}
                  effect={labelEffect}
                  className='reqore-feature-card-label'
                >
                  {label}
                </ReqoreHeading>
              </StyledTextSlot>
              {hasBadge && <ButtonBadge size={size} content={badge} margin='none' />}
            </StyledLabelRow>
            {description && (
              <StyledTextSlot $wrap={wrap}>
                <ReqoreP
                  size={descriptionSize}
                  customTheme={theme}
                  effect={{ opacity: 0.72, ...descriptionEffect }}
                  className='reqore-feature-card-description'
                >
                  {description}
                </ReqoreP>
              </StyledTextSlot>
            )}
          </StyledFeatureCardContent>
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreFeatureCard;
