import { expect, fireEvent, fn } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useState } from 'react';
import { _testsWaitForText } from '../../../__tests__/utils';
import {
  IReqoreDataViewProps,
  ReqoreDataView,
} from '../../components/DataView';
import { StoryMeta } from '../utils';
import { SizeArg, IntentArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreDataViewProps>();

const meta: StoryMeta<typeof ReqoreDataView> = {
  title: 'Collections/DataView',
  component: ReqoreDataView,
  args: {
    label: 'Order payload',
    icon: 'CodeLine',
    rounded: true,
    flat: true,
    raised: true,
    collapsibleRoot: true,
    defaultExpandDepth: 2,
    inlineScalarArrays: true,
    onItemClick: noop,
  },
  argTypes: {
    ...createArg('showTypes', {
      name: 'Show types',
      description:
        'Show a chip with the value type next to each scalar (string / number / boolean / date / null / array / object).',
      control: 'boolean',
      defaultValue: true,
    }),
    ...createArg('collapsibleRoot', {
      name: 'Collapsible root',
      description:
        'Wrap the root container in a collapsible section so the operator can fold the whole tree away.',
      control: 'boolean',
      defaultValue: true,
    }),
    ...createArg('defaultExpandDepth', {
      name: 'Default expand depth',
      description:
        'Sections deeper than this start collapsed.',
      control: { type: 'number', min: 0, max: 10 },
      defaultValue: 2,
    }),
    ...createArg('inlineScalarArrays', {
      name: 'Inline scalar arrays',
      description:
        'Render arrays of scalars (strings / numbers / booleans / dates) as a wrapping chip row instead of a tall column.',
      control: 'boolean',
      defaultValue: true,
    }),
    ...SizeArg,
    ...IntentArg,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOrder = {
  workflow_instanceid: 12_345,
  status: 'COMPLETE',
  priority: 500,
  business_error: false,
  started: '2026-05-31T14:40:29.292Z',
  completed: '2026-05-31T14:40:32.118Z',
  static_data: {
    customer_id: 7811,
    items: ['ABC-100', 'ABC-200', 'XYZ-001'],
    delivery: {
      street: '40 Wallaby Way',
      city: 'Sydney',
      postcode: '2000',
    },
  },
  notes: [
    { author: 'system', message: 'Order accepted' },
    { author: 'cs:bob', message: 'Confirmed inventory' },
    { author: 'system', message: 'Shipped via courier' },
  ],
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView in its default configuration.',
      },
    },
  },
  args: {
    data: sampleOrder,
  },
};

export const FlatRoot: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with a flat structure at the root.',
      },
    },
  },
  args: {
    data: sampleOrder,
    collapsibleRoot: false,
    label: 'Flat root',
  },
};

export const WithTypeChips: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with type chips visible next to each key/value.',
      },
    },
  },
  args: {
    data: sampleOrder,
    showTypes: true,
    label: 'With type chips',
  },
};

export const ExpandedByDefault: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView expanded by default.',
      },
    },
  },
  args: {
    data: sampleOrder,
    defaultExpandDepth: 99,
    label: 'Expanded',
  },
};

export const ArrayRoot: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with an array at the root.',
      },
    },
  },
  args: {
    label: 'Recent events',
    data: [
      { event: 'WORKFLOW_START', ts: '2026-05-31T14:40:29.292Z' },
      { event: 'STEP_COMPLETE', ts: '2026-05-31T14:40:30.501Z', step: 'validate' },
      { event: 'STEP_COMPLETE', ts: '2026-05-31T14:40:31.901Z', step: 'ship' },
      { event: 'WORKFLOW_COMPLETE', ts: '2026-05-31T14:40:32.118Z' },
    ],
  },
};

export const ScalarRoot: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with a scalar value at the root.',
      },
    },
  },
  args: {
    label: 'Single value',
    data: 'just a plain string',
  },
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView in its empty state.',
      },
    },
  },
  args: {
    label: 'Empty payload',
    data: {},
    emptyText: 'No payload returned by the server.',
  },
};

