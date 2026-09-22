/**
 * The geometric guard for tables: **a row's box contains its content, and a
 * cell's content stays inside its cell**.
 *
 * A table row is drawn at one height, and until this guard existed nothing
 * checked that what a cell holds actually fits in it. Anything taller simply
 * painted outside the row, over the rows beneath — two and three descriptions
 * overprinting each other — and anything wider painted over the next column.
 * Neither shows up in a snapshot diff of a short fixture, and neither is
 * expressible as "this element has this class": it is a question about
 * measured geometry, so it is asked here, in a real browser, and asked of
 * several stories rather than one.
 *
 * Two different questions, because they have two different right answers:
 *
 *   - **Vertically the content must FIT.** A row's height is decided before its
 *     content is laid out (a virtualised list has to know it), so content that
 *     does not fit has nowhere to go. Clipping it would hide text with no sign
 *     that anything is missing, so the rule is stricter than "nothing escapes":
 *     the content must be laid out to fit — one line with an ellipsis, a
 *     deliberate `maxHeight` clamp with its "Show more", or a row that grew to
 *     its content because the table wraps.
 *   - **Horizontally the content must not be PAINTED outside its cell.** A
 *     column is as wide as it is, and the honest answer for a value too long
 *     for it — a URL, an id — is an ellipsis, which means the text box is
 *     WIDER than the cell by design and the cell clips it. So the horizontal
 *     rule is about what reaches the screen, not about layout.
 *
 * Both walks stop at any element that clips on the axis being measured: such an
 * element contains its own content by construction, and its own border box is
 * then what has to fit. That is what makes a deliberate clamp pass and an
 * accident fail.
 */

/** A cell whose content leaves its box, with the numbers that say by how much. */
export interface IReqoreTableGeometryViolation {
  /** Row index within the table, top to bottom as rendered. */
  row: number;
  /** `data-reqore-table-column-id` of the offending cell. */
  column: string | null;
  /** The cell's text, trimmed, for identifying it in a failure message. */
  text: string;
  /** The cell's own height, and the height its content was laid out at. */
  cellHeight: number;
  contentHeight: number;
  /** The cell's own width, and the width its content actually PAINTS at. */
  cellWidth: number;
  paintedWidth: number;
  /** How far past each edge, in px. Only the ones over tolerance are reported. */
  overflowTop: number;
  overflowBottom: number;
  overflowLeft: number;
  overflowRight: number;
}

interface IEdges {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const union = (box: IEdges | undefined, rect: IEdges): IEdges =>
  box
    ? {
        top: Math.min(box.top, rect.top),
        bottom: Math.max(box.bottom, rect.bottom),
        left: Math.min(box.left, rect.left),
        right: Math.max(box.right, rect.right),
      }
    : { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };

/**
 * Collects the content box of `element`, on one axis, in one of two senses:
 * `layout` descends through everything that does not clip on that axis, so it
 * sees content that was laid out past the box; `painted` does the same but a
 * clipping element contributes only its own border box, which is what actually
 * reaches the screen.
 */
const contentBox = (element: Element, axis: 'vertical' | 'horizontal'): IEdges | undefined => {
  let box: IEdges | undefined;

  const clipsOnAxis = (style: CSSStyleDeclaration): boolean =>
    axis === 'vertical' ? style.overflowY !== 'visible' : style.overflowX !== 'visible';

  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const style = getComputedStyle(el);

        // A portal-ed tooltip or menu is positioned against the viewport, not
        // against this cell — it is not the cell's content.
        if (style.position === 'fixed' || style.display === 'none') {
          return;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width > 0 || rect.height > 0) {
          box = union(box, rect);
        }

        // An element that clips contains its own content; its border box (just
        // measured) is the whole of what it contributes.
        if (!clipsOnAxis(style)) {
          walk(el);
        }
        return;
      }

      if (child.nodeType === Node.TEXT_NODE && (child.textContent ?? '').trim()) {
        const range = document.createRange();
        range.selectNodeContents(child);
        Array.from(range.getClientRects()).forEach((rect) => {
          if (rect.width > 0 || rect.height > 0) {
            box = union(box, rect);
          }
        });
        range.detach?.();
      }
    });
  };

  walk(element);
  return box;
};

