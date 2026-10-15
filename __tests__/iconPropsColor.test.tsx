/**
 * A component that draws an icon faded (an input's and a tag's at `CONTROL_ICON_OPACITY`, a panel's title icon)
 * picks the icon's color and opacity together, so that it stands out by 3:1 at that opacity (qorus#646). A color
 * given in the icon's own props (`leftIconProps={{ intent }}`, `iconProps={{ color }}`) was spread over that pick:
 * the icon made it readable at full opacity, and drawn faded it fell short (2.2:1, the IDE's contrast gate). It is
 * now picked like the component's own icon color.
 */
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { ReqoreInput, ReqorePanel, ReqoreTag, ReqoreUIProvider } from '../src';
import { splitIconColor } from '../src/helpers/iconProps';

/* the color the glyph is drawn in (react-icons sets it on the svg) and the opacity the icon is drawn at */
const lookOf = (el: Element | null) => {
  expect(el, 'no icon').toBeTruthy();

  return {
    color: ((el as HTMLElement).querySelector('svg') as SVGElement).style.color,
    opacity: getComputedStyle(el as HTMLElement).opacity,
  };
};

const iconIn = (testId: string, selector: string) =>
  document.querySelector(`[data-testid='${testId}'] ${selector}`) ??
  document.querySelector(`[data-testid='${testId}']${selector}`);

const renderBoth = (byComponent: ReactElement, byProps: ReactElement) =>
  render(
    <ReqoreUIProvider>
      {byComponent}
      {byProps}
    </ReqoreUIProvider>
  );

describe('splitIconColor', () => {
  test("takes an intent or a color out of an icon's props, and leaves the rest", () => {
    expect(splitIconColor({ intent: 'warning', size: 'small' })).toEqual([
      'warning',
      { size: 'small' },
    ]);
    expect(splitIconColor({ color: 'danger:lighten:2' })).toEqual(['danger:lighten:2', {}]);
    // the intent wins, as the icon itself lets it
    expect(splitIconColor({ intent: 'info', color: 'danger' })[0]).toBe('info');
  });

  test('leaves props without a color of their own as they are', () => {
    const props = { size: 'small' as const };

    expect(splitIconColor(props)).toEqual([undefined, props]);
    expect(splitIconColor(undefined)).toEqual([undefined, undefined]);
  });
});

describe("an icon colored through its props is drawn like one colored by the component's own prop", () => {
  for (const [name, iconProps] of [
    ['an intent', { intent: 'warning' }],
    ['a color named by the theme', { color: 'danger' }],
  ] as const) {
    const color = 'intent' in iconProps ? iconProps.intent : iconProps.color;

    test(`an input's left and right icon: ${name}`, () => {
      renderBoth(
        <div data-testid='own'>
          <ReqoreInput
            icon='SearchLine'
            iconColor={color}
            rightIcon='SearchLine'
            rightIconColor={color}
            value=''
          />
        </div>,
        <div data-testid='props'>
          <ReqoreInput
            icon='SearchLine'
            leftIconProps={iconProps}
            rightIcon='SearchLine'
            rightIconProps={iconProps}
            value=''
          />
        </div>
      );

      const own = document.querySelectorAll("[data-testid='own'] .reqore-icon");
      const props = document.querySelectorAll("[data-testid='props'] .reqore-icon");

      expect(lookOf(own[0]).color).not.toBe('');
      expect(lookOf(props[0])).toEqual(lookOf(own[0]));
      expect(lookOf(props[1])).toEqual(lookOf(own[1]));
    });

    test(`a tag's icon: ${name}`, () => {
      renderBoth(
        <ReqoreTag data-testid='own' icon='AlertLine' leftIconColor={color} label='Tag' />,
        <ReqoreTag data-testid='props' icon='AlertLine' leftIconProps={iconProps} label='Tag' />
      );

      const own = lookOf(iconIn('own', '.reqore-icon'));

      expect(own.color).not.toBe('');
      expect(lookOf(iconIn('props', '.reqore-icon'))).toEqual(own);
    });

    test(`a panel's title icon: ${name}`, () => {
      renderBoth(
        <ReqorePanel data-testid='own' label='Panel' icon='AlertLine' iconColor={color}>
          Content
        </ReqorePanel>,
        <ReqorePanel data-testid='props' label='Panel' icon='AlertLine' iconProps={iconProps}>
          Content
        </ReqorePanel>
      );

      const own = lookOf(iconIn('own', '.reqore-panel-title-icon'));

      expect(own.color).not.toBe('');
      expect(lookOf(iconIn('props', '.reqore-panel-title-icon'))).toEqual(own);
    });
  }
});
