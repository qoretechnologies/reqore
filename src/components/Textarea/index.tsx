import { darken, rgba } from 'polished';
import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import ReqoreInputClearButton from '../InputClearButton';

export interface IReqoreTextareaProps extends React.HTMLAttributes<HTMLTextAreaElement> {
  autoFocus?: boolean;
  disabled?: boolean;
  width?: number;
  height?: number;
  scaleWithContent?: boolean;
  size?: TSizes;
  minimal?: boolean;
  fluid?: boolean;
  value?: string;
  rows?: number;
  cols?: number;
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

export const StyledTextarea = styled.textarea<IReqoreTextareaStyle>`
  height: 100%;
  width: 100%;
  font-size: ${({ _size }) => TEXT_FROM_SIZE[_size]}px;
  margin: 0;
  padding: 5px 7px;
  resize: none;

  background-color: ${({ theme, minimal }: IReqoreTextareaStyle) =>
    minimal ? 'transparent' : darken(0.01, theme.main)};
  color: ${({ theme }: IReqoreTextareaStyle) => getReadableColor(theme)};

  border: ${({ minimal, theme }) =>
    !minimal ? `1px solid ${rgba(getReadableColor(theme), 0.2)}` : 0};
  border-bottom: ${({ minimal, theme }) =>
    minimal ? `0.5px solid ${rgba(getReadableColor(theme), 0.2)}` : undefined};

  border-radius: ${({ minimal }) => (minimal ? 0 : 3)}px;
  transition: all 0.2s ease-out;

  &:active,
  &:focus,
  &:hover {
    outline: none;
    border-color: ${({ theme }) => rgba(getReadableColor(theme), 0.3)};
  }

  &::placeholder {
    transition: all 0.2s ease-out;
    color: ${({ theme }) => rgba(getReadableColor(theme), 0.3)};
  }

  &:focus {
    &::placeholder {
      color: ${({ theme }) => rgba(getReadableColor(theme), 0.5)};
    }
  }

  &:disabled {
    pointer-events: none;
    opacity: 0.3;
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
      ...rest
    }: IReqoreTextareaProps,
    ref: any
  ) => {
    return (
      <StyledTextareaWrapper
        className={`${className || ''} reqore-control-wrapper`}
        width={width}
        height={height}
        fluid={fluid}
        _size={size}
      >
        <StyledTextarea
          {...rest}
          className={`${className || ''} reqore-control reqore-textarea`}
          _size={size}
          ref={ref}
          rows={scaleWithContent ? (rest?.value?.split(/\r\n|\r|\n/).length || 1) + 1 : rest.rows}
        />
        <ReqoreInputClearButton
          enabled={!rest?.disabled && !!(onClearClick && rest?.onChange)}
          show={rest?.value && rest.value !== ''}
          onClick={onClearClick}
          size='big'
        />
      </StyledTextareaWrapper>
    );
  }
);

export default ReqoreInput;
