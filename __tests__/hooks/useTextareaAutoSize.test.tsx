import { render } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTextarea, ReqoreUIProvider } from '../../src';
import { getTextareaHeightForText } from '../../src/hooks/useTextareaAutoSize';

/* jsdom lays nothing out, so a textarea's text has no height there: each test gives it one, the
   `scrollHeight` a browser would report for it (its text and padding). */
const TEXT_AND_PADDING = 120;

beforeEach(() => {
  vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockReturnValue(TEXT_AND_PADDING);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const textareaStyled = (style: Partial<CSSStyleDeclaration>): HTMLTextAreaElement => {
  const textarea = document.createElement('textarea');
  Object.assign(textarea.style, style);
  document.body.appendChild(textarea);

  return textarea;
};

describe('getTextareaHeightForText', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('adds the border to the text and padding of a border box', () => {
    const textarea = textareaStyled({
      boxSizing: 'border-box',
      borderTop: '1px solid',
      borderBottom: '2px solid',
      padding: '5px',
    });

    expect(getTextareaHeightForText(textarea)).toBe(TEXT_AND_PADDING + 3);
  });

  it('takes the padding from the text and padding of a content box', () => {
    const textarea = textareaStyled({
      boxSizing: 'content-box',
      border: '1px solid',
      paddingTop: '5px',
      paddingBottom: '7px',
    });

    expect(getTextareaHeightForText(textarea)).toBe(TEXT_AND_PADDING - 12);
  });

  it('reads a box with no box-sizing as the content box it is by default', () => {
    const textarea = textareaStyled({ border: '1px solid', padding: '4px' });

    expect(getTextareaHeightForText(textarea)).toBe(TEXT_AND_PADDING - 8);
  });

  it('is the text and padding of a border box with no border', () => {
    const textarea = textareaStyled({ boxSizing: 'border-box', border: '0', padding: '5px' });

    expect(getTextareaHeightForText(textarea)).toBe(TEXT_AND_PADDING);
  });
});

describe('<ReqoreTextarea scaleWithContent />', () => {
  const renderTextarea = (props: Parameters<typeof ReqoreTextarea>[0]) =>
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqoreTextarea scaleWithContent value='A note' {...props} />
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

  it('is as high as its text, its padding and its 1px border, all of it inside its box', () => {
    renderTextarea({});
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea.reqore-textarea');

    // the Reqore layout lays everything out in a border box, and a field has a 1px border
    expect(getComputedStyle(textarea).boxSizing).toBe('border-box');
    expect(getComputedStyle(textarea).borderTopWidth).toBe('1px');
    expect(textarea.style.height).toBe(`${TEXT_AND_PADDING + 2}px`);
  });

  it('is as high as its text and padding when it is flat, with no border', () => {
    renderTextarea({ flat: true });

    expect(
      document.querySelector<HTMLTextAreaElement>('textarea.reqore-textarea').style.height
    ).toBe(`${TEXT_AND_PADDING}px`);
  });

  it('is laid out in a content box as high as its text alone', () => {
    renderTextarea({ size: 'normal', style: { boxSizing: 'content-box' } });
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea.reqore-textarea');
    const padding = parseFloat(getComputedStyle(textarea).paddingTop) * 2;

    expect(padding).toBeGreaterThan(0);
    expect(textarea.style.height).toBe(`${TEXT_AND_PADDING - padding}px`);
  });

  it('is left at the height its rows give it when it does not scale with its content', () => {
    renderTextarea({ scaleWithContent: false });

    expect(
      document.querySelector<HTMLTextAreaElement>('textarea.reqore-textarea').style.height
    ).toBe('');
  });
});
