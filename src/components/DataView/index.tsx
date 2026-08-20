/**
 * `ReqoreDataView` — render a structured value (record / array / scalar)
 * as a typed, collapsible tree.
 *
 * Visually adjacent to `ReqoreTree` but optimised for *displaying*
 * server payloads (workflow / job / event data, error info, structured
 * audit rows) where the operator wants to see types at a glance, drill
 * into nested sections, and recognise typed-envelope shapes
 * (`{ type, value }`) without an extra layer of rendering noise.
 *
 * Highlights:
 *   - Wraps `ReqorePanel`, so the full panel chrome is available —
 *     label / icon / badge / intent / customTheme / effect / actions /
 *     collapsible / minimal / flat / rounded / size, etc.
 *   - Type-aware value chips powered by `ReqoreTag` intents (string /
 *     number / boolean / date / null / array / object).
 *   - Envelope detection — opt-in shape that unwraps `{ type, value }`
 *     style records to render the inner value with the type label as a
 *     chip. Configurable per call.
 *   - Pluggable date parser + formatter (default works on ISO strings
 *     and `Date.parse`able shapes; consumers can plug in stricter or
 *     domain-specific parsers).
 *   - Pluggable embedded-string parser — for cases where the server
 *     hands back a stringified structured payload that should be
 *     parsed and rendered inline.
 *   - Scalar arrays inline by default (a list of plain strings reads as
 *     a wrapping chip row instead of a tall column of cells).
 *   - Sticky-position scroll preservation when toggling nested sections,
 *     so the operator doesn't lose their place when expanding deep
 *     trees.
 */
