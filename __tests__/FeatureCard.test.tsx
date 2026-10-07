import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
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
  const handleClick = vi.fn();

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
  const handleClick = vi.fn();

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

test('Renders <FeatureCard /> with padded=false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Unpadded' padded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

test('Renders <FeatureCard /> with padded="horizontal"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Horizontal' padded='horizontal' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

test('Renders <FeatureCard /> with padded="vertical"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Vertical' padded='vertical' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

test('Renders <FeatureCard /> with custom paddingSize', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard label='Big size, small padding' size='big' paddingSize='small' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-feature-card').length).toBe(1);
});

/* ------------------------------------------------------------------------------------------------
 * actions / footer
 * ---------------------------------------------------------------------------------------------- */

const renderCard = (props: Partial<React.ComponentProps<typeof ReqoreFeatureCard>>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreFeatureCard
            label='Double shipments'
            description='A retry ships twice.'
            {...props}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const footer = () => document.querySelector('.reqore-feature-card-footer') as HTMLElement;
const actionButtons = () =>
  Array.from(document.querySelectorAll('.reqore-feature-card-action')) as HTMLElement[];

test('A card with neither actions nor footer renders no footer row', () => {
  renderCard({});

  expect(footer()).toBeNull();
  expect(document.querySelector('.reqore-feature-card').children).toHaveLength(2);
});

test('actions render as buttons in the footer, the last row of the card', () => {
  const onFix = vi.fn();

  renderCard({
    actions: [
      { label: 'Show me how', icon: 'ArrowRightLine', onClick: onFix },
      { label: 'Later', minimal: true },
    ],
  });

  const card = document.querySelector('.reqore-feature-card') as HTMLElement;

  expect(card.lastElementChild).toBe(footer());
  expect(screen.getByRole('button', { name: 'Show me how' })).toBe(actionButtons()[0]);
  expect(screen.getByRole('button', { name: 'Later' })).toBe(actionButtons()[1]);
  // The footer takes the card's spare height above it, so footers of equal cards line up.
  expect(getComputedStyle(footer()).marginTop).toBe('auto');

  fireEvent.click(actionButtons()[0]);
  expect(onFix).toHaveBeenCalledTimes(1);
});

test('A click on an action does not reach the card’s own onClick', () => {
  const onCard = vi.fn();
  const onAction = vi.fn();

  renderCard({ onClick: onCard, actions: [{ label: 'Fix', onClick: onAction }] });

  fireEvent.click(actionButtons()[0]);
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onCard).not.toHaveBeenCalled();

  fireEvent.click(document.querySelector('.reqore-feature-card-label'));
  expect(onCard).toHaveBeenCalledTimes(1);
});

test('Actions take the card size and intent unless they set their own', () => {
  renderCard({
    size: 'small',
    intent: 'success',
    actions: [{ label: 'Inherit' }, { label: 'Own', size: 'big', intent: 'danger' }],
  });

  const [inherited, own] = actionButtons();

  expect(getComputedStyle(inherited).fontSize).toBe('12px');
  expect(getComputedStyle(own).fontSize).toBe('17px');
  // A solid intent button is filled with the intent colour: success, and danger.
  expect(getComputedStyle(inherited).backgroundColor).toBe('rgb(10, 102, 64)');
  expect(getComputedStyle(own).backgroundColor).toBe('rgb(168, 42, 42)');
});

test('An action is fluid only when it says so', () => {
  renderCard({ actions: [{ label: 'Fixed' }, { label: 'Full width', fluid: true }] });

  const [plain, fluid] = actionButtons();

  expect(getComputedStyle(plain).flexGrow).toBe('0');
  expect(getComputedStyle(fluid).flexGrow).toBe('1');
});

test('footer renders before the actions, untouched by the footer row', () => {
  renderCard({
    footer: <span className='price'>$49</span>,
    actions: [{ label: 'Buy' }],
  });

  const [content, action] = Array.from(footer().children) as HTMLElement[];

  expect(content.classList.contains('reqore-feature-card-footer-content')).toBe(true);
  expect(content.querySelector('.price').textContent).toBe('$49');
  expect(action.classList.contains('reqore-feature-card-action')).toBe(true);
});

test('A footer without actions renders the footer row; text at the description size', () => {
  renderCard({ footer: 'Read the article' });

  const note = footer().querySelector('.reqore-paragraph') as HTMLElement;

  expect(footer().textContent).toBe('Read the article');
  expect(actionButtons()).toHaveLength(0);
  expect(note).toBeTruthy();
  expect(getComputedStyle(note).fontSize).toBe(
    getComputedStyle(document.querySelector('.reqore-feature-card-description')).fontSize
  );
});

test('footerProps reach the footer row', () => {
  renderCard({
    actions: [{ label: 'Go' }],
    footerProps: { vertical: true, className: 'card-footer', 'data-slot': 'footer' },
  });

  expect(footer().classList.contains('card-footer')).toBe(true);
  expect(footer().getAttribute('data-slot')).toBe('footer');
  expect(getComputedStyle(footer()).flexFlow).toContain('column');
});

test('Actions are disabled with the card, unless one says otherwise', () => {
  renderCard({
    disabled: true,
    actions: [{ label: 'Fix' }, { label: 'Read', disabled: false }],
  });

  const [fix, read] = actionButtons();

  expect(fix).toBeDisabled();
  expect(read).not.toBeDisabled();
});
