import { fireEvent, render } from '@testing-library/react';
import { ReqoreCallout, ReqoreContent, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

test('Renders <Callout /> with content', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout>No records match the current filters.</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
  expect(document.querySelectorAll('.reqore-callout-content').length).toBe(1);
  expect(document.querySelector('.reqore-callout')!.textContent).toBe(
    'No records match the current filters.'
  );
});

test('Calls <Callout /> onClick handler', () => {
  const handleClick = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout onClick={handleClick}>Open details</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-callout')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Renders <Callout /> with content effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout contentEffect={{ frost: true }}>Frosted text</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
  expect(document.querySelectorAll('.reqore-callout-content').length).toBe(1);
  expect(document.querySelector('.reqore-callout')!.textContent).toBe('Frosted text');
});

test('Renders <Callout /> with container effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout effect={{ gradient: { colors: { 0: 'info', 100: 'success' } } }}>
            Gradient surface
          </ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
  expect(document.querySelector('.reqore-callout')!.textContent).toBe('Gradient surface');
});

test('Renders <Callout /> with label and description', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Heads up' description='Something to look at' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-callout-label')!.textContent).toBe('Heads up');
  expect(document.querySelector('.reqore-callout-description')!.textContent).toBe(
    'Something to look at'
  );
});

test('Falls back to children when label/description are not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout>Plain children content</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout-content').length).toBe(1);
  expect(document.querySelectorAll('.reqore-callout-label').length).toBe(0);
});

test('Renders <Callout /> with icon', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout icon='InformationLine' label='Notice' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout-icon').length).toBe(1);
});

test('Renders <Callout /> with badge (string)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Notice' badge='New' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-button-badge')!.textContent).toContain('New');
});

test('Renders <Callout /> with badge array', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout
            label='Notice'
            badge={[3, { label: 'high', intent: 'danger' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(2);
});

test('Renders <Callout /> with onClose and fires it', () => {
  const handleClose = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Notice' onClose={handleClose} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout-close').length).toBe(1);

  fireEvent.click(document.querySelector('.reqore-callout-close')!);
  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('Close button click does not bubble to onClick', () => {
  const handleClick = vi.fn();
  const handleClose = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout
            label='Notice'
            onClick={handleClick}
            onClose={handleClose}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-callout-close')!);
  expect(handleClose).toHaveBeenCalledTimes(1);
  expect(handleClick).toHaveBeenCalledTimes(0);
});

test('Renders <Callout /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Info' intent='info' />
          <ReqoreCallout label='Success' intent='success' />
          <ReqoreCallout label='Warning' intent='warning' />
          <ReqoreCallout label='Danger' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(4);
});

test('Renders <Callout /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout size='tiny'>Tiny</ReqoreCallout>
          <ReqoreCallout size='small'>Small</ReqoreCallout>
          <ReqoreCallout size='normal'>Normal</ReqoreCallout>
          <ReqoreCallout size='big'>Big</ReqoreCallout>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(4);
});

test('Renders <Callout /> bordered with flat={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Bordered' intent='info' flat={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with rounded={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Square' rounded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with transparent background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Transparent' intent='info' transparent />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with labelEffect / descriptionEffect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout
            label='Notice'
            description='Body'
            labelEffect={{ uppercase: true }}
            descriptionEffect={{ italic: true }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout-label').length).toBe(1);
  expect(document.querySelectorAll('.reqore-callout-description').length).toBe(1);
});

test('Renders <Callout /> disabled', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Disabled' disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Raised' flat raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with padded=false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Unpadded' padded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with padded="horizontal"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Horizontal' padded='horizontal' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with padded="vertical"', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Vertical' padded='vertical' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with custom paddingSize', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Big, small padding' size='big' paddingSize='small' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});

test('Renders <Callout /> with padded=false + accent reserves accentSize', () => {
  // Even when padded={false} is set, the side that hosts the accent strip
  // must reserve accentSize so content does not collide with the strip.
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreCallout label='Reserve' padded={false} accentPosition='top' accentSize={8} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-callout').length).toBe(1);
});
