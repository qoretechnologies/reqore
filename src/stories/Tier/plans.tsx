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
 * How many cards a grid of `auto-fit` columns puts on a line `width` px wide, each column at least
 * `minimum` px (`min(minimum, 100%)`, as `ReqoreColumns` and `ReqoreTierGroup` size theirs) with
 * `gap` px between them: as many as fit, never more than there are, and at least one.
 */
const cardsPerLine = (width: number, minimum: number, gap: number, count: number) =>
  Math.max(1, Math.min(count, Math.floor((width + gap) / (minimum + gap))));

/** `tiers` by the line of the grid they are on, top to bottom. */
const linesOf = (tiers: HTMLElement[]) =>
  tiers.reduce<HTMLElement[][]>((lines, tier) => {
    const top = tier.getBoundingClientRect().top;
    const line = lines.find((found) => Math.abs(found[0].getBoundingClientRect().top - top) <= 1);

    if (line) {
      line.push(tier);
    } else {
      lines.push([tier]);
    }

    return lines;
  }, []);

/**
 * What every row of modern tiers promises: the tiers on as many lines as their grid's width gives
 * them (one row where they all fit, one under another on a phone), on each line one height and
 * the buttons on one line at the bottom, the period on the price's line and as written, the name
 * a heading and the price not one, no tier scaled, and the muted lines readable (4.5:1) on a plain
 * tier's surface.
 *
 * `grid` is the element that lays the tiers out, and `minColumnWidth` the narrowest it makes a
 * column: the line count is the grid's own rule, read off its width and gap, so the play holds at
 * whatever width the story is opened at.
 */
export const expectModernRow = async (
  root: HTMLElement,
  count: number,
  { grid: gridSelector, minColumnWidth }: { grid: string; minColumnWidth: string }
) => {
  const tiers = await waitFor(() => {
    const found = modernTiers(root);

    expect(found).toHaveLength(count);

    return found;
  });

  const grid = root.querySelector(gridSelector) as HTMLElement;
  const gridStyle = getComputedStyle(grid);
  const width =
    grid.clientWidth -
    (parseFloat(gridStyle.paddingLeft) || 0) -
    (parseFloat(gridStyle.paddingRight) || 0);
  const perLine = cardsPerLine(
    width,
    parseFloat(minColumnWidth),
    parseFloat(gridStyle.columnGap) || 0,
    count
  );
  const lines = linesOf(tiers);

  await expect(lines.map((line) => line.length)).toEqual(
    Array.from({ length: Math.ceil(count / perLine) }, (_, index) =>
      Math.min(perLine, count - index * perLine)
    )
  );

  for (const line of lines) {
    const heights = line.map((tier) => tier.getBoundingClientRect().height);
    const bottoms = line.map(
      (tier) =>
        (
          tier.querySelector('.reqore-tier-action .reqore-button') as HTMLElement
        ).getBoundingClientRect().bottom
    );

    await expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    await expect(Math.max(...bottoms) - Math.min(...bottoms)).toBeLessThanOrEqual(1);
  }

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
