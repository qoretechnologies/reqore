/**
 * A notification's colours: the content under a title is a shade softer, whatever it is written
 * as, and an icon color of the caller's own is drawn as given when the color helpers cannot read
 * it, and in its readable shade whatever it is written as when they can.
 */
import { render } from '@testing-library/react';
import { parseToRgb } from 'polished';
import { ReqoreNotification, ReqoreTag, ReqoreUIProvider } from '../src';
import { IReqoreNotificationProps } from '../src/components/Notifications/notification';

/**
 * How far an element's text is faded in the notification: its color's alpha, times its opacity and each of its
 * ancestors' up to the notification (whose own is its enter transition's).
 */
const textFade = (element: Element): number => {
  const color = parseToRgb(getComputedStyle(element).color) as { alpha?: number };
  let fade = color.alpha ?? 1;

  for (
    let at: Element | null = element;
    at && !at.classList.contains('reqore-notification');
    at = at.parentElement
  ) {
    fade *= Number(getComputedStyle(at).opacity || 1);
  }

  return fade;
};

const content = () => document.querySelector('.reqore-notification-content')!;

describe('the content under a title', () => {
  test('is a shade softer when it is text written as elements, as it is when it is a string', () => {
    const { unmount } = render(
      <ReqoreUIProvider>
        <ReqoreNotification title='Saved' content='All three files' />
      </ReqoreUIProvider>
    );
    const asString = textFade(content());

    unmount();
    render(
      <ReqoreUIProvider>
        <ReqoreNotification
          title='Saved'
          content={
            <>
              All <b>three</b> files
            </>
          }
        />
      </ReqoreUIProvider>
    );

    expect(asString).toBeLessThan(1);
    expect(textFade(content())).toBeCloseTo(asString, 5);
  });

  test('a tag in it keeps its own colors, unfaded', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreNotification title='Saved' content={<ReqoreTag label='v2' intent='info' />} />
      </ReqoreUIProvider>
    );

    const tag = document.querySelector('.reqore-notification-content .reqore-tag')!;

    expect(textFade(tag)).toBe(1);
  });
});

describe('an icon color of the caller\'s own', () => {
  const glyph = () => document.querySelector('.reqore-notification-icon svg')!;
  const glyphFor = (iconColor: IReqoreNotificationProps['iconColor']) => {
    const { unmount } = render(
      <ReqoreUIProvider>
        <ReqoreNotification title='Saved' intent='success' iconColor={iconColor} />
      </ReqoreUIProvider>
    );
    const color = getComputedStyle(glyph()).color;

    unmount();

    return color;
  };

  test('the color helpers cannot read is drawn as it is given', () => {
    render(
      <ReqoreUIProvider>
        <ReqoreNotification title='Saved' intent='success' iconColor='var(--brand)' />
      </ReqoreUIProvider>
    );

    expect((glyph() as SVGElement).style.color).toBe('var(--brand)');
  });

  test('written as rgb() is drawn as it is written as a hex, not in the intent\'s color', () => {
    const asRgb = glyphFor('rgb(1, 2, 3)');

    expect(asRgb).toBe(glyphFor('#010203'));
    expect(asRgb).not.toBe(glyphFor(undefined));
  });
});
