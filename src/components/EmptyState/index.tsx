import { rgba } from 'polished';
import { forwardRef, memo, useMemo } from 'react';
import React from 'react';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, RADIUS_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { getOneHigherSize, getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreControlGroup from '../ControlGroup';
import { IReqoreEffect, StyledEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreP } from '../Paragraph';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreEmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreFluid,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Icon displayed above the title */
  icon?: IReqoreIconName;
  /** Optional color for the icon */
  iconColor?: TReqoreEffectColor;
  /** Additional icon props */
  iconProps?: Omit<IReqoreIconProps, 'icon' | 'size' | 'color'>;
  /** Title text */
  title?: string;
  /** Description text or custom content */
  description?: string | React.ReactNode;
  /** Action buttons or any React content rendered below the description */
  actions?: React.ReactNode;
  /** Effect applied to the card background */
  effect?: IReqoreEffect;
  /** Rounded border corners */
  rounded?: boolean;
  /** Transparent background */
  transparent?: boolean;
  /** Background opacity */
  opacity?: number;
  /** Whether to use a compact layout with less padding */
  compact?: boolean;
}

interface IStyledEmptyStateWrapper {
  theme: IReqoreTheme;
  size: TSizes;
  $fluid?: boolean;
  disabled?: boolean;
  $hasBackground?: boolean;
  rounded?: boolean;
  flat?: boolean;
  intent?: string;
  opacity?: number;
  compact?: boolean;
}

const StyledEmptyStateWrapper = styled(StyledEffect)<IStyledEmptyStateWrapper>`
  display: inline-flex;
  justify-content: center;
  width: ${({ $fluid }) => ($fluid ? '100%' : undefined)};

  ${({ $hasBackground, theme, size, rounded, flat, intent, opacity = 1, compact }) =>
    $hasBackground &&
    css`
      background-color: ${rgba(changeDarkness(getMainBackgroundColor(theme), 0.03), opacity)};
      border-radius: ${rounded ? RADIUS_FROM_SIZE[size] : 0}px;
      border: ${flat
        ? undefined
        : `1px solid ${changeLightness(
            intent ? theme.intents[intent] : getMainBackgroundColor(theme),
            0.08
          )}`};
      color: ${getReadableColor(theme, undefined, undefined, true)};
      padding: ${compact
        ? `${PADDING_FROM_SIZE[size] * 2}px ${PADDING_FROM_SIZE[size] * 3}px`
        : `${PADDING_FROM_SIZE[size] * 4}px ${PADDING_FROM_SIZE[size] * 6}px`};
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      ${DisabledElement};
    `}
`;

export const ReqoreEmptyState = memo(
  forwardRef<HTMLDivElement, IReqoreEmptyStateProps>(
    (
      {
        icon,
        iconColor,
        iconProps,
        title,
        description,
        actions,
        size = 'normal',
        customTheme,
        intent,
        fluid,
        flat,
        disabled,
        tooltip,
        rounded,
        transparent,
        opacity,
        effect,
        compact,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);

      const iconSize = useMemo(() => getOneHigherSize(getOneHigherSize(size)), [size]);
      const descriptionSize = useMemo(() => getOneLessSize(size), [size]);

      const hasBackground = useMemo(
        () => !!(effect || rounded || flat !== undefined || transparent || opacity !== undefined),
        [effect, rounded, flat, transparent, opacity]
      );

      const transformedEffect: IReqoreEffect = useMemo(() => {
        if (!effect) return undefined;

        const newEffect: IReqoreEffect = { ...effect };

        if (newEffect.gradient && intent) {
          newEffect.gradient.borderColor = theme.intents[intent];
        }

        return newEffect;
      }, [effect, intent, theme]);

      return (
        <ReqoreTooltipComponent
          {...rest}
          Component={StyledEmptyStateWrapper}
          tooltip={tooltip}
          ref={ref}
          theme={theme}
          size={size}
          $fluid={fluid}
          disabled={disabled}
          $hasBackground={hasBackground}
          rounded={rounded}
          flat={flat}
          intent={intent}
          opacity={transparent ? 0 : opacity}
          effect={transformedEffect}
          compact={compact}
          className={`${className || ''} reqore-empty-state`}
        >
          <ReqoreControlGroup
            vertical
            horizontalAlign='center'
            gapSize={size}
            className='reqore-empty-state-content'
          >
            {icon && (
              <ReqoreIcon
                {...iconProps}
                icon={icon}
                size={iconSize}
                color={iconColor}
                intent={iconColor ? undefined : intent}
                className='reqore-empty-state-icon'
              />
            )}
            {title && (
              <ReqoreHeading
                size={getOneHigherSize(size)}
                className='reqore-empty-state-title'
              >
                {title}
              </ReqoreHeading>
            )}
            {description && (
              typeof description === 'string' ? (
                <ReqoreP
                  size={descriptionSize}
                  className='reqore-empty-state-description'
                  effect={{ opacity: 0.7 }}
                  style={{ textAlign: 'center', maxWidth: '480px' }}
                >
                  {description}
                </ReqoreP>
              ) : (
                <div className='reqore-empty-state-description'>
                  {description}
                </div>
              )
            )}
            {actions && (
              <div className='reqore-empty-state-actions'>
                {actions}
              </div>
            )}
          </ReqoreControlGroup>
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreEmptyState;
