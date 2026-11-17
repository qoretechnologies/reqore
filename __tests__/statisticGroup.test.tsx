import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreStatistic,
  ReqoreStatisticGroup,
  ReqoreUIProvider,
} from '../src';

const renderGroup = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const items = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.reqore-statistic-group-item'));

const FIGURES = [
  { label: 'Running', value: 12 },
  { label: 'Failing', value: 2 },
  { label: 'Success rate', value: 98.2, suffix: '%' },
];

describe('ReqoreStatisticGroup', () => {
  test('Draws each figure as a quiet statistic in its own cell', () => {
    renderGroup(<ReqoreStatisticGroup items={FIGURES} />);

    expect(document.querySelectorAll('.reqore-statistic-group')).toHaveLength(1);
    expect(items()).toHaveLength(3);
    expect(items().map((item) => item.textContent)).toEqual([
      expect.stringContaining('Running'),
      expect.stringContaining('Failing'),
      expect.stringContaining('Success rate'),
    ]);
    // The label under the figure: the value row comes first.
    const statistic = items()[0].querySelector('.reqore-statistic')!;
    const parts = Array.from(statistic.querySelectorAll('.reqore-statistic-value-row, .reqore-statistic-label'));

    expect(parts[0].classList.contains('reqore-statistic-value-row')).toBe(true);
  });

  test('Draws at most five figures, and says so', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    renderGroup(
      <ReqoreStatisticGroup
        items={Array.from({ length: 7 }, (_, index) => ({ label: `Figure ${index}`, value: index }))}
      />
    );

    expect(items()).toHaveLength(5);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('7 figures given, 5 drawn'));
    warn.mockRestore();
  });

  test('Takes more than five only when told to', () => {
    renderGroup(
      <ReqoreStatisticGroup
        max={6}
        items={Array.from({ length: 6 }, (_, index) => ({ label: `Figure ${index}`, value: index }))}
      />
    );

    expect(items()).toHaveLength(6);
  });

  test('Marks the figure whose filter is on', () => {
    renderGroup(
      <ReqoreStatisticGroup items={FIGURES.map((figure, index) => ({ ...figure, active: index === 1 }))} />
    );

    expect(items().map((item) => item.getAttribute('data-active'))).toEqual([null, 'true', null]);
  });

  test('Draws hairlines unless told not to', () => {
    const { unmount } = renderGroup(<ReqoreStatisticGroup items={FIGURES} />);
    const drawn = getComputedStyle(document.querySelector('.reqore-statistic-group')!).boxShadow;

    expect(drawn).not.toContain('transparent');
    unmount();

    renderGroup(<ReqoreStatisticGroup items={FIGURES} dividers={false} />);
    expect(getComputedStyle(document.querySelector('.reqore-statistic-group')!).boxShadow).toContain(
      'transparent'
    );
  });

  test("Draws only the lines between its figures with dividers='between'", () => {
    renderGroup(<ReqoreStatisticGroup items={FIGURES} dividers='between' />);

    expect(getComputedStyle(document.querySelector('.reqore-statistic-group')!).boxShadow).toContain(
      'transparent'
    );
    expect(getComputedStyle(items()[1]).boxShadow).not.toContain('transparent');
  });

  test('Takes statistics as children, drawn as given', () => {
    renderGroup(
      <ReqoreStatisticGroup>
        <ReqoreStatistic label='Running' value={12} className='mine' />
        <ReqoreStatistic label='Failing' value={2} />
      </ReqoreStatisticGroup>
    );

    expect(items()).toHaveLength(2);
    expect(items()[0].querySelector('.reqore-statistic.mine')).not.toBeNull();
  });

  test('Hands its custom theme to its figures', () => {
    const valueColor = () =>
      getComputedStyle(document.querySelector('.reqore-statistic-value') as HTMLElement).color;
    const { unmount } = renderGroup(<ReqoreStatisticGroup items={FIGURES.slice(0, 1)} />);
    const onDefault = valueColor();

    unmount();
    renderGroup(
      <ReqoreStatisticGroup items={FIGURES.slice(0, 1)} customTheme={{ main: '#ffffff' }} />
    );

    // A light main makes the figure's words dark: the theme reached it.
    expect(valueColor()).not.toBe(onDefault);
  });
});
