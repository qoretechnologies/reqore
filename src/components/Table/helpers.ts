import { size } from 'lodash';
import { firstBy } from 'thenby';
import { IReqoreTableColumn, IReqoreTableSort } from '.';
import { ICON_FROM_SIZE, SIZE_TO_MODIFIER, SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreIconName } from '../../types/icons';
import { IReqorePanelAction } from '../Panel';

export const flipSortDirection = (direction: 'asc' | 'desc'): 'asc' | 'desc' =>
  direction === 'asc' ? 'desc' : 'asc';

export const fixSort = (sort: IReqoreTableSort) => {
  return { ...sort, direction: sort?.direction || 'desc' };
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
  key: keyof IReqoreTableColumn,
  value: any
): IReqoreTableColumn[] => {
  const newColumns: IReqoreTableColumn[] = columns.map((column): IReqoreTableColumn => {
    if (column.dataId === columnId) {
      return { ...column, [key]: value };
    }

    if (column.header?.columns) {
      return {
        ...column,
        header: {
          ...column.header,
          columns: updateColumnData(column.header.columns, columnId, key, value),
        },
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

export const getColumnsCount = (columns: IReqoreTableColumn[]): number => {
  let count = 0;

  columns.forEach((column) => {
    if (column.header?.columns) {
      count += getColumnsCount(column.header.columns);
    } else {
      count += 1;
    }
  });

  return count;
};

export const hasGroupedColumns = (columns: IReqoreTableColumn[]): boolean => {
  return columns.some((column) => {
    return !!column.header?.columns;
  });
};

export const hasHiddenColumns = (columns: IReqoreTableColumn[]): boolean => {
  return columns.some((column) => {
    if (column.header?.columns) {
      return column.header.columns.some((subColumn) => subColumn.show === false);
    }

    return column.show === false;
  });
};

export const getColumnsByPinType = (
  columns: IReqoreTableColumn[],
  type: 'left' | 'right' | 'main'
): IReqoreTableColumn[] => {
  return columns.reduce((newColumns: IReqoreTableColumn[], column): IReqoreTableColumn[] => {
    if (column.header?.columns) {
      const subColumns: IReqoreTableColumn[] = getColumnsByPinType(column.header.columns, type);

      if (!size(subColumns)) {
        return newColumns;
      }

      const columnsResult = [
        ...newColumns,
        {
          ...column,
          header: {
            ...column.header,
            columns: subColumns,
          },
        },
      ];

      return columnsResult;
    }

    if ((type === 'main' && !column.pin) || column.pin === type) {
      return [...newColumns, column];
    }

    return newColumns;
  }, []);
};

export const getOnlyShownColumns = (columns: IReqoreTableColumn[]): IReqoreTableColumn[] => {
  return columns.reduce((newColumns: IReqoreTableColumn[], column) => {
    if (column.header?.columns) {
      const subColumns = getOnlyShownColumns(column.header.columns);

      if (size(subColumns)) {
        return [
          ...newColumns,
          {
            ...column,
            header: { ...column.header, columns: getOnlyShownColumns(column.header.columns) },
          },
        ];
      }

      return newColumns;
    }

    if (column.show !== false) {
      return [...newColumns, column];
    }

    return newColumns;
  }, []);
};

export const prepareColumns = (
  columns: IReqoreTableColumn[],
  columnModifiers: { [key: string]: { [key: string]: any } },
  size: TSizes = 'normal'
): IReqoreTableColumn[] => {
  // We need to set the width of each column
  return columns.map((column) => {
    if (column.header?.columns) {
      return {
        ...column,
        header: {
          ...column.header,
          columns: prepareColumns(column.header.columns, columnModifiers, size),
        },
      };
    }

    let newWidth = calculateMinimumCellWidth(
      column.width || 50,
      size,
      column.header?.icon,
      column.sortable,
      column.filterable,
      column.hideable,
      column.resizable
    );

    return {
      ...column,
      width: newWidth * SIZE_TO_MODIFIER[size],
      ...(columnModifiers?.[column.dataId] || {}),
    };
  });
};

export const calculateMinimumCellWidth = (
  currentWidth: number = 50,
  size: TSizes,
  icon?: IReqoreIconName,
  sortable?: boolean,
  filterable?: boolean,
  hideable?: boolean,
  resizable?: boolean
): number => {
  let width = currentWidth;

  if (icon) {
    width += ICON_FROM_SIZE[size];
  }

  if (sortable) {
    width += ICON_FROM_SIZE[size];
  }

  if (filterable || hideable || resizable) {
    width += SIZE_TO_PX[size];
  }

  return width;
};