import {
  forwardRef,
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { rgba } from 'polished';
import styled, { css } from 'styled-components';
import {
  GAP_FROM_SIZE,
  PADDING_FROM_SIZE,
  RADIUS_FROM_SIZE,
  TEXT_FROM_SIZE,
  TSizes,
} from '../../constants/sizes';
import { MONO_FONT } from '../../constants/fonts';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { TReqoreEffectColor } from '../Effect';
import { changeLightness, getReadableColor, getReadableColorFrom } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreButton from '../Button';
import ReqoreCheckbox from '../Checkbox';
import ReqoreControlGroup from '../ControlGroup';
import ReqoreDropdown from '../Dropdown';
import ReqoreInput from '../Input';
import { ReqoreP } from '../Paragraph';
import { ReqorePanel, IReqorePanelProps } from '../Panel';
import ReqoreTag from '../Tag';
import {
  DEFAULT_ENVELOPE,
  IReqoreDataViewEmbedded,
  IReqoreDataViewEnvelope,
  IReqoreDataViewScalarOptions,
  TReqoreDataValueKind,
  reqoreCoerceValueToKind,
  reqoreDataValueIntent,
  reqoreDataValueKind,
  reqoreDeleteAtPath,
  reqoreEnvelopeType,
  reqoreFormatScalar,
  reqoreHasStructuredValue,
  reqoreIsRecord,
  reqoreRenameKeyAtPath,
  reqoreSetAtPath,
  reqoreUnwrapEnvelope,
} from './helpers';

/**
 * Bag of user-visible strings the DataView renders. Every entry is optional;
 * anything omitted falls back to the built-in English default so consumers
 * can override just the strings they need. Grouped as one prop so a
 * translated dictionary can be passed in a single place instead of via
 * dozens of separate string props.
 */
export interface IReqoreDataViewLabels {
  /** Section summary for an object (record). Defaults to
   *  `Object · N field(s)`. */
  objectSection?: (count: number) => string;
  /** Section summary for a list (array). Defaults to `List · N item(s)`. */
  listSection?: (count: number) => string;
  /** Root section fallback label for a bare scalar value. Defaults to
   *  `'Value'`. */
  scalarSection?: string;
  /** `aria-label` on a click-to-edit scalar cell. Defaults to
   *  `'Edit value'`. */
  editValue?: string;
  /** `aria-label` on a click-to-edit key cell. Defaults to `'Rename key'`. */
  renameKey?: string;
  /** Tooltip for the delete affordance on a record row. Defaults to
   *  ``(key) => `Remove ${key}` ``. */
  removeProperty?: (key: string) => string;
  /** Tooltip for the delete affordance on an array item. Defaults to
   *  ``(index) => `Remove item ${index}` `` (index is 1-based). */
  removeItem?: (indexOneBased: number) => string;
  /** Tooltip on the inline type-picker dropdown. Defaults to
   *  `'Change type'`. */
  changeType?: string;
  /** Tooltip on the scalar-edit commit button. Defaults to
   *  `'Save (Enter)'`. */
  saveValueTooltip?: string;
  /** Tooltip on the scalar-edit cancel button. Defaults to
   *  `'Cancel (Esc)'`. */
  cancelValueTooltip?: string;
  /** Tooltip on the key-rename commit button. Defaults to
   *  `'Rename (Enter)'`. */
  renameCommitTooltip?: string;
  /** Tooltip on the key-rename cancel button. Defaults to
   *  `'Cancel (Esc)'`. */
  renameCancelTooltip?: string;
  /** Label on the `+ Add property` affordance for records. Defaults to
   *  `'Add property'`. */
  addPropertyLabel?: string;
  /** Label on the `+ Add item` affordance for arrays. Defaults to
   *  `'Add item'`. */
  addItemLabel?: string;
  /** Label on the add-entry commit button. Defaults to `'Add'`. */
  addCommitLabel?: string;
  /** Tooltip on the add-entry cancel button. Defaults to `'Cancel'`. */
  addCancelTooltip?: string;
  /** Placeholder for the property-name input in the add-entry form.
   *  Defaults to `'property name'`. */
  propertyNamePlaceholder?: string;
  /** Value-kind labels for the type picker. Each defaults to the English
   *  label used before this prop existed. */
  typeStringLabel?: string;
  typeNumberLabel?: string;
  typeBooleanLabel?: string;
  typeObjectLabel?: string;
  typeArrayLabel?: string;
  typeNullLabel?: string;
}

export interface IReqoreDataViewProps
  extends Omit<IReqorePanelProps, 'children'>,
    IReqoreDataViewScalarOptions {
  /** The structured value to render. */
  data: unknown;

  /** Empty-state copy when `data` carries no meaningful content. */
  emptyText?: string;

  /**
   * Overrides for user-visible strings the DataView renders (section
   * summaries, edit affordances, add-entry form). Every field is optional
   * and falls back to a built-in English default. Grouped as one prop so a
   * consumer app can pass a single translated dictionary instead of many
   * individual `*Label` props.
   */
  labels?: IReqoreDataViewLabels;

  /** When `true` (default), the root container shows a collapsible
   *  summary that the operator can click to fold the whole tree away
   *  when it gets long. When `false`, the root renders flat. */
  collapsibleRoot?: boolean;

  /** Sections deeper than this start collapsed. Defaults to `1` (root
   *  and one level open, everything below collapsed). Set to a high
   *  number to expand everything by default. */
  defaultExpandDepth?: number;

  /** Show a type-label chip next to each scalar (string / number /
   *  date / …). Defaults to `false` — the value chip's intent colour
   *  already encodes the type, and a second chip per row gets noisy on
   *  larger payloads. Flip on when type-at-a-glance matters more than
   *  density. */
  showTypes?: boolean;

  /** Render arrays of scalars (strings / numbers / booleans / dates) as
   *  a wrapping chip row instead of a tall column of cells. Defaults to
   *  `true`. */
  inlineScalarArrays?: boolean;

  /** Recognise a typed-envelope shape and unwrap it. Pass `false` to
   *  disable envelope detection altogether, or an object to customise
   *  the key names + matching strictness. Defaults to the common
   *  `{ type: string, value: unknown }` shape. */
  envelope?: false | IReqoreDataViewEnvelope;

  /** Try to parse string values as structured data (JSON, etc.) and
   *  render the parsed shape inline instead of the raw text. Returns
   *  `{ data, prefix? }` when the string is recognisable, `undefined`
   *  otherwise. Defaults to disabled. */
  parseEmbedded?: (value: string) => IReqoreDataViewEmbedded | undefined;

  /** Row click handler. `path` is the dot-style path from the root —
   *  `['user', 'addresses', '0', 'city']` for a leaf inside a nested
   *  array. */
  onItemClick?: (value: unknown, path: string[]) => void;

  /** Fired when the operator toggles a collapsible section. `open` is
   *  the new state. */
  onSectionToggle?: (open: boolean, path: string[]) => void;

  /** Override the colour of the key chips. Accepts any
   *  `TReqoreEffectColor` (hex / rgb / rgba / `transparent`). Defaults
   *  to no override — the key chip uses the `info` intent. Pass this
   *  when you want the keys to read in a brand colour (e.g. purple to
   *  match an existing palette). */
  keyColor?: TReqoreEffectColor;

  /** Override the intent of the key chips. Pass `null` to drop the
   *  intent entirely (useful when paired with `keyColor`). Defaults to
   *  `'info'`. */
  keyIntent?: TReqoreIntent | null;

  /** Enable inline editing. When `true`, the view becomes a
   *  click-to-edit tree:
   *    - **Scalars** (string / number / boolean / null) render as
   *      value chips by default; click → input; blur / Enter → commit;
   *      Escape → revert.
   *    - **Keys** render as static tags by default; click → input;
   *      blur / Enter → rename (refused when the new key already
   *      exists on the parent record); Escape → revert.
   *    - **Rows** reveal a delete button on hover.
   *    - **Records and arrays** show a trailing `+ Add property` /
   *      `+ Add item` affordance that opens an inline form picking
   *      key (records only) + initial value type (string, number,
   *      boolean, null, object, array). Submitting appends the new
   *      entry.
   *
   *  The DataView never owns the tree — every commit fires
   *  `onDataChange(next)` with the FULL updated structure; the parent
   *  re-feeds it back via `data` on the next render. Path-level
   *  callbacks (`onValueChange`, `onAddProperty`, …) fire alongside
   *  for consumers that want to route a single change through a
   *  reducer. */
  editable?: boolean;

  /** Fired with the full updated `data` tree after every commit
   *  (value edit, key rename, row delete, row add). The DataView is
   *  fully controlled — the parent is the single source of truth. */
  onDataChange?: (next: unknown) => void;

  /** Path-level edit callback for scalar value changes. */
  onValueChange?: (path: string[], value: unknown) => void;

  /** Fired when the operator deletes a row. For a record, `path`
   *  ends in the key being removed; for an array, in the index. */
  onRemoveProperty?: (path: string[]) => void;

  /** Fired when the operator renames a record key. `path` is the
   *  path of the parent record (so `path` + `[oldKey]` is where the
   *  value lived). */
  onRenameProperty?: (path: string[], oldKey: string, newKey: string) => void;

  /** Fired when the operator adds a new property to a record or
   *  appends a new item to an array. For records, `keyOrIndex` is the
   *  new key; for arrays, the new index (as a number). `initialValue`
   *  is the default value for the picked type (empty string, `0`,
   *  `false`, `null`, `{}`, or `[]`). */
  onAddProperty?: (
    path: string[],
    keyOrIndex: string | number,
    initialValue: unknown
  ) => void;

  /** Fired when the operator picks a new value-kind for an existing
   *  row via the inline type picker. The DataView coerces the
   *  existing value via {@link reqoreCoerceValueToKind} (preserves
   *  content where it can; defaults for incompatible transitions)
   *  and re-emits the tree via `onDataChange`. */
  onChangeType?: (path: string[], kind: TReqoreDataValueKind) => void;
}

const SECTION_LABEL = (kind: 'Object' | 'List', count: number): string => {
  const word = kind === 'Object' ? 'field' : 'item';
  return `${kind} · ${count} ${word}${count === 1 ? '' : 's'}`;
};

type TRenderContext = {
  theme: IReqoreTheme;
  envelope: IReqoreDataViewEnvelope | false;
  parseEmbedded?: (value: string) => IReqoreDataViewEmbedded | undefined;
  showTypes: boolean;
  inlineScalarArrays: boolean;
  defaultExpandDepth: number;
  size: TSizes;
  scalarOptions: IReqoreDataViewScalarOptions;
  onItemClick?: (value: unknown, path: string[]) => void;
  onSectionToggle?: (open: boolean, path: string[]) => void;
  /** Key-chip colour override (forwarded to `ReqoreTag.color`). */
  keyColor?: TReqoreEffectColor;
  /** Key-chip intent (defaults to `'info'`, `null` drops it). */
  keyIntent?: TReqoreIntent | null;
  /** When true, scalar leaves render as click-to-edit chips, keys
   *  are renamable, rows expose delete affordances, and containers
   *  expose `+ Add` affordances. */
  editable: boolean;
  /** Commit a new scalar value at `path`. The owning `ReqoreDataView`
   *  applies the immutable path-set and notifies the consumer via
   *  `onDataChange`. */
  commitScalar?: (path: string[], value: unknown) => void;
  /** Remove the leaf at `path` (record key or array index). */
  commitDelete?: (path: string[]) => void;
  /** Rename a key on the record at `path`. Refused if `newKey`
   *  already exists on that record. */
  commitRename?: (path: string[], oldKey: string, newKey: string) => void;
  /** Add a new entry to the record / array at `path`. */
  commitAdd?: (
    path: string[],
    keyOrIndex: string | number,
    initialValue: unknown
  ) => void;
  /** Coerce the leaf at `path` to a different value-kind. The owning
   *  `ReqoreDataView` handles the conversion through
   *  {@link reqoreCoerceValueToKind} and the immutable path-set. */
  commitTypeChange?: (path: string[], kind: TReqoreDataValueKind) => void;
};

interface IStyledThemeProps {
  $theme: IReqoreTheme;
  $size: TSizes;
}


const Tree = styled.div<IStyledThemeProps>`
  display: flex;
  flex-flow: column;
  gap: ${({ $size }) => GAP_FROM_SIZE[$size]}px;
  min-width: 0;
  width: 100%;
  font-size: ${({ $size }) => TEXT_FROM_SIZE[$size]}px;
  color: ${({ $theme }) => $theme.text.color || $theme.main};

  /* Force monospace on every tag we render inside the view — keys,
     values and type labels — so the tree reads like one consistent
     data-view material rather than a row of disconnected chips.
     Override via the tag's own \`effect.textSize\` if you need to
     dial it back. \`&&\` (not \`!important\`) beats \`StyledTag\`'s
     \`font-family: system-ui\` — both are one generated class deep, so
     without the specificity boost the winner is just whichever
     styled-component happens to mount last. \`!important\` here would
     tax every downstream consumer trying to override this from their
     own \`customTheme\` / \`effect\`. 
     Prefer \`effect={{ fontFamily: 'mono' }}\` on new code — \`StyledTag\` now only
     declares its own family when the effect does not, so a tag can simply ask for
     mono. This block stays because the classes below are set on tags this component
     does not own the props of; migrating them is a separate change. */
  && .reqore-data-view-key,
  && .reqore-data-view-key .reqore-tag-content,
  && .reqore-data-view-value,
  && .reqore-data-view-value .reqore-tag-content,
  && .reqore-data-view-type,
  && .reqore-data-view-type .reqore-tag-content {
    font-family: ${MONO_FONT};
    /* Long unbreakable identifiers (UUIDs, snake_case keys, HL7
       payloads with no spaces) need an extra hint to break — the
       tag's own \`wrap\` enables breaks at WHITESPACE, but these run
       on continuously. \`overflow-wrap: anywhere\` is the
       last-resort break point. Only applied here (inside the tag
       content) so the chip's outer geometry isn't affected. */
    overflow-wrap: anywhere;
    word-break: break-word;
  }
`;

const TableShell = styled.div<IStyledThemeProps & { $nested?: boolean }>`
  display: flex;
  flex-flow: column;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  /* Nested containers get a *darker* tint — visual depth comes from
     the surface itself stepping down a notch for every level of
     nesting, the same pattern the IDE uses. The container's right /
     top / bottom borders are a near-invisible neutral; the LEFT edge
     carries a 2px theme-tinted accent so every group (root *and*
     nested) reads as an indented chunk with a clear left rail. */
  border: 1px solid ${({ $theme }) => rgba(getReadableColor($theme), 0.08)};
  border-left: 2px solid ${({ $theme }) => rgba(getReadableColor($theme), 0.18)};
  border-radius: ${({ $size }) => RADIUS_FROM_SIZE[$size]}px;
  /* Nested groups need a *visibly* darker fill to read as one level
     deeper. A small alpha bump (0.10 → 0.22) was too subtle on top of
     an already-dark panel surface; 0.45 makes the depth step
     unmistakable while still being a colour darken (so it works on
     both light and dark themes). */
  background: ${({ $nested }) =>
    $nested ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.15)'};
`;


const Row = styled.div<
  IStyledThemeProps & {
    $complex?: boolean;
    $odd?: boolean;
    $stacked?: boolean;
    $editable?: boolean;
  }
>`
  display: grid;
  /* Grid columns + named areas together so children land in fixed
     cells regardless of how many children render. Without
     grid-template-areas, a 3-child row (key + value + actions) in a
     2-column grid would auto-place the value into the actions
     column. */
  grid-template-columns: ${({ $complex, $stacked, $editable }) => {
    const stacked = $complex || $stacked;
    if ($editable) {
      return stacked
        ? 'minmax(0, 1fr) auto'
        : 'minmax(120px, min(34%, 220px)) minmax(0, 1fr) auto';
    }
    return stacked
      ? 'minmax(0, 1fr)'
      : 'minmax(120px, min(34%, 220px)) minmax(0, 1fr)';
  }};
  grid-template-areas: ${({ $complex, $stacked, $editable }) => {
    const stacked = $complex || $stacked;
    if ($editable) {
      return stacked
        ? `'key actions' 'value value'`
        : `'key value actions'`;
    }
    return stacked ? `'key' 'value'` : `'key value'`;
  }};

  & > .reqore-data-view-key,
  & > .reqore-data-view-key-edit-group {
    grid-area: key;
  }
  & > .reqore-data-view-value-cell {
    grid-area: value;
  }
  & > .reqore-data-view-row-actions {
    grid-area: actions;
  }
  gap: ${({ $size, $complex, $stacked }) =>
    $complex || $stacked ? GAP_FROM_SIZE[$size] : 8}px;
  align-items: start;
  min-width: 0;
  padding: ${({ $size }) => PADDING_FROM_SIZE[$size] / 2}px ${({ $size }) =>
      PADDING_FROM_SIZE[$size]}px;
  /* Zebra striping. The stripe tint is derived from the *text* colour
     (the high-contrast colour relative to the panel surface) — that
     way an alpha lift produces a visible stripe regardless of whether
     the theme is light, dark, or custom. Painting against theme.main
     directly is invisible on a panel whose background is also
     theme.main. */
  background: ${({ $theme, $odd }) =>
    $odd ? rgba(getReadableColor($theme), 0.06) : 'transparent'};
  border-bottom: 1px solid
    ${({ $theme }) => rgba(getReadableColor($theme), 0.08)};

  &:last-child {
    border-bottom: 0;
  }

  ${({ $complex }) =>
    $complex &&
    css`
      flex-direction: column;
    `}

  /* The key chip's grid behaviour, applied universally — covers
     two-column rows, complex-value rows AND stacked (narrow
     container) rows in one set of rules:
     - \`justify-self: start\` stops the grid's default
       \`justify-items: stretch\` from expanding the chip to fill the
       full grid cell. The chip sizes to its content instead, only
       hitting the column cap when content actually needs it.
     - \`min-width: 0\` releases ReqoreTag's intrinsic min-content size
       (its longest unbreakable run) so the grid track can honour
       its \`minmax(..., 220px)\` cap. Without this, snake_case keys
       or UUIDs feed back into the track sizing and expand the
       column past 220px. */
  & > .reqore-data-view-key {
    justify-self: start;
    min-width: 0;
    max-width: 100%;
  }
`;

const ValueCell = styled.div<IStyledThemeProps & { $complex?: boolean }>`
  min-width: 0;
  max-width: 100%;
  font-family: ${MONO_FONT};
  font-size: ${({ $size }) => TEXT_FROM_SIZE[$size] - 1}px;
  word-break: break-word;
  /* Complex values (records / arrays) get a generous left inset and a
     small top margin so the nested block reads as an indented chunk
     under its key. The left rail itself lives on the nested
     TableShell, NOT here — that way the root group carries the same
     rail without needing a wrapping ValueCell. */
  ${({ $complex, $size }) =>
    $complex &&
    css`
      margin-top: 4px;
      padding-left: ${PADDING_FROM_SIZE[$size] + 6}px;
    `}
`;

/** Multiline strings are data documents, not compact scalar labels. Rendering
 *  them inside a tag creates a very tall pill and makes large text/plain
 *  payloads difficult to inspect. Keep their original whitespace in a
 *  bounded, scrollable data surface instead — but keep the same border /
 *  background language as the neutral (no-intent) value chip in
 *  `renderScalar` below (a plain `ReqoreTag` with `minimal flat={false}`
 *  and no `color`) so the block reads as the same value-chip family, just
 *  taller and pre-formatted, rather than an unrelated visual element. Only
 *  the font, wrapping and scroll behaviour are new. */
const MultilineValue = styled.pre<IStyledThemeProps & { $interactive?: boolean }>`
  box-sizing: border-box;
  flex: 1 1 300px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  max-height: min(320px, 45vh);
  margin: 0;
  padding: ${({ $size }) => PADDING_FROM_SIZE[$size]}px;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  tab-size: 2;
  border: 1px solid ${({ $theme }) => changeLightness($theme.main, 0.2)};
  border-radius: ${({ $size }) => RADIUS_FROM_SIZE[$size]}px;
  background: ${rgba(changeLightness('#000000', 0.05), 0.3)};
  color: ${({ $theme }) => getReadableColorFrom(changeLightness($theme.main, 0.1))};
  font-family: ${MONO_FONT};
  font-size: ${({ $size }) => TEXT_FROM_SIZE[$size] - 1}px;
  font-variant-ligatures: none;
  line-height: 1.45;
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'text')};

  ${({ $interactive, $theme }) =>
    $interactive &&
    css`
      &:hover,
      &:focus-visible {
        border-color: ${changeLightness($theme.main, 0.35)};
        outline: none;
      }
    `}
`;

const ArrayStack = styled.div<IStyledThemeProps>`
  display: flex;
  flex-flow: column;
  gap: ${({ $size }) => GAP_FROM_SIZE[$size]}px;
  min-width: 0;
  width: 100%;
`;

const ArrayItem = styled.div<IStyledThemeProps>`
  min-width: 0;
  max-width: 100%;
  /* Two-column flex layout: content (index + value) on the left,
     hover-revealed action cell on the right. Keeps the actions
     properly inside the item's bounds instead of leaning on absolute
     positioning. */
  display: flex;
  flex-flow: row;
  align-items: start;
  gap: 8px;
  /* More left padding than the other three sides so the item index
     and contents read as visually inset under the parent — mirrors
     the IDE pattern of "nested = inset". */
  padding: ${({ $size }) => PADDING_FROM_SIZE[$size]}px
    ${({ $size }) => PADDING_FROM_SIZE[$size]}px
    ${({ $size }) => PADDING_FROM_SIZE[$size]}px
    ${({ $size }) => PADDING_FROM_SIZE[$size] + 6}px;
  border: 1px solid ${({ $theme }) => rgba(getReadableColor($theme), 0.08)};
  border-left: 2px solid ${({ $theme }) => rgba(getReadableColor($theme), 0.18)};
  border-radius: ${({ $size }) => RADIUS_FROM_SIZE[$size]}px;
  background: rgba(0, 0, 0, 0.45);
`;

/** Content column for an array item — wraps the item's index +
 *  rendered value so the flex row's other cell (the action group)
 *  sits to the right without competing for width. */
const ArrayItemContent = styled.div`
  flex: 1 1 auto;
  min-width: 0;
`;

const ArrayItemIndex = styled.span<IStyledThemeProps>`
  display: inline-block;
  margin-bottom: ${({ $size }) => GAP_FROM_SIZE[$size]}px;
  padding: 1px 6px;
  border-radius: 4px;
  background: ${({ $theme }) => rgba(getReadableColor($theme), 0.12)};
  color: ${({ $theme }) => getReadableColor($theme)};
  font-family: ${MONO_FONT};
  font-size: 11px;
  opacity: 0.78;
`;

const ScalarRow = styled(ReqoreControlGroup)`
  flex-wrap: wrap;
`;

const SectionDetails = styled.details<IStyledThemeProps>`
  min-width: 0;
  max-width: 100%;

  &[open] > summary {
    margin-bottom: ${({ $size }) => GAP_FROM_SIZE[$size]}px;
  }
`;

const SectionSummary = styled.summary<IStyledThemeProps>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  cursor: pointer;
  user-select: none;
  font-family: ${MONO_FONT};
  font-size: ${({ $size }) => TEXT_FROM_SIZE[$size] - 2}px;
  font-weight: 700;
  /* Section labels MUST stay readable — they're the only way the
     operator knows what's nested below. We derive a high-contrast
     colour from the panel's surface instead of falling back to
     theme.main, which would be the SAME colour as the panel
     background on most themes (invisible). */
  color: ${({ $theme }) => getReadableColor($theme)};
  opacity: 0.85;
  transition: opacity 0.15s ease-out;

  &:hover {
    opacity: 1;
  }

  &::-webkit-details-marker {
    display: none;
  }

  &::before {
    content: '▸';
    display: inline-block;
    transition: transform 0.15s ease-out;
    transform-origin: 50% 50%;
  }

  ${SectionDetails}[open] > &::before {
    transform: rotate(90deg);
  }
`;

type TScrollTarget = HTMLElement | Window;

const scrollPattern = /(auto|scroll|overlay)/;

const isScrollable = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return (
    scrollPattern.test(`${style.overflowY} ${style.overflow}`) &&
    element.scrollHeight > element.clientHeight
  );
};

const findScrollTarget = (element: HTMLElement): TScrollTarget => {
  let current = element.parentElement;
  while (current && current !== document.body) {
    if (isScrollable(current)) return current;
    current = current.parentElement;
  }
  return window;
};

const shiftScroll = (target: TScrollTarget, delta: number): void => {
  if (!delta) return;
  if (target === window) {
    window.scrollBy(0, delta);
    return;
  }
  (target as HTMLElement & { scrollTop: number }).scrollTop += delta;
};

interface IPreservedDetailsProps {
  initialOpen: boolean;
  label: string;
  path: string[];
  size: TSizes;
  theme: IReqoreTheme;
  onToggle?: (open: boolean, path: string[]) => void;
  children: ReactNode;
}

const PreservedDetails = memo(
  ({
    initialOpen,
    label,
    path,
    size,
    theme,
    onToggle,
    children,
  }: IPreservedDetailsProps) => {
    const [open, setOpen] = useState(initialOpen);
    const summaryRef = useRef<HTMLElement | null>(null);
    const pendingTopRef = useRef<number | null>(null);
    const scrollTargetRef = useRef<TScrollTarget | null>(null);

    const preserveScroll = useCallback(() => {
      const summary = summaryRef.current;
      if (!summary) return;
      pendingTopRef.current = summary.getBoundingClientRect().top;
      scrollTargetRef.current = findScrollTarget(summary);
    }, []);

    const toggle = useCallback(() => {
      preserveScroll();
      setOpen((current) => {
        const next = !current;
        onToggle?.(next, path);
        return next;
      });
    }, [onToggle, path, preserveScroll]);

    const onSummaryClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        toggle();
      },
      [toggle]
    );

    const onSummaryKey = useCallback(
      (event: KeyboardEvent<HTMLElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
      },
      [toggle]
    );

    useLayoutEffect(() => {
      const previous = pendingTopRef.current;
      const summary = summaryRef.current;
      const target = scrollTargetRef.current;
      if (previous === null || !summary || !target) return;
      pendingTopRef.current = null;
      scrollTargetRef.current = null;
      shiftScroll(target, summary.getBoundingClientRect().top - previous);
    }, [open]);

    return (
      <SectionDetails $size={size} $theme={theme} open={open}>
        <SectionSummary
          ref={summaryRef as React.Ref<HTMLElement>}
          $size={size}
          $theme={theme}
          role='button'
          aria-expanded={open}
          tabIndex={0}
          onClick={onSummaryClick}
          onKeyDown={onSummaryKey}
        >
          {label}
        </SectionSummary>
        {children}
      </SectionDetails>
    );
  }
);

PreservedDetails.displayName = 'ReqoreDataView.PreservedDetails';

/** Render the read-only value chip for a scalar leaf. Extracted so
 *  both the read-only view and the click-to-edit cell share one
 *  rendering — keeps the "before / after" look of an edited row
 *  perfectly aligned with rows you can't edit. */
const renderScalarChip = (
  value: unknown,
  type: string | undefined,
  ctx: TRenderContext,
  path: string[]
): ReactNode => {
  const scalar = reqoreFormatScalar(value, type, ctx.scalarOptions);
  const kind = type ? reqoreDataValueKind(value, type) : scalar.kind;
  const intent = reqoreDataValueIntent(kind);
  return (
    <ReqoreTag
      size={ctx.size}
      flat={false}
      minimal
      wrap
      label={scalar.display}
      intent={intent}
      effect={{ weight: 'bold' }}
      onClick={
        ctx.onItemClick ? () => ctx.onItemClick!(value, path) : undefined
      }
      className='reqore-data-view-value'
    />
  );
};

const EditCellShell = styled.span<{ $editing?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  cursor: ${({ $editing }) => ($editing ? 'text' : 'pointer')};

  /* Subtle hover hint on the chip so operators know it's clickable —
     without shouting. The chip itself doesn't gain border / shadow;
     we just lift its outline a hair. */
  &:not([data-editing='true']):hover .reqore-data-view-value {
    outline: 1px dashed
      ${({ theme }) =>
        rgba(getReadableColor(theme as IReqoreTheme), 0.35)};
    outline-offset: 1px;
  }
`;

/** Click-to-edit scalar leaf. Renders the same read-only chip the
 *  display view uses, until the operator clicks it — then swaps to an
 *  input bound to a local draft. Commits on **blur** or **Enter**;
 *  reverts on **Escape**. Booleans are special-cased to a checkbox
 *  (toggle == edit; no separate edit mode needed).
 *
 *  The parent owns the data — committed values flow back via
 *  `ctx.commitScalar(path, value)` and re-enter as new props on the
 *  next render. */
interface IEditableScalarCellProps {
  value: unknown;
  kind: TReqoreDataValueKind;
  type?: string;
  ctx: TRenderContext;
  path: string[];
}

const initialDraftFor = (
  value: unknown,
  k: TReqoreDataValueKind
): string | boolean => {
  if (k === 'boolean') return value === true;
  return value === null || value === undefined ? '' : String(value);
};

const EditableScalarCell = memo<IEditableScalarCellProps>(
  ({ value, kind, type, ctx, path }) => {
    const commit = ctx.commitScalar;

    const isNumber = kind === 'number';
    const isBoolean = kind === 'boolean';
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<string | boolean>(
      initialDraftFor(value, kind)
    );
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Re-sync the local draft when the prop value or kind changes
    // externally. Editing keeps its own draft until commit/cancel.
    useLayoutEffect(() => {
      if (editing) return;
      setDraft(initialDraftFor(value, kind));
    }, [value, kind, editing]);

    // Focus the input when entering edit mode (text / number cells
    // only — boolean's checkbox is keyboard-accessible by tab).
    useLayoutEffect(() => {
      if (!editing || isBoolean) return;
      const node = inputRef.current;
      if (!node) return;
      node.focus();
      node.select?.();
    }, [editing, isBoolean]);

    const startEditing = useCallback(() => {
      if (!commit) return;
      setDraft(initialDraftFor(value, kind));
      setEditing(true);
    }, [commit, kind, value]);

    const cancelEditing = useCallback(() => {
      setDraft(initialDraftFor(value, kind));
      setEditing(false);
    }, [kind, value]);

    const commitDraft = useCallback(() => {
      if (!commit) {
        setEditing(false);
        return;
      }
      if (isBoolean) {
        commit(path, draft === true);
        setEditing(false);
        return;
      }
      const text = typeof draft === 'string' ? draft : '';
      if (isNumber) {
        if (text.trim() === '') {
          commit(path, null);
          setEditing(false);
          return;
        }
        const parsed = Number(text);
        if (Number.isNaN(parsed)) {
          cancelEditing();
          return;
        }
        commit(path, parsed);
        setEditing(false);
        return;
      }
      // String / null cells. An empty edit on a null leaf is a no-op
      // (don't accidentally upgrade null → empty string).
      if (text === '' && (value === null || value === undefined)) {
        setEditing(false);
        return;
      }
      commit(path, text);
      setEditing(false);
    }, [cancelEditing, commit, draft, isBoolean, isNumber, path, value]);

    if (!editing) {
      return (
        <EditCellShell
          data-editing='false'
          onClick={(e) => {
            e.stopPropagation();
            startEditing();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              startEditing();
            }
          }}
          role='button'
          tabIndex={0}
          aria-label='Edit value'
        >
          {renderScalarChip(value, type, ctx, path)}
        </EditCellShell>
      );
    }

    // Inline type-change. Coerces the CURRENT DRAFT (in its
    // canonical form for the current kind — string for text/numeric
    // inputs, boolean for the checkbox) to the picked kind. A user
    // who has typed `42` and then realises they meant Number keeps
    // the `42` they typed; a user who has clicked the checkbox `on`
    // and switches to String gets `"true"`.
    //
    // Picking `string` / `number` / `boolean` keeps the cell in edit
    // mode and re-initialises the draft to the coerced value (so the
    // input swap doesn't visually drop the user's intent). Picking
    // `object` / `array` / `null` commits the coerced value and
    // exits so the right control takes over (structural view / "—"
    // chip).
    const handlePickType = (newKind: TReqoreDataValueKind) => {
      if (newKind === kind) return;
      const coerced = reqoreCoerceValueToKind(draft, newKind);
      ctx.commitTypeChange?.(path, newKind);
      if (newKind === 'string' || newKind === 'number') {
        setDraft(coerced === null || coerced === undefined ? '' : String(coerced));
      } else if (newKind === 'boolean') {
        setDraft(coerced === true);
      } else {
        setEditing(false);
      }
    };

    const currentTypeItem = TYPE_PICKER_ITEMS.find(
      (entry) => entry.kind === kind
    );

    return (
      <ReqoreControlGroup
        gapSize='tiny'
        verticalAlign='center'
        size={ctx.size}
        className='reqore-data-view-edit-group'
      >
        {isBoolean ? (
          <ReqoreCheckbox
            checked={draft === true}
            size={ctx.size}
            // Toggle the LOCAL draft only — Save commits, Cancel
            // discards. Keeps the edit semantics identical to
            // text/number cells.
            onClick={() => setDraft(!(draft === true))}
            className='reqore-data-view-edit-bool'
          />
        ) : (
          <ReqoreInput
            size={ctx.size}
            type={isNumber ? 'number' : 'text'}
            value={typeof draft === 'string' ? draft : ''}
            ref={
              ((node: { _input?: HTMLInputElement } | HTMLDivElement | null) => {
                if (node instanceof HTMLElement) {
                  inputRef.current = node.querySelector('input');
                }
              }) as unknown as React.Ref<HTMLDivElement>
            }
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDraft(event.target.value)
            }
            onBlur={commitDraft}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitDraft();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                cancelEditing();
              }
            }}
            className='reqore-data-view-edit'
          />
        )}
        {/* Inline type picker — only visible while editing. The
            trigger shows the CURRENT kind so the operator reads the
            row as "I'm editing X, currently typed as Y; want to
            change?" rather than picking a brand-new type blind. */}
        {ctx.commitTypeChange ? (
          <ReqoreDropdown
            size={ctx.size}
            icon={currentTypeItem?.icon ?? 'TextWrap'}
            tooltip='Change type'
            className='reqore-data-view-edit-type'
            items={TYPE_PICKER_ITEMS.map((entry) => ({
              label: entry.label,
              icon: entry.icon,
              selected: entry.kind === kind,
              onClick: () => handlePickType(entry.kind),
            }))}
          />
        ) : null}
        {/* Save / Cancel use `onMouseDown` with `preventDefault` so
            clicking them doesn't first blur-commit the input — the
            action you clicked is the action that fires. */}
        <ReqoreButton
          size={ctx.size}
          icon='CheckLine'
          intent='success'
          flat
          minimal
          tooltip='Save (Enter)'
          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            commitDraft();
          }}
          className='reqore-data-view-edit-commit'
        />
        <ReqoreButton
          size={ctx.size}
          icon='CloseLine'
          flat
          minimal
          tooltip='Cancel (Esc)'
          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            cancelEditing();
          }}
          className='reqore-data-view-edit-cancel'
        />
      </ReqoreControlGroup>
    );
  }
);
EditableScalarCell.displayName = 'ReqoreDataView.EditableScalarCell';

