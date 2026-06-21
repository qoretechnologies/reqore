/**
 * Helpers for parsing and displaying keyboard shortcuts.
 *
 * Shortcuts follow the `react-hotkeys-hook` syntax: keys joined with `+`
 * (e.g. `'mod+k'`, `'ctrl+shift+s'`) and multiple alternatives separated by a
 * comma or passed as an array. The special `mod` key resolves to `⌘` on macOS
 * and `Ctrl` everywhere else, so a single declaration works cross-platform.
 */

export type TReqoreKeyboardShortcut = string | string[];

const MODIFIER_KEYS = [
  'mod',
  'meta',
  'cmd',
  'command',
  'ctrl',
  'control',
  'alt',
  'option',
  'shift',
];

const KEY_SYMBOLS_MAC: Record<string, string> = {
  mod: '⌘',
  meta: '⌘',
  cmd: '⌘',
  command: '⌘',
  ctrl: '⌃',
  control: '⌃',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  esc: 'Esc',
  escape: 'Esc',
  backspace: '⌫',
  delete: '⌦',
  del: '⌦',
  tab: '⇥',
  space: 'Space',
  up: '↑',
  arrowup: '↑',
  down: '↓',
  arrowdown: '↓',
  left: '←',
  arrowleft: '←',
  right: '→',
  arrowright: '→',
};

const KEY_LABELS: Record<string, string> = {
  mod: 'Ctrl',
  meta: 'Meta',
  cmd: 'Win',
  command: 'Win',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  return: 'Enter',
  esc: 'Esc',
  escape: 'Esc',
  backspace: 'Backspace',
  delete: 'Del',
  del: 'Del',
  tab: 'Tab',
  space: 'Space',
  up: '↑',
  arrowup: '↑',
  down: '↓',
  arrowdown: '↓',
  left: '←',
  arrowleft: '←',
  right: '→',
  arrowright: '→',
};

/**
 * Detect macOS so we can render the platform-appropriate modifier glyphs.
 *
 * This intentionally mirrors `react-hotkeys-hook`'s own Apple detection
 * (`/mac/i.test(navigator.userAgent)` excluding iOS) so the displayed hint
 * always matches the modifier the library actually listens for — using a
 * different source (e.g. `navigator.platform`) could make the hint say `⌘`
 * while the binding expects `Ctrl`, or vice versa.
 */
export const isMacOS = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;

  return /mac/i.test(ua) && !/iphone|ipad|ipod/i.test(ua);
};

const formatToken = (token: string, mac: boolean): string => {
  const key = token.trim().toLowerCase();

  // The `focusRules` shortcut on inputs supports these aliases that match any
  // letter / number key — render a readable range instead of the literal word.
  if (key === 'letters') {
    return 'A-Z';
  }
  if (key === 'numbers') {
    return '0-9';
  }

  const map = mac ? KEY_SYMBOLS_MAC : KEY_LABELS;

  if (map[key]) {
    return map[key];
  }

  if (key.length === 1) {
    return key.toUpperCase();
  }

  return key.charAt(0).toUpperCase() + key.slice(1);
};

const splitShortcut = (shortcut: TReqoreKeyboardShortcut): string[] =>
  (Array.isArray(shortcut) ? shortcut : [shortcut])
    .flatMap((combo) => (typeof combo === 'string' ? combo.split(',') : []))
    .map((combo) => combo.trim())
    .filter(Boolean);

/**
 * Turn a single combo (e.g. `'mod+shift+k'`) into a display string.
 * macOS concatenates glyphs (`⌘⇧K`), other platforms join with `+` (`Ctrl+Shift+K`).
 */
export const formatShortcutCombo = (combo: string, mac: boolean = isMacOS()): string =>
  combo
    .split('+')
    .map((token) => formatToken(token, mac))
    .join(mac ? '' : '+');

/**
 * Format a shortcut declaration into one display string per alternative combo.
 */
export const formatShortcut = (
  shortcut: TReqoreKeyboardShortcut,
  mac: boolean = isMacOS()
): string[] => splitShortcut(shortcut).map((combo) => formatShortcutCombo(combo, mac));

/**
 * Whether any combo in the shortcut uses a modifier key. Used to decide if a
 * button shortcut should still fire while a form field is focused (combos with a
 * modifier are safe; bare single keys would clash with typing).
 */
export const shortcutHasModifier = (shortcut: TReqoreKeyboardShortcut): boolean =>
  splitShortcut(shortcut).some((combo) =>
    combo.split('+').some((token) => MODIFIER_KEYS.includes(token.trim().toLowerCase()))
  );
