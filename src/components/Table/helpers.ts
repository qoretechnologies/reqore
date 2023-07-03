import { firstBy } from 'thenby';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { IReqorePanelAction } from '../Panel';

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

export const sizeToZoom = {
  tiny: 0,
  small: 0.5,
  normal: 1,
  big: 1.5,
  huge: 2,
};

export const zoomToSize = {
  0: 'tiny',
  0.5: 'small',
  1: 'normal',
  1.5: 'big',
  2: 'huge',
};

export const zoomToWidth = {
  0: '200px',
  0.5: '300px',
  1: '400px',
  1.5: '500px',
  2: '600px',
};

// This code converts a zoom level to a label.
export const zoomToLabel = {
  0: '0.6x',
  0.5: '0.8x',
  1: '1x',
  1.5: '1.2x',
  2: '1.4x',
};

export const getZoomActions = (
  type: string,
  zoom: number,
  setter: (zoom: number) => void
): IReqorePanelAction[] => [
  {
    icon: 'ZoomInLine',
    tooltip: 'Zoom in',
    disabled: zoom === 2,
    className: `${type}-zoom-in`,
    onClick: () => {
      setter(zoom + 0.5);
    },
  },
  {
    icon: 'RestartLine',
    label: zoomToLabel[zoom],
    tooltip: 'Reset zoom',
    disabled: zoom === 1,
    className: `${type}-zoom-reset`,
    onClick: () => {
      setter(1);
    },
  },
  {
    icon: 'ZoomOutLine',
    tooltip: 'Zoom out',
    disabled: zoom === 0,
    className: `${type}-zoom-out`,
    onClick: () => {
      setter(zoom - 0.5);
    },
  },
];
