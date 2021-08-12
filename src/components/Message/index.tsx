import { forwardRef, useEffect, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
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
}

export interface IReqoreNotificationStyle extends IReqoreMessageProps {
  theme: IReqoreTheme;
  clickable?: boolean;
  timeout?: number;
}

const ReqoreMessage: React.FC<IReqoreMessageProps> = forwardRef(
  (
    {
      intent = 'info',
      icon,
      title,
      children,
      onClose,
      onClick,
      duration,
      onFinish,
      flat,
      inverted,
    },
    ref: any
  ) => {
    const [internalTimeout, setInternalTimeout] = useState(null);

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
      clearTimeout(internalTimeout);
    });

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
        >
          <StyledIconWrapper intent={intent}>
            <ReqoreIcon
              icon={icon || typeToIcon[intent]}
              margin={flat && inverted ? 'right' : 'both'}
            />
          </StyledIconWrapper>
          <StyledNotificationContentWrapper>
            {title && <StyledNotificationTitle>{title}</StyledNotificationTitle>}
            <StyledNotificationContent>{children}</StyledNotificationContent>
          </StyledNotificationContentWrapper>
          {onClose && (
            <StyledIconWrapper
              intent={intent}
              clickable
              className='reqore-message-close'
              onClick={(event) => {
                event.stopPropagation();
                onClose && onClose();
              }}
            >
              <ReqoreIcon icon='CloseFill' />
            </StyledIconWrapper>
          )}
        </StyledReqoreNotification>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreMessage;
