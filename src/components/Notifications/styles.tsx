import { rgba } from 'polished';
import styled, { css, keyframes } from 'styled-components';
import { PADDING_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { fadeIn } from '../../helpers/animations';
import { changeDarkness, changeLightness, getNotificationIntent, getReadableColor } from '../../helpers/colors';
import { omitStyleProps } from '../../helpers/styled';
import { resolvePadding, TReqorePadded } from '../../helpers/utils';
import { RaisedElement } from '../../styles';
import { IWithReqoreOpaque } from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect } from '../Effect';

/**
 * The classic notification surface, shared with `ReqoreMessage`. Kept in its
 * own module so that Message — which sits under Popover, under Icon — never
 * has to load the notification COMPONENT and everything it renders with
 * (buttons, control groups); a component that deep in the graph would drag
 * Button, Panel and Input in before Icon finished evaluating.
 */

export type IReqoreNotificationType = TReqoreIntent;

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
  backgroundBlur?: number;
  raised?: boolean;
  $padded?: TReqorePadded;
  $paddingSize?: TSizes;
}

const timeoutAnimation = keyframes`
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
`;

export const StyledReqoreNotification = styled(StyledEffect).withConfig({
  // The notification renders as `animated.div` (see `as` below), so styled-components
  // treats it as a component target and forwards everything not listed here — react-spring
  // then spreads the leftovers onto the real `<div>`. Every styling-only prop the css
  // blocks read must therefore be named explicitly; the DOM-attribute validator does not
  // apply to a component target and cannot catch them.
  shouldForwardProp: omitStyleProps(
    'asMessage',
    'backgroundBlur',
    'blur',
    'clickable',
    'fill',
    'fixed',
    'flat',
    'fluid',
    'hasShadow',
    'margin',
    'maxWidth',
    'minimal',
    'opaque',
    'raised',
    'spaceBetween',
    'stack',
    'timeout'
  ),
})<IReqoreNotificationStyle>`
  min-width: ${({ fluid }) => (!fluid ? '30px' : undefined)};
  max-width: ${({ maxWidth, fluid, fixed }) => maxWidth || (fluid && !fixed ? '100%' : undefined)};
  border-radius: 5px;
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
    backgroundBlur,
    raised,
  }: IReqoreNotificationStyle) => css`
    background-color: ${minimal
      ? 'transparent'
      : opaque
      ? changeLightness(theme.main, 0.1)
      : rgba(getNotificationIntent(theme, intent || type), 0.3)};
    border: ${flat ? 0 : '1px solid'};
    border-color: ${changeLightness(getNotificationIntent(theme, intent || type), 0.2)};

    ${backgroundBlur &&
    css`
      backdrop-filter: blur(${backgroundBlur}px);
    `}

    ${hasShadow &&
    css`
      box-shadow: 0px 0px 30px 10px ${rgba('#000000', 0.3)};
    `}

    ${raised && flat && !minimal && RaisedElement}

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

    color: ${minimal || !opaque
      ? 'inherit'
      : getReadableColor(theme, null, null, true, minimal ? theme.originalMain : undefined)};

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
  flex: 0 1 auto;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-out;

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

export const StyledNotificationInnerContent = styled.div<IReqoreNotificationStyle>`
  flex: 1;
  display: flex;
  flex-flow: column;
  justify-content: center;

  .reqore-heading {
    line-height: 1;
  }
`;

export const StyledNotificationContentWrapper = styled.div<IReqoreNotificationStyle>`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: ${({ size = 'normal', $padded = true, $paddingSize }: IReqoreNotificationStyle) =>
    resolvePadding({
      padded: $padded,
      paddingSize: $paddingSize ?? size,
      verticalMultiplier: 1,
      horizontalMultiplier: 1,
    })};
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
  display: flex;
  flex-flow: column;
  justify-content: center;

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

