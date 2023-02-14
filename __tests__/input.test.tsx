import { Globals } from '@react-spring/web';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render } from '@testing-library/react';
import { noop } from 'lodash';
import React from 'react';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
import { ReqoreContent, ReqoreInput, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

beforeAll(() => {
  Globals.assign({
    skipAnimation: true,
  });
});

test('Renders <Input /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput minimal />
          <ReqoreInput disabled />
          <ReqoreInput size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input').length).toBe(3);
  // No clear button
  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(0);
});

test('Renders <Input /> with clear button properly', async () => {
  jest.useFakeTimers();

  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput minimal onChange={noop} onClearClick={fn} value='test' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  jest.advanceTimersByTime(1000);

  // No clear button
  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-clear-input-button')!);

  expect(fn).toHaveBeenCalled();
});

test('Disabled <Input /> cannot be cleared', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput minimal onChange={noop} onClearClick={fn} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // No clear button
  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(0);
});

test('Readonly <Input /> cannot be cleared', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput minimal onChange={noop} onClearClick={fn} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // No clear button
  expect(document.querySelectorAll('.reqore-clear-input-button').length).toBe(0);
});

test('<Input /> gets automatically focused', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'auto' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('Readonly <Input /> does not get automatically focused', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'auto' }} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();
});

test('Disabled <Input /> does not get automatically focused', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'auto' }} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();
});

test("<Input /> gets automatically focused if it's out of viewport", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div style={{ height: '100vh' }} />
          <ReqoreInput focusRules={{ type: 'auto' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test("<Input /> does not get automatically focused if it's out of viewport", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div style={{ height: '100vh' }} />
          <ReqoreInput focusRules={{ type: 'auto', viewportOnly: true }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(false);

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();
});

test('<Input /> gets automatically focused if its inside of viewport', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'auto', viewportOnly: true }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(true);

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> gets focused after any letter is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 'letters' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'a',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> gets focused after any letter is pressed 2', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 'letters' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '2',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'L',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> gets focused after any digit is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 'numbers' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '1',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> gets focused after any digit is pressed 2', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 'numbers' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'u',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '0',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> gets focused after any digit or letter is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: ['numbers', 'letters'] }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'm',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> gets focused after any digit or letter is pressed 2', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: ['numbers', 'letters'] }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '5',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> gets focused after a specified shortcut is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 's' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'u',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '0',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test("<Input /> does not get focused after a specified shortcut is pressed if it's not in Viewport, get's focused when in viewport", () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 's', viewportOnly: true }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  mockAllIsIntersecting(false);

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  mockAllIsIntersecting(true);

  fireEvent.keyDown(document, {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});

test('<Input /> does not get focused when typing in another input', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 's' }} />
          <ReqoreInput focusRules={{ type: 'auto' }} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();
  expect(document.querySelectorAll('.reqore-input')[1]).toHaveFocus();

  fireEvent.keyDown(document.querySelectorAll('.reqore-input')[1], {
    key: 's',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();
  expect(document.querySelectorAll('.reqore-input')[1]).toHaveFocus();
});

test('Readonly <Input /> does not get focused when shortcut is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 'letters' }} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'q',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();
});

test('Disabled <Input /> does not get focused when shortcut is pressed', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput focusRules={{ type: 'keypress', shortcut: 'numbers' }} readOnly />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: '8',
  });

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();
});

test('<Input /> is cleared when focused', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreInput
            focusRules={{ type: 'keypress', shortcut: 'letters', clearOnFocus: true }}
            value='this is a test'
            onChange={fn}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-input')[0]).not.toHaveFocus();

  fireEvent.keyDown(document, {
    key: 'h',
  });

  expect(fn).toHaveBeenNthCalledWith(1, { target: { value: '' } });
  expect(document.querySelectorAll('.reqore-input')[0]).toHaveFocus();
});
