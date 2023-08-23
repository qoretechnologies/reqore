import { animated, useTransition } from '@react-spring/web';
import { rgba } from 'polished';
import React, { forwardRef, useEffect, useState } from 'react';
import { useMount, useUnmount } from 'react-use';
import styled, { css, keyframes } from 'styled-components';
import { SPRING_CONFIG } from '../../constants/animations';
import {
  ICON_WRAPPER_FROM_HEADER_SIZE,
  PADDING_FROM_SIZE,
  TABS_SIZE_TO_PX,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import { fadeIn } from '../../helpers/animations';
import {
  changeDarkness,
  changeLightness,
  getNotificationIntent,
  getReadableColor,
} from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreMinimal,
  IWithReqoreOpaque,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect } from '../Effect';
import { ReqoreHeading } from '../Header';
import ReqoreIcon from '../Icon';
import { ReqoreSpinner } from '../Spinner';

export type IReqoreNotificationType = TReqoreIntent;

export interface IReqoreNotificationProps
  extends IWithReqoreEffect,
    IWithReqoreMinimal,
    IWithReqoreOpaque,
    IWithReqoreCustomTheme {
  type?: IReqoreNotificationType;
  intent?: TReqoreIntent;
  title?: string;
  content: string | React.ReactNode;
  icon?: IReqoreIconName;
  onClose?: () => any;
  onClick?: () => any;
  duration?: number;
  onFinish?: () => any;
  fluid?: boolean;
  flat?: boolean;
  size?: TSizes;
}

export interface IReqoreNotificationStyle extends IWithReqoreOpaque {
  theme: IReqoreTheme;
  type?: IReqoreNotificationType;
  clickable?: boolean;
  timeout?: number;
  intent?: TReqoreIntent;
  hasShadow?: boolean;
  fluid?: boolean;
  flat?: boolean;
  minimal?: boolean;
  size?: TSizes;
  asMessage?: boolean;
  margin?: 'top' | 'bottom' | 'both' | 'none';
}

const timeoutAnimation = keyframes`
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
`;

export const StyledReqoreNotification = styled(StyledEffect)<IReqoreNotificationStyle>`
  min-width: ${({ fluid }) => (!fluid ? '30px' : undefined)};
  max-width: ${({ maxWidth, fluid, fixed }) => maxWidth || (fluid && !fixed ? '100%' : undefined)};
  border-radius: 5px;
  min-height: ${({ size = 'normal' }: IReqoreNotificationStyle) => TABS_SIZE_TO_PX[size]}px;
  display: flex;
  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  align-self: ${({ fixed, fluid }) => (fixed ? 'flex-start' : fluid ? 'stretch' : undefined)};
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease-out;

  ${({ margin, size = 'normal' }) => css`
    margin-top: ${margin === 'top' || margin === 'both'
      ? `${PADDING_FROM_SIZE[size]}px`
      : undefined};
    margin-bottom: ${margin === 'bottom' || margin === 'both'
      ? `${PADDING_FROM_SIZE[size]}px`
      : undefined};
  `};

  // Do not fade in the component if it's a message
  ${({ asMessage }) => {
    if (asMessage) {
      return undefined;
    }
    return css`
      animation: 0.2s ${fadeIn} ease-in;
    `;
  }}

  &:not(:first-child) {
    margin-top: ${({ asMessage, size }) =>
      asMessage ? undefined : `${PADDING_FROM_SIZE[size]}px`};
  }

  ${({
    theme,
    type,
    intent,
    clickable,
    timeout,
    hasShadow,
    flat,
    minimal,
    opaque = true,
  }: IReqoreNotificationStyle) => css`
    background-color: ${minimal
      ? 'transparent'
      : opaque
      ? changeLightness(theme.main, 0.1)
      : rgba(getNotificationIntent(theme, intent || type), 0.3)};
    border: ${flat ? 0 : '1px solid'};
    border-color: ${changeLightness(getNotificationIntent(theme, intent || type), 0.2)};

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
        background-color: ${changeLightness(getNotificationIntent(theme, intent || type), 0.2)};
        animation-name: ${timeoutAnimation};
        animation-duration: ${timeout}ms;
      }
    `}

    color: ${getReadableColor(theme, null, null, true, minimal ? theme.originalMain : undefined)};

    ${clickable &&
    css`
      cursor: pointer;
      &:hover {
        background-color: ${minimal
          ? 'transparent'
          : opaque
          ? changeDarkness(theme.main, 0.002)
          : rgba(getNotificationIntent(theme, intent || type), 0.4)};
        border-color: ${changeLightness(getNotificationIntent(theme, intent || type), 0.25)};
      }
    `}
  `}