/** Click-to-edit key cell — swaps the static key tag for an input on
 *  click, then commits via `ctx.commitRename`. The owning RecordTable
 *  rejects duplicate keys before the commit reaches the parent. */
interface IEditableKeyCellProps {
  keyName: string;
  siblingKeys: ReadonlyArray<string>;
  parentPath: string[];
  ctx: TRenderContext;
}

const EditableKeyCell = memo<IEditableKeyCellProps>(
  ({ keyName, siblingKeys, parentPath, ctx }) => {
    const commit = ctx.commitRename;
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(keyName);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useLayoutEffect(() => {
      if (editing) return;
      setDraft(keyName);
    }, [keyName, editing]);

    useLayoutEffect(() => {
      if (!editing) return;
      const node = inputRef.current;
      if (!node) return;
      node.focus();
      node.select?.();
    }, [editing]);

    const start = useCallback(() => {
      if (!commit) return;
      setDraft(keyName);
      setEditing(true);
    }, [commit, keyName]);
    const cancel = useCallback(() => {
      setDraft(keyName);
      setEditing(false);
    }, [keyName]);
    const submit = useCallback(() => {
      const trimmed = draft.trim();
      if (!commit || !trimmed || trimmed === keyName) {
        cancel();
        return;
      }
      if (siblingKeys.includes(trimmed)) {
        cancel();
        return;
      }
      commit(parentPath, keyName, trimmed);
      setEditing(false);
    }, [cancel, commit, draft, keyName, parentPath, siblingKeys]);

    if (!editing) {
      return (
        <EditCellShell
          data-editing='false'
          onClick={(e) => {
            e.stopPropagation();
            start();
          }}
          role='button'
          tabIndex={0}
          aria-label='Rename key'
        >
          <ReqoreTag
            size={ctx.size}
            flat={false}
            minimal
            wrap
            intent={ctx.keyIntent === null ? undefined : ctx.keyIntent ?? 'info'}
            color={ctx.keyColor}
            label={keyName}
            effect={{ weight: 'bold' }}
            className='reqore-data-view-key'
          />
        </EditCellShell>
      );
    }

    return (
      <ReqoreControlGroup
        gapSize='tiny'
        verticalAlign='center'
        size={ctx.size}
        className='reqore-data-view-key-edit-group'
      >
        <ReqoreInput
          size={ctx.size}
          value={draft}
          ref={
            ((node: HTMLDivElement | null) => {
              if (node instanceof HTMLElement) {
                inputRef.current = node.querySelector('input');
              }
            }) as unknown as React.Ref<HTMLDivElement>
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDraft(e.target.value)
          }
          onBlur={submit}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            }
          }}
          className='reqore-data-view-key-edit'
        />
        <ReqoreButton
          size={ctx.size}
          icon='CheckLine'
          intent='success'
          flat
          minimal
          tooltip='Rename (Enter)'
          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            submit();
          }}
          className='reqore-data-view-key-edit-commit'
        />
        <ReqoreButton
          size={ctx.size}
          icon='CloseLine'
          flat
          minimal
          tooltip='Cancel (Esc)'
          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            cancel();
          }}
          className='reqore-data-view-key-edit-cancel'
        />
      </ReqoreControlGroup>
    );
  }
);
EditableKeyCell.displayName = 'ReqoreDataView.EditableKeyCell';

