import { render } from '@testing-library/react';
import {
  getControlTextSize,
  getTagTextSize,
  getTextSize,
  ReqoreButton,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreP,
  ReqoreTable,
  ReqoreTag,
  ReqoreUIProvider,
} from '../src';
import {
  CONTROL_TEXT_FROM_SIZE,
  SIZES,
  TAG_TEXT_FROM_SIZE,
  TEXT_FROM_SIZE,
} from '../src/constants/sizes';
import { IReqoreTheme, IReqoreTypeScale } from '../src/constants/theme';

const CALM: IReqoreTypeScale = {
  text: { micro: 10, tiny: 12, small: 13, normal: 14, big: 16, huge: 20, massive: 28 },
  control: { micro: 10, tiny: 11, small: 12, normal: 13, big: 15, huge: 18, massive: 21 },
  tag: { micro: 10, tiny: 11, small: 12, normal: 13, big: 15, huge: 18, massive: 21 },
  lineHeight: 1.45,
};

/** Only the sizes the specimen renders at, so the rest fall back to Reqore's tables. */
const PARTIAL: IReqoreTypeScale = {
  text: { small: 13 },
  control: { small: 11 },
  tag: { tiny: 11 },
};

const renderSpecimen = (theme?: Partial<IReqoreTheme>) =>
  render(
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreP size='small' className='specimen-paragraph'>
            Text
          </ReqoreP>
          <ReqoreButton size='small' className='specimen-button'>
            Save
          </ReqoreButton>
          <ReqoreTag size='tiny' label='Tag' className='specimen-tag' />
          <ReqoreTable
            size='small'
            className='specimen-table'
            columns={[{ dataId: 'name', header: { label: 'Name' } }]}
            data={[{ name: 'Order #48213' }]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const fontSizeOf = (selector: string) => {
  const element = document.querySelector(selector) as HTMLElement;

  expect([selector, !!element]).toEqual([selector, true]);

  return getComputedStyle(element).fontSize;
};

const wrapper = () => document.querySelector('.reqore-layout-wrapper') as HTMLElement;

describe('theme.typeScale', () => {
  test('without a type scale, every size is Reqore’s own', () => {
    renderSpecimen();

    expect(fontSizeOf('.specimen-paragraph')).toBe(`${TEXT_FROM_SIZE.small}px`);
    expect(fontSizeOf('.specimen-button')).toBe(`${CONTROL_TEXT_FROM_SIZE.small}px`);
    expect(fontSizeOf('.specimen-tag')).toBe(`${TAG_TEXT_FROM_SIZE.tiny}px`);
    expect(fontSizeOf('.specimen-table .reqore-table-cell')).toBe(`${TEXT_FROM_SIZE.small}px`);
  });

  test('with a type scale, each component renders at the theme’s px', () => {
    renderSpecimen({ typeScale: CALM });

    expect(fontSizeOf('.specimen-paragraph')).toBe('13px');
    expect(fontSizeOf('.specimen-button')).toBe('12px');
    expect(fontSizeOf('.specimen-tag')).toBe('11px');
    expect(fontSizeOf('.specimen-table .reqore-table-cell')).toBe('13px');
  });

  test('a size the scale leaves out keeps Reqore’s own px', () => {
    renderSpecimen({ typeScale: { text: { big: 30 }, control: { big: 30 }, tag: { big: 30 } } });

    expect(fontSizeOf('.specimen-paragraph')).toBe(`${TEXT_FROM_SIZE.small}px`);
    expect(fontSizeOf('.specimen-button')).toBe(`${CONTROL_TEXT_FROM_SIZE.small}px`);
    expect(fontSizeOf('.specimen-tag')).toBe(`${TAG_TEXT_FROM_SIZE.tiny}px`);
  });

  test('a partial scale changes only the sizes it names', () => {
    renderSpecimen({ typeScale: PARTIAL });

    expect(fontSizeOf('.specimen-paragraph')).toBe('13px');
    expect(fontSizeOf('.specimen-button')).toBe('11px');
    expect(fontSizeOf('.specimen-tag')).toBe('11px');
  });

  test('the line height is set on the wrapper only when the scale names one', () => {
    renderSpecimen();
    expect(['', 'normal']).toContain(getComputedStyle(wrapper()).lineHeight);
    expect(['', 'normal']).toContain(
      getComputedStyle(document.getElementById('reqore-portal')).lineHeight
    );
  });

  test('the theme’s line height is set on the wrapper and the portal', () => {
    renderSpecimen({ typeScale: CALM });

    expect(getComputedStyle(wrapper()).lineHeight).toBe('1.45');
    expect(getComputedStyle(document.getElementById('reqore-portal')).lineHeight).toBe('1.45');
  });

  test('a scale without a line height leaves the wrapper’s alone', () => {
    renderSpecimen({ typeScale: PARTIAL });

    expect(['', 'normal']).toContain(getComputedStyle(wrapper()).lineHeight);
  });
});

describe('type scale helpers', () => {
  test('fall back to the constants without a theme or a scale', () => {
    SIZES.forEach((size) => {
      expect(getTextSize(undefined, size)).toBe(TEXT_FROM_SIZE[size]);
      expect(getControlTextSize({}, size)).toBe(CONTROL_TEXT_FROM_SIZE[size]);
      expect(getTagTextSize({ typeScale: {} }, size)).toBe(TAG_TEXT_FROM_SIZE[size]);
    });
  });

  test('read the theme’s px for the sizes it names', () => {
    const theme = { typeScale: CALM };

    SIZES.forEach((size) => {
      expect(getTextSize(theme, size)).toBe(CALM.text[size]);
      expect(getControlTextSize(theme, size)).toBe(CALM.control[size]);
      expect(getTagTextSize(theme, size)).toBe(CALM.tag[size]);
    });
  });
});
