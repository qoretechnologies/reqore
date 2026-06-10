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
  render: () => (
    <ReqoreP>
      Previewing 8 of 12 active issues ·{' '}
      <ReqoreLink onClick={noop}>Open issue list →</ReqoreLink>
    </ReqoreP>
  ),
};

/** Disabled — dimmed and non-interactive. */
export const Disabled: Story = {
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
