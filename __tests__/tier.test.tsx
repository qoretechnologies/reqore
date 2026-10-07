import { fireEvent, render } from '@testing-library/react';
import { getContrast } from 'polished';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTier, ReqoreUIProvider } from '../src';
import { getTierColors, IReqoreTierProps } from '../src/components/Tier';
import { DEFAULT_INTENTS, DEFAULT_THEME, IReqoreTheme } from '../src/constants/theme';

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

/* ------------------------------------------------------------------------------------------------
 * appearance="modern"
 * ---------------------------------------------------------------------------------------------- */

const modernPart = (name: string) => document.querySelector(`.reqore-tier-${name}`) as HTMLElement;

const renderModernTier = (props: Partial<IReqoreTierProps>) =>
  renderTier({
    appearance: 'modern',
    description: 'For teams in production.',
    featureList: [{ content: '50,000 runs a month' }, { content: 'Email support' }],
    actionLabel: 'Start a trial',
    ...props,
  });

test('The classic appearance stays the default: the price is a heading, the period upper case', () => {
  renderTier({});

  const price = document.querySelector('.reqore-tier .reqore-heading') as HTMLElement;

  expect(document.querySelector('.reqore-tier-modern')).toBeNull();
  expect(price.textContent).toBe('$49');
  expect(price.tagName).toMatch(/^H[1-6]$/);
  expect(getComputedStyle(priceDetail()).textTransform).toBe('uppercase');
});

test('A modern tier names its plan with a heading (h3 by default) and never makes the price one', () => {
  renderModernTier({});

  expect(document.querySelector('.reqore-tier.reqore-tier-modern')).toBeTruthy();
  expect(document.querySelector('h3.reqore-tier-name')!.textContent).toBe('Pro');
  expect(document.querySelector('h1')).toBeNull();
  expect(modernPart('price').tagName).toBe('P');
  expect(modernPart('price-value').textContent).toBe('$49');
});

test("labelSize sets the heading level of a modern tier's name", () => {
  renderModernTier({ labelSize: 2 });

  expect(document.querySelector('h2.reqore-tier-name')!.textContent).toBe('Pro');
  expect(document.querySelector('h3')).toBeNull();
});

test('A modern tier writes the period in the price paragraph, as written and at the text size', () => {
  renderModernTier({});

  expect(priceDetail().parentElement).toBe(modernPart('price'));
  expect(priceDetail().textContent).toBe('/ month');
  expect(getComputedStyle(priceDetail()).textTransform).not.toBe('uppercase');
  expect(getComputedStyle(priceDetail()).fontSize).toBe('15px');
});

test("priceDetailEffect and priceDetailProps still reach a modern tier's period", () => {
  renderModernTier({
    priceDetailProps: { size: 'small', className: 'billing-period', 'data-period': 'monthly' },
    priceDetailEffect: { uppercase: true, italic: true },
  });

  expect(priceDetail().classList.contains('billing-period')).toBe(true);
  expect(priceDetail().getAttribute('data-period')).toBe('monthly');
  expect(getComputedStyle(priceDetail()).fontSize).toBe('12px');
  expect(getComputedStyle(priceDetail()).textTransform).toBe('uppercase');
  expect(getComputedStyle(priceDetail()).fontStyle).toBe('italic');
});

test('A modern tier on sale shows the sale price and strikes the original through', () => {
  renderModernTier({ price: 29, salePrice: 19 });

  expect(modernPart('price-value').textContent).toBe('$19');
  expect(modernPart('price-original').tagName).toBe('DEL');
  expect(modernPart('price-original').textContent).toBe('$29');
});

test('A modern tier writes the currency after the price, and none on a word', () => {
  const { unmount } = renderModernTier({ price: 99, currency: ' Kč', currencyPosition: 'after' });

  expect(modernPart('price-value').textContent).toBe('99 Kč');
  unmount();

  renderModernTier({ price: 'Custom' });
  expect(modernPart('price-value').textContent).toBe('Custom');
});

test('A modern tier lists its features, one icon per feature, and its button comes last', () => {
  renderModernTier({
    featureList: [
      { content: 'Unlimited runs' },
      { content: 'Single sign-on', rightIcon: 'InformationLine' },
    ],
  });

  const features = Array.from(document.querySelectorAll('.reqore-tier-feature'));

  expect(modernPart('features').tagName).toBe('UL');
  expect(features.map((feature) => feature.tagName)).toEqual(['LI', 'LI']);
  expect(features[0].querySelectorAll('.reqore-icon')).toHaveLength(1);
  expect(features[1].querySelectorAll('.reqore-icon')).toHaveLength(2);
  expect(modernPart('body').lastElementChild).toBe(modernPart('action'));
  expect(modernPart('action').textContent).toContain('Start a trial');
});

test('A modern tier without a feature list or a description renders neither', () => {
  renderModernTier({ featureList: undefined, description: undefined });

  expect(modernPart('features')).toBeNull();
  expect(modernPart('description')).toBeNull();
  expect(modernPart('action')).toBeTruthy();
});

test('An active modern tier says so on a read-only button', () => {
  renderModernTier({ active: true, activeActionLabel: 'Your plan' });

  const button = modernPart('action').querySelector('.reqore-button') as HTMLButtonElement;

  expect(button.textContent).toContain('Your plan');
  expect(button.querySelector('.reqore-icon')).toBeTruthy();
});

test("actionButtonProps reach a modern tier's button", () => {
  const onClick = vi.fn();

  renderModernTier({ actionButtonProps: { label: 'Talk to sales', onClick } });

  const button = modernPart('action').querySelector('.reqore-button') as HTMLButtonElement;

  expect(button.textContent).toContain('Talk to sales');
  fireEvent.click(button);
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('A highlighted modern tier is marked by its badge and a filled button, and is not scaled', () => {
  renderModernTier({ highlight: true, badge: 'Most popular' });

  const tier = document.querySelector('.reqore-tier-highlighted') as HTMLElement;

  expect(tier).toBeTruthy();
  expect(tier.style.transform).toBe('');
  expect(tier.querySelector('.reqore-tier-name-row .reqore-tag')!.textContent).toContain(
    'Most popular'
  );
});

test("labelEffect styles a modern tier's name and descriptionEffect its description", () => {
  renderModernTier({ labelEffect: { italic: true }, descriptionEffect: { color: '#ff0000' } });

  expect(getComputedStyle(modernPart('name')).fontStyle).toBe('italic');
  expect(getComputedStyle(modernPart('description')).color).toBe('rgb(255, 0, 0)');
});

test("A modern tier's muted text keeps a 4.5:1 contrast on dark and light themes", () => {
  for (const main of ['#333333', '#121212', '#f4f4f4', '#ffffff'] as const) {
    const theme = { ...DEFAULT_THEME, main, intents: DEFAULT_INTENTS };

    for (const accent of [undefined, 'info', 'success'] as const) {
      const colors = getTierColors(theme as IReqoreTheme, accent);

      expect(getContrast(colors.muted, colors.surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrast(colors.text, colors.surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrast(colors.sale, colors.surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrast(colors.check, colors.surface)).toBeGreaterThanOrEqual(3);
    }
  }
});
