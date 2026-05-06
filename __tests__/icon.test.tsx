import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { ReqoreContent, ReqoreIcon, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

test('Renders <Icon /> properly', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='AccountBoxFill' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(1);
  expect(document.querySelectorAll('svg').length).toBe(1);
});

test('Renders empty <Icon /> if icon does not exist', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          {/*@ts-expect-error*/}
          <ReqoreIcon icon='SomeNonExistingIcon' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-icon').length).toBe(1);
  expect(document.querySelector('.reqore-icon').textContent).toBe('');
  expect(document.querySelectorAll('svg').length).toBe(0);
});

test('Tooltip on <Icon /> works', () => {
  jest.useFakeTimers();

  render(
    <ReqoreUIProvider>
      <ReqoreIcon icon='24HoursLine' tooltip='test' />
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(0);

  fireEvent.mouseEnter(document.querySelectorAll('.reqore-icon')[0]);

  jest.advanceTimersByTime(1);

  expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
});

test('Renders <Icon /> with glow=true (drop-shadow filter)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='SparklingLine' intent='info' glow />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const wrapper = document.querySelector('.reqore-icon') as HTMLElement;
  expect(wrapper).toBeTruthy();
  expect(wrapper.style.filter).toContain('drop-shadow');
});

test('Renders <Icon /> with glow as a color string', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='SparklingLine' glow='#bd2ff6' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const wrapper = document.querySelector('.reqore-icon') as HTMLElement;
  expect(wrapper.style.filter).toContain('drop-shadow');
});

test('Renders <Icon /> with glow object (custom blur and opacity)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon
            icon='SparklingLine'
            intent='success'
            glow={{ blur: 16, opacity: 0.7 }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const wrapper = document.querySelector('.reqore-icon') as HTMLElement;
  expect(wrapper.style.filter).toContain('drop-shadow');
  expect(wrapper.style.filter).toContain('16px');
});

test('Does not apply glow filter when glow is not set', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='SparklingLine' intent='info' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const wrapper = document.querySelector('.reqore-icon') as HTMLElement;
  expect(wrapper.style.filter).toBe('');
});

test('Applies glow when global glowingIcons option is enabled', () => {
  render(
    <ReqoreUIProvider options={{ glowingIcons: true }}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='SparklingLine' intent='info' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const wrapper = document.querySelector('.reqore-icon') as HTMLElement;
  expect(wrapper.style.filter).toContain('drop-shadow');
});

test('Local glow=false overrides global glowingIcons', () => {
  render(
    <ReqoreUIProvider options={{ glowingIcons: true }}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='SparklingLine' intent='info' glow={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const wrapper = document.querySelector('.reqore-icon') as HTMLElement;
  expect(wrapper.style.filter).toBe('');
});

test('Does not apply glow when glowingIcons option is disabled', () => {
  render(
    <ReqoreUIProvider options={{ glowingIcons: false }}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreIcon icon='SparklingLine' intent='info' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const wrapper = document.querySelector('.reqore-icon') as HTMLElement;
  expect(wrapper.style.filter).toBe('');
});
