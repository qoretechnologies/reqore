import { size } from 'lodash';
import { firstBy } from 'thenby';
import { IReqoreTableColumn, IReqoreTableData, IReqoreTableSort } from '.';
import { ICON_FROM_SIZE, SIZE_TO_MODIFIER, TSizes } from '../../constants/sizes';
import { IReqoreIconName } from '../../types/icons';
import { IReqorePanelSubAction } from '../Panel';

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
      // @ts-expect-error Needed because of the thenby library
      firstBy(by, { ignoreCase: true, direction }).thenBy(thenBy, { ignoreCase: true, direction })
    );
  }

  // @ts-expect-error Needed because of the thenby library
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
  0: '30%',
  0.5: '60%',
  1: '100%',
  1.5: '130%',
  2: '160%',
};

export const getExportActions = (
  onClick: (type: 'current' | 'full') => void,
  withLabels: boolean = true
): IReqorePanelSubAction[] => [
  {
    label: withLabels ? 'Export current view' : undefined,
    icon: 'Download2Line',
    onClick: () => onClick('current'),
  },
  {
    label: withLabels ? 'Export full data' : undefined,
    icon: 'DownloadLine',
    onClick: () => onClick('full'),
  },
];

export const getZoomActions = (
  type: string,
  zoom: number,
  setter: (zoom: number) => void,
  withLabels?: boolean
): IReqorePanelSubAction[] => [
  {
    icon: 'ZoomInLine',
    label: withLabels ? 'Zoom in' : undefined,
    tooltip: 'Zoom in',
    disabled: zoom === 2,
    className: `${type}-zoom-in`,
    onClick: () => {
      setter(zoom + 0.5);
    },
  },
  {
    icon: 'RestartLine',
    label: `${zoomToLabel[zoom]}${withLabels ? ' (reset)' : ''}`,
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
    label: withLabels ? 'Zoom out' : undefined,
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

export const flattenColumns = (columns: IReqoreTableColumn[]): IReqoreTableColumn[] => {
  return columns.reduce((flat: IReqoreTableColumn[], column) => {
    if (column.header?.columns) {
      return [...flat, ...flattenColumns(column.header.columns)];
    }
    return [...flat, column];
  }, []);
};

export interface IColumnPartition {
  leftPinned: IReqoreTableColumn[];
  unpinned: IReqoreTableColumn[];
  rightPinned: IReqoreTableColumn[];
}

/**
 * Splits columns into left-pinned leaves, unpinned columns (preserving group structure but with
 * pinned sub-columns hoisted out), and right-pinned leaves. This is what drives the physical
 * render order of both the header and the body so that pinned columns sit at the edges of the
 * row — `position: sticky` then keeps them there during scroll.
 */
export const partitionPinnedColumns = (columns: IReqoreTableColumn[]): IColumnPartition => {
  const leftPinned: IReqoreTableColumn[] = [];
  const unpinned: IReqoreTableColumn[] = [];
  const rightPinned: IReqoreTableColumn[] = [];

  columns.forEach((column) => {
    if (column.header?.columns) {
      const sub = partitionPinnedColumns(column.header.columns);
      leftPinned.push(...sub.leftPinned);
      rightPinned.push(...sub.rightPinned);
      if (size(sub.unpinned) > 0) {
        unpinned.push({
          ...column,
          header: { ...column.header, columns: sub.unpinned },
        });
      }
      return;
    }
    if (column.pin === 'left') {
      leftPinned.push(column);
    } else if (column.pin === 'right') {
      rightPinned.push(column);
    } else {
      unpinned.push(column);
    }
  });

  return { leftPinned, unpinned, rightPinned };
};

/**
 * Returns a flat list of leaf columns reordered so pinned columns sit at the edges:
 * `[...leftPinned, ...unpinnedLeaves, ...rightPinned]`. Used by the body row renderer to render
 * cells in render order.
 */
export const getReorderedLeaves = (
  columns: IReqoreTableColumn[],
  tableWidth?: number
): IReqoreTableColumn[] => {
  const shown = getOnlyShownColumns(columns, tableWidth);
  const { leftPinned, unpinned, rightPinned } = partitionPinnedColumns(shown);
  return [...leftPinned, ...flattenColumns(unpinned), ...rightPinned];
};

export interface IColumnPinInfo {
  pin?: 'left' | 'right';
  offset: number;
  isEdge: boolean;
}

export const getColumnRenderedWidth = (column: IReqoreTableColumn): number => {
  const requestedWidth = column.resizedWidth || column.width || 0;
  const maxConstrainedWidth =
    column.maxWidth === undefined ? requestedWidth : Math.min(requestedWidth, column.maxWidth);

  return column.minWidth === undefined
    ? maxConstrainedWidth
    : Math.max(maxConstrainedWidth, column.minWidth);
};

export const getColumnsRenderedWidth = (columns: IReqoreTableColumn[]): number =>
  flattenColumns(columns)
    .filter((column) => column.show !== false && column.enabled !== false)
    .reduce((width, column) => width + getColumnRenderedWidth(column), 0);

export const getColumnsMinWidth = (columns: IReqoreTableColumn[]): number =>
  flattenColumns(columns)
    .filter((column) => column.show !== false && column.enabled !== false)
    .reduce((width, column) => width + (column.minWidth ?? getColumnRenderedWidth(column)), 0);

export const getColumnsMaxWidth = (columns: IReqoreTableColumn[]): number | undefined => {
  const leaves = flattenColumns(columns).filter(
    (column) => column.show !== false && column.enabled !== false
  );

  if (!leaves.length || leaves.some((column) => column.maxWidth === undefined)) {
    return undefined;
  }

  return leaves.reduce((width, column) => width + getColumnRenderedWidth(column), 0);
};

export const calculatePinOffsets = (
  columns: IReqoreTableColumn[]
): Record<string, IColumnPinInfo> => {
  const leaves = flattenColumns(columns).filter(
    (column) => column.show !== false && column.enabled !== false
  );
  const map: Record<string, IColumnPinInfo> = {};

  let leftAcc = 0;
  let lastLeftId: string | undefined;
  leaves.forEach((column) => {
    if (column.pin === 'left') {
      map[column.dataId] = { pin: 'left', offset: leftAcc, isEdge: false };
      leftAcc += getColumnRenderedWidth(column);
      lastLeftId = column.dataId;
    }
  });
  if (lastLeftId) {
    map[lastLeftId].isEdge = true;
  }

  let rightAcc = 0;
  let firstRightId: string | undefined;
  for (let i = leaves.length - 1; i >= 0; i--) {
    const column = leaves[i];
    if (column.pin === 'right') {
      map[column.dataId] = { pin: 'right', offset: rightAcc, isEdge: false };
      rightAcc += getColumnRenderedWidth(column);
      firstRightId = column.dataId;
    }
  }
  if (firstRightId) {
    map[firstRightId].isEdge = true;
  }

  return map;
};

export const getTotalColumnsWidth = (columns: IReqoreTableColumn[]): number => {
  return getColumnsRenderedWidth(columns);
};

export const getOnlyShownColumns = (
  columns: IReqoreTableColumn[],
  tableWidth: number
): IReqoreTableColumn[] => {
  return columns.reduce((newColumns: IReqoreTableColumn[], column) => {
    if (
      column.show === false ||
      column.enabled === false ||
      (column.hideBelowWidth && column.hideBelowWidth > tableWidth)
    ) {
      return newColumns;
    }

    if (column.header?.columns) {
      const subColumns = getOnlyShownColumns(column.header.columns, tableWidth);

      if (size(subColumns)) {
        return [
          ...newColumns,
          {
            ...column,
            header: { ...column.header, columns: subColumns },
          },
        ];
      }

      return newColumns;
    }

    return [...newColumns, column];
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

    const newWidth = calculateMinimumCellWidth(column.width || 20, size, column.header?.icon);

    return {
      ...column,
      width: newWidth * SIZE_TO_MODIFIER[size],
      grow: column.grow || (column.width ? undefined : 1),
      ...(columnModifiers?.[column.dataId] || {}),
    };
  });
};

export const calculateMinimumCellWidth = (
  currentWidth: number = 20,
  size: TSizes,
  icon?: IReqoreIconName
): number => {
  let width = currentWidth;

  if (icon) {
    width += ICON_FROM_SIZE[size];
  }

  return width;
};

export const removeInternalData = (data: IReqoreTableData): any[] => {
  return data.map((item) => {
    const newItem = { ...item };

    delete newItem._selectId;
    delete newItem._disabled;
    delete newItem._intent;

    return newItem;
  });
};
