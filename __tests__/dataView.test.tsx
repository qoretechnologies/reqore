import { fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  ReqoreContent,
  ReqoreDataView,
  ReqoreLayoutContent,
  ReqoreUIProvider,
  reqoreCoerceValueToKind,
  reqoreDeleteAtPath,
  reqoreFormatScalar,
  reqoreHasStructuredValue,
  reqoreIsEnvelope,
  reqoreRenameKeyAtPath,
  reqoreSetAtPath,
  reqoreUnwrapEnvelope,
} from '../src';

const wrap = (children: React.ReactNode) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>{children}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const SAMPLE = {
  workflow_instanceid: 12345,
  status: 'COMPLETE',
  priority: 500,
  business_error: false,
  static_data: {
    customer: 7811,
    items: ['ABC-100', 'ABC-200'],
  },
};

test('Renders <ReqoreDataView /> with a record payload', () => {
  render(wrap(<ReqoreDataView data={SAMPLE} collapsibleRoot={false} />));

  // Panel itself rendered
  expect(document.querySelectorAll('.reqore-data-view').length).toBe(1);
  // One record container at the root
  expect(document.querySelectorAll('.reqore-data-view-record').length).toBeGreaterThanOrEqual(1);
  // Top-level keys rendered
  expect(document.querySelectorAll('.reqore-data-view-key').length).toBeGreaterThanOrEqual(5);
});

test('Renders the empty state when data is null / empty', () => {
  const { rerender } = render(
    wrap(<ReqoreDataView data={undefined} emptyText='No payload yet' />)
  );
  expect(document.body.textContent).toContain('No payload yet');

  rerender(wrap(<ReqoreDataView data={{}} emptyText='Still empty' />));
  expect(document.body.textContent).toContain('Still empty');

  rerender(wrap(<ReqoreDataView data={[]} emptyText='No rows' />));
  expect(document.body.textContent).toContain('No rows');
});

test('Calls onItemClick when a leaf value is clicked', () => {
  const handler = vi.fn();
  render(
    wrap(
      <ReqoreDataView
        data={SAMPLE}
        collapsibleRoot={false}
        defaultExpandDepth={10}
        onItemClick={handler}
      />
    )
  );

  // Click the first scalar value chip (the workflow_instanceid number).
  // ReqoreTag wires onClick to an inner interactive element, so we hunt
  // through descendants to find the real click target.
  const valueChips = document.querySelectorAll('.reqore-data-view-value');
  expect(valueChips.length).toBeGreaterThan(0);
  const target =
    valueChips[0].querySelector('[role="button"], button, .reqore-tag-content') ?? valueChips[0];
  fireEvent.click(target);

  expect(handler).toHaveBeenCalledTimes(1);
  const callPath = handler.mock.calls[0][1] as string[];
  // Path is rooted in the visited top-level key.
  expect(callPath[0]).toBe('workflow_instanceid');
});

test('Toggles a nested section when its summary is clicked', () => {
  render(
    wrap(
      <ReqoreDataView
        data={SAMPLE}
        collapsibleRoot={false}
        // start everything collapsed past depth 0
        defaultExpandDepth={0}
      />
    )
  );

  // The nested `static_data` should be a collapsed section.
  const summaries = Array.from(document.querySelectorAll('summary'));
  expect(summaries.length).toBeGreaterThan(0);

  // Click the first nested summary — the section should toggle open.
  const target = summaries.find((s) => s.textContent?.includes('Object'));
  expect(target).toBeDefined();
  const wasOpen = target!.parentElement?.hasAttribute('open');
  fireEvent.click(target!);
  const isOpen = target!.parentElement?.hasAttribute('open');
  expect(isOpen).not.toBe(wasOpen);
});

test('Recognises and unwraps the default {type, value} envelope', () => {
  const envelopeData = {
    created: { type: 'datetime', value: '2026-05-31T14:40:29.292Z' },
    retries: { type: 'int', value: 3 },
  };

  // `showTypes` is off by default — opt in here so we can assert the
  // chip renders the envelope's type label.
  render(
    wrap(<ReqoreDataView data={envelopeData} collapsibleRoot={false} showTypes />)
  );

  // The value chips should show the INNER values, not the envelope objects.
  const valueChips = Array.from(document.querySelectorAll('.reqore-data-view-value'));
  const texts = valueChips.map((node) => node.textContent ?? '');
  expect(texts.some((t) => t.includes('3'))).toBe(true);

  // The type chip should display the envelope's type label.
  const typeChips = Array.from(document.querySelectorAll('.reqore-data-view-type'));
  const typeTexts = typeChips.map((node) => node.textContent?.toLowerCase() ?? '');
  expect(typeTexts.some((t) => t.includes('datetime'))).toBe(true);
  expect(typeTexts.some((t) => t.includes('int'))).toBe(true);
});

