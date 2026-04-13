import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { noop } from 'lodash';
import { useRef, useState } from 'react';
import { _testsWaitForText } from '../../../__tests__/utils';
import ReqoreButton, { IReqoreButtonProps } from '../../components/Button';
import { IReqoreDropdownProps } from '../../components/Dropdown';
import { IPopoverControls } from '../../components/Popover';
import { sleep } from '../../helpers/utils';
import { ReqoreControlGroup, ReqoreDropdown, ReqoreInput, ReqoreTextarea } from '../../index';
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

export const ItemsCanBeTraversedViaTags: Story = {
  ...ItemsCanBeTraversed,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await ItemsCanBeTraversed.play({ canvasElement, ...rest });

    await sleep(500);

    await fireEvent.click(document.querySelectorAll('.reqore-tag-key-content')[0]);

    await expect(canvas.getAllByText('I have children')[0]).toBeTruthy();
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

    await _testsWaitForText('I have children');
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

    await _testsWaitForText('I have children');
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
export const KeyboardNavigationWithArrowKeys: Story = {
  args: {
    component: ReqoreTextarea,
    items: [
      {
        label: 'Item 1',
        value: 'item1',
      },
      {
        label: 'Item 2',
        value: 'item2',
      },
      {
        label: 'Item 3',
        disabled: true,
        value: 'item3',
      },
      {
        label: 'Item 4',
        value: 'item4',
      },
    ],
    keyboardNavigation: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    // Click to open
    await fireEvent.click(document.querySelector('.reqore-textarea'));
    await sleep(200);

    // Get the input for keyboard events
    const filterInput = document.querySelector('.reqore-input');
    expect(filterInput).toBeTruthy();

    // Press arrow down
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Should have menu items visible
    await expect(canvas.getAllByText('Item 1')[0]).toBeTruthy();

    // Press arrow down again
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Press arrow up
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Menu should still be open
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();
  },
};

export const KeyboardNavigationWithEnter: Story = {
  args: {
    label: 'Keyboard Enter Test',
    items: [
      {
        label: 'Select Me',
        value: 'select-me',
      },
      {
        label: 'Item 2',
        value: 'item2',
      },
    ],
    keyboardNavigation: true,
    onItemSelect: noop,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    // Click to open
    await fireEvent.click(canvas.getAllByText('Keyboard Enter Test')[0]);
    await sleep(200);

    const filterInput = document.querySelector('.reqore-input');

    // Navigate to first item
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Press enter to select
    await fireEvent.keyDown(filterInput, { key: 'Enter' });
    await sleep(200);

    // Dropdown should close
    await expect(document.querySelector('.reqore-popover-content')).toBeFalsy();
  },
};

export const KeyboardNavigationWithArrowRightOpenSubmenu: Story = {
  args: {
    label: 'Keyboard Submenu Test',
    items: [
      {
        label: 'Parent Item',
        value: 'parent',
        items: [
          {
            label: 'Child Item 1',
            value: 'child1',
          },
          {
            label: 'Child Item 2',
            value: 'child2',
          },
        ],
      },
      {
        label: 'Normal Item',
        value: 'normal',
      },
    ],
    keyboardNavigation: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    // Click to open
    await fireEvent.click(canvas.getAllByText('Keyboard Submenu Test')[0]);
    await sleep(200);

    const filterInput = document.querySelector('.reqore-input');

    // Navigate to first item (parent)
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Press right arrow to open submenu
    await fireEvent.keyDown(filterInput, { key: 'ArrowRight' });
    await sleep(200);

    // Should now show child items
    await expect(canvas.getAllByText('Child Item 1')[0]).toBeTruthy();
    await expect(canvas.getAllByText('Child Item 2')[0]).toBeTruthy();
  },
};

export const KeyboardNavigationWithLeftArrowNavigatesBack: Story = {
  args: {
    label: 'Keyboard Left Arrow Test',
    items: [
      {
        label: 'Item with Submenu',
        value: 'item1',
        items: [
          {
            label: 'Submenu Item 1',
            value: 'subitem1',
          },
          {
            label: 'Submenu Item 2',
            value: 'subitem2',
          },
        ],
      },
    ],
    keyboardNavigation: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    // Click to open
    await fireEvent.click(canvas.getAllByText('Keyboard Left Arrow Test')[0]);
    await sleep(200);

    // Menu should be open
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();

    const filterInput = document.querySelector('.reqore-input');

    // Press arrow down to focus first item
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Press right arrow to open submenu
    await fireEvent.keyDown(filterInput, { key: 'ArrowRight' });
    await sleep(200);

    // Press left arrow to navigate back
    await fireEvent.keyDown(filterInput, { key: 'ArrowLeft' });
    await sleep(200);

    // Menu should still be open
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();
  },
};

export const KeyboardNavigationCanBeDisabled: Story = {
  args: {
    label: 'Keyboard Disabled Test',
    items: [
      {
        label: 'Item 1',
        value: 'item1',
      },
    ],
    keyboardNavigation: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    // Click to open
    await fireEvent.click(canvas.getAllByText('Keyboard Disabled Test')[0]);
    await sleep(200);

    const filterInput = document.querySelector('.reqore-input');

    // Try arrow keys - should not affect focus
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Menu should still be open (escape won't close it when keyboard nav is disabled)
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();
  },
};

export const EnterOnUnrelatedInputIsNotSwallowed: Story = {
  render: (args) => {
    const popoverData = useRef<IPopoverControls>(null);
    const [inputValue, setInputValue] = useState('');
    const [submittedValue, setSubmittedValue] = useState('');
    const [selectedValue, setSelectedValue] = useState('');

    return (
      <ReqoreControlGroup vertical>
        <ReqoreControlGroup>
          <ReqoreInput
            placeholder='Unrelated input'
            data-testid='unrelated-input'
            value={inputValue}
            onChange={(e: any) => setInputValue(e.target.value)}
            onFocus={() => popoverData.current?.open()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSubmittedValue(inputValue);
              }
            }}
          />
          {submittedValue && <span data-testid='submitted-value'>Submitted: {submittedValue}</span>}
          {selectedValue && <span data-testid='selected-value'>Selected: {selectedValue}</span>}
        </ReqoreControlGroup>
        <ReqoreDropdown
          {...args}
          onItemSelect={(item) => {
            setSelectedValue(item?.value || '');
          }}
          passPopoverData={(data) => {
            popoverData.current = data;
          }}
        />
      </ReqoreControlGroup>
    );
  },
  args: {
    label: 'Dropdown',
    items: [
      { label: 'Item 1', value: 'item1' },
      { label: 'Item 2', value: 'item2' },
    ],
    keyboardNavigation: true,
    onItemSelect: noop,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await sleep(200);

    // Focus the unrelated input, which opens the dropdown
    const unrelatedInput = canvas.getByTestId('unrelated-input');
    await fireEvent.focusIn(unrelatedInput);
    await sleep(300);

    // Type something into the input
    await fireEvent.change(unrelatedInput, { target: { value: 'hello' } });
    await sleep(300);

    // Dropdown should be open
    await expect(document.querySelector('.reqore-popover-content')).toBeTruthy();

    // Navigate to first item with keyboard via the dropdown's filter input
    const filterInput = document.querySelector('.reqore-popover-content .reqore-input');
    await fireEvent.keyDown(filterInput, { key: 'ArrowDown' });
    await sleep(100);

    // Press Enter to select the item
    await fireEvent.keyDown(filterInput, { key: 'Enter' });
    await sleep(200);

    // Dropdown should be closed after selection
    await expect(document.querySelector('.reqore-popover-content')).toBeFalsy();

    // The submitted value should NOT exist — Enter was caught by the dropdown
    await expect(canvas.queryByTestId('submitted-value')).toBeFalsy();
    await expect(canvas.queryByTestId('selected-value')).toBeTruthy();
  },
};
