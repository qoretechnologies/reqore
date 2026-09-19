import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ReqoreMultiSelect, ReqoreSelect, ReqoreUIProvider } from '../src';
import { IReqoreMultiSelectProps } from '../src/components/MultiSelect';
import {
  IReqoreSelectMultiProps,
  IReqoreSelectSingleProps,
  TReqoreSelectItem,
} from '../src/components/Select';

/*
 * A select matches its value against `item.value` by identity, and an item's
 * value is whatever the consumer gave it — so a list of ports, of ids or of
 * flags has always WORKED. Only the types said otherwise: `value` was
 * `string[]` and `onValueChange` took `string[]`, so a consumer holding numbers
 * could not pass them without a cast that also hid every real mismatch.
 *
 * The value type is a parameter now, defaulting to `string`, so every existing
 * string consumer keeps exactly the types it had.
 *
 * HOW THE `expectTypeOf` BLOCK BELOW IS ENFORCED: by the COMPILER, not by the
 * runner. `expectTypeOf` erases to nothing at runtime, so those `it`s pass
 * vacuously under `yarn test` — and fail `yarn build:test` (`tsc --noEmit`,
 * which has `__tests__` in its `include`) the moment an assertion stops
 * holding. That is the gate CI runs, through `yarn precheck`. The two `test`s
 * at the bottom are ordinary runtime tests and DO run under `yarn test`: they
 * are what proves the parameterised types describe the behaviour the component
 * actually has.
 */

beforeAll(() => {
  vi.setConfig({ testTimeout: 30000 });
  vi.useFakeTimers();
});

const PortItems: TReqoreSelectItem<number>[] = [
  { value: 8080, label: 'HTTP alternate' },
  { value: 8443, label: 'HTTPS alternate' },
  { value: 9090, label: 'Metrics' },
];

const NameItems: TReqoreSelectItem[] = [
  { value: 'http', label: 'HTTP' },
  { value: 'https', label: 'HTTPS' },
];

describe('the value type of a select', () => {
  it('stays `string` for a consumer that does not name one', () => {
    expectTypeOf<IReqoreSelectMultiProps['value']>().toEqualTypeOf<string[] | undefined>();
    expectTypeOf<IReqoreSelectMultiProps['onValueChange']>().toEqualTypeOf<
      (value: string[]) => void
    >();
    expectTypeOf<IReqoreSelectSingleProps['onValueChange']>().toEqualTypeOf<
      (value?: string) => void
    >();
  });

  it('follows the values a consumer holds', () => {
    expectTypeOf<IReqoreSelectMultiProps<number>['value']>().toEqualTypeOf<number[] | undefined>();
    expectTypeOf<IReqoreMultiSelectProps<number>['onValueChange']>().toEqualTypeOf<
      (value: number[]) => void
    >();
    expectTypeOf<IReqoreSelectSingleProps<boolean>['value']>().toEqualTypeOf<boolean | undefined>();
    // The added / removed callbacks are handed the VALUE, not the item
    expectTypeOf<IReqoreSelectMultiProps<number>['onItemAdded']>().toEqualTypeOf<
      ((value: number) => void) | undefined
    >();
    expectTypeOf<IReqoreSelectMultiProps<number>['onItemRemoved']>().toEqualTypeOf<
      ((value: number) => void) | undefined
    >();
  });

  it('refuses a handler that expects another kind of value', () => {
    const takesNames = (_names: string[]) => undefined;

    expectTypeOf(takesNames).not.toMatchTypeOf<IReqoreMultiSelectProps<number>['onValueChange']>();
    expectTypeOf(takesNames).toMatchTypeOf<IReqoreMultiSelectProps['onValueChange']>();
  });

  it('refuses an item holding another kind of value', () => {
    // An item's value is matched against the select's by identity, so an item
    // of the wrong kind can never be selected — it used to compile because the
    // item's `value` was `any`.
    expectTypeOf<TReqoreSelectItem<number>['value']>().toEqualTypeOf<number | object | undefined>();

    let items: IReqoreSelectMultiProps<number>['items'];

    // @ts-expect-error a string item can never be selected by a select over numbers
    items = [{ value: 'nope' }];
    // ... while the item that can be, and a structured preset, both compile
    items = [{ value: 8080 }, { value: { preset: 'nightly' } }];

    expect(items).toHaveLength(2);
  });

  it('offers creation only where the created value is the kind the select holds', () => {
    // Creating an item makes its value out of the text typed, so it is a string.
    expectTypeOf<IReqoreSelectSingleProps['canCreateItems']>().toEqualTypeOf<boolean | undefined>();

    let overNumbers: IReqoreSelectMultiProps<number>['canCreateItems'];
    // @ts-expect-error typing text cannot produce a number
    overNumbers = true;

    const overStrings: IReqoreSelectMultiProps['canCreateItems'] = true;

    expect(overStrings).toBe(true);
    expect(overNumbers).toBe(true);
  });

  it('infers what a select holds from the value it is given', () => {
    const ports: number[] = [8080];
    const names: string[] = ['http'];
    const port: number = 8080;

    expectTypeOf(
      <ReqoreMultiSelect
        items={PortItems}
        value={ports}
        onValueChange={(value) => expectTypeOf(value).toEqualTypeOf<number[]>()}
      />
    ).toEqualTypeOf<JSX.Element>();
    expectTypeOf(
      <ReqoreSelect
        multi
        items={NameItems}
        value={names}
        onValueChange={(value) => expectTypeOf(value).toEqualTypeOf<string[]>()}
      />
    ).toEqualTypeOf<JSX.Element>();
    expectTypeOf(
      <ReqoreSelect
        items={PortItems}
        value={port}
        onValueChange={(value) => expectTypeOf(value).toEqualTypeOf<number | undefined>()}
      />
    ).toEqualTypeOf<JSX.Element>();
  });
});

