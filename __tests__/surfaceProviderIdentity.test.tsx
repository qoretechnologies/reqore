import { act, render } from '@testing-library/react';
import { memo, useState } from 'react';
import { TReqoreHexColor } from '../src/components/Effect';
import { ReqoreSurfaceProvider, useReqoreSurface } from '../src/context/SurfaceContext';

/**
 * A component that paints a background hands it to what it holds as their surface, and a component that works its
 * colors out again on each render (an inline effect, a content effect) hands down a new list each time. The
 * surface stays the same value for as long as its colors do: every component below that reads it would otherwise
 * render again with each render above it.
 */
describe('the surface a provider hands down', () => {
  test('a list rebuilt with the same colors does not render what reads it again', () => {
    let renders = 0;
    const Reader = memo(() => {
      renders++;

      return <span data-testid='surface'>{String(useReqoreSurface())}</span>;
    });
    let rerender: (colors: TReqoreHexColor[]) => void = () => undefined;
    const Painted = () => {
      const [colors, setColors] = useState<TReqoreHexColor[]>(['#111111', '#222222']);

      rerender = setColors;

      return (
        // a new list on each render, as an inline effect makes it
        <ReqoreSurfaceProvider color={[...colors]}>
          <Reader />
        </ReqoreSurfaceProvider>
      );
    };
    const { getByTestId } = render(<Painted />);

    expect(renders).toBe(1);

    act(() => rerender(['#111111', '#222222']));
    act(() => rerender(['#111111', '#222222']));

    expect(renders).toBe(1);

    // new colors are handed down
    act(() => rerender(['#111111', '#333333']));

    expect(renders).toBe(2);
    expect(getByTestId('surface').textContent).toBe('#111111,#333333');
  });

  test('a single color and a list of it are told apart', () => {
    const seen: unknown[] = [];
    const Reader = () => {
      seen.push(useReqoreSurface());

      return null;
    };
    const { rerender } = render(
      <ReqoreSurfaceProvider color='#111111'>
        <Reader />
      </ReqoreSurfaceProvider>
    );

    rerender(
      <ReqoreSurfaceProvider color={['#111111']}>
        <Reader />
      </ReqoreSurfaceProvider>
    );

    expect(seen).toEqual(['#111111', ['#111111']]);
  });

  test('without a color of its own, it hands down the surface around it', () => {
    let renders = 0;
    const Reader = memo(() => {
      renders++;

      return null;
    });
    let rerender: () => void = () => undefined;
    const Outer = () => {
      const [, setCount] = useState(0);

      rerender = () => setCount((count) => count + 1);

      return (
        <ReqoreSurfaceProvider color={['#111111']}>
          <ReqoreSurfaceProvider>
            <Reader />
          </ReqoreSurfaceProvider>
        </ReqoreSurfaceProvider>
      );
    };

    render(<Outer />);
    act(() => rerender());

    expect(renders).toBe(1);
  });
});
