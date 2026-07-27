import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fireEvent } from 'storybook/test';
import { _testsWaitForText } from '../../../__tests__/utils';
import { ReqoreKeyboardShortcut } from '../../components/KeyboardShortcut';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreMessage,
  ReqoreTextarea,
  ReqoreVerticalSpacer,
} from '../../index';
import { StoryMeta } from '../utils';
import { SizeArg } from '../utils/args';

const meta = {
  title: 'Utilities/KeyboardShortcut',
  component: ReqoreKeyboardShortcut,
  argTypes: {
    ...SizeArg,
  },
  args: {
    shortcut: 'mod+k',
  },
} as StoryMeta<typeof ReqoreKeyboardShortcut>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyboardShortcut in its default configuration.',
      },
    },
  },
  render: (args) => (
    <ReqoreControlGroup vertical>
      <ReqoreKeyboardShortcut {...args} shortcut='mod+k' />
      <ReqoreKeyboardShortcut {...args} shortcut='ctrl+shift+s' />
      <ReqoreKeyboardShortcut {...args} shortcut={['mod+k', 'ctrl+j']} />
      <ReqoreKeyboardShortcut {...args} shortcut='shift+/' />
      <ReqoreKeyboardShortcut {...args} shortcut='escape' />
    </ReqoreControlGroup>
  ),
};

export const OnButtons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyboardShortcut attached to buttons.',
      },
    },
  },
  render: () => {
    const [count, setCount] = useState(0);

    return (
      <ReqoreControlGroup vertical>
        <ReqoreMessage intent='info'>Pressed {count} time(s)</ReqoreMessage>
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup wrap>
          <ReqoreButton
            icon='SearchLine'
            shortcut='mod+k'
            onClick={() => setCount((c) => c + 1)}
            className='shortcut-button'
          >
            Search
          </ReqoreButton>
          <ReqoreButton icon='Save3Line' shortcut='mod+s' intent='success'>
            Save
          </ReqoreButton>
          <ReqoreButton icon='DeleteBinLine' shortcut='mod+shift+backspace' intent='danger'>
            Delete
          </ReqoreButton>
          <ReqoreButton icon='SettingsLine' shortcut='mod+,' shortcutHint={false}>
            Settings (hidden hint)
          </ReqoreButton>
        </ReqoreControlGroup>
      </ReqoreControlGroup>
    );
  },
  play: async ({ canvasElement }) => {
    // The hint badge renders next to the button label
    await expect(
      canvasElement.querySelector('.shortcut-button .reqore-keyboard-shortcut')
    ).toBeTruthy();

    // `mod` is ⌘ on macOS and Ctrl elsewhere; press both so it matches on any
    // platform (react-hotkeys-hook only checks the platform-appropriate one).
    fireEvent.keyDown(document, { key: 'k', code: 'KeyK', metaKey: true, ctrlKey: true });

    // waitFor the click handler's state update to flush before asserting
    await _testsWaitForText('Pressed 1 time(s)');
  },
};

export const OnInputs: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders KeyboardShortcut attached to inputs.',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical fluid>
      <ReqoreInput
        placeholder='Press / to focus'
        focusRules={{ type: 'keypress', shortcut: '/', doNotInsertShortcut: true }}
      />
      <ReqoreTextarea
        placeholder='Press k to focus'
        focusRules={{ type: 'keypress', shortcut: 'k', doNotInsertShortcut: true }}
      />
    </ReqoreControlGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.reqore-keyboard-shortcut').length).toBe(2);
  },
};
