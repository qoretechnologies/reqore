import { expect, waitFor } from 'storybook/test';
import { IReqoreTierProps } from '../../components/Tier';

/*
 * Plans shared by the Tier and Tier Group stories: a free plan, a highlighted one, a team plan
 * and an enterprise plan whose price is a word. Realistic enough that a reviewer judges the
 * layout on content shaped like a real pricing page's.
 */

export const STARTER: IReqoreTierProps = {
  name: 'Starter',
  price: 0,
  currency: '$',
  priceDetail: '/ month',
  description: 'For one person trying out automation.',
  actionLabel: 'Start for free',
  featureList: [
    { content: '1 workspace' },
    { content: '1,000 runs a month' },
    { content: '7 days of run history' },
    { content: 'Community support' },
  ],
};

export const PRO: IReqoreTierProps = {
  name: 'Pro',
  price: 49,
  currency: '$',
  priceDetail: '/ month',
  description: 'For teams running their integrations in production.',
  highlight: true,
  badge: 'Most popular',
  actionLabel: 'Start a 14-day trial',
  featureList: [
    { content: 'Everything in Starter', icon: 'CheckDoubleLine', effect: { weight: 'thick' } },
    { content: '50,000 runs a month' },
    { content: '200+ connectors' },
    { content: '30 days of run history' },
    { content: 'Email support on business days' },
  ],
};

export const TEAM: IReqoreTierProps = {
  name: 'Team',
  price: 199,
  currency: '$',
  priceDetail: '/ month, billed yearly',
  description: 'For departments that share automations, roles and an audit log.',
  actionLabel: 'Start a 14-day trial',
  featureList: [
    { content: 'Everything in Pro', icon: 'CheckDoubleLine', effect: { weight: 'thick' } },
    { content: '250,000 runs a month' },
    { content: 'Roles and an audit log' },
    { content: '90 days of run history' },
    { content: 'Priority support' },
  ],
};

export const ENTERPRISE: IReqoreTierProps = {
  name: 'Enterprise',
  price: 'Custom',
  currency: '$',
  description: 'For regulated industries running at scale.',
  actionLabel: 'Talk to sales',
  featureList: [
    { content: 'Unlimited runs' },
    { content: 'Single sign-on and SCIM' },
    { content: 'Self-hosted or in our cloud' },
    { content: '99.9% uptime SLA' },
    { content: 'A dedicated engineer' },
  ],
};

export const THREE_PLANS = [STARTER, PRO, ENTERPRISE];
export const FOUR_PLANS = [STARTER, PRO, TEAM, ENTERPRISE];

/** A phone 360px wide: the Storybook viewport the play runs at AND the one Qlip captures at. */
export const phoneParameters = (height = 900) => ({
  viewport: {
    options: {
      phone360: {
        name: 'Phone (360px)',
        styles: { width: '360px', height: `${height}px` },
        type: 'mobile',
      },
    },
    defaultViewport: 'phone360',
  },
  qlip: { viewport: { width: 360, height } },
});

/* ------------------------------------------------------------------------------------------------
 * Play helpers
 * ---------------------------------------------------------------------------------------------- */

export const modernTiers = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('.reqore-tier-modern')) as HTMLElement[];

const channels = (color: string) => (color.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

const luminance = (color: string) => {
  const [r, g, b] = channels(color).map((value) => {
    const c = value / 255;

    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** The WCAG contrast ratio of two computed `rgb()` colours. */
export const contrastRatio = (foreground: string, background: string) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * What every row of modern tiers promises: one height, the buttons on one line at the bottom,
 * the period on the price's line and as written, the name a heading and the price not one, no
 * tier scaled, and the muted lines readable (4.5:1) on a plain tier's surface.
 */
export const expectModernRow = async (root: HTMLElement, count: number) => {
  const tiers = await waitFor(() => {
    const found = modernTiers(root);

    expect(found).toHaveLength(count);

    return found;
  });

  const heights = tiers.map((tier) => tier.getBoundingClientRect().height);
  const buttons = tiers.map(
    (tier) => tier.querySelector('.reqore-tier-action .reqore-button') as HTMLElement
  );
  const bottoms = buttons.map((button) => button.getBoundingClientRect().bottom);

  await expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
  await expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(1);

  for (const tier of tiers) {
    await expect(tier.querySelector('h3.reqore-tier-name')).toBeTruthy();
    await expect(tier.querySelector('h1')).toBeNull();
    await expect(getComputedStyle(tier).transform).toBe('none');

    const value = tier.querySelector('.reqore-tier-price-value') as HTMLElement;
    const detail = tier.querySelector('.reqore-tier-price-detail') as HTMLElement | null;

    if (detail) {
      const valueBox = value.getBoundingClientRect();
      const detailBox = detail.getBoundingClientRect();

      await expect(getComputedStyle(detail).textTransform).toBe('none');

      // Right after the price: on its line, to its right — or, when there is no room for it,
      // at the start of the next line.
      const onTheLine =
        detailBox.left >= valueBox.right - 1 && detailBox.bottom <= valueBox.bottom + 1;
      const wrapped =
        Math.abs(detailBox.left - valueBox.left) <= 1 && detailBox.top >= valueBox.bottom - 4;

      await expect(onTheLine || wrapped).toBe(true);
    }

    if (!tier.classList.contains('reqore-tier-highlighted')) {
      const surface = getComputedStyle(tier).backgroundColor;
      const description = tier.querySelector('.reqore-tier-description') as HTMLElement;

      await expect(
        contrastRatio(getComputedStyle(description).color, surface)
      ).toBeGreaterThanOrEqual(4.5);

      if (detail) {
        await expect(contrastRatio(getComputedStyle(detail).color, surface)).toBeGreaterThanOrEqual(
          4.5
        );
      }
    }
  }
};

/** Nothing on the page is wider than the screen. */
export const expectNoHorizontalOverflow = async () => {
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
};