/** Hover-revealed row action group — currently the delete button.
 *  Renders as a normal grid cell at the trailing edge of each row so
 *  it always sits cleanly inside the row's bounds (no absolute
 *  positioning, no overflow past the panel's rounded corner). The
 *  group's `opacity` is `0` by default and promoted to `1` on row
 *  hover via the parent `Row`'s `:hover` rule. The cell itself stays
 *  in the layout so the row width doesn't jump as the user hovers. */
const RowActionsContainer = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  /* Pad the action cell off the row's right edge a touch so the button
     doesn't kiss the panel's rounded corner. */
  padding-right: 2px;
  opacity: 0;
  transition: opacity 0.12s ease-out;
  pointer-events: none;

  .reqore-data-view-row:hover & {
    opacity: 1;
    pointer-events: auto;
  }

  /* Keep the actions visible when any child is focused (keyboard
     navigation must reveal them too). */
  &:focus-within {
    opacity: 1;
    pointer-events: auto;
  }
`;

/** Row-level action group. Only the delete affordance lives here —
 *  type-changing is a per-value editing concern and ships inside the
 *  edit-mode ControlGroup instead, so the always-visible row actions
 *  stay purely structural. */
interface IRowActionsProps {
  ctx: TRenderContext;
  path: string[];
  ariaLabel: string;
}

const RowActions = memo<IRowActionsProps>(({ ctx, path, ariaLabel }) => {
  if (!ctx.commitDelete) return null;
  return (
    <RowActionsContainer
      className='reqore-data-view-row-actions'
      onClick={(e) => e.stopPropagation()}
    >
      <ReqoreButton
        size={ctx.size}
        icon='DeleteBin6Line'
        flat
        minimal
        tooltip={ariaLabel}
        intent='danger'
        onClick={() => ctx.commitDelete!(path)}
        className='reqore-data-view-row-delete'
      />
    </RowActionsContainer>
  );
});
RowActions.displayName = 'ReqoreDataView.RowActions';

/** Default value for a new entry of the picked type. */
const defaultForKind = (kind: TReqoreDataValueKind): unknown => {
  switch (kind) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'object':
      return {};
    case 'array':
      return [];
    case 'null':
    default:
      return null;
  }
};

const TYPE_PICKER_ITEMS: Array<{
  kind: TReqoreDataValueKind;
  label: string;
  icon: 'TextWrap' | 'Hashtag' | 'CheckboxLine' | 'BracesLine' | 'BracketsLine' | 'CircleLine';
}> = [
  { kind: 'string', label: 'String', icon: 'TextWrap' },
  { kind: 'number', label: 'Number', icon: 'Hashtag' },
  { kind: 'boolean', label: 'Boolean', icon: 'CheckboxLine' },
  { kind: 'object', label: 'Object (hash)', icon: 'BracesLine' },
  { kind: 'array', label: 'Array (list)', icon: 'BracketsLine' },
  { kind: 'null', label: 'Null', icon: 'CircleLine' },
];

const AddRowShell = styled.div`
  display: flex;
  flex-flow: row wrap;
  gap: 6px;
  align-items: center;
  padding: 8px;
  border-top: 1px dashed
    ${({ theme }) => rgba(getReadableColor(theme as IReqoreTheme), 0.2)};
  background: rgba(0, 0, 0, 0.12);
