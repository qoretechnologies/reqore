import { fireEvent, render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreButtonRail,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';
import { IReqoreButtonRailProps } from '../src/components/ButtonRail';
import { IReqoreButtonProps } from '../src/components/Button';
import { IReqoreCustomTheme } from '../src/hooks/useTheme';

const renderRail = (props: Partial<IReqoreButtonRailProps> = {}, children?: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButtonRail {...props}>
            {children ?? (
              <>
                <ReqoreButton icon='CursorLine'>Select</ReqoreButton>
                <ReqoreButton icon='ArrowGoBackLine' aria-label='Undo' />
                <ReqoreButton icon='ArrowGoForwardLine' aria-label='Redo' />
              </>
            )}
          </ReqoreButtonRail>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const rail = () => document.querySelector('.reqore-button-rail') as HTMLElement;
const railStyle = () => getComputedStyle(rail());

/** Records the props the rail hands a child, to assert the cascade itself. */
const seen: IReqoreButtonProps[] = [];
const Probe = (props: IReqoreButtonProps) => {
  seen.push(props);
  return <ReqoreButton {...props} />;
};

beforeEach(() => {
  seen.length = 0;
});

test('Renders <ButtonRail /> as a horizontal toolbar with its buttons', () => {
  renderRail();

  expect(document.querySelectorAll('.reqore-button-rail').length).toBe(1);
  expect(document.querySelectorAll('.reqore-button-rail-group').length).toBe(1);
  expect(rail().getAttribute('role')).toBe('toolbar');
  expect(rail().getAttribute('aria-orientation')).toBe('horizontal');
  expect(rail().querySelectorAll('.reqore-button').length).toBe(3);
});

test('Renders <ButtonRail /> items before children, and drops neither', () => {
  renderRail(
    {
      items: [
        { label: 'First', id: 'first' },
        { icon: 'HistoryLine', label: 'Second' },
      ],
    },
    <ReqoreButton>Child</ReqoreButton>
  );

  const labels = Array.from(rail().querySelectorAll('.reqore-button')).map(
    (button) => button.textContent
  );

  expect(labels.length).toBe(3);
  expect(labels[0]).toContain('First');
  expect(labels[1]).toContain('Second');
  expect(labels[2]).toContain('Child');
  expect(rail().querySelector('#first')).toBeTruthy();
});

test('Renders an empty <ButtonRail /> without crashing', () => {
  renderRail({}, false);

  expect(rail()).toBeTruthy();
  expect(rail().querySelectorAll('.reqore-button').length).toBe(0);
});

test('Renders a vertical <ButtonRail /> as a column toolbar of equal-width buttons', () => {
  renderRail({ vertical: true }, <Probe>Column</Probe>);

  expect(seen.pop()!.fluid).toBe(true);

  expect(rail().getAttribute('aria-orientation')).toBe('vertical');
  expect(railStyle().flexDirection).toBe('column');
});

test('Scales <ButtonRail /> padding with size', () => {
  renderRail({ size: 'small' }, <ReqoreButton>A</ReqoreButton>);
  const small = parseFloat(railStyle().paddingTop);
  document.body.innerHTML = '';

  renderRail({ size: 'huge' }, <ReqoreButton>A</ReqoreButton>);
  const huge = parseFloat(railStyle().paddingTop);

  expect(huge).toBeGreaterThan(small);
});

test('Honours <ButtonRail /> padded={false}', () => {
  renderRail({ padded: false });

  expect(parseFloat(railStyle().paddingTop)).toBe(0);
});

test('Cascades size to the buttons of a <ButtonRail />, unless a button sets its own', () => {
  renderRail(
    { size: 'big' },
    <>
      <Probe>Inherits</Probe>
      <Probe size='small'>Own</Probe>
    </>
  );

  expect(seen.some((props) => props.children === 'Inherits' && props.size === 'big')).toBe(true);
  expect(seen.some((props) => props.children === 'Own' && props.size === 'small')).toBe(true);
});

test('Defaults <ButtonRail /> buttons to flat pills; a button’s own props win', () => {
  renderRail(
    {},
    <>
      <Probe>Default</Probe>
      <Probe flat={false} pill={false}>
        Own
      </Probe>
    </>
  );

  const byDefault = seen.filter((props) => props.children === 'Default').pop()!;
  const own = seen.filter((props) => props.children === 'Own').pop()!;

  expect(byDefault.flat).toBe(true);
  expect(byDefault.pill).toBe(true);
  expect(own.flat).toBe(false);
  expect(own.pill).toBe(false);
});

test('Applies <ButtonRail /> buttonProps as defaults under each button’s own props', () => {
  renderRail(
    { buttonProps: { minimal: true, compact: true } },
    <>
      <Probe>Default</Probe>
      <Probe compact={false}>Own</Probe>
    </>
  );

  const byDefault = seen.filter((props) => props.children === 'Default').pop()!;
  const own = seen.filter((props) => props.children === 'Own').pop()!;

  expect(byDefault.minimal).toBe(true);
  expect(byDefault.compact).toBe(true);
  expect(own.compact).toBe(false);
});

test('Does not inject undefined props into <ButtonRail /> children', () => {
  renderRail({}, <Probe>Plain</Probe>);

  const props = seen.pop()!;

  expect('disabled' in props).toBe(false);
  expect('rounded' in props).toBe(false);
  expect('minimal' in props).toBe(false);
});

test('Squares a <ButtonRail /> with rounded={false} and its buttons with it', () => {
  renderRail({ rounded: false }, <Probe>Square</Probe>);

  expect(parseFloat(railStyle().borderRadius)).toBe(0);
  expect(seen.pop()!.rounded).toBe(false);
});

test('Renders <ButtonRail /> as a concentric pill by default and with a fixed radius for radiusSize', () => {
  renderRail({}, <Probe>Pill</Probe>);
  // Half a normal button (38px) plus the 6px padding: concentric with the pills.
  expect(railStyle().borderRadius).toBe('25px');
  document.body.innerHTML = '';
  seen.length = 0;

  renderRail({ radiusSize: 'big' }, <Probe>Radius</Probe>);
  expect(railStyle().borderRadius).not.toBe('25px');
  expect(parseFloat(railStyle().borderRadius)).toBeGreaterThan(0);
  // The buttons are only pills while the rail is one.
  expect('pill' in seen.pop()!).toBe(false);
});

test('Tints <ButtonRail /> with an intent and passes it to the buttons', () => {
  renderRail({}, <Probe>Neutral</Probe>);
  const neutralBorder = railStyle().borderTopColor;
  const neutralBackground = railStyle().backgroundColor;
  document.body.innerHTML = '';

  renderRail({ intent: 'danger' }, <Probe>Danger</Probe>);

  expect(railStyle().borderTopColor).not.toBe(neutralBorder);
  expect(railStyle().backgroundColor).not.toBe(neutralBackground);
  expect(seen.pop()!.intent).toBe('danger');
});

test('Draws a border on <ButtonRail /> by default and none when flat', () => {
  renderRail();
  expect(railStyle().borderTopStyle).toBe('solid');
  document.body.innerHTML = '';

  renderRail({ flat: true });
  expect(railStyle().borderTopWidth === '0' || railStyle().borderTopStyle === 'none').toBe(true);
});

test('Frosts <ButtonRail /> by default and drops the frost when opaque', () => {
  renderRail();
  expect(rail().style.backdropFilter || railStyle().backdropFilter).toContain('blur(14px)');
  document.body.innerHTML = '';

  renderRail({ opacity: 1 });
  expect(railStyle().backdropFilter || '').not.toContain('blur');
});

test('Honours <ButtonRail /> blur', () => {
  renderRail({ blur: 4 });

  expect(railStyle().backdropFilter).toContain('blur(4px)');
});

test('Drops the <ButtonRail /> surface when transparent', () => {
  renderRail({ transparent: true });

  expect(railStyle().backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(railStyle().boxShadow || 'none').toBe('none');
});

test('Makes a minimal <ButtonRail /> surface-less and its buttons minimal', () => {
  renderRail({ minimal: true }, <Probe>Minimal</Probe>);

  expect(railStyle().backgroundColor).toBe('rgba(0, 0, 0, 0)');
  expect(railStyle().borderTopWidth === '0' || railStyle().borderTopStyle === 'none').toBe(true);
  expect(seen.pop()!.minimal).toBe(true);
});

test('Lifts <ButtonRail /> with a shadow unless elevated={false}', () => {
  renderRail();
  expect(railStyle().boxShadow).toContain('40px');
  document.body.innerHTML = '';

  renderRail({ elevated: false });
  expect(railStyle().boxShadow || 'none').toBe('none');
});

test('Adds the raised highlight to a flat <ButtonRail /> only', () => {
  renderRail({ raised: true, flat: true, elevated: false });
  expect(railStyle().boxShadow).toContain('inset');
  document.body.innerHTML = '';

  renderRail({ raised: true, elevated: false });
  expect(railStyle().boxShadow || 'none').toBe('none');
});

test('Composes a <ButtonRail /> effect glow with its lift instead of losing either', () => {
  renderRail({ effect: { glow: { color: 'info', blur: 10 } } });

  const shadow = railStyle().boxShadow;

  expect(shadow).toContain('10px');
  expect(shadow).toContain('40px');
});

test('Paints a <ButtonRail /> effect gradient, including an array of gradients', () => {
  renderRail({
    effect: {
      gradient: [
        { colors: { 0: 'info', 100: 'success' } },
        { type: 'radial', colors: { 0: '#ffffff', 100: '#000000' } },
      ],
    },
  });

  expect(railStyle().backgroundImage || railStyle().background).toContain('gradient');
});

test('Makes a fluid <ButtonRail /> span its container', () => {
  renderRail({ fluid: true });

  expect(railStyle().width).toBe('100%');
});

test('Keeps a fixed <ButtonRail /> from growing', () => {
  renderRail({ fluid: true, fixed: true });

  expect(railStyle().flexGrow).toBe('0');
});

test('Disables every button of a disabled <ButtonRail />', () => {
  const onClick = vi.fn();

  renderRail(
    { disabled: true },
    <>
      <ReqoreButton onClick={onClick}>One</ReqoreButton>
      <ReqoreButton onClick={onClick}>Two</ReqoreButton>
    </>
  );

  expect(rail().getAttribute('aria-disabled')).toBe('true');
  rail()
    .querySelectorAll<HTMLButtonElement>('.reqore-button')
    .forEach((button) => {
      expect(button.disabled).toBe(true);
      fireEvent.click(button);
    });
  expect(onClick).not.toHaveBeenCalled();
});

test('Passes clicks through an enabled <ButtonRail />', () => {
  const onClick = vi.fn();

  renderRail({ items: [{ label: 'Go', onClick }] }, false);
  fireEvent.click(rail().querySelector('.reqore-button')!);

  expect(onClick).toHaveBeenCalledTimes(1);
});

test('Hands <ButtonRail /> customTheme to its buttons', () => {
  const customTheme: IReqoreCustomTheme = { main: '#4a1f55' };

  renderRail({ customTheme }, <Probe>Themed</Probe>);

  expect(seen.pop()!.customTheme).toEqual(customTheme);
});

test('Merges <ButtonRail /> className and style, and forwards its ref', () => {
  const ref = { current: null as HTMLDivElement | null };

  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreButtonRail ref={ref} className='mine' style={{ marginTop: 7 }} aria-label='Editor'>
            <ReqoreButton>A</ReqoreButton>
          </ReqoreButtonRail>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(rail().classList.contains('mine')).toBe(true);
  expect(rail().style.marginTop).toBe('7px');
  expect(rail().getAttribute('aria-label')).toBe('Editor');
  expect(ref.current).toBe(rail());
});

test('Moves focus between <ButtonRail /> buttons with the arrow keys, skipping disabled ones', () => {
  renderRail(
    {},
    <>
      <ReqoreButton>One</ReqoreButton>
      <ReqoreButton disabled>Two</ReqoreButton>
      <ReqoreButton>Three</ReqoreButton>
    </>
  );

  const [one, , three] = Array.from(rail().querySelectorAll<HTMLButtonElement>('.reqore-button'));

  one.focus();
  fireEvent.keyDown(one, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(three);

  // Wraps around at the end.
  fireEvent.keyDown(three, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(one);

  fireEvent.keyDown(one, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(three);

  fireEvent.keyDown(three, { key: 'Home' });
  expect(document.activeElement).toBe(one);

  fireEvent.keyDown(one, { key: 'End' });
  expect(document.activeElement).toBe(three);
});

test('Uses up/down (not left/right) in a vertical <ButtonRail />', () => {
  renderRail(
    { vertical: true },
    <>
      <ReqoreButton>One</ReqoreButton>
      <ReqoreButton>Two</ReqoreButton>
    </>
  );

  const [one, two] = Array.from(rail().querySelectorAll<HTMLButtonElement>('.reqore-button'));

  one.focus();
  fireEvent.keyDown(one, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(one);

  fireEvent.keyDown(one, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(two);

  fireEvent.keyDown(two, { key: 'ArrowUp' });
  expect(document.activeElement).toBe(one);
});

test('Leaves arrow keys to a text input inside a <ButtonRail />', () => {
  renderRail(
    {},
    <>
      <input className='rail-input' />
      <ReqoreButton>One</ReqoreButton>
    </>
  );

  const input = rail().querySelector('.rail-input') as HTMLInputElement;

  input.focus();
  fireEvent.keyDown(input, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(input);
});

test('Still calls a <ButtonRail /> onKeyDown handler', () => {
  const onKeyDown = vi.fn();

  renderRail({ onKeyDown });
  fireEvent.keyDown(rail().querySelector('.reqore-button')!, { key: 'ArrowRight' });

  expect(onKeyDown).toHaveBeenCalledTimes(1);
});
