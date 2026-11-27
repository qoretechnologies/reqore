import { useCallback, useMemo, useRef, useState } from 'react';
import { IReqorePanelSubAction } from '../Panel';
import { getExportActions } from './helpers';

/** What a table hands its controls: its column picker, its export and its column reset. */
export interface IReqoreTableControlsState {
  /** The column picker's entries, as the table's own picker draws them. */
  columns: IReqorePanelSubAction[];
  /** How many columns are shown. */
  shownColumns: number;
  /** A column a person may show is hidden. */
  hasHiddenColumns: boolean;
  /** A person changed a column (hid, pinned, resized or sorted it from its header). */
  hasColumnChanges: boolean;
  /** Puts every column back as the table was given it. */
  resetColumns: () => void;
  /** Opens the table's export: the rows as they are shown, or all of them. */
  openExport: (type: 'current' | 'full') => void;
}

export interface IReqoreTableControls {
  /**
   * The column picker's entries, one per column a person may hide, selected while it is shown.
   * Choosing one leaves the menu open, so several can be toggled in a row.
   */
  readonly columnsActions: IReqorePanelSubAction[];
  /** "Export current view" and "Export full data", each opening the table's export dialog. */
  readonly exportActions: IReqorePanelSubAction[];
  /** How many columns are shown. */
  readonly shownColumns: number;
  readonly hasHiddenColumns: boolean;
  readonly hasColumnChanges: boolean;
  /** Opens the table's export dialog. */
  readonly openExport: (type: 'current' | 'full') => void;
  /** Puts every column back as the table was given it. */
  readonly resetColumns: () => void;
  /**
   * The column picker and the export, ready for a page's "⋯" menu: a "Columns" entry that opens
   * the picker, then the two export entries.
   */
  readonly menuActions: IReqorePanelSubAction[];
  /** A table is connected (it has drawn and handed over its columns). */
  readonly connected: boolean;
  /** @internal The table hands its state over through this. */
  readonly connect: (state: IReqoreTableControlsState | undefined) => void;
}

export interface IUseReqoreTableControlsOptions {
  /** The "Columns" entry's label in `menuActions`. Default `'Columns'`. */
  columnsLabel?: string;
  /** The column reset's label, last in the column picker once a column changed. */
  resetColumnsLabel?: string;
  /** The two export entries' labels. */
  exportCurrentLabel?: string;
  exportFullLabel?: string;
}

/** What a person sees of the controls: when it changes, the page draws its menu again. */
const signatureOf = (state: IReqoreTableControlsState | undefined): string =>
  state
    ? JSON.stringify([
        state.columns.map((item) => [item.label, item.selected, item.divider]),
        state.shownColumns,
        state.hasHiddenColumns,
        state.hasColumnChanges,
      ])
    : '';

/**
 * The column picker and the export of a `ReqoreTable`, for a page that keeps them in its own
 * toolbar rather than the table's: give the result to the table as `controls`, and put
 * `menuActions` (or `columnsActions` and `exportActions`) in the page's "⋯". The table then draws
 * neither in its own toolbar, so a table with nothing else there starts with its headers.
 *
 * ```tsx
 * const tableControls = useReqoreTableControls();
 *
 * <ReqoreButton icon='MoreLine' actions={tableControls.menuActions} />
 * <ReqoreTable controls={tableControls} columns={columns} data={data} />
 * ```
 *
 * The entries follow the table: a column hidden from its header shows as unselected here, and
 * export takes the rows as the table filters and sorts them. They are drawn again only when what
 * they show changes, so a page whose columns are a new array on every render does not loop.
 */
export const useReqoreTableControls = ({
  columnsLabel = 'Columns',
  resetColumnsLabel = 'Reset columns',
  exportCurrentLabel = 'Export current view',
  exportFullLabel = 'Export full data',
}: IUseReqoreTableControlsOptions = {}): IReqoreTableControls => {
  const latest = useRef<IReqoreTableControlsState | undefined>(undefined);
  const [signature, setSignature] = useState('');

  const connect = useCallback((state: IReqoreTableControlsState | undefined) => {
    latest.current = state;
    const next = signatureOf(state);

    setSignature((current) => (current === next ? current : next));
  }, []);

  const openExport = useCallback((type: 'current' | 'full') => {
    latest.current?.openExport(type);
  }, []);

  const resetColumns = useCallback(() => {
    latest.current?.resetColumns();
  }, []);

  return useMemo(() => {
    const state = latest.current;
    // Each entry asks the table as it is NOW: an entry kept from an earlier draw would toggle
    // a column to the state it had then.
    const columnsActions: IReqorePanelSubAction[] = (state?.columns ?? []).map((item, index) =>
      item.divider
        ? item
        : {
            ...item,
            keepOpen: true,
            onClick: (...args) => latest.current?.columns[index]?.onClick?.(...args),
          }
    );
    const exportActions: IReqorePanelSubAction[] = state
      ? getExportActions(openExport, true, { current: exportCurrentLabel, full: exportFullLabel })
      : [];
    const columnsWithReset: IReqorePanelSubAction[] = state?.hasColumnChanges
      ? [
          ...columnsActions,
          { divider: true, line: true },
          {
            label: resetColumnsLabel,
            icon: 'RestartLine',
            className: 'reqore-table-reset-columns',
            onClick: resetColumns,
          },
        ]
      : columnsActions;
    const menuActions: IReqorePanelSubAction[] = [
      ...(columnsActions.some((item) => !item.divider)
        ? [
            {
              label: columnsLabel,
              icon: 'LayoutColumnLine' as const,
              className: 'reqore-table-columns-options',
              badge: state?.shownColumns,
              items: columnsWithReset,
            },
          ]
        : []),
      ...exportActions,
    ];

    return {
      columnsActions: columnsWithReset,
      exportActions,
      shownColumns: state?.shownColumns ?? 0,
      hasHiddenColumns: !!state?.hasHiddenColumns,
      hasColumnChanges: !!state?.hasColumnChanges,
      openExport,
      resetColumns,
      menuActions,
      connected: !!state,
      connect,
    };
    // `signature` stands for `latest.current`: it changes whenever what the entries show does.
  }, [
    signature,
    connect,
    openExport,
    resetColumns,
    columnsLabel,
    resetColumnsLabel,
    exportCurrentLabel,
    exportFullLabel,
  ]);
};
