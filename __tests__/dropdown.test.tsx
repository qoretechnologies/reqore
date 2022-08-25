import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import {
  ReqoreContent,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

test('Renders <Dropdown /> properly', () => {
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
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
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

  expect(document.querySelector('.reqore-button')?.getAttribute('disabled')).toBe(null);
  expect(document.querySelectorAll('.reqore-button').length).toBe(1);
  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders disabled <Dropdown /> when children are empty', () => {
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

test('Renders <Dropdown /> with custom component and custom handler', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              component={ReqoreInput}
              handler='focus'
              useTargetWidth
              componentProps={{
                width: 500,
                placeholder: 'Focus me to see some crazy stuff',
              }}
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
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
  }

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders <Dropdown /> is opened by default', () => {
  act(() => {
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreDropdown
              component={ReqoreInput}
              handler='focus'
              isDefaultOpen
              useTargetWidth
              componentProps={{
                width: 500,
                placeholder: 'Focus me to see some crazy stuff',
              }}
              items={[
                {
                  selected: true,
                  label: 'Hello',
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
                  icon: 'StopCircleLine',
                },
              ]}
            />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);
});

test('Renders filterable <Dropdown /> and filters items correctly', () => {
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
                  icon: 'SunCloudyLine',
                },
                {
                  label: 'How are ya',
                  icon: 'BatteryChargeFill',
                },
                {
                  disabled: true,
                  label: 'i aM diSAblEd',
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
  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'how' },
  });

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(1);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: '' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(3);

  fireEvent.change(document.querySelector('.reqore-input')!, {
    target: { value: 'asfd' },
  });

  expect(document.querySelectorAll('.reqore-menu-item').length).toBe(0);
});