export const Envelope: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView wrapped in its default envelope.',
      },
    },
  },
  args: {
    label: 'Typed envelope',
    data: {
      created_at: { type: 'datetime', value: '2026-05-31T14:40:29.292Z' },
      retries: { type: 'int', value: 3 },
      success: { type: 'bool', value: true },
      tags: { type: 'list<string>', value: ['urgent', 'cs-bob'] },
    },
  },
};

export const CustomEnvelope: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with a custom envelope wrapper.',
      },
    },
  },
  args: {
    label: 'Custom envelope keys',
    envelope: { typeKey: '__t', valueKey: '__v' },
    data: {
      id: { __t: 'uuid', __v: 'c45e2fd2-1f70-4b6e-bb1c-9a8e9b7f88aa' },
      amount: { __t: 'decimal', __v: '149.99' },
      currency: { __t: 'string', __v: 'EUR' },
    },
  },
};

export const Intent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView at a specific intent.',
      },
    },
  },
  args: {
    intent: 'success',
    label: 'Run finished — success intent on the panel',
    data: { result: 'COMPLETE', duration_ms: 2826 },
  },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with flat={false} so the elevated look is applied.',
      },
    },
  },
  args: {
    label: 'Non-flat panel — tags inherit the border treatment',
    flat: false,
    data: sampleOrder,
  },
};

export const CustomKeyColor: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with a custom color applied to keys.',
      },
    },
  },
  args: {
    label: 'Key chips in a custom colour',
    data: sampleOrder,
    keyColor: '#9c6ade',
    keyIntent: null,
  },
};

const SIZES = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 16 }}>
      {SIZES.map((size) => (
        <ReqoreDataView
          {...args}
          key={size}
          size={size}
          label={`size = "${size}"`}
        />
      ))}
    </div>
  ),
  args: {
    data: sampleOrder,
    collapsibleRoot: false,
    defaultExpandDepth: 10,
  },
};

// ---- Long-content regression stories (Chromatic) -----------------------
//
// These stories cover the layout edge cases that regressed in early
// iterations: a long string value overflowing its column, a long key
// chip blowing past the key column, and the combination of the two in
// a single payload. They're authored as visual stories — open them in
// Chromatic to confirm both keys AND values wrap cleanly inside their
// row instead of overflowing horizontally.

// A realistic HL7-ish pipe-delimited payload — exactly the shape that
// triggered the original overflow bug.
const HL7_PAYLOAD =
  'MSH|^~\\&|VW-DEVICE|VITALSIM|EHR|HOSPITAL|2026-05-31 14:40:29.292347 Sun +02:00 (CEST)||ORU^R01|MSG-17669ff5-ce8f-4bd0-9903-4d207e193b83|P|2.5\rOBR|1|REQ-1005||VW-VITALS-FILL-1005|VW_PRESSURE_PANEL^VitalWear pressure panel^L OBX|1|NM|VW_SKIN_TEMP^Skin temperature^L|1|36.7|Cel|36.0-37.5|N|||F';

export const MultilineValue: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with a multiline text payload in a bounded, scrollable monospace data block.',
      },
    },
  },
  args: {
    label: 'Multiline value',
    description:
      'Single-line scalar values remain compact chips; multiline payloads preserve whitespace in a bounded data block.',
    collapsibleRoot: false,
    data: {
      message_id: 'MSG-17669ff5-ce8f-4bd0-9903-4d207e193b83',
      payload_hash: 'sha256:5d0fce3e2ba8eb29df90a93fd35aa68e2eb0aa3ed5f',
      payload: HL7_PAYLOAD,
    },
  },
};

