import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { expect, fireEvent, waitFor } from 'storybook/test';
import ReqoreNotification from '../../components/Notifications/notification';
import { TSizes } from '../../constants/sizes';
import { ReqoreTag } from '../../index';
import { StoryMeta } from '../utils';
import { Backdrop, DANGER, Grid, Row, SAMPLES, STATIC, sampleProps } from './samples';

/*
 * One notification, every way it can be configured: each story is a review
 * grid for one axis (intent, surface, content, actions, size, timer, padding,
 * width, theme) with the long form beside the one-line `compact` form.
 */
const meta = {
  title: 'Other/Notifications/Item',
  component: ReqoreNotification,
} as StoryMeta<typeof ReqoreNotification>;

export default meta;
type Story = StoryObj<typeof meta>;

const countNotifications = () => document.querySelectorAll('.reqore-notification').length;

export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every intent — info, success, warning, danger, pending, muted — and one with none, in the long form and the compact pill. The surface stays neutral; the intent is the bloom behind the icon, the icon itself, the first action and the timer line.',
      },
    },
  },
  render: () => (
    <Grid columns={2}>
      {SAMPLES.map((sample) => (
        <Row key={sample.key} label={sample.intent ?? 'no intent'}>
          <ReqoreNotification {...STATIC} duration={90000} {...sampleProps(sample)} />
        </Row>
      ))}
      {SAMPLES.map((sample) => (
        <Row key={`${sample.key}-compact`} label={`${sample.intent ?? 'no intent'} · compact`}>
          <ReqoreNotification {...STATIC} {...sampleProps(sample, true)} />
        </Row>
      ))}
    </Grid>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(SAMPLES.length * 2));
    expect(document.querySelectorAll('.reqore-notification-compact')).toHaveLength(SAMPLES.length);
  },
};

const SURFACES: { label: string; props: Partial<typeof DANGER> }[] = [
  { label: 'default · flat, raised, translucent', props: {} },
  { label: 'opaque', props: { opaque: true } },
  { label: 'minimal', props: { minimal: true } },
  { label: 'blur 0', props: { blur: 0 } },
  { label: 'raised false', props: { raised: false } },
  { label: 'flat false · border, ring, shadow', props: { flat: false } },
  { label: 'flat false · raised false', props: { flat: false, raised: false } },
  { label: 'flat false · opaque', props: { flat: false, opaque: true } },
];

export const Surfaces: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The surface flags over a busy backdrop, long form beside compact: the default (flat, raised, translucent glass), opaque, minimal (no surface), blur off, raised off, flat off (hairline border, faint intent ring, drop shadow), and their combinations.',
      },
    },
  },
  render: () => (
    <Backdrop>
      <Grid columns={2} style={{ padding: 0 }}>
        {SURFACES.map(({ label, props }) => (
          <Row key={label} label={label}>
            <ReqoreNotification {...STATIC} duration={90000} {...sampleProps(DANGER)} {...props} />
            <ReqoreNotification {...STATIC} {...sampleProps(DANGER, true)} {...props} />
          </Row>
        ))}
      </Grid>
    </Backdrop>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(SURFACES.length * 2));
  },
};

