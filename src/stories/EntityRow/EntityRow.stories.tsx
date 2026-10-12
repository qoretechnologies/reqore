import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fireEvent, fn, userEvent, waitFor } from 'storybook/test';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreEntityRow, { IReqoreEntityRowProps } from '../../components/EntityRow';
import { ReqoreP } from '../../components/Paragraph';
import { TOUCH_TARGET_PX, TSizes } from '../../constants/sizes';
import { StoryMeta } from '../utils';
import { expectControlsInside } from '../utils/controlsInside';
import {
  expectRowActionsMenuClosed,
  expectRowActionsMenuItems,
  openRowActionsMenuItems,
  rowActionsMenuButtons,
} from '../utils/rowActionsMenu';
import { PHONE_STORY, withTouchScreen } from '../utils/touchScreen';

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

/* A narrow row's actions (qorus#646), as ReqoreSeverityRow's and a narrow table's. The row measures its
   OWN container - not the viewport, because the case this exists for is a narrow drawer / sidebar / split
   panel on a wide screen - and below 480px of it, two or more actions are one menu button at the end of
   the label's line: the label keeps the row's width, and a list of rows does not grow by a line per
   action. An action that is itself a menu becomes a submenu there. */

const onRun = fn();
const onShowInChat = fn();
const onEntityRowClick = fn();

const ORDER_ACTIONS: IReqoreEntityRowProps['actions'] = [
  { label: 'Run', icon: 'PlayLine', compact: true, size: 'small', onClick: onRun },
  {
    icon: 'More2Line',
    tooltip: 'More actions',
    minimal: true,
    flat: true,
    compact: true,
    size: 'small',
    actions: [
      { label: 'Show in chat', icon: 'Chat1Line', onClick: onShowInChat },
      { label: 'Copy name', icon: 'FileCopyLine' },
    ],
  },
];

const OrderRow = ({ clickable }: { clickable?: boolean }) => (
  <ReqoreEntityRow
    label='Process Incoming Order · order-intake-workflow'
    description='Last run 4m ago · 1,204 executions today'
    metadata='workflow'
    icon='GitBranchLine'
    fluid
    onClick={clickable ? onEntityRowClick : undefined}
    actions={ORDER_ACTIONS}
  />
);

/** The row in `root`, once its own observer has found it narrow. */
const narrowEntityRow = async (root: ParentNode) =>
  (await waitFor(() => {
    const row = root.querySelector('.reqore-entity-row') as HTMLElement;
    expect(row?.getAttribute('data-narrow')).toBe('true');
    return row;
  })) as HTMLElement;

/** One menu button at the end of the label's line, inside the row, where the actions were. */
const expectEntityActionsFolded = async (row: HTMLElement) => {
  await waitFor(() => expect(row.getAttribute('data-actions')).toBe('menu'));
  await waitFor(() => {
    expect(row.querySelectorAll('.reqore-entity-row-actions .reqore-button')).toHaveLength(1);
    const [button] = rowActionsMenuButtons(row);
    const label = (row.querySelector('.reqore-entity-row-label') as HTMLElement).getBoundingClientRect();
    const box = button.getBoundingClientRect();
    // on the label's line, after it
    expect(box.top).toBeLessThan(label.bottom);
    expect(box.left).toBeGreaterThanOrEqual(label.right - 0.5);
  });
  await expectControlsInside(row);
};

export const NarrowContainerActionsMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders the same row in a 720px container, Run and the More actions menu side by side as always, and in a 400px one, where they are one menu button at the end of the label's line. Clicked, the menu names Run and More actions with their icons, More actions holding Show in chat and Copy name; Escape puts it away with the focus on the button, and Run chosen runs and closes it without opening the row.",
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <div className='wide-row-box' style={{ width: 720, maxWidth: '100%' }}>
        <OrderRow />
      </div>
      <div className='narrow-row-box' style={{ width: 400, maxWidth: '100%' }}>
        <OrderRow clickable />
      </div>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    [onRun, onShowInChat, onEntityRowClick].forEach((spy) => spy.mockClear());
    const wide = (await waitFor(() => {
      const row = canvasElement.querySelector('.wide-row-box .reqore-entity-row') as HTMLElement;
      expect(row).toBeTruthy();
      return row;
    })) as HTMLElement;
    const narrow = await narrowEntityRow(canvasElement.querySelector('.narrow-row-box')!);

    // wide: the actions as they always were
    expect(wide.getAttribute('data-narrow')).toBeNull();
    expect(wide.querySelectorAll('.reqore-entity-row-actions > .reqore-button')).toHaveLength(2);
    expect(rowActionsMenuButtons(wide)).toHaveLength(0);

    await expectEntityActionsFolded(narrow);
    const [button] = rowActionsMenuButtons(narrow);
    expect(button).toHaveAttribute('aria-label', 'Actions');

    // the keyboard: Enter opens it, Escape puts it away, the focus stays on the button
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expectRowActionsMenuItems(['Run', 'More actions']);
    await userEvent.keyboard('{Escape}');
    await expectRowActionsMenuClosed();
    expect(document.activeElement).toBe(button);

    await userEvent.click(button);
    await expectRowActionsMenuItems(['Run', 'More actions']);
    await userEvent.click(openRowActionsMenuItems()[0]);
    await waitFor(() => expect(onRun).toHaveBeenCalledTimes(1));
    await expectRowActionsMenuClosed();
    expect(onEntityRowClick).not.toHaveBeenCalled();
    await userEvent.unhover(button);
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