export const LongKey: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with an unusually long key.',
      },
    },
  },
  args: {
    label: 'Long key',
    description:
      'A key longer than the key column wraps inside its chip and never shoves the value off-screen.',
    collapsibleRoot: false,
    data: {
      patient_ref: 'PAT-1005',
      device_id: 'DEV-VW-1005',
      normalized_observation_count: 2,
      validated_against_local_terminology_dictionary: true,
      escalated_to_downstream_clinical_decision_support: false,
    },
  },
};

export const MixedLongContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with a mixed set of short and long content to prove wrapping is stable.',
      },
    },
  },
  args: {
    label: 'Mixed long keys + long values',
    description:
      'Both columns under pressure — keys *and* values wrap inside their chips, rows stay on one horizontal line per pair.',
    collapsibleRoot: false,
    defaultExpandDepth: 10,
    data: {
      message_control_id: 'VW-DEADLETTER-001-2079074b-0000-4eee-8b48-f9e3f4b1c2d8',
      payload: HL7_PAYLOAD,
      normalized_observation_count: 2,
      downstream_processor_dispatcher_pipeline_route:
        'cs:vital-signs/router/v2/dispatch?priority=high&ack=hl7-v2.5&tenant=eu-west-prod-eks-2',
      observations: [
        {
          observation_id: 'OBS-024c8401-f649-4c82-b52f-7fc60853de3a',
          message_id: 'MSG-17669ff5-ce8f-4bd0-9903-4d207e193b83',
          message_control_id: 'VW-DEADLETTER-001-2079074b',
          local_code: 'VW_SKIN_TEMP',
          display: 'Skin temperature reading from VitalWear pressure panel',
        },
      ],
    },
  },
};

export const InNarrowContainer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView inside a narrow container.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: 300, border: '1px dashed rgba(255,255,255,0.2)', padding: 8 }}>
      <ReqoreDataView {...args} />
    </div>
  ),
  args: {
    label: 'Narrow container (300px)',
    description:
      'Constrained by the parent — exercises the column shrink + wrap path. Keys and values both wrap inside their chips so neither overflows the row, and rows stay side-by-side. (A CSS @container query for stack-on-narrow was attempted but currently does not survive styled-components 5.x / stylis 3.x — JS-driven stacking is on the follow-up list.)',
    collapsibleRoot: false,
    defaultExpandDepth: 10,
    data: {
      patient_ref: 'PAT-1005',
      normalized_observation_count: 2,
      payload: HL7_PAYLOAD,
    },
  },
};

export const WidthComparison: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView at two widths side by side for comparison.',
      },
    },
  },
  render: (args) => (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 16 }}>
      {[260, 360, 480, 720].map((width) => (
        <div
          key={width}
          style={{
            width,
            border: '1px dashed rgba(255,255,255,0.2)',
            padding: 8,
          }}
        >
          <ReqoreDataView {...args} label={`Container ${width}px`} />
        </div>
      ))}
    </div>
  ),
  args: {
    collapsibleRoot: false,
    defaultExpandDepth: 10,
    data: {
      patient_ref: 'PAT-1005',
      observation_count: 2,
      payload: HL7_PAYLOAD,
      observations: [
        {
          observation_id: 'OBS-024c8401',
          local_code: 'VW_SKIN_TEMP',
          value: 36.7,
        },
      ],
    },
  },
};

export const InteractionToggle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with an interaction toggle exercised.',
      },
    },
  },
  args: {
    label: 'Interaction',
    data: sampleOrder,
    defaultExpandDepth: 0,
  },
  play: async ({ canvasElement }) => {
    await _testsWaitForText('Object · 8 fields');
    const summary = canvasElement.querySelector('summary');
    if (summary) fireEvent.click(summary);
    await _testsWaitForText('workflow_instanceid');
    await expect(canvasElement.querySelectorAll('.reqore-data-view-row').length).toBeGreaterThan(0);
  },
};

