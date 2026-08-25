import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreEntityRow, { IReqoreEntityRowProps } from '../../components/EntityRow';
import { ReqoreP } from '../../components/Paragraph';
import { TSizes } from '../../constants/sizes';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Entity Row',
  component: ReqoreEntityRow,
} as StoryMeta<typeof ReqoreEntityRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow in its default configuration.',
      },
    },
  },
  args: {
    label: 'Process Incoming Order',
    description: 'Routes incoming Shopify orders into the warehouse pipeline',
    metadata: 'Last run: success · just now · 384ms',
    icon: 'PlayCircleLine',
    actions: [{ label: 'Run', icon: 'PlayLine' }],
  },
};

export const WithBadge: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with a badge.',
      },
    },
  },
  args: {
    label: 'Reconcile Payments',
    description: 'Daily reconciliation between Stripe and the ledger',
    metadata: 'Last run: failed · 1.5s',
    icon: 'ErrorWarningLine',
    intent: 'danger',
    badge: { label: 'Failed', intent: 'danger' },
    actions: [{ label: 'Investigate', intent: 'danger' }],
  },
};

export const WithMultipleBadges: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with multiple badges.',
      },
    },
  },
  args: {
    label: 'Process Incoming Order',
    description: 'Routes incoming Shopify orders into the warehouse pipeline',
    metadata: 'Last run: success · just now',
    icon: 'PlayCircleLine',
    intent: 'success',
    badge: [
      { label: 'v2', minimal: true },
      { label: 'on-demand', intent: 'info', minimal: true },
    ],
    actions: [{ label: 'Run', icon: 'PlayLine' }],
  },
};

export const WithIntents: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow across a set of intents.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      <ReqoreEntityRow
        {...args}
        label='Process Incoming Order'
        description='Routes Shopify orders to warehouse'
        metadata='Last run: success · just now'
        icon='CheckLine'
        intent='success'
        actions={[{ label: 'Run', icon: 'PlayLine' }]}
      />
      <ReqoreEntityRow
        {...args}
        label='Reconcile Payments'
        description='Daily reconciliation between Stripe and the ledger'
        metadata='Last run: failed · 1.5s'
        icon='ErrorWarningLine'
        intent='danger'
        badge={{ label: 'Failed', intent: 'danger' }}
        actions={[{ label: 'Investigate', intent: 'danger' }]}
      />
      <ReqoreEntityRow
        {...args}
        label='Onboard New Customer'
        description='Creates downstream accounts and welcome email'
        metadata='Last run: success · 2 hours ago'
        icon='UserAddLine'
        intent='info'
        actions={[{ label: 'Run', icon: 'PlayLine' }]}
      />
    </ReqoreControlGroup>
  ),
};

export const WithImage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with an image asset.',
      },
    },
  },
  args: {
    label: 'Stripe payment integration',
    description: 'OAuth2 connected · Last sync 5 minutes ago',
    iconImage: 'https://stripe.com/img/v3/home/social.png',
    actions: [{ label: 'Manage' }],
  },
};

export const WithoutIcon: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow without an icon.',
      },
    },
  },
  args: {
    label: 'Plain row, no icon tile',
    description: 'Useful for very compact lists where the entity speaks for itself',
    metadata: 'just now',
    actions: [{ icon: 'ArrowRightSLine', minimal: true, flat: true }],
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EntityRow at every size (tiny through huge) so the size scale is visible side by side.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {(['tiny', 'small', 'normal', 'big'] as const).map((size) => (
        <ReqoreEntityRow
          key={size}
          size={size}
          label={`${size[0].toUpperCase()}${size.slice(1)} entity row`}
          description='Description scales with size'
          metadata='Metadata scales too'
          icon='SettingsLine'
          intent='info'
          actions={[{ label: 'Open' }]}
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const Bordered: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with a border applied.',
      },
    },
  },
  args: {
    label: 'Bordered entity row',
    description: 'flat={false} renders an intent-coloured border',
    metadata: 'just now',
    icon: 'SettingsLine',
    intent: 'info',
    flat: false,
  },
};

