import { StoryFn, StoryObj } from '@storybook/react';
import { expect, fireEvent, waitFor } from 'storybook/test';
import { useState } from 'react';
import ReqoreButton from '../../components/Button';
import { IReqoreCollapseProps, ReqoreCollapse } from '../../components/Collapse';
import ReqoreControlGroup from '../../components/ControlGroup';
import { ReqoreH3 } from '../../components/Header';
import { ReqorePanel } from '../../components/Panel';
import { ReqoreP } from '../../components/Paragraph';
import ReqoreTag from '../../components/Tag';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Display/Collapse',
  component: ReqoreCollapse,
  parameters: {
    chromatic: {
      viewports: [450, 1440],
    },
  },
} as StoryMeta<typeof ReqoreCollapse>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A page header of the kind this component exists for: a title that shrinks, a
 * description that folds, and a row of figures that folds — all on one curve,
 * because they are one movement rather than three things disappearing.
 */
const HeaderChrome = ({ collapsed }: { collapsed: boolean }) => (
  <ReqorePanel flat rounded padded='normal' style={{ width: 720, maxWidth: '100%' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ReqoreH3 style={{ fontSize: collapsed ? 16 : 24, transition: 'font-size 250ms' }}>
        Workflows
      </ReqoreH3>

      <ReqoreCollapse collapsed={collapsed} hostGap={12}>
        <ReqoreP size='small' effect={{ opacity: 0.7 }}>
          Every workflow on this instance, with the runs each one has had in the selected
          window. The header folds as the table scrolls, so the rows get the room.
        </ReqoreP>
      </ReqoreCollapse>

      <ReqoreCollapse collapsed={collapsed} hostGap={12}>
        <ReqoreControlGroup gapSize='small'>
          <ReqoreTag icon='PlayLine' label='412 runs' intent='info' minimal />
          <ReqoreTag icon='ErrorWarningLine' label='7 errors' intent='danger' minimal />
          <ReqoreTag icon='TimerLine' label='p95 1.2s' minimal />
        </ReqoreControlGroup>
      </ReqoreCollapse>
    </div>
  </ReqorePanel>
);

const Template: StoryFn<IReqoreCollapseProps> = (args) => {
  const [collapsed, setCollapsed] = useState(!!args.collapsed);

  return (
    <ReqoreControlGroup vertical gapSize='big'>
      <ReqoreButton
        icon={collapsed ? 'ArrowDownSLine' : 'ArrowUpSLine'}
        fixed
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? 'Expand the chrome' : 'Fold the chrome'}
      </ReqoreButton>
      <HeaderChrome collapsed={collapsed} />
    </ReqoreControlGroup>
  );
};

export const Expanded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Collapse open — the content is at its natural height, and the button above it is the HOST deciding, which is the only way this component ever changes state.',
      },
    },
  },
  render: Template,
  args: { collapsed: false },
};

export const Collapsed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Collapse folded — the content is at zero height, hidden from assistive technology and out of the tab order, and the gap it would have cost its parent is pulled closed with it.',
      },
    },
  },
  render: Template,
  args: { collapsed: true },
};

export const Folding: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drives the fold from the host control, which is what a scrolling page does in the product: both blocks fold together, on one duration and one easing, so the header reads as one movement rather than as a stutter of things disappearing.',
      },
    },
  },
  render: Template,
  args: { collapsed: false },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelectorAll('.reqore-collapse').length).toBe(2)
    );

    await fireEvent.click(canvasElement.querySelector('.reqore-button')!);

    await waitFor(() => {
      const folds = canvasElement.querySelectorAll('.reqore-collapse');
      folds.forEach((fold) => expect(fold.getAttribute('aria-hidden')).toBe('true'));
    });
  },
};
