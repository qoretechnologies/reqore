import { darken, lighten, rgba } from 'polished';
import React, { forwardRef, useEffect, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import styled, { css, keyframes } from 'styled-components';
import { PADDING_FROM_SIZE, TABS_SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { fadeIn } from '../../helpers/animations';
import { changeLightness, getNotificationIntent, getReadableColorFrom } from '../../helpers/colors';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';

export type IReqoreNotificationType = 'info' | 'success' | 'danger' | 'pending' | 'warning';

export interface IReqoreNotificationProps {
  type?: IReqoreNotificationType;
  intent?: IReqoreIntent;
  title?: string;
  content: string;
  icon?: IReqoreIconName;
  onClose?: () => any;
  onClick?: () => any;
  duration?: number;
  onFinish?: () => any;
  fluid?: boolean;
  flat?: boolean;
}

export interface IReqoreNotificationStyle {
  theme: IReqoreTheme;
  type?: IReqoreNotificationType;
  clickable?: boolean;
  timeout?: number;
  intent?: IReqoreIntent;
  hasShadow?: boolean;
  fluid?: boolean;
  flat?: boolean;
  inverted?: boolean;
  size?: TSizes;
}

const timeoutAnimation = keyframes`
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
`;

export const StyledReqoreNotification = styled.div<IReqoreNotificationStyle>`
  min-width: 200px;
  max-width: ${({ fluid }) => (!fluid ? '450px' : undefined)};
  border-radius: 5px;
  min-height: ${({ size = 'normal' }: IReqoreNotificationStyle) => TABS_SIZE_TO_PX[size]}px;
  display: flex;
  flex: 0 1 auto;
  overflow: auto;
  position: relative;
  transition: background-color 0.1s linear;
  animation: 0.1s ${fadeIn} ease-in;
  font-size: ${({ size = 'normal' }) => TEXT_FROM_SIZE[size]}px;

  &:not(:first-child) {
    margin-top: 10px;
  }

  ${({
    theme,
    type,
    intent,
    clickable,
    timeout,
    hasShadow,
    flat,
    inverted,
  }: IReqoreNotificationStyle) => css`
    background-color: ${inverted ? 'transparent' : getNotificationIntent(theme, intent || type)};
    border: ${flat ? 0 : '1px solid'};
    border-color: ${inverted
      ? getNotificationIntent(theme, intent || type)
      : darken(0.2, getNotificationIntent(theme, intent || type))};

    ${hasShadow &&
    css`
      box-shadow: 0px 0px 30px 10px ${rgba('#000000', 0.3)};
    `}

    ${timeout &&
    css`
      &::before {
        content: '';
        position: absolute;
        display: block;
        top: 0;
        height: 3px;
        background-color: ${changeLightness(getNotificationIntent(theme, intent || type), 0.1)};
        animation-name: ${timeoutAnimation};
        animation-duration: ${timeout}ms;
      }
    `}

    color: ${inverted && (intent || type)
      ? getNotificationIntent(theme, intent || type)
      : getReadableColorFrom(getNotificationIntent(theme, intent || type), true)};

    ${clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${inverted
          ? 'transparent'
          : lighten(0.0625, getNotificationIntent(theme, intent || type))};
      }
    `}
  `}
`;

export const StyledIconWrapper = styled.div<IReqoreNotificationStyle>`
  min-height: ${({ size = 'normal' }: IReqoreNotificationStyle) => TABS_SIZE_TO_PX[size]}px;
  flex: 0 1 auto;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s linear;

  ${({ clickable, theme, intent, type }) =>
    clickable &&
    css`
      &:hover {
        cursor: pointer;
        background-color: ${changeLightness(getNotificationIntent(theme, intent || type), 0.02)};
      }
    `}
`;

export const StyledNotificationContentWrapper = styled.div<IReqoreNotificationStyle>`
  flex: 1;
  min-height: ${({ size = 'normal' }: IReqoreNotificationStyle) => TABS_SIZE_TO_PX[size]}px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  padding: ${({ size = 'normal' }: IReqoreNotificationStyle) => `${PADDING_FROM_SIZE[size]}px 0px`};
`;

export const StyledNotificationTitle = styled.h4`
  margin: 0 0 5px 0;
  padding: 0;
  display: flex;
  align-items: center;
`;

export const StyledNotificationContent = styled.p`
  margin: 0;
  padding: 0;
  flex: 1;
  display: flex;
  align-items: center;
`;

export const typeToIcon: { [type: string]: IReqoreIconName } = {
  info: 'InformationLine',
  pending: 'TimerLine',
  warning: 'AlarmWarningLine',
  danger: 'ErrorWarningLine',
  success: 'CheckFill',
};

const ReqoreNotification: React.FC<IReqoreNotificationProps> = forwardRef(
  (
    { type = 'info', icon, title, content, onClose, onClick, duration, onFinish, flat },
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
          hasShadow
          timeout={duration}
          clickable={!!onClick}
          onClick={onClick}
          flat={flat}
          className='reqore-notification'
          ref={ref}
        >
          <StyledIconWrapper type={type}>
            <ReqoreIcon icon={icon || typeToIcon[type]} margin={'both'} />
          </StyledIconWrapper>
          <StyledNotificationContentWrapper>
            {title && <StyledNotificationTitle>{title}</StyledNotificationTitle>}
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
            <ReqoreIcon icon='CloseFill' margin='both' />
          </StyledIconWrapper>
        </StyledReqoreNotification>
      </ReqoreThemeProvider>
    );
  }
);

export default ReqoreNotification;
