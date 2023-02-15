import { memo } from 'react';
import styled from 'styled-components';
import { TEXT_FROM_SIZE, TSizes } from '../../constants/sizes';
import { isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IReqoreIntent, IWithReqoreCustomTheme, IWithReqoreEffect } from '../../types/global';
import { StyledTextEffect } from '../Effect';

export interface IReqoreParagraphProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IReqoreIntent {
  size?: TSizes | string;
}

export const StyledParagraph = styled(StyledTextEffect)`
  padding: 0;
  margin: 0;
  color: ${({ theme, intent }) => (intent ? theme.intents[intent] : 'inherit')};
  font-size: ${({ _size }) => (isStringSize(_size) ? `${TEXT_FROM_SIZE[_size]}px` : _size)};
`;

export const ReqoreP = memo(
  ({ size, children, customTheme, intent, className, ...props }: IReqoreParagraphProps) => {
    const theme = useReqoreTheme('main', customTheme, intent);

    return (
      <StyledParagraph
        as='p'
        theme={theme}
        intent={intent}
        {...props}
        _size={size}
        className={`${className || ''} reqore-paragraph`}
      >
        {children}
      </StyledParagraph>
    );
  }
);