test('Renders <ReqoreMultiSelect /> holding numbers, and hands numbers back', () => {
  const onValueChange = vi.fn<(value: number[]) => void>();
  const onItemAdded = vi.fn<(value: number) => void>();

  const Ports = () => {
    const [selected, setSelected] = React.useState<number[]>([8080]);

    return (
      <ReqoreUIProvider>
        <ReqoreMultiSelect
          items={PortItems}
          value={selected}
          onItemAdded={onItemAdded}
          onValueChange={(value) => {
            setSelected(value);
            onValueChange(value);
          }}
        />
      </ReqoreUIProvider>
    );
  };

  act(() => {
    render(<Ports />);
  });

  // The chip for the numeric value is found by its item, not shown as a bare number
  expect(screen.getByText('HTTP alternate')).toBeTruthy();

  fireEvent.focus(document.querySelector('.reqore-input')!);

  vi.advanceTimersByTime(1);

  fireEvent.click(screen.getAllByText('Metrics').at(-1)!);

  expect(onValueChange).toHaveBeenNthCalledWith(1, [8080, 9090]);
  expect(onItemAdded).toHaveBeenNthCalledWith(1, 9090);
  expect(document.querySelectorAll('.reqore-tag').length).toBe(2);
});

test('Renders <ReqoreSelect /> holding a boolean, and clears it', () => {
  const onValueChange = vi.fn<(value?: boolean) => void>();

  const Flag = () => {
    const [selected, setSelected] = React.useState<boolean | undefined>(false);

    return (
      <ReqoreUIProvider>
        <ReqoreSelect
          items={[
            { value: true, label: 'Enabled' },
            { value: false, label: 'Disabled' },
          ]}
          value={selected}
          onValueChange={(value) => {
            setSelected(value);
            onValueChange(value);
          }}
        />
      </ReqoreUIProvider>
    );
  };

  act(() => {
    render(<Flag />);
  });

  // `false` is a value, not "nothing selected"
  expect(screen.getByText('Disabled')).toBeTruthy();
  expect(screen.queryByText('No value selected')).toBeNull();

  fireEvent.click(document.querySelectorAll('.reqore-tag-remove')[0]!);

  expect(onValueChange).toHaveBeenNthCalledWith(1, undefined);
  expect(screen.getByText('No value selected')).toBeTruthy();
});
