import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import {
  ReqoreH1,
  ReqoreH2,
  ReqoreH3,
  ReqoreH4,
  ReqoreH5,
  ReqoreH6,
  ReqoreUIProvider,
} from '../src';

test('<Heading /> renders properly', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreH1>H1</ReqoreH1>
      <ReqoreH2>H2</ReqoreH2>
      <ReqoreH3>H3</ReqoreH3>
      <ReqoreH4>H4</ReqoreH4>
      <ReqoreH5>H5</ReqoreH5>
      <ReqoreH6>H6</ReqoreH6>
    </ReqoreUIProvider>
  );

  expect(screen.getAllByText('H1')).toBeTruthy();
  expect(screen.getAllByText('H2')).toBeTruthy();
  expect(screen.getAllByText('H3')).toBeTruthy();
  expect(screen.getAllByText('H4')).toBeTruthy();
  expect(screen.getAllByText('H5')).toBeTruthy();
  expect(screen.getAllByText('H6')).toBeTruthy();

  expect(document.querySelectorAll('h1').length).toBe(1);
  expect(document.querySelectorAll('h2').length).toBe(1);
  expect(document.querySelectorAll('h3').length).toBe(1);
  expect(document.querySelectorAll('h4').length).toBe(1);
  expect(document.querySelectorAll('h5').length).toBe(1);
  expect(document.querySelectorAll('h6').length).toBe(1);
});

test('Tooltip on <Heading /> works', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreH3 tooltip='test'>Test</ReqoreH3>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('h3')[0]);

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});
