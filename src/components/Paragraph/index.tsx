import styled, { css } from 'styled-components';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';

export interface IReqoreParagraphStyle extends React.HTMLAttributes<HTMLHeadingElement> {
  theme: IReqoreTheme;
  intent?: TReqoreIntent;
}

const style = ({ theme, intent }: IReqoreParagraphStyle) => css`
  margin: 0;
  padding: 0;
  color: ${intent ? theme.intents[intent] : getReadableColor(theme, undefined, undefined, true)};
`;

export const ReqoreP: React.FC<Omit<IReqoreParagraphStyle, 'theme'>> = styled.p.attrs(
  ({ className, ...rest }: IReqoreParagraphStyle) => ({
    ...(rest || {}),
    className: `${className} ${
      rest?.intent ? `reqore-paragraph-${rest.intent} ` : ``
    } reqore-paragraph`,
  })
)<IReqoreParagraphStyle>`
  ${(props: IReqoreParagraphStyle) => style(props)};
`;
