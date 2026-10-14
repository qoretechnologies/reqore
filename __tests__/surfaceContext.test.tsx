import { render } from '@testing-library/react';
import { ReqoreSurfaceProvider, useReqoreSurface } from '../src/context/SurfaceContext';

/** What a component reads as the surface it is drawn on. */
const Surface = () => <span data-testid='surface'>{useReqoreSurface() ?? 'none'}</span>;

describe('the surface a component is drawn on', () => {
  test('is unknown outside any component that paints one', () => {
    const { getByTestId } = render(<Surface />);

    expect(getByTestId('surface').textContent).toBe('none');
  });

  test('is the nearest painted one', () => {
    const { getByTestId } = render(
      <ReqoreSurfaceProvider color='#111111'>
        <ReqoreSurfaceProvider color='#222222'>
          <Surface />
        </ReqoreSurfaceProvider>
      </ReqoreSurfaceProvider>
    );

    expect(getByTestId('surface').textContent).toBe('#222222');
  });

  test('a component that paints nothing keeps the one around it', () => {
    const { getByTestId } = render(
      <ReqoreSurfaceProvider color='#111111'>
        <ReqoreSurfaceProvider>
          <Surface />
        </ReqoreSurfaceProvider>
      </ReqoreSurfaceProvider>
    );

    expect(getByTestId('surface').textContent).toBe('#111111');
  });
});
