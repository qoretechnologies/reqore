import { Globals } from '@react-spring/web';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  ReqoreButton,
  ReqoreCheckbox,
  ReqoreContent,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreRadioGroup,
  ReqoreTextarea,
  ReqoreUIProvider,
} from '../src';

/**
 * Reqore controls inside a plain, server-posted HTML form (qoretechnologies/reqore#688, #689):
 * what the form posts, which element the keyboard and screen readers get, and that a press is
 * heard exactly once.
 */

beforeAll(() => {
  Globals.assign({ skipAnimation: true });
});

const wrap = (ui: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const posted = (form: HTMLFormElement) => Array.from(new FormData(form).entries());

// A button draws its label more than once (the hover animation), so find it by its first copy.
const control = (text: string) =>
  screen.getAllByText(text)[0].closest('button, a') as HTMLButtonElement & HTMLAnchorElement;

describe('ReqoreButton form and link attributes', () => {
  it('passes type, name, value and form to the button, and adds no type of its own', () => {
    wrap(
      <>
        <ReqoreButton type='submit' name='accept' value='yes' form='terms'>
          Accept
        </ReqoreButton>
        <ReqoreButton>Plain</ReqoreButton>
      </>
    );

    const accept = control('Accept');
    expect(accept.getAttribute('type')).toBe('submit');
    expect(accept.getAttribute('name')).toBe('accept');
    expect(accept.getAttribute('value')).toBe('yes');
    expect(accept.getAttribute('form')).toBe('terms');

    // The default is the HTML one, as it always was: no attribute, so a submit.
    expect(control('Plain').hasAttribute('type')).toBe(false);
  });

  it('posts the name and value of the submit button that was pressed', () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      return (event.nativeEvent as SubmitEvent).submitter;
    });

    wrap(
      <form onSubmit={onSubmit}>
        <ReqoreButton type='submit' name='decision' value='cancel'>
          Decline
        </ReqoreButton>
        <ReqoreButton type='button'>Does not submit</ReqoreButton>
      </form>
    );

    fireEvent.click(control('Does not submit'));
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(control('Decline'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders as a link when given an href', () => {
    wrap(
      <ReqoreButton href='https://example.com/login' target='_blank' rel='noopener'>
        Sign in with Example
      </ReqoreButton>
    );

    const link = control('Sign in with Example');
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com/login');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener');
    expect(link.hasAttribute('type')).toBe(false);
    expect(link.classList.contains('reqore-button')).toBe(true);
  });

  it('a disabled link has nothing to follow and says it is disabled', () => {
    wrap(
      <ReqoreButton href='https://example.com/login' disabled>
        Unavailable
      </ReqoreButton>
    );

    const link = control('Unavailable');
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.hasAttribute('disabled')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
  });
});

describe('ReqoreTextarea form attributes', () => {
  it('passes name, required and the length limits to the textarea, and posts it', () => {
    wrap(
      <form data-testid='form'>
        <ReqoreTextarea name='about' required maxLength={200} minLength={2} value='Hello' />
      </form>
    );

    const textarea = document.querySelector('textarea');
    expect(textarea.getAttribute('name')).toBe('about');
    expect(textarea.required).toBe(true);
    expect(textarea.maxLength).toBe(200);
    expect(textarea.minLength).toBe(2);
    expect(posted(screen.getByTestId('form') as HTMLFormElement)).toEqual([['about', 'Hello']]);
  });
});

