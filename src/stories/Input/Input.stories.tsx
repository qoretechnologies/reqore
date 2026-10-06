import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import ReqoreInput, { IReqoreInputProps } from '../../components/Input';
import { ReqoreButton, ReqoreControlGroup } from '../../index';
import { StoryMeta } from '../utils';
import { StoryForm, storyFormText } from '../utils/formPreview';
import { ALL_SIZES, FlatArg, IconArg, MinimalArg, RadiusSizeArg, SizeArg } from '../utils/args';

const meta = {
  title: 'Form/Input',
  component: ReqoreInput,
  argTypes: {
    ...MinimalArg,
    ...FlatArg,
    ...SizeArg,
    ...RadiusSizeArg,
    ...IconArg('icon', 'Icon'),
  },
  args: {
    icon: 'SearchLine',
  },
} as StoryMeta<typeof ReqoreInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof ReqoreInput> = (args: IReqoreInputProps) => {
  const [value, setValue] = useState('Input value');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleValueClear = () => {
    setValue('');
  };

  return (
    <>
      <ReqoreControlGroup wrap>
        <ReqoreInput {...args} placeholder='Reqore Input' onChange={handleValueChange} />
        <ReqoreInput
          {...args}
          placeholder='Minimal Input'
          minimal
          onChange={handleValueChange}
          rightIcon='ClipboardLine'
        />
        <ReqoreInput
          {...args}
          placeholder='Flat Input'
          flat
          tooltip="I'm a tooltip"
          onChange={handleValueChange}
        />
        <ReqoreInput
          {...args}
          iconColor='pending:lighten:2'
          placeholder='Clearable Input'
          onClearClick={handleValueClear}
          onChange={handleValueChange}
          leftIconProps={{ size: 'tiny' }}
        />
        <ReqoreInput
          {...args}
          iconColor='pending:lighten:2'
          placeholder='Clearable Input w/ icon'
          onClearClick={handleValueClear}
          onChange={handleValueChange}
          rightIcon='EraserFill'
          rightIconColor='#8727b7'
          focusRules={{ type: 'keypress', shortcut: '.', doNotInsertShortcut: true }}
        />
        <ReqoreInput {...args} placeholder='Disabled Input' disabled onChange={handleValueChange} />
        <ReqoreInput
          {...args}
          placeholder='Read Only Input'
          readOnly
          rightIcon='Bus2Fill'
          rightIconColor='info'
          onChange={handleValueChange}
        />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup wrap>
        <ReqoreInput
          {...args}
          placeholder='Reqore Input'
          onChange={handleValueChange}
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Minimal Input'
          minimal
          onChange={handleValueChange}
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Flat Input'
          flat
          tooltip="I'm a tooltip"
          onChange={handleValueChange}
          rightIcon='DragMoveLine'
          rightIconColor='#eb0e8c'
          value={value}
        />
        <ReqoreInput
          {...args}
          placeholder='Clearable Input'
          onClearClick={handleValueClear}
          value={value}
          focusRules={{ type: 'auto' }}
          onChange={handleValueChange}
        />
        <ReqoreInput
          {...args}
          placeholder='Clearable Input w/ icon'
          onClearClick={handleValueClear}
          value={value}
          rightIcon='FilePptFill'
          rightIconColor='#508a90'
          onChange={handleValueChange}
        />
        <ReqoreInput
          {...args}
          placeholder='Disabled Input'
          disabled
          onChange={handleValueChange}
          value={value}
        />
        <ReqoreInput {...args} placeholder='Read Only Input' readOnly value={value} />
      </ReqoreControlGroup>
      <br />
      <ReqoreControlGroup fluid>
        <ReqoreInput
          {...args}
          placeholder='Fluid Input'
          onChange={handleValueChange}
          value={value}
          focusRules={{ type: 'keypress', shortcut: 'k' }}
        />
      </ReqoreControlGroup>
    </>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input in its default configuration.',
      },
    },
  },
  render: Template,
};

export const Info: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with intent="info".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'info',
  },
};

export const Success: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with intent="success".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'success',
  },
};

export const Warning: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with intent="warning".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'warning',
  },
};

export const Danger: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with intent="danger".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'danger',
  },
};

export const Pending: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with intent="pending".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'pending',
  },
};

export const Muted: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with intent="muted".',
      },
    },
  },
  render: Template,

  args: {
    intent: 'muted',
  },
};

