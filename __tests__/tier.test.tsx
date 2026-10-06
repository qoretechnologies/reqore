import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTier, ReqoreUIProvider } from '../src';
import { IReqoreTierProps } from '../src/components/Tier';

const renderTier = (props: Partial<IReqoreTierProps>) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTier name='Pro' price={49} currency='$' priceDetail='/ month' {...props} />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const priceDetail = () => document.querySelector('.reqore-tier-price-detail') as HTMLElement;

test('The price detail is small, uppercase and muted by default', () => {
  renderTier({});

  expect(priceDetail().textContent).toBe('/ month');
  expect(getComputedStyle(priceDetail()).textTransform).toBe('uppercase');
  expect(getComputedStyle(priceDetail()).fontSize).toBe('12px');
});

test('No price detail renders no line', () => {
  renderTier({ priceDetail: undefined });

  expect(priceDetail()).toBeNull();
});

test('priceDetailEffect is spread over the defaults: the case can stay as written', () => {
  const { unmount } = renderTier({});
  const mutedColor = getComputedStyle(priceDetail()).color;
  unmount();

  renderTier({ priceDetailEffect: { uppercase: false, color: '#ffffff' } });

  expect(getComputedStyle(priceDetail()).textTransform).not.toBe('uppercase');
  expect(getComputedStyle(priceDetail()).color).toBe('rgb(255, 255, 255)');
  expect(getComputedStyle(priceDetail()).color).not.toBe(mutedColor);
});

test('priceDetailProps reach the paragraph, its effect merged under priceDetailEffect', () => {
  renderTier({
    priceDetailProps: {
      size: 'normal',
      className: 'billing-period',
      'aria-label': 'per month',
      'data-period': 'monthly',
      effect: { uppercase: false, italic: true, opacity: 0.5 },
    },
    priceDetailEffect: { opacity: 0.9 },
  });

  const element = priceDetail();

  expect(element.classList.contains('billing-period')).toBe(true);
  expect(element.getAttribute('aria-label')).toBe('per month');
  expect(element.getAttribute('data-period')).toBe('monthly');
  expect(getComputedStyle(element).fontSize).toBe('15px');
  expect(getComputedStyle(element).fontStyle).toBe('italic');
  expect(getComputedStyle(element).textTransform).not.toBe('uppercase');
  // priceDetailEffect wins where both set the same key.
  expect(getComputedStyle(element).opacity).toBe('0.9');
});
