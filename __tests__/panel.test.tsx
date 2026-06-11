import { fireEvent, render, screen } from '@testing-library/react';
import { ReqoreInput, ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';

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
          <ReqorePanel icon='4kFill' label='Test'>
            {' '}
            Panel{' '}
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  expect(document.querySelectorAll('.reqore-panel').length).toBe(1);
  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
  expect(document.querySelectorAll('span').length).toBe(2);
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

  fireEvent.click(collapseButton!);

  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(1);

  fireEvent.click(collapseButton!);

  expect(document.querySelectorAll('.reqore-panel-content').length).toBe(0);
});

test('Renders closable <Panel /> properly', () => {
  const fn = vi.fn();

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

  fireEvent.click(closeButton!);

  expect(fn).toHaveBeenCalled();
});

test('Renders <Panel /> with actions', () => {
  const fn = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel
          label='Test'
          onClose={fn}
          actions={[
            { label: 'Test' },
            { actions: [{ label: 'Deep' }] },
            { as: ReqoreInput },
            { label: 'hidden', show: false },
          ]}
          bottomActions={[
            { label: 'Test', position: 'left' },
            { actions: [{ label: 'Deep' }], position: 'right' },
            { label: 'hidden', show: false },
          ]}
        >
          {' '}
          Panel{' '}
        </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-button').length).toBe(5);
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(2);
  expect(document.querySelectorAll('.reqore-input').length).toBe(1);
});

test('Renders <Panel /> without actions group if all actions are not shown', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel
          label='Test'
          actions={[
            { label: 'Test', show: false },
            { actions: [{ label: 'Deep' }], show: false },
            { as: ReqoreInput, show: false },
            { label: 'hidden', show: false },
          ]}
        >
          Panel
        </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-control-group').length).toBe(0);
  expect(document.querySelectorAll('.reqore-button').length).toBe(0);
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(0);
  expect(document.querySelectorAll('.reqore-input').length).toBe(0);
});

test('Renders <Panel /> without title & bottom actions if all actions are not shown, there is no icon, & title is not collapsible', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel
          actions={[
            { label: 'Test', show: false },
            { actions: [{ label: 'Deep' }], show: false },
            { as: ReqoreInput, show: false },
            { label: 'hidden', show: false },
            {
              group: [
                { label: 'Test 2', show: true },
                { label: 'Test 3', show: true },
              ],
              show: false,
            },
          ]}
          bottomActions={[
            { label: 'Test', show: false },
            { actions: [{ label: 'Deep' }], show: false },
            { as: ReqoreInput, position: 'right', show: false },
            { label: 'hidden', show: false },
            {
              position: 'right',
              group: [
                { label: 'Test 2', show: true },
                { label: 'Test 3', show: true },
              ],
              show: false,
            },
          ]}
        >
          Panel
        </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-control-group').length).toBe(0);
  expect(document.querySelectorAll('.reqore-button').length).toBe(0);
  expect(document.querySelectorAll('.reqore-dropdown-control').length).toBe(0);
  expect(document.querySelectorAll('.reqore-input').length).toBe(0);
  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(0);
  expect(document.querySelectorAll('.reqore-panel-bottom-actions').length).toBe(0);
});

test('Custom control props on <Panel />', () => {
  vi.useFakeTimers();
  const onClose = vi.fn();

  render(
    <ReqoreUIProvider>
      <ReqorePanel
        onClose={onClose}
        collapsible
        closeButtonProps={{ label: 'Close me' }}
        collapseButtonProps={{ label: 'Collapse me' }}
      >
        Hello
      </ReqorePanel>
    </ReqoreUIProvider>
  );

  expect(screen.getAllByText('Close me')).toBeTruthy();
  expect(screen.getAllByText('Collapse me')).toBeTruthy();
});

test('Renders <Panel /> with raised effect', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel flat raised> Raised </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-panel').length).toBe(1);
});

test('Renders <Panel /> with iconWithLabel placing icon next to label', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel
          icon='4kFill'
          label='With label'
          description='Description below'
          iconWithLabel
        >
          Panel
        </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  // When iconWithLabel is true, the icon must live INSIDE the label+badge row
  // — i.e. it sits next to the label rather than to the left of the whole stack.
  const labelRow = document.querySelector(
    '.reqore-panel-title .reqore-icon'
  );
  expect(labelRow).toBeTruthy();
  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
});

test('Renders <Panel /> with iconVerticalAlign=top', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel
          icon='4kFill'
          label='Top aligned'
          description='Description'
          iconVerticalAlign='top'
        >
          Panel
        </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon').length).toBeGreaterThan(0);
});

test('Renders <Panel /> with iconVerticalAlign=bottom', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel
          icon='4kFill'
          label='Bottom aligned'
          description='Description'
          iconVerticalAlign='bottom'
        >
          Panel
        </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
  expect(document.querySelectorAll('.reqore-icon').length).toBeGreaterThan(0);
});

test('Renders <Panel /> with default iconVerticalAlign=center', () => {
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqorePanel icon='4kFill' label='Centered' description='Description'>
          Panel
        </ReqorePanel>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(document.querySelectorAll('.reqore-panel-title').length).toBe(1);
});

test('Panel content area carries min-height:0 so a tall body scrolls instead of stranding the footer', () => {
  render(
    <div style={{ width: '1000px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Test' bottomActions={[{ label: 'Save', position: 'right' }]}>
            Panel body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const content = document.querySelector('.reqore-panel-content');
  expect(content).toBeTruthy();

  // styled-components (v5, test mode) injects readable CSS into <style> tags.
  const css = Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent || '')
    .join('\n');

  // One of the content element's styled-components classes must carry the
  // `min-height: 0` declaration. Without it a flex child can't shrink below its
  // content size, so a tall body pushes the (flex: 0 0 auto) bottom-actions
  // footer past the panel's clipped edge instead of scrolling.
  const hasMinHeightRule = Array.from(content!.classList).some((cls) =>
    new RegExp(`\\.${cls}[^{}]*\\{[^}]*min-height:\\s*0`).test(css)
  );
  expect(hasMinHeightRule).toBe(true);
});
