import { rgba } from 'polished';
import React, { forwardRef, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { RADIUS_FROM_SIZE, SIZE_TO_PX, TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getReadableColor } from '../../helpers/colors';
import { IReqoreAutoFocusRules, useAutoFocus } from '../../hooks/useAutoFocus';
import { useCombinedRefs } from '../../hooks/useCombinedRefs';
import useAutosizeTextArea from '../../hooks/useTextareaAutoSize';
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
  fixed?: boolean;
  onClearClick?: () => any;
  wrapperStyle?: React.CSSProperties;
  focusRules?: IReqoreAutoFocusRules;
}

export interface IReqoreTextareaStyle extends IReqoreTextareaProps {
  theme: IReqoreTheme;
  _size?: TSizes;
}

export const StyledTextareaWrapper = styled.div<IReqoreTextareaStyle>`
  height: ${({ height }) => (height ? `${height}px` : undefined)};
  min-height: ${({ _size }) => SIZE_TO_PX[_size]}px;
  max-height: 100%;
  width: ${({ width, fluid }) => (fluid ? '100%' : width ? `${width}px` : 'auto')};
  flex: ${({ fluid, fixed }) => (fixed ? '0 0 auto' : fluid ? '1 auto' : '0 0 auto')};
  align-self: ${({ fixed, fluid }) => (fixed ? 'flex-start' : fluid ? 'stretch' : undefined)};
  position: relative;
  overflow: hidden;
`;

export const StyledTextarea = styled(StyledEffect)<IReqoreTextareaStyle>`
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  margin: 0;
  padding: 5px 7px;
  min-height: ${({ _size }) => SIZE_TO_PX[_size]}px;

  background-color: ${({ theme, minimal }: IReqoreInputStyle) =>
    minimal ? 'transparent' : rgba(theme.main, 0.1)};
  color: ${({ theme }: IReqoreInputStyle) =>
    getReadableColor(theme, undefined, undefined, true, theme.originalMain)};

  &:active,
  &:focus {
    background-color: ${({ theme, minimal }: IReqoreInputStyle) =>
      minimal ? 'transparent' : rgba(theme.main, 0.15)};
  }

  border-radius: ${({ minimal, rounded, _size }) =>
    minimal || !rounded ? 0 : RADIUS_FROM_SIZE[_size]}px;
  border: ${({ minimal, theme, flat }) =>
    !minimal && !flat ? `1px solid ${changeLightness(theme.main, 0.2)}` : 0};
  border-bottom: ${({ minimal, theme, flat }) =>
    minimal && !flat ? `0.5px solid ${changeLightness(theme.main, 0.2)}` : undefined};

  ${({ disabled, readOnly }) =>
    !disabled && !readOnly
      ? css`
          &:active,
          &:focus,
          &:hover {
            outline: none;
            border-color: ${({ theme }) => changeLightness(theme.main, 0.35)};
          }
        `
      : undefined}

  &::placeholder {
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

const ReqoreInput = forwardRef<HTMLTextAreaElement, IReqoreTextareaProps>(
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
      wrapperStyle,
      value,
      onChange,
      fixed,
      focusRules,
      ...rest
    }: IReqoreTextareaProps,
    ref
  ) => {
    const { targetRef }: any = useCombinedRefs(ref);
    const theme = useReqoreTheme('main', customTheme, intent);
    const [_value, setValue] = useState(value || '');

    useEffect(() => {
      setValue(value || '');
    }, [value]);

    useTooltip(targetRef?.current, tooltip);
    useAutosizeTextArea(targetRef?.current, _value, scaleWithContent);
    useAutoFocus(
      targetRef.current,
      rest.readOnly || rest.disabled ? undefined : focusRules,
      onChange
    );

    return (
      <StyledTextareaWrapper
        className={`${className || ''} reqore-control-wrapper`}
        width={width}
        height={height}
        fluid={fluid}
        fixed={fixed}
        _size={size}
        theme={theme}
        style={wrapperStyle}
      >
        <StyledTextarea
          {...rest}
          effect={{
            interactive: !rest?.disabled && !rest.readOnly,
            ...rest?.effect,
          }}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e);
          }}
          as='textarea'
          className={`${className || ''} reqore-control reqore-textarea`}
          _size={size}
          ref={targetRef}
          theme={theme}
          rounded={rounded}
          rows={1}
          value={_value}
          readonly={rest?.readOnly}
        />
        <ReqoreInputClearButton
          enabled={!rest?.readOnly && !rest?.disabled && !!(onClearClick && onChange)}
          show={_value && _value !== ''}
          onClick={onClearClick}
          size={size}
        />
      </StyledTextareaWrapper>
    );
  }
);

export default ReqoreInput;
