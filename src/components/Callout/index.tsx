import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneLessSize, TReqorePadded } from '../../helpers/utils';
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
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { ButtonBadge, IReqoreButtonProps, TReqoreBadge } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect, StyledTextEffect, TReqoreEffectColor } from '../Effect';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreP } from '../Paragraph';
import { ReqoreSpan } from '../Span';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreCalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFixed,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Strong primary heading rendered above the body. */
  label?: React.ReactNode;
  /** Effect applied to the label. */
  labelEffect?: IReqoreEffect;
  /** Body copy rendered under the label. Falls back to `children`. */
  description?: React.ReactNode;
  /** Effect applied to the description. */
  descriptionEffect?: IReqoreEffect;
  /** Leading icon (typically an info / alert / error glyph). */
  icon?: IReqoreIconName;
  /** Color of the leading icon. Defaults to the intent color. */
  iconColor?: TReqoreEffectColor;
  /** Additional props passed to the leading ReqoreIcon. */
  iconProps?: Partial<IReqoreIconProps>;
  /** Badge(s) shown next to the label, identical to other Reqore components. */
  badge?: TReqoreBadge | TReqoreBadge[];
  /** Renders a close button on the right edge and fires when clicked. */
  onClose?: () => void;
  /** Override props for the close button. */
  closeButtonProps?: Partial<IReqoreButtonProps>;
  /** Where the accent strip is rendered. */
  accentPosition?: 'left' | 'top';
  /** Thickness of the accent strip in pixels. */
  accentSize?: number;
  /** Effect applied to the legacy `children` slot. */
  contentEffect?: IReqoreEffect;
  /** Round the corners. Default `true`. */
  rounded?: boolean;
  /**
   * Override the size used to derive the callout's border-radius. Defaults to `size`.
   */
  radiusSize?: TSizes;
  /** Marks the callout as clickable; auto-detected from `onClick`. */
  interactive?: boolean;
  /** Hide the tinted surface background. */
  transparent?: boolean;
  /**
   * Subtle 3D "raised" effect — inset top highlight + inset bottom shadow.
   * Best paired with `flat={true}` (no border); the highlight is suppressed
   * when `flat={false}` because the border already provides surface definition.
   */
  raised?: boolean;
  /**
   * Controls which axes receive the callout's outer padding.
   * - `true` (default): padding on both axes
   * - `false`: no padding (e.g. when nested inside another padded surface)
   * - `'horizontal'`: only left/right padding
   * - `'vertical'`: only top/bottom padding
   *
   * Note: when an accent strip is rendered, the side adjacent to the strip
   * still reserves room for the strip even when padding is disabled on that
   * axis — otherwise the content would collide with the strip.
   */
  padded?: TReqorePadded;
  /**
   * Size of the callout's outer padding. Defaults to `size`. Use this to
   * scale the padding independently from the callout's text scale.
   */
  paddingSize?: TSizes;
}

interface IStyledCalloutProps extends Omit<IReqoreCalloutProps, 'transparent' | 'raised'> {
  theme: IReqoreTheme;
  $transparent?: boolean;
  $raised?: boolean;
  $hasContent?: boolean;
  $padded: TReqorePadded;
  $paddingSize: TSizes;
}

const StyledCallout = styled(StyledEffect)<IStyledCalloutProps>`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: ${({ size = 'normal' }) => PADDING_FROM_SIZE[size] * 2}px;
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  max-width: 100%;
  padding: ${({ $padded, $paddingSize, accentPosition = 'left', accentSize = 5 }) => {
    if ($padded === false) {
      // Even with no padding requested, the side that hosts the accent strip
      // must reserve `accentSize` so the content does not collide with it.
      return accentPosition === 'left'
        ? `0 0 0 ${accentSize}px`
        : `${accentSize}px 0 0 0`;
    }
    const v2_5 = PADDING_FROM_SIZE[$paddingSize] * 2.5;
    const v3 = PADDING_FROM_SIZE[$paddingSize] * 3;
    const h3 = PADDING_FROM_SIZE[$paddingSize] * 3;
    const horizontalOnly = $padded === 'horizontal';
    const verticalOnly = $padded === 'vertical';
    if (accentPosition === 'left') {
      // top, right, bottom, left (left side hosts the strip)
      const top = horizontalOnly ? 0 : v2_5;
      const right = verticalOnly ? 0 : h3;
      const bottom = horizontalOnly ? 0 : v2_5;
      const left = verticalOnly ? accentSize : h3 + accentSize;
      return `${top}px ${right}px ${bottom}px ${left}px`;
    }
    // accentPosition === 'top' — top side hosts the strip
    const top = horizontalOnly ? accentSize : v3 + accentSize;
    const right = verticalOnly ? 0 : h3;
    const bottom = horizontalOnly ? 0 : v3;
    const left = verticalOnly ? 0 : h3;
    return `${top}px ${right}px ${bottom}px ${left}px`;
  }};
  background-color: ${({ theme, $transparent }) =>
    $transparent ? 'transparent' : changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border: ${({ theme, flat, intent }) =>
    flat
      ? 0
      : `1px solid ${changeLightness(
          intent ? theme.intents[intent] : getMainBackgroundColor(theme),
          0.08
        )}`};
  border-radius: ${({ rounded, size = 'normal', radiusSize }) =>
    rounded === false ? 0 : `${RADIUS_FROM_SIZE[radiusSize || size]}px`};
  overflow: hidden;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};
  transition:
    background-color 0.16s ease,
    transform 0.16s ease;

  &::before {
    content: '';
    position: absolute;
    ${({ accentPosition = 'left', accentSize = 5 }) =>
      accentPosition === 'left'
        ? css`
            top: 0;
            bottom: 0;
            left: 0;
            width: ${accentSize}px;
          `
        : css`
            top: 0;
            right: 0;
            left: 0;
            height: ${accentSize}px;
          `}
    background-color: ${({ theme, intent }) =>
      intent ? theme.intents[intent] : changeLightness(getMainBackgroundColor(theme), 0.22)};
  }

  ${({ $raised, flat }) => $raised && flat !== false && RaisedElement}

  ${({ disabled }) => disabled && DisabledElement}

  ${({ interactive, theme, intent, $transparent }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            transform: translateY(-1px);
            background-color: ${intent
              ? rgba(theme.intents[intent], $transparent ? 0.04 : 0.1)
              : $transparent
              ? rgba(changeLightness(getMainBackgroundColor(theme), 0.08), 0.08)
              : changeLightness(getMainBackgroundColor(theme), -0.32)};
          }
        `
      : undefined}
