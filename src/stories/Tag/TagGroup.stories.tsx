import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { IReqoreTagProps } from '../../components/Tag';
import { IReqoreTagGroup } from '../../components/Tag/group';
import { ReqoreTag, ReqoreTagGroup } from '../../index';
import { StoryMeta } from '../utils';
import { SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTagGroup & IReqoreTagProps>();

const meta = {
  title: 'Form/Tag Group/Stories',
  component: ReqoreTagGroup,
  args: {
    onClick: noop,
    onRemoveClick: noop,
    rightIcon: 'EBike2Line',
    actions: [
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
  },
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
      table: {
        disable: true,
      },
    }),
  },
} as StoryMeta<typeof ReqoreTagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreTagGroup & IReqoreTagProps> = (args) => {
  return (
    <ReqoreTagGroup {...args}>
      <ReqoreTag actions={null} onRemoveClick={null} rightIcon={null} label={1} />
      <ReqoreTag
        actions={null}
        onRemoveClick={null}
        rightIcon={null}
        label='Basic Tag'
        onClick={() => console.log('Tag clicked')}
      />
      <ReqoreTag actions={null} onRemoveClick={null} rightIcon={null} labelKey='Number' label={2} />
      <ReqoreTag label='With Icon' icon='AlarmWarningLine' />
      <ReqoreTag label='With Icon Colors' icon='AlarmWarningLine' iconColor='warning:lighten:2' />
      <ReqoreTag labelKey='Tag with' label='Label Key' icon='AlarmWarningLine' />
      <ReqoreTag labelKey='Key' label='value' />
      <ReqoreTag icon='QuestionAnswerLine' fixed />
      <ReqoreTag label='Disabled Tag' disabled icon='AlarmWarningLine' />
      <ReqoreTag
        label='300px Tag'
        width='300px'
        fixed
        icon='AlarmWarningLine'
        tooltip='I am wiiiiiiide'
        actions={[
          {
            icon: 'ErrorWarningLine',
            onClick: noop,
            intent: 'info',
            tooltip: {
              content: 'IF YOU CAN SEE ME ITS A BUG!!! I HAVE show: false',
              openOnMount: true,
              intent: 'danger',
            },
            show: false,
          },
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
        ]}
      />
      <ReqoreTag
        label='300px fixed Tag with a big description that should wrap and make the tag bigger'
        width='300px'
        fixed
        icon='AlarmWarningLine'
        tooltip='I am wiiiiiiide'
        actions={[
          {
            icon: 'ErrorWarningLine',
            onClick: noop,
            intent: 'info',
            tooltip: {
              content: 'IF YOU CAN SEE ME ITS A BUG!!! I HAVE show: false',
              openOnMount: true,
              intent: 'danger',
            },
            show: false,
          },
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
        ]}
      />
      <ReqoreTag label='Danger Tag' icon='AlarmWarningLine' intent='danger' {...args} />
      <ReqoreTag
        label='Custom Color Tag'
        icon='AlarmWarningLine'
        color='#38fdb2'
        tooltip={{ content: 'Hm, another tooltip', openOnMount: true }}
      />
      <ReqoreTag
        label='Custom Effect Tag'
        effect={{
          gradient: {
            colors: '#ff47a3',
          },
        }}
        labelKeyEffect={{
          gradient: {
            colors: '#b8f58a',
          },
          weight: 'thin',
          spaced: 2,
          uppercase: true,
        }}
        labelEffect={{
          gradient: {
            colors: {
              0: '#00e3e8',
              100: '#143a40',
            },
          },
          weight: 'bold',
        }}
        labelKey='Effect'
        icon='Css3Fill'
      />
      <ReqoreTag
        label='No Buttons Tag'
        icon='CarLine'
        color='#0b4578'
        rightIcon={args.rightIcon}
        actions={null}
        onRemoveClick={null}
      />
      <ReqoreTag
        label='Minimal Tag'
        minimal
        icon='ShareForward2Fill'
        rightIcon={args.rightIcon}
        actions={null}
        onRemoveClick={null}
      />
      <ReqoreTag
        label='Minimal Tag with Intent'
        minimal
        intent='warning'
        icon='ShareForward2Fill'
        rightIcon={args.rightIcon}
        actions={null}
        onRemoveClick={null}
      />
      <ReqoreTag
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
        labelKey='This is the key for a wrapped tag'
        label='Wrapped tag with some long text and NO width specified, AND wrap specified'
        icon='ShareForward2Fill'
        rightIcon={args.rightIcon}
        leftIconColor='#00fafd'
        rightIconColor='#eb0e8c'
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
      <ReqoreTag
        labelKey='Fixed'
        fixed='key'
        label='Wrapped tag with some long text and NO width specified, AND wrap specified, with fixed key'
        icon='DriveLine'
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
      <ReqoreTag
        labelKey='Wrapped tag with some long text and NO width specified, AND wrap specified, with fixed label, Wrapped tag with some long text and NO width specified, AND wrap specified, with fixed label'
        fixed='label'
        label='Fixed'
        icon='DriveLine'
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

export const Basic: Story = {
  render: Template,
};

export const BigGapSize: Story = {
  render: Template,
  args: { gapSize: 'big' },
};

export const NoWrap: Story = {
  render: Template,
  args: { wrap: false },
};
