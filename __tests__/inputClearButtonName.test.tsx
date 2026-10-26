// A field's clear button is named, as a control is: a screen reader says what it does, and a test finds it by its
// role and name (qorus#646: the Qorus IDE's tests could not find the expression's ×, and nothing said it).
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ReqoreInput, ReqoreTextarea, ReqoreUIProvider } from '../src';

const inProvider = (node: React.ReactNode) => render(<ReqoreUIProvider>{node}</ReqoreUIProvider>);

describe("a field's clear button", () => {
  test('an input\'s is a button named "Clear", which clears the field', () => {
    const onClearClick = vi.fn();
    inProvider(<ReqoreInput value='12' onChange={vi.fn()} onClearClick={onClearClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClearClick).toHaveBeenCalledTimes(1);
  });

  test('a text area\'s is a button named "Clear"', () => {
    inProvider(<ReqoreTextarea value='12' onChange={vi.fn()} onClearClick={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Clear' })).toBeTruthy();
  });

  test("its name is the host's where the host gives one", () => {
    inProvider(
      <ReqoreInput value='12' onChange={vi.fn()} onClearClick={vi.fn()} clearLabel='Effacer' />
    );

    expect(screen.getByRole('button', { name: 'Effacer' })).toBeTruthy();
  });
});