test('Hides the type chip by default (showTypes defaults to false)', () => {
  const envelopeData = {
    created: { type: 'datetime', value: '2026-05-31T14:40:29.292Z' },
  };
  render(wrap(<ReqoreDataView data={envelopeData} collapsibleRoot={false} />));
  expect(document.querySelectorAll('.reqore-data-view-type').length).toBe(0);
});

test('Accepts the `flat` prop and renders without errors in both states', () => {
  // Visual-level assertions about flat/border styling live in the
  // Storybook stories. Here we just guarantee the prop is plumbed and
  // both states render the same number of rows + key chips.
  const { rerender } = render(
    wrap(<ReqoreDataView data={SAMPLE} collapsibleRoot={false} flat={false} />)
  );
  const flatFalseKeys = document.querySelectorAll('.reqore-data-view-key').length;
  expect(flatFalseKeys).toBeGreaterThan(0);

  rerender(
    wrap(<ReqoreDataView data={SAMPLE} collapsibleRoot={false} flat={true} />)
  );
  const flatTrueKeys = document.querySelectorAll('.reqore-data-view-key').length;
  expect(flatTrueKeys).toBe(flatFalseKeys);
});

test('Accepts a custom `keyColor` + `keyIntent` without crashing', () => {
  render(
    wrap(
      <ReqoreDataView
        data={SAMPLE}
        collapsibleRoot={false}
        keyColor='#9c6ade'
        keyIntent={null}
      />
    )
  );
  // Sanity: key chips still render after the override.
  expect(
    document.querySelectorAll('.reqore-data-view-key').length
  ).toBeGreaterThan(0);
});

test('Honours a custom `keyIntent` and `null` (drops intent)', () => {
  const { rerender } = render(
    wrap(
      <ReqoreDataView
        data={SAMPLE}
        collapsibleRoot={false}
        keyIntent='success'
      />
    )
  );
  expect(
    document.querySelectorAll('.reqore-data-view-key').length
  ).toBeGreaterThan(0);

  rerender(
    wrap(
      <ReqoreDataView
        data={SAMPLE}
        collapsibleRoot={false}
        keyIntent={null}
      />
    )
  );
  expect(
    document.querySelectorAll('.reqore-data-view-key').length
  ).toBeGreaterThan(0);
});

test('Renders a long string value without truncating its content', () => {
  // Regression guard: an early iteration rendered the value chip with
  // wrap=false, so a long string overflowed its column horizontally
  // and parts of the text were lost off-screen. The chip must keep
  // every character of the input.
  const longValue =
    'MSH|^~\\&|VW-DEVICE|VITALSIM|EHR|HOSPITAL|2026-05-31 14:40:29.292347 Sun +02:00 (CEST)||ORU^R01|MSG-17669ff5-ce8f-4bd0-9903-4d207e193b83|P|2.5';
  render(
    wrap(<ReqoreDataView data={{ payload: longValue }} collapsibleRoot={false} />)
  );
  // Whole string is in the DOM — wrap means it spans multiple lines
  // visually but stays one continuous text node.
  expect(document.body.textContent).toContain(longValue);
  expect(
    document.querySelector('.reqore-data-view-multiline-value')
  ).toBeNull();
});

test('Renders multiline strings as bounded monospace data blocks', () => {
  const value = 'room_id;start;end\r\n13496;07:00;18:00\r\n9755;08:00;18:00';
  const onItemClick = vi.fn();
  render(
    wrap(
      <ReqoreDataView
        data={{ body: value }}
        collapsibleRoot={false}
        onItemClick={onItemClick}
      />
    )
  );

  const block = document.querySelector(
    '.reqore-data-view-multiline-value'
  ) as HTMLElement;
  expect(block).not.toBeNull();
  expect(block.textContent).toBe(value);
  expect(getComputedStyle(block).fontFamily).toContain('monospace');
  expect(getComputedStyle(block).whiteSpace).toBe('pre-wrap');
  expect(getComputedStyle(block).overflow).toBe('auto');

  fireEvent.keyDown(block, { key: 'Enter' });
  expect(onItemClick).toHaveBeenCalledWith(value, ['body']);
});

