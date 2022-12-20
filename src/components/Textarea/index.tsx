import { rgba } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import { useReqoreTheme } from '../../hooks/useTheme';
import { useTooltip } from '../../hooks/useTooltip';
import { DisabledElement, ReadOnlyElement } from '../../styles';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IReqoreReadOnly,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreTooltip,
} from '../../types/global';
import { StyledEffect } from '../Effect';
import { IReqoreInputStyle } from '../Input';
import ReqoreInputClearButton from '../InputClearButton';

export interface IReqoreTextareaProps
  extends React.HTMLAttributes<HTMLTextAreaElement>,
    IReqoreReadOnly,
    IReqoreDisabled,
    IWithReqoreCustomTheme,
    IWithReqoreTooltip,
    IReqoreIntent,
    IWithReqoreEffect {
  autoFocus?: boolean;
  width?: number;
  height?: number;
  scaleWithContent?: boolean;
  size?: TSizes;
  minimal?: boolean;
  fluid?: boolean;
  value?: string;
  rows?: number;
  cols?: number;
  rounded?: boolean;
  flat?: boolean;
  onClearClick?: () => any;
}

export interface IReqoreTextareaStyle extends IReqoreTextareaProps {
  theme: IReqoreTheme;
  _size?: TSizes;
}

export const StyledTextareaWrapper = styled.div<IReqoreTextareaStyle>`
  height: ${({ height }) => (height ? `${height}px` : undefined)};
  width: ${({ width, fluid }) => (fluid ? '100%' : width ? `${width}px` : 'auto')};
  flex: ${({ fluid }) => (fluid ? '1' : undefined)};
  position: relative;
  overflow: hidden;
`;

export const StyledTextarea = styled(StyledEffect)<IReqoreTextareaStyle>`
  height: 100%;
  width: 100%;
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  margin: 0;
  padding: 5px 7px;
  resize: none;

  background-color: ${({ theme, minimal }: IReqoreInputStyle) =>
    minimal ? 'transparent' : rgba(theme.main, 0.1)};
  color: ${({ theme }: IReqoreInputStyle) =>
    getReadableColor(theme, undefined, undefined, true, theme.originalMain)};

  transition: all 0.2s ease-out;

  &:active,
  &:focus {
    background-color: ${({ theme, minimal }: IReqoreInputStyle) =>
      minimal ? 'transparent' : rgba(theme.main, 0.15)};
  }

  border-radius: ${({ minimal, rounded, _size }) =>
    minimal || !rounded ? 0 : RADIUS_FROM_SIZE[_size]}px;
  border: ${({ minimal, theme, flat }) =>
    !minimal && !flat ? `1px solid ${changeLightness(theme.main, 0.05)}` : 0};
  border-bottom: ${({ minimal, theme, flat }) =>
    minimal && !flat ? `0.5px solid ${changeLightness(theme.main, 0.05)}` : undefined};

  transition: all 0.2s ease-out;

  ${({ disabled, readOnly }) =>
    !disabled && !readOnly
      ? css`
          &:active,
          &:focus,
          &:hover {
            outline: none;
            border-color: ${({ theme }) => changeLightness(theme.main, 0.1)};
          }
        `
      : undefined}

  &::placeholder {
    transition: all 0.2s ease-out;
    color: ${({ theme }) =>
      rgba(getReadableColor(theme, undefined, undefined, true, theme.originalMain), 0.3)};
  }

  &:focus {
    &::placeholder {
      color: ${({ theme }) =>
        rgba(getReadableColor(theme, undefined, undefined, true, theme.originalMain), 0.5)};
    }
  }

  ${({ readOnly }) => readOnly && ReadOnlyElement};

  &:disabled {
    ${DisabledElement};
  }
`;

const ReqoreInput = forwardRef(
  (
    {
      width,
      height,
      scaleWithContent,
      size = 'normal',
      className,
      onClearClick,
      fluid,
      tooltip,
      customTheme,
      intent,
      rounded = true,
      ...rest
    }: IReqoreTextareaProps,
    ref: any
  ) => {
    const { targetRef } = useCombinedRefs(ref);
    const theme = useReqoreTheme('main', customTheme, intent);

    useTooltip(targetRef?.current, tooltip);

    return (
      <StyledTextareaWrapper
        className={`${className || ''} reqore-control-wrapper`}
        width={width}
        height={height}
        fluid={fluid}
        _size={size}
        theme={theme}
      >
        <StyledTextarea
          {...rest}
          effect={{
            interactive: !rest?.disabled && !rest.readOnly,
            ...rest?.effect,
          }}
          as='textarea'
          className={`${className || ''} reqore-control reqore-textarea`}
          _size={size}
          ref={targetRef}
          theme={theme}
          rounded={rounded}
          rows={scaleWithContent ? (rest?.value?.split(/\r\n|\r|\n/).length || 1) + 1 : rest.rows}
        />
        {!rest.readOnly && (
          <ReqoreInputClearButton
            enabled={!rest?.disabled && !!(onClearClick && rest?.onChange)}
            show={rest?.value && rest.value !== ''}
            onClick={onClearClick}
            size='big'
          />
        )}
      </StyledTextareaWrapper>
    );
  }
);

export default ReqoreInput;
