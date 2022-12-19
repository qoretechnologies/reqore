import { memo, useMemo } from 'react';
import styled from 'styled-components';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IWithReqoreEffect } from '../../types/global';
import { StyledTextEffect } from '../Effect';

export interface IReqoreHeadingProps
  extends IWithReqoreEffect,
    React.HTMLAttributes<HTMLHeadingElement> {
  intent?: TReqoreIntent;
  size?: 1 | 2 | 3 | 4 | 5 | 6;
  customTheme?: Partial<IReqoreTheme>;
}

export interface IReqoreHeadingStyle extends IReqoreHeadingProps {
  theme: IReqoreTheme;
}

export const StyledHeader = styled(StyledTextEffect)`
  margin: 0;
  padding: 0;
  color: ${({ theme, intent }) =>
    intent ? theme.intents[intent] : getReadableColor(theme, undefined, undefined, true)};
`;

export const ReqoreHeading = memo(
  ({ size, children, customTheme, intent, ...props }: IReqoreHeadingProps) => {
    const theme = useReqoreTheme('main', customTheme, intent);
    const HTMLheaderElement = useMemo(() => {
      return `h${size}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    }, [size]);

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
