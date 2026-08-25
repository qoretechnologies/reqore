import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreSeverityRow, { IReqoreSeverityRowProps } from '../../components/SeverityRow';
import ReqoreTag from '../../components/Tag';
import { TSizes } from '../../constants/sizes';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Severity Row',
  component: ReqoreSeverityRow,
} as StoryMeta<typeof ReqoreSeverityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in its default configuration.',
      },
    },
  },
  args: {
    label: 'Payment Processing · stripe-webhook-receiver',
    description: 'Avg duration 4.7s exceeded 3.5s threshold · just now',
    intent: 'danger',
    leading: <ReqoreTag size='tiny' intent='danger' label='Critical' />,
    actions: [
      { label: 'Investigate', intent: 'danger' },
      { icon: 'CloseLine', tooltip: 'Dismiss', minimal: true, flat: true },
    ],
  },
};

export const WithBadge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a badge.',
      },
    },
  },
  args: {
    label: 'Payment Processing',
    description: 'Three open detector flags from the last summary cycle',
    intent: 'danger',
    badge: [3, { label: 'mad', intent: 'danger', minimal: true }],
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
};

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreSeverityRow
        {...args}
        intent='danger'
        label='Critical · Stripe webhook'
        description='Avg duration 4.7s exceeded 3.5s threshold'
        leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
        actions={[{ label: 'Investigate', intent: 'danger' }]}
      />
      <ReqoreSeverityRow
        {...args}
        intent='warning'
        label='Warning · Reconcile payments'
        description='Error count 3.8 over 168-period baseline'
        leading={<ReqoreTag size='tiny' intent='warning' label='Warning' />}
        actions={[{ label: 'Investigate', intent: 'warning' }]}
      />
      <ReqoreSeverityRow
        {...args}
        intent='info'
        label='Info · Detector recalibrated'
        description='Seasonal model refit after 168-cycle window'
        leading={<ReqoreTag size='tiny' intent='info' label='Info' />}
      />
      <ReqoreSeverityRow
        {...args}
        intent='success'
        label='Resolved · Order processing'
        description='Issue cleared automatically 2 hours ago'
        leading={<ReqoreTag size='tiny' intent='success' label='Resolved' />}
      />
    </ReqoreControlGroup>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreSeverityRow
        size='tiny'
        intent='danger'
        label='Tiny row'
        description='Compact summary line'
      />
      <ReqoreSeverityRow
        size='small'
        intent='danger'
        label='Small row'
        description='Compact summary line'
      />
      <ReqoreSeverityRow
        size='normal'
        intent='danger'
        label='Normal row'
        description='Compact summary line'
      />
      <ReqoreSeverityRow
        size='big'
        intent='danger'
        label='Big row'
        description='Compact summary line'
      />
    </ReqoreControlGroup>
  ),
};

export const Bordered: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a border applied.',
      },
    },
  },
  args: {
    label: 'Bordered row',
    description: 'flat={false} renders an intent-coloured border',
    intent: 'warning',
    flat: false,
    leading: <ReqoreTag size='tiny' intent='warning' label='Warning' />,
  },
};

export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in square (chip) mode — a fixed-size slot with no horizontal padding.',
      },
    },
  },
  args: {
    label: 'Square row',
    description: 'rounded={false} removes the corner radius',
    intent: 'info',
    rounded: false,
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const WithEffects: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a set of visual effects applied to different items.',
      },
    },
  },
  args: {
    label: 'Effects on label and description',
    description: 'Description with custom effect',
    intent: 'info',
    labelEffect: { weight: 'bold', uppercase: true, spaced: 1 },
    descriptionEffect: { italic: true, opacity: 0.8 },
    effect: {
      gradient: {
        colors: { 0: 'info:darken:5', 100: 'transparent' },
        direction: 'to right',
      },
    },
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in a clickable variant so hover and press states are exercised.',
      },
    },
  },
  args: {
    label: 'Customer Support · zendesk-ticket-sync',
    description: 'Avg duration scored 3.2 (threshold 3.0)',
    intent: 'warning',
    onClick: () => alert('Row clicked'),
    leading: <ReqoreTag size='tiny' intent='warning' label='Warning' />,
  },
};

