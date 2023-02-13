import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import { noop } from 'lodash';
import React from 'react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTextarea, ReqoreUIProvider } from '../src';

test('Renders <TextArea /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea').length).toBe(1);
  // No clear button
  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(0);
});

test('Renders <TextArea /> with clear button properly', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea minimal onChange={noop} onClearClick={fn} value='test' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-clear-input-button')!);

  expect(fn).toHaveBeenCalled();
});

test('Disabled <TextArea /> cannot be cleared', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea minimal onChange={noop} onClearClick={fn} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // No clear button
  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(0);
});

test('Readonly <Textarea /> cannot be cleared', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea minimal onChange={noop} onClearClick={fn} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // No clear button
  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(0);
});

test('<Textarea /> gets automatically focused', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'auto' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('Readonly <Textarea /> does not get automatically focused', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'auto' }} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();
});

test('Disabled <Textarea /> does not get automatically focused', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'auto' }} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();
});

test("<Textarea /> gets automatically focused if it's out of viewport", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div style={{ height: '100vh' }} />
          <ReqoreTextarea focusRules={{ type: 'auto' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test("<Textarea /> does not get automatically focused if it's out of viewport", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div style={{ height: '100vh' }} />
          <ReqoreTextarea focusRules={{ type: 'auto', viewportOnly: true }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(false);

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();
});

test('<Textarea /> gets automatically focused if its inside of viewport', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'auto', viewportOnly: true }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> gets focused after any letter is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 'letters' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'a',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> gets focused after any letter is pressed 2', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 'letters' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '2',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'L',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> gets focused after any digit is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 'numbers' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '1',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> gets focused after any digit is pressed 2', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 'numbers' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'u',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '0',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> gets focused after any digit or letter is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: ['numbers', 'letters'] }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'm',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> gets focused after any digit or letter is pressed 2', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: ['numbers', 'letters'] }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '5',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> gets focused after a specified shortcut is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 's' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'u',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '0',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test("<Textarea /> does not get focused after a specified shortcut is pressed if it's not in Viewport, get's focused when in viewport", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 's', viewportOnly: true }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(false);

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  mockAllIsIntersecting(true);

  fireEvent.keyDown(document, {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});

test('<Textarea /> does not get focused when typing in another input', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 's' }} />
          <ReqoreTextarea focusRules={{ type: 'auto' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();
  expect(document.querySelectorAll('.reqore-textarea')[1]).toHaveFocus();

  fireEvent.keyDown(document.querySelectorAll('.reqore-textarea')[1], {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();
  expect(document.querySelectorAll('.reqore-textarea')[1]).toHaveFocus();
});

test('Readonly <Textarea /> does not get focused when shortcut is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 'letters' }} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'q',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();
});

test('Disabled <Textarea /> does not get focused when shortcut is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea focusRules={{ type: 'keypress', shortcut: 'numbers' }} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '8',
  });

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();
});

test('<Textarea /> is cleared when focused', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea
            focusRules={{ type: 'keypress', shortcut: 'letters', clearOnFocus: true }}
            value='this is a test'
            onChange={fn}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-textarea')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'h',
  });

  expect(fn).toHaveBeenNthCalledWith(1, { target: { value: '' } });
  expect(document.querySelectorAll('.reqore-textarea')[0]).toHaveFocus();
});
