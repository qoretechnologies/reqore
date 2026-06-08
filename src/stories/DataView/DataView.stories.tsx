import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
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
  title: 'Collections/DataView/Stories',
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
