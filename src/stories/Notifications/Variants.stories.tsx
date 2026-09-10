import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useState } from 'react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { IReqoreNotificationsPosition } from '../../components/Notifications';
import ReqoreNotification, {
  IReqoreNotificationProps,
  TReqoreNotificationVariant,
} from '../../components/Notifications/notification';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreEntityRow,
  ReqoreH3,
  ReqoreP,
  ReqorePanel,
  ReqoreSegmentedControl,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '../../index';
import { StoryMeta } from '../utils';

/*
 * The five looks a notification can take, side by side and in a mock app, so
 * the best one — or the best mix — can be picked. Every variant keeps the
 * app's surface neutral (except `filled`) and paints the intent on the icon
 * and the timer line, so a stack of mixed intents reads as one family.
 */
const meta = {
  title: 'Other/Notifications/Variants',
  component: ReqoreNotification,
} as StoryMeta<typeof ReqoreNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS: { variant: TReqoreNotificationVariant; name: string; borrows: string }[] = [
  {
    variant: 'card',
    name: 'Card',
    borrows: 'Sonner, Radix — a neutral card, the icon on a tinted tile, the timer along the bottom',
  },
  {
    variant: 'accent',
    name: 'Accent',
    borrows: 'Mantine — an intent bar down the left edge, a plain icon',
  },
  {
    variant: 'filled',
    name: 'Filled',
    borrows: 'Chakra — the whole surface in the intent; for the loud ones',
  },
  {
    variant: 'glass',
    name: 'Glass',
    borrows: 'iOS banners, Vercel — frosted, an intent bloom behind the icon, a faint ring',
  },
  {
    variant: 'compact',
    name: 'Compact',
    borrows: 'Material snackbar, Linear — one line, an inline action',
  },
];

type TSample = Partial<IReqoreNotificationProps> & { key: string; short?: string };

const SAMPLES: TSample[] = [
  {
    key: 'info',
    intent: 'info',
    title: 'Release ready',
    content: 'v3.2.0 was built and is waiting for approval.',
    short: 'v3.2.0 is waiting for approval',
    actions: [{ label: 'Review' }],
  },
  {
    key: 'success',
    intent: 'success',
    title: 'Deployed',
    content: 'order-sync went live on production twelve seconds ago.',
    short: 'order-sync is live',
    actions: [{ label: 'Open' }, { label: 'Dismiss' }],
  },
  {
    key: 'warning',
    intent: 'warning',
    title: 'Quota at 90%',
    content: 'Qog executions pause at the limit. Raise it, or trim the schedule.',
    short: 'Quota at 90%',
    actions: [{ label: 'Raise limit', icon: 'ArrowUpLine' }],
  },
  {
    key: 'danger',
    intent: 'danger',
    title: 'Connection lost',
    content: 'erp-oracle has been unreachable for four minutes. Retrying every 30 s.',
    short: 'erp-oracle is unreachable',
    actions: [{ label: 'Retry now', icon: 'RefreshLine' }, { label: 'Show log' }],
  },
  {
    key: 'pending',
    intent: 'pending',
    title: 'Importing schema',
    content: 'Reading 214 nodes from the OPC-UA server…',
    short: 'Importing 214 nodes…',
  },
  {
    key: 'plain',
    content: 'Copied to clipboard.',
    short: 'Copied to clipboard',
    actions: [{ label: 'Undo' }],
  },
];

const POSITIONS: IReqoreNotificationsPosition[] = [
  'TOP',
  'TOP RIGHT',
  'BOTTOM RIGHT',
  'BOTTOM',
  'BOTTOM LEFT',
  'TOP LEFT',
];

const sampleProps = (sample: TSample, variant: TReqoreNotificationVariant) => {
  const { key, short, ...props } = sample;

  return variant === 'compact'
    ? { ...props, title: undefined, content: short ?? props.content }
    : props;
};

