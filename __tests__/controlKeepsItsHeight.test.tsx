import { render } from '@testing-library/react';
import { SIZE_TO_PX, TSizes } from '../src/constants/sizes';
import {
  ReqoreCheckbox,
  ReqoreContent,
  ReqoreInput,
  ReqoreLayoutContent,
  ReqoreUIProvider,
} from '../src';

/**
 * A control is its size high, whatever the flex host around it does: its height is its floor as well as its start,
 * so a column with too little room for everything in it shrinks what can give way, never a field. An input may
 * shrink (`flex: 0 1 auto`, and `fixed` too), and in a column a search above a long list stood at half its height.
 */
const renderIn = (children: React.ReactNode) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <div style={{ display: 'flex', flexDirection: 'column', height: 40 }}>{children}</div>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

describe('a control never shrinks below its size', () => {
  test.each(['small', 'normal', 'big'] as TSizes[])('an input, %s', (size) => {
    renderIn(
      <>
        <ReqoreInput placeholder='Search' size={size} />
        <ReqoreInput placeholder='Name' size={size} fixed />
      </>
    );
    for (const wrapper of document.querySelectorAll('.reqore-control-wrapper')) {
      expect(getComputedStyle(wrapper).minHeight).toBe(`${SIZE_TO_PX[size]}px`);
      expect(getComputedStyle(wrapper).height).toBe(`${SIZE_TO_PX[size]}px`);
    }
  });

  test('a checkbox that keeps its label on one line', () => {
    renderIn(<ReqoreCheckbox label='Show only failing' fixed />);
    const checkbox = document.querySelector('.reqore-checkbox')!;
    expect(getComputedStyle(checkbox).minHeight).toBe(`${SIZE_TO_PX.normal}px`);
  });
});
