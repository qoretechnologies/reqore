// Copyright 2026 Qore Technologies, s.r.o.
import { ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';
import { ReqoreP } from '../../components/Paragraph';
import { NARROW_CONTAINER_BREAKPOINT_PX } from '../../hooks/useNarrowContainer';

export interface IStoryRowBoxProps {
  /** What the box is, written above it: its width and what that width shows. */
  caption: string;
  /** The box's width; it never grows past the page (`max-width: 100%`). */
  width: number | string;
  /** The class a play finds the box by. */
  className?: string;
  children: ReactNode;
}

/**
 * The container a row sits in, drawn: a dashed frame with its width written above it.
 *
 * A row takes the width of the box it is put in, and a story that shows a row wide and narrow puts it in two
 * boxes of different widths. Undrawn, those boxes left two rows of different widths one above the other, which
 * read as a row sizing itself wrongly (David's review of the narrow-row stories, qorus#646). Drawn and named,
 * the difference reads as what the story is about.
 */
/** The caption's effect: one object for every render, so the memoised paragraph is not drawn again for it. */
const CAPTION_EFFECT = { opacity: 0.6 } as const;

export const StoryRowBox = ({ caption, width, className, children }: IStoryRowBoxProps) => (
  <div className={`story-row-box ${className || ''}`.trim()} style={{ width, maxWidth: '100%' }}>
    <ReqoreP size='small' effect={CAPTION_EFFECT} className='story-row-box-caption'>
      {caption}
    </ReqoreP>
    <div
      className='story-row-box-frame'
      style={{ marginTop: 6, outline: '1px dashed rgba(127, 127, 127, 0.5)', outlineOffset: 3 }}
    >
      {children}
    </div>
  </div>
);

/** Every row is exactly as wide as the framed box it is in, whatever its content, actions or mode. */
export const expectRowsFillTheirBoxes = (root: ParentNode, rowSelector: string) => {
  const frames = [...root.querySelectorAll<HTMLElement>('.story-row-box-frame')];
  expect(frames.length).toBeGreaterThan(0);
  for (const frame of frames) {
    const box = frame.getBoundingClientRect();
    const rows = [...frame.querySelectorAll<HTMLElement>(rowSelector)];
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const { width, left, right } = row.getBoundingClientRect();
      expect(Math.abs(width - box.width)).toBeLessThanOrEqual(0.5);
      expect(left).toBeGreaterThanOrEqual(box.left - 0.5);
      expect(right).toBeLessThanOrEqual(box.right + 0.5);
    }
  }
};

/** Boxes of the same width hold rows of the same width. */
export const expectEqualBoxesEqualRows = (root: ParentNode, rowSelector: string) => {
  const widths = [...root.querySelectorAll<HTMLElement>('.story-row-box-frame')].map((frame) => ({
    box: Math.round(frame.getBoundingClientRect().width),
    rows: [...frame.querySelectorAll<HTMLElement>(rowSelector)].map((row) =>
      Math.round(row.getBoundingClientRect().width)
    ),
  }));
  for (const { box, rows } of widths) {
    for (const row of rows) {
      expect(row).toBe(box);
    }
  }
  const rowWidths = new Set(widths.flatMap(({ rows }) => rows));
  expect(rowWidths.size).toBe(1);
};

/**
 * Whether a row's container is a phone's width or narrower, measured as the row measures it: the content box of
 * the container it is drawn in (`.reqore-entity-row-container`, `.reqore-severity-row-container`), against Reqore's
 * phone width. Where it is - on a phone, or in as narrow a container on any screen - a lone or stacked action under
 * the label is the row's width (Fitts's law); where it is wider, each is as wide as its label (qorus#646).
 */
export const rowContainerIsPhoneWidth = (row: HTMLElement) => {
  const container = (row.closest('.reqore-entity-row-container, .reqore-severity-row-container') ??
    row) as HTMLElement;
  const style = getComputedStyle(container);
  const width =
    container.clientWidth -
    (parseFloat(style.paddingLeft) || 0) -
    (parseFloat(style.paddingRight) || 0);

  return width > 0 && width <= NARROW_CONTAINER_BREAKPOINT_PX;
};

/** A row's one action, under its label on a line of its own, the row's width. */
export const expectLoneActionSpansTheRow = async (
  row: HTMLElement,
  kind: 'entity' | 'severity'
) => {
  const prefix = `.reqore-${kind}-row`;

  expect(rowContainerIsPhoneWidth(row)).toBe(true);
  await waitFor(() => {
    const label = (row.querySelector(`${prefix}-label`) as HTMLElement).getBoundingClientRect();
    const column = (row.querySelector(`${prefix}-actions`) as HTMLElement).getBoundingClientRect();
    const buttons = Array.from(
      row.querySelectorAll<HTMLElement>(
        `${prefix}-actions > .reqore-button, ${prefix}-actions > .reqore-dropdown`
      )
    );
    expect(buttons).toHaveLength(1);
    const box = buttons[0].getBoundingClientRect();
    // under the label, not at the end of its line
    expect(box.top).toBeGreaterThanOrEqual(label.bottom - 0.5);
    // the row's width: the actions column spans the row there
    expect(Math.abs(box.width - column.width)).toBeLessThan(1);
  });
};
