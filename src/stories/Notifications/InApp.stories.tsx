import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { useState } from 'react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { IReqoreNotificationsPosition } from '../../components/Notifications';
import ReqoreNotification from '../../components/Notifications/notification';
import { TSizes } from '../../constants/sizes';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreEntityRow,
  ReqoreP,
  ReqorePanel,
  ReqoreSegmentedControl,
  ReqoreVerticalSpacer,
  useReqoreProperty,
} from '../../index';
import { StoryMeta } from '../utils';
import { SAMPLES, TSample, sampleProps } from './samples';

/*
 * Real notifications fired through the provider over a mock page, with every
 * switch at hand — the way they will be met in a product.
 */
const meta = {
  title: 'Other/Notifications/In App',
  component: ReqoreNotification,
} as StoryMeta<typeof ReqoreNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

const POSITIONS: IReqoreNotificationsPosition[] = [
  'TOP',
  'TOP RIGHT',
  'BOTTOM RIGHT',
  'BOTTOM',
  'BOTTOM LEFT',
  'TOP LEFT',
];

const SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big'];

const onOff = (value: boolean) => (value ? 'on' : 'off');

const MockPage = () => (
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
);

const Playground = () => {
  const addNotification = useReqoreProperty('addNotification');
  const [compact, setCompact] = useState(false);
  const [flat, setFlat] = useState(true);
  const [raised, setRaised] = useState(true);
  const [surface, setSurface] = useState<'glass' | 'opaque' | 'minimal'>('glass');
  const [size, setSize] = useState<TSizes>('normal');
  const [position, setPosition] = useState<IReqoreNotificationsPosition>('TOP RIGHT');

  const fire = (sample: TSample) =>
    addNotification({
      ...sampleProps(sample, compact),
      flat,
      raised,
      opaque: surface === 'opaque',
      minimal: surface === 'minimal',
      size,
      position,
      duration: 8000,
      onClick: noop,
    });

  return (
    <div style={{ display: 'flex', flexFlow: 'column', gap: 16, padding: 12, minHeight: 640 }}>
      <ReqorePanel label='Try it' icon='Notification3Line' minimal flat>
        <ReqoreControlGroup vertical gapSize='small'>
          <ReqoreControlGroup size='small' wrap>
            <ReqoreSegmentedControl
              size='small'
              value={compact ? 'compact' : 'long'}
              onChange={(value) => setCompact(value === 'compact')}
              items={[
                { value: 'long', label: 'Long form' },
                { value: 'compact', label: 'Compact' },
              ]}
            />
            <ReqoreSegmentedControl
              size='small'
              value={onOff(flat)}
              onChange={(value) => setFlat(value === 'on')}
              items={[
                { value: 'on', label: 'flat' },
                { value: 'off', label: 'bordered' },
              ]}
            />
            <ReqoreSegmentedControl
              size='small'
              value={onOff(raised)}
              onChange={(value) => setRaised(value === 'on')}
              items={[
                { value: 'on', label: 'raised' },
                { value: 'off', label: 'not raised' },
              ]}
            />
            <ReqoreSegmentedControl
              size='small'
              value={surface}
              onChange={(value) => setSurface(value as typeof surface)}
              items={[
                { value: 'glass', label: 'glass' },
                { value: 'opaque', label: 'opaque' },
                { value: 'minimal', label: 'minimal' },
              ]}
            />
            <ReqoreSegmentedControl
              size='small'
              value={size}
              onChange={(value) => setSize(value as TSizes)}
              items={SIZES.map((value) => ({ value, label: value }))}
            />
          </ReqoreControlGroup>
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
          'Pick the form, the surface flags, a size and a corner, then send any of the seven notifications or a stack of four. Hovering one holds its timer; an action runs and closes it; the close does what it says.',
      },
    },
  },
  render: () => <Playground />,
  play: async () => {
    await waitFor(() => expect(document.body).toHaveTextContent('Incoming orders'));
    fireEvent.click(document.querySelector('.fire-danger')!);
    await waitFor(() => expect(document.querySelectorAll('.reqore-notification')).toHaveLength(1));
    expect(document.body).toHaveTextContent('erp-oracle has been unreachable');
    // The action closes the notification.
    fireEvent.click(
      Array.from(document.querySelectorAll('.reqore-notification-actions button')).find((b) =>
        b.textContent?.includes('Show log')
      )!
    );
    await waitFor(() => expect(document.querySelectorAll('.reqore-notification')).toHaveLength(0));
    fireEvent.click(document.querySelector('.fire-stack')!);
    await waitFor(() => expect(document.querySelectorAll('.reqore-notification')).toHaveLength(4));
  },
};

const DefaultsPage = () => {
  const addNotification = useReqoreProperty('addNotification');

  return (
    <div style={{ padding: 12 }}>
      <ReqoreP>
        The provider was given <code>options.notifications</code> with the compact form and the
        bottom corner, so this button passes only a body and an intent.
      </ReqoreP>
      <ReqoreVerticalSpacer height={12} />
      <ReqoreButton
        icon='SendPlaneLine'
        intent='success'
        className='fire-default'
        onClick={() =>
          addNotification({
            content: 'order-sync is live',
            intent: 'success',
            duration: 8000,
            actions: [{ label: 'Open' }],
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
    options: { notifications: { compact: true, position: 'BOTTOM' } },
  } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'One line on `ReqoreUIProvider` — `options.notifications` — gives every notification in the app the same form and corner. A notification’s own props still win.',
      },
    },
  },
  render: () => <DefaultsPage />,
  play: async () => {
    await waitFor(() => expect(document.body).toHaveTextContent('Send with the app defaults'));
    fireEvent.click(document.querySelector('.fire-default')!);
    await waitFor(() =>
      expect(document.querySelectorAll('.reqore-notification-compact')).toHaveLength(1)
    );
  },
};
