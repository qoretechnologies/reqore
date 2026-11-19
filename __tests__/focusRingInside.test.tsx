// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';

/**
 * The keyboard's ring is drawn inside a button's and a tag's edge: a control sits flush
 * in a box that clips often (a table cell, a field, a scrolling action group), and a ring drawn 2px
 * outside was cut away there (seen in a visual review).
 */

/** The `:focus-visible` rules the page's style sheets hold for an element's classes. */
const focusVisibleRules = (element: Element) =>
  Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules) as CSSStyleRule[])
    .filter(
      (rule) =>
        rule.selectorText?.includes(':focus-visible') &&
        Array.from(element.classList).some((name) =>
          rule.selectorText.split(',').some((part) => part.trim().startsWith(`.${name}:focus-visible`))
        )
    );

test.each([
  ['a button', () => <ReqoreButton className='under-test'>Run</ReqoreButton>, '.under-test'],
  ['a tag', () => <ReqoreTag className='under-test' label='Failing' onClick={() => undefined} />, '.under-test'],
])('%s draws its keyboard ring inside its edge', (_, ui, selector) => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui()}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // jsdom keeps \`outline\` as the shorthand it was written as ("2px solid rgba(...)").
  const rings = focusVisibleRules(document.querySelector(selector)!)
    .map((rule) => ({ outline: rule.style.getPropertyValue('outline'), offset: rule.style.outlineOffset }))
    .filter(({ outline }) => outline.includes('solid'));

  expect(rings.length).toBeGreaterThan(0);
  rings.forEach(({ outline, offset }) => {
    // How far it reaches past the edge: its offset plus its width, 0 or less inside.
    expect(parseFloat(offset) + parseFloat(outline)).toBeLessThanOrEqual(0);
  });
});
