import { expect, fireEvent } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
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
  args: {
    data: sampleOrder,
  },
};

export const FlatRoot: Story = {
  args: {
    data: sampleOrder,
    collapsibleRoot: false,
    label: 'Flat root',
  },
};

export const WithTypeChips: Story = {
  args: {
    data: sampleOrder,
    showTypes: true,
    label: 'With type chips',
  },
};

export const ExpandedByDefault: Story = {
  args: {
    data: sampleOrder,
    defaultExpandDepth: 99,
    label: 'Expanded',
  },
};

export const ArrayRoot: Story = {
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
  args: {
    label: 'Single value',
    data: 'just a plain string',
  },
};

export const Empty: Story = {
  args: {
    label: 'Empty payload',
    data: {},
    emptyText: 'No payload returned by the server.',
  },
};

export const Envelope: Story = {
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
  args: {
    intent: 'success',
    label: 'Run finished — success intent on the panel',
    data: { result: 'COMPLETE', duration_ms: 2826 },
  },
};

export const NotFlat: Story = {
  args: {
    label: 'Non-flat panel — tags inherit the border treatment',
    flat: false,
    data: sampleOrder,
  },
};

export const CustomKeyColor: Story = {
  args: {
    label: 'Key chips in a custom colour',
    data: sampleOrder,
    keyColor: '#9c6ade',
    keyIntent: null,
  },
};

const SIZES = ['tiny', 'small', 'normal', 'big', 'huge'] as const;

export const Sizes: Story = {
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

export const LongStringValue: Story = {
  args: {
    label: 'Long string value',
    description:
      'A scalar that does not fit in a single line — wraps inside the chip rather than overflowing horizontally.',
    collapsibleRoot: false,
    data: {
      message_id: 'MSG-17669ff5-ce8f-4bd0-9903-4d207e193b83',
      payload_hash: 'sha256:5d0fce3e2ba8eb29df90a93fd35aa68e2eb0aa3ed5f',
      payload: HL7_PAYLOAD,
    },
  },
};

export const LongKey: Story = {
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
