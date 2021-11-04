import styled, { css } from 'styled-components';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';

export interface IReqoreHeaderStyle extends React.HTMLAttributes<HTMLHeadingElement> {
  theme: IReqoreTheme;
  intent?: IReqoreIntent;
}

const style = ({ theme, intent }: IReqoreHeaderStyle) => css`
  color: ${intent ? theme.intents[intent] : getReadableColor(theme, undefined, undefined, true)};
`;

export const ReqoreH1 = styled.h1<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH2 = styled.h2<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH3 = styled.h3<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH4 = styled.h4<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH5 = styled.h5<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;

export const ReqoreH6 = styled.h6<IReqoreHeaderStyle>`
  ${(props) => style(props)};
`;
