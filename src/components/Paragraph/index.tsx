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
import { StyledTextEffect } from '../Effect';
import { ReqoreTooltipComponent } from '../TooltipComponent';

export interface IReqoreParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent,
    IWithReqoreTooltip {
  size?: TSizes | string;
  block?: boolean;
  inline?: boolean;
}

export const StyledParagraph = styled(StyledTextEffect)`
  padding: 0;
  margin: 0;
  color: ${({ theme, intent }) =>
    intent ? theme.intents[intent] : theme.text?.color || 'inherit'};
  font-size: ${({ _size }) => (isStringSize(_size) ? `${TEXT_FROM_SIZE[_size]}px` : _size)};
`;

export const ReqoreP = memo(
  forwardRef(
    (
      {
        size,
        children,
        customTheme,
        inheritCustomTheme,
        intent,
        className,
        block = true,
        tooltip,
        ...props
      }: IReqoreParagraphProps,
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);

      return (
        <ReqoreTooltipComponent
          as='p'
          theme={theme}
          color={theme.text.color}
          intent={intent}
          block={block}
          {...props}
          Component={StyledParagraph}
          ref={ref}
          tooltip={tooltip}
          _size={size}
          className={`${className || ''} reqore-paragraph`}
        >
          {children}
        </ReqoreTooltipComponent>
      );
    }
  )
);
