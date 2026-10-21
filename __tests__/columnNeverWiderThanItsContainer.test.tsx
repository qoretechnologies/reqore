// A collection's column is never wider than what holds it (qorus#646). The column kept its zoom width (400px at
// 100%) as its minimum and laid its cards out past a 342px dialog on a phone. The browser stories (Collection ·
// Narrow Container Keeps Its Items Inside, and its phone story) measure the layout; these check the rule that makes
// it.
import { render } from '@testing-library/react';
import { ReqoreColumns, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { getColumnMinimum } from '../src/components/Columns';

const inLayout = (node: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{node}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

describe("a column's minimum", () => {
  test('is never more than the container', () => {
    expect(getColumnMinimum('400px')).toBe('min(400px, 100%)');
    expect(getColumnMinimum('min(300px, 100%)')).toBe('min(min(300px, 100%), 100%)');
    expect(getColumnMinimum('20rem')).toBe('min(20rem, 100%)');
  });

  test('that is a keyword sizes to what is there, and is kept as it is', () => {
    for (const keyword of ['auto', 'min-content', 'max-content', 'fit-content(200px)']) {
      expect(getColumnMinimum(keyword)).toBe(keyword);
    }
  });

  test('is what the columns lay out at', () => {
    const { container } = inLayout(
      <ReqoreColumns minColumnWidth='400px' className='columns'>
        <div>one</div>
      </ReqoreColumns>
    );
    const columns = container.querySelector('.columns') as HTMLElement;
    const rules = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    const own = Array.from(columns.classList)
      .map((name) => rules.match(new RegExp(`\\.${name}\\{[^}]*\\}`))?.[0])
      .filter(Boolean)
      .join('')
      .replace(/\s+/g, '');

    expect(own).toContain('grid-template-columns:repeat(auto-fit,minmax(min(400px,100%),1fr))');
  });
});
