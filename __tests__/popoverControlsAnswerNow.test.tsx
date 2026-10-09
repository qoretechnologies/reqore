// Copyright 2026 Qore Technologies, s.r.o.
import { act, fireEvent, render } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreLayoutContent,
  ReqoreTextarea,
  ReqoreUIProvider,
} from '../src';
import { IPopoverControls } from '../src/components/Popover';

/**
 * The controls a popover hands out answer for the popover as it is now, not as it was when they were
 * handed out.
 *
 * `isOpen` was a closure over the render that passed it, and the holder got a fresh copy only after an
 * effect and a render of its own. A template list opened by a click was therefore still "closed" to the
 * field that owns it when a key typed straight after the click arrived: typing did not put the list away,
 * and it opened over the text being written (qorus#646: a field chosen into a value, then " Stk." typed
 * after it).
 */

const isOpen = () => document.querySelectorAll('.reqore-popover-content').length === 1;

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

describe("a popover's controls", () => {
  it('say it is open once it opens, whichever copy is asked', () => {
    const handed: IPopoverControls[] = [];
    const Field = () => {
      const [, setData] = useState<IPopoverControls>();
      return (
        <ReqoreDropdown
          items={items}
          label='Fields'
          passPopoverData={(data) => {
            handed.push(data);
            setData(data);
          }}
        />
      );
    };
    render(wrap(<Field />));
    const first = handed[0];
    expect(first.isOpen()).toBe(false);
    fireEvent.click(document.querySelector('.reqore-button') as HTMLElement);
    expect(isOpen()).toBe(true);
    // the copy handed out while it was closed
    expect(first.isOpen()).toBe(true);
    act(() => first.close());
    expect(isOpen()).toBe(false);
    expect(handed[handed.length - 1].isOpen()).toBe(false);
  });
});

describe('a template list', () => {
  it('is put away by text typed straight after the click that opened it', () => {
    render(wrap(<ReqoreTextarea templates={{ items }} onChange={() => undefined} />));
    const field = document.querySelector('.reqore-textarea') as HTMLElement;
    // the click and the key in one go: the key arrives before the field has been told the list opened
    act(() => {
      fireEvent.click(field);
      fireEvent.keyDown(field, { key: 'S' });
    });
    expect(isOpen()).toBe(false);
  });

  it('is put away by text written without a key, as an on-screen keyboard writes it', () => {
    render(wrap(<ReqoreTextarea templates={{ items }} onChange={() => undefined} />));
    const field = document.querySelector('.reqore-textarea') as HTMLElement;
    act(() => {
      fireEvent.click(field);
    });
    expect(isOpen()).toBe(true);
    // a touch keyboard sends no keydown for the character, only the input it makes (qorus#646: the list
    // stayed open over the completion list a typed `@` opened, which then could not be seen)
    act(() => {
      fireEvent(
        field,
        new InputEvent('beforeinput', { bubbles: true, data: '@', inputType: 'insertText' })
      );
    });
    expect(isOpen()).toBe(false);
  });

  it('stays open for input that writes nothing, such as a composition starting', () => {
    render(wrap(<ReqoreTextarea templates={{ items }} onChange={() => undefined} />));
    const field = document.querySelector('.reqore-textarea') as HTMLElement;
    act(() => {
      fireEvent.click(field);
    });
    act(() => {
      fireEvent(
        field,
        new InputEvent('beforeinput', { bubbles: true, inputType: 'insertCompositionText' })
      );
    });
    expect(isOpen()).toBe(true);
  });

  it('stays open for keys that do not change the text', () => {
    render(wrap(<ReqoreTextarea templates={{ items }} onChange={() => undefined} />));
    const field = document.querySelector('.reqore-textarea') as HTMLElement;
    act(() => {
      fireEvent.click(field);
      fireEvent.keyDown(field, { key: 'ArrowDown' });
    });
    expect(isOpen()).toBe(true);
  });
});

/**
 * Escape puts away the list that is open, and goes no further.
 *
 * The popover heard Escape on the document, after every handler in the page: an editor around the field
 * (reqraft's form row, where Escape discards the edit) heard it first, so one Escape meant for the list
 * also closed the editor and threw away what had been typed (qorus#646: a fill value of 42 back to empty).
 */
describe('Escape with a list open', () => {
  const Editor = ({ onEscape }: { onEscape: () => void }) => (
    <div
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onEscape();
        }
      }}
    >
      <ReqoreTextarea templates={{ items }} onChange={() => undefined} />
    </div>
  );

  it('closes the list, and the editor around the field does not hear it', () => {
    const heard: string[] = [];
    render(wrap(<Editor onEscape={() => heard.push('escape')} />));
    const field = document.querySelector('.reqore-textarea') as HTMLElement;
    fireEvent.click(field);
    expect(isOpen()).toBe(true);
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(isOpen()).toBe(false);
    expect(heard).toEqual([]);
    // with no list open, Escape is the editor's again
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(heard).toEqual(['escape']);
  });
});
