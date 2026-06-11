import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreEmptyState,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

test('Renders <EmptyState /> with title', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='No data' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(1);
  expect(document.querySelector('.reqore-empty-state-title')!.textContent).toBe('No data');
});

test('Renders <EmptyState /> with icon', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState icon='InboxLine' title='Empty' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state-icon').length).toBe(1);
});

test('Does not render icon when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='No icon' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state-icon').length).toBe(0);
});

test('Renders <EmptyState /> with string description', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Empty' description='Nothing here yet.' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-empty-state-description')!.textContent).toBe(
    'Nothing here yet.'
  );
});

test('Renders <EmptyState /> with custom description node', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Empty' description={<span>Custom content</span>} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-empty-state-description')!.textContent).toBe(
    'Custom content'
  );
});

test('Does not render description when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='No description' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state-description').length).toBe(0);
});

test('Renders <EmptyState /> with actions', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState
            title='Empty'
            actions={
              <ReqoreControlGroup>
                <ReqoreButton>Action</ReqoreButton>
              </ReqoreControlGroup>
            }
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state-actions').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button').length).toBe(1);
});

test('Does not render actions when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='No actions' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state-actions').length).toBe(0);
});

test('Action button is clickable', () => {
  const handleClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState
            title='Empty'
            actions={<ReqoreButton onClick={handleClick}>Click me</ReqoreButton>}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-button')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Renders <EmptyState /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Tiny' size='tiny' />
          <ReqoreEmptyState title='Small' size='small' />
          <ReqoreEmptyState title='Normal' size='normal' />
          <ReqoreEmptyState title='Big' size='big' />
          <ReqoreEmptyState title='Huge' size='huge' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(5);
});

test('Renders <EmptyState /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Info' intent='info' />
          <ReqoreEmptyState title='Success' intent='success' />
          <ReqoreEmptyState title='Warning' intent='warning' />
          <ReqoreEmptyState title='Danger' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(4);
});

test('Renders <EmptyState /> disabled', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Disabled' disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(1);
});

test('Renders <EmptyState /> with fluid width', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Fluid' fluid />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(1);
});

test('Renders <EmptyState /> with rounded background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Rounded' rounded />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(1);
});

test('Renders <EmptyState /> with background effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState
            title='Effect'
            rounded
            effect={{
              gradient: {
                colors: { 0: 'info', 100: 'success' },
              },
            }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(1);
});

test('Renders <EmptyState /> with all features', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState
            icon='InboxLine'
            title='All features'
            description='Full featured empty state.'
            actions={<ReqoreButton>Action</ReqoreButton>}
            intent='info'
            rounded
            fluid
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(1);
  expect(document.querySelectorAll('.reqore-empty-state-icon').length).toBe(1);
  expect(document.querySelector('.reqore-empty-state-title')!.textContent).toBe('All features');
  expect(document.querySelector('.reqore-empty-state-description')!.textContent).toBe(
    'Full featured empty state.'
  );
  expect(document.querySelectorAll('.reqore-empty-state-actions').length).toBe(1);
});

test('Renders <EmptyState /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreEmptyState title='Raised' description='Test' raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-empty-state').length).toBe(1);
});
