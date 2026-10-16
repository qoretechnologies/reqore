// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
} from '../src';

/**
 * Escape closes every open popover, and goes on to the rest of the page unless it was meant for
 * one.
 *
 * A popover hears Escape in the capture phase, so that an Escape meant for a list in a field closes
 * the list and never reaches the editor around the field (a form row that discards the edit on
 * Escape). It stopped the key for every open popover, wherever the focus was - and every tooltip is
 * a popover, so a tooltip showing anywhere on the page swallowed Escape: a modal with one up did
 * not close, and a row editor or a table's search never heard it. An Escape belongs to a popover
 * only when it comes from its trigger or from its own surface, and only a popover that actually
 * closed keeps it.
 */

const openPopovers = () => document.querySelectorAll('.reqore-popover-content').length;

const items = [
  { label: 'qty', value: '$record:{qty}' },
  { label: 'price', value: '$record:{price}' },
];

const wrap = (node: React.ReactNode) => (
  <ReqoreUIProvider>
    <ReqoreLayoutContent>
      <ReqoreContent>{node}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

/** An editor around the field: Escape discards the edit, as a form row does. */
const Editor = ({ onEscape, children }: { onEscape: () => void; children: React.ReactNode }) => (
  <div
    className='editor'
    onKeyDown={(event) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    }}
  >
    {children}
  </div>
);

const settle = () => {
  act(() => {
    vi.advanceTimersByTime(1);
  });
};

describe('Escape', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('closes a modal that has a tooltip showing in it', () => {
    const onClose = vi.fn();
    render(
      wrap(
        <ReqoreModal isOpen onClose={onClose} label='Edit'>
          <ReqoreButton className='with-tooltip' tooltip='What saving does'>
            Save
          </ReqoreButton>
          <p className='modal-text'>Text</p>
        </ReqoreModal>
      )
    );
    settle();
    fireEvent.mouseEnter(document.querySelector('.with-tooltip') as HTMLElement);
    settle();
    expect(openPopovers()).toBe(1);

    fireEvent.keyDown(document.querySelector('.modal-text') as HTMLElement, { key: 'Escape' });
    settle();
    // the tooltip goes, and so does the modal: the key was not the tooltip's to keep
    expect(openPopovers()).toBe(0);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("reaches an editor's own handler while a tooltip shows elsewhere", () => {
    const heard = vi.fn();
    render(
      wrap(
        <>
          <ReqoreButton className='with-tooltip' tooltip='What saving does'>
            Save
          </ReqoreButton>
          <Editor onEscape={heard}>
            <input className='row-input' />
          </Editor>
        </>
      )
    );
    fireEvent.mouseEnter(document.querySelector('.with-tooltip') as HTMLElement);
    settle();
    expect(openPopovers()).toBe(1);

    fireEvent.keyDown(document.querySelector('.row-input') as HTMLElement, { key: 'Escape' });
    settle();
    expect(openPopovers()).toBe(0);
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it('closes an open list in a field, and the editor around the field does not hear it', () => {
    const heard = vi.fn();
    render(
      wrap(
        <Editor onEscape={heard}>
          <ReqoreDropdown component={ReqoreInput} handler='focus' items={items} />
        </Editor>
      )
    );
    const field = document.querySelector('.reqore-input') as HTMLInputElement;
    act(() => {
      field.focus();
    });
    settle();
    expect(openPopovers()).toBe(1);

    fireEvent.keyDown(field, { key: 'Escape' });
    settle();
    expect(openPopovers()).toBe(0);
    expect(heard).not.toHaveBeenCalled();

    // with the list closed, Escape is the editor's again
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(heard).toHaveBeenCalledTimes(1);
  });

  it('goes on to the editor when the list refuses to close', () => {
    const heard = vi.fn();
    const onBeforeClose = vi.fn(() => false);
    render(
      wrap(
        <Editor onEscape={heard}>
          <ReqoreDropdown
            component={ReqoreInput}
            handler='focus'
            items={items}
            onBeforeClose={onBeforeClose}
          />
        </Editor>
      )
    );
    const field = document.querySelector('.reqore-input') as HTMLInputElement;
    act(() => {
      field.focus();
    });
    settle();
    expect(openPopovers()).toBe(1);

    fireEvent.keyDown(field, { key: 'Escape' });
    settle();
    // it stays open, so the key was not used: the editor hears it
    expect(onBeforeClose).toHaveBeenCalled();
    expect(openPopovers()).toBe(1);
    expect(heard).toHaveBeenCalledTimes(1);
  });
});
