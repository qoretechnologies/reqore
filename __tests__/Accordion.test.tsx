import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreAccordion,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

const basicItems = [
  { label: 'Item 1', content: 'Content 1' },
  { label: 'Item 2', content: 'Content 2' },
  { label: 'Item 3', content: 'Content 3' },
];

test('Renders <Accordion /> with items', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion').length).toBe(1);
  expect(document.querySelectorAll('.reqore-accordion-item').length).toBe(3);
  expect(document.querySelectorAll('.reqore-accordion-header').length).toBe(3);
});

test('Renders all item titles', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion-title').length).toBe(3);
  expect(document.querySelectorAll('.reqore-accordion-title')[0].textContent).toBe('Item 1');
  expect(document.querySelectorAll('.reqore-accordion-title')[1].textContent).toBe('Item 2');
  expect(document.querySelectorAll('.reqore-accordion-title')[2].textContent).toBe('Item 3');
});

test('Toggles item on header click', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const headers = document.querySelectorAll('.reqore-accordion-header');

  // Click to open first item
  fireEvent.click(headers[0]);

  // The header should have aria-expanded=true
  expect(headers[0].getAttribute('aria-expanded')).toBe('true');

  // Click again to close
  fireEvent.click(headers[0]);
  expect(headers[0].getAttribute('aria-expanded')).toBe('false');
});

test('Respects isOpen default state', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              { label: 'Open', content: 'Open content', isOpen: true },
              { label: 'Closed', content: 'Closed content' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const headers = document.querySelectorAll('.reqore-accordion-header');
  expect(headers[0].getAttribute('aria-expanded')).toBe('true');
  expect(headers[1].getAttribute('aria-expanded')).toBe('false');
});

test('Allows multiple items open when allowMultiple=true', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} allowMultiple />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const headers = document.querySelectorAll('.reqore-accordion-header');

  // Open first
  fireEvent.click(headers[0]);
  expect(headers[0].getAttribute('aria-expanded')).toBe('true');

  // Open second — first should stay open
  fireEvent.click(headers[1]);
  expect(headers[0].getAttribute('aria-expanded')).toBe('true');
  expect(headers[1].getAttribute('aria-expanded')).toBe('true');
});

test('Only one item open when allowMultiple=false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} allowMultiple={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const headers = document.querySelectorAll('.reqore-accordion-header');

  // Open first
  fireEvent.click(headers[0]);
  expect(headers[0].getAttribute('aria-expanded')).toBe('true');

  // Open second — first should close
  fireEvent.click(headers[1]);
  expect(headers[0].getAttribute('aria-expanded')).toBe('false');
  expect(headers[1].getAttribute('aria-expanded')).toBe('true');
});

test('Renders with icons', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              { label: 'With icon', content: 'Content', icon: 'Settings3Line' },
              { label: 'No icon', content: 'Content' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion-icon').length).toBe(1);
});

test('Renders with badges', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              { label: 'With badge', content: 'Content', badge: 5 },
              { label: 'No badge', content: 'Content' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(1);
});

test('Disabled items cannot be toggled', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              { label: 'Disabled', content: 'Content', disabled: true },
              { label: 'Normal', content: 'Content' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const headers = document.querySelectorAll('.reqore-accordion-header');

  // Click disabled item
  fireEvent.click(headers[0]);
  expect(headers[0].getAttribute('aria-expanded')).toBe('false');

  // Normal item should still work
  fireEvent.click(headers[1]);
  expect(headers[1].getAttribute('aria-expanded')).toBe('true');
});

test('Globally disabled accordion prevents all toggling', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} disabled />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion').length).toBe(1);
});

test('Keyboard: Enter toggles item', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const header = document.querySelectorAll('.reqore-accordion-header')[0];
  fireEvent.keyDown(header, { key: 'Enter' });
  expect(header.getAttribute('aria-expanded')).toBe('true');
});

test('Keyboard: Space toggles item', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const header = document.querySelectorAll('.reqore-accordion-header')[0];
  fireEvent.keyDown(header, { key: ' ' });
  expect(header.getAttribute('aria-expanded')).toBe('true');
});

test('Calls onItemToggle callback', () => {
  const handleToggle = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} onItemToggle={handleToggle} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelectorAll('.reqore-accordion-header')[1]);
  expect(handleToggle).toHaveBeenCalledWith(1, true);

  // Toggle again to close
  fireEvent.click(document.querySelectorAll('.reqore-accordion-header')[1]);
  expect(handleToggle).toHaveBeenCalledWith(1, false);
});

test('Renders with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} size='tiny' />
          <ReqoreAccordion items={basicItems} size='huge' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion').length).toBe(2);
});

test('Renders with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} intent='info' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion').length).toBe(1);
});

test('Renders with item-level intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              { label: 'Info', content: 'Content', intent: 'info' },
              { label: 'Danger', content: 'Content', intent: 'danger' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion-item').length).toBe(2);
});

test('Renders flat accordion', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} flat />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion').length).toBe(1);
});

test('Renders fluid accordion', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion items={basicItems} fluid />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-accordion').length).toBe(1);
});

test('Renders custom React content', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              {
                label: 'Custom',
                content: <div className='custom-content'>Custom element</div>,
                isOpen: true,
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.custom-content').length).toBe(1);
  expect(document.querySelector('.custom-content')!.textContent).toBe('Custom element');
});

test('Item separator border does not change color with item intent', () => {
  const { container: noIntent, unmount } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              { label: 'A', content: 'Content' },
              { label: 'B', content: 'Content' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const baseline = window.getComputedStyle(
    noIntent.querySelectorAll('.reqore-accordion-item')[1]
  ).borderTop;

  unmount();

  const { container: withIntent } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            items={[
              { label: 'A', content: 'Content', intent: 'danger' },
              { label: 'B', content: 'Content', intent: 'danger' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const intentBorder = window.getComputedStyle(
    withIntent.querySelectorAll('.reqore-accordion-item')[1]
  ).borderTop;

  expect(intentBorder).toBe(baseline);
});

test('Minimal accordion with item intent renders a tinted header background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreAccordion
            minimal
            items={[
              { label: 'Plain', content: 'Content' },
              { label: 'Danger', content: 'Content', intent: 'danger' },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const headers = document.querySelectorAll('.reqore-accordion-header');
  const plainBg = window.getComputedStyle(headers[0]).backgroundColor;
  const dangerBg = window.getComputedStyle(headers[1]).backgroundColor;

  // The non-intent minimal header stays transparent.
  expect(plainBg).toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
  // The intent minimal header gets a non-transparent tinted background.
  expect(dangerBg).not.toBe(plainBg);
  expect(dangerBg).not.toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
});
