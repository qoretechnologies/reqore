import styled, { css } from 'styled-components';
import { StyledTextEffect } from './components/Effect';
import { StyledIconWrapper } from './components/Icon';

export const INACTIVE_ICON_SCALE = 0.85;
export const ACTIVE_ICON_SCALE = 0.93;

export const StyledContent = styled(StyledTextEffect)`
  position: relative;

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
  &:hover {
    ${ActiveIconScale}
  }
`;

export const DisabledElement = css`
  pointer-events: none;
  opacity: 0.4;
  cursor: not-allowed;
`;

export const ReadOnlyElement = css`
  cursor: not-allowed;
`;

/**
 * Subtle "raised" effect — adds a 1px inset highlight on the top edge and a
 * 1px inset shadow on the bottom edge so a borderless surface reads as a
 * tactile, slightly elevated card. Designed to be paired with `flat={true}`
 * (no border); pass `raised={true}` on supporting components.
 *
 * The colours are theme-neutral additive overlays (white-on-dark, black-on-
 * light) so the same recipe lights up correctly across every Reqore theme.
 */
export const RaisedElement = css`
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.22);
`;