const Column = ({ variant, name, borrows }: (typeof VARIANTS)[number]) => (
  <div
    style={{
      display: 'flex',
      flexFlow: 'column',
      gap: 12,
      width: variant === 'compact' ? 320 : 400,
      flex: '0 0 auto',
    }}
  >
    <div>
      <ReqoreH3>{name}</ReqoreH3>
      <ReqoreP size='small' effect={{ opacity: 0.7 }}>
        {borrows}
      </ReqoreP>
    </div>
    {SAMPLES.map((sample) => (
      <ReqoreNotification
        key={sample.key}
        variant={variant}
        duration={sample.key === 'pending' ? undefined : 90000}
        onClose={noop}
        onFinish={noop}
        {...sampleProps(sample, variant)}
      />
    ))}
  </div>
);

export const Gallery: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every variant in one place, each column running the same six notifications: the five intents with a title, a body, a close and one or two actions, plus a bare "Copied to clipboard" with an Undo. The timer line at the bottom drains over ninety seconds so it is visible without racing the reader. Compact rows drop the title and keep one line.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 28, padding: 12, overflowX: 'auto', alignItems: 'start' }}>
      {VARIANTS.map((column) => (
        <Column key={column.variant} {...column} />
      ))}
    </div>
  ),
  play: async () => {
    await waitFor(() => expect(document.body).toHaveTextContent('Connection lost'));

    for (const { variant } of VARIANTS) {
      expect(document.querySelectorAll(`.reqore-notification-${variant}`)).toHaveLength(
        SAMPLES.length
      );
    }

    // Every variant carries its close, and the timer line where there is a duration.
    expect(document.querySelectorAll('.reqore-notification-close')).toHaveLength(
      SAMPLES.length * VARIANTS.length
    );
    expect(document.querySelectorAll('.reqore-notification-card .reqore-notification-progress'))
      .toHaveLength(SAMPLES.length - 1);
  },
};

const MockPage = () => (
  <>
    <ReqorePanel label='Incoming orders' icon='ShoppingBag3Line' badge={4} fill>
      <ReqoreEntityRow
        label='Process Incoming Order'
        description='Routes incoming Shopify orders into the warehouse pipeline'
        metadata='Last run: success · just now · 384ms'
        icon='PlayCircleLine'
        actions={[{ label: 'Run', icon: 'PlayLine' }]}
      />
      <ReqoreVerticalSpacer height={8} />
      <ReqoreEntityRow
        label='Reconcile Payments'
        description='Daily reconciliation between Stripe and the ledger'
        metadata='Last run: failed · 1.5s'
        icon='ErrorWarningLine'
        intent='danger'
        badge={{ label: 'Failed', intent: 'danger' }}
        actions={[{ label: 'Investigate', intent: 'danger' }]}
      />
      <ReqoreVerticalSpacer height={8} />
      <ReqoreEntityRow
        label='Sync Inventory'
        description='Pushes stock levels to every storefront every ten minutes'
        metadata='Last run: success · 2 min ago · 1.1s'
        icon='RefreshLine'
        actions={[{ label: 'Run', icon: 'PlayLine' }]}
      />
      <ReqoreVerticalSpacer height={8} />
      <ReqoreEntityRow
        label='Nightly Exports'
        description='Ships the day’s orders to the data warehouse'
        metadata='Next run: 02:00'
        icon='TimeLine'
        actions={[{ label: 'Run', icon: 'PlayLine' }]}
      />
    </ReqorePanel>
  </>
);

const InAppPage = ({ initialVariant = 'glass' as TReqoreNotificationVariant }) => {
  const addNotification = useReqoreProperty('addNotification');
  const [variant, setVariant] = useState<TReqoreNotificationVariant>(initialVariant);
  const [position, setPosition] = useState<IReqoreNotificationsPosition>('TOP RIGHT');

  const fire = (sample: TSample) =>
    addNotification({
      ...sampleProps(sample, variant),
      variant,
      position,
      duration: 8000,
      onClick: noop,
    });

  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 16, padding: 12, minHeight: 640 }}>
      <ReqorePanel label='Try it' icon='Notification3Line' minimal flat>
        <ReqoreControlGroup vertical gapSize='small'>
          <ReqoreSegmentedControl
            size='small'
            value={variant}
            onChange={(value) => setVariant(value as TReqoreNotificationVariant)}
            items={VARIANTS.map(({ variant: value, name }) => ({ value, label: name }))}
          />
          <ReqoreSegmentedControl
            size='small'
            value={position}
            onChange={(value) => setPosition(value as IReqoreNotificationsPosition)}
            items={POSITIONS.map((value) => ({ value, label: value.toLowerCase() }))}
          />
          <ReqoreControlGroup size='small' wrap>
            {SAMPLES.map((sample) => (
              <ReqoreButton
                key={sample.key}
                intent={sample.intent}
                icon='SendPlaneLine'
                onClick={() => fire(sample)}
                className={`fire-${sample.key}`}
              >
                {sample.title ?? 'Copied'}
              </ReqoreButton>
            ))}
            <ReqoreButton
              icon='StackLine'
              onClick={() => SAMPLES.slice(0, 4).forEach(fire)}
              className='fire-stack'
            >
              A stack of four
            </ReqoreButton>
          </ReqoreControlGroup>
        </ReqoreControlGroup>
      </ReqorePanel>
      <MockPage />
    </div>
  );
};

