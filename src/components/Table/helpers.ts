import { firstBy } from 'thenby';
import { IReqoreTableSort } from '.';

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
