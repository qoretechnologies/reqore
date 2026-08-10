import { noop } from 'lodash';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import * as RemixIcons from 'react-icons/ri';
import { useMeasure } from 'react-use';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import styled from 'styled-components';
import { PADDING_FROM_SIZE, SIZE_TO_PX, TSizes } from '../../constants/sizes';
import { IReqoreCustomTheme, TReqoreIntent } from '../../constants/theme';
import {
  IReqoreDisabled,
  IReqoreIntent,
  IWithReqoreCustomTheme,
  IWithReqoreFlat,
  IWithReqoreFluid,
  IWithReqoreSize,
  IWithReqoreTooltip,
  TReqoreTooltipProp,
} from '../../types/global';
import { IReqoreIconName } from '../../types/icons';
import ReqoreButton, { IReqoreButtonProps } from '../Button';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreInput, { IReqoreInputProps } from '../Input';
import { IReqorePanelProps, ReqorePanel } from '../Panel';
import { ReqoreP } from '../Paragraph';
import { IReqorePopoverProps, ReqorePopover } from '../Popover';
import { ReqoreVerticalSpacer } from '../Spacer';

/**
 * Runtime list of every Remix icon name available in the library.
 *
 * `IReqoreIconName` is a compile-time-only type, so it cannot be iterated.
 * `react-icons/ri` exposes the actual component registry keyed as
 * `Ri<IconName>` — stripping the `Ri` prefix once at module load gives the
 * full pickable set without bundling anything extra (ReqoreIcon already
 * imports the same registry).
 */
export const ALL_REQORE_ICONS: IReqoreIconName[] = Object.keys(RemixIcons)
  .filter((key) => key.startsWith('Ri'))
  .map((key) => key.slice(2) as IReqoreIconName);

/** Padding around each icon cell, in pixels. */
const ICON_PICKER_CELL_GAP = 4;

/**
 * Horizontal space (px) reserved when fitting the grid to the viewport — the
 * popover panel's own padding plus a margin from the screen edge.
 */
const ICON_PICKER_VIEWPORT_MARGIN = 48;

/** The grid never collapses below this many columns, even on tiny screens. */
const ICON_PICKER_MIN_COLUMNS = 2;

/** Square pixel size of a single icon grid cell (button + surrounding gap). */
const getCellSize = (size: TSizes): number => SIZE_TO_PX[size] + ICON_PICKER_CELL_GAP;

export interface IReqoreIconPickerProps
  extends IReqoreDisabled,
    IReqoreIntent,
    IWithReqoreCustomTheme,
    IWithReqoreFlat,
    IWithReqoreFluid,
    IWithReqoreSize,
    IWithReqoreTooltip {
  /** Currently selected icon (controlled). */
  value?: IReqoreIconName;
  /** Fired with the icon name when the user picks one from the grid. */
  onPick?: (icon: IReqoreIconName) => void;
  /** Restrict the pickable set. Defaults to every Reqore icon. */
  icons?: IReqoreIconName[];
  /**
   * Maximum number of columns in the icon grid. Default `8`.
   *
   * - When **not** `fluid`, the grid is fixed-width (uniform square cells) and
   *   this count is used as-is — only clamped down at runtime if it would not
   *   fit the viewport (so it never overflows on narrow/mobile screens).
   * - When `fluid`, this is ignored: the grid fills its container and the
   *   column count is derived from the available width.
   */
  columns?: number;
  /**
   * Intent applied to the selected-icon preview shown above the grid (left of
   * the filter input, or on its own row when `filterable` is `false`).
   */
  selectedIconIntent?: TReqoreIntent;
  /** Pixel height of the scrollable (virtualized) icon grid. Default `320`. */
  gridHeight?: number;
  /** Trigger button label. Defaults to the selected icon name or "Pick an icon". */
  label?: React.ReactNode;
  /**
   * Fallback label used on the trigger button when no `value` is selected and no
   * `label` / `buttonProps.label` was supplied. Defaults to English
   * `'Pick an icon'` — override to translate the CTA.
   */
  pickIconLabel?: React.ReactNode;
  /** Icon shown on the trigger button when no `value` is selected. Default `'AppsLine'`. */
  placeholderIcon?: IReqoreIconName;
  /** Placeholder text for the filter input. */
  filterPlaceholder?: string;
  /** Message shown when no icon matches the filter. */
  noResultsLabel?: string;
  /**
   * Formats the tooltip shown on the "selected icon" preview button. Receives
   * the icon name and returns the tooltip content — a plain string or a
   * `TReqoreTooltipProp` config. Defaults to `` (name) => `Selected: ${name}` ``
   * — override to translate the prefix.
   */
  selectedIconTooltip?: (name: IReqoreIconName) => TReqoreTooltipProp;
  /** Whether to show the filter input. Default `true`. */
  filterable?: boolean;
  /**
   * Render the icon grid directly in the layout instead of behind a trigger
   * button + popover. When `true` there is no trigger button — the filterable
   * grid is shown in place. The button-only props (`label`, `placeholderIcon`,
   * `buttonProps`, `popoverProps`, `isDefaultOpen`, `flat`, `tooltip`) are
   * ignored in this mode. Default `false`.
   */
  inline?: boolean;
  /**
   * Only meaningful with `inline`. By default the inline picker shrinks to fit
   * its icon grid; with `fluid` it fills the parent's width instead and the
   * grid reflows — more columns are shown and the cells stretch to fill the
   * available space. Default `false`.
   */
  fluid?: boolean;
  /** Open the popover on mount. Default `false`. Ignored when `inline`. */
  isDefaultOpen?: boolean;
  /** Props forwarded to the trigger ReqoreButton. */
  buttonProps?: Partial<IReqoreButtonProps>;
  /** Props forwarded to the filter ReqoreInput. */
  inputProps?: Partial<IReqoreInputProps>;
  /** Props forwarded to the popover ReqorePanel wrapper. */
  panelProps?: Partial<IReqorePanelProps>;
  /** Props forwarded to every icon ReqoreButton in the grid. */
  iconButtonProps?: Partial<IReqoreButtonProps>;
  /** Props forwarded to the ReqorePopover. */
  popoverProps?: Partial<
    Omit<IReqorePopoverProps, 'component' | 'componentProps' | 'content' | 'children'>
  >;
}

