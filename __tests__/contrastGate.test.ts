// Copyright 2026 Qore Technologies, s.r.o.
import { afterEach, describe, expect, it } from 'vitest';
import {
  animationsSettled,
  backgroundsOf,
  composite,
  contrastRatio,
  drawnPairs,
  gradientColors,
  layersOf,
  lowContrastIconsIn,
  parseColor,
  textGradientOf,
} from '../src/stories/utils/contrastGate';

/**
 * The story run's contrast gate (qorus#646): text and icons too close to what they are drawn on. These are its own
 * measures - axe-core measures text in a real browser, which jsdom is not.
 */
const black = [0, 0, 0, 1] as [number, number, number, number];
const white = [255, 255, 255, 1] as [number, number, number, number];

/** An icon as Reqore draws one, given a size (jsdom lays nothing out). */
const icon = (color: string, holderStyle: string, extra = '') => {
  document.body.innerHTML = `<div style="${holderStyle}" ${extra}><span class="reqore-icon" style="color: ${color}"><svg style="fill: ${color}"><path /></svg></span></div>`;
  const holder = document.querySelector('.reqore-icon')!;
  holder.getBoundingClientRect = () => ({ width: 16, height: 16 }) as DOMRect;
  return document.body;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('the contrast gate', () => {
  it('measures the WCAG ratio of two colors', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
    expect(contrastRatio([118, 118, 118, 1], white)).toBeCloseTo(4.54, 1);
  });

  it('reads the colors the browser gives', () => {
    expect(parseColor('rgb(1, 2, 3)')).toEqual([1, 2, 3, 1]);
    expect(parseColor('rgba(1, 2, 3, 0.5)')).toEqual([1, 2, 3, 0.5]);
    expect(parseColor('transparent')).toEqual([0, 0, 0, 0]);
    expect(parseColor('none')).toBeUndefined();
    expect(gradientColors('linear-gradient(rgb(255, 0, 0), rgba(0, 0, 255, 0.5))')).toEqual([
      [255, 0, 0, 1],
      [0, 0, 255, 0.5],
    ]);
    expect(gradientColors('url("x.png")')).toBeUndefined();
  });

  it('draws a translucent color over what is under it', () => {
    expect(composite([255, 255, 255, 0.5], black)).toEqual([127.5, 127.5, 127.5, 1]);
    expect(composite([0, 0, 0, 0], white)).toEqual(white);
  });

  /* The Qorus IDE's muted message: light gray at a fifth of its opacity over the dark page is dark gray, not light. */
  it('blends a translucent background over the one under it', () => {
    document.body.innerHTML =
      '<div style="background-color: rgb(30, 30, 30)"><div style="background-color: rgba(217, 217, 217, 0.19)"><span id="text">x</span></div></div>';
    const [drawn] = backgroundsOf(document.getElementById('text')!)!;
    expect(drawn.map(Math.round)).toEqual([66, 66, 66, 1]);
    // near-black text on it is about 1.8:1, as the IDE found
    expect(contrastRatio([13, 13, 13, 1], drawn)).toBeLessThan(2);
  });

  it('measures each color of a gradient, and gives up on an image', () => {
    document.body.innerHTML =
      '<div style="background-image: linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))"><span id="text">x</span></div>';
    expect(backgroundsOf(document.getElementById('text')!)).toEqual([black, white]);
    document.body.innerHTML =
      '<div style="background-image: url(x.png)"><span id="text">x</span></div>';
    expect(backgroundsOf(document.getElementById('text')!)).toBeUndefined();
  });

  it('splits a background into its layers, top first', () => {
    expect(
      layersOf(
        'linear-gradient(rgb(1, 2, 3), rgb(4, 5, 6)), linear-gradient(to right, rgb(7, 8, 9) 0%, rgb(9, 9, 9) 100%)'
      )
    ).toEqual([
      'linear-gradient(rgb(1, 2, 3), rgb(4, 5, 6))',
      'linear-gradient(to right, rgb(7, 8, 9) 0%, rgb(9, 9, 9) 100%)',
    ]);
    expect(layersOf('none')).toEqual([]);
  });

  /* A Reqore button with a gradient: its fill (padding-box) on top of a lighter ring (border-box), which only
     shows in the border. The text is on the fill alone. */
  it('counts only what shows under the text when an opaque layer covers another', () => {
    document.body.innerHTML =
      '<div style="background-image: linear-gradient(rgb(0, 0, 0), rgb(10, 10, 10)), linear-gradient(rgb(255, 255, 255), rgb(250, 250, 250))"><span id="text">x</span></div>';
    expect(backgroundsOf(document.getElementById('text')!)).toEqual([black, [10, 10, 10, 1]]);
  });

  it('a gradient drawn in the letters is not under them', () => {
    document.body.innerHTML =
      '<div style="background-color: rgb(0, 0, 0)"><span id="text" style="background-image: linear-gradient(rgb(255, 255, 255), rgb(200, 200, 200)); background-clip: text">x</span></div>';
    const text = document.getElementById('text')!;
    expect(backgroundsOf(text)).toEqual([black]);
    expect(textGradientOf(text)).toEqual([white, [200, 200, 200, 1]]);
    expect(textGradientOf(text.parentElement!)).toEqual([]);
  });

  /* A popover or a modal is in Reqore's portal, outside the app's layout, but it floats over it: a translucent
     one is drawn over the layout's surface, not over the white canvas. */
  it('draws a floating layer over the app layout, not the canvas', () => {
    document.body.innerHTML =
      '<div class="reqore-layout-wrapper" style="background-color: rgb(30, 30, 30)"></div>' +
      '<div id="portal"><div style="background-color: rgba(255, 255, 255, 0.5)"><span id="text">x</span></div></div>';
    expect(backgroundsOf(document.getElementById('text')!)).toEqual([[142.5, 142.5, 142.5, 1]]);
    document.body.innerHTML =
      '<div style="background-color: rgba(0, 0, 0, 0.5)"><span id="text">x</span></div>';
    expect(backgroundsOf(document.getElementById('text')!)).toEqual([[127.5, 127.5, 127.5, 1]]);
  });

  /* A fade that ends on its color behind a button at its foot: the button is drawn on the end of it, not on the
     transparent top as well. */
  it('reads a gradient along a side only where the target is drawn on it', () => {
    document.body.innerHTML =
      '<div style="background-color: rgb(0, 0, 0)"><div id="fade" style="background-image: linear-gradient(rgba(0, 0, 0, 0), rgb(255, 255, 255))"><span id="text">x</span></div></div>';
    const fade = document.getElementById('fade')!;
    const text = document.getElementById('text')!;
    fade.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 100 }) as DOMRect;
    text.getBoundingClientRect = () => ({ top: 80, left: 0, width: 100, height: 20 }) as DOMRect;
    expect(backgroundsOf(text)!.map((color) => Math.round(color[0]))).toEqual([204, 255]);
    // at its head the same fade is the dark under it
    text.getBoundingClientRect = () => ({ top: 0, left: 0, width: 100, height: 20 }) as DOMRect;
    expect(backgroundsOf(text)!.map((color) => Math.round(color[0]))).toEqual([0, 51]);
    // an angle cannot be followed: each of its colors
    fade.style.backgroundImage = 'linear-gradient(45deg, rgb(10, 10, 10), rgb(250, 250, 250))';
    expect(backgroundsOf(text)!.map((color) => Math.round(color[0]))).toEqual([10, 250]);
  });

  /* A switch's knob faded to a fifth when unset: what it paints is drawn at that opacity, over the track, and its
     icon is read against that - not against the knob as if it were opaque. */
  it('draws the background of a faded element at its opacity', () => {
    document.body.innerHTML =
      '<div style="background-color: rgb(0, 0, 0)"><div style="opacity: 0.5; background-color: rgb(255, 255, 255)"><span id="text">x</span></div></div>';
    expect(
      backgroundsOf(document.getElementById('text')!)!.map((color) => Math.round(color[0]))
    ).toEqual([128]);
  });

  /* A switch's knob was measured sliding in, its color halfway from the checked intent's: the gate waits for what
     is moving to finish. */
  it('measures once what is moving has finished', async () => {
    const body = icon('rgb(20, 20, 20)', 'background-color: rgb(0, 0, 0)');
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    }).then(() => {
      const moving = document.querySelector<HTMLElement>('.reqore-icon')!;
      moving.style.color = 'rgb(255, 255, 255)';
      moving.querySelector<SVGElement>('svg')!.style.fill = 'rgb(255, 255, 255)';
    });
    const sliding = {
      playState: 'running',
      effect: { getComputedTiming: () => ({ endTime: 200 }) },
      finished,
    };
    const endless = {
      playState: 'running',
      effect: { getComputedTiming: () => ({ endTime: Infinity }) },
      finished: new Promise(() => undefined),
    };
    document.getAnimations = () => [sliding, endless] as unknown as Animation[];
    try {
      expect(lowContrastIconsIn(body)).toHaveLength(1);
      const settling = animationsSettled(document);
      finish();
      await settling;
      expect(lowContrastIconsIn(body)).toEqual([]);
    } finally {
      delete (document as { getAnimations?: unknown }).getAnimations;
    }
  });

  /* An idle rail rests faded as a whole: the active mark's black icon and the blue it is on fade into the page
     together, as one picture (3.2:1) - not the icon faded over the already faded blue (2.5:1). */
  it('fades a group drawn at an opacity as a whole: a mark and what it is on together', () => {
    document.body.innerHTML =
      '<div style="background-color: rgb(56, 56, 56)"><nav style="opacity: 0.64; background-color: rgb(60, 60, 60)"><button style="background-color: rgb(12, 151, 255)"><span class="reqore-icon" style="color: rgb(0, 0, 0); opacity: 0.83"><svg style="fill: rgb(0, 0, 0)"><path /></svg></span></button></nav></div>';
    const holder = document.querySelector('.reqore-icon')!;
    holder.getBoundingClientRect = () => ({ width: 16, height: 16 }) as DOMRect;
    expect(lowContrastIconsIn(document.body)).toEqual([]);
    const [[mark, background]] = drawnPairs(holder, [black])!;
    expect(contrastRatio(mark, background)).toBeGreaterThan(3);
    expect(contrastRatio(mark, background)).toBeLessThan(3.5);
  });

  it('finds an icon too close to what it is drawn on, and says where', () => {
    const found = lowContrastIconsIn(icon('rgb(0, 0, 0)', 'background-color: rgb(40, 40, 40)'));
    expect(found).toHaveLength(1);
    expect(found[0]).toMatch(/^icon at .*span\.reqore-icon: 1\.\d\d:1, under 3:1$/);
  });

  it('finds an icon that is too faint: its opacity counts', () => {
    expect(
      lowContrastIconsIn(
        icon('rgb(255, 255, 255)', 'background-color: rgb(40, 40, 40); opacity: 0.2')
      )
    ).toHaveLength(1);
  });

  it('finds an icon too close to one color of a gradient it is on', () => {
    expect(
      lowContrastIconsIn(
        icon(
          'rgb(0, 0, 0)',
          'background-image: linear-gradient(rgb(255, 255, 255), rgb(20, 20, 20))'
        )
      )
    ).toHaveLength(1);
  });

  it('leaves alone an icon that stands out, one disabled, one on an image, and one not drawn', () => {
    expect(
      lowContrastIconsIn(icon('rgb(255, 255, 255)', 'background-color: rgb(40, 40, 40)'))
    ).toEqual([]);
    expect(
      lowContrastIconsIn(
        icon('rgb(0, 0, 0)', 'background-color: rgb(40, 40, 40)', 'aria-disabled="true"')
      )
    ).toEqual([]);
    expect(lowContrastIconsIn(icon('rgb(0, 0, 0)', 'background-image: url(x.png)'))).toEqual([]);
    expect(
      lowContrastIconsIn(icon('rgb(0, 0, 0)', 'background-color: rgb(40, 40, 40); opacity: 0'))
    ).toEqual([]);
  });
});
