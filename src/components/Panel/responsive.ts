/**
 * Is this panel narrow enough to lay its header out for a small screen?
 *
 * The rule itself is not new — it has been `responsiveTitle && width > 0 &&
 * width < 480` inline in `Panel` since a7b7594 ("decide 'narrow' from a
 * measured width, not from NODE_ENV"). This is that expression, extracted
 * unchanged, so it can be read and tested on its own rather than only through
 * a rendered panel.
 *
 * The part worth keeping in words is the `width > 0`, because it looks
 * redundant and is not. `width` comes from `useMeasure`, which starts at **0**
 * and only reports the real width once its ResizeObserver has fired — one
 * frame after the first paint. Testing `width < 480` alone therefore answers
 * "yes" for every panel on its very first render, whatever its real size: the
 * panel paints in its narrow form, with the control buttons hidden and the
 * action groups wrapped, and snaps to the wide form a frame later, moving
 * everything below it.
 *
 * So an UNMEASURED panel is not a small panel. Zero is not a width — it is the
 * absence of one, and the wide layout is the right thing to assume until the
 * measurement disagrees, because it is what almost every panel turns out to be.
 */
export const panelIsSmall = (width: number, responsiveTitle: boolean): boolean =>
  !!responsiveTitle && width > 0 && width < 480;
