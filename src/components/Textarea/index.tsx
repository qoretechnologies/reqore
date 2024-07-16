import { rgba } from 'polished';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { ReqoreDropdown } from '../..';
import {
  CONTROL_TEXT_FROM_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  SIZE_TO_PX,
  TSizes,
} from '../../constants/sizes';
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
import { IReqoreDropdownProps } from '../Dropdown';
import { StyledEffect } from '../Effect';
import { IReqoreInputStyle } from '../Input';
import ReqoreInputClearButton from '../InputClearButton';

export interface IReqoreFormTemplates extends IReqoreDropdownProps {}

export interface IReqoreTextareaProps
  extends React.HTMLAttributes<HTMLTextAreaElement>,
    IReqoreReadOnly,
    IReqoreDisabled,
    IWithReqoreCustomTheme,
    IWithReqoreTooltip,
    IReqoreIntent,
    IWithReqoreEffect {
  autoFocus?: boolean;
  placeholder?: string;
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
  templates?: IReqoreFormTemplates;
  transparent?: boolean;
  as?: React.ElementType;
}

export interface IReqoreTextareaStyle extends IReqoreTextareaProps {
  theme: IReqoreTheme;
  hasClearButton?: boolean;
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

  &:focus-within {
    .reqore-clear-input-button {
      display: flex;
    }
  }
`;

export const StyledTextarea = styled(StyledEffect)<IReqoreTextareaStyle>`
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  font-size: ${({ _size = 'normal' }) => CONTROL_TEXT_FROM_SIZE[_size]}px;
  margin: 0;
  padding: ${({ _size = 'normal' }) => PADDING_FROM_SIZE[_size] / 2}px;
  padding-right: ${({ hasClearButton, _size = 'normal' }) =>
    hasClearButton ? `${SIZE_TO_PX[_size]}px` : undefined};
  min-height: ${({ _size = 'normal' }) => SIZE_TO_PX[_size]}px;
  line-height: ${({ _size = 'normal' }) => SIZE_TO_PX[_size] - CONTROL_TEXT_FROM_SIZE[_size]}px;
  vertical-align: middle;

  background-color: ${({ theme, minimal, transparent }: IReqoreTextareaStyle) =>
    minimal || transparent ? 'transparent' : rgba(theme.main, 0.1)};
  color: ${({ theme }: IReqoreInputStyle) =>
    getReadableColor(theme, undefined, undefined, true, theme.originalMain)};

  &:active,
  &:focus {
    background-color: ${({ theme, minimal, transparent }: IReqoreTextareaStyle) =>
      minimal || transparent ? 'transparent' : rgba(theme.main, 0.15)};
  }

  border-radius: ${({ minimal, rounded = true, _size = 'normal' }) =>
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
      templates,
      ...rest
    }: IReqoreTextareaProps,
    ref
  ) => {
    const { targetRef }: any = useCombinedRefs(ref);
    const [inputRef, setInputRef] = useState<HTMLTextAreaElement>(null);
    const theme = useReqoreTheme('main', customTheme, intent);
    const [_value, setValue] = useState(value || '');

    useEffect(() => {
      setValue(value || '');
    }, [value]);

    useTooltip(inputRef, tooltip);
    useAutosizeTextArea(inputRef, _value, scaleWithContent);
    useAutoFocus(inputRef, rest.readOnly || rest.disabled ? undefined : focusRules, onChange);

    const handleItemSelect = useCallback(
      (item) => {
        if (!inputRef || !item || !item.value) {
          return;
        }
        // Add the value of the selected item to the current value at the cursor position
        const value = `${_value.slice(0, inputRef.selectionStart)}${item.value}${_value.slice(
          inputRef.selectionEnd
        )}`;

        setValue(value);
        // Trigger the onChange event
        onChange?.({ target: { value } } as any);
      },
      [inputRef, _value]
    );

    const renderChildren = () => {
      return (
        <>
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
            as={rest.as || 'textarea'}
            className={`${className || ''} reqore-control reqore-textarea`}
            _size={size}
            ref={(ref) => setInputRef(ref)}
            theme={theme}
            rounded={rounded}
            rows={1}
            value={_value}
            readonly={rest?.readOnly}
            tabIndex={rest?.disabled ? -1 : 0}
            hasClearButton={!rest?.readOnly && !rest?.disabled && !!(onClearClick && onChange)}
          />
          <ReqoreInputClearButton
            enabled={!rest?.readOnly && !rest?.disabled && !!(onClearClick && onChange)}
            show={_value && _value !== ''}
            onClick={onClearClick}
            size={size}
          />
        </>
      );
    };

    if (templates) {
      return (
        <ReqoreDropdown<Omit<IReqoreTextareaStyle & { ref: any }, 'content'>>
          component={StyledTextareaWrapper}
          className={`${className || ''} reqore-control-wrapper`}
          width={width}
          filterable
          height={height}
          fluid={fluid}
          fixed={fixed}
          _size={size}
          theme={theme}
          style={wrapperStyle}
          ref={targetRef}
          onItemSelect={handleItemSelect}
          {...templates}
        >
          {renderChildren()}
        </ReqoreDropdown>
      );
    }

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
        ref={targetRef}
      >
        {renderChildren()}
      </StyledTextareaWrapper>
    );
  }
);

export default ReqoreInput;
