// Copyright 2026 Qore Technologies, s.r.o.
import { fireEvent, render, screen } from '@testing-library/react';
import { ReqoreUIProvider } from '../src';
import { ReqoreTreeManagementDialog } from '../src/components/Tree/modal';

/**
 * qorus#646 (React's warning, found by the story run's warning gate): the tree's dialog for a new item drew its
 * key and value fields with no value, and the first key typed gave them one - React warned "A component is
 * changing an uncontrolled input to be controlled" (Tree › New Object Item Can Be Added). They hold text from the
 * start, empty for a new item; a host's own key or value renderer is still given what the item holds.
 */

const UNCONTROLLED = /uncontrolled input to be controlled/;

test("a new item's key and value fields are controlled from the start", () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  let errors: string[] = [];
  try {
    render(
      <ReqoreUIProvider>
        <ReqoreTreeManagementDialog type='object' onClose={vi.fn()} onSave={vi.fn()} />
      </ReqoreUIProvider>
    );
    const key = document.querySelector('.reqore-modal input') as HTMLInputElement;
    const value = document.querySelector('.reqore-modal textarea') as HTMLTextAreaElement;
    expect(key.value).toBe('');
    expect(value.value).toBe('');
    fireEvent.change(key, { target: { value: 'New item' } });
    fireEvent.change(value, { target: { value: 'New item value' } });
    expect(key.value).toBe('New item');
    expect(value.value).toBe('New item value');
    errors = consoleError.mock.calls.map((call) => call.map(String).join(' '));
  } finally {
    consoleError.mockRestore();
  }
  expect(errors.filter((error) => UNCONTROLLED.test(error))).toEqual([]);
});

test("a host's own renderers are given what a new item holds: nothing", () => {
  const keys: unknown[] = [];
  const values: unknown[] = [];
  render(
    <ReqoreUIProvider>
      <ReqoreTreeManagementDialog
        type='object'
        onClose={vi.fn()}
        onSave={vi.fn()}
        KeyRenderer={({ value }) => {
          keys.push(value);
          return <span>key renderer</span>;
        }}
        ValueRenderer={({ value }) => {
          values.push(value);
          return <span>value renderer</span>;
        }}
      />
    </ReqoreUIProvider>
  );
  expect(screen.getByText('key renderer')).toBeTruthy();
  expect(keys.at(-1)).toBeUndefined();
  expect(values.at(-1)).toBeUndefined();
});
