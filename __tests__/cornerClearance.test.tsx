// Copyright 2026 Qore Technologies, s.r.o.
/**
 * Two things a reader saw cut or crowded in the calm redesign:
 *
 * - A title inside its panel's corner (Filip, admin portal Qlip build #44: "I feel like the panel
 *   label is too close to the border radius?"). A title bar was padded by its size's step (6px for
 *   a small panel) while the corner was the theme's 14px, so the title started 7px in, under the
 *   curve. A container's label now starts at least its corner's radius in (`clearCorner`).
 * - A confirmation's warning cut mid-sentence (the IDE's order Retry: "If ReleaseSupplierPayment
 *   had already done part of its…"). A modal's description was clamped to a panel's two lines; a
 *   dialog's message is now shown whole, and scrolls in its own box only past half the screen.
 */
import { render, screen } from '@testing-library/react';
import { noop } from 'lodash';
import React from 'react';
import { describe, expect, test } from 'vitest';
import {
  ReqoreAccordion,
  ReqoreCallout,
  ReqoreContent,
  ReqoreDrawer,
  ReqoreLayoutContent,
  ReqorePanel,
  ReqoreStatistic,
  ReqoreUIProvider,
  useReqoreProperty,
} from '../src';
import { clearCorner, PADDING_FROM_SIZE } from '../src/constants/sizes';
import { IReqoreTheme } from '../src/constants/theme';

const CALM: Partial<IReqoreTheme> = { panel: { radius: 14 } };

const Wrapper = ({
  theme,
  children,
}: {
  theme?: Partial<IReqoreTheme>;
  children: React.ReactNode;
}) => (
  <ReqoreUIProvider theme={theme}>
    <ReqoreLayoutContent>
      <ReqoreContent>{children}</ReqoreContent>
    </ReqoreLayoutContent>
  </ReqoreUIProvider>
);

const style = (selector: string) => getComputedStyle(document.querySelector(selector)!);

describe('clearCorner', () => {
  test('a padding past the corner is kept, one inside it grows to the corner', () => {
    expect(clearCorner(24, 14, 1)).toBe(24);
    expect(clearCorner(6, 14, 1)).toBe(13);
    expect(clearCorner(6, 14)).toBe(14);
    expect(clearCorner(6, 0)).toBe(6);
  });
});

