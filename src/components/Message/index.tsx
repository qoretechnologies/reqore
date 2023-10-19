import { animated } from '@react-spring/web';
import React, { forwardRef, memo, useEffect, useMemo, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getColorFromMaybeString } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFixed,
  IWithReqoreFluid,
  IWithReqoreMinimal,
  IWithReqoreOpaque,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { TReqoreEffectColor } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon, { IReqoreIconProps } from '../Icon';
import {
  StyledIconWrapper,
  StyledNotificationContent,
  StyledNotificationContentWrapper,
  StyledNotificationInnerContent,
  StyledReqoreNotification,
  typeToIcon,
} from '../Notifications/notification';
import { ReqoreSpinner } from '../Spinner';

export interface IReqoreMessageProps
  extends IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreSize,
    IReqoreIntent,
    IWithReqoreMinimal,
    IWithReqoreOpaque,
    IWithReqoreTooltip,
    IWithReqoreFixed,
    IWithReqoreFluid,
    React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: any;
  icon?: IReqoreIconName;
  iconColor?: TReqoreEffectColor;
  iconProps?: IReqoreIconProps;
  onClose?: () => any;
  onClick?: () => any;
  duration?: number;
  onFinish?: () => any;
  flat?: boolean;
  hasShadow?: boolean;
  margin?: 'top' | 'bottom' | 'both' | 'none';
}

export interface IReqoreNotificationStyle extends IReqoreMessageProps {
  theme: IReqoreTheme;
  clickable?: boolean;
  timeout?: number;
}

const ReqoreMessage = memo(
  forwardRef<HTMLDivElement, IReqoreMessageProps>(
    (
      {
        intent,
        icon,
        title,
        children,
        onClose,
        onClick,
        duration,
        onFinish,
        flat,
        minimal,
        size = 'normal',
        customTheme,
        iconColor,
        tooltip,
        fixed,
        fluid,
        iconProps,
        ...rest
      },
      ref
    ) => {
      const [internalTimeout, setInternalTimeout] = useState<NodeJS.Timeout | null>(null);
      const theme = useReqoreTheme('main', customTheme, intent);
      const { targetRef } = useCombinedRefs(ref);
      const [itemRef, setItemRef] = useState<HTMLDivElement>(undefined);

      useTooltip(itemRef, tooltip);

      useMount(() => {
        if (duration) {
          setInternalTimeout(
            setTimeout(() => {
              onFinish && onFinish();
            }, duration)
          );
        }
      });

      useEffect(() => {
        if (internalTimeout) {
          clearTimeout(internalTimeout);
          setInternalTimeout(
            setTimeout(() => {
              onFinish && onFinish();
            }, duration)
          );
        }
      }, [duration, intent, children, title]);

      useUnmount(() => {
        if (internalTimeout) {
          clearTimeout(internalTimeout);
        }
      });

      const leftIcon: IReqoreIconName | undefined = useMemo(
        () => icon || (intent ? typeToIcon[intent] : undefined),
        [icon, intent]
      );

      return (
        <ReqoreThemeProvider>
          <StyledReqoreNotification
            {...rest}
            effect={{
              interactive: !!onClick,
              ...rest?.effect,
            }}
            as={animated.div}
            key={`${duration}${intent}${title}${children}`}
            intent={intent}
            timeout={duration}
            clickable={!!onClick}
            onClick={onClick}
            flat={flat}
            minimal={minimal}
            asMessage
            fluid={fluid}
            fixed={fixed}
            className={`${rest?.className || ''} reqore-message`}
            ref={(ref) => {
              targetRef.current = ref;
              setItemRef(ref);
            }}
            size={size}
            theme={theme}
          >
            <StyledNotificationContentWrapper size={size} theme={theme}>
              {leftIcon ? (
                <>
                  {intent === 'pending' ? (
                    <ReqoreSpinner
                      size={size}
                      iconColor={iconColor}
                      type={5}
                      iconMargin={'right'}
                      iconProps={iconProps}
                    />
                  ) : (
                    <ReqoreIcon
                      icon={leftIcon}
                      margin={'right'}
                      size={size}
                      color={iconColor}
                      {...iconProps}
                    />
                  )}
                </>
              ) : null}
              <StyledNotificationInnerContent>
                {title && (
                  <ReqoreHeading
                    size={size}
                    customTheme={
                      rest.effect?.color
                        ? { text: { color: getColorFromMaybeString(theme, rest.effect.color) } }
                        : undefined
                    }
                  >
                    {title}
                  </ReqoreHeading>
                )}

                <StyledNotificationContent theme={theme} hasTitle={!!title} size={size}>
                  {children}
                </StyledNotificationContent>
              </StyledNotificationInnerContent>
            </StyledNotificationContentWrapper>
            {onClose && (
              <StyledIconWrapper
                theme={theme}
                size={size}
                intent={intent}
                clickable
                className='reqore-message-close'
                onClick={(event) => {
                  event.stopPropagation();
                  onClose && onClose();
                }}
              >
                <ReqoreIcon icon='CloseFill' margin='both' size={size} />
              </StyledIconWrapper>
            )}
          </StyledReqoreNotification>
        </ReqoreThemeProvider>
      );
    }
  )
);

export default ReqoreMessage;
