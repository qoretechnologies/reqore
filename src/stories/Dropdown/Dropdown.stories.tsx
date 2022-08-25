import { Meta, Story } from '@storybook/react/types-6-0';
import ReqoreButton from '../../components/Button';
import { IReqoreDropdownProps } from '../../components/Dropdown';
import { IReqoreInputProps } from '../../components/Input';
import { ReqoreControlGroup, ReqoreDropdown, ReqoreInput } from '../../index';
import { argManager } from '../utils/args';

const { createArg } = argManager<IReqoreDropdownProps<IReqoreInputProps>>();

export default {
  title: 'Components/Dropdown',
  argTypes: {
    ...createArg('component', {
      defaultValue: ReqoreButton,
      table: {
        disable: true,
      },
    }),
    ...createArg('componentProps', {
      table: {
        disable: true,
      },
    }),
    ...createArg('filterable', {
      defaultValue: true,
      name: 'Filterable',
      type: 'boolean',
    }),
    ...createArg('items', {
      table: {
        disable: true,
      },

      defaultValue: [
        {
          selected: true,
          label: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          label: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          label: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          label: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          label: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          label: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          label: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          label: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          label: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          label: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          label: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          label: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          label: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          label: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          label: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          label: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          label: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          label: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
      ],
    }),
  },
} as Meta<IReqoreDropdownProps<IReqoreInputProps>>;

const Template: Story<IReqoreDropdownProps<IReqoreInputProps>> = (
  args: IReqoreDropdownProps<IReqoreInputProps>
) => {
  return (
    <>
      <ReqoreControlGroup>
        <ReqoreDropdown label='Default Dropdown' {...args} />
        <ReqoreDropdown label='Disabled if empty' {...args} items={[]} />
        <ReqoreDropdown icon='SunCloudyLine' label='Custom icon' {...args} />
        <ReqoreDropdown rightIcon='SunCloudyLine' caretPosition='right' {...args}>
          Custom icon with caret on right
        </ReqoreDropdown>
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreDropdown
          rightIcon='SunCloudyLine'
          caretPosition='right'
          label='Open By Default'
          {...args}
          componentProps={{ placeholder: 'Fluid component' }}
          isDefaultOpen
          useTargetWidth
        />
      </ReqoreControlGroup>
    </>
  );
};

export const Basic = Template.bind({});
export const CustomComponent = Template.bind({});
CustomComponent.args = {
  component: ReqoreInput,
  componentProps: {
    placeholder: 'Custom component',
  },
};
