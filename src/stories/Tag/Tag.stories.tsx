import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import { IReqoreTagProps } from '../../components/Tag';
import { IReqoreTagGroup } from '../../components/Tag/group';
import { ReqoreTag, ReqoreTagGroup } from '../../index';
import { argManager, SizeArg } from '../utils/args';

const { createArg } = argManager<IReqoreTagGroup & IReqoreTagProps>();

export default {
  title: 'Components/Tag',
  argTypes: {
    ...SizeArg,
    ...createArg('columns', {
      name: 'Columns',
      description: 'Number of columns',
      control: 'number',
    }),
    ...createArg('onClick', {
      defaultValue: noop,
      table: {
        disable: true,
      },
    }),
    ...createArg('onRemoveClick', {
      defaultValue: noop,
      table: {
        disable: true,
      },
    }),
    ...createArg('actions', {
      defaultValue: [
        {
          icon: '24HoursFill',
          onClick: noop,
          disabled: true,
          intent: 'info',
          tooltip: { content: 'I am a tooltip' },
        },
        {
          icon: 'PsychotherapyFill',
          onClick: noop,
        },
        {
          icon: 'SpyFill',
          onClick: noop,
          intent: 'success',
          tooltip: { content: 'Hm, another tooltip', openOnMount: true },
        },
      ],
      table: {
        disable: true,
      },
    }),
  },
} as Meta<IReqoreTagGroup & IReqoreTagProps>;

const Template: Story<IReqoreTagGroup & IReqoreTagProps> = ({ columns, ...args }) => {
  return (
    <ReqoreTagGroup columns={columns} size={args.size}>
      <ReqoreTag label='Basic Tag' icon='AlarmWarningLine' {...args} />
      <ReqoreTag label='Disabled Tag' disabled icon='AlarmWarningLine' {...args} />
      <ReqoreTag label='300px Tag' width='300px' icon='AlarmWarningLine' {...args} />
      <ReqoreTag label='Danger Tag' icon='AlarmWarningLine' intent='danger' {...args} />
      <ReqoreTag label='Custom Color Tag' icon='AlarmWarningLine' color='#38fdb2' {...args} />
    </ReqoreTagGroup>
  );
};

export const Basic = Template.bind({});
export const Badge = Template.bind({});
Badge.args = { badge: true };
