// Copyright 2026 Qore Technologies, s.r.o.

/**
 * What a story's play or a test reads off the page, found or failed for: an element that is not there, or an
 * attribute it does not have, fails with what is missing, where a non-null assertion (`!`) or a cast let the next line
 * read a property of nothing (qorus#646: DeepScan's NULL_POINTER).
 */

/** The element `selector` finds in `parent` (the document when not given). */
export const requiredElement = <T extends Element = HTMLElement>(
  selector: string,
  what: string,
  parent: ParentNode = document
): T => {
  const element = parent.querySelector<T>(selector);

  if (!element) {
    throw new Error(`${what} is missing (${selector})`);
  }

  return element;
};

/** The attribute `name` of `element`. */
export const requiredAttribute = (element: Element, name: string): string => {
  const value = element.getAttribute(name);

  if (value === null) {
    throw new Error(`the ${name} attribute is missing`);
  }

  return value;
};
