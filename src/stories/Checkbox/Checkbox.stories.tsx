import { StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';
import Checkbox from '../../components/Checkbox';
import { ReqoreCheckbox, ReqoreControlGroup, ReqoreVerticalSpacer } from '../../index';
import { StoryMeta } from '../utils';
import { StoryForm, storyFormText } from '../utils/formPreview';

const meta = {
  title: 'Form/Checkbox',
  component: ReqoreCheckbox,
  args: {
    onCheckClick: () => alert('Checked!'),
    onUncheckClick: () => alert('Unchecked!'),
  },
} as StoryMeta<typeof ReqoreCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<typeof Checkbox> = (args) => {
  const [checked, setChecked] = useState<boolean>(args.checked ?? undefined);

  const handleCheckClick = () => {
    setChecked(true);
  };

  const handleUncheckChange = () => {
    setChecked(false);
  };

  return (
    <ReqoreControlGroup vertical>
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox
          {...args}
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelDetailPosition='left'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          tooltip='I am checked'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          checked={checked}
          tooltip='I am checked with intent'
          checkedIntent='success'
          uncheckedIntent='danger'
          unsetIntent='pending'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          disabled
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          checked={checked}
          labelDetail='Detail'
          labelPosition='left'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          label='Read Only'
          checked={checked}
          labelPosition='left'
          readOnly
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup wrap>
        <ReqoreCheckbox
          {...args}
          intent='info'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          checked={checked}
          labelDetail='Detail'
          labelDetailPosition='left'
          labelEffect={{ gradient: { colors: { 0: 'danger:lighten:1', 100: '#ff6700' } } }}
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          checked={checked}
          tooltip='I am checked'
          effect={{ gradient: { colors: { 0: '#00fafd', 100: '#ff00d0' } } }}
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
        />
        <ReqoreCheckbox
          {...args}
          disabled
          onText='yes'
          offText='no'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          onText='yes'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          onText='yes'
          offText='no'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Label'
          labelDetail='Detail'
          labelPosition='left'
          unsetIcon='EmotionNormalLine'
          checkedIcon='EmotionHappyFill'
          uncheckedIcon='EmotionSadFill'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
        <ReqoreCheckbox
          {...args}
          label='Read Only'
          labelPosition='left'
          readOnly
          image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
          onCheckClick={handleCheckClick}
          onUncheckClick={handleUncheckChange}
          checked={checked}
        />
      </ReqoreControlGroup>
      <ReqoreCheckbox
        {...args}
        label='Hello'
        description="I am a really long description that should be truncated with an ellipsis if it exceeds the width of the checkbox. Let's see how it looks!"
        onCheckClick={handleCheckClick}
        onUncheckClick={handleUncheckChange}
        checked={checked}
      />
      <ReqoreCheckbox
        {...args}
        labelPosition='left'
        label='Hello'
        description="I am a really long description that should be truncated with an ellipsis if it exceeds the width of the checkbox. Let's see how it looks!"
        onCheckClick={handleCheckClick}
        onUncheckClick={handleUncheckChange}
        checked={checked}
      />
    </ReqoreControlGroup>
  );
};

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Checkbox in its default configuration.',
      },
    },
  },
  render: Template,
};

export const BasicUnchecked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Checkbox in the basic unchecked state.',
      },
    },
  },
  render: Template,

  args: {
    checked: false,
  },
};

export const BasicChecked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Checkbox in the basic checked state.',
      },
    },
  },
  render: Template,

  args: {
    checked: true,
  },
};

export const SwitchUnset: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Checkbox as a switch in the unset state.',
      },
    },
  },
  render: Template,

  args: {
    asSwitch: true,
  },
};

export const SwitchUnchecked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Checkbox as a switch in the unchecked state.',
      },
    },
  },
  render: Template,

  args: {
    asSwitch: true,
    checked: false,
  },
};

export const SwitchChecked: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Checkbox as a switch in the checked state.',
      },
    },
  },
  render: Template,

  args: {
    asSwitch: true,
    checked: true,
  },
};

/* -------------------------------------------------------------------------------------------
 * As a form control. Every checkbox draws a real, visually hidden native input: the form posts
 * it, `Space` toggles it, a screen reader announces it, and its focus ring is drawn on the box.
 * ----------------------------------------------------------------------------------------- */

const FormTemplate: StoryFn<typeof Checkbox> = ({
  // The meta's demo handlers alert; a form story has no use for them.
  onCheckClick: _onCheckClick,
  onUncheckClick: _onUncheckClick,
  ...args
}) => {
  const [remember, setRemember] = useState(false);
  const [terms, setTerms] = useState(true);
  const [notify, setNotify] = useState(false);

  return (
    <StoryForm>
      <ReqoreControlGroup vertical>
        <ReqoreCheckbox
          {...args}
          label='Remember me'
          name='rememberMe'
          checked={remember}
          onClick={() => setRemember(!remember)}
          className='story-remember'
        />
        <ReqoreCheckbox
          {...args}
          label='I agree to the terms'
          description='Required to create the account'
          name='termsAccepted'
          value='yes'
          required
          checked={terms}
          onClick={() => setTerms(!terms)}
          className='story-terms'
        />
        <ReqoreCheckbox
          {...args}
          asSwitch
          label='Email me about new releases'
          name='newsletter'
          checked={notify}
          onClick={() => setNotify(!notify)}
          className='story-notify'
        />
      </ReqoreControlGroup>
    </StoryForm>
  );
};

const nativeInput = (className: string) =>
  document.querySelector(`.${className} .reqore-checkbox-input`) as HTMLInputElement;

