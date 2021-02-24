import { firstBy } from 'thenby';
import { IReqoreTableSort } from '.';

export const flipSortDirection = (direction: 'asc' | 'desc'): 'asc' | 'desc' =>
  direction === 'asc' ? 'desc' : 'asc';

export const fixSort = (sort?: IReqoreTableSort) => {
  return { ...(sort || {}), direction: sort?.direction || 'desc' };
};

export const sortTableData = (data: any[], sort: IReqoreTableSort) => {
  const { by, direction } = sort;

  if (!by) {
    return data;
  }

  return [...data].sort(firstBy(by, { ignoreCase: true, direction }));
};