/* ===========================================================
 * Editable mode — click-to-edit JSON Schema builder primitives
 * ===========================================================
 *
 * Every editable story below uses a tiny harness so the DataView
 * stays fully controlled: the harness keeps the latest tree in
 * `useState`, and every commit (value edit, key rename, row
 * delete, add property / item) lands via `onDataChange(next)` then
 * re-enters via `data`.
 *
 * The UX vocabulary the stories exercise:
 *   - **Click a value chip** → swaps to an input, focused.
 *     **Enter / blur** commits, **Esc** reverts.
 *   - **Click a key chip** → same shape, but for the property name.
 *     Duplicate keys are refused.
 *   - **Hover a row** → reveals a danger-intent delete button on
 *     the right.
 *   - **Add property / Add item** lives at the bottom of every
 *     object / array; click → expands into an inline form (key +
 *     type picker) → submit → appends. The type picker supports
 *     **string / number / boolean / object (hash) / array (list) /
 *     null**.
 *
 *  This is the structural primitive layer. A schema-aware mode
 *  (JSON Schema type picker per property, required toggles, enum
 *  editor, $ref resolution) ships on top of these primitives —
 *  see `.tasks/EDITABLE_DATAVIEW.md`.
 */

const OPENAPI_PET_SCHEMA = {
  type: 'object',
  description: 'A pet for sale in the pet store.',
  required: ['id', 'name'],
  properties: {
    id: {
      type: 'integer',
      format: 'int64',
      description: 'Unique pet identifier (read-only).',
      example: 10,
    },
    name: {
      type: 'string',
      description: 'Pet display name.',
      example: 'doggie',
    },
    category: {
      type: 'object',
      description: 'Owning category — referenced from /categories.',
      properties: {
        id: { type: 'integer', format: 'int64' },
        name: { type: 'string', example: 'Dogs' },
      },
    },
    photoUrls: {
      type: 'array',
      description: 'Public photo URLs.',
      items: { type: 'string', format: 'uri' },
    },
    status: {
      type: 'string',
      description: 'Pet availability — drives the storefront filter.',
      enum: ['available', 'pending', 'sold'],
    },
  },
};

const EditableHarness = (args: IReqoreDataViewProps) => {
  const [tree, setTree] = useState<unknown>(args.data ?? {});
  return (
    <ReqoreDataView
      {...args}
      data={tree}
      editable
      onDataChange={(next) => {
        setTree(next);
        args.onDataChange?.(next);
      }}
    />
  );
};

/**
 * Realistic OpenAPI / JSON Schema fragment with nested objects, an
 * array of strings (`photoUrls`), and an `enum` array. Demonstrates
 * that the editor handles **complex, deeply nested shapes**, not just
 * a flat key-value record.
 *
 * Try in the storybook:
 *  - Click `pet for sale in the pet store.` to rewrite the
 *    `description`.
 *  - Click `doggie` to rename the pet's example.
 *  - Hover the `name` row to expose the delete button.
 *  - Click the `properties` key to rename it.
 *  - Use `+ Add property` at the bottom of any object level to add a
 *    new field. The type picker creates strings, numbers, booleans,
 *    objects (hashes), arrays (lists), or null.
 */
export const EditableOpenApiSchema: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView editing an OpenAPI schema.',
      },
    },
  },
  args: {
    label: 'OpenAPI 3 — components.schemas.Pet',
    icon: 'CodeLine',
    data: OPENAPI_PET_SCHEMA,
    defaultExpandDepth: 99,
    collapsibleRoot: false,
  },
  render: (args) => <EditableHarness {...args} />,
};

/**
 * Click-to-edit interaction — start by displaying the chip, click
 * to switch to an input, edit, commit on Enter, observe the new
 * value rendered as a chip again.
 */
