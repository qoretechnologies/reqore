import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fireEvent, fn, userEvent, waitFor } from 'storybook/test';
import ReqoreControlGroup from '../../components/ControlGroup';
import ReqoreSeverityRow, { IReqoreSeverityRowProps } from '../../components/SeverityRow';
import ReqoreTag from '../../components/Tag';
import { TOUCH_TARGET_PX, TSizes } from '../../constants/sizes';
import { StoryMeta } from '../utils';
import { expectControlsInside } from '../utils/controlsInside';
import {
  expectRowActionsMenuClosed,
  expectRowActionsMenuItems,
  openRowActionsMenuItems,
  rowActionsMenuButtons,
} from '../utils/rowActionsMenu';
import { expectEqualBoxesEqualRows, expectRowsFillTheirBoxes, StoryRowBox } from '../utils/rowBoxes';
import { PHONE_STORY, withTouchScreen } from '../utils/touchScreen';
import { withViewport } from '../utils/viewport';

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
    /* No snapshot: the point is that the caret and the row toggle one disclosure
       WITHOUT cancelling each other out, which only exists across a sequence of
       clicks. A still frame of the end state carries none of it — the play test
       and __tests__/SeverityRow.test.tsx do. */
    qlip: { skip: true },
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

/* A narrow row's actions (qorus#646). A row measures its OWN container - a severity row in a 320px drawer
   on a 1920px screen is as narrow as one on a phone - and below 640px of it, its actions stack under the
   label, one to a line, each the row's width: a severity row is a callout, and its buttons are the response
   it asks for, so they stay in sight. A list of rows that should not grow by a line per action folds them
   into one menu button at the end of the label's line with `narrowActions='menu'`, as a narrow table does. */

const onInvestigate = fn();
const onDismiss = fn();
const onRowClick = fn();
const clearRowSpies = () => [onInvestigate, onDismiss, onRowClick].forEach((spy) => spy.mockClear());

const INCIDENT_ACTIONS: IReqoreSeverityRowProps['actions'] = [
  {
    label: 'Investigate',
    icon: 'SearchEyeLine',
    intent: 'danger',
    compact: true,
    size: 'small',
    onClick: onInvestigate,
  },
  {
    icon: 'CloseLine',
    tooltip: 'Dismiss',
    minimal: true,
    flat: true,
    compact: true,
    size: 'small',
    onClick: onDismiss,
  },
];

// One element for every render: the row is memoized.
const CRITICAL_TAG = <ReqoreTag size='tiny' intent='danger' label='Critical' />;

const IncidentRow = ({
  clickable,
  narrowActions = 'menu',
}: {
  clickable?: boolean;
  narrowActions?: IReqoreSeverityRowProps['narrowActions'] | null;
}) => (
  <ReqoreSeverityRow
    // `null`: the row's own default
    {...(narrowActions ? { narrowActions } : {})}
    label='Payment Processing · stripe-webhook-receiver'
    description='Avg duration 4.7s exceeded 3.5s threshold · just now'
    intent='danger'
    leading={CRITICAL_TAG}
    fluid
    onClick={clickable ? onRowClick : undefined}
    actions={INCIDENT_ACTIONS}
  />
);

/** The row in `root`, once its own observer has found it narrow. */
const narrowRow = async (root: ParentNode) =>
  (await waitFor(() => {
    const row = root.querySelector('.reqore-severity-row') as HTMLElement;
    expect(row?.getAttribute('data-narrow')).toBe('true');
    return row;
  })) as HTMLElement;