interface IReqoreIconPickerContentProps {
  icons: IReqoreIconName[];
  value?: IReqoreIconName;
  columns: number;
  gridHeight: number;
  size: TSizes;
  intent?: TReqoreIntent;
  selectedIconIntent?: TReqoreIntent;
  customTheme?: IReqoreCustomTheme;
  filterable: boolean;
  fluid: boolean;
  filterPlaceholder: string;
  noResultsLabel: string;
  selectedIconTooltip: (name: IReqoreIconName) => TReqoreTooltipProp;
  inputProps?: Partial<IReqoreInputProps>;
  panelProps?: Partial<IReqorePanelProps>;
  iconButtonProps?: Partial<IReqoreButtonProps>;
  onPick: (icon: IReqoreIconName) => void;
  /** Injected by ReqorePopover so a pick can dismiss the popover. */
  closePopover?: () => void;
}

// `react-window` cells are oversized by `ICON_PICKER_CELL_GAP` to fake a grid
// gap. Aligning the button to the start (not centre) keeps that gap purely
// *between* cells — so the first row/column sits flush with the panel edge,
// lined up with the filter input and the selected-icon preview above it.
const StyledIconPickerCell = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
`;

/**
 * Popover body for {@link ReqoreIconPicker} — a filterable, virtualized grid
 * of icons. The grid is rendered with `react-window`'s `FixedSizeGrid`, so
 * only the cells in view are mounted; the entire (filtered) icon set scrolls
 * as one virtual surface — there are no pages to step through.
 *
 * Rendered as the popover `content`, so it receives `closePopover` from
 * ReqorePopover.
 */
export const ReqoreIconPickerContent = memo(
  ({
    icons,
    value,
    columns,
    gridHeight,
    size,
    intent,
    selectedIconIntent,
    customTheme,
    filterable,
    fluid,
    filterPlaceholder,
    noResultsLabel,
    selectedIconTooltip,
    inputProps,
    panelProps,
    iconButtonProps,
    onPick,
    closePopover,
  }: IReqoreIconPickerContentProps) => {
    const [query, setQuery] = useState('');
    // Measures the grid's container so a `fluid` grid can fill the width.
    const [gridWrapperRef, { width: measuredWidth }] = useMeasure<HTMLDivElement>();

    // Track the viewport width so the grid can shed columns on narrow screens
    // (a fixed-width grid would otherwise overflow the popover on mobile).
    const [viewportWidth, setViewportWidth] = useState(() =>
      typeof window === 'undefined' ? Infinity : window.innerWidth
    );

    useEffect(() => {
      if (typeof window === 'undefined') {
        return undefined;
      }

      const handleResize = () => setViewportWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredIcons = useMemo(() => {
      if (!query) return icons;
      const normalizedQuery = query.toLowerCase();
      return icons.filter((name) => name.toLowerCase().includes(normalizedQuery));
    }, [icons, query]);

    const cellSize = useMemo(() => getCellSize(size), [size]);

    // Column count + grid dimensions.
    // - Fixed mode: a fixed-width grid of `columns` cells, clamped down to
    //   what fits the viewport so it never overflows on narrow screens.
    // - Fluid mode: the grid fills its measured container width; the column
    //   count is derived from that width and the cells stretch to fill it
    //   exactly. Before the container is measured (first paint / SSR / jsdom)
    //   it falls back to the fixed-mode sizing.
    const { gridColumns, gridColumnWidth, gridWidth } = useMemo(() => {
      const available = viewportWidth - ICON_PICKER_VIEWPORT_MARGIN;
      const fixedColumns = Math.max(
        ICON_PICKER_MIN_COLUMNS,
        Math.min(columns, Math.floor(available / cellSize))
      );

      if (fluid && measuredWidth > 0) {
        const fluidColumns = Math.max(
          ICON_PICKER_MIN_COLUMNS,
          Math.floor(measuredWidth / cellSize)
        );
        return {
          gridColumns: fluidColumns,
          gridColumnWidth: measuredWidth / fluidColumns,
          gridWidth: measuredWidth,
        };
      }

      return {
        gridColumns: fixedColumns,
        gridColumnWidth: cellSize,
        gridWidth: fixedColumns * cellSize,
      };
    }, [columns, cellSize, viewportWidth, fluid, measuredWidth]);

    const rowCount = useMemo(
      () => Math.ceil(filteredIcons.length / gridColumns),
      [filteredIcons.length, gridColumns]
    );

    const handlePick = useCallback(
      (icon: IReqoreIconName) => {
        onPick(icon);
        closePopover?.();
      },
      [onPick, closePopover]
    );

    // `react-window` calls this as a component for every visible cell.
    const Cell = useCallback(
      ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
        const index = rowIndex * gridColumns + columnIndex;

        if (index >= filteredIcons.length) {
          return null;
        }

        const name = filteredIcons[index];
        const isSelected = name === value;

        return (
          <StyledIconPickerCell style={style}>
            <ReqoreButton
              icon={name}
              minimal
              flat
              fixed
              size={size}
              tooltip={name}
              aria-label={name}
              active={isSelected}
              customTheme={customTheme}
              {...iconButtonProps}
              onClick={() => handlePick(name)}
              className={`reqore-icon-picker-item ${
                isSelected ? 'reqore-icon-picker-item-selected' : ''
              } ${iconButtonProps?.className || ''}`.trim()}
            />
          </StyledIconPickerCell>
        );
      },
      [gridColumns, filteredIcons, value, size, customTheme, iconButtonProps, handlePick]
    );

    // Preview of the current selection, shown above the grid.
    const selectedPreview = value ? (
      <ReqoreButton
        icon={value}
        intent={selectedIconIntent}
        size={size}
        fixed
        readOnly
        customTheme={customTheme}
        tooltip={selectedIconTooltip(value)}
        className='reqore-icon-picker-selected'
      />
    ) : null;

    const filterInput = (
      <ReqoreInput
        fluid
        icon='SearchLine'
        size={size}
        intent={intent}
        customTheme={customTheme}
        value={query}
        placeholder={filterPlaceholder}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
        onClearClick={() => setQuery('')}
        {...inputProps}
        className={`reqore-icon-picker-filter ${inputProps?.className || ''}`.trim()}
      />
    );

    // Header row: the selected-icon preview sits to the left of the filter
    // input; with no filter it occupies the row on its own.
    const header = filterable ? (
      <ReqoreControlGroup fluid size={size}>
        {selectedPreview}
        {filterInput}
      </ReqoreControlGroup>
    ) : (
      selectedPreview
    );

    return (
      <ReqorePanel
        flat
        size={size}
        intent={intent}
        customTheme={customTheme}
        {...panelProps}
        fluid={fluid}
        style={{
          ...(fluid ? undefined : { width: 'fit-content', maxWidth: '100%' }),
          ...panelProps?.style,
        }}
        className={`reqore-icon-picker-content ${panelProps?.className || ''}`.trim()}
      >
        {header && (
          <>
            {header}
            <ReqoreVerticalSpacer height={PADDING_FROM_SIZE[size]} />
          </>
        )}
        {filteredIcons.length === 0 ? (
          <ReqoreP className='reqore-icon-picker-empty' effect={{ opacity: 0.6 }}>
            {noResultsLabel}
          </ReqoreP>
        ) : (
          <div ref={gridWrapperRef}>
            <Grid
              className='reqore-icon-picker-grid'
              columnCount={gridColumns}
              columnWidth={gridColumnWidth}
              rowCount={rowCount}
              rowHeight={cellSize}
              height={Math.min(gridHeight, rowCount * cellSize)}
              width={gridWidth}
            >
              {Cell}
            </Grid>
          </div>
        )}
      </ReqorePanel>
    );
  }
);

const defaultSelectedIconTooltip = (name: IReqoreIconName): string => `Selected: ${name}`;

export const ReqoreIconPicker = memo(
  ({
    value,
    onPick,
    icons = ALL_REQORE_ICONS,
    columns = 8,
    gridHeight = 320,
    label,
    pickIconLabel = 'Pick an icon',
    placeholderIcon = 'AppsLine',
    filterPlaceholder = 'Filter icons...',
    noResultsLabel = 'No icons match your filter',
    selectedIconTooltip = defaultSelectedIconTooltip,
    filterable = true,
    inline = false,
    fluid = false,
    isDefaultOpen = false,
    size = 'normal',
    intent,
    selectedIconIntent,
    flat,
    disabled,
    tooltip,
    customTheme,
    buttonProps,
    inputProps,
    panelProps,
    iconButtonProps,
    popoverProps,
  }: IReqoreIconPickerProps) => {
    const triggerProps = useMemo<IReqoreButtonProps>(
      () => ({
        icon: value ?? placeholderIcon,
        size,
        intent,
        flat,
        disabled,
        tooltip,
        customTheme,
        rightIcon: 'ArrowDownSLine',
        ...buttonProps,
        label: label ?? buttonProps?.label ?? value ?? pickIconLabel,
        className: `reqore-icon-picker ${buttonProps?.className || ''}`.trim(),
      }),
      [
        value,
        placeholderIcon,
        size,
        intent,
        flat,
        disabled,
        tooltip,
        customTheme,
        label,
        pickIconLabel,
        buttonProps,
      ]
    );

    const content = useMemo(
      () => (
        <ReqoreIconPickerContent
          icons={icons}
          value={value}
          columns={columns}
          gridHeight={gridHeight}
          size={size}
          intent={intent}
          selectedIconIntent={selectedIconIntent}
          customTheme={customTheme}
          filterable={filterable}
          // `fluid` only applies inline — in popover mode the panel must stay
          // content-sized so the popover itself sizes correctly around it.
          fluid={inline && fluid}
          filterPlaceholder={filterPlaceholder}
          noResultsLabel={noResultsLabel}
          selectedIconTooltip={selectedIconTooltip}
          inputProps={inputProps}
          // In inline mode the content panel is the picker root, so it carries
          // the `.reqore-icon-picker` class hook (in popover mode that hook
          // lives on the trigger button instead).
          panelProps={
            inline
              ? { ...panelProps, className: `reqore-icon-picker ${panelProps?.className || ''}`.trim() }
              : panelProps
          }
          iconButtonProps={iconButtonProps}
          onPick={onPick ?? noop}
        />
      ),
      [
        icons,
        value,
        columns,
        gridHeight,
        size,
        intent,
        selectedIconIntent,
        customTheme,
        filterable,
        fluid,
        filterPlaceholder,
        noResultsLabel,
        selectedIconTooltip,
        inputProps,
        panelProps,
        iconButtonProps,
        onPick,
        inline,
      ]
    );

    // Inline mode renders the filterable grid straight into the layout — no
    // trigger button, no popover.
    if (inline) {
      return content;
    }

    return (
      <ReqorePopover
        component={ReqoreButton}
        componentProps={triggerProps}
        isReqoreComponent
        noWrapper
        noArrow
        handler='click'
        placement='bottom-start'
        closeOnInsideClick={false}
        openOnMount={isDefaultOpen}
        {...popoverProps}
        content={content}
      />
    );
  }
);

export default ReqoreIconPicker;
