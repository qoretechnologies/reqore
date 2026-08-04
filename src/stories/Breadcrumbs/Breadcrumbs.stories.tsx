import { StoryObj } from '@storybook/react';
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
