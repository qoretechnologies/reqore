import { darken, lighten, rgba } from 'polished';
import React, { forwardRef, useEffect, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import styled, { css, keyframes } from 'styled-components';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { fadeIn } from '../../helpers/animations';
import { changeLightness, getReadableColorFrom } from '../../helpers/colors';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export type IReqoreNotificationType =
  | 'info'
  | 'success'
  | 'danger'
  | 'pending'
  | 'warning';

export interface IReqoreNotificationProps {
  type?: IReqoreNotificationType;
  title?: string;
  content: string;
  icon?: IReqoreIconName;
  onClose?: () => any;
  onClick?: () => any;
  duration?: number;
  onFinish?: () => any;
}

export interface IReqoreNotificationStyle {
  theme: IReqoreTheme;
  type: IReqoreNotificationType;
  clickable?: boolean;
  timeout?: number;
}

const timeoutAnimation = keyframes`
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
`;

const StyledReqoreNotification = styled.div<IReqoreNotificationStyle>`
  min-width: 200px;
  max-width: 450px;
  border-radius: 5px;
  min-height: 40px;
  display: flex;
  overflow: hidden;
  position: relative;
  transition: background-color 0.1s linear;
  animation: 0.1s ${fadeIn} ease-in;

  &:not(:first-child) {
    margin-top: 10px;
  }

  ${({ theme, type, clickable, timeout }: IReqoreNotificationStyle) => css`
    background-color: ${theme.notifications?.[type]};
    border: 1px solid ${darken(0.2, theme.notifications?.[type])};
    box-shadow: 0px 0px 30px 10px ${rgba('#000000', 0.3)};

    ${timeout &&
    css`
      &::before {
        content: '';
        position: absolute;
        display: block;
        top: 0;
        height: 3px;
        background-color: ${changeLightness(theme.notifications?.[type], 0.1)};
        animation-name: ${timeoutAnimation};
        animation-duration: ${timeout}ms;
      }
    `}

    color: ${getReadableColorFrom(theme.notifications?.[type], true)};

    ${clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${lighten(0.0625, theme.notifications?.[type])};
      }
    `}
  `}
`;

const StyledIconWrapper = styled.div<IReqoreNotificationStyle>`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s linear;

  ${({ clickable, theme, type }) =>
    clickable &&
    css`
      &:hover {
        cursor: pointer;
        border-bottom-left-radius: 6px;
        background-color: ${changeLightness(theme.notifications?.[type], 0.02)};
      }
    `}
`;

const StyledNotificationContentWrapper = styled.div`
  flex: 1;
  min-height: 40px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  padding: 10px 0;
`;

const StyledNotificationTitle = styled.h4`
  margin: 0 0 5px 0;
  padding: 0;
  display: flex;
  align-items: center;
`;

const StyledNotificationContent = styled.p`
  margin: 0;
  padding: 0;
`;

const typeToIcon: { [type: string]: IReqoreIconName } = {
  info: 'InformationLine',
  pending: 'TimerLine',
  warning: 'AlarmWarningLine',
  danger: 'ErrorWarningLine',
  success: 'CheckFill',
};

const ReqoreNotification: React.FC<IReqoreNotificationProps> = forwardRef(
  (
    {
      type = 'info',
      icon,
      title,
      content,
      onClose,
      onClick,
      duration,
      onFinish,
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
    }, [duration, type, content, title]);

    useUnmount(() => {
      clearTimeout(internalTimeout);
    });

    return (
      <ReqoreThemeProvider>
        <StyledReqoreNotification
          key={`${duration}${type}${title}${content}`}
          type={type}
          timeout={duration}
          clickable={!!onClick}
          onClick={onClick}
          className='reqore-notification'
          ref={ref}
        >
          <StyledIconWrapper type={type}>
            <ReqoreIcon icon={icon || typeToIcon[type]} />
          </StyledIconWrapper>
          <StyledNotificationContentWrapper>
            {title && (
              <StyledNotificationTitle>{title}</StyledNotificationTitle>
            )}
            <StyledNotificationContent>{content}</StyledNotificationContent>
          </StyledNotificationContentWrapper>
          <StyledIconWrapper
            type={type}
            clickable
            className='reqore-notification-close'
            onClick={(event) => {
              event.stopPropagation();
              onClose && onClose();
            }}
          >
            <ReqoreIcon icon='CloseFill' />
          </StyledIconWrapper>
        </StyledReqoreNotification>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreNotification;
