/**
 * Is this panel narrow enough to lay its header out for a small screen?
 *
 * `width` comes from `useMeasure`, which starts at **0** and only reports the
 * real width once its ResizeObserver has fired — one frame after the first
 * paint. Testing `width < 480` alone therefore said "yes" for every panel on
 * its very first render, whatever its real size: every panel painted in its
 * narrow form, with the control buttons hidden and the action groups wrapped,
 * and then snapped to the wide form a frame later.
 *
 * That snap is a layout shift on every panel that has a header, and everything
 * below it moves. Measured on the Qorus IDE's test editor: the case panel's
 * action row appeared 51px tall a beat after the form had painted, and 33
 * elements below it jumped down by 51px in one frame.
 *
 * So an UNMEASURED panel is not a small panel. Zero is not a width — it is the
 * absence of one, and the wide layout is the right thing to assume until the
 * measurement disagrees, because it is what almost every panel turns out to be.
 */
export const panelIsSmall = (width: number, responsiveTitle: boolean): boolean =>
  !!responsiveTitle && width > 0 && width < 480;