describe("a container's label clears its corner", () => {
  test("a small panel's title bar and bottom actions start past a 14px corner", () => {
    render(
      <Wrapper theme={CALM}>
        <ReqorePanel size='small' label='Weekly revenue' bottomActions={[{ label: 'Open' }]}>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    // Inside the 1px border: 13px of padding puts the title 14px from the panel's edge.
    expect(style('.reqore-panel-title').paddingLeft).toBe('13px');
    expect(style('.reqore-panel-title').paddingRight).toBe('13px');
    expect(style('.reqore-panel-bottom-actions').paddingLeft).toBe('13px');
    // The vertical padding is still the size's.
    expect(style('.reqore-panel-title').paddingTop).toBe(`${PADDING_FROM_SIZE.small}px`);
  });

  test('a flat panel, with no border, pads its title the whole radius', () => {
    render(
      <Wrapper theme={CALM}>
        <ReqorePanel size='small' flat label='Weekly revenue'>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    expect(style('.reqore-panel-title').paddingLeft).toBe('14px');
  });

  test('a radiusSize corner is cleared as the theme one is', () => {
    render(
      <Wrapper>
        <ReqorePanel size='normal' radiusSize='huge' label='Weekly revenue'>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    expect(style('.reqore-panel-title').paddingLeft).toBe('25px');
  });

  test("a panel whose padding already clears its corner keeps it, as does one that isn't rounded", () => {
    render(
      <Wrapper>
        <ReqorePanel size='normal' label='Default corner'>
          Body
        </ReqorePanel>
        <ReqorePanel size='small' rounded={false} radiusSize='huge' label='Square'>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    const [rounded, square] = Array.from(document.querySelectorAll('.reqore-panel-title'));
    expect(getComputedStyle(rounded).paddingLeft).toBe(`${PADDING_FROM_SIZE.normal}px`);
    expect(getComputedStyle(square).paddingLeft).toBe(`${PADDING_FROM_SIZE.small}px`);
  });

  test('a panel with no surface and no edge draws no corner, and keeps its title flush', () => {
    render(
      <Wrapper theme={CALM}>
        <ReqorePanel size='small' flat transparent label='Bare'>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    expect(style('.reqore-panel-title').paddingLeft).toBe('0px');
  });

  test('padded={false} still leaves the content flush', () => {
    render(
      <Wrapper theme={CALM}>
        <ReqorePanel size='small' padded={false} label='Photo'>
          Body
        </ReqorePanel>
      </Wrapper>
    );

    expect(parseFloat(style('.reqore-panel-content').paddingLeft) || 0).toBe(0);
    expect(style('.reqore-panel-title').paddingLeft).toBe('13px');
  });

  test("an accordion's headers start past its corner", () => {
    render(
      <Wrapper theme={CALM}>
        <ReqoreAccordion
          size='small'
          items={[
            { label: 'First', content: 'One' },
            { label: 'Second', content: 'Two' },
          ]}
        />
      </Wrapper>
    );

    const headers = Array.from(document.querySelectorAll('.reqore-accordion-header'));
    expect(headers).toHaveLength(2);
    // Every header alike, so the ones between the corners line up with the first and the last.
    headers.forEach((header) => expect(getComputedStyle(header).paddingLeft).toBe('13px'));
  });

  test("a callout's padded sides start past its corner, and 'vertical' keeps them flush", () => {
    render(
      <Wrapper theme={CALM}>
        <ReqoreCallout size='micro' label='Micro' accentPosition='top' />
        <ReqoreCallout size='micro' label='Vertical only' padded='vertical' accentPosition='top' />
      </Wrapper>
    );

    const [padded, vertical] = Array.from(document.querySelectorAll('.reqore-callout'));
    expect(getComputedStyle(padded).paddingLeft).toBe('13px');
    expect(getComputedStyle(padded).paddingRight).toBe('13px');
    expect(getComputedStyle(vertical).paddingLeft).toBe('0px');
  });

  test("a statistic's padded sides clear a radiusSize far above its padding", () => {
    render(
      <Wrapper>
        <ReqoreStatistic
          rounded
          flat={false}
          size='small'
          radiusSize='massive'
          paddingSize='micro'
          label='Orders'
          value={12}
        />
      </Wrapper>
    );

    // The massive corner is 36px, less the 1px border; the micro padding (3 × 5) was 15px.
    expect(style('.reqore-statistic').paddingLeft).toBe('35px');
  });
});

const LONG =
  'If ReleaseSupplierPayment had already done part of its work before it failed, such as ' +
  'sending a payment or creating a shipment, that part may happen again.';

const AsksToRetry = () => {
  const confirmAction = useReqoreProperty('confirmAction');
  React.useEffect(() => {
    confirmAction({ title: 'Retry this order?', description: LONG, onConfirm: noop });
  }, [confirmAction]);
  return null;
};

describe('a modal shows its whole description', () => {
  test('a confirmation is not clamped, and scrolls in its own box only past half the screen', () => {
    render(
      <Wrapper>
        <AsksToRetry />
      </Wrapper>
    );

    const description = screen.getByText(LONG);
    expect(description).toHaveClass('reqore-panel-title-description');
    const shown = getComputedStyle(description);
    expect(shown.webkitLineClamp || 'none').toBe('none');
    expect(shown.maxHeight).toBe('50vh');
    expect(shown.overflowY).toBe('auto');
    // Not clamped, so it is not a "tap to read the rest" control either.
    expect(description).not.toHaveAttribute('role', 'button');
  });

  test("a drawer's description keeps a panel's clamp of two lines", () => {
    render(
      <Wrapper>
        <ReqoreDrawer isOpen label='Order' description={LONG}>
          Body
        </ReqoreDrawer>
      </Wrapper>
    );

    const shown = getComputedStyle(screen.getByText(LONG));
    expect(shown.webkitLineClamp).toBe('2');
    expect(shown.maxHeight).not.toBe('50vh');
  });
});