export const Content: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'What goes inside: a title alone, a body alone, both, a long body that wraps, a React node as the body, a custom icon, a custom icon colour, no icon at all, the icon without its tile — and the compact pill with a bold lead-in, with a body only, and with a tiled icon.',
      },
    },
  },
  render: () => (
    <Grid columns={2}>
      <Row label='title only'>
        <ReqoreNotification {...STATIC} intent='success' title='Saved' />
      </Row>
      <Row label='content only'>
        <ReqoreNotification {...STATIC} intent='info' content='Your draft was restored.' />
      </Row>
      <Row label='title and content'>
        <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[0])} actions={undefined} />
      </Row>
      <Row label='long content'>
        <ReqoreNotification
          {...STATIC}
          intent='warning'
          title='Schema drift'
          content='Three fields on the customer table changed upstream since the last import: email is now nullable, created_at gained a timezone, and loyalty_tier is a new enum with five members. Nothing was written; review the diff before the nightly job runs.'
        />
      </Row>
      <Row label='react node content'>
        <ReqoreNotification
          {...STATIC}
          intent='success'
          title='Tagged'
          content={
            <ReqoreTag
              size='small'
              label='v3.2.0'
              icon='PriceTag3Line'
              effect={{ gradient: { colors: { 0: '#a11c58', 100: '#ff47a3' } } }}
            />
          }
        />
      </Row>
      <Row label='custom icon'>
        <ReqoreNotification
          {...STATIC}
          intent='info'
          icon='Rocket2Line'
          title='Launching'
          content='The release is rolling out to eu-west.'
        />
      </Row>
      <Row label='custom icon colour'>
        <ReqoreNotification
          {...STATIC}
          icon='Rocket2Line'
          iconColor='#ff47a3'
          title='Launching'
          content='No intent, a pink rocket.'
        />
      </Row>
      <Row label='no icon, no intent'>
        <ReqoreNotification {...STATIC} title='Heads up' content='Nothing to point at.' />
      </Row>
      <Row label='iconHasBackground false'>
        <ReqoreNotification {...STATIC} {...sampleProps(DANGER)} iconHasBackground={false} />
      </Row>
      <Row label='compact · title and content'>
        <ReqoreNotification
          {...STATIC}
          compact
          intent='success'
          title='Deployed'
          content='order-sync is live'
        />
      </Row>
      <Row label='compact · content only'>
        <ReqoreNotification {...STATIC} compact intent='info' content='Copied to clipboard' />
      </Row>
      <Row label='compact · iconHasBackground'>
        <ReqoreNotification
          {...STATIC}
          compact
          iconHasBackground
          intent='warning'
          content='Quota at 90%'
        />
      </Row>
    </Grid>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(12));
  },
};

export const Actions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Actions are minimal, flat, raised buttons; the first carries the intent. One, two and three (they wrap), with an icon, with an intent of its own, one that leaves the notification open (`closeOnClick: false`), a notification with no close, one that is clickable as a whole, and the compact pill with one and two actions.',
      },
    },
  },
  render: () => (
    <Grid columns={2}>
      <Row label='one action'>
        <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[0])} />
      </Row>
      <Row label='two actions'>
        <ReqoreNotification {...STATIC} {...sampleProps(DANGER)} />
      </Row>
      <Row label='three actions'>
        <ReqoreNotification
          {...STATIC}
          {...sampleProps(DANGER)}
          actions={[
            { label: 'Retry now', icon: 'RefreshLine' },
            { label: 'Show log' },
            { label: 'Open connection', icon: 'ExternalLinkLine' },
          ]}
        />
      </Row>
      <Row label='action with its own intent'>
        <ReqoreNotification
          {...STATIC}
          {...sampleProps(SAMPLES[1])}
          actions={[{ label: 'Roll back', intent: 'danger', icon: 'ArrowGoBackLine' }]}
        />
      </Row>
      <Row label='closeOnClick false'>
        <ReqoreNotification
          {...STATIC}
          {...sampleProps(SAMPLES[4])}
          actions={[{ label: 'Details', closeOnClick: false, onClick: noop }]}
        />
      </Row>
      <Row label='no close'>
        <ReqoreNotification {...sampleProps(SAMPLES[2])} onFinish={noop} />
      </Row>
      <Row label='clickable'>
        <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[0])} actions={undefined} onClick={noop} />
      </Row>
      <Row label='compact · one action'>
        <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[6], true)} />
      </Row>
      <Row label='compact · two actions'>
        <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[1], true)} />
      </Row>
      <Row label='compact · no close'>
        <ReqoreNotification {...sampleProps(SAMPLES[0], true)} onFinish={noop} />
      </Row>
    </Grid>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(10));
    expect(document.querySelectorAll('.reqore-notification-actions button')).toHaveLength(13);
  },
};

const SIZES: TSizes[] = ['tiny', 'small', 'normal', 'big', 'huge'];