export const InApp: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A mock page with real notifications fired through the provider: pick a variant and a corner, then send any of the six, or a stack of four to see them pile up. Hovering a notification holds its timer; an action runs and closes it; the close does what it says. Starts on the glass variant in the top-right corner.',
      },
    },
  },
  render: () => <InAppPage />,
  play: async () => {
    await waitFor(() => expect(document.body).toHaveTextContent('Incoming orders'));
    fireEvent.click(document.querySelector('.fire-danger')!);
    await waitFor(() =>
      expect(document.querySelectorAll('.reqore-notification-glass')).toHaveLength(1)
    );
    expect(document.body).toHaveTextContent('erp-oracle has been unreachable');
    // The action closes the notification.
    fireEvent.click(
      Array.from(document.querySelectorAll('.reqore-notification-actions button')).find((b) =>
        b.textContent?.includes('Show log')
      )!
    );
    await waitFor(() =>
      expect(document.querySelectorAll('.reqore-notification-glass')).toHaveLength(0)
    );
    fireEvent.click(document.querySelector('.fire-stack')!);
    await waitFor(() =>
      expect(document.querySelectorAll('.reqore-notification-glass')).toHaveLength(4)
    );
  },
};

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The card variant from tiny to big: padding, the icon tile, the text and the buttons all follow `size`, and the timer line thickens for the big ones.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 16, padding: 12, maxWidth: 480 }}>
      {(['tiny', 'small', 'normal', 'big'] as const).map((size) => (
        <ReqoreNotification
          key={size}
          variant='card'
          size={size}
          duration={90000}
          onClose={noop}
          onFinish={noop}
          {...sampleProps(SAMPLES[3], 'card')}
        />
      ))}
    </div>
  ),
  play: async () => {
    await waitFor(() => expect(document.querySelectorAll('.reqore-notification')).toHaveLength(4));
  },
};

const DefaultsPage = () => {
  const addNotification = useReqoreProperty('addNotification');

  return (
    <div style={{ padding: 12 }}>
      <ReqoreP>
        The provider was given <code>options.notifications</code> with the glass variant and the
        bottom-right corner, so this button passes only a title, a body and an intent.
      </ReqoreP>
      <ReqoreVerticalSpacer height={12} />
      <ReqoreButton
        icon='SendPlaneLine'
        intent='success'
        className='fire-default'
        onClick={() =>
          addNotification({
            title: 'Deployed',
            content: 'order-sync went live on production.',
            intent: 'success',
            duration: 8000,
          })
        }
      >
        Send with the app defaults
      </ReqoreButton>
    </div>
  );
};

export const AppWideDefaults: Story = {
  args: {
    options: { notifications: { variant: 'glass', position: 'BOTTOM RIGHT' } },
  } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'One line on `ReqoreUIProvider` — `options.notifications` — gives every notification in the app the same look and corner. A notification’s own props still win.',
      },
    },
  },
  render: () => <DefaultsPage />,
  play: async () => {
    await waitFor(() => expect(document.body).toHaveTextContent('Send with the app defaults'));
    fireEvent.click(document.querySelector('.fire-default')!);
    await waitFor(() =>
      expect(document.querySelectorAll('.reqore-notification-glass')).toHaveLength(1)
    );
  },
};
