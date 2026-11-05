// Copyright 2026 Qore Technologies, s.r.o.
/**
 * What a caller says explicitly is the caller's (the review of #708).
 *
 * The contrast pass gave faded text and an idle rail a floor: drawn no fainter than it can still be read.
 * That is for Reqore's own defaults. An opacity the caller gives - a description's, a label's, the
 * metadata's, an idle rail's - was raised until it read too, so a deliberate 0.2 came out at 0.65. And a
 * component that says it is disabled (`aria-disabled`) dropped an `aria-disabled` its caller gave it while
 * it was not.
 */
import { render } from '@testing-library/react';
import {
  ReqoreCallout,
  ReqoreContent,
  ReqoreEntityRow,
  ReqoreFeatureCard,
  ReqoreLayoutContent,
  ReqoreNavRail,
  ReqorePanel,
  ReqoreStatistic,
  ReqoreTestimonial,
  ReqoreUIProvider,
} from '../src';
import { IReqoreNavRailItem } from '../src/components/NavRail';

const opacityOf = (selector: string) =>
  Number(getComputedStyle(document.querySelector(selector) as HTMLElement).opacity);

/** The alpha of a computed `rgb()` / `rgba()` color. */
const alphaOf = (selector: string) =>
  Number(
    (
      getComputedStyle(document.querySelector(selector) as HTMLElement).color.match(
        /[\d.]+/g
      ) as string[]
    )[3] ?? 1
  );

describe('an explicit opacity is drawn as given', () => {
  test("a panel's, a callout's and a statistic's", () => {
    render(
      <ReqoreUIProvider>
        <ReqorePanel label='Panel' description='Panel text' descriptionEffect={{ opacity: 0.2 }}>
          content
        </ReqorePanel>
        <ReqoreCallout label='Callout' description='Callout text' descriptionEffect={{ opacity: 0.2 }} />
        <ReqoreStatistic value={12} label='Runs' labelEffect={{ opacity: 0.2 }} />
      </ReqoreUIProvider>
    );

    expect(opacityOf('.reqore-panel-title-description')).toBe(0.2);
    expect(opacityOf('.reqore-callout-description')).toBe(0.2);
    expect(opacityOf('.reqore-statistic-label')).toBe(0.2);
  });

  test("an entity row's description and metadata: their text, faded as given", () => {
    render(
      <ReqoreUIProvider>
        <ReqoreEntityRow
          label='Row'
          description='Row text'
          metadata='Row metadata'
          descriptionEffect={{ opacity: 0.2 }}
          metadataEffect={{ opacity: 0.15 }}
        />
      </ReqoreUIProvider>
    );

    expect(alphaOf('.reqore-entity-row-description')).toBeCloseTo(0.2, 2);
    expect(alphaOf('.reqore-entity-row-metadata')).toBeCloseTo(0.15, 2);
  });

  test('a default is faded only as far as the color it is drawn in still reads', () => {
    // a grey that does not read on the dark card even at full strength: not faded at all
    render(
      <ReqoreUIProvider>
        <ReqoreCallout label='Callout' description='Callout text' descriptionEffect={{ color: '#666666' }} />
        <ReqoreFeatureCard label='Card' description='Card text' descriptionEffect={{ color: '#666666' }} />
      </ReqoreUIProvider>
    );

    expect(opacityOf('.reqore-callout-description')).toBe(1);
    expect(opacityOf('.reqore-feature-card-description')).toBe(1);
  });
});

describe('an idle rail', () => {
  const ITEMS: IReqoreNavRailItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'DashboardLine' },
    { id: 'settings', label: 'Settings', icon: 'Settings3Line' },
  ];

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  const renderRail = (idleOpacity?: number) =>
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreNavRail items={ITEMS} idleReveal idleOpacity={idleOpacity} defaultActiveId='dashboard' />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

  test('rests at the idle opacity it is given', () => {
    renderRail(0.2);

    expect(opacityOf('.reqore-nav-rail')).toBe(0.2);
  });

  test('rests at the default no fainter than its icons read', () => {
    renderRail();

    expect(opacityOf('.reqore-nav-rail')).toBeGreaterThan(0.34);
    expect(opacityOf('.reqore-nav-rail')).toBeLessThan(1);
  });
});

describe('aria-disabled', () => {
  test('a component that is not disabled keeps the one its caller gives', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePanel className='panel' aria-disabled='true'>
          content
        </ReqorePanel>
        <ReqoreCallout className='callout' aria-disabled='true' label='Callout' />
        <ReqoreStatistic className='statistic' aria-disabled='true' value={1} />
        <ReqoreTestimonial className='testimonial' aria-disabled='true' quote='Quote' />
        <ReqoreEntityRow className='row' aria-disabled='true' label='Row' />
      </ReqoreUIProvider>
    );

    for (const selector of ['.panel', '.callout', '.statistic', '.testimonial', '.row']) {
      expect(document.querySelector(selector)?.getAttribute('aria-disabled')).toBe('true');
    }
  });

  test('a disabled one says so', () => {
    render(
      <ReqoreUIProvider>
        <ReqorePanel className='panel' disabled aria-disabled='false'>
          content
        </ReqorePanel>
      </ReqoreUIProvider>
    );

    expect(document.querySelector('.panel')?.getAttribute('aria-disabled')).toBe('true');
  });
});
