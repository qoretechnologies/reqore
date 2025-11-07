import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { noop } from 'lodash';
import { _testsWaitForText } from '../../../__tests__/utils';
import ReqoreButton, { IReqoreButtonProps } from '../../components/Button';
import { IReqoreDropdownProps } from '../../components/Dropdown';
import { sleep } from '../../helpers/utils';
import { ReqoreDropdown } from '../../index';
import { StoryMeta } from '../utils';
import { argManager } from '../utils/args';
import { WithChildItems } from './Dropdown.stories';

const { createArg, disableArg } = argManager<IReqoreDropdownProps>();

const meta = {
  title: 'Form/Dropdown/Tests',
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
  },
} as StoryMeta<typeof ReqoreDropdown<IReqoreButtonProps>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ListIsClosedWhenItemIsClicked: Story = {
  args: {
    label: 'Default dropdown',
    onItemSelect: noop,
    items: [
      {
        label: 'Test item 1',
      },
      {
        label: 'Test item 2',
      },
      {
        label: 'Test item 3',
      },
    ],
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Default dropdown')[0]);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Test item 1')[0]);

    await sleep(200);

    await expect(document.querySelector('.reqore-popover-content')).toBeFalsy();
  },
};

export const ListIsClosedWhenItemActionIsClicked: Story = {
  args: {
    label: 'Default dropdown',
    onItemSelect: noop,
    items: [
      {
        label: 'Test item 1',
      },
      {
        label: 'Test item 2',
      },
      {
        label: 'Test item 3',
        rightAction: {
          label: 'Close',
          onClick: (_e, _id, closePopover) => {
            closePopover();
          },
        },
      },
    ],
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Default dropdown')[0]);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Close')[0]);

    await sleep(200);

    await expect(document.querySelector('.reqore-popover-content')).toBeFalsy();
  },
};

export const ItemsCanBeTraversed: Story = {
  ...WithChildItems,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await WithChildItems.play({ canvasElement, ...rest });

    await waitFor(() => expect(canvas.getAllByText('Test child 3')[0]).toBeTruthy(), {
      timeout: 5000,
    });

    await fireEvent.click(canvas.getAllByText('Test child 3')[0]);

    await expect(canvas.getAllByText('Test deep child 3')[0]).toBeTruthy();
  },
};

export const ItemIsAutomaticallySelected: Story = {
  ...WithChildItems,
  args: {
    label: 'Dropdown with a single child item',
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
        ],
      },
    ],
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Dropdown with a single child item')[0]);

    await sleep(200);

    await waitFor(() => expect(canvas.getAllByText('Test child 3')[0]).toBeTruthy(), {
      timeout: 5000,
    });
  },
};

export const ItemIsNotAutomaticallySelectedWhenDisabled: Story = {
  ...WithChildItems,
  args: {
    label: 'Dropdown with a single child item',
    useTargetWidth: true,
    minWidth: '500px',
    items: [
      {
        label: 'Test',
        description: 'I have children',
        disabled: true,
        leftIconProps: {
          image:
            'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
        },
        rightIcon: 'MenuLine',
        rightIconColor: 'info:lighten:2',
        items: [
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
        ],
      },
    ],
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Dropdown with a single child item')[0]);

    await sleep(200);

    await waitFor(() => expect(canvas.getAllByText('Test child 3')[0]).toBeTruthy(), {
      timeout: 5000,
    });
  },
};

export const ItemIsNotAutomaticallySelectedWhenSubItemsAreEmpty: Story = {
  ...WithChildItems,
  args: {
    label: 'Dropdown with a single child item',
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
        items: [],
      },
    ],
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    await fireEvent.click(canvas.getAllByText('Dropdown with a single child item')[0]);

    await sleep(200);

    await waitFor(() => expect(canvas.getAllByText('Test child 3')[0]).toBeTruthy(), {
      timeout: 5000,
    });
  },
};

export const BackButtonsWork: Story = {
  ...ItemsCanBeTraversed,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await ItemsCanBeTraversed.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.reqore-dropdown-back-button'));

    await expect(canvas.getAllByText('Test child 3')[0]).toBeTruthy();
  },
};

export const EmptySearch: Story = {
  ...BackButtonsWork,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await BackButtonsWork.play({ canvasElement, ...rest });

    await fireEvent.change(document.querySelector('.reqore-input'), {
      target: { value: 'asdasdasd' },
    });

    await _testsWaitForText('No items found');
  },
};
