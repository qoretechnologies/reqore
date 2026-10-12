// Copyright 2026 Qore Technologies, s.r.o.
import { ReactNode } from 'react';
import { expect } from 'storybook/test';
import { ReqoreP } from '../../components/Paragraph';

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
export const StoryRowBox = ({ caption, width, className, children }: IStoryRowBoxProps) => (
  <div className={`story-row-box ${className || ''}`.trim()} style={{ width, maxWidth: '100%' }}>
    <ReqoreP size='small' effect={{ opacity: 0.6 }} className='story-row-box-caption'>
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