test('Applies monospace data styling directly to scalar tag content', () => {
  render(
    wrap(
      <ReqoreDataView
        data={{ content_type: 'text/plain' }}
        collapsibleRoot={false}
        showTypes
      />
    )
  );

  const key = document.querySelector(
    '.reqore-data-view-key .reqore-tag-content'
  ) as HTMLElement;
  const value = document.querySelector(
    '.reqore-data-view-value .reqore-tag-content'
  ) as HTMLElement;
  const type = document.querySelector(
    '.reqore-data-view-type .reqore-tag-content'
  ) as HTMLElement;

  expect(getComputedStyle(key).fontFamily).toContain('monospace');
  expect(getComputedStyle(value).fontFamily).toContain('monospace');
  expect(getComputedStyle(type).fontFamily).toContain('monospace');
});

test('Renders a long key without dropping the row or the value next to it', () => {
  // Regression guard: a long key chip used to be rendered with
  // `fixed`, so it kept its content width and pushed the value chip
  // sideways. Now the chip can wrap inside its column and the value
  // stays in place.
  render(
    wrap(
      <ReqoreDataView
        data={{
          validated_against_local_terminology_dictionary: true,
          normalized_observation_count: 2,
        }}
        collapsibleRoot={false}
      />
    )
  );
  // Both rows present + both values rendered alongside their keys.
  expect(document.querySelectorAll('.reqore-data-view-row').length).toBe(2);
  expect(document.body.textContent).toContain(
    'validated_against_local_terminology_dictionary'
  );
  expect(document.body.textContent).toContain('true');
  expect(document.body.textContent).toContain('normalized_observation_count');
  expect(document.body.textContent).toContain('2');
});

test('Renders at every size prop value', () => {
  for (const size of ['tiny', 'small', 'normal', 'big', 'huge'] as const) {
    const { unmount } = render(
      wrap(<ReqoreDataView data={SAMPLE} collapsibleRoot={false} size={size} />)
    );
    // Sanity: the panel + at least one row rendered without throwing.
    expect(document.querySelectorAll('.reqore-data-view').length).toBe(1);
    expect(document.querySelectorAll('.reqore-data-view-row').length).toBeGreaterThan(
      0
    );
    unmount();
  }
});

test('Supports a custom envelope shape via the `envelope` prop', () => {
  const data = {
    id: { __t: 'uuid', __v: 'c45e2fd2-1f70-4b6e-bb1c-9a8e9b7f88aa' },
  };

  render(
    wrap(
      <ReqoreDataView
        data={data}
        envelope={{ typeKey: '__t', valueKey: '__v' }}
        collapsibleRoot={false}
      />
    )
  );

  const valueChips = Array.from(document.querySelectorAll('.reqore-data-view-value'));
  const texts = valueChips.map((node) => node.textContent ?? '');
  // The UUID is the rendered value, not the envelope record.
  expect(texts.some((t) => t.includes('c45e2fd2'))).toBe(true);
});

test('Inlines scalar arrays as a chip row instead of an expanded list', () => {
  const data = { tags: ['urgent', 'cs-bob', 'priority'] };
  render(
    wrap(
      <ReqoreDataView
        data={data}
        collapsibleRoot={false}
        defaultExpandDepth={10}
      />
    )
  );

  // No array container should be present — the values render inline.
  expect(document.querySelectorAll('.reqore-data-view-array').length).toBe(0);
  // The three tags render as value chips.
  const chips = Array.from(document.querySelectorAll('.reqore-data-view-value'));
  expect(chips.length).toBe(3);
});

test('Calls parseEmbedded for strings and renders the parsed shape', () => {
  const parseEmbedded = vi.fn((value: string) => {
    if (value.startsWith('JSON:')) {
      return { data: JSON.parse(value.slice(5)) };
    }
    return undefined;
  });

  render(
    wrap(
      <ReqoreDataView
        data={{ payload: 'JSON:{"a":1,"b":2}' }}
        collapsibleRoot={false}
        defaultExpandDepth={10}
        parseEmbedded={parseEmbedded as any}
      />
    )
  );

  expect(parseEmbedded).toHaveBeenCalled();
  // The parsed record should now show through.
  expect(document.body.textContent).toContain('a');
  expect(document.body.textContent).toContain('b');
});

// ---- Pure helper tests ------------------------------------------------

