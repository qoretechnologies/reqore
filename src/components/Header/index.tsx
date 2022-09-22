import styled, { css } from 'styled-components';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';

export interface IReqoreHeaderStyle extends React.HTMLAttributes<HTMLHeadingElement> {
  theme: IReqoreTheme;
  intent?: TReqoreIntent;
}

const style = ({ theme, intent }: IReqoreHeaderStyle) => css`
  margin: 0;
  padding: 0;
  color: ${intent ? theme.intents[intent] : getReadableColor(theme, undefined, undefined, true)};
`;

export const ReqoreH1: React.FC<Omit<IReqoreHeaderStyle, 'theme'>> = styled.h1<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH2: React.FC<Omit<IReqoreHeaderStyle, 'theme'>> = styled.h2<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH3: React.FC<Omit<IReqoreHeaderStyle, 'theme'>> = styled.h3<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH4: React.FC<Omit<IReqoreHeaderStyle, 'theme'>> = styled.h4<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH5: React.FC<Omit<IReqoreHeaderStyle, 'theme'>> = styled.h5<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH6: React.FC<Omit<IReqoreHeaderStyle, 'theme'>> = styled.h6<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;
