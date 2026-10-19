// A stacked control group hands each child the same style while it says the same (qorus#646). It made the style anew
// on every render, so a memo child - a button, a dropdown - was handed a prop that always changed and was drawn again
// with the group each time, whatever else it was handed. A table's header cell drew its button again whenever another
// column was sorted (`tableHeaderCellKeepsItsControls.test`).
import { render } from '@testing-library/react';
import { memo } from 'react';
import { ReqoreControlGroup, ReqoreUIProvider } from '../src';

const draws: Record<string, number> = {};
const styles: Record<string, React.CSSProperties[]> = {};

/** A memo child that counts the times it is drawn, and keeps each style it is handed. */
const Counted = memo(({ name, style }: { name: string; style?: React.CSSProperties }) => {
  draws[name] = (draws[name] ?? 0) + 1;
  styles[name] = [...(styles[name] ?? []), style ?? {}];

  return <span data-name={name} style={style} />;
});

beforeEach(() => {
  for (const key of Object.keys(draws)) {
    delete draws[key];
    delete styles[key];
  }
});

const group = (names: string[], label?: string) => (
  <ReqoreUIProvider>
    <span>{label}</span>
    <ReqoreControlGroup stack>
      {names.map((name) => (
        <Counted key={name} name={name} />
      ))}
    </ReqoreControlGroup>
  </ReqoreUIProvider>
);

describe('a stacked control group', () => {
  test('hands a child the same style while it says the same, so a memo child is not drawn again', () => {
    const { rerender } = render(group(['first', 'middle', 'last']));
    const first = { ...draws };

    rerender(group(['first', 'middle', 'last'], 'again'));
    rerender(group(['first', 'middle', 'last'], 'and again'));

    expect(draws).toEqual(first);
  });

  test('hands a child a new style when what it says changes: the end of the group moved', () => {
    const { rerender } = render(group(['first', 'middle', 'last']));
    const middle = draws.middle;
    const before = styles.middle[styles.middle.length - 1];

    rerender(group(['first', 'middle']));

    expect(draws.middle).toBeGreaterThan(middle);
    const after = styles.middle[styles.middle.length - 1];
    expect(after).not.toBe(before);
    // it is the group's end now: its corners on the right are rounded, where they were square
    expect(before.borderTopRightRadius).toBe(0);
    expect(after.borderTopRightRadius).not.toBe(0);
  });
});
