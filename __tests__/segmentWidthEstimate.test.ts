import { describe, expect, test } from 'vitest';
import { estimateItemWidth } from '../src/components/SegmentedControl';

/* A segment's estimated width counts its badge: a filter's "Failing 3" is wider than
   "Failing", and a `fluid` control that left the count out folded too late and cut its last
   segment in half on a phone. */
describe('estimateItemWidth', () => {
  test('a segment with a count is wider than the same segment without one', () => {
    const plain = estimateItemWidth({ value: 'failing', label: 'Failing' });
    const counted = estimateItemWidth({ value: 'failing', label: 'Failing', badge: 3 });
    expect(counted).toBeGreaterThan(plain);
  });

  test('a badge given through the button props counts too', () => {
    const plain = estimateItemWidth({ value: 'all', label: 'All' });
    const counted = estimateItemWidth({ value: 'all', label: 'All', props: { badge: 1240 } });
    expect(counted).toBeGreaterThan(plain);
  });
});