/** One menu button at the end of the label's line, inside the row, where the actions were. */
const expectActionsFolded = async (row: HTMLElement) => {
  await waitFor(() => expect(row.getAttribute('data-actions')).toBe('menu'));
  await waitFor(() => {
    expect(row.querySelectorAll('.reqore-severity-row-actions .reqore-button')).toHaveLength(1);
    const [button] = rowActionsMenuButtons(row);
    const label = (row.querySelector('.reqore-severity-row-label') as HTMLElement).getBoundingClientRect();
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
          "Renders the same row (`narrowActions='menu'`) in two framed containers of different widths, each named above it: in the 720px one its Investigate and Dismiss sit side by side as always; in the 400px one they are one menu button at the end of the label's line. Each row fills its frame exactly. Clicked, the menu names Investigate and Dismiss (the icon's tooltip) with their icons; Escape puts it away with the focus on the button, and Dismiss chosen runs and closes it without opening the row.",
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <StoryRowBox
        className='wide-row-box'
        width={720}
        caption='A 720px container: the actions side by side'
      >
        <IncidentRow />
      </StoryRowBox>
      <StoryRowBox
        className='narrow-row-box'
        width={400}
        caption='A 400px container: the actions in one menu'
      >
        <IncidentRow clickable />
      </StoryRowBox>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    clearRowSpies();
    const wide = (await waitFor(() => {
      const row = canvasElement.querySelector('.wide-row-box .reqore-severity-row') as HTMLElement;
      expect(row).toBeTruthy();
      return row;
    })) as HTMLElement;
    const narrow = await narrowRow(canvasElement.querySelector('.narrow-row-box')!);
    // the two rows differ in width because their containers do, and each says which it is
    expect(canvasElement.querySelectorAll('.story-row-box-caption')).toHaveLength(2);
    expectRowsFillTheirBoxes(canvasElement, '.reqore-severity-row');

    // wide: the actions as they always were
    expect(wide.getAttribute('data-narrow')).toBeNull();
    expect(wide.querySelectorAll('.reqore-severity-row-actions .reqore-button')).toHaveLength(2);
    expect(rowActionsMenuButtons(wide)).toHaveLength(0);

    await expectActionsFolded(narrow);
    const [button] = rowActionsMenuButtons(narrow);
    expect(button).toHaveAttribute('aria-label', 'Actions');

    // the keyboard: Enter opens it, Escape puts it away, the focus stays on the button
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expectRowActionsMenuItems(['Investigate', 'Dismiss']);
    await userEvent.keyboard('{Escape}');
    await expectRowActionsMenuClosed();
    expect(document.activeElement).toBe(button);

    await userEvent.click(button);
    await expectRowActionsMenuItems(['Investigate', 'Dismiss']);
    await userEvent.click(openRowActionsMenuItems()[1]);
    await waitFor(() => expect(onDismiss).toHaveBeenCalledTimes(1));
    await expectRowActionsMenuClosed();
    expect(onInvestigate).not.toHaveBeenCalled();
    expect(onRowClick).not.toHaveBeenCalled();
    await userEvent.unhover(button);
  },
};

/** The rows of a narrow list, each different: as many actions as a menu takes, one action, stacked, none, a long name. */
const EQUAL_BOX_ROWS: Array<Pick<IReqoreSeverityRowProps, 'label' | 'actions' | 'narrowActions'>> = [
  { label: 'Payment Processing · stripe-webhook-receiver', actions: INCIDENT_ACTIONS, narrowActions: 'menu' },
  { label: 'Order sync lagging', actions: INCIDENT_ACTIONS.slice(0, 1) },
  // stacked: the default
  { label: 'Inventory feed stale', actions: INCIDENT_ACTIONS },
  { label: 'Nightly export finished late' },
  {
    label: 'payment-processing-stripe-webhook-receiver-production-eu-west-1 restarted',
    actions: INCIDENT_ACTIONS,
    narrowActions: 'menu',
  },
];

const MAJOR_TAG = <ReqoreTag size='tiny' intent='warning' label='Major' />;

const EqualBoxRows = () => (
  <ReqoreControlGroup vertical gapSize='big'>
    {EQUAL_BOX_ROWS.map((row, index) => (
      <StoryRowBox key={index} width={400} caption='A 400px container'>
        <ReqoreSeverityRow
          description='Avg duration 4.7s exceeded 3.5s threshold · just now'
          intent='warning'
          leading={MAJOR_TAG}
          {...row}
        />
      </StoryRowBox>
    ))}
  </ReqoreControlGroup>
);

export const NarrowRowsInEqualContainersAreEqual: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders five narrow rows, each in its own framed 400px container: two actions in one menu (`narrowActions=\'menu\'`), one action, two actions stacked (the default), no actions, and a long unbroken name. Each row fills its frame, so all five are the same width; at a phone\'s width (390px) the frames narrow together and the rows stay equal.',
      },
    },
  },
  render: () => <EqualBoxRows />,
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-severity-row[data-narrow="true"]')).toHaveLength(
        EQUAL_BOX_ROWS.length
      )
    );
    expectRowsFillTheirBoxes(canvasElement, '.reqore-severity-row');
    expectEqualBoxesEqualRows(canvasElement, '.reqore-severity-row');
    await withViewport(390, 844, async (narrowed) => {
      if (narrowed) {
        await waitFor(() => {
          expectRowsFillTheirBoxes(canvasElement, '.reqore-severity-row');
          expectEqualBoxesEqualRows(canvasElement, '.reqore-severity-row');
        });
      }
    });
  },
};

