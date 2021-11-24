import styled, { css } from 'styled-components';
import { IReqoreIntent, IReqoreTheme } from '../../constants/theme';
import { getReadableColor } from '../../helpers/colors';

export interface IReqoreParagraphStyle extends React.HTMLAttributes<HTMLHeadingElement> {
  theme: IReqoreTheme;
  intent?: IReqoreIntent;
}

const style = ({ theme, intent }: IReqoreParagraphStyle) => css`
  color: ${intent ? theme.intents[intent] : getReadableColor(theme, undefined, undefined, true)};
`;

export const ReqoreP: React.FC<
  Omit<IReqoreParagraphStyle, 'theme'>
> = styled.p<IReqoreParagraphStyle>`
  ${(props: IReqoreParagraphStyle) => style(props)};
`;
