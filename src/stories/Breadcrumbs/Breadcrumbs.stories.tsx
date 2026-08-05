import { StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import { ReqoreBreadcrumbs, ReqoreButton, ReqoreControlGroup } from '../../index';
import breadcrumbs, { breadcrumbsTabs, specialbreadcrumbs } from '../../mock/breadcrumbs';
import { StoryMeta } from '../utils';
import { SizeArg } from '../utils/args';

const meta = {
  title: 'Navigation/Breadcrumbs',
  component: ReqoreBreadcrumbs,
  argTypes: {
    withTabs: {
      name: 'With tabs',
      description: 'Whether tabs should be shown alongside the breadcrumbs',
      control: 'boolean',
    },
    ...SizeArg,
  },
  args: { items: breadcrumbs },
} as StoryMeta<typeof ReqoreBreadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in its default configuration.',
      },
    },
  },};
export const WithTabs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs with tabs rendered inside.',
      },
    },
  }, args: { items: [...breadcrumbs, breadcrumbsTabs] } };
export const Flat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in its flat variant.',
      },
    },
  }, args: { flat: true } };
export const Special: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs in a special configuration.',
      },
    },
  }, args: { items: specialbreadcrumbs } };
export const CustomTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Breadcrumbs with a custom theme override applied.',
      },
    },
  },
  args: {
    items: breadcrumbs,
    customTheme: {
      main: '#ff69b4',
    },
  },
};

// A right-hand action rail next to a long trail in a width-constrained bar. The
// responsive collapse RESERVES the rail's width (so items never overrun it), the
// ancestors fold into a "…" group, and the last (current-page) crumb stays
// visible and truncates with an ellipsis rather than clipping into the rail.
export const WithReservedRightElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A right element (action rail) has its width reserved by the responsive collapse, so the trail never overruns it; the leaf crumb stays visible and truncates instead of clipping.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '640px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { label: 'Interfaces', icon: 'Home3Line' },
          { label: 'Jobs', icon: 'CalendarLine', badge: [128] },
          {
            label: 'A New Scheduled Job With A Rather Long Name',
            icon: 'CalendarLine',
            readOnly: true,
            badge: [{ label: 'Saved', icon: 'CheckLine', intent: 'success' }],
          },
        ]}
        rightElement={
          <ReqoreControlGroup>
            <ReqoreButton icon='EditLine' minimal flat />
            <ReqoreButton icon='FileCopyLine' minimal flat />
            <ReqoreButton icon='DeleteBinLine' intent='danger' minimal flat />
            <ReqoreButton icon='CheckLine' intent='success'>
              Submit
            </ReqoreButton>
          </ReqoreControlGroup>
        }
      />
    </div>
  ),
};

// Regression guard for the no-overlap invariant: in a width-constrained bar the
// trail and the right-hand element (an action rail) must never overlap, at any
// width. The trail collapses ancestors into the "…" menu and truncates the
// current page; the right element keeps its full width. The play asserts, via
// `getBoundingClientRect`, that the trail's right edge never crosses into the
// right element — the core guarantee of the flex layout.
export const NoOverlapWithRightElement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The trail (breadcrumbs) and a right-hand action rail share a narrow bar. They must never overlap: the trail collapses + truncates, the right element stays fully visible. The play asserts trail.right <= rightElement.left.',
      },
    },
  },
  render: (args) => (
    <div style={{ width: '480px', border: '1px dashed #555', padding: '4px' }}>
      <ReqoreBreadcrumbs
        {...args}
        items={[
          { label: 'Interfaces', icon: 'Home3Line' },
          { label: 'Jobs', icon: 'CalendarLine', badge: [128] },
          {
            label: 'A New Scheduled Job With A Rather Long Name',
            icon: 'CalendarLine',
            readOnly: true,
            badge: [{ label: 'Saved', icon: 'CheckLine', intent: 'success' }],
          },
        ]}
        rightElement={
          <ReqoreControlGroup>
            <ReqoreButton icon='EditLine' minimal flat />
            <ReqoreButton icon='FileCopyLine' minimal flat />
            <ReqoreButton icon='DeleteBinLine' intent='danger' minimal flat />
            <ReqoreButton icon='CheckLine' intent='success'>
              Submit
            </ReqoreButton>
          </ReqoreControlGroup>
        }
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Wait until the overflow measurement has run — the "…" menu appears once
    // the ancestors collapse, which only happens after a real layout pass.
    await waitFor(() =>
      expect(canvasElement.querySelector('.reqore-dropdown-control')).toBeInTheDocument()
    );

    const trail = canvasElement.querySelector('.reqore-breadcrumbs-trail') as HTMLElement;
    const right = canvasElement.querySelector('.reqore-breadcrumbs-right') as HTMLElement;
    await expect(trail).toBeInTheDocument();
    await expect(right).toBeInTheDocument();

    // The invariant: the trail never crosses into the right element (1px slack
    // for sub-pixel rounding). This is impossible to violate with the flex
    // `flex-shrink: 0` right region — the guard makes regressions loud.
    const trailRect = trail.getBoundingClientRect();
    const rightRect = right.getBoundingClientRect();
    await expect(trailRect.right).toBeLessThanOrEqual(rightRect.left + 1);

    // The current page stays reachable — either as an inline crumb (wider bars)
    // or, once the bar is this tight, as the single dropdown LABELLED with it.
    // Never folded away to nothing.
    await expect(
      canvasElement.querySelector('.reqore-breadcrumbs-overflow-current, .reqore-breadcrumbs-item')
    ).toBeInTheDocument();
  },
};
