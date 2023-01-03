import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { HEADER_SIZE_TO_NUMBER, TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { isStringSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IWithReqoreEffect } from '../../types/global';
import { StyledTextEffect } from '../Effect';

export interface IReqoreHeadingProps
  extends IWithReqoreEffect,
    React.HTMLAttributes<HTMLHeadingElement> {
  intent?: TReqoreIntent;
  size?: 1 | 2 | 3 | 4 | 5 | 6 | TSizes;
  customTheme?: Partial<IReqoreTheme>;
}

export interface IReqoreHeadingStyle extends IReqoreHeadingProps {
  theme: IReqoreTheme;
}

export const StyledHeader = styled(StyledTextEffect)`
  margin: 0;
  padding: 0;
  color: ${({ theme, intent }) => (intent ? theme.intents[intent] : 'inherit')};
`;

export const ReqoreHeading = memo(
  ({ size, children, customTheme, intent, ...props }: IReqoreHeadingProps) => {
    const theme = useReqoreTheme('main', customTheme, intent);
    const _size: number = isStringSize(size) ? HEADER_SIZE_TO_NUMBER[size] : size;
    const HTMLheaderElement = useMemo(() => {
      return `h${_size}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    }, [_size]);

    return (
      <StyledHeader as={HTMLheaderElement} theme={theme} intent={intent} {...props}>
        {children}
      </StyledHeader>
    );
  }
);

export const ReqoreH1 = (props: IReqoreHeadingProps) => <ReqoreHeading size={1} {...props} />;
export const ReqoreH2 = (props: IReqoreHeadingProps) => <ReqoreHeading size={2} {...props} />;
export const ReqoreH3 = (props: IReqoreHeadingProps) => <ReqoreHeading size={3} {...props} />;
export const ReqoreH4 = (props: IReqoreHeadingProps) => <ReqoreHeading size={4} {...props} />;
export const ReqoreH5 = (props: IReqoreHeadingProps) => <ReqoreHeading size={5} {...props} />;
export const ReqoreH6 = (props: IReqoreHeadingProps) => <ReqoreHeading size={6} {...props} />;