export interface IReqoreTableGeometryOptions {
  /**
   * Slack, in px. Sub-pixel layout and the browser's own rounding put a rect a
   * fraction outside its parent routinely; a real overflow is a line of text,
   * which is an order of magnitude more than this.
   */
  tolerance?: number;
  /** Which rows to measure. Defaults to every body row in `root`. */
  rowSelector?: string;
}

/** One decimal is as fine as a layout answer gets to be worth reading. */
const round = (value: number): number => Math.round(value * 10) / 10;

/**
 * Measures every body cell under `root` and returns the ones whose content
 * leaves their box. Empty means the invariant holds.
 */
export const findTableGeometryViolations = (
  root: HTMLElement,
  { tolerance = 1, rowSelector = '.reqore-table-row' }: IReqoreTableGeometryOptions = {}
): IReqoreTableGeometryViolation[] => {
  const violations: IReqoreTableGeometryViolation[] = [];

  Array.from(root.querySelectorAll<HTMLElement>(rowSelector)).forEach((row, rowIndex) => {
    const rowRect = row.getBoundingClientRect();

    Array.from(row.querySelectorAll<HTMLElement>('.reqore-table-cell')).forEach((cell) => {
      const cellRect = cell.getBoundingClientRect();
      const cellStyle = getComputedStyle(cell);

      const laidOut = contentBox(cell, 'vertical');
      const painted = contentBox(cell, 'horizontal');

      // Vertical: content must FIT. A cell that clips on its own (a `maxHeight`
      // clamp) answers for its own content, so only its box has to fit.
      const cellClipsVertically = cellStyle.overflowY !== 'visible';
      const verticalTarget = cellClipsVertically ? cellRect : (laidOut ?? cellRect);

      // Horizontal: content must not be PAINTED outside the cell.
      const horizontalTarget = painted ?? cellRect;

      // And the cell itself belongs to its row — the one check that still holds
      // when a consumer supplies its own `cellComponent` and none of the
      // table's own containment applies.
      const bottom = Math.max(verticalTarget.bottom, cellRect.bottom);
      const top = Math.min(verticalTarget.top, cellRect.top);

      const overflowTop = Math.max(cellRect.top - verticalTarget.top, rowRect.top - top);
      const overflowBottom = Math.max(
        verticalTarget.bottom - cellRect.bottom,
        bottom - rowRect.bottom
      );
      const overflowLeft = cellRect.left - horizontalTarget.left;
      const overflowRight = horizontalTarget.right - cellRect.right;

      if (
        overflowTop > tolerance ||
        overflowBottom > tolerance ||
        overflowLeft > tolerance ||
        overflowRight > tolerance
      ) {
        violations.push({
          row: rowIndex,
          column: cell.getAttribute('data-reqore-table-column-id'),
          text: (cell.textContent ?? '').trim().slice(0, 60),
          cellHeight: round(cellRect.height),
          contentHeight: round(verticalTarget.bottom - verticalTarget.top),
          cellWidth: round(cellRect.width),
          paintedWidth: round(horizontalTarget.right - horizontalTarget.left),
          overflowTop: round(overflowTop),
          overflowBottom: round(overflowBottom),
          overflowLeft: round(overflowLeft),
          overflowRight: round(overflowRight),
        });
      }
    });
  });

  return violations;
};

/**
 * The violations as a line each, for a failure message that says which cell,
 * by how much, and what was in it — the numbers are the whole point of a
 * geometric guard.
 */
export const describeTableGeometryViolations = (
  violations: IReqoreTableGeometryViolation[]
): string =>
  violations
    .slice(0, 8)
    .map(
      (v) =>
        `  row ${v.row} column "${v.column}": box ${v.cellWidth}x${v.cellHeight}, ` +
        `content ${v.paintedWidth}x${v.contentHeight} ` +
        `(over: top ${v.overflowTop}, bottom ${v.overflowBottom}, ` +
        `left ${v.overflowLeft}, right ${v.overflowRight}) — "${v.text}"`
    )
    .join('\n');
