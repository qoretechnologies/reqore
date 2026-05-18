import { rgba } from 'polished';
import { forwardRef, memo, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { TSizes } from '../../constants/sizes';
import { IReqoreTheme, TReqoreIntent } from '../../constants/theme';
import { changeLightness, getMainBackgroundColor } from '../../helpers/colors';
import { getOneHigherSize } from '../../helpers/utils';
import { ReqoreP } from '../Paragraph';
import { IReqorePanelProps, ReqorePanel } from '../Panel';

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
   * Optional intent — paints the row's left gutter with a 3px strip
   * tinted by the intent. Every row reserves the gutter width so
   * intent and non-intent rows stay flush-aligned; the strip is only
   * painted when an intent is set.
   */
  intent?: TReqoreIntent;
  /**
   * When `true`, the label column reads as a `<dt>` eyebrow
   * (uppercase + tracked + bold + dimmed). Defaults to the
   * component-level `uppercaseLabels`. Lets a single row opt out of
   * the dense default look.
   */
  uppercaseLabel?: boolean;
}

export interface IReqoreDescriptionListProps
  extends Omit<IReqorePanelProps, 'children'> {
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
  $intent?: TReqoreIntent;
  $separatorOpacity: number;
  $isLast: boolean;
}

interface IStyledLabelProps {
  $width: string;
  $uppercase: boolean;
}

const StyledList = styled.div`
  display: flex;
  flex-flow: column;
  width: 100%;
`;

const stripColorFor = (
  theme: IReqoreTheme,
  intent?: TReqoreIntent
): string =>
  intent ? theme.intents[intent] : 'transparent';

/** Outset distance for the intent strip. The strip is absolutely
 *  positioned just to the left of the row's content edge — when the
 *  parent `ReqorePanel` is padded, the strip lives inside that
 *  padding. When the panel is `padded={false}` the strip sits
 *  flush against the panel edge. Either way the row content stays
 *  flush-left so labels don't read as indented. */
const STRIP_OUTSET = 8;

const StyledRow = styled.div<IStyledRowProps>`
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 10px 0;

  ${({ $isLast, $separatorOpacity, theme }) =>
    !$isLast &&
    $separatorOpacity > 0 &&
    css`
      border-bottom: 1px solid
        ${rgba(
          changeLightness(getMainBackgroundColor(theme), 0.16),
          $separatorOpacity
        )};
    `}

  &::before {
    content: '';
    position: absolute;
    left: -${STRIP_OUTSET}px;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 2px;
    background: ${({ $intent, theme }) => stripColorFor(theme, $intent)};
  }
`;

const StyledLabel = styled.div<IStyledLabelProps>`
  flex: 0 0 ${({ $width }) => $width};
  width: ${({ $width }) => $width};
  min-width: 0;
  display: flex;
  align-items: baseline;

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
  align-items: baseline;
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
 * Every row reserves a left intent-strip gutter so labelled and
 * un-labelled rows stay vertically aligned; the strip lights up
 * when a row carries an `intent`.
 *
 * Because the component wraps `ReqorePanel`, every panel knob is
 * available via the spread props — `label`, `icon`, `badge`,
 * `flat`, `raised`, `minimal`, `rounded`, `transparent`, `size`,
 * `customTheme`, `effect`, `contentEffect`, `intent`, etc. Pass
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
              const labelUppercase =
                row.uppercaseLabel ?? uppercaseLabels;
              return (
                <StyledRow
                  key={row.key}
                  $intent={row.intent}
                  $separatorOpacity={separatorOpacity}
                  $isLast={isLast}
                  className='reqore-description-list-row reqore-description-list-row-strip'
                  data-key={row.key}
                >
                  {row.label !== undefined ? (
                    <StyledLabel
                      $width={labelWidth}
                      $uppercase={labelUppercase}
                      className='reqore-description-list-label'
                    >
                      <ReqoreP size={size}>{row.label}</ReqoreP>
                    </StyledLabel>
                  ) : null}
                  <StyledContent className='reqore-description-list-content'>
                    {typeof row.content === 'string' ||
                    typeof row.content === 'number' ? (
                      <ReqoreP size={size}>{row.content}</ReqoreP>
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