export const NarrowContainerActionsMenuOnATouchScreen: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "Renders the row (`narrowActions='menu'`) in a card on a phone (390 px): its actions are one menu button at the end of the label's line. On a touch screen the button is a finger's size (44px each way); a tap opens the menu, its rows a finger's height, and a tap on Investigate runs it and closes the menu without opening the row. Nothing reaches past the screen.",
      },
    },
  },
  render: () => (
    <div className='phone-card' style={{ padding: '0 16px', maxWidth: 390, boxSizing: 'border-box' }}>
      <IncidentRow clickable />
    </div>
  ),
  play: async ({ canvasElement }) => {
    clearRowSpies();
    await withTouchScreen(async (touch) => {
      const row = await narrowRow(canvasElement);
      await expectActionsFolded(row);
      const [button] = rowActionsMenuButtons(row);
      if (touch.real) {
        await waitFor(() => {
          const box = button.getBoundingClientRect();
          expect(box.width).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          expect(box.height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
        });
      }

      await touch.tap(button);
      await expectRowActionsMenuItems(['Investigate', 'Dismiss']);
      if (touch.real) {
        await waitFor(() => {
          for (const item of openRowActionsMenuItems()) {
            expect(item.getBoundingClientRect().height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          }
        });
      }
      await touch.tap(openRowActionsMenuItems()[0]);
      await waitFor(() => expect(onInvestigate).toHaveBeenCalledTimes(1));
      await expectRowActionsMenuClosed();
      expect(onDismiss).not.toHaveBeenCalled();
      expect(onRowClick).not.toHaveBeenCalled();

      if (touch.narrowed) {
        await waitFor(() =>
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth + 1)
        );
      }
    });
  },
};

/**
 * A concrete narrow-container use case: a "sidebar of incidents". Same rows
 * a dashboard shows at full width, but the sidebar container is narrow, so
 * each row's actions fold into one menu button and the incident text keeps
 * the row's width.
 */
export const NarrowSidebarList: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a list of SeverityRows (`narrowActions='menu'`) inside a 320px sidebar container. Every row's Open and Dismiss are one menu button at the end of its label's line, so each row is as tall as its text — regardless of how wide the surrounding viewport is — because the row keys on the sidebar's width, not the window's. The second row's menu names Open and Dismiss.",
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
            narrowActions='menu'
            actions={[
              {
                label: 'Open',
                icon: 'ExternalLinkLine',
                compact: true,
                size: 'small',
                intent: row.intent,
              },
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
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll('.reqore-severity-row[data-narrow="true"][data-actions="menu"]')
          .length
      ).toBe(3)
    );
    for (const row of Array.from(canvasElement.querySelectorAll<HTMLElement>('.reqore-severity-row'))) {
      await expectActionsFolded(row);
    }
    const second = rowActionsMenuButtons(canvasElement)[1];
    await userEvent.click(second);
    // the icon-only Dismiss is named by its tooltip, as a finger gets no tooltip
    await expectRowActionsMenuItems(['Open', 'Dismiss']);
    await userEvent.keyboard('{Escape}');
    await expectRowActionsMenuClosed();
    await userEvent.unhover(second);
  },
};

