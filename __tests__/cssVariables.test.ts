// Copyright 2026 Qore Technologies, s.r.o.
import { afterEach, describe, expect, it } from 'vitest';
import { computedValueAt } from './cssVariables';

/** An element styled `inline`, inside a parent styled `parentInline`, in the document. */
const elementIn = (inline: string, parentInline = '') => {
  const parent = document.createElement('div');
  parent.setAttribute('style', parentInline);
  const element = document.createElement('div');
  element.setAttribute('style', inline);
  parent.appendChild(element);
  document.body.appendChild(parent);
  return element;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('a property that reads a CSS variable, in a unit test', () => {
  it('is the variable set on the element, as a browser computes it', () => {
    const element = elementIn(
      '--tint: #0A6640; color: var(--tint); width: var(--width)',
      '--width: 42px'
    );

    expect(getComputedStyle(element).color).toBe('rgb(10, 102, 64)');
    expect(getComputedStyle(element).getPropertyValue('color')).toBe('rgb(10, 102, 64)');
    // inherited from where the element is
    expect(getComputedStyle(element).width).toBe('42px');
  });

  it('is its fallback when the variable is set nowhere, and stays as written with none', () => {
    const element = elementIn('color: var(--unset, transparent); background-color: var(--brand)');

    expect(getComputedStyle(element).color).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(element).backgroundColor).toBe('var(--brand)');
  });

  it('follows a variable that reads another, and stops at a cycle', () => {
    const element = elementIn(
      '--base: rgba(10,102,64,0.2); --wash: var(--base); color: var(--wash)'
    );
    expect(getComputedStyle(element).color).toBe('rgba(10, 102, 64, 0.2)');

    const cycle = elementIn('--a: var(--b); --b: var(--a); color: var(--a)');
    expect(getComputedStyle(cycle).color).toContain('var(');
  });

  it('leaves a value that reads no variable as jsdom gives it', () => {
    const element = elementIn('color: #0A6640; padding: 4px 8px');

    expect(getComputedStyle(element).color).toBe('rgb(10, 102, 64)');
    expect(computedValueAt(element, 'padding', '4px 8px')).toBe('4px 8px');
  });

  it('computes a value read from a stylesheet rule where the element is', () => {
    const element = elementIn('--hover: #ffffff');

    expect(computedValueAt(element, 'background-color', 'var(--hover)')).toBe('rgb(255, 255, 255)');
  });
});
