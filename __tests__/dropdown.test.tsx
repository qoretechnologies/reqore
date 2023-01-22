import { fireEvent, render } from '@testing-library/react';
import React, { useEffect, useState } from 'react';
import { act } from 'react-dom/test-utils';
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';
import { IReqoreInputProps } from '../src/components/Input';

beforeAll(() => {
  jest.setTimeout(30000);
});

test('Renders <Dropdown /> properly', () => {
  jest.useFakeTimers();
  act(() => {
    jest.advanceTimersByTime(1);
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'howareya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'disabled',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);
  jest.advanceTimersByTime(1);

  expect(document.querySelector('.reqore-button')?.getAttribute('disabled')).toBe(null);
  expect(document.querySelectorAll('.reqore-button').length).toBe(4);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders disabled <Dropdown /> when items are empty', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);

  expect(document.querySelector('.reqore-button')?.getAttribute('disabled')).toBe('');
});

test('Renders disabled <Dropdown /> when items are not empty & disabled prop is true', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              label='Disabled with items'
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'howareya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'disabled',
                  icon: 'StopCircleLine',
                },
              ]}
              disabled
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelector('.reqore-button')?.getAttribute('disabled')).toBe('');
});

test('Renders <Dropdown /> with custom component and custom handler', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              component={ReqoreInput}
              handler='focus'
              useTargetWidth
              width={500}
              placeholder='Focus me to see some crazy stuff'
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'asg',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'hhhhh',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  const component = document.querySelector('.reqore-input');

  if (component) {
    fireEvent.focus(component);
    jest.advanceTimersByTime(1);
  }

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders <Dropdown /> is opened by default', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown<IReqoreInputProps>
              component={ReqoreInput}
              handler='focus'
              isDefaultOpen
              useTargetWidth
              width={500}
              placeholder='Focus me to see some crazy stuff'
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'asg',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'hhhhh',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders <Dropdown /> and calls a function on item click', () => {
  jest.useFakeTimers();
  const onClick = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                  onClick,
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
    jest.advanceTimersByTime(1);
  });

  fireEvent.click(document.querySelector('.reqore-button')!);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-menu-item')!);
  expect(onClick).toHaveBeenCalledWith({
    selected: true,
    label: 'Hello',
    value: 'hello',
    icon: 'SunCloudyLine',
    onClick,
  });
});

test('Renders filterable <Dropdown /> and filters items correctly', () => {
  jest.useFakeTimers();
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              filterable
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  value: 'hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  value: 'howareya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  value: 'disabled',
                  icon: 'StopCircleLine',
                },
                {
                  value: 'onlyvalue',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);
  jest.advanceTimersByTime(1);
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'how' },
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(1);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: '' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(4);

  // Search in value only
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'onlyvalue' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(1);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'asfd' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(0);
});

const MultiSelectDropdown = ({ onChange }) => {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  return (
    <ReqoreDropdown
      multiSelect
      onItemSelect={({ value }) => setSelected([...selected, value])}
      items={[
        {
          label: 'Item 1',
          value: 'item-1',
          selected: selected.includes('item-1'),
        },
        {
          label: 'Item 2',
          value: 'item-2',
          selected: selected.includes('item-2'),
        },
      ]}
    />
  );
};

test('Renders <Dropdown /> and updates its items when state changes', () => {
  const fn = jest.fn();

  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <MultiSelectDropdown onChange={fn} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  fireEvent.click(document.querySelector('.reqore-button')!);

  expect(document.querySelectorAll('.reqore-button').length).toBe(3);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(2);

  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[0]);
  expect(fn).toHaveBeenNthCalledWith(2, ['item-1']);

  fireEvent.click(document.querySelectorAll('.reqore-menu-item')[1]);
  expect(fn).toHaveBeenNthCalledWith(3, ['item-1', 'item-2']);
});