/**
 * The disclosure shape every consumer builds by hand: the whole row toggles a
 * body, and a caret on the right toggles the same state. Before the actions
 * stopped propagating, clicking the caret ran BOTH handlers, the two toggles
 * cancelled, and the caret looked dead while the row worked — so the branch
 * with the affordance was the branch nothing tested.
 */
const DisclosureRow = ({ actions, ...rest }: IReqoreSeverityRowProps) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((previous) => !previous);

  return (
    <div style={{ width: '100%' }}>
      <ReqoreSeverityRow
        {...rest}
        onClick={toggle}
        actions={[
          {
            icon: expanded ? 'ArrowUpSLine' : 'ArrowDownSLine',
            tooltip: expanded ? 'Collapse' : 'Expand',
            minimal: true,
            flat: true,
            className: 'disclosure-caret',
            onClick: toggle,
          },
        ]}
      />
      {expanded && (
        <div className='disclosure-body' style={{ padding: '8px 12px', opacity: 0.7 }}>
          Bound to :::7443 · TLS · listener 10
        </div>
      )}
    </div>
  );
};

export const ActionTogglesDisclosure: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a row whose caret action and row body toggle the same disclosure. The caret opens the body, clicking the row closes it again, and the caret leaves it open.',
      },
    },
  },
  args: {
    label: 'svc-qorus-saas-10',
    description: 'listening on ipv6[::]:7443 (dedicated)',
    intent: 'info',
    showStrip: true,
    size: 'small',
  },
  render: (args) => <DisclosureRow {...args} />,
  play: async ({ canvasElement }) => {
    const caret = () => canvasElement.querySelector('.disclosure-caret')!;
    const body = () => canvasElement.querySelector('.disclosure-body');

    // The caret opens it. This is the assertion the fix exists for: the click
    // used to run the action AND the row, and two toggles left the row exactly
    // as it was.
    fireEvent.click(caret());
    await waitFor(() => expect(body()).toBeTruthy());

    // The row still closes it — stopping propagation must not cost the row
    // its own click.
    fireEvent.click(canvasElement.querySelector('.reqore-severity-row-body')!);
    await waitFor(() => expect(body()).toBeFalsy());

    // Left open so the snapshot carries the expanded state; a frame of the
    // collapsed row proves nothing about the affordance under test.
    fireEvent.click(caret());
    await waitFor(() => expect(body()).toBeTruthy());
  },
};

export const NoStrip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow without the strip decoration.',
      },
    },
  },
  args: {
    label: 'Customer Onboarding · onboard-new-customer',
    description: 'No issues — operating within baseline',
    intent: 'success',
    showStrip: false,
    leading: <ReqoreTag size='tiny' intent='success' label='Healthy' />,
  },
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a transparent background.',
      },
    },
  },
  args: {
    label: 'Inventory Management · stock-sync',
    description: 'Operating normally — strip only, no tinted background',
    intent: 'info',
    transparent: true,
    leading: <ReqoreTag size='tiny' intent='info' label='Info' />,
  },
};

export const NoWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with content forced onto a single line.',
      },
    },
  },
  args: {
    label: 'Payment Processing · stripe-webhook-receiver-fallback',
    description:
      'Avg duration 4.7s exceeded 3.5s threshold over the 14-period rolling baseline measured by the mad detector · just now',
    intent: 'danger',
    wrap: false,
    leading: <ReqoreTag size='tiny' intent='danger' label='Critical' />,
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow in its disabled state.',
      },
    },
  },
  args: {
    label: 'Disabled row',
    description: 'No actions allowed',
    intent: 'warning',
    disabled: true,
    leading: <ReqoreTag size='tiny' intent='warning' label='Disabled' />,
    actions: [{ label: 'Investigate' }],
  },
};

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with the raised effect.',
      },
    },
  },
  args: {
    label: 'Raised severity row',
    description:
      'Subtle inset highlight on top + inset shadow on bottom — best paired with `flat={true}` (default).',
    intent: 'danger',
    raised: true,
    leading: <ReqoreTag size='tiny' intent='danger' label='Critical' />,
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
};