export const Square: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders EntityRow in square (chip) mode — a fixed-size slot with no horizontal padding.',
      },
    },
  },
  args: {
    label: 'Square entity row',
    description: 'rounded={false} removes the corner radius',
    metadata: 'just now',
    icon: 'SettingsLine',
    intent: 'success',
    rounded: false,
  },
};

export const WithEffects: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with a set of visual effects applied to different items.',
      },
    },
  },
  args: {
    label: 'Effects on label, description, metadata',
    description: 'Description with custom italic effect',
    metadata: 'Metadata with custom uppercase effect',
    icon: 'SparklingLine',
    intent: 'info',
    labelEffect: { weight: 'bold', uppercase: true, spaced: 1 },
    descriptionEffect: { italic: true, opacity: 0.8 },
    metadataEffect: { uppercase: true, spaced: 2, opacity: 0.6 },
    effect: {
      gradient: {
        colors: { 0: 'info:darken:5', 100: 'transparent' },
        direction: 'to right',
      },
    },
  },
};

export const Clickable: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow in a clickable variant so hover and press states are exercised.',
      },
    },
  },
  args: {
    label: 'Inventory Reorder Trigger',
    description: 'Watches stock thresholds and fires reorder workflows',
    metadata: 'Last run: success · 16 hours ago',
    icon: 'StackLine',
    onClick: () => alert('Row clicked'),
    actions: [{ icon: 'ArrowRightSLine', minimal: true, flat: true }],
  },
};

export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow in its disabled state.',
      },
    },
  },
  args: {
    label: 'Archived integration',
    description: 'This automation has been archived',
    icon: 'ArchiveLine',
    disabled: true,
    actions: [{ label: 'Restore' }],
  },
};

export const NoWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same long content in the same 360px column, with `wrap` off and on, because the truncation only makes sense next to the thing it is opting out of. `wrap` defaults to **true**: description and metadata flow onto as many lines as they need, which is what the second row shows. Passing `wrap={false}` trades that for a fixed row height and an ellipsis — right for a dense list where every row must be the same height, wrong when the text is the point. Nothing else has to change to get the wrapped version; it is the default.',
      },
    },
  },
  render: () => (
    <div style={{ width: 360 }}>
      <ReqoreControlGroup vertical gapSize='big'>
        <ReqoreP size='small'>wrap={'{false}'} — one line each, ellipsis</ReqoreP>
        <ReqoreEntityRow
          label='Process Incoming Order'
          description='Routes incoming Shopify orders into the warehouse pipeline with full validation against the SKU registry'
          metadata='Last run: success · just now · 384ms · attempt 1 of 3'
          icon='PlayCircleLine'
          intent='success'
          wrap={false}
          actions={[{ label: 'Run', icon: 'PlayLine' }]}
        />
        <ReqoreP size='small'>wrap (default) — flows onto as many lines as it needs</ReqoreP>
        <ReqoreEntityRow
          label='Process Incoming Order'
          description='Routes incoming Shopify orders into the warehouse pipeline with full validation against the SKU registry'
          metadata='Last run: success · just now · 384ms · attempt 1 of 3'
          icon='PlayCircleLine'
          intent='success'
          actions={[{ label: 'Run', icon: 'PlayLine' }]}
        />
      </ReqoreControlGroup>
    </div>
  ),
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with a transparent background.',
      },
    },
  },
  args: {
    label: 'Transparent entity row',
    description:
      'Even with intent set, the background stays transparent — the icon tile is hidden by default so the bare icon does not sit on a tinted square that fights transparency.',
    icon: 'SettingsLine',
    intent: 'info',
    transparent: true,
    actions: [{ label: 'Open' }],
  },
};

export const TransparentWithIconTile: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow in the transparent variant with an icon tile.',
      },
    },
  },
  args: {
    label: 'Transparent with explicit tile',
    description: 'Pass `iconHasBackground` to force the tile back even on a transparent row.',
    icon: 'SettingsLine',
    intent: 'info',
    transparent: true,
    iconHasBackground: true,
    actions: [{ label: 'Open' }],
  },
};

export const Raised: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with the raised effect.',
      },
    },
  },
  args: {
    label: 'Raised entity row',
    description: 'Inset top highlight + bottom shadow give the surface tactile depth.',
    metadata: 'Last run: success · just now',
    icon: 'PlayCircleLine',
    intent: 'success',
    raised: true,
    actions: [{ label: 'Run', icon: 'PlayLine' }],
  },
};

