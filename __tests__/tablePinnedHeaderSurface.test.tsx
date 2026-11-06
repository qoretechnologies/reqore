// The header cell above a pinned column paints the SAME fill as the pinned body cells under it: the
// surface the table sits on. It painted `theme.main` instead, a step darker than the panel, so the
// header over a pinned actions column read as a black box beside the rest of the header (reported on
// the IDE's Connections list, 2026-11-06). Opaque either way, so the header cells that scroll under
// it still do not show through.
import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';
import { ReqoreTableHeaderCell } from '../src/components/Table/headerCell';
import { IReqoreTheme } from '../src/constants/theme';

const THEMED: Partial<IReqoreTheme> = {
  main: '#121212',
  panel: { main: '#141417', border: '#2d2d33' },
};

const pinnedHeaderCell = (props: Partial<React.ComponentProps<typeof ReqoreTableHeaderCell>>) => {
  const { container } = render(
    <ReqoreUIProvider theme={THEMED}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTableHeaderCell
            dataId='actions'
            pin='right'
            pinOffset={0}
            sortData={{ by: 'id', direction: 'asc' }}
            onColumnsUpdate={vi.fn()}
            {...props}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  return Array.from(container.querySelectorAll<HTMLElement>('*')).find(
    (element) => element.style.position === 'sticky'
  );
};

describe('a pinned header cell', () => {
  test('paints the panel surface a pinned body cell paints, not theme.main', () => {
    const cell = pinnedHeaderCell({});
    expect(cell).toBeTruthy();
    expect(cell!.style.backgroundColor).toBe('rgb(20, 20, 23)');
  });

  test("paints the table's own surface when the table names one", () => {
    expect(pinnedHeaderCell({ pinnedSurface: '#0a0b0c' })!.style.backgroundColor).toBe(
      'rgb(10, 11, 12)'
    );
  });
});
