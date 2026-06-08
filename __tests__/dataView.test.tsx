import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreDataView,
  ReqoreLayoutContent,
  ReqoreUIProvider,
  reqoreFormatScalar,
  reqoreHasStructuredValue,
  reqoreIsEnvelope,
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
  const handler = jest.fn();
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
  const parseEmbedded = jest.fn((value: string) => {
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
