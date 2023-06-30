import { Meta, Story } from '@storybook/react/types-6-0';
import ReqoreButton from '../../components/Button';
import { IReqoreDropdownProps } from '../../components/Dropdown';
import { ReqoreControlGroup, ReqoreDropdown, ReqoreInput } from '../../index';
import { argManager } from '../utils/args';

const { createArg, disableArg } = argManager<IReqoreDropdownProps>();

export default {
  title: 'Form/Dropdown/Stories',
  parameters: {
    chromatic: {
      delay: 1500,
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
          divider: true,
          label: 'Divider',
          dividerAlign: 'left',
        },
        {
          selected: true,
          value: 'Hello',
          icon: 'SunCloudyLine',
        },
        {
          value: 'How are ya',
          icon: 'BatteryChargeFill',
          description:
            "Yep, and the description is now also available and possible, isn't that great?",
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
  if (args.scrollToSelected || args.paging) {
    return (
      <ReqoreControlGroup>
        <ReqoreDropdown
          {...args}
          label={args.label}
          isDefaultOpen
          filterable
          scrollToSelected={args.scrollToSelected}
          paging={args.paging}
          items={Array(130)
            .fill(null)
            .map((_, i) => ({
              label: `Item ${i}`,
              value: `item-${i}`,
              selected: i === 55,
            }))}
        />
      </ReqoreControlGroup>
    );
  }

  return (
    <>
      <ReqoreControlGroup wrap>
        <ReqoreDropdown label='Default Dropdown' {...args} />
        <ReqoreDropdown label='Disabled if empty' {...args} items={[]} />
        <ReqoreDropdown
          icon='SunCloudyLine'
          label='Custom icon'
          {...args}
          leftIconColor='warning:lighten:2'
        />
        <ReqoreDropdown
          rightIcon='SunCloudyLine'
          caretPosition='right'
          {...args}
          iconColor='success:lighten:2'
        >
          Custom icon with caret on right
        </ReqoreDropdown>
        <ReqoreDropdown
          items={[
            {
              selected: true,
              label: 'Hello',
              value: 'hello',
              icon: 'SunCloudyLine',
            },
            {
              label: 'How are ya',
              value: 'howareya',
              icon: 'BatteryChargeFill',
            },
            {
              disabled: true,
              label: 'i aM diSAblEd',
              value: 'disabled',
              icon: 'StopCircleLine',
            },
            {
              label: 'With right button',
              value: 'kek',
              icon: 'CheckDoubleLine',
            },
          ]}
        />
        <ReqoreDropdown label='Disabled with items' {...args} disabled />
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
export const ScrollToSelectedItem = Template.bind({});
ScrollToSelectedItem.args = {
  scrollToSelected: true,
  label: 'Dropdown that scrolls to selected item',
};
export const WithPaging: Story<IReqoreDropdownProps> = Template.bind({});
WithPaging.args = {
  paging: {
    itemsPerPage: 50,
    changePageOnScroll: 'horizontal',
  },
  label: 'Dropdown with paging',
};

export const WithLoadMore: Story<IReqoreDropdownProps> = Template.bind({});
WithLoadMore.args = {
  paging: {
    fluid: true,
    infinite: true,
    scrollOnLoadMore: true,
    loadMoreLabel: 'Load additional items...',
    showLabels: true,
    includeBottomControls: false,
  },
  label: 'Dropdown with load more',
};

export const WithCustomPaging: Story<IReqoreDropdownProps> = Template.bind({});
WithCustomPaging.args = {
  paging: {
    fluid: true,
    infinite: true,
    scrollOnLoadMore: true,
    pageControlsPosition: 'both',
    loadMoreLabel: 'Load additional items...',
    showLabels: true,
    loadMoreButtonProps: {
      textAlign: 'center',
      effect: {
        gradient: {
          colors: 'info',
          animate: 'hover',
        },
        textSize: 'small',
        uppercase: true,
        spaced: 3,
      },
    },
  },
  label: 'Dropdown with custom paging',
};

WithCustomPaging.play = () => {};
