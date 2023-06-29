import { firstBy } from 'thenby';
import { IReqoreTableColumn, IReqoreTableSort } from '.';

export const flipSortDirection = (direction: 'asc' | 'desc'): 'asc' | 'desc' =>
  direction === 'asc' ? 'desc' : 'asc';

export const fixSort = (sort?: IReqoreTableSort) => {
  return { ...(sort || {}), direction: sort?.direction || 'desc' };
};

export const sortTableData = (data: any[], sort: IReqoreTableSort) => {
  const { by, thenBy, direction } = sort;

  if (!by) {
    return data;
  }

  if (thenBy) {
    return [...data].sort(
      firstBy(by, { ignoreCase: true, direction }).thenBy(thenBy, { ignoreCase: true, direction })
    );
  }

  return [...data].sort(firstBy(by, { ignoreCase: true, direction }));
};

export const updateColumnData = (
  columns: IReqoreTableColumn[],
  columnId: string,
  key: string,
  value: any
): IReqoreTableColumn[] => {
  const newColumns: IReqoreTableColumn[] = columns.map((column): IReqoreTableColumn => {
    if (column.dataId === columnId) {
      return { ...column, [key]: value };
    }

    if (column.columns) {
      return {
        ...column,
        columns: updateColumnData(column.columns, columnId, key, value),
      };
    }

    return column;
  });

  return newColumns;
};