`;

const StyledCalloutBody = styled.div`
  display: flex;
  flex-flow: column;
  gap: 6px;
  flex: 1 1 auto;
  min-width: 0;
`;

const StyledCalloutLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
`;

const StyledCalloutContent = styled(StyledTextEffect)<{
  size: IReqoreCalloutProps['size'];
  theme: IReqoreTheme;
}>`
  color: ${({ theme }) => rgba(getReadableColor(theme, undefined, undefined, true), 0.84)};
  font-size: ${({ size = 'normal' }) => TEXT_FROM_SIZE[size] * 1.2}px;
  line-height: 1.25;
  font-weight: 800;
`;

export const ReqoreCallout = memo(
  forwardRef<HTMLDivElement, IReqoreCalloutProps>(
    (
      {
        children,
        label,
        labelEffect,
        description,
        descriptionEffect,
        icon,
        iconColor,
        iconProps,
        badge,
        onClose,
        closeButtonProps,
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
        effect,
        contentEffect,
        interactive,
        onClick,
        accentPosition = 'left',
        accentSize = 5,
        padded = true,
        paddingSize,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const isInteractive = interactive || !!onClick;
      const descriptionSize = useMemo(() => getOneLessSize(size), [size]);
      const hasBadge = badge !== undefined && badge !== null;
      const hasIcon = !!icon || !!iconProps?.image;
      const hasStructuredContent = !!label || !!description;

      const resolvedIconColor: TReqoreEffectColor = useMemo(() => {
        if (iconColor) return iconColor;
        if (intent) return theme.intents[intent] as TReqoreEffectColor;
        return getReadableColor(theme, undefined, undefined, true) as TReqoreEffectColor;
      }, [iconColor, intent, theme]);

      return (
        <ReqoreTooltipComponent
          {...rest}
          ref={ref}
          Component={StyledCallout}
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
          accentPosition={accentPosition}
          accentSize={accentSize}
          $padded={padded}
          $paddingSize={paddingSize ?? size}
          className={`${className || ''} reqore-callout`}
        >
          {hasIcon && (
            <ReqoreIcon
              {...iconProps}
              icon={icon}
              size={size}
              color={resolvedIconColor}
              className='reqore-callout-icon'
            />
          )}
          {hasStructuredContent ? (
            <StyledCalloutBody className='reqore-callout-body'>
              {label && (
                <StyledCalloutLabelRow className='reqore-callout-label-row'>
                  <ReqoreSpan
                    size={size}
                    effect={{ weight: 'bold', ...labelEffect }}
                    className='reqore-callout-label'
                  >
                    {label}
                  </ReqoreSpan>
                  {hasBadge && <ButtonBadge size={size} content={badge} margin='none' />}
                </StyledCalloutLabelRow>
              )}
              {description && (
                <ReqoreP
                  size={descriptionSize}
                  effect={{ opacity: 0.78, ...descriptionEffect }}
                  className='reqore-callout-description'
                >
                  {description}
                </ReqoreP>
              )}
              {!label && hasBadge && <ButtonBadge size={size} content={badge} margin='none' />}
            </StyledCalloutBody>
          ) : (
            <StyledCalloutContent
              theme={theme}
              size={size}
              effect={contentEffect || {}}
              className='reqore-callout-content'
            >
              {children}
              {hasBadge && (
                <ButtonBadge
                  size={size}
                  content={badge}
                  margin='left'
                />
              )}
            </StyledCalloutContent>
          )}
          {onClose && (
            <ReqoreControlGroup className='reqore-callout-actions' gapSize='small'>
              <ReqoreButton
                {...closeButtonProps}
                icon={closeButtonProps?.icon ?? 'CloseLine'}
                tooltip={closeButtonProps?.tooltip ?? 'Dismiss'}
                minimal={closeButtonProps?.minimal ?? true}
                flat={closeButtonProps?.flat ?? true}
                size={closeButtonProps?.size ?? size}
                onClick={(event) => {
                  event.stopPropagation();
                  closeButtonProps?.onClick?.(event);
                  onClose();
                }}
                className={`reqore-callout-close ${closeButtonProps?.className ?? ''}`.trim()}
              />
            </ReqoreControlGroup>
          )}
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreCallout;
