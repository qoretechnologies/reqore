import { forwardRef, memo } from 'react';
import styled from 'styled-components';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIntent, IWithReqoreCustomTheme, IWithReqoreEffect } from '../../types/global';
import { IReqoreTextEffectProps, StyledTextEffect } from '../Effect';

export interface IReqoreSpanProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent {
  size?: TSizes | string;
  inline?: IReqoreTextEffectProps['inline'];
}

export const StyledSpan = styled(StyledTextEffect)`
  color: ${({ theme, intent }) =>
    intent ? theme.intents[intent] : theme.text?.color || 'inherit'};
  font-size: ${({ _size }) => (isStringSize(_size) ? `${TEXT_FROM_SIZE[_size]}px` : _size)};
  vertical-align: ${({ inline }) => (inline ? 'middle' : undefined)};
`;

export const ReqoreSpan = memo(
  forwardRef(
    (
      {
        size,
        children,
        customTheme,
        intent,
        className,
        inline = false,
        ...props
      }: IReqoreSpanProps,
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent);

      return (
        <StyledSpan
          ref={ref}
          as='span'
          theme={theme}
          color={theme.text.color}
          intent={intent}
          inline={inline}
          {...props}
          _size={size}
          className={`${className || ''} reqore-span`}
        >
          {children}
        </StyledSpan>
      );
    }
  )
);
