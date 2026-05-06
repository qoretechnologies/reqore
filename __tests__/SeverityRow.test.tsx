import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreSeverityRow,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';

test('Renders <SeverityRow /> with label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Critical issue' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
  expect(document.querySelector('.reqore-severity-row-label')!.textContent).toContain(
    'Critical issue'
  );
});

test('Renders <SeverityRow /> with description', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' description='Threshold exceeded' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-severity-row-description')!.textContent).toBe(
    'Threshold exceeded'
  );
});

test('Renders <SeverityRow /> with strip by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-strip').length).toBe(1);
});

test('Hides strip when showStrip is false', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' intent='danger' showStrip={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-strip').length).toBe(0);
});

test('Renders <SeverityRow /> with leading content', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            leading={<ReqoreTag size='tiny' label='Critical' />}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-severity-row-label')!.textContent).toContain('Critical');
});

test('Renders <SeverityRow /> with badge (string)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' badge='3 open' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelector('.reqore-button-badge')!.textContent).toContain('3 open');
});

test('Renders <SeverityRow /> with badge array', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            badge={[3, { label: 'mad', intent: 'danger' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button-badge').length).toBe(2);
});

test('Renders <SeverityRow /> with actions', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            actions={[{ label: 'Investigate' }, { icon: 'CloseLine' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-actions').length).toBe(1);
  expect(document.querySelector('.reqore-severity-row-actions')!.textContent).toContain(
    'Investigate'
  );
});

test('Calls onClick when row is clicked', () => {
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  fireEvent.click(document.querySelector('.reqore-severity-row')!);
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('Renders <SeverityRow /> with intents', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Info' intent='info' />
          <ReqoreSeverityRow label='Success' intent='success' />
          <ReqoreSeverityRow label='Warning' intent='warning' />
          <ReqoreSeverityRow label='Danger' intent='danger' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(4);
});

test('Renders <SeverityRow /> with different sizes', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Tiny' size='tiny' />
          <ReqoreSeverityRow label='Small' size='small' />
          <ReqoreSeverityRow label='Normal' size='normal' />
          <ReqoreSeverityRow label='Big' size='big' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(4);
});

test('Renders <SeverityRow /> bordered with flat={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Bordered' intent='warning' flat={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with rounded={false}', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Square' intent='info' rounded={false} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with transparent background', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Transparent' intent='info' transparent />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Renders <SeverityRow /> with effect/labelEffect/descriptionEffect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='With effects'
            description='Has description effect'
            intent='info'
            effect={{
              gradient: {
                colors: { 0: 'info:darken:5', 100: 'transparent' },
              },
            }}
            labelEffect={{ weight: 'bold', uppercase: true }}
            descriptionEffect={{ italic: true }}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(1);
});

test('Renders <SeverityRow /> disabled', () => {
  const handleClick = jest.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Disabled' disabled onClick={handleClick} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});

test('Does not render description when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(0);
});

test('Does not render actions when not provided', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-actions').length).toBe(0);
});

test('Renders <SeverityRow /> with wrap=false (single-line ellipsis)', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow
            label='Issue'
            description='Very long description that should ellipsize when wrap is false'
            wrap={false}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(1);
});

test('Renders <SeverityRow /> with wrap=true by default', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Issue' description='wraps by default' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row-description').length).toBe(1);
});

test('Renders <SeverityRow /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreSeverityRow label='Raised' raised />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-severity-row').length).toBe(1);
});