describe('ReqoreInput password toggle', () => {
  const Field = (props: { onToggle?: (visible: boolean) => void; labels?: boolean }) => {
    const [value, setValue] = useState('secret');

    return (
      <form data-testid='form' onSubmit={(event) => event.preventDefault()}>
        <ReqoreInput
          type='password'
          name='password'
          value={value}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
          passwordToggle={
            props.labels
              ? { showLabel: 'Heslo zobrazit', hideLabel: 'Heslo skrýt', onToggle: props.onToggle }
              : { onToggle: props.onToggle }
          }
        />
      </form>
    );
  };

  it('is not there unless asked for, or for anything but a password', () => {
    wrap(
      <>
        <ReqoreInput type='password' />
        <ReqoreInput type='text' passwordToggle />
      </>
    );

    expect(document.querySelectorAll('.reqore-input-password-toggle').length).toBe(0);
  });

  it('shows and hides the password without submitting the form or losing the value', () => {
    const onToggle = vi.fn();
    const onSubmit = vi.fn();
    wrap(<Field onToggle={onToggle} />);
    (screen.getByTestId('form') as HTMLFormElement).addEventListener('submit', onSubmit);

    const input = document.querySelector('.reqore-input') as HTMLInputElement;
    const toggle = document.querySelector('.reqore-input-password-toggle') as HTMLButtonElement;

    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle.getAttribute('type')).toBe('button');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(input.id).toBeTruthy();
    expect(toggle.getAttribute('aria-controls')).toBe(input.id);
    expect(input.type).toBe('password');

    input.focus();
    input.setSelectionRange(2, 4);
    // A pointer press does not take the focus from the field.
    expect(fireEvent.mouseDown(toggle)).toBe(false);
    fireEvent.click(toggle);

    expect(input.type).toBe('text');
    expect(input.value).toBe('secret');
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 4]);
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(onToggle).toHaveBeenLastCalledWith(true);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(posted(screen.getByTestId('form') as HTMLFormElement)).toEqual([['password', 'secret']]);

    fireEvent.click(toggle);
    expect(input.type).toBe('password');
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it('takes translated labels and keeps a caller id', () => {
    wrap(
      <>
        <Field labels />
        <ReqoreInput type='password' id='kc-password' passwordToggle />
      </>
    );

    const toggles = document.querySelectorAll('.reqore-input-password-toggle');
    expect(toggles[0].getAttribute('aria-label')).toBe('Heslo zobrazit');
    expect(toggles[1].getAttribute('aria-controls')).toBe('kc-password');
  });

  it('is disabled with a disabled field', () => {
    wrap(<ReqoreInput type='password' disabled passwordToggle />);

    expect(
      (document.querySelector('.reqore-input-password-toggle') as HTMLButtonElement).disabled
    ).toBe(true);
  });
});

