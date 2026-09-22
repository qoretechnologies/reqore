import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReqoreSelect, ReqoreUIProvider } from '../src';
import { selectItemLabel } from '../src/components/Select';

/*
 * What an item with no `label` shows.
 *
 * An item that names no label falls back to its own value, which is the whole
 * point of the fallback: a selected value with no matching item still has to
 * be drawn as something. React renders `true` and `false` as NOTHING, so a
 * select holding a flag drew an empty chip — a selection with no text and no
 * accessible name, which reads as "nothing is selected". `0` survived only
 * because React renders a number.
 *
 * A structured value has no label form and would be handed to React as a
 * child, which throws rather than degrading, so it still shows no label.
 */

beforeAll(() => {
  vi.setConfig({ testTimeout: 30000 });
  vi.useFakeTimers();
});

describe('selectItemLabel', () => {
  it('shows a scalar value when the item names no label', () => {
    expect(selectItemLabel({ value: false })).toBe('false');
    expect(selectItemLabel({ value: true })).toBe('true');
    expect(selectItemLabel({ value: 0 })).toBe('0');
    expect(selectItemLabel({ value: 'http' })).toBe('http');
  });

  it("prefers the item's own label", () => {
    expect(selectItemLabel({ value: false, label: 'Disabled' })).toBe('Disabled');
  });

  it('has nothing to show for a structured value, or for no value at all', () => {
    expect(selectItemLabel({ value: { preset: 'nightly' } })).toBe(undefined);
    expect(selectItemLabel({ value: ['a'] })).toBe(undefined);
    expect(selectItemLabel({})).toBe(undefined);
  });
});

test('Renders the chip and the menu row of an unlabelled boolean item', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreSelect<boolean>
          items={[{ value: true }, { value: false }]}
          value={false}
          onValueChange={() => {}}
        />
      </ReqoreUIProvider>
    );
  });

  // The chip for the held value says what is held
  expect(screen.getByText('false')).toBeTruthy();
  expect(screen.queryByText('No value selected')).toBeNull();

  fireEvent.focus(document.querySelector('.reqore-input')!);

  act(() => {
    vi.advanceTimersByTime(1);
  });

  // ... and so does the row offering the other one
  expect(screen.getAllByText('true').length).toBeGreaterThan(0);
});
