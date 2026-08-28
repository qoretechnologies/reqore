import { expect, fireEvent, fn, within } from 'storybook/test';
import { StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import ReqoreLink from '../../components/Link';
import { ReqoreControlGroup, ReqoreP } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Navigation/Link',
  component: ReqoreLink,
} as StoryMeta<typeof ReqoreLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const onClick = fn();

/** Default — given `href`, a real `<a>` is rendered (so middle-click /
 *  open-in-new-tab work). */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link in its default configuration.',
      },
    },
  },
  render: () => (
    <ReqoreLink href='https://reqore.qoretechnologies.com'>reqore docs</ReqoreLink>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByText('reqore docs') as HTMLAnchorElement;
    await expect(link.tagName).toBe('A');
    await expect(link.getAttribute('href')).toBe('https://reqore.qoretechnologies.com');
  },
};

/** Button mode — with no `href` (and no custom `as`), an `onClick`-driven
 *  `<button type="button">` is rendered, so the link triggers an in-app action
 *  while still flowing as inline text. */
export const LinkAsButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link with the link styled as a button.',
      },
    },
  },
  render: () => <ReqoreLink onClick={onClick}>Open issue list →</ReqoreLink>,
  play: async ({ canvasElement }) => {
    onClick.mockClear();
    const link = within(canvasElement).getByText('Open issue list →') as HTMLButtonElement;
    await expect(link.tagName).toBe('BUTTON');
    await fireEvent.click(link);
    await expect(onClick).toHaveBeenCalledTimes(1);
  },
};

/** External `href` opens a new tab with a safe `rel`. */
export const External: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link in a mode where it points to an external destination.',
      },
    },
  },
  render: () => (
    <ReqoreLink href='https://reqore.qoretechnologies.com' external>
      reqore docs
    </ReqoreLink>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByText('reqore docs') as HTMLAnchorElement;
    await expect(link.getAttribute('target')).toBe('_blank');
    await expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  },
};

/** A leading `icon` renders before the text and centers with it. */
export const WithIcon: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link with an icon.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical>
      <ReqoreLink href='https://reqore.qoretechnologies.com' external icon='ExternalLinkLine'>
        reqore docs
      </ReqoreLink>
      <ReqoreLink onClick={noop} icon='ArrowRightLine' intent='info'>
        Open issue list
      </ReqoreLink>
      <ReqoreLink onClick={noop} icon='ArrowRightLine' intent='info' size='huge'>
        Larger link — icon, text and gap all scale with size
      </ReqoreLink>
    </ReqoreControlGroup>
  ),
};

/** Intents colour the link via the standard theme intents. */
export const Intents: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link at every intent (info, success, warning, danger, pending, muted) so the intent palette is visible side by side.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical>
      <ReqoreLink onClick={noop}>Default link</ReqoreLink>
      <ReqoreLink intent='info' onClick={noop}>
        Info link
      </ReqoreLink>
      <ReqoreLink intent='success' onClick={noop}>
        Success link
      </ReqoreLink>
      <ReqoreLink intent='warning' onClick={noop}>
        Warning link
      </ReqoreLink>
      <ReqoreLink intent='danger' onClick={noop}>
        Danger link
      </ReqoreLink>
      <ReqoreLink intent='muted' onClick={noop}>
        Muted link
      </ReqoreLink>
    </ReqoreControlGroup>
  ),
};

/** Flows inline inside running text. */
export const InProse: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link embedded inside prose text.',
      },
    },
  },
  render: () => (
    <ReqoreP>
      Previewing 8 of 12 active issues ·{' '}
      <ReqoreLink onClick={noop}>Open issue list →</ReqoreLink>
    </ReqoreP>
  ),
};

/**
 * The shape a truncating link is FOR: a table cell that has a fixed width and a
 * value that does not. Both rows are capped at the same width; the difference
 * is which part of the address survives.
 */
const AddressRow = ({
  label,
  href,
  truncate,
}: {
  label: string;
  href: string;
  truncate?: 'end' | 'middle';
}) => (
  <ReqoreControlGroup verticalAlign='center' gapSize='normal'>
    <ReqoreP size='small' style={{ width: 90, opacity: 0.6 }}>
      {label}
    </ReqoreP>
    <div
      style={{
        width: 320,
        border: '1px dashed rgba(255,255,255,0.18)',
        padding: '4px 8px',
        borderRadius: 4,
      }}
    >
      <ReqoreLink href={href} external maxWidth='100%' truncate={truncate} size='small'>
        {href}
      </ReqoreLink>
    </div>
  </ReqoreControlGroup>
);