const ENTITY_ROW_SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

const renderEntityRowMatrix = (variantArgs: Partial<IReqoreEntityRowProps>) =>
  ENTITY_ROW_SIZES.map((size) => (
    <ReqoreEntityRow
      key={size}
      label={`size=${size}`}
      description='Compact summary line'
      metadata='Last run: success · just now'
      icon='PlayCircleLine'
      size={size}
      {...variantArgs}
    />
  ));

export const IconWithoutBackground: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with an icon rendered without a background.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderEntityRowMatrix({ iconHasBackground: false })}
    </ReqoreControlGroup>
  ),
};

export const Unpadded: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with no padding.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderEntityRowMatrix({ padded: false })}
    </ReqoreControlGroup>
  ),
};

export const PaddedHorizontalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with padding only on the horizontal axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderEntityRowMatrix({ padded: 'horizontal' })}
    </ReqoreControlGroup>
  ),
};

export const PaddedVerticalOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with padding only on the vertical axis.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {renderEntityRowMatrix({ padded: 'vertical' })}
    </ReqoreControlGroup>
  ),
};

export const CustomPaddingSize: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with a custom padding size.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' style={{ width: 600 }}>
      {ENTITY_ROW_SIZES.map((size) => (
        <ReqoreEntityRow
          key={size}
          label={`size=${size}, paddingSize='small'`}
          description='Padding scales independently from text/icon size'
          icon='PlayCircleLine'
          size={size}
          paddingSize='small'
        />
      ))}
    </ReqoreControlGroup>
  ),
};

/**
 * An action carrying `actions` becomes an overflow menu rather than a button — the
 * same contract as `ReqorePanel`'s actions. This is how a row gets a "three dots"
 * menu without the consumer hand-rolling a dropdown next to the row.
 *
 * The menu stops its own click, so a row that is itself clickable does not fire when
 * the menu is opened.
 */
export const WithOverflowMenu: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Renders EntityRow with the overflow menu enabled.',
      },
    },
  },
  args: {
    label: 'order-sync:1.0',
    description: 'Referenced in the ticket description',
    metadata: 'workflow',
    icon: 'GitBranchLine',
    actions: [
      { icon: 'ArrowRightUpLine', tooltip: 'Open' },
      {
        icon: 'More2Line',
        tooltip: 'More actions',
        actions: [
          { label: 'Show in chat', icon: 'Chat1Line' },
          { label: 'Copy name', icon: 'FileCopyLine' },
          { divider: true, line: true },
          { label: 'Remove reference', icon: 'DeleteBinLine', intent: 'danger' },
          // entries can be hidden without the consumer filtering the array itself
          { label: 'Never rendered', show: false },
        ],
      },
    ],
  },
};

/* The same row twice, at 720px and 400px. Below 480px the actions leave the
   right-hand column and take their own row under the label. */
const WrapDemoRow = () => (
  <ReqoreEntityRow
    label='Process Incoming Order · order-intake-workflow'
    description='Last run 4m ago · 1,204 executions today'
    metadata='workflow'
    icon='GitBranchLine'
    fluid
    actions={[
      { label: 'Run', icon: 'PlayLine', compact: true, size: 'small' },
      {
        icon: 'More2Line',
        tooltip: 'More',
        minimal: true,
        flat: true,
        compact: true,
        size: 'small',
      },
    ]}
  />
);

