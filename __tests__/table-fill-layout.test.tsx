import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTable, ReqoreUIProvider } from '../src';
import tableData from '../src/mock/tableData';

const measuredElements: Element[] = [];

vi.mock('react-use', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-use')>();

  return {
    ...original,
    useMeasure: () => [
      (element: Element | null) => {
        if (element) {
          measuredElements.push(element);
        }
      },
      {
        x: 0,
        y: 0,
        width: 800,
        height: 400,
        top: 0,
        left: 0,
        bottom: 400,
        right: 800,
      },
    ],
  };
});

beforeEach(() => {
  measuredElements.length = 0;
  vi.mocked(console.error).mockClear();
});

test('A filled paged <Table /> measures only the flex-allocated table wrapper', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTable
            {...tableData}
            fill
            height={undefined}
            paging={{
              itemsPerPage: 5,
              showLabels: true,
            }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(
    measuredElements.some((element) => element.classList.contains('reqore-table-wrapper'))
  ).toBe(true);
  expect(
    measuredElements.some(
      (element) =>
        element.classList.contains('reqore-panel-content') &&
        element.closest('.reqore-table') !== null
    )
  ).toBe(false);
  expect(document.querySelector('.reqore-pagination-wrapper')).toBeInTheDocument();
  expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
    'non-boolean attribute `wrap`'
  );
});