export const FormControl: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders three checkboxes inside a plain HTML form, with what the form posts written under them. Clicking "Remember me" checks it and the form then posts `rememberMe=on`; the checked terms box posts its own `value` (`termsAccepted=yes`).',
      },
    },
  },
  render: FormTemplate,
  play: async () => {
    await waitFor(() => expect(storyFormText('posts')).toBe('termsAccepted=yes'));

    const remember = nativeInput('story-remember');
    expect(remember.type).toBe('checkbox');
    expect(remember.name).toBe('rememberMe');
    expect(document.querySelector('label[for="' + remember.id + '"]')?.textContent).toBe(
      'Remember me'
    );
    expect(nativeInput('story-notify').getAttribute('role')).toBe('switch');

    await userEvent.click(document.querySelector('.story-remember .reqore-checkbox-box'));

    await waitFor(() => expect(remember.checked).toBe(true));
    await waitFor(() =>
      expect(storyFormText('posts')).toBe('rememberMe=on · termsAccepted=yes')
    );
  },
};

export const FormControlKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the same form, driven from the keyboard. Tab reaches the first checkbox and draws the focus ring on its box; Space checks it, Tab moves on to the terms box, Space unchecks it, and the form posts only `rememberMe=on`.',
      },
    },
  },
  render: FormTemplate,
  play: async () => {
    await waitFor(() => expect(storyFormText('posts')).toBe('termsAccepted=yes'));

    await userEvent.tab();
    const remember = nativeInput('story-remember');
    await waitFor(() => expect(document.activeElement).toBe(remember));

    await userEvent.keyboard(' ');
    await waitFor(() => expect(remember.checked).toBe(true));

    await userEvent.tab();
    const terms = nativeInput('story-terms');
    await waitFor(() => expect(document.activeElement).toBe(terms));
    await userEvent.keyboard(' ');
    await waitFor(() => expect(terms.checked).toBe(false));

    await waitFor(() => expect(storyFormText('posts')).toBe('rememberMe=on'));

    // The ring is drawn on the focused box.
    const box = document.querySelector('.story-terms .reqore-checkbox-box');
    expect(getComputedStyle(box).outlineStyle).toBe('solid');
  },
};

export const FormControlSwitchKeyboard: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the form with the newsletter switch focused from the keyboard: the focus ring goes round the switch, and Space turns it on, so the form posts `newsletter=on` too.',
      },
    },
  },
  render: FormTemplate,
  play: async () => {
    const notify = await waitFor(() => {
      const input = nativeInput('story-notify');
      expect(input).toBeTruthy();
      return input;
    });

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await waitFor(() => expect(document.activeElement).toBe(notify));
    await userEvent.keyboard(' ');

    await waitFor(() => expect(notify.checked).toBe(true));
    await waitFor(() => expect(storyFormText('posts')).toBe('termsAccepted=yes · newsletter=on'));
    expect(
      getComputedStyle(document.querySelector('.story-notify .reqore-checkbox-box')).outlineStyle
    ).toBe('solid');
  },
};

export const FormControlUncontrolled: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders an uncontrolled checkbox (`defaultChecked`, no `checked`): the box follows its native input on its own. It starts checked, and clicking it unchecks it, so the form posts nothing.',
      },
    },
  },
  render: () => (
    <StoryForm>
      <ReqoreCheckbox
        label='Keep me signed in'
        name='keepSignedIn'
        defaultChecked
        className='story-uncontrolled'
      />
    </StoryForm>
  ),
  play: async () => {
    await waitFor(() => expect(storyFormText('posts')).toBe('keepSignedIn=on'));

    await userEvent.click(document.querySelector('.story-uncontrolled .reqore-checkbox-box'));

    await waitFor(() => expect(nativeInput('story-uncontrolled').checked).toBe(false));
    await waitFor(() => expect(storyFormText('posts')).toBe('nothing'));
  },
};

export const FormControlReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders a read-only, checked checkbox and a disabled one in a form. Space on the focused read-only box does not uncheck it (it is announced as read only), the disabled one is not reachable with Tab, and the form keeps posting `locked=on`.',
      },
    },
  },
  render: () => (
    <StoryForm>
      <ReqoreControlGroup vertical>
        <ReqoreCheckbox
          label='Managed by your organisation'
          name='locked'
          checked
          readOnly
          className='story-readonly'
        />
        <ReqoreCheckbox
          label='Not available'
          name='unavailable'
          disabled
          className='story-disabled'
        />
      </ReqoreControlGroup>
    </StoryForm>
  ),
  play: async () => {
    const locked = nativeInput('story-readonly');

    await userEvent.tab();
    await waitFor(() => expect(document.activeElement).toBe(locked));
    expect(locked.getAttribute('aria-readonly')).toBe('true');
    await userEvent.keyboard(' ');

    await waitFor(() => expect(locked.checked).toBe(true));
    expect(nativeInput('story-disabled').disabled).toBe(true);
    await waitFor(() => expect(storyFormText('posts')).toBe('locked=on'));
  },
};

export const FormControlMobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    qlip: { viewport: { width: 380, height: 700 } },
    docs: {
      description: {
        story:
          'Renders the checkbox form on a phone-width screen (380px): the labels and the description wrap inside the screen instead of running off it, and tapping a label checks its box.',
      },
    },
  },
  args: { wrapLabel: true },
  render: (args) => (
    <div style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
      <FormTemplate {...args} />
    </div>
  ),
  play: async () => {
    await waitFor(() => expect(storyFormText('posts')).toBe('termsAccepted=yes'));

    await userEvent.click(document.querySelector('.story-remember .reqore-checkbox-label'));
    await waitFor(() => expect(nativeInput('story-remember').checked).toBe(true));

    const form = document.querySelector('.story-form') as HTMLElement;
    expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth + 1);
  },
};
