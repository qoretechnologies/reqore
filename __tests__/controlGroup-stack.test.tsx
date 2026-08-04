import { render } from '@testing-library/react';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

// A stacked ControlGroup injects each child an inline border-radius: rounded
// outer end caps, squared joined edges. The squared corners must be an explicit
// `0` (not `undefined`) so the inline style wins over a child's own radius —
// e.g. `pill` — otherwise pill children scallop the row into "teeth".
test('stacked ControlGroup squares the inner corners of pill children', () => {
  const { container } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreControlGroup stack>
            <ReqoreButton pill>First</ReqoreButton>
            <ReqoreButton pill>Middle</ReqoreButton>
            <ReqoreButton pill>Last</ReqoreButton>
          </ReqoreControlGroup>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const [first, middle, last] = Array.from(
    container.querySelectorAll('.reqore-button')
  ) as HTMLElement[];

  // Middle segment: every corner explicitly squared.
  expect(middle.style.borderTopLeftRadius).toBe('0px');
  expect(middle.style.borderBottomLeftRadius).toBe('0px');
  expect(middle.style.borderTopRightRadius).toBe('0px');
  expect(middle.style.borderBottomRightRadius).toBe('0px');

  // First segment: joined (right) edge squared, outer (left) edge rounded.
  expect(first.style.borderTopRightRadius).toBe('0px');
  expect(first.style.borderBottomRightRadius).toBe('0px');
  expect(first.style.borderTopLeftRadius).not.toBe('0px');
  expect(first.style.borderTopLeftRadius).not.toBe('');

  // Last segment: joined (left) edge squared, outer (right) edge rounded.
  expect(last.style.borderTopLeftRadius).toBe('0px');
  expect(last.style.borderBottomLeftRadius).toBe('0px');
  expect(last.style.borderTopRightRadius).not.toBe('0px');
  expect(last.style.borderTopRightRadius).not.toBe('');
});