export const Effect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with a gradient/typography effect applied.',
      },
    },
  },
  render: Template,

  args: {
    effect: {
      gradient: {
        colors: {
          0: '#56345e',
          100: 'transparent',
        },
      },
    },
  },
};

export const Transparent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input with a transparent background.',
      },
    },
  },
  render: Template,

  args: {
    transparent: true,
    effect: {
      gradient: {
        colors: {
          0: '#56345e',
          100: 'transparent',
        },
      },
    },
  },
};

export const Pill: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input in its pill shape.',
      },
    },
  },
  render: Template,

  args: {
    pill: true,
  },
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input in its loading state.',
      },
    },
  },
  render: Template,

  args: {
    loading: true,
  },
};

export const RadiusSize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input at every radius size to show the border-radius scale.',
      },
    },
  },
  render: () => (
    // size='huge' so the bigger radius values aren't clamped to half the
    // input's height (which is what would happen at size='normal' for big /
    // huge / massive). Use `pill` instead when you want a fully rounded input.
    <ReqoreControlGroup vertical gapSize='small'>
      {ALL_SIZES.map((rs) => (
        <ReqoreInput
          key={rs}
          size='huge'
          radiusSize={rs}
          placeholder={`radiusSize="${rs}"`}
          icon='SearchLine'
        />
      ))}
    </ReqoreControlGroup>
  ),
};

export const ShortcutHint: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Input showing the keyboard-shortcut hint.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState('Clearable value');

    return (
      <ReqoreControlGroup vertical fluid gapSize='small'>
        <ReqoreInput
          icon='SearchLine'
          placeholder='Press / to focus'
          focusRules={{ type: 'keypress', shortcut: '/', doNotInsertShortcut: true }}
        />
        {/* Clearable + value: the hint badge should sit to the left of the clear button */}
        <ReqoreInput
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onClearClick={() => setValue('')}
          placeholder='Clearable, press k to focus'
          focusRules={{ type: 'keypress', shortcut: 'k', doNotInsertShortcut: true }}
        />
        {/* Clearable + value + right icon: badge sits left of both */}
        <ReqoreInput
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onClearClick={() => setValue('')}
          rightIcon='Calendar2Line'
          placeholder='Clearable + right icon'
          focusRules={{ type: 'keypress', shortcut: 'l', doNotInsertShortcut: true }}
        />
        <ReqoreInput
          placeholder='Hint hidden via shortcutHint={false}'
          shortcutHint={false}
          focusRules={{ type: 'keypress', shortcut: 'j', doNotInsertShortcut: true }}
        />
      </ReqoreControlGroup>
    );
  },
  play: async ({ canvasElement }) => {
    // Three of the four inputs render a hint (the last opts out)
    await expect(canvasElement.querySelectorAll('.reqore-keyboard-shortcut').length).toBe(3);
  },
};

/* -------------------------------------------------------------------------------------------
 * The show-password toggle (`passwordToggle`).
 * ----------------------------------------------------------------------------------------- */

const PasswordField = (props: Partial<IReqoreInputProps>) => {
  const [value, setValue] = useState('correct horse battery');

  return (
    <ReqoreInput
      type='password'
      name='password'
      placeholder='Password'
      fluid
      passwordToggle
      {...props}
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
      onClearClick={props.onClearClick ? () => setValue('') : undefined}
    />
  );
};

const PasswordForm = () => (
  <StoryForm>
    <ReqoreControlGroup vertical fluid>
      <PasswordField className='story-password' icon='LockPasswordLine' />
      <ReqoreButton type='submit' intent='info' fixed>
        Sign in
      </ReqoreButton>
    </ReqoreControlGroup>
  </StoryForm>
);

const passwordInput = () => document.querySelector('.story-password') as HTMLInputElement;
const passwordToggle = () =>
  document.querySelector('.reqore-input-password-toggle') as HTMLButtonElement;

export const PasswordToggle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a password field with `passwordToggle` in a form: the password is hidden and an eye button at the end of the field, labelled "Show password", shows it. The toggle is a `type="button"`, so it is not what submits the form.',
      },
    },
  },
  render: PasswordForm,
  play: async () => {
    const input = await waitFor(() => {
      expect(passwordInput()).toBeTruthy();
      return passwordInput();
    });
    const toggle = passwordToggle();

    expect(input.type).toBe('password');
    expect(toggle.type).toBe('button');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-controls')).toBe(input.id);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await waitFor(() => expect(storyFormText('posts')).toBe('password=correct horse battery'));
  },
};