describe('ReqoreCheckbox as a form control', () => {
  const nativeOf = (container: Element) =>
    container.querySelector('.reqore-checkbox-input') as HTMLInputElement;

  it('renders a native checkbox, labelled by its label and described by its description', () => {
    wrap(
      <ReqoreCheckbox
        label='Remember me'
        description='On this device only'
        name='rememberMe'
        checked
        aria-invalid
        aria-describedby='hint'
      />
    );

    const input = nativeOf(document.body);
    expect(input.type).toBe('checkbox');
    expect(input.name).toBe('rememberMe');
    expect(input.checked).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Remember me')).toBe(input);

    const described = input.getAttribute('aria-describedby').split(' ');
    expect(described).toContain('hint');
    expect(
      described.some((id) => document.getElementById(id)?.textContent === 'On this device only')
    ).toBe(true);

    // The aria-* went to the control, not to the row.
    expect(document.querySelector('.reqore-checkbox').hasAttribute('aria-invalid')).toBe(false);
    // The drawing is not a second tab stop.
    expect(document.querySelectorAll('.reqore-checkbox [tabindex="0"]').length).toBe(0);
  });

  it('is a switch to a screen reader when drawn as one', () => {
    wrap(<ReqoreCheckbox asSwitch label='Notifications' checked={false} />);

    expect(nativeOf(document.body).getAttribute('role')).toBe('switch');
  });

  it('posts its value only when checked, and `on` without one', () => {
    const { rerender } = render(
      <ReqoreUIProvider>
        <form data-testid='form'>
          <ReqoreCheckbox name='rememberMe' checked={false} />
          <ReqoreCheckbox name='terms' value='accepted' checked />
        </form>
      </ReqoreUIProvider>
    );

    expect(posted(screen.getByTestId('form') as HTMLFormElement)).toEqual([['terms', 'accepted']]);

    rerender(
      <ReqoreUIProvider>
        <form data-testid='form'>
          <ReqoreCheckbox name='rememberMe' checked />
          <ReqoreCheckbox name='terms' value='accepted' checked />
        </form>
      </ReqoreUIProvider>
    );

    expect(posted(screen.getByTestId('form') as HTMLFormElement)).toEqual([
      ['rememberMe', 'on'],
      ['terms', 'accepted'],
    ]);
  });

  const Controlled = (props: { onClick: () => void; readOnly?: boolean }) => {
    const [checked, setChecked] = useState(false);

    return (
      <ReqoreCheckbox
        label='Remember me'
        name='rememberMe'
        checked={checked}
        readOnly={props.readOnly}
        onClick={() => {
          props.onClick();
          setChecked(!checked);
        }}
      />
    );
  };

  it('hears a press on the drawing, on the label and from the keyboard exactly once', () => {
    const onClick = vi.fn();
    const outer = vi.fn();
    render(
      <ReqoreUIProvider>
        <div onClick={outer}>
          <Controlled onClick={onClick} />
        </div>
      </ReqoreUIProvider>
    );
    const input = nativeOf(document.body);

    // The drawing (where a pointer lands).
    fireEvent.click(document.querySelector('.reqore-checkbox-box'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(outer).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);

    // The label.
    fireEvent.click(screen.getByText('Remember me'));
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(outer).toHaveBeenCalledTimes(2);
    expect(input.checked).toBe(false);

    // `Space` on the focused native input activates it with a click.
    fireEvent.click(input);
    expect(onClick).toHaveBeenCalledTimes(3);
    expect(outer).toHaveBeenCalledTimes(3);
    expect(input.checked).toBe(true);
  });

  it('a read-only checkbox still calls its handler but never toggles itself', () => {
    const onClick = vi.fn();
    wrap(<ReqoreCheckbox readOnly checked={false} onClick={onClick} label='Fixed' />);
    const input = nativeOf(document.body);

    expect(input.getAttribute('aria-readonly')).toBe('true');
    // The keyboard's click is cancelled, which is what keeps a native checkbox as it was
    // (jsdom does not restore the checkedness; the browser story asserts that part).
    expect(fireEvent.click(input)).toBe(false);
    fireEvent.click(document.querySelector('.reqore-checkbox-box'));
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('a disabled checkbox has a disabled native input', () => {
    wrap(<ReqoreCheckbox disabled label='Off' />);

    expect(nativeOf(document.body).disabled).toBe(true);
  });

  it('an uncontrolled checkbox follows its native input', () => {
    const onChange = vi.fn();
    wrap(
      <form data-testid='form'>
        <ReqoreCheckbox name='newsletter' defaultChecked={false} inputProps={{ onChange }} />
      </form>
    );
    const input = nativeOf(document.body);

    fireEvent.click(document.querySelector('.reqore-checkbox-box'));
    expect(input.checked).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(posted(screen.getByTestId('form') as HTMLFormElement)).toEqual([['newsletter', 'on']]);

    fireEvent.click(input);
    expect(input.checked).toBe(false);
    expect(posted(screen.getByTestId('form') as HTMLFormElement)).toEqual([]);
  });

  it('a switch toggled from the keyboard calls the half it moves to', () => {
    const onCheckClick = vi.fn();
    const onUncheckClick = vi.fn();
    const { rerender } = wrap(
      <ReqoreCheckbox asSwitch checked={false} {...{ onCheckClick, onUncheckClick }} />
    );

    fireEvent.click(nativeOf(document.body));
    expect(onCheckClick).toHaveBeenCalledTimes(1);

    rerender(
      <ReqoreUIProvider>
        <ReqoreCheckbox asSwitch checked {...{ onCheckClick, onUncheckClick }} />
      </ReqoreUIProvider>
    );
    fireEvent.click(nativeOf(document.body));
    expect(onUncheckClick).toHaveBeenCalledTimes(1);
  });
});

describe('ReqoreRadioGroup as a form control', () => {
  const items = [
    { label: 'Authenticator app', value: 'otp-1' },
    { label: 'Backup phone', value: 'otp-2' },
    { label: 'Retired key', value: 'otp-3', disabled: true },
  ];

  it('is a radiogroup of native radios that posts the selected value', () => {
    const onSelectClick = vi.fn();
    wrap(
      <form data-testid='form'>
        <ReqoreRadioGroup
          aria-label='Your devices'
          name='selectedCredentialId'
          required
          items={items}
          selected='otp-2'
          onSelectClick={onSelectClick}
        />
      </form>
    );

    expect(screen.getByRole('radiogroup', { name: 'Your devices' })).toBeTruthy();

    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(radios.map((radio) => radio.value)).toEqual(['otp-1', 'otp-2', 'otp-3']);
    expect(radios.every((radio) => radio.name === 'selectedCredentialId')).toBe(true);
    expect(radios.every((radio) => radio.required)).toBe(true);
    expect(radios.map((radio) => radio.checked)).toEqual([false, true, false]);
    expect(radios[2].disabled).toBe(true);
    expect(screen.getByLabelText('Authenticator app')).toBe(radios[0]);
    expect(posted(screen.getByTestId('form') as HTMLFormElement)).toEqual([
      ['selectedCredentialId', 'otp-2'],
    ]);

    // The keyboard selects through the native radio.
    fireEvent.click(radios[0]);
    expect(onSelectClick).toHaveBeenCalledTimes(1);
    expect(onSelectClick).toHaveBeenCalledWith('otp-1');
  });
});