export const ClickToEditScalar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView and edits a scalar value via click-to-edit.',
      },
    },
  },
  args: {
    label: 'Click to edit a scalar',
    icon: 'CursorLine',
    data: { display_name: 'Customer', retries: 3, is_public: false },
    defaultExpandDepth: 99,
    collapsibleRoot: false,
    onDataChange: fn(),
  },
  render: (args) => <EditableHarness {...args} />,
  play: async ({ canvasElement, args }) => {
    await _testsWaitForText('display_name');

    const rows = Array.from(
      canvasElement.querySelectorAll('.reqore-data-view-row')
    );
    const row = rows.find(
      (r) => r.querySelector('.reqore-data-view-key')?.textContent === 'display_name'
    )!;

    // Step 1: chip is visible, no input yet.
    await expect(
      row.querySelector('input.reqore-data-view-edit')
    ).toBeNull();
    await expect(row.querySelector('.reqore-data-view-value')).toBeTruthy();

    // Step 2: click the value chip → input appears.
    const chip = row.querySelector('.reqore-data-view-value') as HTMLElement;
    fireEvent.click(chip);
    const input = row.querySelector(
      'input.reqore-data-view-edit'
    ) as HTMLInputElement;
    await expect(input).toBeTruthy();

    // Step 3: edit + commit on Enter.
    fireEvent.change(input, { target: { value: 'Customer v2' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await expect(args.onDataChange).toHaveBeenCalled();
    const last = (args.onDataChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as
      | Record<string, unknown>
      | undefined;
    await expect(last?.display_name).toBe('Customer v2');
  },
};

/**
 * Build a JSON schema from scratch. The tree starts as an empty
 * object — only the `+ Add property` affordance is visible. The
 * play function expands the form, types a key (`type`), picks the
 * `String` type, commits, and observes the new property in the
 * tree.
 */
export const BuildFromEmptyHash: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView built from an empty hash to prove the initial-empty path.',
      },
    },
  },
  args: {
    label: 'Build from {} — Add property → fill out the form',
    icon: 'AddBoxLine',
    data: {},
    defaultExpandDepth: 99,
    collapsibleRoot: false,
    onDataChange: fn(),
  },
  render: (args) => <EditableHarness {...args} />,
  play: async ({ canvasElement, args }) => {
    await _testsWaitForText('Add property');

    // Click the trailing "Add property" button → form expands.
    const addRow = canvasElement.querySelector(
      '.reqore-data-view-add-row'
    ) as HTMLElement;
    const trigger = addRow.querySelector('button') as HTMLElement;
    fireEvent.click(trigger);

    // The expanded form has a key input + a type picker + commit /
    // cancel buttons. We type a key + submit (default type =
    // string).
    const keyInput = addRow.querySelector(
      'input.reqore-data-view-add-key'
    ) as HTMLInputElement;
    await expect(keyInput).toBeTruthy();
    fireEvent.change(keyInput, { target: { value: 'type' } });
    const commit = addRow.querySelector(
      '.reqore-data-view-add-commit'
    ) as HTMLElement;
    fireEvent.click(commit);

    // The tree now carries `type: ''` — string defaults to empty.
    const last = (args.onDataChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as
      | Record<string, unknown>
      | undefined;
    await expect(last).toEqual({ type: '' });
  },
};

/**
 * Array editing — start with a populated `enum`-style array, add a
 * new item, delete an existing one. Shows the per-row delete +
 * trailing `+ Add item` affordance.
 */
export const EditableArrayOps: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView exercising the editable array operations (add, edit, remove).',
      },
    },
  },
  args: {
    label: 'Array ops — pet status enum',
    icon: 'ListUnordered',
    data: { status_enum: ['available', 'pending', 'sold'] },
    defaultExpandDepth: 99,
    collapsibleRoot: false,
    onDataChange: fn(),
  },
  render: (args) => <EditableHarness {...args} />,
  play: async ({ canvasElement, args }) => {
    await _testsWaitForText('status_enum');

    // The array renders three items. In editable mode the inline
    // chip-row shortcut is off, so each item gets its own row.
    const arrayItems = canvasElement.querySelectorAll(
      '.reqore-data-view-array-item'
    );
    await expect(arrayItems.length).toBe(3);

    // Delete the second item (`pending`). Hover-reveal the action
    // group; click the delete button.
    const secondRow = arrayItems[1] as HTMLElement;
    const deleteButton = secondRow.querySelector(
      '.reqore-data-view-row-delete'
    ) as HTMLElement;
    await expect(deleteButton).toBeTruthy();
    fireEvent.click(deleteButton);

    const afterDelete = (args.onDataChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as
      | Record<string, unknown>
      | undefined;
    await expect(afterDelete?.status_enum).toEqual(['available', 'sold']);
  },
};