describe('reqoreIsEnvelope / reqoreUnwrapEnvelope', () => {
  it('recognises and unwraps the default envelope', () => {
    expect(reqoreIsEnvelope({ type: 'string', value: 'x' })).toBe(true);
    expect(reqoreUnwrapEnvelope({ type: 'string', value: 'x' })).toBe('x');
  });

  it('does not recognise envelopes with the wrong shape', () => {
    expect(reqoreIsEnvelope({ type: 123, value: 'x' })).toBe(false);
    expect(reqoreIsEnvelope({ value: 'x' })).toBe(false);
    expect(reqoreIsEnvelope(null)).toBe(false);
    expect(reqoreIsEnvelope('plain string')).toBe(false);
  });

  it('supports allowed-keys strict matching', () => {
    expect(
      reqoreIsEnvelope(
        { type: 'string', value: 'x', extra: 1 },
        { allowedKeys: ['type', 'value'] }
      )
    ).toBe(false);
    expect(
      reqoreIsEnvelope(
        { type: 'string', value: 'x' },
        { allowedKeys: ['type', 'value'] }
      )
    ).toBe(true);
  });

  it('passes non-envelopes through unchanged when unwrapping', () => {
    expect(reqoreUnwrapEnvelope('plain')).toBe('plain');
    expect(reqoreUnwrapEnvelope(42)).toBe(42);
  });
});

describe('reqoreFormatScalar', () => {
  it('returns an em-dash for empty values', () => {
    expect(reqoreFormatScalar(undefined).display).toBe('—');
    expect(reqoreFormatScalar(null).display).toBe('—');
    expect(reqoreFormatScalar('').display).toBe('—');
  });

  it('renders numbers + booleans as their string form', () => {
    expect(reqoreFormatScalar(42).display).toBe('42');
    expect(reqoreFormatScalar(true).display).toBe('true');
    expect(reqoreFormatScalar(false).display).toBe('false');
  });

  it('passes plain strings through unchanged', () => {
    expect(reqoreFormatScalar('plain text').display).toBe('plain text');
    expect(reqoreFormatScalar('plain text').isDate).toBe(false);
  });

  it('formats ISO date strings as locale strings when the type label says so', () => {
    const formatted = reqoreFormatScalar('2026-05-31T14:40:29.292Z', 'datetime');
    expect(formatted.isDate).toBe(true);
    expect(formatted.raw).toBe('2026-05-31T14:40:29.292Z');
  });

  it('supports a custom formatDate hook', () => {
    const formatted = reqoreFormatScalar('2026-05-31T14:40:29.292Z', 'datetime', {
      formatDate: () => 'CUSTOM',
    });
    expect(formatted.display).toBe('CUSTOM');
  });

  it('does NOT accidentally parse an integer string as a date', () => {
    // A plain integer string parses as epoch ms via Date.parse — the
    // helper must refuse it unless the type label opts in.
    expect(reqoreFormatScalar('12345').isDate).toBe(false);
  });
});

describe('reqoreHasStructuredValue', () => {
  it('returns false for null / undefined / empty', () => {
    expect(reqoreHasStructuredValue(null)).toBe(false);
    expect(reqoreHasStructuredValue(undefined)).toBe(false);
    expect(reqoreHasStructuredValue('')).toBe(false);
    expect(reqoreHasStructuredValue({})).toBe(false);
    expect(reqoreHasStructuredValue([])).toBe(false);
  });

  it('returns true for populated records, arrays and scalars', () => {
    expect(reqoreHasStructuredValue({ a: 1 })).toBe(true);
    expect(reqoreHasStructuredValue([1])).toBe(true);
    expect(reqoreHasStructuredValue('plain')).toBe(true);
    expect(reqoreHasStructuredValue(0)).toBe(true);
  });

  it('unwraps envelopes before checking', () => {
    expect(reqoreHasStructuredValue({ type: 'list', value: [] })).toBe(false);
    expect(reqoreHasStructuredValue({ type: 'list', value: [1] })).toBe(true);
  });
});

