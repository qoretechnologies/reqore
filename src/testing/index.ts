/*
 * Reqore's testing surface: `@qoretechnologies/reqore/testing`.
 *
 * What a consumer's own tests assert about reqore components, as opposed to what
 * its application renders. Kept out of the main barrel on purpose: reqore
 * publishes CommonJS with no `sideEffects` flag, so nothing re-exported from
 * `index` can be tree-shaken, and `findTableGeometryViolations` is two hundred
 * lines of `getComputedStyle` / `getBoundingClientRect` walking that no
 * application renders with. Reached through its own entry point, it costs the
 * bundles that never ask for it nothing.
 *
 * Browser-only, and that is the other reason it lives here rather than in
 * `index`: everything exported from this module measures a real layout, so it
 * answers meaningfully only where one exists — a Storybook play function, a
 * browser-mode test runner. Under jsdom the geometry is all zeroes.
 */
export {
  describeTableGeometryViolations,
  findTableGeometryViolations,
} from './tableGeometry';
export type {
  IReqoreTableGeometryOptions,
  IReqoreTableGeometryViolation,
} from './tableGeometry';
