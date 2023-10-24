import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
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

export const BackButtonsWork: Story = {
  ...ItemsCanBeTraversed,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await ItemsCanBeTraversed.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.reqore-dropdown-back-button'));

    await expect(canvas.getAllByText('Test child 3')[0]).toBeTruthy();
  },
};
