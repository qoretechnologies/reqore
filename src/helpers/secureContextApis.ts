// Copyright 2026 Qore Technologies, s.r.o.

/**
 * Browser APIs that exist only in a secure context (https, or localhost), with what to do where
 * they do not.
 *
 * Reqore is also served over plain http by address or host name, as a review Storybook or an app
 * on a LAN is. There `navigator.clipboard` and `crypto.randomUUID` are undefined, and code that
 * called them directly threw or failed to copy without saying so. Everything in reqore goes
 * through this module instead; a convention test
 * (`__tests__/secureContextApisGoThroughTheHelper.test.ts`) refuses a direct call anywhere else.
 */

/** Lower-case hex of one byte. */
const hex = (byte: number): string => byte.toString(16).padStart(2, '0');

/**
 * A random UUID (version 4).
 *
 * `crypto.randomUUID()` where the browser has it, and otherwise the same thing built from
 * `crypto.getRandomValues()`, which every browser has in any context: 16 random bytes with the
 * version (4) and the variant (10xx) bits set, as RFC 9562 defines a version 4 UUID.
 */
export const randomUuid = (): string => {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, hex).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

/** Thrown when no way of copying worked, so a caller can show that the copy did not happen. */
export class ClipboardUnavailableError extends Error {
  constructor() {
    super('The browser did not allow copying to the clipboard.');
    this.name = 'ClipboardUnavailableError';
  }
}

/**
 * Copy with a selected, off-screen text area and the browser's copy command: what works where
 * the Clipboard API is not offered. The focus and the selection the user had are put back
 * afterwards.
 */
const copyWithSelection = (text: string): boolean => {
  if (
    typeof document === 'undefined' ||
    typeof document.execCommand !== 'function' ||
    !document.body
  ) {
    return false;
  }
  const active = document.activeElement as HTMLElement | null;
  const selection = document.getSelection();
  const ranges =
    selection && selection.rangeCount
      ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index))
      : [];
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '-9999px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  try {
    area.select();
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
    if (selection) {
      selection.removeAllRanges();
      ranges.forEach((range) => selection.addRange(range));
    }
    active?.focus?.({ preventScroll: true });
  }
};

/**
 * Copy text to the clipboard.
 *
 * The Clipboard API where the browser offers it (a secure context), and the browser's copy
 * command where it does not or refuses. Resolves when the text was copied; rejects with
 * {@link ClipboardUnavailableError} when nothing worked, so the caller can say so. It never
 * throws synchronously.
 */
export const copyText = async (text: string): Promise<void> => {
  const clipboard = typeof navigator !== 'undefined' ? navigator.clipboard : undefined;
  if (typeof clipboard?.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return;
    } catch {
      // refused (no permission, the document not focused): the copy command may still be allowed
    }
  }
  if (copyWithSelection(text)) {
    return;
  }
  throw new ClipboardUnavailableError();
};
