import styled, { css } from 'styled-components';

export interface IReqoreEffect {
  gradient?: {
    from: string;
    to: string;
    direction?: 'to right' | 'to left' | 'to top' | 'to bottom';
  };
  noWrap?: boolean;
}

export interface IReqoreTextEffectProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  effect: IReqoreEffect;
}

export const StyledEffect = styled.span`
  // If gradient was supplied
  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.gradient
      ? css`
          // Create webkit text gradient
          background: ${`linear-gradient(${effect.gradient.direction || 'to right'}, ${
            effect.gradient.from
          }, ${effect.gradient.to})`};
        `
      : undefined}

  ${({ effect }: IReqoreTextEffectProps) =>
    effect && effect.noWrap
      ? css`
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        `
      : undefined}
`;

export const StyledTextEffect = styled(StyledEffect)`
  display: inline-block;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const ReqoreTextEffect = ({ children, ...rest }: IReqoreTextEffectProps) => {
  return (
    <StyledTextEffect className='reqore-text-effect' {...rest}>
      {children}
    </StyledTextEffect>
  );
};
