// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTree, ReqoreUIProvider } from '../src';
import { ReqoreExportModal } from '../src/components/ExportModal';

// The copy buttons of the Tree and the Export modal copy in any context (a page served over plain
// http has no Clipboard API), and say so when the browser allowed no copy at all: a red "Could
// not copy" with what to do instead, and never the green "copied" they used to show regardless.

const DATA = { name: 'Rose Farmer', age: 42 };

/** Offers the Clipboard API, as a secure context does. */
const offerClipboard = (writeText: (text: string) => Promise<void>) => {
  const fn = vi.fn(writeText);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: fn }, configurable: true });
  return fn;
};

/** Gives the document a copy command that answers `works`, recording what it was asked to copy. */
const offerCopyCommand = (works: boolean) => {
  const copied: string[] = [];
  const execCommand = vi.fn(() => {
    copied.push(document.querySelector<HTMLTextAreaElement>('textarea[aria-hidden]')!.value);
    return works;
  });
  Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });
  return { execCommand, copied };
};

/** Neither the Clipboard API nor the copy command: what a locked-down insecure page has. */
const offerNoWayToCopy = () => offerCopyCommand(false);

const renderInProvider = (children: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const notifications = () =>
  Array.from(document.querySelectorAll('.reqore-notification')).map((n) => n.textContent);

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'clipboard');
  Reflect.deleteProperty(document, 'execCommand');
});

describe('Tree copy button', () => {
  const renderTree = (props: Partial<React.ComponentProps<typeof ReqoreTree>> = {}) =>
    renderInProvider(<ReqoreTree data={DATA} withLabelCopy expanded {...props} />);

  const copyButtons = () => document.querySelectorAll<HTMLElement>('.reqore-tree-copy');

  test('copies the value with the Clipboard API and says it was copied', async () => {
    const writeText = offerClipboard(async () => undefined);
    renderTree();

    expect(copyButtons().length).toBe(2);
    fireEvent.click(copyButtons()[0]);

    await screen.findByText('Successfully copied to clipboard');
    expect(writeText).toHaveBeenCalledWith('"Rose Farmer"');
    expect(notifications().some((n) => n.includes('Could not copy'))).toBe(false);
  });

  test('copies with the copy command where there is no Clipboard API (plain http)', async () => {
    expect(navigator.clipboard).toBeUndefined();
    const { execCommand, copied } = offerCopyCommand(true);
    renderTree({ copySuccessMessage: 'Copied!' });

    fireEvent.click(copyButtons()[1]);

    await screen.findByText('Copied!');
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(copied).toEqual(['42']);
  });

  test('says it could not copy, and what to do, when the browser allows no copy', async () => {
    offerClipboard(async () => Promise.reject(new Error('not allowed')));
    offerNoWayToCopy();
    renderTree();

    fireEvent.click(copyButtons()[0]);

    await screen.findByText('Could not copy');
    expect(
      screen.getByText(
        'The browser did not allow copying to the clipboard. Select the value and copy it yourself.'
      )
    ).toBeInTheDocument();
    // no false confirmation
    expect(screen.queryByText('Successfully copied to clipboard')).toBeNull();
    // a danger notification: announced as an alert, not as a status
    expect(document.querySelector('.reqore-notification')).toHaveAttribute('role', 'alert');
  });

  test('says it could not copy where there is neither a Clipboard API nor a copy command', async () => {
    Object.defineProperty(document, 'execCommand', { value: undefined, configurable: true });
    renderTree({ copyFailedTitle: 'Nicht kopiert', copyFailedMessage: 'Selbst kopieren.' });

    fireEvent.click(copyButtons()[0]);

    await screen.findByText('Nicht kopiert');
    expect(screen.getByText('Selbst kopieren.')).toBeInTheDocument();
    expect(screen.queryByText('Successfully copied to clipboard')).toBeNull();
  });
});

describe('Export modal copy buttons', () => {
  const renderModal = (props: Partial<React.ComponentProps<typeof ReqoreExportModal>> = {}) => {
    const onClose = vi.fn();
    renderInProvider(<ReqoreExportModal data={DATA} onClose={onClose} {...props} />);
    return { onClose };
  };

  /** Clicks the modal's bottom action labelled exactly `label`. */
  const clickAction = (label: string) => {
    const buttons = Array.from(
      document.querySelectorAll<HTMLElement>('.reqore-modal .reqore-button')
    ).filter((button) => screen.queryAllByText(label).some((text) => button.contains(text)));
    expect(buttons.length).toBe(1);
    fireEvent.click(buttons[0]);
  };

  const JSON_DATA = JSON.stringify(DATA, null, 2);

  test('"Copy" copies the shown data and says it was copied', async () => {
    const writeText = offerClipboard(async () => undefined);
    const { onClose } = renderModal();

    clickAction('Copy');

    await screen.findByText('Data copied to clipboard');
    expect(writeText).toHaveBeenCalledWith(JSON_DATA);
    expect(onClose).not.toHaveBeenCalled();
  });

  test('"Copy and close" copies with the copy command over plain http, then closes', async () => {
    expect(navigator.clipboard).toBeUndefined();
    const { copied } = offerCopyCommand(true);
    const { onClose } = renderModal();

    clickAction('Copy and close');

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(copied).toEqual([JSON_DATA]);
    expect(screen.getByText('Data copied to clipboard')).toBeInTheDocument();
  });

  test('"Copy" says it could not copy, and what to do, when the browser allows no copy', async () => {
    offerClipboard(async () => Promise.reject(new Error('not allowed')));
    offerNoWayToCopy();
    renderModal();

    clickAction('Copy');

    await screen.findByText('Could not copy');
    expect(
      screen.getByText(
        'The browser did not allow copying to the clipboard. Select the text and copy it yourself.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Data copied to clipboard')).toBeNull();
    expect(document.querySelector('.reqore-notification')).toHaveAttribute('role', 'alert');
  });

  test('"Copy and close" stays open when it could not copy, so the text can be selected', async () => {
    offerNoWayToCopy();
    const { onClose } = renderModal();

    clickAction('Copy and close');

    await screen.findByText('Could not copy');
    expect(onClose).not.toHaveBeenCalled();
    // the data is still on screen to be copied by hand
    expect(document.querySelector<HTMLTextAreaElement>('.reqore-textarea')!.value).toBe(JSON_DATA);
  });

  test('a failed copy is shown even with the copy notification turned off', async () => {
    offerNoWayToCopy();
    renderModal({
      sendNotificationOnCopy: false,
      copyFailedNotificationTitle: 'Kopieren fehlgeschlagen',
      copyFailedNotificationContent: 'Text selbst markieren.',
    });

    clickAction('Copy');

    await screen.findByText('Kopieren fehlgeschlagen');
    expect(screen.getByText('Text selbst markieren.')).toBeInTheDocument();
  });

  test('a successful copy with the copy notification turned off shows nothing', async () => {
    const writeText = offerClipboard(async () => undefined);
    renderModal({ sendNotificationOnCopy: false });

    clickAction('Copy');

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    // let the copy's promise settle before checking nothing was shown
    await Promise.resolve();
    expect(notifications()).toEqual([]);
  });
});