export const Truncated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link capped with `maxWidth`, in both truncation modes, inside a box narrower than the text. `end` keeps the beginning — right for a name someone reads left to right. `middle` keeps both ends, which is what an address wants: the scheme and host say where it is, the last segment says WHICH one it is, and the two webhooks below are told apart only by their tails. Uncapped is shown for contrast, overflowing its box exactly as a link with no cap does.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='big'>
      <AddressRow
        label='end'
        href='https://supah.qoretechnologies.com:8011/webhooks/paddle-notifications'
      />
      <AddressRow
        label='middle'
        truncate='middle'
        href='https://supah.qoretechnologies.com:8011/webhooks/paddle-notifications'
      />
      <AddressRow
        label='middle'
        truncate='middle'
        href='https://supah.qoretechnologies.com:8011/webhooks/slack-events'
      />
      <ReqoreControlGroup verticalAlign='center' gapSize='normal'>
        <ReqoreP size='small' style={{ width: 90, opacity: 0.6 }}>
          uncapped — overflows, for contrast
        </ReqoreP>
        <div
          style={{
            width: 320,
            border: '1px dashed rgba(255,255,255,0.18)',
            padding: '4px 8px',
            borderRadius: 4,
          }}
        >
          <ReqoreLink
            href='https://supah.qoretechnologies.com:8011/webhooks/paddle-notifications'
            external
            size='small'
          >
            https://supah.qoretechnologies.com:8011/webhooks/paddle-notifications
          </ReqoreLink>
        </div>
      </ReqoreControlGroup>
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    // The capped links render head/tail parts; the uncapped one does not.
    await expect(canvasElement.querySelectorAll('.reqore-link-text-head').length).toBe(3);
    await expect(canvasElement.querySelectorAll('.reqore-link-text-tail').length).toBe(2);

    // A middle-truncated link keeps its tail intact, which is the whole point:
    // these two addresses differ only after the last slash.
    const tails = Array.from(canvasElement.querySelectorAll('.reqore-link-text-tail')).map(
      (node) => node.textContent
    );
    await expect(tails[0]).not.toBe(tails[1]);

    /* A capped link still LOOKS like a link. The parts are laid out in an
       inline-flex row, which does not inherit the anchor's painted underline,
       so this asserts the decoration reaches the text rather than the box. */
    const head = canvasElement.querySelector('.reqore-link-text-head') as HTMLElement;
    await expect(getComputedStyle(head).textDecorationLine).toBe('underline');

    // Capping never changes the text itself — only how much of it is painted.
    const links = canvasElement.querySelectorAll('.reqore-link');
    const capped = links[0];
    await expect(capped.textContent).toBe(
      'https://supah.qoretechnologies.com:8011/webhooks/paddle-notifications'
    );

    /* The contrast the last row is here for, asserted rather than left to the
       eye: a capped link stays inside the box it was given, an uncapped one
       does not — it is ordinary inline text, and an address has almost nowhere
       legal to break. */
    const fits = (link: Element) => {
      const box = link.parentElement!.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      return rect.width <= box.width + 1;
    };

    await expect(fits(capped)).toBe(true);
    await expect(fits(links[links.length - 1])).toBe(false);
  },
};

/** Disabled — dimmed and non-interactive. */
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link in its disabled state.',
      },
    },
  },
  render: () => (
    <ReqoreLink disabled onClick={noop}>
      Disabled link
    </ReqoreLink>
  ),
};

/** Custom element via `as` — e.g. a router link. Here a stand-in component
 *  receives a `to` prop, the same way `react-router`'s `<Link>` would. */
const RouterLinkStub = ({ to, children, ...rest }: any) => (
  <a href={to} data-router-link {...rest}>
    {children}
  </a>
);

export const AsRouterLink: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Link rendered as a router link.',
      },
    },
  },
  render: () => (
    <ReqoreLink as={RouterLinkStub} to='/issues'>
      Go to issues
    </ReqoreLink>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByText('Go to issues') as HTMLAnchorElement;
    await expect(link.tagName).toBe('A');
    await expect(link.getAttribute('href')).toBe('/issues');
    await expect(link.hasAttribute('data-router-link')).toBe(true);
  },
};
