import type { ComponentType } from 'react';

/**
 * The default prop validator styled-components hands to `shouldForwardProp`. It answers
 * "is this a real HTML attribute?" — it knows nothing about the element being rendered.
 */
export type TReqoreStyledPropValidator = (prop: string | number | symbol) => boolean;

/**
 * The third argument styled-components hands to `shouldForwardProp`: the element the styled
 * component will actually render. A string is a DOM tag (`'span'`, `'textarea'`); anything else
 * is a React component (`ReqoreIcon`, `Resizable`, `animated.span`, ...).
 */
export type TReqoreStyledTarget = string | ComponentType<any>;

/**
 * Builds a `shouldForwardProp` predicate for `styled(...).withConfig({ ... })` that keeps the
 * named props out of the rendered element while leaving every other prop alone.
 *
 * Reqore layout flags (`fill`, `wrap`, ...) are meaningful to a parent — a `ReqoreControlGroup`
 * propagates `fill` through polymorphic children, a `ReqoreTable` threads `wrap` into rows and
 * cells — but they are not valid HTML attributes. Without this filter React renders them as
 * boolean attributes and logs a "received `true` for a non-boolean attribute" warning.
 *
 * IMPORTANT — why the target type is checked. Supplying `shouldForwardProp` *replaces*
 * styled-components' built-in rule outright; it does not layer on top of it. That built-in rule
 * is `isTargetTag ? isPropValid(prop) : true` — a DOM tag only receives real HTML attributes,
 * but a **component** target receives everything, because a component's props are its own API
 * and `isPropValid` knows nothing about them. Chaining `defaultValidatorFn` unconditionally
 * therefore strips a component's entire prop surface: `styled(ReqoreIcon)` silently lost
 * `icon` / `wrapperElement` / `wrapperSize` (the input clear button rendered as an empty span),
 * `styled(StyledEffect) as={Resizable}` lost re-resizable's `enable` / size / handle config, and
 * `ReqoreTextarea as={Editable}` lost Slate's `renderElement` / `renderLeaf` / `decorate`. Each
 * was previously patched with a bespoke per-call-site allow-list; mirroring the built-in rule
 * here fixes all of them at the source, so `styled(SomeComponent)` keeps working like plain
 * styled-components while the explicitly-omitted props still never reach the DOM.
 *
 * @example
 * const StyledPanel = styled(StyledEffect).withConfig({
 *   shouldForwardProp: omitStyleProps('fill'),
 * })<IStyledPanel>`...`;
 */
export const omitStyleProps = (...propsToOmit: string[]) => {
  const omitted = new Set<string | number | symbol>(propsToOmit);

  return (
    prop: string | number | symbol,
    defaultValidatorFn: TReqoreStyledPropValidator,
    elementToBeCreated?: TReqoreStyledTarget
  ): boolean => {
    if (omitted.has(prop)) {
      return false;
    }

    // Mirror styled-components' own default so only the omitted props change behaviour.
    return typeof elementToBeCreated === 'string' ? defaultValidatorFn(prop) : true;
  };
};
