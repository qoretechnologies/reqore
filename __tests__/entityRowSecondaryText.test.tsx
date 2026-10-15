/**
 * An entity row writes its description and metadata fainter than its label, as far as they stay readable
 * (qorus#646). It faded them as a whole, so what they hold with a color of its own was faded a second time: a
 * minimal warning tag in the metadata at 4.0:1, a link in the description, readable on the row, at 2.8:1 (the
 * IDE's contrast gate). Only their text is faded now: what they hold is drawn as it is.
 */
import { render } from '@testing-library/react';
import { ReqoreEntityRow, ReqoreLink, ReqoreTag, ReqoreUIProvider } from '../src';

/** The opacity `el` is drawn at: its own and every ancestor's, multiplied. */
const drawnOpacity = (el: Element) => {
  let opacity = 1;

  for (let at: Element | null = el; at; at = at.parentElement) {
    opacity *= Number(getComputedStyle(at).opacity || 1);
  }

  return opacity;
};

const alphaOf = (color: string) => Number((color.match(/[\d.]+/g) as string[])[3] ?? 1);

const renderRow = (props: Record<string, unknown> = {}) =>
  render(
    <ReqoreUIProvider>
      <ReqoreEntityRow
        label='Release config'
        description={
          <>
            This verified root condition is shared by{' '}
            <ReqoreLink intent='info' href='#'>
              6 open issues
            </ReqoreLink>
          </>
        }
        metadata={
          <>
            stored in <ReqoreTag minimal intent='warning' label='Artifact store' />
          </>
        }
        {...props}
      />
    </ReqoreUIProvider>
  );

describe("an entity row's description and metadata", () => {
  test('are written in a faded color, not faded as a whole', () => {
    renderRow();

    for (const selector of ['.reqore-entity-row-description', '.reqore-entity-row-metadata']) {
      const slot = document.querySelector(selector) as HTMLElement;

      expect(getComputedStyle(slot).opacity).toBe('1');
      // still fainter than the label
      expect(alphaOf(getComputedStyle(slot).color)).toBeLessThan(1);
    }
  });

  test('draw what they hold with a color of its own as it is: a tag, a link', () => {
    renderRow();

    expect(drawnOpacity(document.querySelector('.reqore-tag') as Element)).toBe(1);
    expect(drawnOpacity(document.querySelector('.reqore-link') as Element)).toBe(1);
  });

  test('keep an opacity the caller gives, as the floor of how faint the text is drawn', () => {
    renderRow({ metadataEffect: { opacity: 0.9 } });

    const slot = document.querySelector('.reqore-entity-row-metadata') as HTMLElement;

    expect(getComputedStyle(slot).opacity).toBe('1');
    expect(alphaOf(getComputedStyle(slot).color)).toBeCloseTo(0.9, 2);
  });
});
