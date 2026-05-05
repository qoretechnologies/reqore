import { forwardRef, memo } from 'react';
import { rgba } from 'polished';
import styled, { css } from 'styled-components';
import { PADDING_FROM_SIZE, TEXT_FROM_SIZE } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import {
  changeDarkness,
  changeLightness,
  getMainBackgroundColor,
  getReadableColor,
} from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { DisabledElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFixed,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreEffect, StyledEffect, StyledTextEffect } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreCalloutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFixed,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  accentPosition?: 'left' | 'top';
  accentSize?: number;
  contentEffect?: IReqoreEffect;
  rounded?: boolean;
  interactive?: boolean;
}

interface IStyledCalloutProps extends IReqoreCalloutProps {
  theme: IReqoreTheme;
}

const StyledCallout = styled(StyledEffect)<IStyledCalloutProps>`
  position: relative;
  display: flex;
  align-items: center;
  width: ${({ fluid, fixed }) => (fluid && !fixed ? '100%' : undefined)};
  max-width: 100%;
  padding: ${({ size = 'normal', accentPosition = 'left', accentSize = 5 }) =>
    accentPosition === 'left'
      ? `${PADDING_FROM_SIZE[size] * 2.5}px ${PADDING_FROM_SIZE[size] * 3}px ${
          PADDING_FROM_SIZE[size] * 2.5
        }px ${PADDING_FROM_SIZE[size] * 3 + accentSize}px`
      : `${PADDING_FROM_SIZE[size] * 3 + accentSize}px ${PADDING_FROM_SIZE[size] * 3}px ${
          PADDING_FROM_SIZE[size] * 3
        }px`};
  background-color: ${({ theme }) => changeDarkness(getMainBackgroundColor(theme), 0.03)};
  border: ${({ theme, flat }) =>
    flat ? 0 : `1px solid ${changeLightness(getMainBackgroundColor(theme), 0.08)}`};
  border-radius: ${({ rounded }) => (rounded ? '8px' : 0)};
  overflow: hidden;
  flex: ${({ fluid }) => (fluid ? '1 auto' : '0 0 auto')};
  transition:
    background-color 0.16s ease,
    transform 0.16s ease;

  &::before {
    content: '';
    position: absolute;
    ${({ accentPosition = 'left', accentSize = 5 }) =>
      accentPosition === 'left'
        ? css`
            top: 0;
            bottom: 0;
            left: 0;
            width: ${accentSize}px;
          `
        : css`
            top: 0;
            right: 0;
            left: 0;
            height: ${accentSize}px;
          `}
    background-color: ${({ theme, intent }) =>
      intent ? theme.intents[intent] : changeLightness(getMainBackgroundColor(theme), 0.22)};
  }

  ${({ disabled }) => disabled && DisabledElement}

  ${({ interactive, theme, intent }) =>
    interactive
      ? css`
          cursor: pointer;

          &:hover {
            transform: translateY(-1px);
            background-color: ${changeLightness(
              intent ? theme.intents[intent] : getMainBackgroundColor(theme),
              -0.32
            )};
          }
        `
      : undefined}
`;

const StyledCalloutContent = styled(StyledTextEffect)<{
  size: IReqoreCalloutProps['size'];
  theme: IReqoreTheme;
}>`
  color: ${({ theme }) => rgba(getReadableColor(theme, undefined, undefined, true), 0.84)};
  font-size: ${({ size = 'normal' }) => TEXT_FROM_SIZE[size] * 1.2}px;
  line-height: 1.25;
  font-weight: 800;
`;

export const ReqoreCallout = memo(
  forwardRef<HTMLDivElement, IReqoreCalloutProps>(
    (
      {
        children,
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        intent,
        className,
        flat,
        fluid,
        fixed,
        disabled,
        tooltip,
        rounded,
        effect,
        contentEffect,
        interactive,
        onClick,
        accentPosition = 'left',
        accentSize = 5,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);
      const isInteractive = interactive || !!onClick;

      return (
        <ReqoreTooltipComponent
          {...rest}
          ref={ref}
          Component={StyledCallout}
          theme={theme}
          customTheme={customTheme}
          inheritCustomTheme={inheritCustomTheme}
          intent={intent}
          flat={flat}
          fluid={fluid}
          fixed={fixed}
          disabled={disabled}
          tooltip={tooltip}
          rounded={rounded}
          effect={{ interactive: isInteractive, ...effect }}
          interactive={isInteractive}
          onClick={onClick}
          size={size}
          accentPosition={accentPosition}
          accentSize={accentSize}
          className={`${className || ''} reqore-callout`}
        >
          <StyledCalloutContent
            theme={theme}
            size={size}
            effect={contentEffect || {}}
            className='reqore-callout-content'
          >
            {children}
          </StyledCalloutContent>
        </ReqoreTooltipComponent>
      );
    }
  )
);

export default ReqoreCallout;
