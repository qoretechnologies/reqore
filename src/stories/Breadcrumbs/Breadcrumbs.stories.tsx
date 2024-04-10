import { StoryObj } from '@storybook/react';
import { ReqoreBreadcrumbs } from '../../index';
import breadcrumbs, { breadcrumbsTabs, specialbreadcrumbs } from '../../mock/breadcrumbs';
import { StoryMeta } from '../utils';
import { SizeArg } from '../utils/args';

const meta = {
  title: 'Navigation/Breadcrumbs/Stories',
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

export const Default: Story = {};
export const WithTabs: Story = { args: { items: [...breadcrumbs, breadcrumbsTabs] } };
export const Flat: Story = { args: { flat: true } };
export const Special: Story = { args: { items: specialbreadcrumbs } };
