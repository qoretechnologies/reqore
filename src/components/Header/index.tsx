import styled from 'styled-components';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';
import { IReqoreTextEffectProps, ReqoreTextEffect } from '../TextEffect';

export interface IReqoreHeaderProps extends IReqoreTextEffectProps {
  intent?: TReqoreIntent;
}

export interface IReqoreHeaderStyle extends IReqoreHeaderProps {
  theme: IReqoreTheme;
}

export const StyledHeader = styled(ReqoreTextEffect)`
  margin: 0;
  padding: 0;
  color: ${({ theme, intent }) =>
    intent ? theme.intents[intent] : getReadableColor(theme, undefined, undefined, true)};
`;

export const ReqoreHeader = (props: IReqoreHeaderProps) => {
  return <StyledHeader {...props} />;
};

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
