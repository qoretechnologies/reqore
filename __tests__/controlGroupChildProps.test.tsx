import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';
import { IReqoreButtonProps } from '../src/components/Button';

/**
 * A control group hands each child the group's own `minimal` / `flat` /
 * `fixed` / … so a row of controls reads as one row. Where the group has
 * nothing to say about a prop, it has to say *nothing* — not `undefined`.
 *
 * The difference is invisible for a plain Reqore child, which reads its own
 * props with its own defaults. It is not invisible for a consumer's wrapper
 * component, which typically writes a default and then spreads the props it
 * was handed onto the element underneath: an injected `undefined` lands after
 * that default and destroys it. The wrapper then renders solid in a row of
 * minimal buttons, and no prop the caller passes can fix it, because the group
 * is what overwrote it.
 *
 * Reported against a Qorus IDE connection page: three flat icon buttons in an
 * action rail and one filled box, which was its ping button — a wrapper with
 * `minimal` defaulted.
 */

/** The shape a consumer's wrapper has: own default, then the caller's props. */
const WrappedButton = ({ minimal = true, ...rest }: IReqoreButtonProps) => (
  <ReqoreButton icon='CheckLine' {...rest} minimal={minimal} className='wrapped' />
);

/** As above but with the default written in the JSX *before* the spread —
 *  the shape that cannot defend itself, and the one this fix is for. */
const NaiveWrappedButton = (props: IReqoreButtonProps) => (
  <ReqoreButton icon='CheckLine' minimal {...props} className='naive' />
);

const classesOf = (selector: string, node: React.ReactNode): string => {
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup>{node}</ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const element = container.querySelector(selector);
  expect(element).toBeTruthy();
  return element!.className
    .split(/\s+/)
    .filter((name) => name && name !== 'wrapped' && name !== 'naive')
    .sort()
    .join(' ');
};

test('a group that sets no `minimal` does not clear a child wrapper’s own default', () => {
  // The naive wrapper is the one the old behaviour broke: its `minimal` sat
  // before the spread, so an injected `undefined` overwrote it.
  expect(classesOf('.naive', <NaiveWrappedButton />)).toBe(
    classesOf('.reqore-button', <ReqoreButton icon='CheckLine' minimal />)
  );
});

test('a wrapper that defends its default renders the same either way', () => {
  expect(classesOf('.wrapped', <WrappedButton />)).toBe(
    classesOf('.reqore-button', <ReqoreButton icon='CheckLine' minimal />)
  );
});

test('the group still overrides a child that set nothing, when the group DID set it', () => {
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreButton icon='CheckLine' />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const grouped = container.querySelector('.reqore-button')!.className;

  const { container: plain } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup>
            <ReqoreButton icon='CheckLine' minimal />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(grouped).toBe(plain.querySelector('.reqore-button')!.className);
});

test('a child’s own value still beats the group’s', () => {
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreButton icon='CheckLine' minimal={false} />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const overridden = container.querySelector('.reqore-button')!.className;

  const { container: grouped } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup minimal>
            <ReqoreButton icon='CheckLine' />
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  expect(overridden).not.toBe(grouped.querySelector('.reqore-button')!.className);
});
