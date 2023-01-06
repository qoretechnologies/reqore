import { Meta, Story } from '@storybook/react/types-6-0';
import { noop } from 'lodash';
import { IReqoreTagProps } from '../../components/Tag';
import { IReqoreTagGroup } from '../../components/Tag/group';
import { ReqoreTag, ReqoreTagGroup } from '../../index';
import { SizeArg, argManager } from '../utils/args';

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
    ...createArg('rightIcon', {
      defaultValue: 'EBike2Line',
      name: 'Right Icon',
      description: 'Right icon',
      control: 'text',
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
          icon: 'SpyFill',
          onClick: noop,
          intent: 'success',
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
    <ReqoreTagGroup columns={columns} size={args.size} gapSize={args.gapSize}>
      <ReqoreTag {...args} actions={null} onRemoveClick={null} rightIcon={null} label={1} />
      <ReqoreTag
        {...args}
        actions={null}
        onRemoveClick={null}
        rightIcon={null}
        label='Basic Tag'
        onClick={() => console.log('Tag clicked')}
      />
      <ReqoreTag
        {...args}
        actions={null}
        onRemoveClick={null}
        rightIcon={null}
        labelKey='Number'
        label={2}
      />
      <ReqoreTag label='With Icon' icon='AlarmWarningLine' {...args} />
      <ReqoreTag labelKey='Tag with' label='Label Key' icon='AlarmWarningLine' {...args} />
      <ReqoreTag labelKey='Key' label='value' {...args} />
      <ReqoreTag icon='QuestionAnswerLine' {...args} />
      <ReqoreTag label='Disabled Tag' disabled icon='AlarmWarningLine' {...args} />
      <ReqoreTag
        label='300px Tag'
        width='300px'
        icon='AlarmWarningLine'
        {...args}
        tooltip='I am wiiiiiiide'
        actions={[
          {
            icon: '24HoursFill',
            onClick: noop,
            disabled: true,
            intent: 'info',
            tooltip: { content: 'I am a tooltip' },
          },
          {
            icon: 'SpyFill',
            onClick: noop,
            intent: 'success',
            tooltip: { content: 'Hm, another tooltip', openOnMount: true },
          },
        ]}
      />
      <ReqoreTag label='Danger Tag' icon='AlarmWarningLine' intent='danger' {...args} />
      <ReqoreTag
        label='Custom Color Tag'
        icon='AlarmWarningLine'
        color='#38fdb2'
        {...args}
        tooltip={{ content: 'Hm, another tooltip', openOnMount: true }}
      />
      <ReqoreTag
        {...args}
        label='No Buttons Tag'
        icon='CarLine'
        color='#0b4578'
        rightIcon={args.rightIcon}
        actions={null}
        onRemoveClick={null}
      />
      <ReqoreTag
        {...args}
        label='Minimal Tag'
        minimal
        icon='ShareForward2Fill'
        rightIcon={args.rightIcon}
        actions={null}
        onRemoveClick={null}
      />
      <ReqoreTag
        {...args}
        label='Minimal Tag with Intent'
        minimal
        intent='warning'
        icon='ShareForward2Fill'
        rightIcon={args.rightIcon}
        actions={null}
        onRemoveClick={null}
      />
      <ReqoreTag
        {...args}
        labelKey='This is the key for a wrapped tag'
        label='Wrapped tag with some long text and width specified, no wrap specified'
        icon='ShareForward2Fill'
        rightIcon={args.rightIcon}
        width='400px'
        onRemoveClick={null}
        actions={[
          {
            icon: '24HoursFill',
            onClick: noop,
            disabled: true,
            intent: 'info',
            tooltip: { content: 'I am a tooltip' },
          },
          {
            icon: 'SpyFill',
            onClick: noop,
            intent: 'success',
            tooltip: { content: 'Hm, another tooltip', openOnMount: true },
          },
        ]}
      />
      <ReqoreTag
        {...args}
        labelKey='This is the key for a wrapped tag'
        label='Wrapped tag with some long text and NO width specified, AND wrap specified'
        icon='ShareForward2Fill'
        rightIcon={args.rightIcon}
        wrap
        onRemoveClick={null}
        actions={[
          {
            icon: '24HoursFill',
            onClick: noop,
            disabled: true,
            intent: 'info',
            tooltip: { content: 'I am a tooltip' },
          },
          {
            icon: 'SpyFill',
            onClick: noop,
            intent: 'success',
            tooltip: { content: 'Hm, another tooltip', openOnMount: true },
          },
        ]}
      />
    </ReqoreTagGroup>
  );
};

export const Basic = Template.bind({});
export const BigGapSize = Template.bind({});
BigGapSize.args = { gapSize: 'big' };
export const Badge = Template.bind({});
Badge.args = { asBadge: true };

export const Effect = Template.bind({});
Effect.args = {
  effect: {
    gradient: {
      direction: 'to right bottom',
      colors: { 0: '#33023c', 100: '#0a487b' },
    },
    color: '#ffffff',
    spaced: 2,
    uppercase: true,
    weight: 'thick',
    textSize: 'small',
  },
};
