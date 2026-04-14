import { forwardRef, memo } from 'react';
import styled from 'styled-components';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreTextEffectProps, StyledTextEffect } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreSpanProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreTooltip {
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
        inheritCustomTheme,
        intent,
        className,
        inline = false,
        tooltip,
        ...props
      }: IReqoreSpanProps,
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      return (
        <ReqoreTooltipComponent
          ref={ref}
          as='span'
          theme={theme}
          color={theme.text.color}
          intent={intent}
          inline={inline}
          {...props}
          Component={StyledSpan}
          tooltip={tooltip}
          _size={size}
          className={`${className || ''} reqore-span`}
        >
          {children}
        </ReqoreTooltipComponent>
      );
    }
  )
);
