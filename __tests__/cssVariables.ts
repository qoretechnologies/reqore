// Copyright 2026 Qore Technologies, s.r.o.

/*
 * CSS variables in jsdom, computed as a browser computes them.
 *
 * jsdom gives a property that reads a CSS variable as written (`var(--reqore-button-text)`), where a browser computes
 * it to the variable's value where the element is. Reqore's components draw with CSS variables they set on
 * themselves (a table cell's widths and colors, a button's and a tag's paint and lengths: qorus#646), so a test that
 * reads the color or width an element is drawn with got the variable's name.
 */

const VARIABLE_REFERENCE = /var\((--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)/g;
/** How deep a variable may name another: deeper is a cycle, which a browser computes to nothing too. */
const MAX_VARIABLE_DEPTH = 8;

/** jsdom's own getComputedStyle, before `installComputedVariables`. */
let jsdomGetComputedStyle: typeof window.getComputedStyle = (element, pseudoElement) =>
  window.getComputedStyle(element, pseudoElement);

/** A custom property's value where `element` is: its own, or the nearest ancestor's (custom properties inherit). */
const customPropertyAt = (element: Element, name: string): string | undefined => {
  for (let at: Element | null = element; at; at = at.parentElement) {
    const value = jsdomGetComputedStyle(at).getPropertyValue(name).trim();
    if (value) {
      return value;
    }
  }
  return undefined;
};

/** `value` with each variable it reads that is set (or has a fallback) replaced by its value where `element` is. */
const substituteVariables = (element: Element, value: string, depth = 0): string =>
  depth > MAX_VARIABLE_DEPTH || !value.includes('var(')
    ? value
    : value.replace(VARIABLE_REFERENCE, (reference, name: string, fallback?: string) => {
        const replacement = customPropertyAt(element, name) ?? fallback?.trim();

        return replacement === undefined
          ? reference
          : substituteVariables(element, replacement, depth + 1);
      });

/** A value as jsdom computes it when it is declared for `property` (a color as `rgb()`, `transparent` too). */
const computedDeclaration = (property: string, value: string): string => {
  const scratch = document.createElement('div');
  scratch.style.setProperty(property, value);
  document.body.appendChild(scratch);
  try {
    return jsdomGetComputedStyle(scratch).getPropertyValue(property) || value;
  } finally {
    scratch.remove();
  }
};

/**
 * `property`'s `value` as a browser computes it where `element` is: each variable it reads replaced by the variable's
 * value, and given as jsdom gives a declared value. A variable that is set nowhere is left as written, as is a value
 * that reads none.
 */
export const computedValueAt = (element: Element, property: string, value: string): string => {
  if (!value.includes('var(')) {
    return value;
  }
  const substituted = substituteVariables(element, value);

  return substituted.includes('var(') ? substituted : computedDeclaration(property, substituted);
};

const toPropertyName = (property: string) =>
  property.startsWith('--')
    ? property
    : property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** Makes `getComputedStyle` compute the CSS variables a property reads (`computedValueAt`), on window and globally. */
export const installComputedVariables = () => {
  const own = window.getComputedStyle.bind(window);
  jsdomGetComputedStyle = own;

  const withVariables: typeof window.getComputedStyle = (element, pseudoElement) => {
    const style = own(element, pseudoElement);

    return new Proxy(style, {
      get(target, property) {
        if (property === 'getPropertyValue') {
          return (name: string) => computedValueAt(element, name, target.getPropertyValue(name));
        }
        const value = Reflect.get(target, property, target);
        if (typeof value === 'function') {
          return value.bind(target);
        }
        return typeof value === 'string' && typeof property === 'string'
          ? computedValueAt(element, toPropertyName(property), value)
          : value;
      },
    });
  };

  window.getComputedStyle = withVariables;
  globalThis.getComputedStyle = withVariables;
};