describe('reqoreSetAtPath', () => {
  it('replaces the entire tree when the path is empty', () => {
    expect(reqoreSetAtPath({ a: 1 }, [], 'x')).toBe('x');
  });

  it('sets a top-level record key', () => {
    const before = { a: 1, b: 2 };
    const after = reqoreSetAtPath(before, ['a'], 99);
    expect(after).toEqual({ a: 99, b: 2 });
    expect(after).not.toBe(before);
  });

  it('sets a nested record key', () => {
    const before = { outer: { inner: { leaf: 'v1' } }, other: true };
    const after = reqoreSetAtPath(before, ['outer', 'inner', 'leaf'], 'v2') as Record<
      string,
      any
    >;
    expect(after.outer.inner.leaf).toBe('v2');
    expect(after.other).toBe(true);
    expect(after.outer).not.toBe(before.outer);
    expect(after.outer.inner).not.toBe(before.outer.inner);
  });

  it('sets an array index by string path', () => {
    const before = { tags: ['a', 'b', 'c'] };
    const after = reqoreSetAtPath(before, ['tags', '1'], 'B') as Record<string, any>;
    expect(after.tags).toEqual(['a', 'B', 'c']);
    expect(after.tags).not.toBe(before.tags);
  });

  it('extends an array when the index is past the end', () => {
    const before: unknown[] = ['a'];
    const after = reqoreSetAtPath(before, ['3'], 'd') as unknown[];
    expect(after).toEqual(['a', undefined, undefined, 'd']);
  });

  it('creates intermediate containers when walking through a scalar', () => {
    const before = { user: 'unset' };
    const after = reqoreSetAtPath(before, ['user', 'name'], 'Ada') as Record<
      string,
      any
    >;
    expect(after.user).toEqual({ name: 'Ada' });
  });

  it('creates an intermediate array when the next segment is numeric', () => {
    const before = { tags: 'unset' };
    const after = reqoreSetAtPath(before, ['tags', '0'], 'first') as Record<
      string,
      any
    >;
    expect(after.tags).toEqual(['first']);
  });
});

describe('reqoreDeleteAtPath', () => {
  it('drops a top-level record key', () => {
    const after = reqoreDeleteAtPath({ a: 1, b: 2 }, ['b']) as Record<string, any>;
    expect(after).toEqual({ a: 1 });
  });

  it('splices an array index', () => {
    const after = reqoreDeleteAtPath({ tags: ['a', 'b', 'c'] }, [
      'tags',
      '1',
    ]) as Record<string, any>;
    expect(after.tags).toEqual(['a', 'c']);
  });

  it('returns input unchanged when the path is not resolvable', () => {
    const before = { a: 1 };
    expect(reqoreDeleteAtPath(before, ['missing'])).toBe(before);
  });

  it('returns undefined when the path is empty', () => {
    expect(reqoreDeleteAtPath({ a: 1 }, [])).toBeUndefined();
  });
});

describe('reqoreCoerceValueToKind', () => {
  it('keeps a string unchanged when coerced to string', () => {
    expect(reqoreCoerceValueToKind('hello', 'string')).toBe('hello');
  });
  it('stringifies a number when coerced to string', () => {
    expect(reqoreCoerceValueToKind(42, 'string')).toBe('42');
  });
  it('parses a numeric string to a number', () => {
    expect(reqoreCoerceValueToKind('17', 'number')).toBe(17);
  });
  it('falls back to 0 when the source string is not numeric', () => {
    expect(reqoreCoerceValueToKind('hello', 'number')).toBe(0);
  });
  it('maps true/1/yes string to a true boolean', () => {
    expect(reqoreCoerceValueToKind('true', 'boolean')).toBe(true);
    expect(reqoreCoerceValueToKind('1', 'boolean')).toBe(true);
    expect(reqoreCoerceValueToKind('Yes', 'boolean')).toBe(true);
  });
  it('maps non-zero numbers to true', () => {
    expect(reqoreCoerceValueToKind(5, 'boolean')).toBe(true);
    expect(reqoreCoerceValueToKind(0, 'boolean')).toBe(false);
  });
  it('keeps an existing record when coerced to object', () => {
    const existing = { a: 1 };
    expect(reqoreCoerceValueToKind(existing, 'object')).toBe(existing);
  });
  it('returns an empty object when scalar coerced to object', () => {
    expect(reqoreCoerceValueToKind('whatever', 'object')).toEqual({});
  });
  it('keeps an existing array when coerced to array', () => {
    const existing = [1, 2];
    expect(reqoreCoerceValueToKind(existing, 'array')).toBe(existing);
  });
  it('returns an empty array when scalar coerced to array', () => {
    expect(reqoreCoerceValueToKind('x', 'array')).toEqual([]);
  });
  it('always returns null for null kind', () => {
    expect(reqoreCoerceValueToKind('value', 'null')).toBeNull();
  });
});