/* A callout's actions (qorus#646): on a phone, a row in a card is narrower than the screen, and its
   actions stayed on one line that does not wrap - "See your subscription" and "Try again" reached past
   the card. Those two are what the row is there for, so a menu would hide its point: with
   `narrowActions='stack'` they stack under the label, one to a line, each the row's width with its label
   whole, and a finger gets a target it can hit. */

const onSeeSubscription = fn();
const onTryAgain = fn();

const ALLOWANCE_ACTIONS: IReqoreSeverityRowProps['actions'] = [
  {
    label: 'See your subscription',
    intent: 'info',
    icon: 'ExternalLinkLine',
    onClick: onSeeSubscription,
  },
  { label: 'Try again', icon: 'RefreshLine', onClick: onTryAgain },
];

const AllowanceRow = () => (
  <div className='narrow-row-box' style={{ width: 320, maxWidth: '100%' }}>
    <ReqoreSeverityRow
      label="This month's AI allowance is used up"
      description='The design stopped at its last step. It can go on when the allowance renews, or now with a larger plan.'
      intent='warning'
      fluid
      // no `narrowActions`: a severity row stacks its actions by default
      actions={ALLOWANCE_ACTIONS}
    />
  </div>
);

const stackedActions = (row: HTMLElement) =>
  Array.from(row.querySelectorAll<HTMLElement>('.reqore-severity-row-actions > .reqore-button'));

/** The row's actions, stacked one to a line, each the width of the others and inside the row, labels whole. */
const expectActionsStacked = async (canvasElement: HTMLElement) => {
  const row = await narrowRow(canvasElement);
  expect(row.getAttribute('data-actions')).toBeNull();
  expect(rowActionsMenuButtons(row)).toHaveLength(0);
  await expectControlsInside(row);
  await waitFor(() => {
    const [first, second] = stackedActions(row).map((button) => button.getBoundingClientRect());
    // one to a line
    expect(second.top).toBeGreaterThanOrEqual(first.bottom - 0.5);
    // each the row's width
    expect(Math.abs(first.width - second.width)).toBeLessThan(1);
  });
  // each label whole, not cut
  for (const label of Array.from(
    row.querySelectorAll<HTMLElement>('.reqore-severity-row-actions .reqore-button-text-content')
  )) {
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
  }
  return row;
};

export const NarrowContainerActionsStack: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a callout row whose two labelled actions are what it is there for, in a 320px container, as a card on a phone, with no `narrowActions` set: by default its actions stack under the label, one to a line, each the row's width with its label whole, and none reaches past the row.",
      },
    },
  },
  render: () => <AllowanceRow />,
  play: async ({ canvasElement }) => {
    await expectActionsStacked(canvasElement);
  },
};

export const NarrowContainerActionsStackOnTouch: Story = {
  tags: ['touch'],
  globals: PHONE_STORY.globals,
  parameters: {
    ...PHONE_STORY.parameters,
    docs: {
      description: {
        story:
          "The same callout on a phone with a finger (390 px): the stacked actions are a finger's height (44px) on a touch screen, and a tap on Try again runs it.",
      },
    },
  },
  render: () => <AllowanceRow />,
  play: async ({ canvasElement }) => {
    onTryAgain.mockClear();
    onSeeSubscription.mockClear();
    await withTouchScreen(async (touch) => {
      const row = await expectActionsStacked(canvasElement);
      if (touch.real) {
        await waitFor(() => {
          for (const button of stackedActions(row)) {
            expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(TOUCH_TARGET_PX);
          }
        });
      }
      await touch.tap(stackedActions(row)[1]);
      await waitFor(() => expect(onTryAgain).toHaveBeenCalledTimes(1));
      expect(onSeeSubscription).not.toHaveBeenCalled();
    });
  },
};
