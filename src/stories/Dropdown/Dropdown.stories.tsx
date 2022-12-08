import { Meta, Story } from '@storybook/react/types-6-0';
import { useState } from 'react';
import ReqoreButton from '../../components/Button';
import { IReqoreDropdownProps } from '../../components/Dropdown';
import { ReqoreControlGroup, ReqoreDropdown, ReqoreInput, ReqoreTag } from '../../index';
import { argManager } from '../utils/args';

const { createArg, disableArg } = argManager<IReqoreDropdownProps>();

export default {
  title: 'Components/Dropdown',
  parameters: {
    chromatic: {
      delay: 500,
    },
  },
  argTypes: {
    ...disableArg('multiSelect'),
    ...createArg('component', {
      defaultValue: ReqoreButton,
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
          value: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          value: 'How are ya, I am super long item and I am not going to fit in the dropdown',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          value: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          value: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          value: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          value: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          value: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          value: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          value: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          value: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          value: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          value: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          value: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          value: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          value: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
        {
          selected: true,
          value: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          value: 'How are ya',
          icon: 'BatteryChargeFill',
        },
        {
          disabled: true,
          value: 'i aM diSAblEd',
          icon: 'StopCircleLine',
        },
      ],
    }),
  },
} as Meta<IReqoreDropdownProps>;

const Template: Story<IReqoreDropdownProps> = (args: IReqoreDropdownProps) => {
  const [selected, setSelected] = useState<string[]>(['Item 3', 'Item 6']);

  if (args.multiSelect) {
    return (
      <>
        <ReqoreControlGroup>
          <ReqoreDropdown
            label='Multi Select'
            multiSelect
            isDefaultOpen
            onItemSelect={({ label }) => setSelected([...selected, label])}
            items={Array(13)
              .fill(null)
              .map((_, i) => ({
                label: `Item ${i}`,
                value: `item-${i}`,
                selected: selected.includes(`Item ${i}`),
              }))}
          />
          {selected.map((item, index) => (
            <ReqoreTag label={item} key={index} />
          ))}
        </ReqoreControlGroup>
      </>
    );
  }

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
          placeholder='Fluid component'
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
  placeholder: 'Custom component',
};
export const MultiSelect = Template.bind({});
MultiSelect.args = {
  multiSelect: true,
};
