import { StoryFn, StoryObj } from '@storybook/react';
import { noop } from 'lodash';
import { IReqoreTagProps } from '../../components/Tag';
import { IReqoreTagGroup } from '../../components/Tag/group';
import { ReqoreTag, ReqoreTagGroup, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { ALL_SIZES, RadiusSizeArg, SizeArg, argManager } from '../utils/args';

const { createArg } = argManager<IReqoreTagGroup & IReqoreTagProps>();

const meta = {
  title: 'Form/Tag',
  component: ReqoreTag,
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
    ...RadiusSizeArg,
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
} as StoryMeta<typeof ReqoreTag>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreTagProps> = (args) => {
  return (
    <>
      <ReqoreTagGroup>
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
          label={null}
          icon='Asterisk'
          onClick={() => console.log('Tag clicked')}
        />
        <ReqoreTag
          {...args}
          onRemoveClick={null}
          rightIcon={null}
          label={null}
          icon='UsbLine'
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
        <ReqoreTag
          {...args}
          labelKey='Without label'
          icon='AlarmWarningLine'
          rightIcon='24HoursFill'
        />
        <ReqoreTag
          label='With Icon Colors'
          icon='AlarmWarningLine'
          {...args}
          iconColor='warning:lighten:2'
        />
        <ReqoreTag labelKey='Tag with' label='Label Key' icon='AlarmWarningLine' {...args} />
        <ReqoreTag
          labelKey='Compact Tag with'
          label='Label Key'
          icon='AlarmWarningLine'
          compact
          {...args}
        />
        <ReqoreTag labelKey='Key' label='value' {...args} />
        <ReqoreTag icon='QuestionAnswerLine' {...args} fixed />
        <ReqoreTag label='Non Flat Tag' icon='BaiduLine' flat={false} {...args} />
        <ReqoreTag label='Disabled Tag' disabled icon='AlarmWarningLine' {...args} />
        <ReqoreTag
          label='300px Tag'
          width='300px'
          fixed
          icon='AlarmWarningLine'
          {...args}
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
          {...args}
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
        <ReqoreTag label='Transparent tag' icon='Ghost2Line' {...args} color='transparent' />
        <ReqoreTag
          label='Custom Color Tag'
          icon='AlarmWarningLine'
          color='#38fdb2'
          {...args}
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
          {...args}
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
          labelKey='Minimal Tag '
          label='with Intent and Key'
          minimal
          intent='success'
          icon='CodeView'
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
          {...args}
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
          {...args}
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
      <ReqoreVerticalSpacer height={5} />
      <ReqoreTagGroup>
        <ReqoreTag label='Center aligned' align='center' {...args} />
      </ReqoreTagGroup>
      <ReqoreVerticalSpacer height={5} />
      <ReqoreTagGroup>
        <ReqoreTag label='Right aligned' align='right' {...args} />
      </ReqoreTagGroup>
      <ReqoreTagGroup>
        <ReqoreTag
          label='With hidden action'
          {...args}
          actions={[...args.actions, { icon: 'VolumeDownLine', show: 'hover' }]}
        />
      </ReqoreTagGroup>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Badge: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with a badge attached.',
      },
    },
  },
  render: Template,
  args: { asBadge: true },
};

export const Wrap: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with content wrapping enabled.',
      },
    },
  },
  render: Template,
  args: { wrap: true },
};

export const Minimal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag in its minimal variant.',
      },
    },
  },
  render: Template,
  args: { minimal: true },
};

export const NotFlat: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with flat={false} so the elevated look is applied.',
      },
    },
  },
  render: Template,
  args: { flat: false },
};

export const WithTextAligns: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with different text alignments across the items.',
      },
    },
  },
  render: Template,
  args: { labelAlign: 'right', labelKeyAlign: 'center' },
};

export const Effect = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag with a gradient/typography effect applied.',
      },
    },
  },
  render: Template,

  args: {
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
  },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag in its loading state.',
      },
    },
  },
  render: Template,
  args: { loading: true },
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Tag at every radius size to show the border-radius scale.',
      },
    },
  },
  render: () => (
    <ReqoreTagGroup>
      {ALL_SIZES.map((rs) => (
        <ReqoreTag key={rs} size='normal' radiusSize={rs} label={`radiusSize="${rs}"`} />
      ))}
    </ReqoreTagGroup>
  ),
};
