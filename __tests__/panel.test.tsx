import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';

test('Renders basic <Panel /> properly', () => {
  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel> Panel </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  expect(document.querySelectorAll('.reqore-panel').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(0);
});

test('Renders basic <Panel /> with title properly', () => {
  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Test'> Panel </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  expect(document.querySelectorAll('.reqore-panel').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
  expect(document.querySelectorAll('h3').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(1);
});

test('Renders basic <Panel /> that is collapsed by default and can be expanded', () => {
  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Test' isCollapsed collapsible>
            {' '}
            Panel{' '}
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const collapseButton = document.querySelector('.reqore-button');

  expect(document.querySelectorAll('.reqore-panel').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(0);
  expect(collapseButton).toBeTruthy();

  fireEvent.click(collapseButton);

  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(1);

  fireEvent.click(collapseButton);

  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(0);
});

test('Renders closable <Panel /> properly', () => {
  const fn = jest.fn();

  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Test' onClose={fn}>
            {' '}
            Panel{' '}
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const closeButton = document.querySelector('.reqore-button');

  expect(document.querySelectorAll('.reqore-panel').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(1);
  expect(closeButton).toBeTruthy();

  fireEvent.click(closeButton);

  expect(fn).toHaveBeenCalled();
});
