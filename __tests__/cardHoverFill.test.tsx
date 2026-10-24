// A clickable card, and a button's description, are read on what is painted while hovered as well as at rest
// (qorus#646). Faded as far as they read on the resting fill, a clickable entity row's metadata fell to 4.2:1 on
// its hover fill, and an info button's description to 3.8:1.
import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreCallout,
  ReqoreContent,
  ReqoreEntityRow,
  ReqoreLayoutContent,
  ReqoreTestimonial,
  ReqoreUIProvider,
} from '../src';
import { getContrastRatio, READABLE_TEXT_CONTRAST } from '../src/helpers/colors';
import { drawnOpacity, fromHex, hex, over, parse } from './shared/colorMath';
import { computedValueAt } from './cssVariables';

/** The background color the stylesheet gives `element` while hovered. */
const hoverBackgroundOf = (element: HTMLElement): string => {
  let found: string | undefined;
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from((sheet as CSSStyleSheet).cssRules)) {
      const { selectorText, style } = rule as CSSStyleRule;
      if (!selectorText?.includes(':hover') || !style?.backgroundColor) {
        continue;
      }
      // the rule's own selector, without its state: the element it is written for
      const base = selectorText.split(',').map((part) => part.replace(/:hover/g, '').trim());
      if (base.some((selector) => selector && element.matches(selector))) {
        found = computedValueAt(element, 'background-color', style.backgroundColor);
      }
    }
  }
  expect(found, 'a hover rule for the card').toBeTruthy();
  return found as string;
};

/** Each text the card draws, as drawn on `under`: its color at the opacity it is drawn at. */
const textsOn = (card: HTMLElement, under: ReturnType<typeof parse>) =>
  Array.from(card.querySelectorAll<HTMLElement>('*'))
    .filter((element) =>
      [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent?.trim())
    )
    .map((element) => ({
      text: element.textContent?.trim(),
      ratio: getContrastRatio(
        hex(over(getComputedStyle(element).color, under, drawnOpacity(element))),
        hex(under)
      ),
    }));

const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

describe('a clickable card, hovered', () => {
  test.each([
    [
      'an entity row',
      '.reqore-entity-row',
      <ReqoreEntityRow
        label='Inventory Reorder Trigger'
        description='Watches stock thresholds'
        metadata='Last run: success · 16 hours ago'
        onClick={() => undefined}
      />,
    ],
    [
      'a callout',
      '.reqore-callout',
      <ReqoreCallout label='Heads up' onClick={() => undefined}>
        The run stopped at its last step.
      </ReqoreCallout>,
    ],
    [
      'a testimonial',
      '.reqore-testimonial',
      <ReqoreTestimonial
        quote='It just works.'
        author='Ana'
        role='Engineer'
        onClick={() => undefined}
      />,
    ],
  ])('%s: its text reads on its hover fill', (_name, selector, node) => {
    inLayout(node);

    const card = document.querySelector(selector) as HTMLElement;
    // the page the card is on: the layout's own color
    const page = parse(
      getComputedStyle(document.querySelector('.reqore-layout-wrapper') as HTMLElement)
        .backgroundColor
    );
    const hover = hoverBackgroundOf(card);
    // the stylesheet keeps a color as it was written: a hex, or rgb() / rgba()
    const hovered = over(hover.startsWith('#') ? fromHex(hover) : parse(hover), page);

    for (const { text, ratio } of textsOn(card, hovered)) {
      expect(ratio, text).toBeGreaterThanOrEqual(READABLE_TEXT_CONTRAST);
    }
  });
});

/** The color the stylesheet gives `element` while `host` is hovered, or its own color when no hover rule names it. */
const hoverColorOf = (element: HTMLElement): string => {
  let found: string | undefined;
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from((sheet as CSSStyleSheet).cssRules)) {
      const { selectorText, style } = rule as CSSStyleRule;
      if (!selectorText?.includes(':hover') || !style?.color) {
        continue;
      }
      const base = selectorText.split(',').map((part) => part.replace(/:hover/g, '').trim());
      if (base.some((selector) => selector && element.matches(selector))) {
        found = computedValueAt(element, 'color', style.color);
      }
    }
  }
  return found ?? getComputedStyle(element).color;
};

const opaque = (color: string, under: ReturnType<typeof parse>) =>
  over(color.startsWith('#') ? fromHex(color) : parse(color), under);

describe('a button with a description, hovered', () => {
  test.each([undefined, 'info', 'muted'] as const)(
    '%s: its description reads on its hover fill',
    (intent) => {
      inLayout(
        <ReqoreButton
          intent={intent}
          description='This is a very interesting description for a button'
        >
          With Default Description
        </ReqoreButton>
      );

      const button = document.querySelector('.reqore-button') as HTMLElement;
      const description = button.querySelector('.reqore-button-description') as HTMLElement;
      const page = parse(
        getComputedStyle(document.querySelector('.reqore-layout-wrapper') as HTMLElement)
          .backgroundColor
      );
      const hovered = opaque(hoverBackgroundOf(button), page);
      const drawn = over(hoverColorOf(description), hovered, drawnOpacity(description));

      expect(getContrastRatio(hex(drawn), hex(hovered))).toBeGreaterThanOrEqual(
        READABLE_TEXT_CONTRAST
      );
    }
  );
});