describe('reqoreRenameKeyAtPath', () => {
  it('renames a top-level key preserving insertion order', () => {
    const before = { a: 1, b: 2, c: 3 };
    const after = reqoreRenameKeyAtPath(before, [], 'b', 'beta') as Record<
      string,
      unknown
    >;
    expect(Object.keys(after)).toEqual(['a', 'beta', 'c']);
    expect(after.beta).toBe(2);
  });

  it('refuses to overwrite an existing key', () => {
    const before = { a: 1, b: 2 };
    const after = reqoreRenameKeyAtPath(before, [], 'a', 'b');
    expect(after).toBe(before);
  });

  it('renames a nested key under an array path', () => {
    const before = { items: [{ name: 'first' }, { name: 'second' }] };
    const after = reqoreRenameKeyAtPath(before, ['items', '1'], 'name', 'label') as Record<
      string,
      any
    >;
    expect(after.items[0]).toEqual({ name: 'first' });
    expect(after.items[1]).toEqual({ label: 'second' });
  });

  it('returns input unchanged when oldKey is missing', () => {
    const before = { a: 1 };
    expect(reqoreRenameKeyAtPath(before, [], 'missing', 'x')).toBe(before);
  });
});

describe('editable DataView', () => {
  const editableTree = {
    display_name: 'Customer',
    retries: 3,
    is_public: false,
  };

  const Harness = ({
    onCommit,
    initial,
  }: {
    onCommit?: (next: unknown) => void;
    initial?: unknown;
  }) => {
    const [tree, setTree] = useState<unknown>(initial ?? editableTree);
    return (
      <ReqoreDataView
        data={tree}
        editable
        collapsibleRoot={false}
        onDataChange={(next) => {
          setTree(next);
          onCommit?.(next);
        }}
      />
    );
  };

  const findRow = (container: HTMLElement, keyName: string) => {
    const rows = Array.from(
      container.querySelectorAll('.reqore-data-view-row')
    );
    return rows.find(
      (r) => r.querySelector('.reqore-data-view-key')?.textContent === keyName
    ) as HTMLElement | undefined;
  };

  it('renders chips by default (no inputs until clicked)', () => {
    const { container } = render(wrap(<Harness />));
    // display_name + retries are scalars but render as chips, not
    // inputs, until clicked.
    expect(
      container.querySelectorAll('input.reqore-data-view-edit').length
    ).toBe(0);
    expect(
      container.querySelectorAll('.reqore-data-view-value').length
    ).toBeGreaterThan(0);
  });

  it('swaps chip → input on click and commits the edit on Enter', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'display_name')!;
    const chip = row.querySelector('.reqore-data-view-value') as HTMLElement;
    fireEvent.click(chip);
    const input = row.querySelector(
      'input.reqore-data-view-edit'
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('Customer');
    fireEvent.change(input, { target: { value: 'Customer 2' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.display_name).toBe('Customer 2');
  });

  it('commits via the visible Save button', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'display_name')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    const input = row.querySelector(
      'input.reqore-data-view-edit'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Customer v2' } });
    const commitBtn = row.querySelector(
      '.reqore-data-view-edit-commit'
    ) as HTMLElement;
    expect(commitBtn).toBeTruthy();
    // mousedown is the actual commit trigger so the input doesn't
    // blur-commit before the button click resolves.
    fireEvent.mouseDown(commitBtn);
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.display_name).toBe('Customer v2');
  });

  it('reverts via the visible Cancel button without firing onCommit', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'display_name')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    const input = row.querySelector(
      'input.reqore-data-view-edit'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'discarded' } });
    const cancelBtn = row.querySelector(
      '.reqore-data-view-edit-cancel'
    ) as HTMLElement;
    expect(cancelBtn).toBeTruthy();
    fireEvent.mouseDown(cancelBtn);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('reverts on Escape without firing onCommit', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'display_name')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    const input = row.querySelector(
      'input.reqore-data-view-edit'
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'discarded' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('commits a numeric edit as a Number, not a string', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'retries')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    const input = row.querySelector(
      'input.reqore-data-view-edit'
    ) as HTMLInputElement;
    expect(input.type).toBe('number');
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.retries).toBe(7);
  });

  it('renders a boolean as a chip in display mode (no inline checkbox)', () => {
    const { container } = render(wrap(<Harness />));
    const row = findRow(container, 'is_public')!;
    // Display mode is consistent with other scalars — the chip
    // shows the value; the editable affordances live in edit mode.
    expect(row.querySelector('.reqore-data-view-value')).toBeTruthy();
    expect(row.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('edits a boolean via chip → checkbox toggle → save', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'is_public')!;
    // Step 1: click the chip → enter edit mode → checkbox appears.
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    const checkbox = row.querySelector(
      '.reqore-data-view-edit-bool'
    ) as HTMLElement;
    expect(checkbox).toBeTruthy();
    // Step 2: click checkbox → toggles the LOCAL draft, no commit yet.
    fireEvent.click(checkbox);
    expect(onCommit).not.toHaveBeenCalled();
    // Step 3: click Save → commits the toggled draft (true).
    fireEvent.mouseDown(
      row.querySelector('.reqore-data-view-edit-commit') as HTMLElement
    );
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.is_public).toBe(true);
  });

  it('discards a boolean toggle when Cancel is clicked', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'is_public')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    fireEvent.click(
      row.querySelector('.reqore-data-view-edit-bool') as HTMLElement
    );
    fireEvent.mouseDown(
      row.querySelector('.reqore-data-view-edit-cancel') as HTMLElement
    );
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('shows the type picker when editing a boolean', () => {
    const { container } = render(wrap(<Harness />));
    const row = findRow(container, 'is_public')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    // The same picker that scalar cells use is reachable on booleans,
    // since both kinds share the edit-mode control group.
    expect(row.querySelector('.reqore-data-view-edit-type')).toBeTruthy();
  });

  it('renames a key via the inline key cell', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'display_name')!;
    const keyChip = row.querySelector('.reqore-data-view-key') as HTMLElement;
    fireEvent.click(keyChip);
    const keyInput = row.querySelector(
      'input.reqore-data-view-key-edit'
    ) as HTMLInputElement;
    expect(keyInput).toBeTruthy();
    fireEvent.change(keyInput, { target: { value: 'label' } });
    fireEvent.keyDown(keyInput, { key: 'Enter' });
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(Object.keys(last)).toEqual(['label', 'retries', 'is_public']);
    expect(last.label).toBe('Customer');
  });

  it('refuses a duplicate key rename', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'display_name')!;
    fireEvent.click(row.querySelector('.reqore-data-view-key') as HTMLElement);
    const keyInput = row.querySelector(
      'input.reqore-data-view-key-edit'
    ) as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: 'retries' } });
    fireEvent.keyDown(keyInput, { key: 'Enter' });
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('removes a row when the delete action fires', () => {
    const onCommit = vi.fn();
    const { container } = render(wrap(<Harness onCommit={onCommit} />));
    const row = findRow(container, 'retries')!;
    const deleteBtn = row.querySelector(
      '.reqore-data-view-row-delete'
    ) as HTMLElement;
    expect(deleteBtn).toBeTruthy();
    fireEvent.click(deleteBtn);
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect('retries' in last).toBe(false);
    expect(last.display_name).toBe('Customer');
  });

  it('adds a new string property via the Add property affordance', () => {
    const onCommit = vi.fn();
    const { container } = render(
      wrap(<Harness onCommit={onCommit} initial={{}} />)
    );
    const addRow = container.querySelector(
      '.reqore-data-view-add-row'
    ) as HTMLElement;
    expect(addRow.getAttribute('data-state')).toBe('collapsed');
    fireEvent.click(addRow.querySelector('button') as HTMLElement);
    expect(
      (
        container.querySelector('.reqore-data-view-add-row') as HTMLElement
      ).getAttribute('data-state')
    ).toBe('expanded');
    const keyInput = container.querySelector(
      'input.reqore-data-view-add-key'
    ) as HTMLInputElement;
    fireEvent.change(keyInput, { target: { value: 'name' } });
    const commit = container.querySelector(
      '.reqore-data-view-add-commit'
    ) as HTMLElement;
    fireEvent.click(commit);
    const last = onCommit.mock.calls.at(-1)?.[0];
    expect(last).toEqual({ name: '' });
  });

  it('refuses an empty key from the Add property affordance', () => {
    const onCommit = vi.fn();
    const { container } = render(
      wrap(<Harness onCommit={onCommit} initial={{}} />)
    );
    const addRow = container.querySelector(
      '.reqore-data-view-add-row'
    ) as HTMLElement;
    fireEvent.click(addRow.querySelector('button') as HTMLElement);
    const commit = container.querySelector(
      '.reqore-data-view-add-commit'
    ) as HTMLElement;
    fireEvent.click(commit);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('appends an item to an array via the Add item affordance', () => {
    const onCommit = vi.fn();
    const { container } = render(
      wrap(<Harness onCommit={onCommit} initial={{ tags: ['a', 'b'] }} />)
    );
    // Find the array's Add affordance — it lives under the array
    // stack, not the record's top-level affordance.
    const arrayStack = container.querySelector(
      '.reqore-data-view-array'
    ) as HTMLElement;
    const addRow = arrayStack.querySelector(
      '.reqore-data-view-add-row'
    ) as HTMLElement;
    expect(addRow).toBeTruthy();
    fireEvent.click(addRow.querySelector('button') as HTMLElement);
    // No key input for arrays — only the type picker + commit.
    expect(
      addRow.querySelector('input.reqore-data-view-add-key')
    ).toBeNull();
    fireEvent.click(
      addRow.querySelector('.reqore-data-view-add-commit') as HTMLElement
    );
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.tags).toEqual(['a', 'b', '']);
  });

  it('exposes no type picker outside edit mode', () => {
    const { container } = render(
      wrap(<Harness initial={{ count: '7' }} />)
    );
    // No row-level type picker — type-changing is a per-edit
    // concern, not a permanent row action.
    expect(
      container.querySelectorAll('.reqore-data-view-row-type-picker').length
    ).toBe(0);
  });

  it('shows the type picker only while editing the value', () => {
    const { container } = render(
      wrap(<Harness initial={{ count: '7' }} />)
    );
    const row = findRow(container, 'count')!;
    // Before entering edit mode there's no type picker.
    expect(row.querySelector('.reqore-data-view-edit-type')).toBeNull();
    // Click the chip → edit mode → picker is in the control group.
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    expect(row.querySelector('.reqore-data-view-edit-type')).toBeTruthy();
  });

  it('coerces a numeric-string draft to a Number when type-picking', () => {
    const onCommit = vi.fn();
    const { container } = render(
      wrap(<Harness onCommit={onCommit} initial={{ count: '42' }} />)
    );
    const row = findRow(container, 'count')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    fireEvent.click(
      row.querySelector('.reqore-data-view-edit-type') as HTMLElement
    );
    const numberItem = Array.from(
      document.querySelectorAll('.reqore-menu-item')
    ).find((item) => item.textContent?.includes('Number')) as HTMLElement;
    expect(numberItem).toBeTruthy();
    fireEvent.click(numberItem);
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.count).toBe(42);
  });

  it('falls back to 0 when type-picking Number from a non-numeric string', () => {
    const onCommit = vi.fn();
    const { container } = render(
      wrap(<Harness onCommit={onCommit} initial={{ count: 'seven' }} />)
    );
    const row = findRow(container, 'count')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    fireEvent.click(
      row.querySelector('.reqore-data-view-edit-type') as HTMLElement
    );
    const numberItem = Array.from(
      document.querySelectorAll('.reqore-menu-item')
    ).find((item) => item.textContent?.includes('Number')) as HTMLElement;
    fireEvent.click(numberItem);
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.count).toBe(0);
  });

  it('converts a scalar to an empty object via the edit-mode type picker', () => {
    const onCommit = vi.fn();
    const { container } = render(
      wrap(<Harness onCommit={onCommit} initial={{ payload: 'x' }} />)
    );
    const row = findRow(container, 'payload')!;
    fireEvent.click(row.querySelector('.reqore-data-view-value') as HTMLElement);
    fireEvent.click(
      row.querySelector('.reqore-data-view-edit-type') as HTMLElement
    );
    const objectItem = Array.from(
      document.querySelectorAll('.reqore-menu-item')
    ).find((item) => item.textContent?.includes('Object')) as HTMLElement;
    fireEvent.click(objectItem);
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.payload).toEqual({});
  });

  it('deletes an array item via the per-row action group', () => {
    const onCommit = vi.fn();
    const { container } = render(
      wrap(
        <Harness onCommit={onCommit} initial={{ tags: ['a', 'b', 'c'] }} />
      )
    );
    const arrayItems = container.querySelectorAll(
      '.reqore-data-view-array-item'
    );
    expect(arrayItems.length).toBe(3);
    const second = arrayItems[1] as HTMLElement;
    const deleteBtn = second.querySelector(
      '.reqore-data-view-row-delete'
    ) as HTMLElement;
    fireEvent.click(deleteBtn);
    const last = onCommit.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(last.tags).toEqual(['a', 'c']);
  });
});
