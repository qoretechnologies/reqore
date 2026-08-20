/**
 * The font stacks Reqore components resolve `effect.fontFamily` shorthands to.
 *
 * They live here rather than inside a component because more than one component
 * needs them: `ReqoreDataView` renders whole trees of monospaced keys and values,
 * and any consumer rendering a literal value — an id, a data path, an error code —
 * wants the same stack rather than an approximation of it.
 */

/** System monospace, resolving to the platform's own mono on every OS. */
export const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

/** The platform UI font — what most Reqore text already renders in. */
export const SYSTEM_FONT = 'system-ui';

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
