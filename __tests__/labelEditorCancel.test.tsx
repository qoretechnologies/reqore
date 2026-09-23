import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqorePanel,
  ReqoreUIProvider,
} from '../src';

/**
 * Abandoning an edit.
 *
 * Leaving the label editor SUBMITS — by Enter, by blur, by anything — which is
 * the rule the component has always had. Cancelling is the one exception, and
 * these are the two ways to ask for it: Escape where there is a keyboard, and a
 * control beside the input where there is not.
 */

let isMobile = false;

vi.mock('../src/hooks/useReqoreContext', async () => {
  const actual = await vi.importActual<any>('../src/hooks/useReqoreContext');

  return {
    ...actual,
    useReqoreProperty: (name: string) =>
      name === 'isMobile' ? isMobile : actual.useReqoreProperty(name),
  };
});

const renderPanel = (
  onLabelEdit: (value: string | number) => void,
  inModal = false,
  onModalClose: () => void = () => undefined
) => {
  const panel = (
    <ReqorePanel label='Original title' onLabelEdit={onLabelEdit}>
      Panel
    </ReqorePanel>
  );

  return render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          {inModal ? (
            <ReqoreModal isOpen onClose={onModalClose} label='Dialog'>
              {panel}
            </ReqoreModal>
          ) : (
            panel
          )}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

const startEditing = (currentLabel: string = 'Original title') => {
  /* By its text, not by the class alone: inside a modal the dialog's OWN
     header renders a label editor too, and it is the first in the document. */
  const editor = Array.from(document.querySelectorAll('.reqore-label-editor')).find((el) =>
    el.textContent?.includes(currentLabel)
  );

  expect(editor).toBeTruthy();
  fireEvent.click(editor!);

  return screen.getByRole('textbox') as HTMLInputElement;
};

beforeEach(() => {
  isMobile = false;
});

describe('cancelling a label edit with Escape', () => {
  it('restores the label and never submits', () => {
    const onLabelEdit = vi.fn();
    renderPanel(onLabelEdit);

    const input = startEditing();
    fireEvent.change(input, { target: { value: 'Changed title' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Original title')).toBeInTheDocument();
    expect(onLabelEdit).not.toHaveBeenCalled();
  });

  it('leaves Enter and blur submitting, as they always did', () => {
    const onLabelEdit = vi.fn();
    renderPanel(onLabelEdit);

    let input = startEditing();
    fireEvent.change(input, { target: { value: 'Enter title' } });
    fireEvent.keyUp(input, { key: 'Enter' });
    expect(onLabelEdit).toHaveBeenLastCalledWith('Enter title');

    input = startEditing('Enter title');
    fireEvent.change(input, { target: { value: 'Blur title' } });
    fireEvent.blur(input);
    expect(onLabelEdit).toHaveBeenLastCalledWith('Blur title');
  });

  it('does not close the modal it is inside', () => {
    /* A panel is often inside a dialog, and reqore closes a modal on Escape
       from a `keydown` listener on `document`. One press must abandon the edit
       WITHOUT shutting the dialog around it. */
    const onLabelEdit = vi.fn();
    const onModalClose = vi.fn();
    renderPanel(onLabelEdit, true, onModalClose);

    const input = startEditing();
    fireEvent.change(input, { target: { value: 'Changed title' } });
    fireEvent.keyDown(input, { key: 'Escape', bubbles: true });

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(onLabelEdit).not.toHaveBeenCalled();
    /* Asserted on the dialog's own `onClose`, not on whether it is still in the
       DOM: `isOpen` is controlled here, so the dialog could never have gone
       either way and that assertion would pass however this behaves. */
    expect(onModalClose).not.toHaveBeenCalled();
  });
});

describe('cancelling a label edit on mobile, where there is no Escape', () => {
  it('offers a cancel control beside the input', () => {
    isMobile = true;
    renderPanel(vi.fn());
    startEditing();

    const cancel = document.querySelector('.reqore-label-editor-cancel');

    expect(cancel).toBeInTheDocument();
    // Stacked with the input rather than floating loose beside it.
    expect(document.querySelector('.reqore-label-editor-group')).toContainElement(
      cancel as HTMLElement
    );
  });

  it('shows no such control on a desktop, where Escape is the way out', () => {
    renderPanel(vi.fn());
    startEditing();

    expect(document.querySelector('.reqore-label-editor-cancel')).not.toBeInTheDocument();
  });

  it('cancels on mousedown, before the blur it causes can submit', () => {
    /* Pressing the button moves focus off the input, so `onBlur` would submit
       and the click that was meant to cancel would arrive too late. The
       decision has to be taken on mousedown. */
    isMobile = true;
    const onLabelEdit = vi.fn();
    renderPanel(onLabelEdit);

    const input = startEditing();
    fireEvent.change(input, { target: { value: 'Abandoned title' } });

    const cancel = document.querySelector('.reqore-label-editor-cancel')!;
    fireEvent.mouseDown(cancel);
    // The blur a real pointer would cause, arriving after the decision.
    fireEvent.blur(input);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Original title')).toBeInTheDocument();
    expect(onLabelEdit).not.toHaveBeenCalled();
  });
});
