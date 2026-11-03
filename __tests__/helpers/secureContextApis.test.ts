// Copyright 2026 Qore Technologies, s.r.o.
import {
  ClipboardUnavailableError,
  copyText,
  randomUuid,
} from '../../src/helpers/secureContextApis';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** Offers the Clipboard API on this document's navigator, as a secure context does. */
const offerClipboard = (writeText: (text: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });

/** Gives the document a copy command that answers with `copy`. */
const offerCopyCommand = (copy: (command: string) => boolean) => {
  const execCommand = vi.fn(copy);
  Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
  return execCommand;
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // what each test defined on the navigator and the document
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(document, 'execCommand');
  document.body.innerHTML = '';
});

describe('randomUuid', () => {
  it('uses crypto.randomUUID where the browser has it', () => {
    const randomUUID = vi.fn(() => '11111111-1111-4111-8111-111111111111');
    vi.stubGlobal('crypto', { randomUUID, getRandomValues: vi.fn() });

    expect(randomUuid()).toBe('11111111-1111-4111-8111-111111111111');
    expect(randomUUID).toHaveBeenCalledTimes(1);
  });

  it('builds a version 4 UUID from getRandomValues without randomUUID (an insecure context)', () => {
    vi.stubGlobal('crypto', {
      randomUUID: undefined,
      getRandomValues: (bytes: Uint8Array) => {
        bytes.fill(0xff);
        return bytes;
      },
    });

    const uuid = randomUuid();
    expect(uuid).toMatch(UUID_V4);
    // the version and variant bits are set over the random bytes
    expect(uuid).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });

  it('sets the version and variant bits over all-zero bytes too', () => {
    vi.stubGlobal('crypto', {
      randomUUID: undefined,
      getRandomValues: (bytes: Uint8Array) => bytes,
    });

    expect(randomUuid()).toBe('00000000-0000-4000-8000-000000000000');
  });

  it('gives a different, well-formed UUID each time without randomUUID', () => {
    const real = globalThis.crypto;
    vi.stubGlobal('crypto', {
      randomUUID: undefined,
      getRandomValues: (bytes: Uint8Array) => real.getRandomValues(bytes),
    });

    const uuids = new Set(Array.from({ length: 50 }, () => randomUuid()));
    expect(uuids.size).toBe(50);
    uuids.forEach((uuid) => expect(uuid).toMatch(UUID_V4));
  });
});

describe('copyText', () => {
  it('copies with the Clipboard API where it is offered, without the copy command', async () => {
    const writeText = vi.fn(async () => undefined);
    offerClipboard(writeText);
    const execCommand = offerCopyCommand(() => true);

    await expect(copyText('hello')).resolves.toBeUndefined();
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(execCommand).not.toHaveBeenCalled();
  });

  it('copies with the copy command where the Clipboard API is absent (an insecure context)', async () => {
    expect(navigator.clipboard).toBeUndefined();
    let copied: string | undefined;
    let selected: string | undefined;
    const execCommand = offerCopyCommand((command) => {
      const area = document.querySelector('textarea');
      copied = area?.value;
      selected = area ? area.value.slice(area.selectionStart, area.selectionEnd) : undefined;
      return command === 'copy';
    });

    await expect(copyText('from http')).resolves.toBeUndefined();
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(copied).toBe('from http');
    // the whole text was selected when the command ran
    expect(selected).toBe('from http');
    // the helper's text area is gone again
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back to the copy command when the Clipboard API refuses', async () => {
    const writeText = vi.fn(async () => Promise.reject(new Error('not allowed')));
    offerClipboard(writeText);
    const execCommand = offerCopyCommand(() => true);

    await expect(copyText('again')).resolves.toBeUndefined();
    expect(writeText).toHaveBeenCalledWith('again');
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('falls back to the copy command when the Clipboard API throws synchronously', async () => {
    offerClipboard(() => {
      throw new Error('sync refusal');
    });
    const execCommand = offerCopyCommand(() => true);

    await expect(copyText('sync')).resolves.toBeUndefined();
    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('gives the focus back to what had it after the copy command', async () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(input);
    offerCopyCommand(() => true);

    await copyText('focus');
    expect(document.activeElement).toBe(input);
  });

  it('rejects with a clear error, and does not throw, when nothing can copy', async () => {
    offerClipboard(async () => Promise.reject(new Error('not allowed')));
    offerCopyCommand(() => false);

    let threw = false;
    let result: Promise<void> | undefined;
    try {
      result = copyText('nowhere');
    } catch {
      threw = true;
    }
    expect(threw).toBe(false);
    await expect(result).rejects.toBeInstanceOf(ClipboardUnavailableError);
    await expect(copyText('nowhere')).rejects.toThrow(
      'The browser did not allow copying to the clipboard.'
    );
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('rejects when neither the Clipboard API nor a copy command exists', async () => {
    expect(navigator.clipboard).toBeUndefined();
    Object.defineProperty(document, 'execCommand', { value: undefined, configurable: true });

    await expect(copyText('none')).rejects.toBeInstanceOf(ClipboardUnavailableError);
  });

  it('rejects when the copy command itself throws, and leaves no text area behind', async () => {
    offerCopyCommand(() => {
      throw new Error('blocked');
    });

    await expect(copyText('blocked')).rejects.toBeInstanceOf(ClipboardUnavailableError);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('names its error so a caller can tell it from others', () => {
    const error = new ClipboardUnavailableError();
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ClipboardUnavailableError');
  });
});
