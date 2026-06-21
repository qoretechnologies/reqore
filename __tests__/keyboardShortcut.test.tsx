import { fireEvent, render } from '@testing-library/react';
import {
  formatShortcut,
  formatShortcutCombo,
  ReqoreButton,
  ReqoreContent,
  ReqoreInput,
  ReqoreKeyboardShortcut,
  ReqoreLayoutContent,
  ReqoreUIProvider,
  shortcutHasModifier,
} from '../src';

describe('formatShortcut helpers', () => {
  it('formats a combo with the platform-appropriate glyphs', () => {
    // non-mac
    expect(formatShortcutCombo('mod+k', false)).toBe('Ctrl+K');
    expect(formatShortcutCombo('ctrl+shift+s', false)).toBe('Ctrl+Shift+S');
    // mac
    expect(formatShortcutCombo('mod+k', true)).toBe('⌘K');
    expect(formatShortcutCombo('mod+shift+k', true)).toBe('⌘⇧K');
  });

  it('handles input focusRules aliases', () => {
    expect(formatShortcutCombo('letters', false)).toBe('A-Z');
    expect(formatShortcutCombo('numbers', false)).toBe('0-9');
  });

  it('splits arrays and comma-separated alternatives', () => {
    expect(formatShortcut(['mod+k', 'ctrl+j'], false)).toEqual(['Ctrl+K', 'Ctrl+J']);
    expect(formatShortcut('mod+k, ctrl+j', false)).toEqual(['Ctrl+K', 'Ctrl+J']);
  });

  it('detects modifiers', () => {
    expect(shortcutHasModifier('mod+k')).toBe(true);
    expect(shortcutHasModifier('shift+a')).toBe(true);
    expect(shortcutHasModifier('k')).toBe(false);
    expect(shortcutHasModifier(['j', 'mod+k'])).toBe(true);
  });
});

describe('ReqoreKeyboardShortcut component', () => {
  it('renders one badge per alternative combo', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreKeyboardShortcut shortcut={['mod+k', 'ctrl+j']} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(document.querySelectorAll('.reqore-keyboard-shortcut-key').length).toBe(2);
  });
});

describe('ReqoreButton shortcut', () => {
  it('renders a shortcut hint badge', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreButton shortcut='mod+k'>Search</ReqoreButton>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.reqore-keyboard-shortcut')).toBeTruthy();
  });

  it('hides the hint when shortcutHint is false', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreButton shortcut='mod+k' shortcutHint={false}>
              Search
            </ReqoreButton>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.reqore-keyboard-shortcut')).toBeFalsy();
  });

  it('hides the hint when shortcutHints is globally disabled', () => {
    render(
      <ReqoreUIProvider options={{ shortcutHints: false }}>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreButton shortcut='mod+k'>Search</ReqoreButton>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.reqore-keyboard-shortcut')).toBeFalsy();
  });

  it('triggers onClick when the shortcut is pressed', () => {
    const onClick = vi.fn();

    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreButton shortcut='mod+k' onClick={onClick}>
              Search
            </ReqoreButton>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    // Press both modifiers so the test matches regardless of platform — when
    // `mod` is used react-hotkeys-hook only checks the platform-appropriate one
    fireEvent.keyDown(document, { key: 'k', code: 'KeyK', ctrlKey: true, metaKey: true });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onClick when disabled', () => {
    const onClick = vi.fn();

    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreButton shortcut='mod+k' onClick={onClick} disabled>
              Search
            </ReqoreButton>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    fireEvent.keyDown(document, { key: 'k', code: 'KeyK', ctrlKey: true, metaKey: true });

    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('ReqoreInput shortcut hint', () => {
  it('renders a hint from focusRules shortcut', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreInput focusRules={{ type: 'keypress', shortcut: '/' }} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.reqore-keyboard-shortcut')).toBeTruthy();
  });
});
