import { keyframes } from 'styled-components';

export const fadeIn = keyframes`
  0% {
    opacity: 0;
    filter: blur(5px);
  }

  100%{
    opacity: 1;
    filter: blur(0px);
  }
`;