const SEVERITY_ROW_SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderSeverityRowMatrix = (variantArgs: Partial<IReqoreSeverityRowProps>) =>
  SEVERITY_ROW_SIZES.map((size) => (
    <ReqoreSeverityRow
      key={size}
      label={`size=${size}`}
      description='Threshold exceeded · just now'
      intent='danger'
      leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
      size={size}
      {...variantArgs}
    />
  ));

export const Unpadded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with no padding.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderSeverityRowMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with padding only on the horizontal axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderSeverityRowMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with padding only on the vertical axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderSeverityRowMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const CustomPaddingSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders SeverityRow with a custom padding size.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {SEVERITY_ROW_SIZES.map((size) => (
        <ReqoreSeverityRow
          key={size}
          label={`size=${size}, paddingSize='small'`}
          description='Padding scales independently from text scale'
          intent='danger'
          leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
          size={size}
          paddingSize='small'
        />
      ))}
    </ReqoreControlGroup>
  ),
};

/**
 * The row responds to the width of its OWN container, not the viewport — a
 * SeverityRow sitting in a 320px drawer on a 1920px display still has to
 * wrap its actions under the label. The container query fires below ~640px
 * of container width; above it the actions sit next to the label as usual.
 */
export const NarrowContainerActionsWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders the same row twice, once in a 720px container (actions sit to the right of the label, as they always have) and once in a 400px container (actions wrap into their own row underneath the label, without any viewport / media-query involvement). This is the responsive behaviour every SeverityRow needs — a drawer / sidebar / split-panel host can be narrow on any screen size, so the row keys its layout off `container-type: inline-size` rather than the window width. Below the row of KPI cards the fade-scroller uses, this is the second place in the library where a component's own container width drives its layout.",
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <div style={{ width: 720, maxWidth: '100%' }}>
        <ReqoreSeverityRow
          label='Payment Processing · stripe-webhook-receiver'
          description='Avg duration 4.7s exceeded 3.5s threshold · just now'
          intent='danger'
          leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
          fluid
          actions={[
            { label: 'Investigate', intent: 'danger', compact: true, size: 'small' },
            {
              icon: 'CloseLine',
              tooltip: 'Dismiss',
              minimal: true,
              flat: true,
              compact: true,
              size: 'small',
            },
          ]}
        />
      </div>
      <div style={{ width: 400, maxWidth: '100%' }}>
        <ReqoreSeverityRow
          label='Payment Processing · stripe-webhook-receiver'
          description='Avg duration 4.7s exceeded 3.5s threshold · just now'
          intent='danger'
          leading={<ReqoreTag size='tiny' intent='danger' label='Critical' />}
          fluid
          actions={[
            { label: 'Investigate', intent: 'danger', compact: true, size: 'small' },
            {
              icon: 'CloseLine',
              tooltip: 'Dismiss',
              minimal: true,
              flat: true,
              compact: true,
              size: 'small',
            },
          ]}
        />
      </div>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    const containers = canvasElement.querySelectorAll('.reqore-severity-row-container');
    await waitFor(() => expect(containers.length).toBe(2));

    const rows = canvasElement.querySelectorAll('.reqore-severity-row');
    await waitFor(() => expect(rows.length).toBe(2));

    const [wideContainer, narrowContainer] = Array.from(containers) as HTMLElement[];
    const [wide, narrow] = Array.from(rows) as HTMLElement[];

    // The narrow layout is stamped on the row as `data-narrow` by its own
    // ResizeObserver, which the browser runs AFTER layout — so nothing about
    // the grid can be read synchronously here. Settle on that attribute
    // first; everything below then describes a layout that has finished
    // happening rather than one that is still on its way.
    await waitFor(() => expect(narrow.getAttribute('data-narrow')).toBe('true'));

    // Debug: log container measurements + container-type/name so a failure
    // tells us WHY it failed (container-type not applied? container-name
    // missing? width computed wrong? @container rule not emitted?).
    const wideContainerStyle = getComputedStyle(wideContainer);
    const narrowContainerStyle = getComputedStyle(narrowContainer);
    // eslint-disable-next-line no-console
    console.log(
      '[SeverityRow container-query debug]',
      JSON.stringify(
        {
          wide: {
            containerWidth: wideContainer.getBoundingClientRect().width,
            containerType: wideContainerStyle.containerType,
            containerName: wideContainerStyle.containerName,
            rowGridTemplateColumns: getComputedStyle(wide).gridTemplateColumns,
          },
          narrow: {
            containerWidth: narrowContainer.getBoundingClientRect().width,
            containerType: narrowContainerStyle.containerType,
            containerName: narrowContainerStyle.containerName,
            rowGridTemplateColumns: getComputedStyle(narrow).gridTemplateColumns,
          },
        },
        null,
        2
      )
    );

    // Re-read the computed style inside `waitFor`. Capturing the track count
    // into a const first and then `await expect(count)` asserts on a number
    // that was already frozen — there is nothing left to retry, so a read
    // that landed before the observer ran failed permanently. That is what
    // made this story fail on roughly one run in two, and why it only ever
    // showed up when something else on the page shifted the timing.
    await waitFor(() =>
      expect(getComputedStyle(wide).gridTemplateColumns.split(/\s+/).length).toBe(3)
    );
    await waitFor(() =>
      expect(getComputedStyle(narrow).gridTemplateColumns.split(/\s+/).length).toBe(2)
    );

    // Query inside `waitFor` rather than capturing the node first — a capture
    // that ran before the element mounted can never resolve on a retry.
    await waitFor(() => {
      const narrowActions = narrow.querySelector('.reqore-severity-row-actions') as HTMLElement;
      expect(narrowActions).toBeTruthy();
      expect(getComputedStyle(narrowActions).gridRowStart).toBe('2');
    });
  },
};