export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tiny to huge, long form and compact: padding, the icon tile, the text, the buttons and the timer line all follow `size`.',
      },
    },
  },
  render: () => (
    <Grid columns={2}>
      {SIZES.map((size) => (
        <Row key={size} label={size}>
          <ReqoreNotification {...STATIC} duration={90000} size={size} {...sampleProps(DANGER)} />
        </Row>
      ))}
      {SIZES.map((size) => (
        <Row key={`${size}-compact`} label={`${size} · compact`}>
          <ReqoreNotification {...STATIC} size={size} {...sampleProps(DANGER, true)} />
        </Row>
      ))}
    </Grid>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(SIZES.length * 2));
  },
};

export const Timer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The line along the bottom drains over the duration; hovering holds it and the timer. Five and fifteen seconds, the line hidden with `showProgress={false}`, the compact pill (no line unless asked for it), `pauseOnHover={false}`, and a pending one that never ends.',
      },
    },
  },
  render: () => (
    <Grid columns={2}>
      <Row label='5 s'>
        <ReqoreNotification {...STATIC} duration={5000} {...sampleProps(SAMPLES[1])} />
      </Row>
      <Row label='15 s'>
        <ReqoreNotification {...STATIC} duration={15000} {...sampleProps(DANGER)} />
      </Row>
      <Row label='showProgress false'>
        <ReqoreNotification
          {...STATIC}
          duration={15000}
          showProgress={false}
          {...sampleProps(SAMPLES[2])}
        />
      </Row>
      <Row label='pauseOnHover false'>
        <ReqoreNotification
          {...STATIC}
          duration={15000}
          pauseOnHover={false}
          {...sampleProps(SAMPLES[0])}
        />
      </Row>
      <Row label='compact · 15 s (no line)'>
        <ReqoreNotification {...STATIC} duration={15000} {...sampleProps(SAMPLES[1], true)} />
      </Row>
      <Row label='compact · showProgress'>
        <ReqoreNotification
          {...STATIC}
          duration={15000}
          showProgress
          {...sampleProps(SAMPLES[1], true)}
        />
      </Row>
      <Row label='pending'>
        <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[4])} />
      </Row>
    </Grid>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(7));
    expect(document.querySelectorAll('.reqore-notification-progress')).toHaveLength(4);
    // Hovering holds the line (the runner neutralises CSS animations, so the
    // held state is read from the element, not from its play state).
    const first = document.querySelector<HTMLElement>('.reqore-notification')!;
    const progress = () => first.querySelector('.reqore-notification-progress')!;
    // React derives enter / leave from over / out; a bare mouseenter never reaches it.
    fireEvent.mouseOver(first);
    await waitFor(() => expect(progress()).toHaveAttribute('data-paused'));
    fireEvent.mouseOut(first);
    await waitFor(() => expect(progress()).not.toHaveAttribute('data-paused'));
  },
};

export const Padding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`padded` (`true`, `false`, `horizontal`, `vertical`) and `paddingSize` (defaults to `size`), long form and compact.',
      },
    },
  },
  render: () => (
    <Grid columns={2}>
      {(
        [
          ['padded false', { padded: false }],
          ['horizontal', { padded: 'horizontal' }],
          ['vertical', { padded: 'vertical' }],
          ['paddingSize small', { paddingSize: 'small' }],
          ['paddingSize big', { paddingSize: 'big' }],
        ] as const
      ).map(([label, props]) => (
        <Row key={label} label={label}>
          <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[0])} {...props} />
          <ReqoreNotification {...STATIC} {...sampleProps(SAMPLES[0], true)} {...props} />
        </Row>
      ))}
    </Grid>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(10));
  },
};

export const Fluid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`fluid` takes the width of its container (here 640px) instead of the 400px a notification has on its own; the compact pill stretches too.',
      },
    },
  },
  render: () => (
    <div style={{ width: 640, padding: 12, display: 'flex', flexFlow: 'column', gap: 12 }}>
      <ReqoreNotification {...STATIC} fluid duration={90000} {...sampleProps(DANGER)} />
      <ReqoreNotification {...STATIC} fluid {...sampleProps(DANGER, true)} />
      <ReqoreNotification {...STATIC} {...sampleProps(DANGER, true)} />
    </div>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(3));
    // Both fluid ones fill the column (the canvas may be narrower than 640px).
    // Measured once the entrance spring has settled — it starts at scale 0.9.
    const [wide, pill, own] = Array.from(document.querySelectorAll<HTMLElement>('.reqore-notification'));
    const settled = (el: HTMLElement) =>
      Math.round(el.getBoundingClientRect().width) === Math.round(parseFloat(getComputedStyle(el).width));
    await waitFor(() => expect([wide, pill, own].every(settled)).toBe(true), { timeout: 3000 });
    const column = Math.round(wide.parentElement!.getBoundingClientRect().width) - 24;
    expect(Math.round(wide.getBoundingClientRect().width)).toBe(column);
    expect(Math.round(pill.getBoundingClientRect().width)).toBe(column);
    expect(own.getBoundingClientRect().width).toBeLessThan(column);
  },
};

