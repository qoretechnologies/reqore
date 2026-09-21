import { expect, waitFor } from 'storybook/test';
import {
  describeTableGeometryViolations,
  findTableGeometryViolations,
  IReqoreTableGeometryOptions,
} from '../../testing';

/**
 * The assertion itself: waits for the table's rows, then requires every body
 * cell's content to stay inside its cell and its row.
 *
 * Use it in the `play` of any story that renders a table. It costs one layout
 * pass and it is the thing that keeps "a row's box contains its content" true
 * as cells grow content nobody anticipated.
 */
export const expectTableContentWithinItsRows = async (
  root: HTMLElement,
  options: IReqoreTableGeometryOptions = {}
): Promise<void> => {
  await waitFor(() => {
    const rows = root.querySelectorAll(options.rowSelector ?? '.reqore-table-row');
    if (!rows.length) {
      throw new Error('table rows not rendered');
    }
  });

  const violations = findTableGeometryViolations(root, options);

  await expect(
    violations.length,
    violations.length
      ? `${violations.length} cell(s) overflow their box:\n${describeTableGeometryViolations(violations)}`
      : ''
  ).toBe(0);
};
