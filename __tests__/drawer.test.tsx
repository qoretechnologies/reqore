import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreDrawer,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

test('Does not render <Drawer /> if not open', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer>Hello</ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-drawer').length).toBe(0);
});

test('Renders opened <Drawer /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen>Hello</ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);
});

test('Renders hidable <Drawer /> properly', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen hidable onHideToggle={fn} isHidden>
            Hello
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-drawer').length).toBe(0);
  expect(document.querySelectorAll('.reqore-drawer-hide-button').length).toBe(1);
  expect(document.querySelectorAll('.reqore-drawer-close-button').length).toBe(0);

  fireEvent.click(document.querySelector('.reqore-drawer-hide-button')!);

  expect(fn).toHaveBeenCalledWith(false);
  expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-drawer-hide-button')!);

  expect(fn).toHaveBeenLastCalledWith(true);
  expect(fn).toHaveBeenCalledTimes(2);
});

test('Renders closable <Drawer /> properly', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ width: 800 }}>
          <ReqoreDrawer isOpen onClose={fn}>
            Hello
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);
  expect(document.querySelectorAll('.reqore-drawer-close-button').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-drawer-close-button')!);

  expect(fn).toHaveBeenCalled();
});

test('Renders <Drawer /> with interactive backdrop', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen onClose={fn} hasBackdrop>
            Hello
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);
  expect(document.querySelectorAll('.reqore-drawer-close-button').length).toBe(1);
  expect(document.querySelectorAll('.reqore-drawer-backdrop').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-drawer-backdrop')!);

  expect(fn).toHaveBeenCalled();
});

const CustomDrawer = () => {
  const [count, setCount] = React.useState(0);

  return (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen hasBackdrop actions={[{ label: `Count is ${count}` }]}>
            <ReqoreButton onClick={() => setCount(count + 1)}>Click me</ReqoreButton>
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

test('<Drawer /> actions are changed properly', () => {
  const { getAllByText } = render(<CustomDrawer />);

  expect(getAllByText('Count is 0')[0]).toBeTruthy();

  fireEvent.click(getAllByText('Click me')[0]);

  expect(getAllByText('Count is 1')[0]).toBeTruthy();
});