/**
 * Switch the type of a value as part of editing it. Click the value
 * chip to enter edit mode — the control group renders as
 * `[input] [type ▾] [✓ Save] [✗ Cancel]`. The type picker shows the
 * value's CURRENT kind and offers all six (string / number / boolean
 * / object (hash) / array (list) / null). Picking a new kind
 * coerces the current DRAFT (not the original value), so a user who
 * has just typed `42` and realises the property should be a number
 * keeps the `42` they typed — they don't lose their work.
 *
 * Coercion rules:
 *   - string → number  → parse; falls back to 0 on a non-numeric source.
 *   - string → boolean → 'true' / '1' / 'yes' → true; else false.
 *   - any    → object  → replaces the scalar with `{}`.
 *   - any    → array   → replaces the scalar with `[]`.
 *
 * Picking `string` or `number` keeps the cell in edit mode (the
 * input type swaps to match the new kind, draft preserved). Picking
 * `boolean` / `object` / `array` / `null` commits + exits so the
 * right control takes over (checkbox / structural view / "—" chip).
 *
 * Row actions stay purely structural — only `delete` lives in the
 * hover-revealed group; type-change is per-edit by design.
 */
export const EditableTypeChange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView with an editable type change.',
      },
    },
  },
  args: {
    label: 'Switch the type of an existing row',
    icon: 'Repeat2Line',
    data: { retries: '5', is_public: 'true', payload: 'inline' },
    defaultExpandDepth: 99,
    collapsibleRoot: false,
    onDataChange: fn(),
  },
  render: (args) => <EditableHarness {...args} />,
};

/**
 * Click-to-rename a key. Demonstrates that the key tag flips to an
 * input on click, commits on Enter, and refuses duplicate keys.
 */
export const EditableKeyRename: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders DataView and renames a key inline.',
      },
    },
  },
  args: {
    label: 'Rename a property key in place',
    icon: 'EditBoxLine',
    data: { display_name: 'Customer', retries: 3 },
    defaultExpandDepth: 99,
    collapsibleRoot: false,
    onDataChange: fn(),
  },
  render: (args) => <EditableHarness {...args} />,
  play: async ({ canvasElement, args }) => {
    await _testsWaitForText('display_name');

    const rows = Array.from(
      canvasElement.querySelectorAll('.reqore-data-view-row')
    );
    const row = rows.find(
      (r) => r.querySelector('.reqore-data-view-key')?.textContent === 'display_name'
    )!;

    // Click key chip → input appears.
    const keyChip = row.querySelector('.reqore-data-view-key') as HTMLElement;
    fireEvent.click(keyChip);
    const keyInput = row.querySelector(
      'input.reqore-data-view-key-edit'
    ) as HTMLInputElement;
    await expect(keyInput).toBeTruthy();

    // Rename + Enter commits.
    fireEvent.change(keyInput, { target: { value: 'label' } });
    fireEvent.keyDown(keyInput, { key: 'Enter' });

    const last = (args.onDataChange as ReturnType<typeof fn>).mock.calls.at(-1)?.[0] as
      | Record<string, unknown>
      | undefined;
    await expect(Object.keys(last ?? {})).toEqual(['label', 'retries']);
    await expect(last?.label).toBe('Customer');
  },
};
