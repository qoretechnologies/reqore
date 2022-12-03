import styled, { css } from 'styled-components';

export interface IReqoreTextEffectProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  gradient?: {
    from: string;
    to: string;
    direction?: 'to right' | 'to left' | 'to top' | 'to bottom';
  };
}

export const StyledTextEffect = styled.span`
  // If gradient was supplied
  ${({ gradient }: IReqoreTextEffectProps) =>
    gradient &&
    css`
      // Create webkit text gradient
      background: ${({ gradient }) =>
        gradient &&
        `linear-gradient(${gradient.direction || 'to right'}, ${gradient.from}, ${gradient.to})`};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    `}
`;

export const ReqoreTextEffect = ({ children, ...rest }: IReqoreTextEffectProps) => {
  return (
    <StyledTextEffect className='reqore-text-effect' {...rest}>
      {children}
    </StyledTextEffect>
  );
};
