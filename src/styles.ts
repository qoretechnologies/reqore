import { css } from 'styled-components';
import { StyledActiveContent, StyledInActiveContent } from './components/Button';
import { StyledIconWrapper } from './components/Icon';

export const AnimatedTextElement = css`
  ${StyledActiveContent} {
    transform: translateY(0px);
    filter: blur(0);
    opacity: 1;
  }

  ${StyledInActiveContent} {
    transform: translateY(150%);
    filter: blur(10px);
    opacity: 0;
  }
`;

export const InactiveIconScale = css`
  ${StyledIconWrapper} {
    transform: scale(0.85);
  }
`;

export const ActiveIconScale = css`
  ${StyledIconWrapper} {
    transform: scale(1);
  }
`;

export const ScaleIconOnHover = css`
  ${InactiveIconScale}

  &:hover,
  &:focus {
    ${ActiveIconScale}
  }
`;
