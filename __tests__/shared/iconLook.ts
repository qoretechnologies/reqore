/**
 * How an icon is drawn: the color its glyph is drawn in (react-icons sets it on the svg) and the opacity the icon is
 * drawn at.
 */
export const iconLookOf = (icon: Element | null): { color: string; opacity: string } => {
  if (!icon) {
    throw new Error('no icon');
  }

  return {
    color: (icon.querySelector('svg') as SVGElement).style.color,
    opacity: getComputedStyle(icon as HTMLElement).opacity,
  };
};
