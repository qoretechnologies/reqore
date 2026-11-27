import { animated } from '@react-spring/web';
import { rgba } from 'polished';
import { memo, useCallback, useMemo } from 'react';
import { IReqoreDrawerStyle } from '.';
import { useReqoreProperty } from '../..';
import { getMainBackgroundColor, shouldDarken } from '../../helpers/colors';
import type { IReqoreTheme } from '../../constants/theme';
import styled, { omitStyleProps } from '../../helpers/styled';

export interface IReqoreBackdropProps extends React.HTMLAttributes<HTMLDivElement> {
  zIndex?: number;
  blur?: number;
  onClose?: () => void;
  opacity?: number;
}

/**
 * How much the page behind a dialog is blurred when neither the dialog nor the app says. A dialog
 * over a busy page read as part of it (the page's panels and the dialog's are the same surfaces), so
 * the page is set back: a low blur, enough that its text stops competing, never so much that the
 * reader loses where they were. An app that wants none passes `0` (`options.backdropBlur`).
 */
export const BACKDROP_BLUR_DEFAULT = 5;

/**
 * The scrim over the page behind a dialog: darker than the page in both themes, so the dialog's
 * surface stands in front of it. On a dark theme the page colour at 60% (a black scrim would read
 * as a hole); on a light theme black at 32%, the usual scrim, since a light tint would wash the
 * page out without setting it back.
 */
export const backdropScrimColor = (theme: IReqoreTheme): string => {
  const page = getMainBackgroundColor(theme);
  return shouldDarken(page) ? rgba(0, 0, 0, 0.32) : rgba(page, 0.6);
};

export const StyledBackdrop = styled(animated.div).withConfig({
  shouldForwardProp: omitStyleProps('blur', 'closable', 'zIndex'),
})<
  IReqoreDrawerStyle & { closable: boolean; zIndex?: number }
>`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  backdrop-filter: ${({ blur }) => (blur ? `blur(${blur}px)` : undefined)};
  z-index: ${({ zIndex }) => zIndex};
  background-color: ${({ theme }) => backdropScrimColor(theme)};
  cursor: ${({ closable }) => (closable ? 'pointer' : 'initial')};
`;

export const ReqoreBackdrop = memo(
  ({ onClose, zIndex, blur, opacity, ...rest }: IReqoreBackdropProps) => {
    const getAndIncreaseZIndex = useReqoreProperty('getAndIncreaseZIndex');
    // the app's default (`options.backdropBlur`) when the dialog passes none of its own
    const defaultBlur = useReqoreProperty('backdropBlur');
    const finalZIndex = useMemo(
      () => zIndex || getAndIncreaseZIndex(),
      [zIndex, getAndIncreaseZIndex]
    );

    const handleClick = useCallback(
      (event) => {
        event.stopPropagation();
        // Only close if the click is on the backdrop itself
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      },
      [onClose]
    );

    const style = useMemo(
      () => ({
        opacity,
      }),
      [opacity]
    );

    return (
      <StyledBackdrop
        {...rest}
        className={`${rest.className || ''} reqore-drawer-backdrop`}
        onClick={handleClick}
        closable={!!onClose}
        zIndex={finalZIndex}
        blur={blur ?? defaultBlur ?? BACKDROP_BLUR_DEFAULT}
        style={style}
      />
    );
  }
);
