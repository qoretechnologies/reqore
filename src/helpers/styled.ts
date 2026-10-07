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

/**
 * The props `ReqoreControlGroup` clones onto every child that is a component (see the group's
 * `useCloneThroughFragments` callback): its layout flags, and — in a `stack` group — where the
 * child sits in the stack, for nested groups to round their corners by. A child that renders a
 * DOM element, or a third-party component that writes its props onto one, must not forward
 * them: `shouldForwardProp: omitStyleProps(...REQORE_CONTROL_GROUP_CHILD_PROPS)`.
 */
export const REQORE_CONTROL_GROUP_CHILD_PROPS = [
  'customTheme',
  'fill',
  'fixed',
  'flat',
  'fluid',
  'intent',
  'minimal',
  'size',
  'spaceBetween',
  'stack',
  // Stack groups only.
  'childId',
  'childrenCount',
  'isChild',
  'isFirst',
  'isFirstGroup',
  'isFirstInLastGroup',
  'isInsideStackGroup',
  'isInsideVerticalGroup',
  'isLast',
  'isLastGroup',
  'isLastInFirstGroup',
  'isLastInLastGroup',
  'isMasterGroupRounded',
  'rounded',
];

/**
 * The props of a styled component's prop interface `TProps` that only style it: every key that
 * is not one of `TTargetProps` — the attributes and props of what the component renders.
 *
 * `as`, `forwardedAs` and transient (`$`-prefixed) props are left out: styled-components consumes
 * those itself and never forwards them.
 */
export type TReqoreStylePropKeys<TProps, TTargetProps> = Exclude<
  Extract<keyof TProps, string>,
  keyof TTargetProps | 'as' | 'forwardedAs' | `$${string}`
>;

/**
 * Lists a component's styling props for `omitStyleProps`, from a record the compiler checks
 * against the component's prop interface.
 *
 * A hand-written omit list goes stale: a prop added to the interface later reaches the rendered
 * element until someone remembers the list (ReqoreButton rendered `as` a router link handed its
 * `fluid`, `compact`, `maxWidth`, ... to the link, which wrote them onto its `<a>`; a resizable,
 * transparent ReqorePanel handed re-resizable `transparent`). Typed as
 * `Record<TReqoreStylePropKeys<...>, true>`, the record must name every such prop and nothing
 * else, so a new prop that is not added fails the build instead of leaking.
 *
 * @example
 * const BUTTON_STYLE_PROPS = listReqoreStyleProps<
 *   TReqoreStylePropKeys<IReqoreButtonStyle, React.ButtonHTMLAttributes<HTMLButtonElement>>
 * >({ fluid: true, compact: true, ... });
 */
export const listReqoreStyleProps = <TKeys extends string>(props: Record<TKeys, true>): TKeys[] =>
  Object.keys(props) as TKeys[];
