import { forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { css } from 'styled-components';
import { TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor, getReadableColorFrom } from '../../helpers/colors';
import styled, { omitStyleProps } from '../../helpers/styled';
import { useReqoreTheme } from '../../hooks/useTheme';
import {
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreEffect,
  IWithReqoreFlat,
  IWithReqoreSize,
  IWithReqoreTooltip,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import { StyledEffect } from '../Effect';
import ReqoreIcon from '../Icon';
import { ReqoreTooltipComponent } from '../TooltipComponent';

/** The avatar's diameter in px at each size: its own scale, a step above an icon's at the same size. */
export const AVATAR_SIZE_FROM_SIZE: Record<TSizes, number> = {
  micro: 16,
  tiny: 20,
  small: 24,
  normal: 32,
  big: 40,
  huge: 56,
  massive: 72,
};

/** The icon drawn for a person with no picture. */
export const DEFAULT_AVATAR_ICON: IReqoreIconName = 'User3Fill';

export interface IReqoreAvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'title'>,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreEffect,
    IWithReqoreFlat,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /**
   * Who it is: the avatar's accessible name, its tooltip unless `tooltip` is given, and where its initials come from.
   */
  label?: string;
  /** A picture of them, filling the circle. Without one, or when it does not load, the avatar falls back. */
  image?: string;
  /**
   * Draw initials instead of the person icon when there is no picture: `true` takes them from `label` ("Ada
   * Lovelace" is "AL"), a string is drawn as given.
   */
  initials?: boolean | string;
  /** The icon drawn when there is no picture and no initials. A person by default. */
  icon?: IReqoreIconName;
  /** A circle (the default); `false` is a square with rounded corners. */
  rounded?: boolean;
}

export interface IReqoreAvatarStyle {
  theme: IReqoreTheme;
  $diameter: number;
  $fill: string;
  $fillEnd: string;
  $edge: string;
  $foreground: string;
  $rounded: boolean;
  $hasImage: boolean;
  flat?: boolean;
}

/** Up to two letters: the first of the first and the last word, as a person is usually shortened. */
export const getAvatarInitials = (label?: string): string => {
  const words = (label ?? '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  // whole characters, not UTF-16 halves, so a name that starts with an emoji or an accent is not split
  const first = (word: string) => Array.from(word)[0] ?? '';
  const letters = words.length > 1 ? first(words[0]) + first(words[words.length - 1]) : first(words[0]);
  return letters.toLocaleUpperCase();
};

export const StyledAvatar = styled(StyledEffect).withConfig({
  shouldForwardProp: omitStyleProps('flat', 'size'),
})<IReqoreAvatarStyle>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  box-sizing: border-box;
  overflow: hidden;
  vertical-align: middle;
  user-select: none;
  ${({ $diameter, $rounded }) => css`
    width: ${$diameter}px;
    height: ${$diameter}px;
    border-radius: ${$rounded ? '50%' : `${Math.round($diameter / 4)}px`};
  `}
  /* A slight gradient: the fill a shade lighter at the top left. Behind a picture, the picture covers it. */
  background: ${({ $fill, $fillEnd }) => `linear-gradient(135deg, ${$fillEnd} 0%, ${$fill} 100%)`};
  color: ${({ $foreground }) => $foreground};
  border: ${({ flat, $edge }) => (flat === false ? `1px solid ${$edge}` : 'none')};

  .reqore-avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .reqore-avatar-initials {
    font-size: ${({ $diameter }) => Math.max(7, Math.round($diameter * 0.4))}px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.02em;
  }
`;

/**
 * One avatar for every app: a person's picture in a circle, or, without one, the person icon in a filled circle
 * with a slight gradient, or their initials when asked. Its name is its tooltip and its accessible name.
 */
export const ReqoreAvatar = memo(
  forwardRef<HTMLSpanElement, IReqoreAvatarProps>(
    (
      {
        label,
        image,
        initials,
        icon = DEFAULT_AVATAR_ICON,
        rounded = true,
        flat = true,
        size = 'normal',
        intent,
        customTheme,
        inheritCustomTheme,
        tooltip,
        effect,
        className,
        ...rest
      },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, intent, undefined, inheritCustomTheme);
      const diameter = AVATAR_SIZE_FROM_SIZE[size] ?? AVATAR_SIZE_FROM_SIZE.normal;

      // a picture that does not load is not drawn as a broken image: the avatar falls back
      const [imageFailed, setImageFailed] = useState(false);
      useEffect(() => setImageFailed(false), [image]);
      const handleImageError = useCallback(() => setImageFailed(true), []);
      const showImage = !!image && !imageFailed;

      const shownInitials = useMemo(
        () =>
          typeof initials === 'string' ? initials.trim()
          : initials ? getAvatarInitials(label)
          : '',
        [initials, label]
      );

      /* The fill: the intent's colour, or a neutral a step off the surface it sits on, so a calm theme's avatar is a
         quiet disc rather than a coloured badge. The gradient lifts it a little at the top left. */
      const { fill, fillEnd, edge, foreground } = useMemo(() => {
        const base = intent ? theme.main : changeLightness(getMainBackgroundColor(theme), 0.14);
        return {
          fill: base,
          fillEnd: changeLightness(base, 0.06),
          edge: changeLightness(base, 0.08),
          foreground: getReadableColorFrom(base, true),
        };
      }, [intent, theme]);

      return (
        <ReqoreTooltipComponent
          role='img'
          aria-label={label}
          {...rest}
          Component={StyledAvatar}
          ref={ref}
          tooltip={tooltip ?? label}
          theme={theme}
          effect={effect}
          flat={flat}
          $diameter={diameter}
          $fill={fill}
          $fillEnd={fillEnd}
          $edge={edge}
          $foreground={foreground}
          $rounded={rounded}
          $hasImage={showImage}
          className={`${className || ''} reqore-avatar`}
        >
          {showImage ?
            <img className='reqore-avatar-image' src={image} alt='' onError={handleImageError} />
          : shownInitials ?
            <span className='reqore-avatar-initials' aria-hidden>
              {shownInitials}
            </span>
          : <ReqoreIcon
              className='reqore-avatar-icon'
              icon={icon}
              size={`${Math.round(diameter * 0.6)}px`}
              color={foreground as never}
              aria-hidden
            />
          }
        </ReqoreTooltipComponent>
      );
    }
  )
);

ReqoreAvatar.displayName = 'ReqoreAvatar';

export default ReqoreAvatar;
