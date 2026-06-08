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
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { TReqoreEffectColor } from '../Effect';
import { getReadableColor } from '../../helpers/colors';
import { useReqoreTheme } from '../../hooks/useTheme';
import ReqoreControlGroup from '../ControlGroup';
import { ReqoreP } from '../Paragraph';
import { ReqorePanel, IReqorePanelProps } from '../Panel';
import ReqoreTag from '../Tag';
import {
  DEFAULT_ENVELOPE,
  IReqoreDataViewEmbedded,
  IReqoreDataViewEnvelope,
  IReqoreDataViewScalarOptions,
  reqoreDataValueIntent,
  reqoreDataValueKind,
  reqoreEnvelopeType,
  reqoreFormatScalar,
  reqoreHasStructuredValue,
  reqoreIsRecord,
  reqoreUnwrapEnvelope,
} from './helpers';

export interface IReqoreDataViewProps
  extends Omit<IReqorePanelProps, 'children'>,
    IReqoreDataViewScalarOptions {
  /** The structured value to render. */
  data: unknown;

  /** Empty-state copy when `data` carries no meaningful content. */
  emptyText?: string;

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
}

const SECTION_LABEL = (kind: 'Object' | 'List', count: number): string => {
  const word = kind === 'Object' ? 'field' : 'item';
  return `${kind} · ${count} ${word}${count === 1 ? '' : 's'}`;
};

type TRenderContext = {
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
};

interface IStyledThemeProps {
  $theme: IReqoreTheme;
  $size: TSizes;
}

// Shared monospace stack — picks the system mono on every platform.
const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace";

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
     dial it back. */
  .reqore-data-view-key .reqore-tag-content,
  .reqore-data-view-value .reqore-tag-content,
  .reqore-data-view-type .reqore-tag-content {
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
  IStyledThemeProps & { $complex?: boolean; $odd?: boolean; $stacked?: boolean }
>`
  display: grid;
  grid-template-columns: ${({ $complex, $stacked }) =>
    $complex || $stacked
      ? 'minmax(0, 1fr)'
      : 'minmax(120px, min(34%, 220px)) minmax(0, 1fr)'};
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

  /* When the row collapses to a single column (either because the
     value is a record/array, or because the container ResizeObserver
     flipped \`$stacked\` on), the grid's default \`justify-items: stretch\`
     would expand the key chip to the full row width. Pin it back to
     start + content-width so the chip stays compact and the value
     drops into the next grid row below it. */
  ${({ $complex, $stacked }) =>
    ($complex || $stacked) &&
    css`
      & > .reqore-data-view-key {
        justify-self: start;
        width: fit-content;
        max-width: 100%;
      }
    `}
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
  /* More left padding than the other three sides so the item index
     and contents read as visually inset under the parent — mirrors
     the IDE pattern of "nested = inset". */
  padding: ${({ $size }) => PADDING_FROM_SIZE[$size]}px
    ${({ $size }) => PADDING_FROM_SIZE[$size]}px
    ${({ $size }) => PADDING_FROM_SIZE[$size]}px
    ${({ $size }) => PADDING_FROM_SIZE[$size] + 6}px;
  /* Same depth model as nested TableShell — darker overlay, neutral
     hairline border on three sides + a slightly more visible accent
     on the left edge to read as a nested chunk. */
  border: 1px solid ${({ $theme }) => rgba(getReadableColor($theme), 0.08)};
  border-left: 2px solid ${({ $theme }) => rgba(getReadableColor($theme), 0.18)};
  border-radius: ${({ $size }) => RADIUS_FROM_SIZE[$size]}px;
  /* Same depth as a nested TableShell (0.45) — an array item *is* a
     nested chunk. */
  background: rgba(0, 0, 0, 0.45);
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
          return (
            <Row
              key={`${path.join('.')}-${key}`}
              $size={ctx.size}
              $theme={theme}
              $complex={complex}
              $odd={index % 2 === 0}
              $stacked={stacked}
              className='reqore-data-view-row'
            >
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
              <ValueCell
                $size={ctx.size}
                $theme={theme}
                $complex={complex}
                className='reqore-data-view-value-cell'
              >
                {renderTree(item, ctx, theme, depth + 1, [...path, key])}
              </ValueCell>
            </Row>
          );
        })}
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
    const allInlineable =
      ctx.inlineScalarArrays && unwrapped.every((item) => isInlineableScalarValue(item, ctx));

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
        {unwrapped.map((item, index) => (
          <ArrayItem
            key={`${path.join('.')}-${index}`}
            $size={ctx.size}
            $theme={theme}
            className='reqore-data-view-array-item'
          >
            {unwrapped.length > 1 ? (
              <ArrayItemIndex $size={ctx.size} $theme={theme}>
                {index + 1}
              </ArrayItemIndex>
            ) : null}
            {renderTree(item, ctx, theme, depth + 1, [...path, String(index)])}
          </ArrayItem>
        ))}
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

      const empty = !reqoreHasStructuredValue(
        data,
        envelope === false ? undefined : envelope
      );

      const ctx: TRenderContext = {
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
  reqoreDataValueIntent,
  reqoreDataValueKind,
  reqoreEnvelopeType,
  reqoreFormatScalar,
  reqoreHasStructuredValue,
  reqoreIsEnvelope,
  reqoreIsRecord,
  reqoreUnwrapEnvelope,
} from './helpers';