export const Theming: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A custom theme (a light surface, so the icon colour deepens instead of lifting), a gradient `effect` on the surface, and a glow effect — the notification is a `StyledEffect`, so the whole effect system applies.',
      },
    },
  },
  render: () => (
    <Backdrop>
      <Grid columns={2} style={{ padding: 0 }}>
        <Row label='customTheme main #f4f4f4'>
          <ReqoreNotification
            {...STATIC}
            customTheme={{ main: '#f4f4f4' }}
            duration={90000}
            {...sampleProps(SAMPLES[1])}
          />
          <ReqoreNotification
            {...STATIC}
            customTheme={{ main: '#f4f4f4' }}
            {...sampleProps(SAMPLES[1], true)}
          />
        </Row>
        <Row label='effect gradient'>
          <ReqoreNotification
            {...STATIC}
            duration={90000}
            effect={{ gradient: { colors: { 0: '#2b1055', 100: '#7597de' }, direction: 'to right' } }}
            {...sampleProps(SAMPLES[0])}
          />
          <ReqoreNotification
            {...STATIC}
            effect={{ gradient: { colors: { 0: '#2b1055', 100: '#7597de' }, direction: 'to right' } }}
            {...sampleProps(SAMPLES[0], true)}
          />
        </Row>
        <Row label='effect glow'>
          <ReqoreNotification
            {...STATIC}
            duration={90000}
            effect={{ glow: { color: 'danger', blur: 24, size: 2, opacity: 0.5 } }}
            {...sampleProps(DANGER)}
          />
          <ReqoreNotification
            {...STATIC}
            effect={{ glow: { color: 'danger', blur: 24, size: 2, opacity: 0.5 } }}
            {...sampleProps(DANGER, true)}
          />
        </Row>
      </Grid>
    </Backdrop>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(6));
  },
};

export const LightTheme: Story = {
  args: { mainTheme: '#f4f4f4' } as Story['args'],
  parameters: {
    docs: {
      description: {
        story:
          'The whole app on a light theme: text darkens, the icon colours deepen instead of lifting, the raised highlight and the frost still read.',
      },
    },
  },
  render: Intents.render,
  play: Intents.play,
};

const COLUMNS: { label: string; props: Partial<typeof DANGER> }[] = [
  { label: 'default', props: {} },
  { label: 'raised false', props: { raised: false } },
  { label: 'flat false', props: { flat: false } },
  { label: 'flat false · raised false', props: { flat: false, raised: false } },
];

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The full grid for a thorough look: every intent down the side; across, the long form and the compact pill, each as the default, with `raised` off, with `flat` off, and with both off.',
      },
    },
  },
  render: () => (
    <Grid columns={COLUMNS.length * 2}>
      {SAMPLES.flatMap((sample) => [
        ...COLUMNS.map(({ label, props }) => (
          <Row key={`${sample.key}-${label}`} label={`${sample.intent ?? 'none'} · ${label}`}>
            <ReqoreNotification {...STATIC} duration={90000} {...sampleProps(sample)} {...props} />
          </Row>
        )),
        ...COLUMNS.map(({ label, props }) => (
          <Row
            key={`${sample.key}-${label}-compact`}
            label={`${sample.intent ?? 'none'} · compact · ${label}`}
          >
            <ReqoreNotification {...STATIC} {...sampleProps(sample, true)} {...props} />
          </Row>
        )),
      ])}
    </Grid>
  ),
  play: async () => {
    await waitFor(() => expect(countNotifications()).toBe(SAMPLES.length * COLUMNS.length * 2));
  },
};
