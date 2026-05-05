import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreFeatureCard,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

test('Renders <FeatureCard /> with label and description', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Getting started' description='A short description.' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
  expect(document.querySelector('.reqore-feature-card-label')!.textContent).toBe('Getting started');
  expect(document.querySelector('.reqore-feature-card-description')!.textContent).toBe(
    'A short description.'
  );
});

test('Renders <FeatureCard /> with a number marker', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Define the goal' marker='number' markerLabel='01' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-feature-card-marker')!.textContent).toBe('01');
});

test('Does not render <FeatureCard /> marker when marker is none', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Without marker' marker='none' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card-marker').length).toBe(0);
});

test('Calls <FeatureCard /> onClick handler', () => {
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Clickable' onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-feature-card')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});