/* A connection row in a card on a phone: three actions, the last an icon whose tooltip is its name. By
   default they are one menu button; a row whose actions are what it is there for keeps them in sight with
   `narrowActions='stack'` - under the label, one to a line, each the row's width with its label whole
   (kept on one line that does not wrap, they reached past the row). */

const onTestConnection = fn();
const onOpenSettings = fn();
const onRemove = fn();

const NarrowConnectionRow = ({ narrowActions }: Pick<IReqoreEntityRowProps, 'narrowActions'>) => (
  <div style={{ width: 320, maxWidth: '100%' }}>
    <ReqoreEntityRow
      label='orders-db · PostgreSQL'
      description='Last checked 2 minutes ago · 14 ms'
      fluid
      narrowActions={narrowActions}
      onClick={onEntityRowClick}
      actions={[
        { label: 'Test the connection', intent: 'info', icon: 'PulseLine', onClick: onTestConnection },
        { label: 'Open its settings', icon: 'Settings3Line', onClick: onOpenSettings },
        {
          icon: 'DeleteBinLine',
          tooltip: 'Remove',
          intent: 'danger',
          minimal: true,
          onClick: onRemove,
        },
      ]}
    />
  </div>
);

const clearConnectionSpies = () =>
  [onTestConnection, onOpenSettings, onRemove, onEntityRowClick].forEach((spy) => spy.mockClear());

export const NarrowContainerActionsMenuOnATouchScreen: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "Renders a connection row with three actions in a 320px card on a phone (390 px): they are one menu button at the end of the label's line. On a touch screen the button is a finger's size (44px each way); a tap opens the menu - Test the connection, Open its settings and Remove (the icon's tooltip), each with its icon and a finger's height - and a tap on Remove runs it and closes the menu without opening the row.",
      },
    },
  },
  render: () => <NarrowConnectionRow />,
  play: async ({ canvasElement }) => {
    clearConnectionSpies();
    await withTouchScreen(async (touch) => {
      const row = await narrowEntityRow(canvasElement);
      await expectEntityActionsFolded(row);
      const [button] = rowActionsMenuButtons(row);
      if (touch.real) {
        await waitFor(() => {
          const box = button.getBoundingClientRect();
          expect(box.width).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          expect(box.height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
        });
      }

      await touch.tap(button);
      await expectRowActionsMenuItems(['Test the connection', 'Open its settings', 'Remove']);
      if (touch.real) {
        await waitFor(() => {
          for (const item of openRowActionsMenuItems()) {
            expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          }
        });
      }
      await touch.tap(openRowActionsMenuItems()[2]);
      await waitFor(() => expect(onRemove).toHaveBeenCalledTimes(1));
      await expectRowActionsMenuClosed();
      expect(onTestConnection).not.toHaveBeenCalled();
      expect(onOpenSettings).not.toHaveBeenCalled();
      expect(onEntityRowClick).not.toHaveBeenCalled();

      if (touch.narrowed) {
        await waitFor(() =>
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1)
        );
      }
    });
  },
};

const stackedEntityActions = (row: HTMLElement) =>
  Array.from(row.querySelectorAll<HTMLElement>('.reqore-entity-row-actions > .reqore-button'));

const expectEntityActionsStacked = async (canvasElement: HTMLElement) => {
  const row = await narrowEntityRow(canvasElement);
  expect(row.getAttribute('data-actions')).toBeNull();
  expect(rowActionsMenuButtons(row)).toHaveLength(0);
  await expectControlsInside(row);
  await waitFor(() => {
    const boxes = stackedEntityActions(row).map((button) => button.getBoundingClientRect());
    expect(boxes).toHaveLength(3);
    // one to a line, each the row's width
    boxes.slice(1).forEach((box, index) => {
      expect(box.top).toBeGreaterThanOrEqual(boxes[index].bottom - 0.5);
      expect(Math.abs(box.width - boxes[0].width)).toBeLessThan(1);
    });
  });
  // the icon-only Remove reads its tooltip as its label
  expect(row.querySelector('.reqore-entity-row-actions')?.textContent).toContain('Remove');
  return row;
};

export const NarrowContainerActionsStack: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a row with three actions kept in sight (`narrowActions='stack'`) in a 320px container, as a card on a phone: they stack under the label, one to a line, each the row's width, the labels whole and the Remove icon labelled with its tooltip; none reaches past the row.",
      },
    },
  },
  render: () => <NarrowConnectionRow narrowActions='stack' />,
  play: async ({ canvasElement }) => {
    await expectEntityActionsStacked(canvasElement);
  },
};

export const NarrowContainerActionsStackOnTouch: Story = {
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "The same stacked row on a phone with a finger (390 px): on a touch screen each action is a finger's height (44px), and a tap on Open its settings runs it without opening the row.",
      },
    },
  },
  render: () => <NarrowConnectionRow narrowActions='stack' />,
  play: async ({ canvasElement }) => {
    clearConnectionSpies();
    await withTouchScreen(async (touch) => {
      const row = await expectEntityActionsStacked(canvasElement);
      if (touch.real) {
        await waitFor(() => {
          for (const button of stackedEntityActions(row)) {
            expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          }
        });
      }
      await touch.tap(stackedEntityActions(row)[1]);
      await waitFor(() => expect(onOpenSettings).toHaveBeenCalledTimes(1));
      expect(onEntityRowClick).not.toHaveBeenCalled();
    });
  },
};