`;

export const StyledIconWrapper = styled.div<IReqoreNotificationStyle>`
  height: ${({ size = 'normal' }: IReqoreNotificationStyle) =>
    ICON_WRAPPER_FROM_HEADER_SIZE[size]}px;
  flex: 0 1 auto;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;
  margin-top: ${({ size = 'normal' }: IReqoreNotificationStyle) => `${PADDING_FROM_SIZE[size]}px`};

  ${({ clickable, theme, intent, type }) =>
    clickable &&
    css`
      margin-top: unset;
      height: unset;

      .reqore-icon {
        transform: scale(0.85);
      }

      &:hover {
        cursor: pointer;
        background-color: ${changeLightness(getNotificationIntent(theme, intent || type), 0.02)};
        .reqore-icon {
          transform: scale(1);
        }
      }
    `}
`;

export const StyledNotificationContentWrapper = styled.div<IReqoreNotificationStyle>`
  flex: 1;
  min-height: ${({ size = 'normal' }: IReqoreNotificationStyle) => TABS_SIZE_TO_PX[size]}px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  padding: ${({ size = 'normal' }: IReqoreNotificationStyle) => `${PADDING_FROM_SIZE[size]}px`};
`;

export const StyledNotificationTitle = styled.h4`
  margin: 0 0 5px 0;
  padding: 0;
  display: flex;
  align-items: center;
`;

export const StyledNotificationContent = styled.div`
  margin: 0;
  padding: 0;
  flex: 1;
  font-size: ${({ size = 'normal' }) => TEXT_FROM_SIZE[size]}px;
  overflow-wrap: anywhere;

  ${({ hasTitle, size = 'normal' }) =>
    hasTitle &&
    css`
      padding-top: ${PADDING_FROM_SIZE[size]}px;
    `}
`;

export const typeToIcon: { [type: string]: IReqoreIconName } = {
  info: 'InformationLine',
  pending: 'TimerLine',
  warning: 'AlarmWarningLine',
  danger: 'ErrorWarningLine',
  success: 'CheckFill',
  muted: 'Forbid2Line',
};

const ReqoreNotification = forwardRef<HTMLDivElement, IReqoreNotificationProps>(
  (
    {
      type,
      intent,
      icon,
      title,
      content,
      onClose,
      onClick,
      duration,
      onFinish,
      flat,
      minimal,
      opaque = true,
      size = 'normal',
      customTheme,
    },
    ref: any
  ) => {
    const [internalTimeout, setInternalTimeout] = useState(null);
    const theme = useReqoreTheme('main', customTheme, type || intent, 'notifications');

    const transitions = useTransition(true, {
      from: { opacity: 0, transform: 'scale(0.9)' },
      enter: { opacity: 1, transform: 'scale(1)' },
      leave: { opacity: 0, transform: 'scale(0.9)' },
      config: SPRING_CONFIG,
    });

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
    }, [duration, type, intent, content, title]);

    useUnmount(() => {
      clearTimeout(internalTimeout);
    });

    return transitions((styles, item) =>
      item ? (
        <ReqoreThemeProvider>
          <StyledReqoreNotification
            as={animated.div}
            key={`${duration}${type || intent}${title}${content}`}
            type={type || intent}
            hasShadow
            timeout={duration}
            clickable={!!onClick}
            onClick={() => onClick?.()}
            flat={flat}
            minimal={minimal}
            className='reqore-notification'
            ref={ref}
            style={styles}
            size={size}
            opaque={opaque}
            theme={theme}
            maxWidth='450px'
          >
            {type || intent || icon ? (
              <StyledIconWrapper type={type || intent} size={size}>
                {intent === 'pending' || type === 'pending' ? (
                  <ReqoreSpinner size={size} type={5} iconMargin={'both'} />
                ) : (
                  <ReqoreIcon
                    icon={icon || typeToIcon[type || intent]}
                    margin={'both'}
                    size={size}
                  />
                )}
              </StyledIconWrapper>
            ) : null}
            <StyledNotificationContentWrapper size={size} theme={theme}>
              {title && <ReqoreHeading size={size}>{title}</ReqoreHeading>}
              <StyledNotificationContent theme={theme} hasTitle={!!title} size={size}>
                {content}
              </StyledNotificationContent>
            </StyledNotificationContentWrapper>
            <StyledIconWrapper
              type={type || intent}
              size={size}
              clickable
              className='reqore-notification-close'
              onClick={(event) => {
                event.stopPropagation();
                onClose && onClose();
              }}
            >
              <ReqoreIcon icon='CloseFill' margin='both' size={size} />
            </StyledIconWrapper>
          </StyledReqoreNotification>
        </ReqoreThemeProvider>
      ) : null
    );
  }
);

export default ReqoreNotification;
