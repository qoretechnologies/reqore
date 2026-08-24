import { fireEvent, render, screen } from '@testing-library/react';
import { noop } from 'lodash';
import {
  ReqoreContent,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqorePanel,
  ReqoreUIProvider,
} from '../src';

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

test('Does not forward the Panel fill layout flag to the DOM', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePanel fill>Filled panel</ReqorePanel>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const panel = container.querySelector('.reqore-panel');
  const warnings = consoleError.mock.calls.flat().join(' ');
  consoleError.mockRestore();
  expect(panel).toBeTruthy();
  expect(panel).not.toHaveAttribute('fill');
  expect(warnings).not.toMatch(/non-boolean attribute [`'"]?fill/i);
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

// Collect the re-resizable handle cursors currently in the document. re-resizable
// renders each handle as an absolutely-positioned div whose inline `cursor` ends
// in `-resize` (e.g. `row-resize`, `col-resize`, `nw-resize`).
const getResizeHandleCursors = () =>
  Array.from(document.querySelectorAll<HTMLElement>('*'))
    .filter((el) => /-resize$/.test(el.style?.cursor || ''))
    .map((el) => el.style.cursor);

test('Forwards re-resizable `enable` so a resizable <Panel /> honours it', () => {
  // Regression: the panel's `shouldForwardProp` (isPropValid, via
  // `omitStyleProps`) used to strip `enable` before it reached re-resizable, so
  // the panel became resizable from every edge/corner regardless of `enable`.
  render(
    <div style={{ width: '600px', height: '400px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel
            label='Resizable'
            resizable={{
              enable: { top: true },
              defaultSize: { height: 200, width: '100%' },
            }}
          >
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  // Only the single enabled (top) handle renders — not all 8.
  expect(getResizeHandleCursors()).toEqual(['row-resize']);
});

test('A non-resizable <Panel /> renders no resize handles', () => {
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Static'>Body</ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  expect(getResizeHandleCursors()).toHaveLength(0);
});

test('Panel accent strip reserves accentSize and accepts TSizes names', () => {
  // The accent block reserves the strip's thickness as container padding.
  // 'big' maps to 7px via ACCENT_SIZE_TO_PX; 'normal' must equal the numeric
  // default (5px) so the string and number forms never drift apart.
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Numeric' intent='danger' accentPosition='left' accentSize={8}>
            Body
          </ReqorePanel>
          <ReqorePanel label='Big' intent='danger' accentPosition='left' accentSize='big'>
            Body
          </ReqorePanel>
          <ReqorePanel label='Default' intent='danger' accentPosition='left'>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const [numeric, big, byDefault] = Array.from(
    document.querySelectorAll('.reqore-panel')
  ) as HTMLElement[];
  expect(getComputedStyle(numeric).paddingLeft).toBe('8px');
  expect(getComputedStyle(big).paddingLeft).toBe('7px');
  expect(getComputedStyle(byDefault).paddingLeft).toBe('5px');
});

/** The generated styled-components rule matching `<selector>` for one of `el`'s own classes,
 *  e.g. `':hover'` or `'::before'`. Reading the rule text is the only way to assert on states
 *  and pseudo-elements — `getComputedStyle` cannot see either. */
const getRuleFor = (el: HTMLElement, selector: string): string | undefined => {
  const classes = Array.from(el.classList);
  for (const style of Array.from(document.querySelectorAll('style'))) {
    for (const rule of Array.from((style.sheet as CSSStyleSheet).cssRules)) {
      const { selectorText, cssText } = rule as CSSStyleRule;
      if (!selectorText?.includes(selector)) continue;
      if (classes.some((c) => selectorText.startsWith(`.${c}${selector}`))) return cssText;
    }
  }
  return undefined;
};

const declaration = (cssText: string | undefined, prop: string): string | undefined =>
  cssText?.match(new RegExp(`(?:^|[;{]) *${prop}: ([^;]+)`))?.[1];

test('Panel accentPosition keeps the intent off the border, at rest and on hover', () => {
  // The whole point of the accent strip: the intent paints ONE edge, and the border stays
  // neutral. Asserted as an invariant against a no-intent accent panel rather than against a
  // hardcoded colour, so a theme change cannot silently invalidate it. The plain intent panel
  // is the control — it proves these assertions can actually fail.
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Accent + intent' intent='danger' accentPosition='left' onClick={noop}>
            Body
          </ReqorePanel>
          <ReqorePanel label='Accent, no intent' accentPosition='left' onClick={noop}>
            Body
          </ReqorePanel>
          <ReqorePanel label='Intent, no accent' intent='danger' onClick={noop}>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const [accentIntent, accentPlain, intentOnly] = Array.from(
    document.querySelectorAll('.reqore-panel')
  ) as HTMLElement[];

  // At rest.
  expect(getComputedStyle(accentIntent).borderColor).toBe(getComputedStyle(accentPlain).borderColor);
  expect(getComputedStyle(accentIntent).borderColor).not.toBe(
    getComputedStyle(intentOnly).borderColor
  );

  // On hover — a separate rule that used to re-apply the intent the strip had just removed.
  const accentHover = declaration(getRuleFor(accentIntent, ':hover'), 'border-color');
  const plainHover = declaration(getRuleFor(accentPlain, ':hover'), 'border-color');
  const intentHover = declaration(getRuleFor(intentOnly, ':hover'), 'border-color');

  expect(accentHover).toBeDefined();
  expect(accentHover).toBe(plainHover);
  expect(accentHover).not.toBe(intentHover);
});

test('Panel accentPosition drops the border entirely when flat', () => {
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Flat accent' intent='danger' accentPosition='left' flat>
            Body
          </ReqorePanel>
          <ReqorePanel label='Bordered accent' intent='danger' accentPosition='left' flat={false}>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const [flat, bordered] = Array.from(document.querySelectorAll('.reqore-panel')) as HTMLElement[];
  expect(getComputedStyle(flat).borderStyle).toBe('none');
  expect(getComputedStyle(bordered).borderStyle).toBe('solid');
});

test('Panel raised applies on accent panels, which draw no border to compete with', () => {
  // `raised` is gated on "no border is drawn". With accentPosition + flat there is none, so the
  // highlight must apply — it used to be suppressed by a stale `!intent` check. A bordered
  // accent panel must still suppress it.
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Raised accent' intent='danger' accentPosition='left' flat raised>
            Body
          </ReqorePanel>
          <ReqorePanel label='Raised bordered' intent='danger' accentPosition='left' raised>
            Body
          </ReqorePanel>
          <ReqorePanel label='Raised plain' flat raised>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const [accent, bordered, plain] = Array.from(
    document.querySelectorAll('.reqore-panel')
  ) as HTMLElement[];
  expect(getComputedStyle(accent).boxShadow).toBe(getComputedStyle(plain).boxShadow);
  expect(getComputedStyle(accent).boxShadow).not.toBe('');
  expect(getComputedStyle(bordered).boxShadow).toBe('');
});

test('Panel renders the accent strip on either edge, neutral without an intent', () => {
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Left' intent='danger' accentPosition='left'>
            Body
          </ReqorePanel>
          <ReqorePanel label='Top' intent='danger' accentPosition='top'>
            Body
          </ReqorePanel>
          <ReqorePanel label='Neutral' accentPosition='left'>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const [left, top, neutral] = Array.from(
    document.querySelectorAll('.reqore-panel')
  ) as HTMLElement[];

  // `top` reserves its thickness on the top edge instead of the left.
  expect(getComputedStyle(left).paddingLeft).toBe('5px');
  expect(getComputedStyle(top).paddingTop).toBe('5px');
  expect(getComputedStyle(top).paddingLeft).toBe('0px');

  // The strip itself is a pseudo-element, so assert on the generated rule.
  const leftStrip = getRuleFor(left, '::before');
  const topStrip = getRuleFor(top, '::before');
  const neutralStrip = getRuleFor(neutral, '::before');

  expect(declaration(leftStrip, 'width')).toBe('5px');
  expect(declaration(topStrip, 'height')).toBe('5px');
  // Without an intent the strip still paints — as a neutral highlight, not the intent colour.
  expect(declaration(neutralStrip, 'background-color')).toBeDefined();
  expect(declaration(neutralStrip, 'background-color')).not.toBe(
    declaration(leftStrip, 'background-color')
  );
});

test('Panel accent strip rounds itself only when a sticky header stops the wrapper clipping', () => {
  // Non-sticky panels clip the strip via `overflow: hidden`, so a radius there would be
  // redundant. A sticky header forces `overflow: visible`, and an unclipped square strip would
  // poke out past the panel's rounded corners.
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Sticky' intent='danger' accentPosition='left' stickyHeader flat>
            Body
          </ReqorePanel>
          <ReqorePanel
            label='Sticky square'
            intent='danger'
            accentPosition='left'
            stickyHeader
            rounded={false}
            flat
          >
            Body
          </ReqorePanel>
          <ReqorePanel label='Not sticky' intent='danger' accentPosition='left' flat>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const [sticky, square, plain] = Array.from(
    document.querySelectorAll('.reqore-panel')
  ) as HTMLElement[];

  expect(declaration(getRuleFor(sticky, '::before'), 'border-top-left-radius')).toBe('5px');
  expect(declaration(getRuleFor(square, '::before'), 'border-top-left-radius')).toBeUndefined();
  expect(declaration(getRuleFor(plain, '::before'), 'border-top-left-radius')).toBeUndefined();
});

test('Does not forward the Panel accentPosition prop to the DOM', () => {
  // A resizable panel renders as a COMPONENT target, where styled-components forwards every
  // prop — re-resizable then spreads the leftovers onto its wrapper div.
  render(
    <div style={{ width: '600px' }}>
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqorePanel label='Plain' intent='danger' accentPosition='left'>
            Body
          </ReqorePanel>
          <ReqorePanel label='Resizable' intent='danger' accentPosition='left' resizable>
            Body
          </ReqorePanel>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    </div>
  );

  const panels = Array.from(document.querySelectorAll('.reqore-panel')) as HTMLElement[];
  panels.forEach((panel) => expect(panel.hasAttribute('accentposition')).toBe(false));
  // ...while the styles still read it — the strip is rendered.
  panels.forEach((panel) => expect(getComputedStyle(panel).paddingLeft).toBe('5px'));
});
