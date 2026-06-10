import { rgba } from 'polished';
import { forwardRef, memo, ReactNode, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor } from '../../helpers/colors';
import { getOneHigherSize, getOneLessSize } from '../../helpers/utils';
import { IReqoreIconName } from '../../types/icons';
import ReqoreIcon from '../Icon';
import { IReqorePanelProps, ReqorePanel } from '../Panel';
import { ReqoreP } from '../Paragraph';

/**
 * Default leading-icon for a row carrying an `intent`. A single
 * filled circle is rendered for every intent — only the icon's
 * colour shifts (driven by `<ReqoreIcon intent={row.intent} />`).
 * Callers can swap the glyph per-row via `intentIcon`.
 */
export const DESCRIPTION_LIST_DEFAULT_INTENT_ICON: IReqoreIconName = 'CircleFill';

export interface IReqoreDescriptionListRow {
  /** Stable React key + the row's logical identity. */
  key: string | number;
  /**
   * Left-column label. Optional — when omitted the `content` spans
   * the full row width (useful for a free-form note row interleaved
   * between labelled rows).
   */
  label?: ReactNode;
  /** Right-column content. Anything renderable. */
  content: ReactNode;
  /**
   * Optional row intent — renders a filled circle icon
   * (`CheckboxCircleFill` by default) to the left of the label,
   * tinted with the intent colour. Every row reserves the icon
   * gutter width so rows with and without an intent stay
   * flush-aligned.
   *
   * `intent` only drives the leading icon; it does NOT tint the
   * label or content text. Use `labelIntent` / `contentIntent` for
   * that.
   */
  intent?: TReqoreIntent;
  /** Swap the leading intent icon's glyph. Ignored when `intent` is unset. */
  intentIcon?: IReqoreIconName;
  /** Tints the label text with the given intent colour. Independent of `intent`. */
  labelIntent?: TReqoreIntent;
  /** Tints the content text with the given intent colour. Independent of `intent`. */
  contentIntent?: TReqoreIntent;
  /**
   * When `true`, the label column reads as a `<dt>` eyebrow
   * (uppercase + tracked + bold + dimmed). Defaults to the
   * component-level `uppercaseLabels`. Lets a single row opt out of
   * the dense default look.
   */
  uppercaseLabel?: boolean;
}

export interface IReqoreDescriptionListProps extends Omit<IReqorePanelProps, 'children'> {
  /** Rows to render top-to-bottom. */
  items: IReqoreDescriptionListRow[];
  /**
   * Width of the label column. Accepts any CSS length. Pass `'auto'`
   * to let the label column size to its widest label. Defaults to
   * `160px`.
   */
  labelWidth?: string;
  /**
   * When `true` (default), row labels render uppercase + tracked +
   * bold so they read as eyebrow labels (the dense default look).
   * When `false`, labels render as plain text (more book-like).
   * Per-row `uppercaseLabel` overrides this.
   */
  uppercaseLabels?: boolean;
  /**
   * Row separator opacity (0 - 1). Defaults to `0.06`. Set to `0`
   * to hide the hairline between rows entirely.
   */
  separatorOpacity?: number;
  /**
   * Display size — flows through to `ReqoreP` on both columns and
   * to the wrapping `ReqorePanel`. Defaults to `'normal'`.
   */
  size?: TSizes;
}

interface IStyledRowProps {
  theme: IReqoreTheme;
  $separatorOpacity: number;
  $isLast: boolean;
}

interface IStyledLabelProps {
  $width: string;
  $uppercase: boolean;
}

interface IStyledIconSlotProps {
  $visible: boolean;
}

const StyledList = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
`;

const StyledRow = styled.div<IStyledRowProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;

  ${({ $isLast, $separatorOpacity, theme }) =>
    !$isLast &&
    $separatorOpacity > 0 &&
    css`
      border-bottom: 1px solid
        ${rgba(changeLightness(getMainBackgroundColor(theme), 0.16), $separatorOpacity)};
    `}
`;

/**
 * Fixed-width slot for the leading intent icon. Reserves space even
 * when a row has no intent so rows with and without an intent icon
 * stay flush-aligned across the list.
 */
const StyledIconSlot = styled.div<IStyledIconSlotProps>`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
`;

const StyledLabel = styled.div<IStyledLabelProps>`
  flex: 0 0 ${({ $width }) => $width};
  width: ${({ $width }) => $width};
  min-width: 0;
  display: flex;
  align-items: center;

  & > * {
    ${({ $uppercase }) =>
      $uppercase &&
      css`
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 600;
        opacity: 0.55;
      `}
  }
`;

