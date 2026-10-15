// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { ReqoreModal, ReqoreUIProvider } from '../src';
import { useReqoreProperty } from '../src/hooks/useReqoreContext';

/**
 * qorus#646 (React's warning, found by the story run's warning gate): Escape closed a modal by calling its
 * `onClose` inside the state updater that took it off the provider's Escape stack. React runs an updater while it
 * renders the provider, so the host's own state was set during another component's render - React warned "Cannot
 * update a component while rendering a different component" (Modal › Can Be Closed With Esc Key With
 * Confirmation). And a modal that went while another was above it stayed on the stack: only the top-most was ever
 * taken off. `onClose` is called from the key or the confirmation that closes it, and a modal that goes leaves the
 * stack wherever it is in it.
 */

/** What React wrote to console.error while `run` ran. */
const collectingErrors = async (run: () => Promise<void> | void): Promise<string[]> => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    await run();
    return consoleError.mock.calls.map((call) => call.map(String).join(' '));
  } finally {
    consoleError.mockRestore();
  }
};

const RENDER_UPDATE = /Cannot update a component .* while rendering a different component/;

/** A host whose modal closes by setting its own state, as an app's does. */
const Host = ({ confirmOnClose }: { confirmOnClose?: boolean }) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <span data-testid='state'>{open ? 'open' : 'closed'}</span>
      <ReqoreModal
        isOpen={open}
        onClose={() => setOpen(false)}
        confirmOnClose={confirmOnClose}
        label='Host modal'
      >
        Content
      </ReqoreModal>
    </>
  );
};

/** The provider's Escape stack, as text. */
const Stack = () => (
  <span data-testid='stack'>{(useReqoreProperty('escClosableModals') ?? []).length}</span>
);

test('Escape closes a modal from the key, not while the provider renders', async () => {
  const errors = await collectingErrors(async () => {
    render(
      <ReqoreUIProvider>
        <Host />
      </ReqoreUIProvider>
    );
    await waitFor(() => expect(document.querySelector('.reqore-modal')).not.toBeNull());
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('closed'));
  });
  expect(errors.filter((error) => RENDER_UPDATE.test(error))).toEqual([]);
});

test('Escape with a confirmation closes the modal from the confirmation, not while the provider renders', async () => {
  const errors = await collectingErrors(async () => {
    render(
      <ReqoreUIProvider>
        <Host confirmOnClose />
      </ReqoreUIProvider>
    );
    await waitFor(() => expect(document.querySelector('.reqore-modal')).not.toBeNull());
    fireEvent.keyDown(document, { key: 'Escape' });
    await screen.findByText('Are you sure you want to proceed?');
    expect(screen.getByTestId('state').textContent).toBe('open');
    fireEvent.click(screen.getAllByText('Confirm')[0]);
    await waitFor(() => expect(screen.getByTestId('state').textContent).toBe('closed'));
  });
  expect(errors.filter((error) => RENDER_UPDATE.test(error))).toEqual([]);
});

test('Escape closes only the top-most of two modals', async () => {
  const closed: string[] = [];
  render(
    <ReqoreUIProvider>
      <ReqoreModal isOpen onClose={() => closed.push('lower')} label='Lower'>
        Lower
      </ReqoreModal>
      <ReqoreModal isOpen onClose={() => closed.push('upper')} label='Upper'>
        Upper
      </ReqoreModal>
    </ReqoreUIProvider>
  );
  await waitFor(() => expect(document.querySelectorAll('.reqore-modal')).toHaveLength(2));
  act(() => {
    fireEvent.keyDown(document, { key: 'Escape' });
  });
  expect(closed).toEqual(['upper']);
});

test('a modal that goes while another is above it leaves the Escape stack', async () => {
  const Two = () => {
    const [lower, setLower] = useState(true);
    return (
      <>
        <button type='button' onClick={() => setLower(false)}>
          close lower
        </button>
        <ReqoreModal isOpen={lower} onClose={() => setLower(false)} label='Lower'>
          Lower
        </ReqoreModal>
        <ReqoreModal isOpen onClose={() => undefined} label='Upper'>
          Upper
        </ReqoreModal>
        <Stack />
      </>
    );
  };
  render(
    <ReqoreUIProvider>
      <Two />
    </ReqoreUIProvider>
  );
  await waitFor(() => expect(screen.getByTestId('stack').textContent).toBe('2'));
  fireEvent.click(screen.getByText('close lower'));
  await waitFor(() => expect(screen.getByTestId('stack').textContent).toBe('1'));
});
