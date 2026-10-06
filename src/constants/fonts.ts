/**
 * The font stacks Reqore resolves the `effect.fontFamily` and `theme.fontFamily` shorthands to.
 *
 * They live here rather than inside a component because more than one component
 * needs them: `ReqoreDataView` renders whole trees of monospaced keys and values,
 * and any consumer rendering a literal value — an id, a data path, an error code —
 * wants the same stack rather than an approximation of it.
 */

/** System monospace, resolving to the platform's own mono on every OS. */
export const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

/**
 * The platform UI font, for `effect.fontFamily: 'system'`. No component names it by default:
 * Reqore text is in the page's font, or the theme's (`theme.fontFamily`) when one is set.
 */
export const SYSTEM_FONT = 'system-ui';

/**
 * The generic `monospace` family: what a `<textarea>` gets from the browser's own stylesheet.
 * `ReqoreTextarea` follows the page's font since 0.77.6, so a textarea that holds data rather
 * than prose (`ReqoreExportModal`'s export, `ReqoreTree`'s raw value editor) names this to keep
 * the face it always had.
 */
export const BROWSER_MONOSPACE_FONT = 'monospace';

/** Shorthands accepted by `effect.fontFamily`, on top of any raw CSS font stack. */
export const FONT_FAMILY_SHORTHANDS = {
  mono: MONO_FONT,
  system: SYSTEM_FONT,
} as const;

export type TReqoreFontFamilyShorthand = keyof typeof FONT_FAMILY_SHORTHANDS;

/**
 * Resolve an `effect.fontFamily` value to a CSS `font-family`. A shorthand maps to
 * its stack; anything else is passed through untouched, so a consumer can still
 * name a font Reqore has never heard of.
 */
export const getFontFamily = (family: TReqoreFontFamilyShorthand | string): string =>
  FONT_FAMILY_SHORTHANDS[family as TReqoreFontFamilyShorthand] ?? family;