export const PasswordToggleShown: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the password field after its eye button was clicked while typing: the password reads in clear text, the button turns into "Hide password" (crossed-out eye), the field keeps the focus, the value and the caret, and nothing was submitted.',
      },
    },
  },
  render: PasswordForm,
  play: async () => {
    const input = await waitFor(() => {
      expect(passwordInput()).toBeTruthy();
      return passwordInput();
    });

    await userEvent.click(input);
    input.setSelectionRange(8, 8);
    await userEvent.click(passwordToggle());

    await waitFor(() => expect(input.type).toBe('text'));
    expect(input.value).toBe('correct horse battery');
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([8, 8]);
    expect(passwordToggle().getAttribute('aria-label')).toBe('Hide password');
    expect(passwordToggle().getAttribute('aria-pressed')).toBe('true');
    expect(storyFormText('submitted')).toBeUndefined();
  },
};

export const PasswordToggleKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the password field driven from the keyboard: Tab moves from the field to its eye button (focus ring on the button) and Enter shows the password; the form is not submitted. Pressing Enter in the field afterwards does submit it, with the password.',
      },
    },
  },
  render: PasswordForm,
  play: async () => {
    const input = await waitFor(() => {
      expect(passwordInput()).toBeTruthy();
      return passwordInput();
    });

    await userEvent.click(input);
    await userEvent.tab();
    await waitFor(() => expect(document.activeElement).toBe(passwordToggle()));
    await userEvent.keyboard('{Enter}');

    await waitFor(() => expect(input.type).toBe('text'));
    expect(storyFormText('submitted')).toBeUndefined();

    await userEvent.click(input);
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(storyFormText('submitted')).toBe('password=correct horse battery')
    );

    // Leave the button focused for the snapshot: that is the state this story shows.
    passwordToggle().focus();
  },
};

export const PasswordToggleWithOtherIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders password fields with `passwordToggle` at every size, next to a clear button, a right icon and a keyboard-shortcut hint: the eye button always sits at the very end and the others move left to make room, so nothing overlaps and the text stops before them. The last field is disabled, and so is its toggle; the one with translated labels says "Zobrazit heslo".',
      },
    },
  },
  render: () => (
    <ReqoreControlGroup vertical gapSize='small' fluid>
      {ALL_SIZES.map((size) => (
        <PasswordField key={size} size={size} />
      ))}
      <PasswordField onClearClick={() => undefined} rightIcon='ShieldKeyholeLine' />
      <PasswordField
        focusRules={{ type: 'keypress', shortcut: 'p', doNotInsertShortcut: true }}
        passwordToggle={{ showLabel: 'Zobrazit heslo', hideLabel: 'Skrýt heslo' }}
        className='story-translated'
      />
      <PasswordField disabled />
    </ReqoreControlGroup>
  ),
  play: async () => {
    const toggles = await waitFor(() => {
      const found = document.querySelectorAll('.reqore-input-password-toggle');
      expect(found.length).toBe(ALL_SIZES.length + 3);
      return Array.from(found) as HTMLButtonElement[];
    });

    expect(toggles[toggles.length - 1].disabled).toBe(true);
    expect(toggles[toggles.length - 2].getAttribute('aria-label')).toBe('Zobrazit heslo');

    // The toggle is the last thing in the field, and the clear button and the right icon
    // sit left of it without overlapping.
    const field = toggles[ALL_SIZES.length].closest('.reqore-control-wrapper') as HTMLElement;
    const toggleBox = toggles[ALL_SIZES.length].getBoundingClientRect();
    const fieldBox = field.getBoundingClientRect();
    expect(Math.round(fieldBox.right - toggleBox.right)).toBeLessThanOrEqual(1);

    const others = Array.from(
      field.querySelectorAll('.reqore-clear-input-button, .reqore-icon:not(.reqore-button *)')
    ).map((element) => element.getBoundingClientRect());
    others.forEach((box) => expect(box.right).toBeLessThanOrEqual(toggleBox.left + 1));
  },
};

export const PasswordToggleMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 700 } },
    docs: {
      description: {
        story:
          'Renders the sign-in password field on a phone-width screen (380px): the field fills the width with the eye button at its end, and tapping the button shows the password.',
      },
    },
  },
  render: PasswordForm,
  play: async () => {
    const input = await waitFor(() => {
      expect(passwordInput()).toBeTruthy();
      return passwordInput();
    });

    await userEvent.click(passwordToggle());
    await waitFor(() => expect(input.type).toBe('text'));

    const field = input.closest('.reqore-control-wrapper') as HTMLElement;
    expect(field.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
  },
};
