import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';
import {
  StyledIconWrapper,
  StyledNotificationContent,
  StyledNotificationContentWrapper,
  StyledNotificationTitle,
  StyledReqoreNotification,
  typeToIcon,
} from '../Notifications/notification';

export interface IReqoreMessageProps {
  intent?: IReqoreIntent;
  title?: string;
  children: any;
  icon?: IReqoreIconName;
  onClose?: () => any;
  onClick?: () => any;
  duration?: number;
  onFinish?: () => any;
  flat?: boolean;
  inverted?: boolean;
  size?: TSizes;
}

export interface IReqoreNotificationStyle extends IReqoreMessageProps {
  theme: IReqoreTheme;
  clickable?: boolean;
  timeout?: number;
}

const ReqoreMessage: React.FC<IReqoreMessageProps> = forwardRef(
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
      inverted,
      size = 'normal',
    },
    ref: any
  ) => {
    const [internalTimeout, setInternalTimeout] = useState<NodeJS.Timeout | null>(null);

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
          key={`${duration}${intent}${title}${children}`}
          intent={intent}
          timeout={duration}
          clickable={!!onClick}
          onClick={onClick}
          flat={flat}
          inverted={inverted}
          fluid
          className='reqore-message'
          ref={ref}
          size={size}
        >
          {leftIcon ? (
            <StyledIconWrapper intent={intent} size={size}>
              <ReqoreIcon
                icon={leftIcon}
                margin={flat && inverted ? undefined : 'left'}
                size={`${TEXT_FROM_SIZE[size]}px`}
              />
            </StyledIconWrapper>
          ) : null}
          <StyledNotificationContentWrapper size={size}>
            {title && <StyledNotificationTitle>{title}</StyledNotificationTitle>}
            <StyledNotificationContent>{children}</StyledNotificationContent>
          </StyledNotificationContentWrapper>
          {onClose && (
            <StyledIconWrapper
              size={size}
              intent={intent}
              clickable
              className='reqore-message-close'
              onClick={(event) => {
                event.stopPropagation();
                onClose && onClose();
              }}
            >
              <ReqoreIcon icon='CloseFill' margin='both' size={`${TEXT_FROM_SIZE[size]}px`} />
            </StyledIconWrapper>
          )}
        </StyledReqoreNotification>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMessage;
