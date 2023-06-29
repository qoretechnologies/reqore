import { updateColumnData } from '../../src/components/Table/helpers';
import { testColumns } from '../../src/mock/tableData';

test.only('Updates top level column width', () => {
  const columns = [...testColumns];

  expect(columns[0].width).toBe(50);

  const newColumns = updateColumnData(columns, 'id', 'resizedWidth', 100);

  expect(newColumns[0].width).toBe(50);
  expect(newColumns[0].resizedWidth).toBe(100);
});

test.only('Updates group level column width', () => {
  const columns = [...testColumns];

  expect(columns[1].columns![0].width).toBe(150);

  const newColumns = updateColumnData(columns, 'firstName', 'resizedWidth', 250);

  expect(newColumns[1].columns![0].width).toBe(150);
  expect(newColumns[1].columns![0].resizedWidth).toBe(250);
});
