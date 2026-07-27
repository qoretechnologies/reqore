/**
 * The default prop validator styled-components hands to `shouldForwardProp`. It answers
 * "is this a real HTML attribute for the rendered element?".
 */
export type TReqoreStyledPropValidator = (prop: string | number | symbol) => boolean;

/**
 * Builds a `shouldForwardProp` predicate for `styled(...).withConfig({ ... })` that keeps the
 * named props out of the DOM while leaving every other prop to styled-components' own
 * validator.
 *
 * Reqore layout flags (`fill`, `wrap`, ...) are meaningful to a parent — a `ReqoreControlGroup`
 * propagates `fill` through polymorphic children, a `ReqoreTable` threads `wrap` into rows and
 * cells — but they are not valid HTML attributes. Without this filter React renders them as
 * boolean attributes and logs a "received `true` for a non-boolean attribute" warning.
 *
 * @example
 * const StyledPanel = styled(StyledEffect).withConfig({
 *   shouldForwardProp: omitStyleProps('fill'),
 * })<IStyledPanel>`...`;
 */
export const omitStyleProps = (...propsToOmit: string[]) => {
  const omitted = new Set<string | number | symbol>(propsToOmit);

  return (prop: string | number | symbol, defaultValidatorFn: TReqoreStyledPropValidator): boolean =>
    !omitted.has(prop) && defaultValidatorFn(prop);
};
