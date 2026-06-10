import { expect, jest } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import { noop } from 'lodash';
import ReqoreLink from '../../components/Link';
import { ReqoreControlGroup, ReqoreP } from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Navigation/Link/Stories',
  component: ReqoreLink,
} as StoryMeta<typeof ReqoreLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const onClick = jest.fn();

/** Button mode — no `href`, so an `onClick`-driven `<button>` is rendered. */
export const Default: Story = {
  render: () => <ReqoreLink onClick={onClick}>Open issue list →</ReqoreLink>,
  play: async ({ canvasElement }) => {
    onClick.mockClear();
    const link = within(canvasElement).getByText('Open issue list →');
    await fireEvent.click(link);
    await expect(onClick).toHaveBeenCalledTimes(1);
  },
};

/** Anchor mode — given `href`, a real `<a>` is rendered (`external` opens a
 *  new tab with a safe `rel`). */
export const Anchor: Story = {
  render: () => (
    <ReqoreLink href='https://reqore.qoretechnologies.com' external>
      reqore docs
    </ReqoreLink>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByText('reqore docs') as HTMLAnchorElement;
    await expect(link.getAttribute('href')).toBe('https://reqore.qoretechnologies.com');
    await expect(link.getAttribute('target')).toBe('_blank');
    await expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  },
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