const StyledContent = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-variant-numeric: tabular-nums;
`;

/**
 * Read-only description list — a `<dl>`-style key/value layout
 * rendered inside a `ReqorePanel`. Distinct from `ReqoreKeyValueTable`:
 *
 * | Use this | When |
 * |---|---|
 * | `ReqoreDescriptionList` | A handful of labelled values the operator reads top-to-bottom (drawer lifecycle, panel metadata strip, document properties). No need for sort / filter / paging. |
 * | `ReqoreKeyValueTable` | A dataset the operator searches, sorts, exports, or paginates. Full table behaviour. |
 *
 * Per-row `intent` renders a filled circle to the left of the
 * label, tinted with the intent colour. If any row in the list has
 * an intent, every row reserves the icon gutter so the label column
 * stays flush-aligned. The label / content text colour is
 * independent — use `labelIntent` / `contentIntent` to tint either
 * side.
 *
 * Because the component wraps `ReqorePanel`, every panel knob is
 * available via the spread props — `label`, `icon`, `badge`,
 * `flat`, `raised`, `minimal`, `rounded`, `transparent`, `size`,
 * `customTheme`, `contentEffect`, `intent`, etc. Pass
 * `transparent flat` (or `minimal flat`) when nesting inside an
 * already-padded surface so the panel chrome drops out and the
 * list rows align with the surrounding content.
 *
 * Sample:
 *
 * ```tsx
 * <ReqoreDescriptionList
 *   label='Lifecycle'
 *   icon='TimeLine'
 *   flat
 *   raised
 *   items={[
 *     { key: 'created', label: 'Created', content: '5/16/2026, 11:00 PM · 1 day ago' },
 *     { key: 'started', label: 'Started', content: '5/16/2026, 11:00 PM · 1 day ago' },
 *     { key: 'completed', label: 'Completed', content: '5/17/2026, 12:00 AM · 1 day ago' },
 *     { key: 'duration', label: 'Duration', intent: 'success', content: '1h' },
 *   ]}
 * />
 * ```
 */
export const ReqoreDescriptionList = memo(
  forwardRef<HTMLDivElement, IReqoreDescriptionListProps>(
    (
      {
        items,
        labelWidth = '160px',
        uppercaseLabels = true,
        separatorOpacity = 0.06,
        size = 'normal',
        padded,
        className,
        ...panelRest
      },
      ref
    ) => {
      // Default the panel's padding one size up from the list's text
      // size — gives the rows visible breathing room from the panel
      // edge without callers having to size it manually. The caller
      // can still override with any `boolean | TSizes` value.
      const resolvedPadded = padded ?? getOneHigherSize(size);
      // If any row carries an intent, every row reserves the icon
      // gutter so the label column stays vertically aligned across
      // rows with and without an intent.
      const anyRowHasIntent = useMemo(() => items.some((row) => Boolean(row.intent)), [items]);
      return (
        <ReqorePanel
          {...panelRest}
          size={size}
          padded={resolvedPadded}
          ref={ref}
          className={`${className || ''} reqore-description-list`}
        >
          <StyledList className='reqore-description-list-body'>
            {items.map((row, index) => {
              const isLast = index === items.length - 1;
              const labelUppercase = row.uppercaseLabel ?? uppercaseLabels;
              const iconName = row.intent
                ? row.intentIcon ?? DESCRIPTION_LIST_DEFAULT_INTENT_ICON
                : undefined;
              return (
                <StyledRow
                  key={row.key}
                  $separatorOpacity={separatorOpacity}
                  $isLast={isLast}
                  className='reqore-description-list-row'
                  data-key={row.key}
                >
                  {row.label !== undefined ? (
                    <StyledLabel
                      $width={labelWidth}
                      $uppercase={labelUppercase}
                      className='reqore-description-list-label'
                    >
                      {anyRowHasIntent ? (
                        <StyledIconSlot
                          $visible={Boolean(iconName)}
                          className='reqore-description-list-intent-icon'
                          aria-hidden={!iconName}
                        >
                          {iconName ? (
                            <ReqoreIcon
                              icon={iconName}
                              intent={row.intent}
                              size={getOneLessSize(getOneLessSize(size))}
                              margin='right'
                            />
                          ) : null}
                        </StyledIconSlot>
                      ) : null}
                      <ReqoreP size={size} intent={row.labelIntent}>
                        {row.label}
                      </ReqoreP>
                    </StyledLabel>
                  ) : null}
                  <StyledContent className='reqore-description-list-content'>
                    {typeof row.content === 'string' || typeof row.content === 'number' ? (
                      <ReqoreP size={size} intent={row.contentIntent}>
                        {row.content}
                      </ReqoreP>
                    ) : (
                      row.content
                    )}
                  </StyledContent>
                </StyledRow>
              );
            })}
          </StyledList>
        </ReqorePanel>
      );
    }
  )
);
