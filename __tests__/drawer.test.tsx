import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ReqoreContent, ReqoreDrawer, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

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
  expect(document.querySelectorAll('.reqore-drawer-hide').length).toBe(1);
  expect(document.querySelectorAll('.reqore-drawer-close').length).toBe(0);

  fireEvent.click(document.querySelector('.reqore-drawer-hide'));

  expect(fn).toHaveBeenCalledWith(false);
  expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-drawer-hide'));

  expect(fn).toHaveBeenLastCalledWith(true);
  expect(document.querySelectorAll('.reqore-drawer').length).toBe(0);
  expect(fn).toHaveBeenCalledTimes(2);
});

test('Renders closable <Drawer /> properly', () => {
  const fn = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen onClose={fn}>
            Hello
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-drawer').length).toBe(1);
  expect(document.querySelectorAll('.reqore-drawer-close').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-drawer-close'));

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
  expect(document.querySelectorAll('.reqore-drawer-close').length).toBe(1);
  expect(document.querySelectorAll('.reqore-drawer-backdrop').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-drawer-backdrop'));

  expect(fn).toHaveBeenCalled();
});
