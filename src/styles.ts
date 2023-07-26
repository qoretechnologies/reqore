import styled, { css } from 'styled-components';
import { StyledTextEffect } from './components/Effect';
import { StyledIconWrapper } from './components/Icon';

export const INACTIVE_ICON_SCALE = 0.85;
export const ACTIVE_ICON_SCALE = 1;

export const StyledActiveContent = styled(StyledTextEffect)`
  position: absolute;
  transform: translateY(-150%);
  opacity: 0;
  transition: all 0.2s ease-out;
  filter: blur(10px);

  ${({ wrap }) =>
    !wrap
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        `
      : css`
          word-break: break-word;
        `}
`;

export const StyledInActiveContent = styled(StyledTextEffect)`
  position: absolute;
  transform: translateY(0);
  transition: all 0.2s ease-out;

  ${({ wrap }) =>
    !wrap
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100%;
        `
      : css`
          word-break: break-word;
        `}
`;

export const StyledInvisibleContent = styled(StyledTextEffect)`
  visibility: hidden;
  position: relative;
  overflow: hidden;

  ${({ wrap }) =>
    !wrap
      ? css`
          white-space: nowrap;
        `
      : css`
          word-break: break-word;
        `}
`;

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
    transform: scale(${INACTIVE_ICON_SCALE});
  }
`;

export const ActiveIconScale = css`
  ${StyledIconWrapper} {
    transform: scale(${ACTIVE_ICON_SCALE});
  }
`;

export const ChildActiveIconScale = css`
  > ${StyledIconWrapper} {
    transform: scale(${ACTIVE_ICON_SCALE});
  }
`;

export const ScaleIconOnHover = css`
  &:hover,
  &:focus {
    ${ActiveIconScale}
  }
`;

export const DisabledElement = css`
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
`;

export const ReadOnlyElement = css`
  cursor: not-allowed;
`;
