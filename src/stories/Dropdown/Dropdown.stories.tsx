import { StoryFn, StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import { useState } from 'react';
import { _testsClickButton, _testsWaitForText } from '../../../__tests__/utils';
import ReqoreButton, { IReqoreButtonProps } from '../../components/Button';
import { IReqoreDropdownProps } from '../../components/Dropdown';
import { sleep } from '../../helpers/utils';
import { ReqoreControlGroup, ReqoreDropdown, ReqoreInput } from '../../index';
import { StoryMeta } from '../utils';
import { argManager } from '../utils/args';

const { createArg, disableArg } = argManager<IReqoreDropdownProps>();

const meta = {
  title: 'Form/Dropdown/Stories',
  component: ReqoreDropdown,
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
    }),
  },
  args: {
    component: ReqoreButton,
    filterable: true,
    items: [
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
  },
} as StoryMeta<typeof ReqoreDropdown<IReqoreButtonProps>>;

export default meta;

type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof ReqoreDropdown<IReqoreButtonProps>> = (args) => {
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
          label='Custom icon with caret on right'
          {...args}
          iconColor='success:lighten:2'
        />
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

export const Basic: Story = {
  render: Template,
};

export const CustomListTheme: Story = {
  render: Template,
  args: {
    listCustomTheme: {
      main: '#160437',
    },
  },
};

export const CustomComponent: Story = {
  render: Template,

  args: {
    component: ReqoreInput,
    placeholder: 'Custom component',
    label: undefined,
  },
};

export const ScrollToSelectedItem: Story = {
  render: Template,

  args: {
    scrollToSelected: true,
    label: 'Dropdown that scrolls to selected item',
  },
};

export const WithCustomFilter: Story = {
  render: Template,

  args: {
    label: 'Dropdown with custom filter',
    filterPlaceholder: 'Custom filter placeholder',
    filter: 'something',
    onFilterChange: (value) => {
      console.log(value);
    },
  },
};

export const WithPaging: Story = {
  render: Template,

  args: {
    paging: {
      itemsPerPage: 50,
      changePageOnScroll: 'horizontal',
    },
    label: 'Dropdown with paging',
  },
};

export const WithLoadMore: Story = {
  render: Template,

  args: {
    paging: {
      fluid: true,
      infinite: true,
      scrollOnLoadMore: true,
      loadMoreLabel: 'Load additional items...',
      showLabels: true,
      includeBottomControls: false,
    },
    label: 'Dropdown with load more',
  },
};

export const WithCustomPaging: Story = {
  render: Template,

  args: {
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
  },

  play: () => {},
};

export const WithChildItems: Story = {
  render: (args) => {
    const [val, setVal] = useState<any>(args.label);

    return <ReqoreDropdown {...args} onItemSelect={(item) => setVal(item.label)} label={val} />;
  },
  args: {
    label: 'Dropdown with child items',
    useTargetWidth: true,
    minWidth: '500px',
    items: [
      {
        label: 'Test',
        description: 'I have children',
        leftIconProps: {
          image:
            'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
        },
        rightIcon: 'MenuLine',
        rightIconColor: 'info:lighten:2',
        items: [
          {
            label: 'Test child 1',
          },
          {
            label: 'Test child 2',
          },
          {
            label: 'Test child 3',
            intent: 'info',
            description: 'I have children too',
            rightAction: {
              icon: 'AddLine',
              onClick: (_event, _itemId, _closePopover, metadata) => {
                metadata?.selectItem();
              },
            },
            items: [
              {
                label: 'Test deep child 1',
              },
              {
                label: 'Test deep child 2',
              },
              {
                label: 'Test deep child 3',
              },
            ],
          },
          {
            label: 'Test child 4',
          },
        ],
      },
      {
        label: 'Normal item',
        description: 'I have no children',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Dropdown with child items')[0]);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Test')[0]);
  },
};

export const ItemWithItemsCanBeSelected: Story = {
  ...WithChildItems,
  play: async ({ canvasElement, ...rest }) => {
    await WithChildItems.play({ canvasElement, ...rest });

    await _testsClickButton({ selector: '.reqore-menu-item-right-action' });

    await sleep(200);

    await _testsWaitForText('Test child 3');
  },
};

export const WithChildItemsAndCustomTheme = {
  ...WithChildItems,
  args: {
    ...WithChildItems.args,
    listCustomTheme: {
      main: '#160437',
    },
  },
};

export const WithCustomElements: Story = {
  render: Template,

  args: {
    paging: {
      itemsPerPage: 50,
      changePageOnScroll: 'horizontal',
    },
    label: 'Dropdown with paging',
    customElements: [
      <ReqoreControlGroup size='small'>
        <ReqoreButton icon='Bold' />
        <ReqoreButton icon='Italic' intent='info' />
      </ReqoreControlGroup>,
    ],
  },
};
export const WithKeyboardNavigation: Story = {
  render: Template,

  args: {
    label: 'Dropdown with keyboard navigation',
    keyboardNavigation: true,
    items: Array(20)
      .fill(null)
      .map((_, i) => ({
        label: `Item ${i + 1}`,
        value: `item-${i}`,
      })),
  },
};
