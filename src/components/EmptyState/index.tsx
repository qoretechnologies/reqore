import React, { forwardRef, memo, useMemo } from 'react';
import { ReqorePanel } from '../..';
import { TSizes } from '../../constants/sizes';
import { getOneHigherSize, getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
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
import { IReqoreEffect, TReqoreEffectColor } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import { ReqoreP } from '../Paragraph';

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
  gapSize?: TSizes;
}

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
        inheritCustomTheme,
        intent,
        fluid,
        flat = true,
        disabled,
        tooltip,
        rounded,
        transparent,
        opacity,
        effect,
        className,
        gapSize,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      const iconSize = useMemo(() => getOneHigherSize(size), [size]);
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
        <ReqorePanel
          transparent={transparent}
          minimal
          flat={flat}
          padded='massive'
          {...rest}
          tooltip={tooltip}
          ref={ref}
          customTheme={theme}
          size={size}
          fluid={fluid}
          disabled={disabled}
          rounded={rounded}
          intent={intent}
          contentEffect={transformedEffect}
          className={`${className || ''} reqore-empty-state`}
        >
          <ReqoreControlGroup
            vertical
            horizontalAlign='center'
            className='reqore-empty-state-content'
            gapSize={gapSize}
          >
            {icon && (
              <ReqoreIcon
                {...iconProps}
                icon={icon}
                size={iconSize}
                color={iconColor}
                intent={iconColor || hasBackground ? undefined : intent}
                className='reqore-empty-state-icon'
              />
            )}
            {title && (
              <ReqoreHeading size={getOneHigherSize(size)} className='reqore-empty-state-title'>
                {title}
              </ReqoreHeading>
            )}
            {description &&
              (typeof description === 'string' ? (
                <ReqoreP
                  size={descriptionSize}
                  className='reqore-empty-state-description'
                  effect={{ opacity: 0.7 }}
                  style={{ textAlign: 'center', maxWidth: '480px' }}
                >
                  {description}
                </ReqoreP>
              ) : (
                <div className='reqore-empty-state-description'>{description}</div>
              ))}
            {actions && <div className='reqore-empty-state-actions'>{actions}</div>}
          </ReqoreControlGroup>
        </ReqorePanel>
      );
    }
  )
);

export default ReqoreEmptyState;