/**
 * A concrete narrow-container use case: a "sidebar of incidents". Same rows
 * a dashboard shows at full width, but the sidebar container is narrow —
 * the container query moves the actions under the label so the sidebar
 * never squeezes the incident text into a one-character caterpillar.
 */
export const NarrowSidebarList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a list of SeverityRows inside a 320px sidebar container. Every row's actions wrap under its label — regardless of how wide the surrounding viewport is — because the container query keys on the sidebar's width, not the window's.",
      },
    },
  },
  render: () => (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <ReqoreControlGroup vertical gapSize='small' fluid>
        {[
          {
            label: 'Payment Processing · stripe-webhook-receiver',
            description: 'Avg duration 4.7s exceeded 3.5s threshold · just now',
            intent: 'danger' as const,
            leadingLabel: 'Critical',
          },
          {
            label: 'Order fulfillment · warehouse-sync',
            description: 'Retry rate 12% over the last hour',
            intent: 'warning' as const,
            leadingLabel: 'High',
          },
          {
            label: 'Invoice export · billing-adapter',
            description: 'Recovered on its own · 6 minutes ago',
            intent: 'success' as const,
            leadingLabel: 'Cleared',
          },
        ].map((row, idx) => (
          <ReqoreSeverityRow
            key={idx}
            label={row.label}
            description={row.description}
            intent={row.intent}
            leading={<ReqoreTag size='tiny' intent={row.intent} label={row.leadingLabel} />}
            fluid
            actions={[
              { label: 'Open', compact: true, size: 'small', intent: row.intent },
              {
                icon: 'CloseLine',
                tooltip: 'Dismiss',
                minimal: true,
                flat: true,
                compact: true,
                size: 'small',
              },
            ]}
          />
        ))}
      </ReqoreControlGroup>
    </div>
  ),
};
