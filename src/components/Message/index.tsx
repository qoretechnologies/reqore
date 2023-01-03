import { animated } from '@react-spring/web';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { getColorFromMaybeString } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreMinimal,
  IWithReqoreSize,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { ReqoreHeading } from '../Header';
import ReqoreIcon from '../Icon';
import {
  StyledIconWrapper,
  StyledNotificationContent,
  StyledNotificationContentWrapper,
  StyledReqoreNotification,
  typeToIcon,
} from '../Notifications/notification';

export interface IReqoreMessageProps
  extends IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreSize,
    IReqoreIntent,
    IWithReqoreMinimal,
    React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: any;
  icon?: IReqoreIconName;
  onClose?: () => any;
  onClick?: () => any;
  duration?: number;
  onFinish?: () => any;
  flat?: boolean;
}

export interface IReqoreNotificationStyle extends IReqoreMessageProps {
  theme: IReqoreTheme;
  clickable?: boolean;
  timeout?: number;
}

const ReqoreMessage = forwardRef<HTMLDivElement, IReqoreMessageProps>(
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
      ...rest
    },
    ref: any
  ) => {
    const [internalTimeout, setInternalTimeout] = useState<NodeJS.Timeout | null>(null);
    const theme = useReqoreTheme('main', customTheme, intent);

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
          fluid
          className={`${rest?.className || ''} reqore-message`}
          ref={ref}
          size={size}
          theme={theme}
        >
          {leftIcon ? (
            <StyledIconWrapper intent={intent} size={size} theme={theme}>
              <ReqoreIcon icon={leftIcon} margin={flat && minimal ? 'right' : 'both'} size={size} />
            </StyledIconWrapper>
          ) : null}
          <StyledNotificationContentWrapper size={size} theme={theme}>
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
);

export default ReqoreMessage;