export const NarrowContainerActionsWrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same row in a 720px container (actions sit to the right of the label, as they always have) and a 400px one (actions wrap onto their own row under the label). The row measures its OWN container with a `ResizeObserver` and stamps `data-narrow` on itself — not a media query, because the case this exists for is a narrow drawer / sidebar / split panel on a wide screen, where the viewport is the wrong box to ask. The threshold is 480px, the Reqore mobile width, rather than the 640px `ReqoreSeverityRow` uses: that row fits a severity strip, a leading tag, a label and a description in before its actions, so it is out of room sooner. Wrapping should mean there was no room, not that the container was under some number.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <div style={{ width: 720, maxWidth: '100%' }}>
        <WrapDemoRow />
      </div>
      <div style={{ width: 400, maxWidth: '100%' }}>
        <WrapDemoRow />
      </div>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    /* Queried inside waitFor throughout: the attribute is stamped by a
       ResizeObserver, which the browser runs AFTER layout, so nothing here can
       be read synchronously. Settling on `data-narrow` first means every
       assertion below describes a layout that has finished happening. */
    const rows = await waitFor(() => {
      const found = canvasElement.querySelectorAll('.reqore-entity-row');
      expect(found.length).toBe(2);
      return Array.from(found) as HTMLElement[];
    });
    const [wide, narrow] = rows;

    await waitFor(() => expect(narrow.getAttribute('data-narrow')).toBe('true'));
    await expect(wide.getAttribute('data-narrow')).toBeNull();

    // Wide keeps its actions column; narrow drops it and gives them a row.
    await waitFor(() =>
      expect(getComputedStyle(wide).gridTemplateColumns.split(/\s+/).length).toBe(3)
    );
    await waitFor(() =>
      expect(getComputedStyle(narrow).gridTemplateColumns.split(/\s+/).length).toBe(2)
    );
    await waitFor(() => {
      const narrowActions = narrow.querySelector('.reqore-entity-row-actions') as HTMLElement;
      expect(narrowActions).toBeTruthy();
      expect(getComputedStyle(narrowActions).gridRowStart).toBe('2');
    });
  },
};

export const ActionDoesNotFireTheRow: Story = {
  parameters: {
    /* No snapshot: what this story demonstrates is what happens ACROSS two
       clicks, and a still frame of the counters afterwards tells a reviewer
       nothing. The behaviour is asserted by the play test below and by
       __tests__/EntityRow.test.tsx. */
    qlip: { skip: true },
    docs: {
      description: {
        story:
          'The row and its actions are both clickable, and a click on an action must not read as a click on the row. Both counters below are wired: pressing **Run** increments only the action, pressing the row itself increments only the row. Without the guard both fire, and an action that toggles what the row toggles cancels itself out — which is what made a disclosure caret look dead in the Qorus IDE. Applied even to an action with no handler of its own.',
      },
    },
  },
  render: () => {
    const [rowClicks, setRowClicks] = useState(0);
    const [actionClicks, setActionClicks] = useState(0);

    return (
      <div style={{ width: 560, maxWidth: '100%' }}>
        <ReqoreEntityRow
          label='Process Incoming Order'
          description='Click the row, then click Run — each counts once, and only once.'
          icon='GitBranchLine'
          fluid
          onClick={() => setRowClicks((count) => count + 1)}
          actions={[
            {
              label: 'Run',
              icon: 'PlayLine',
              compact: true,
              size: 'small',
              onClick: () => setActionClicks((count) => count + 1),
            },
            { label: 'Inert', compact: true, size: 'small' },
          ]}
        />
        <ReqoreP size='small' className='entity-row-click-readout' style={{ marginTop: 12 }}>
          row: <span data-row-clicks={rowClicks}>{rowClicks}</span> · action:{' '}
          <span data-action-clicks={actionClicks}>{actionClicks}</span>
        </ReqoreP>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const find = async <T extends HTMLElement>(selector: string): Promise<T> =>
      waitFor(() => {
        const node = canvasElement.querySelector(selector) as T | null;
        expect(node).toBeTruthy();
        return node as T;
      });

    const readout = await find<HTMLElement>('.entity-row-click-readout');
    const counts = () => ({
      row: readout.querySelector('[data-row-clicks]')!.getAttribute('data-row-clicks'),
      action: readout.querySelector('[data-action-clicks]')!.getAttribute('data-action-clicks'),
    });

    // The action runs, the row underneath it does not.
    fireEvent.click(await find<HTMLElement>('.reqore-entity-row-actions .reqore-button'));
    await waitFor(() => expect(counts()).toEqual({ row: '0', action: '1' }));

    // ...and the row still works on its own, so the guard has not simply
    // broken clicking altogether.
    fireEvent.click(await find<HTMLElement>('.reqore-entity-row-label'));
    await waitFor(() => expect(counts()).toEqual({ row: '1', action: '1' }));
  },
};
