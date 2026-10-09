import type { ComponentType, JSX } from 'react';
import baseStyled from 'styled-components';

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
/** The SVG elements: their presentation attributes (`fill`, `opacity`, `width`, ...) are real. */
const SVG_TAGS = new Set<string>([
  'svg',
  'g',
  'path',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'rect',
  'text',
  'tspan',
  'textPath',
  'defs',
  'symbol',
  'use',
  'image',
  'marker',
  'mask',
  'pattern',
  'clipPath',
  'linearGradient',
  'radialGradient',
  'stop',
  'foreignObject',
  'filter',
]);

/**
 * Reqore prop names that are ALSO an HTML attribute — of some elements. `isPropValid`, which
 * styled-components uses to filter a DOM tag's props, only asks whether a name is an attribute
 * anywhere, so `size='normal'` (a Reqore size) reached every `div` and `span` it was handed to as
 * `size="normal"`, a checkbox's `checked` reached its `div`, a table cell's `selected` and
 * `disabled` theirs, and so on. Each name maps to the elements it is an attribute of; on any
 * other HTML element it is a styling prop and stays back. A name with no elements is not an
 * attribute of any HTML element (only of SVG ones, or of nothing current).
 */
export const REQORE_AMBIGUOUS_PROP_ELEMENTS: Readonly<
  Record<string, readonly (keyof JSX.IntrinsicElements)[]>
> = {
  size: ['input', 'select'],
  width: ['img', 'canvas', 'video', 'iframe', 'input', 'embed', 'object', 'col', 'colgroup'],
  height: ['img', 'canvas', 'video', 'iframe', 'input', 'embed', 'object'],
  wrap: ['textarea'],
  color: [],
  fill: [],
  opacity: [],
  direction: [],
  offset: [],
  spacing: [],
  disabled: ['button', 'input', 'select', 'textarea', 'option', 'optgroup', 'fieldset'],
  readOnly: ['input', 'textarea'],
  checked: ['input'],
  selected: ['option'],
  placeholder: ['input', 'textarea'],
  label: ['track', 'option', 'optgroup'],
  type: [
    'input',
    'button',
    'ol',
    'li',
    'a',
    'source',
    'embed',
    'object',
    'script',
    'style',
    'link',
  ],
  value: [
    'input',
    'button',
    'select',
    'textarea',
    'option',
    'li',
    'meter',
    'progress',
    'param',
    'data',
    'output',
  ],
};

/**
 * The state attributes a component's omit list may name for its default element but that are
 * the element's own when it is rendered `as` an element that has them (see `omitStyleProps`).
 */
const REQORE_ELEMENT_STATE_PROPS = new Set<string | number | symbol>([
  'disabled',
  'readOnly',
  'checked',
  'selected',
]);

/** Whether `prop` is an attribute of the element `tag`, as far as Reqore's names go. */
export const isReqoreElementAttribute = (prop: string | number | symbol, tag: string): boolean => {
  if (typeof prop !== 'string' || SVG_TAGS.has(tag)) {
    return true;
  }

  const elements = REQORE_AMBIGUOUS_PROP_ELEMENTS[prop] as readonly string[] | undefined;

  return !elements || elements.includes(tag);
};

export const omitStyleProps = (...propsToOmit: string[]) => {
  const omitted = new Set<string | number | symbol>(propsToOmit);

  return (
    prop: string | number | symbol,
    defaultValidatorFn: TReqoreStyledPropValidator,
    elementToBeCreated?: TReqoreStyledTarget
  ): boolean => {
    if (omitted.has(prop)) {
      // A component's omit list is built against its default element. Given `as` another tag
      // that has the state attribute — `<ReqorePanel as='fieldset' disabled>`, `<ReqoreTag
      // as='button' disabled>` — the attribute is that element's, so it goes through.
      return (
        typeof elementToBeCreated === 'string' &&
        REQORE_ELEMENT_STATE_PROPS.has(prop) &&
        defaultValidatorFn(prop) &&
        (REQORE_AMBIGUOUS_PROP_ELEMENTS[prop as string] as readonly string[]).includes(
          elementToBeCreated
        )
      );
    }

    // Mirror styled-components' own default — a component gets everything, a DOM tag what is an
    // HTML attribute — except that a DOM tag only gets an attribute of ITS element.
    return typeof elementToBeCreated === 'string'
      ? defaultValidatorFn(prop) && isReqoreElementAttribute(prop, elementToBeCreated)
      : true;
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

/**
 * Reqore's `styled`: styled-components' own, except that every styled component it makes filters
 * its props with `omitStyleProps()` — so a DOM element only receives the attributes of ITS
 * element (see `REQORE_AMBIGUOUS_PROP_ELEMENTS`), whether or not its author remembered to filter.
 *
 * Every Reqore source file imports `styled` from here (an ESLint rule forbids the default import
 * of `styled-components`). A styled component's own `.withConfig({ shouldForwardProp })`
 * replaces this filter, and is built with `omitStyleProps`, which includes it.
 */
const withReqoreProps = <T>(construct: T): T =>
  typeof (construct as any)?.withConfig === 'function'
    ? (construct as any).withConfig({ shouldForwardProp: omitStyleProps() })
    : construct;

const reqoreStyled = new Proxy(baseStyled, {
  apply: (target, thisArg, args) => withReqoreProps(Reflect.apply(target, thisArg, args)),
  get: (target, key, receiver) => withReqoreProps(Reflect.get(target, key, receiver)),
}) as typeof baseStyled;

export default reqoreStyled;
