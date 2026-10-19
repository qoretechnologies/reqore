// A checkbox's label that wraps (`wrapLabel`) wraps (qorus#646). It sat in two control groups that kept the width of
// its one line, and the checkbox was one line high, so the Qorus IDE's "Skip totals rows" ran past its 38px row. The
// browser stories (Checkbox · A Long Label Wraps In A Narrow Box, and those after it) measure the layout; these check
// the rules that make it, and that a checkbox whose label does not wrap keeps its own.
import { render } from '@testing-library/react';
import { ReqoreCheckbox, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { SIZE_TO_PX } from '../src/constants/sizes';

const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

/** The checkbox's row, and the groups its label is in (outermost first). */
const partsOf = (container: HTMLElement) => {
  const row = container.querySelector('.reqore-checkbox') as HTMLElement;
  const label = row.querySelector('.reqore-checkbox-label') as HTMLElement;
  const groups: HTMLElement[] = [];

  for (
    let element = label.parentElement;
    element && element !== row;
    element = element.parentElement
  ) {
    if (element.classList.contains('reqore-control-group')) {
      groups.unshift(element);
    }
  }

  return { row, groups };
};

const LABEL = 'Skip the totals rows at the end of every sheet';

describe('a checkbox whose label wraps', () => {
  test.each([
    ['on the right', 'right'],
    ['on the left', 'left'],
  ] as const)(
    'with the label %s lets the groups its label is in shrink',
    (_name, labelPosition) => {
      const { container } = inLayout(
        <ReqoreCheckbox label={LABEL} labelPosition={labelPosition} wrapLabel />
      );
      const { groups } = partsOf(container);

      expect(groups).toHaveLength(2);
      for (const group of groups) {
        expect(group.style.flexShrink).toBe('1');
        expect(group.style.minWidth).toBe('0px');
      }
    }
  );

  test('is as high as its label, at least one line, and never wider than its container', () => {
    const { container } = inLayout(<ReqoreCheckbox label={LABEL} wrapLabel />);
    const style = getComputedStyle(partsOf(container).row);

    expect(style.minHeight).toBe(`${SIZE_TO_PX.normal}px`);
    expect(style.height).not.toBe(`${SIZE_TO_PX.normal}px`);
    expect(style.maxWidth).toBe('100%');
    expect(style.minWidth).toBe('0px');
  });

  test('says so to no element: what styles it stays off the page', () => {
    const { container } = inLayout(<ReqoreCheckbox label={LABEL} wrapLabel />);

    expect(container.querySelector('[\\$wrapLabel], [wraplabel], [wrapLabel]')).toBeNull();
  });
});

describe('a checkbox whose label does not wrap', () => {
  test('keeps its one-line height, its width and its label groups as they were', () => {
    const { container } = inLayout(<ReqoreCheckbox label={LABEL} />);
    const { row, groups } = partsOf(container);
    const style = getComputedStyle(row);

    expect(style.height).toBe(`${SIZE_TO_PX.normal}px`);
    expect(style.maxWidth).toBe('none');
    for (const group of groups) {
      expect(group.style.flexShrink).toBe('');
      expect(group.style.minWidth).toBe('');
    }
  });
});