`;

/** Inline `+ Add property` / `+ Add item` affordance.
 *
 *  Renders as a trailing button at the end of a record / array. Click
 *  the button → expands to a form: a key input (records only) + a
 *  type-picker dropdown + commit / cancel buttons. Submitting fires
 *  `ctx.commitAdd(parentPath, key|index, defaultForKind(kind))`.
 *
 *  Records: rejects empty / duplicate keys.
 *  Arrays:  appends to the next index. */
interface IAddEntryAffordanceProps {
  ctx: TRenderContext;
  parentPath: string[];
  /** Existing keys (records) or existing length (arrays). */
  context:
    | { kind: 'record'; existingKeys: ReadonlyArray<string> }
    | { kind: 'array'; length: number };
}

const AddEntryAffordance = memo<IAddEntryAffordanceProps>(
  ({ ctx, parentPath, context }) => {
    const [open, setOpen] = useState(false);
    const [key, setKey] = useState('');
    const [valueKind, setValueKind] = useState<TReqoreDataValueKind>('string');

    if (!ctx.commitAdd) return null;

    const reset = () => {
      setOpen(false);
      setKey('');
      setValueKind('string');
    };

    const submit = () => {
      const initial = defaultForKind(valueKind);
      if (context.kind === 'record') {
        const trimmed = key.trim();
        if (!trimmed) return;
        if (context.existingKeys.includes(trimmed)) return;
        ctx.commitAdd!(parentPath, trimmed, initial);
      } else {
        ctx.commitAdd!(parentPath, context.length, initial);
      }
      reset();
    };

    if (!open) {
      return (
        <AddRowShell
          className='reqore-data-view-add-row'
          data-state='collapsed'
        >
          <ReqoreButton
            size={ctx.size}
            icon='AddLine'
            flat
            minimal
            onClick={() => setOpen(true)}
            label={context.kind === 'record' ? 'Add property' : 'Add item'}
          />
        </AddRowShell>
      );
    }

    const typeItem = TYPE_PICKER_ITEMS.find((entry) => entry.kind === valueKind);

    return (
      <AddRowShell
        className='reqore-data-view-add-row'
        data-state='expanded'
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            reset();
          }
        }}
      >
        {context.kind === 'record' ? (
          <ReqoreInput
            size={ctx.size}
            placeholder='property name'
            value={key}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setKey(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submit();
              }
            }}
            className='reqore-data-view-add-key'
          />
        ) : null}
        <ReqoreDropdown
          size={ctx.size}
          icon={typeItem?.icon}
          label={typeItem?.label ?? 'String'}
          className='reqore-data-view-add-type'
          items={TYPE_PICKER_ITEMS.map((entry) => ({
            label: entry.label,
            icon: entry.icon,
            selected: entry.kind === valueKind,
            onClick: () => setValueKind(entry.kind),
          }))}
        />
        <ReqoreButton
          size={ctx.size}
          icon='CheckLine'
          intent='success'
          flat
          minimal
          onClick={submit}
          label='Add'
          className='reqore-data-view-add-commit'
        />
        <ReqoreButton
          size={ctx.size}
          icon='CloseLine'
          flat
          minimal
          onClick={reset}
          tooltip='Cancel'
          className='reqore-data-view-add-cancel'
        />
      </AddRowShell>
    );
  }
);
AddEntryAffordance.displayName = 'ReqoreDataView.AddEntryAffordance';

const isInlineableScalarValue = (
  value: unknown,
  ctx: TRenderContext
): boolean => {
  const unwrapped = ctx.envelope === false ? value : reqoreUnwrapEnvelope(value, ctx.envelope);
  if (typeof unwrapped === 'string' && ctx.parseEmbedded && ctx.parseEmbedded(unwrapped)) {
    return false;
  }
  return !Array.isArray(unwrapped) && !reqoreIsRecord(unwrapped);
};

const renderScalar = (
  value: unknown,
  type: string | undefined,
  ctx: TRenderContext,
  path: string[]
): ReactNode => {
  const scalar = reqoreFormatScalar(value, type, ctx.scalarOptions);
  const kind = type ? reqoreDataValueKind(value, type) : scalar.kind;
  const intent = reqoreDataValueIntent(kind);
  const displayType = type ?? kind;

  // Editable mode: render the click-to-edit cell instead of the
  // static chip. Date-typed scalars stay read-only until the date
  // picker lands.
  if (ctx.editable && kind !== 'date' && kind !== 'object' && kind !== 'array') {
    const cell = (
      <EditableScalarCell
        value={value}
        kind={kind}
        type={type}
        ctx={ctx}
        path={path}
      />
    );
    if (!ctx.showTypes || !displayType) return cell;
    return (
      <ScalarRow gapSize='tiny' verticalAlign='center' size={ctx.size}>
        {cell}
        <ReqoreTag
          size={ctx.size}
          flat
          minimal
          label={displayType}
          effect={{ uppercase: true, spaced: 1, opacity: 0.6 }}
          className='reqore-data-view-type'
        />
      </ScalarRow>
    );
  }

  const multiline =
    kind === 'string' && /[\r\n]/.test(scalar.display);

  if (multiline) {
    // `white-space: pre-wrap` reliably forces a line break on \n in every
    // browser, but a *lone* \r (the actual HL7 v2 segment separator, and
    // old-Mac-style line endings generally) is not guaranteed to — Chromium
    // renders it as a zero-width no-op, silently fusing the two segments
    // together (`...P|2.5` + \r + `OBR|1...` becomes the unreadable
    // `2.5OBR`). Normalize every line-ending style to \n before display so
    // the break is spec-guaranteed regardless of the source payload's
    // original convention.
    const displayText = scalar.display.replace(/\r\n?/g, '\n');
    const block = (
      <MultilineValue
        $size={ctx.size}
        $theme={ctx.theme}
        $interactive={Boolean(ctx.onItemClick)}
        className='reqore-data-view-value reqore-data-view-multiline-value'
        role={ctx.onItemClick ? 'button' : undefined}
        tabIndex={ctx.onItemClick ? 0 : undefined}
        onClick={
          ctx.onItemClick
            ? () => ctx.onItemClick!(value, path)
            : undefined
        }
        onKeyDown={
          ctx.onItemClick
            ? (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                ctx.onItemClick!(value, path);
              }
            : undefined
        }
      >
        {displayText}
      </MultilineValue>
    );

    if (!ctx.showTypes || !displayType) return block;

    return (
      <ScalarRow gapSize='tiny' verticalAlign='top' size={ctx.size} fluid>
        {block}
        <ReqoreTag
          size={ctx.size}
          flat
          minimal
          label={displayType}
          effect={{ uppercase: true, spaced: 1, opacity: 0.6 }}
          className='reqore-data-view-type'
        />
      </ScalarRow>
    );
  }

  // Value chip: minimal + intent-tinted (so the type is colour-coded
  // without shouting), weight bold. We always render with a border
  // (flat={false}) — the panel's own `flat` prop affects the outer
  // panel chrome, but the inner chips read more cleanly as values
  // when they have a visible outline regardless. Consumers who want
  // borderless chips can override via a wrapper or via reqore's
  // built-in `effect` slot.
  const tag = (
    <ReqoreTag
      size={ctx.size}
      flat={false}
      minimal
      // `wrap` is critical for the value chip — without it, a long
      // string scalar (an HL7 payload, a stack trace, a UUID-heavy
      // identifier) renders as a single non-wrapping pill that
      // overflows its column horizontally. With `wrap`, ReqoreTag
      // lets the label flow onto multiple lines inside the chip.
      wrap
      label={scalar.display}
      intent={intent}
      effect={{
        weight: 'bold',
      }}
      onClick={
        ctx.onItemClick
          ? () => ctx.onItemClick!(value, path)
          : undefined
      }
      className='reqore-data-view-value'
    />
  );

  if (!ctx.showTypes || !displayType) return tag;

  return (
    <ScalarRow gapSize='tiny' verticalAlign='center' size={ctx.size}>
      {tag}
      <ReqoreTag
        size={ctx.size}
        flat
        minimal
        label={displayType}
        effect={{ uppercase: true, spaced: 1, opacity: 0.6 }}
        className='reqore-data-view-type'
      />
    </ScalarRow>
  );
};

/** Width (in CSS px) below which a `RecordTable` switches its rows
 *  from a two-column grid (key | value) to a single column (key on
 *  top, value beneath). Tuned to the point where the 120px-min key
 *  column + gap + the value column starts squeezing the value into a
 *  useless sliver. */
const STACK_BELOW_PX = 360;

interface IRecordTableProps {
  entries: Array<[string, unknown]>;
  ctx: TRenderContext;
  theme: IReqoreTheme;
  depth: number;
  path: string[];
}

/**
 * Record renderer that observes its own width and switches the row
 * layout to vertical (key above value) when narrower than
 * `STACK_BELOW_PX`. The observer hooks the actual rendered
 * `TableShell` so the layout responds to *the parent panel's* width,
 * not the viewport — works inside narrow drawers on a wide monitor.
 *
 * Lives outside `renderTree` because `renderTree` is a pure function;
 * this component is where the `useState` + `ResizeObserver` lifecycle
 * live.
 */
const RecordTable = memo(
  ({ entries, ctx, theme, depth, path }: IRecordTableProps) => {
    const shellRef = useRef<HTMLDivElement | null>(null);
    const [stacked, setStacked] = useState(false);

    useLayoutEffect(() => {
      const node = shellRef.current;
      if (!node || typeof ResizeObserver === 'undefined') return undefined;
      const observer = new ResizeObserver((events) => {
        const entry = events[0];
        if (!entry) return;
        const width = entry.contentRect?.width ?? node.clientWidth;
        setStacked(width > 0 && width < STACK_BELOW_PX);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }, []);

    const siblingKeys = entries.map(([k]) => k);

    return (
      <TableShell
        ref={shellRef}
        $size={ctx.size}
        $theme={theme}
        $nested={depth > 0}
        className='reqore-data-view-record'
      >
        {entries.map(([key, item], index) => {
          const complex =
            reqoreIsRecord(
              ctx.envelope === false ? item : reqoreUnwrapEnvelope(item, ctx.envelope)
            ) ||
            (Array.isArray(
              ctx.envelope === false ? item : reqoreUnwrapEnvelope(item, ctx.envelope)
            ) &&
              !(
                ctx.inlineScalarArrays &&
                (ctx.envelope === false
                  ? (item as unknown[])
                  : (reqoreUnwrapEnvelope(item, ctx.envelope) as unknown[])
                ).every((entry) => isInlineableScalarValue(entry, ctx))
              ));
          const rowPath = [...path, key];
          return (
            <Row
              key={`${path.join('.')}-${key}`}
              $size={ctx.size}
              $theme={theme}
              $complex={complex}
              $odd={index % 2 === 0}
              $stacked={stacked}
              $editable={ctx.editable}
              className='reqore-data-view-row'
            >
              {ctx.editable ? (
                <EditableKeyCell
                  keyName={key}
                  siblingKeys={siblingKeys}
                  parentPath={path}
                  ctx={ctx}
                />
              ) : (
                <ReqoreTag
                  size={ctx.size}
                  flat={false}
                  minimal
                  wrap
                  intent={ctx.keyIntent === null ? undefined : ctx.keyIntent ?? 'info'}
                  color={ctx.keyColor}
                  label={key}
                  effect={{ weight: 'bold' }}
                  className='reqore-data-view-key'
                />
              )}
              <ValueCell
                $size={ctx.size}
                $theme={theme}
                $complex={complex}
                className='reqore-data-view-value-cell'
              >
                {renderTree(item, ctx, theme, depth + 1, rowPath)}
              </ValueCell>
              {ctx.editable ? (
                <RowActions
                  ctx={ctx}
                  path={rowPath}
                  ariaLabel={`Remove ${key}`}
                />
              ) : null}
            </Row>
          );
        })}
        {ctx.editable ? (
          <AddEntryAffordance
            ctx={ctx}
            parentPath={path}
            context={{ kind: 'record', existingKeys: siblingKeys }}
          />
        ) : null}
      </TableShell>
    );
  }
);
RecordTable.displayName = 'ReqoreDataView.RecordTable';

const renderTree = (
  value: unknown,
  ctx: TRenderContext,
  theme: IReqoreTheme,
  depth: number,
  path: string[]
): ReactNode => {
  const envelopeType = ctx.envelope === false ? undefined : reqoreEnvelopeType(value, ctx.envelope);
  const unwrapped = ctx.envelope === false ? value : reqoreUnwrapEnvelope(value, ctx.envelope);

  // Embedded string parsing (e.g. JSON inside a string).
  if (typeof unwrapped === 'string' && ctx.parseEmbedded) {
    const parsed = ctx.parseEmbedded(unwrapped);
    if (parsed) {
      return (
        <Tree $size={ctx.size} $theme={theme}>
          {parsed.prefix ? (
            <ReqoreP size={ctx.size} effect={{ opacity: 0.72 }}>
              {parsed.prefix}
            </ReqoreP>
          ) : null}
          {renderTree(parsed.data, ctx, theme, depth + 1, [...path, '<parsed>'])}
        </Tree>
      );
    }
  }

  // Arrays.
  if (Array.isArray(unwrapped)) {
    // In editable mode, render every array item as its own row so the
    // hover-revealed delete + `+ Add item` affordance has a place to
    // live. The inline chip-row variant is for read-only density.
    const allInlineable =
      !ctx.editable &&
      ctx.inlineScalarArrays &&
      unwrapped.every((item) => isInlineableScalarValue(item, ctx));

    if (allInlineable) {
      return (
        <ScalarRow size={ctx.size} gapSize='small' verticalAlign='center'>
          {envelopeType ? (
            <ReqoreTag
              size={ctx.size}
              minimal
              flat={false}
              label={envelopeType}
              effect={{ uppercase: true, spaced: 1, opacity: 0.6 }}
              className='reqore-data-view-type'
            />
          ) : null}
          {unwrapped.map((item, index) => (
            <span key={`${path.join('.')}-${index}`}>
              {renderScalar(
                ctx.envelope === false ? item : reqoreUnwrapEnvelope(item, ctx.envelope),
                ctx.envelope === false ? undefined : reqoreEnvelopeType(item, ctx.envelope),
                ctx,
                [...path, String(index)]
              )}
            </span>
          ))}
        </ScalarRow>
      );
    }

    const content = (
      <ArrayStack $size={ctx.size} $theme={theme} className='reqore-data-view-array'>
        {unwrapped.map((item, index) => {
          const itemPath = [...path, String(index)];
          return (
            <ArrayItem
              key={`${path.join('.')}-${index}`}
              $size={ctx.size}
              $theme={theme}
              className='reqore-data-view-array-item reqore-data-view-row'
            >
              <ArrayItemContent>
                {unwrapped.length > 1 ? (
                  <ArrayItemIndex $size={ctx.size} $theme={theme}>
                    {index + 1}
                  </ArrayItemIndex>
                ) : null}
                {renderTree(item, ctx, theme, depth + 1, itemPath)}
              </ArrayItemContent>
              {ctx.editable ? (
                <RowActions
                  ctx={ctx}
                  path={itemPath}
                  ariaLabel={`Remove item ${index + 1}`}
                />
              ) : null}
            </ArrayItem>
          );
        })}
        {ctx.editable ? (
          <AddEntryAffordance
            ctx={ctx}
            parentPath={path}
            context={{ kind: 'array', length: unwrapped.length }}
          />
        ) : null}
      </ArrayStack>
    );

    if (depth === 0) return content;

    return (
      <PreservedDetails
        initialOpen={depth < ctx.defaultExpandDepth}
        label={SECTION_LABEL('List', unwrapped.length)}
        path={path}
        size={ctx.size}
        theme={theme}
        onToggle={ctx.onSectionToggle}
      >
        {content}
      </PreservedDetails>
    );
  }

  // Records.
  if (reqoreIsRecord(unwrapped)) {
    const entries = Object.entries(unwrapped);
    const content = (
      <RecordTable
        entries={entries}
        ctx={ctx}
        theme={theme}
        depth={depth}
        path={path}
      />
    );

    if (depth === 0) return content;

    return (
      <PreservedDetails
        initialOpen={depth < ctx.defaultExpandDepth}
        label={SECTION_LABEL('Object', entries.length)}
        path={path}
        size={ctx.size}
        theme={theme}
        onToggle={ctx.onSectionToggle}
      >
        {content}
      </PreservedDetails>
    );
  }

  return renderScalar(unwrapped, envelopeType, ctx, path);
};

export const ReqoreDataView = memo(
  forwardRef<HTMLDivElement, IReqoreDataViewProps>(
    (
      {
        data,
        emptyText = 'No data.',
        collapsibleRoot = true,
        defaultExpandDepth = 2,
        showTypes = false,
        inlineScalarArrays = true,
        envelope = DEFAULT_ENVELOPE,
        parseEmbedded,
        parseDate,
        formatDate,
        onItemClick,
        onSectionToggle,
        keyColor,
        keyIntent,
        editable = false,
        onDataChange,
        onValueChange,
        onRemoveProperty,
        onRenameProperty,
        onAddProperty,
        onChangeType,
        size = 'normal',
        customTheme,
        inheritCustomTheme,
        intent,
        flat,
        ...panelProps
      },
      ref
    ) => {
      const theme = useReqoreTheme(
        'main',
        customTheme,
        intent,
        undefined,
        inheritCustomTheme
      );

      // In editable mode an empty `{}` or `[]` must still render the
      // tree so the `+ Add property` / `+ Add item` affordance is
      // reachable — otherwise a from-scratch build is impossible.
      // Only fall back to the empty callout when read-only AND the
      // value is genuinely empty.
      const empty =
        !editable &&
        !reqoreHasStructuredValue(
          data,
          envelope === false ? undefined : envelope
        );

      const dataRef = useRef(data);
      useLayoutEffect(() => {
        dataRef.current = data;
      }, [data]);

      const commitScalar = useCallback(
        (path: string[], value: unknown) => {
          onValueChange?.(path, value);
          if (!onDataChange) return;
          const next = reqoreSetAtPath(dataRef.current, path, value);
          onDataChange(next);
        },
        [onDataChange, onValueChange]
      );

      const commitDelete = useCallback(
        (path: string[]) => {
          onRemoveProperty?.(path);
          if (!onDataChange) return;
          const next = reqoreDeleteAtPath(dataRef.current, path);
          onDataChange(next);
        },
        [onDataChange, onRemoveProperty]
      );

      const commitRename = useCallback(
        (parentPath: string[], oldKey: string, newKey: string) => {
          onRenameProperty?.(parentPath, oldKey, newKey);
          if (!onDataChange) return;
          const next = reqoreRenameKeyAtPath(
            dataRef.current,
            parentPath,
            oldKey,
            newKey
          );
          onDataChange(next);
        },
        [onDataChange, onRenameProperty]
      );

      const commitAdd = useCallback(
        (
          parentPath: string[],
          keyOrIndex: string | number,
          initialValue: unknown
        ) => {
          onAddProperty?.(parentPath, keyOrIndex, initialValue);
          if (!onDataChange) return;
          const next = reqoreSetAtPath(
            dataRef.current,
            [...parentPath, String(keyOrIndex)],
            initialValue
          );
          onDataChange(next);
        },
        [onAddProperty, onDataChange]
      );

      const commitTypeChange = useCallback(
        (path: string[], kind: TReqoreDataValueKind) => {
          onChangeType?.(path, kind);
          if (!onDataChange) return;
          // Read the current value at path, coerce it to the target
          // kind, and re-emit the tree. The lookup walks the same
          // path the set will use, so a missing path is a no-op.
          let current: unknown = dataRef.current;
          for (const segment of path) {
            if (current == null) return;
            if (Array.isArray(current)) {
              const index = Number.parseInt(segment, 10);
              current = Number.isNaN(index) ? undefined : current[index];
            } else if (reqoreIsRecord(current)) {
              current = current[segment];
            } else {
              return;
            }
          }
          const next = reqoreSetAtPath(
            dataRef.current,
            path,
            reqoreCoerceValueToKind(current, kind)
          );
          onDataChange(next);
        },
        [onChangeType, onDataChange]
      );

      const ctx: TRenderContext = {
        theme,
        envelope,
        parseEmbedded,
        showTypes,
        inlineScalarArrays,
        defaultExpandDepth,
        size,
        scalarOptions: { parseDate, formatDate },
        onItemClick,
        onSectionToggle,
        keyColor,
        keyIntent,
        editable,
        commitScalar: editable ? commitScalar : undefined,
        commitDelete: editable ? commitDelete : undefined,
        commitRename: editable ? commitRename : undefined,
        commitAdd: editable ? commitAdd : undefined,
        commitTypeChange: editable ? commitTypeChange : undefined,
      };

      const body = empty ? (
        <ReqoreP size={size} effect={{ opacity: 0.65 }}>
          {emptyText}
        </ReqoreP>
      ) : collapsibleRoot ? (
        <PreservedDetails
          initialOpen={true}
          label={
            Array.isArray(data)
              ? SECTION_LABEL('List', (data as unknown[]).length)
              : reqoreIsRecord(data)
              ? SECTION_LABEL('Object', Object.keys(data).length)
              : 'Value'
          }
          path={[]}
          size={size}
          theme={theme}
          onToggle={onSectionToggle}
        >
          <Tree $size={size} $theme={theme} className='reqore-data-view-root'>
            {renderTree(data, ctx, theme, 0, [])}
          </Tree>
        </PreservedDetails>
      ) : (
        <Tree $size={size} $theme={theme} className='reqore-data-view-root'>
          {renderTree(data, ctx, theme, 0, [])}
        </Tree>
      );

      return (
        <ReqorePanel
          {...panelProps}
          ref={ref}
          size={size}
          customTheme={customTheme}
          inheritCustomTheme={inheritCustomTheme}
          intent={intent}
          flat={flat}
          className={`reqore-data-view ${panelProps.className ?? ''}`.trim()}
        >
          {body}
        </ReqorePanel>
      );
    }
  )
);

(ReqoreDataView as { displayName?: string }).displayName = 'ReqoreDataView';

export type { IReqoreDataViewEmbedded, IReqoreDataViewEnvelope } from './helpers';
export {
  DEFAULT_ENVELOPE,
  reqoreCoerceValueToKind,
  reqoreDataValueIntent,
  reqoreDataValueKind,
  reqoreDeleteAtPath,
  reqoreEnvelopeType,
  reqoreFormatScalar,
  reqoreHasStructuredValue,
  reqoreIsEnvelope,
  reqoreIsRecord,
  reqoreRenameKeyAtPath,
  reqoreSetAtPath,
  reqoreUnwrapEnvelope,
} from './helpers';
