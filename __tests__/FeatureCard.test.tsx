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

test('Renders <FeatureCard /> with badge (string)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Card' badge='New' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-button-badge')!.textContent).toContain('New');
});

test('Renders <FeatureCard /> with badge array', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Card' badge={['v2', { label: 'beta', intent: 'warning' }]} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(2);
});

test('Renders <FeatureCard /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Info' intent='info' />
          <ReqoreFeatureCard label='Success' intent='success' />
          <ReqoreFeatureCard label='Warning' intent='warning' />
          <ReqoreFeatureCard label='Danger' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(4);
});

test('Renders <FeatureCard /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Tiny' size='tiny' />
          <ReqoreFeatureCard label='Small' size='small' />
          <ReqoreFeatureCard label='Normal' size='normal' />
          <ReqoreFeatureCard label='Big' size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(4);
});

test('Renders <FeatureCard /> bordered with flat={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Bordered' intent='info' flat={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

test('Renders <FeatureCard /> with rounded={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Square' rounded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

test('Renders <FeatureCard /> with transparent background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Transparent' transparent />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

test('Renders <FeatureCard /> disabled', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Disabled' disabled onClick={() => {}} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

test('Renders <FeatureCard /> with effect / labelEffect / descriptionEffect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard
            label='Card'
            description='Description'
            effect={{
              gradient: { colors: { 0: 'info:darken:5', 100: 'transparent' } },
            }}
            labelEffect={{ uppercase: true }}
            descriptionEffect={{ italic: true }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
  expect(document.querySelectorAll('.reqore-feature-card-description').length).toBe(1);
});

test('Renders <FeatureCard /> with wrap=false (single-line ellipsis)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard
            label='Long card label that should ellipsize'
            description='Long description that should also ellipsize when wrap is false'
            wrap={false}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card-label').length).toBe(1);
  expect(document.querySelectorAll('.reqore-feature-card-description').length).toBe(1);
});

test('Auto-detects interactive when onClick is provided', () => {
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Auto interactive' onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-feature-card')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Renders <FeatureCard /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Raised' flat raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});
