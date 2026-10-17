import { useMemo } from 'react';
import { getEffectBackgrounds, IReqoreEffect, TReqoreHexColor } from '../components/Effect';
import { IReqoreCustomTheme, IReqoreTheme } from '../constants/theme';
import { useReqoreSurface } from '../context/SurfaceContext';
import { getDrawnColor, getReadableTextOn, getThemeSurface, TReqoreSurface } from '../helpers/colors';
import { getUnpaintedSurface } from '../helpers/surface';

export interface IReqoreDrawnSurfaceOptions {
  theme: IReqoreTheme;
  customTheme?: IReqoreCustomTheme;
  /** It paints no fill of its own: it is on what is around it. */
  transparent?: boolean;
  /** The fill it paints, translucent or not, over what it is on. */
  fill: string;
  /** The effect it paints: what its gradient draws is what it holds is read on. */
  effect?: IReqoreEffect;
}

export interface IReqoreDrawnSurface {
  /** What it is on: what a component around it says, or its customTheme's main when it paints nothing. */
  surface: TReqoreSurface | undefined;
  /** Its fill as drawn over that (the surface itself when it paints nothing). */
  background: TReqoreHexColor;
  /** Each color what it holds is drawn on: its gradient's, when its effect paints one, else its fill. */
  backgrounds: TReqoreHexColor[];
  /** The text that reads on all of them. */
  text: TReqoreHexColor;
}

/**
 * What a card (an entity row, a callout, a testimonial, a statistic, a feature card) is drawn on and in, worked out
 * once for all of them, so they cannot drift apart in how they read their own colors.
 *
 * The values are one object each for as long as what they come from holds: a gradient is followed by its colors,
 * not by the effect object, which given inline is new on every render (and so was every surface handed down).
 */
export const useReqoreDrawnSurface = ({
  theme,
  customTheme,
  transparent,
  fill,
  effect,
}: IReqoreDrawnSurfaceOptions): IReqoreDrawnSurface => {
  const aroundSurface = useReqoreSurface();
  const surface = useMemo(
    () => getUnpaintedSurface(theme, customTheme, aroundSurface, !!transparent),
    [theme, customTheme, aroundSurface, transparent]
  );
  const background = useMemo(
    () =>
      transparent
        ? getThemeSurface(theme, surface)
        : (getDrawnColor(fill, getThemeSurface(theme, surface)) as TReqoreHexColor),
    [transparent, theme, fill, surface]
  );
  const gradientKey = JSON.stringify(effect?.gradient ?? null);
  const backgrounds = useMemo(
    () => getEffectBackgrounds(theme, effect, background, getThemeSurface(theme, surface)),
    // `effect` is followed by its gradient's colors (see above)
    [theme, gradientKey, background, surface]
  );
  const text = useMemo(
    () => getReadableTextOn(theme, backgrounds) as TReqoreHexColor,
    [theme, backgrounds]
  );

  return useMemo(
    () => ({ surface, background, backgrounds, text }),
    [surface, background, backgrounds, text]
  );
};
