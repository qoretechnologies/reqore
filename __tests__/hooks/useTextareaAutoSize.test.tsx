import { fireEvent, render } from '@testing-library/react';
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

  it('is measured with no scrollbar, at the width it is drawn at, and keeps its own style', () => {
    /* Where the platform draws classic scrollbars, a field whose text overflows draws one, and
       its text wraps narrower, onto more lines: 24px more here. And a field as wide as its
       columns is narrower with no scrollbar unless its width is held: 24px more again. */
    const measuredAt: { overflowY: string; width: string }[] = [];
    let drawnWidth = '';
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(function (
      this: HTMLTextAreaElement
    ) {
      const { overflowY, width } = this.style;
      measuredAt.push({ overflowY, width });

      return TEXT_AND_PADDING + (overflowY === 'hidden' ? 0 : 24) + (width === drawnWidth ? 0 : 24);
    });

    renderTextarea({ style: { overflowY: 'scroll' } });
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea.reqore-textarea');
    drawnWidth = getComputedStyle(textarea).width;
    expect(drawnWidth).not.toBe('');
    measuredAt.length = 0;
    // a new text is fitted again
    fireEvent.change(textarea, { target: { value: 'A longer note' } });

    expect(measuredAt).toEqual([{ overflowY: 'hidden', width: drawnWidth }]);
    expect(textarea.style.height).toBe(`${TEXT_AND_PADDING + 2}px`);
    // the caller's overflow is put back, and the width is the field's own again
    expect(textarea.style.overflowY).toBe('scroll');
    expect(textarea.style.width).toBe('');
  });
});

describe('<ReqoreTextarea scaleWithContent /> when its width changes', () => {
  /* jsdom has no ResizeObserver and runs no frames: the test stands in for both, and says when the
     field's size changes and when the next frame comes. */
  let observers: { callback: ResizeObserverCallback; disconnected: boolean }[];
  let frames: Map<number, FrameRequestCallback>;
  let scrollHeight: number;

  beforeEach(() => {
    observers = [];
    frames = new Map();
    scrollHeight = TEXT_AND_PADDING;
    vi.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get').mockImplementation(
      () => scrollHeight
    );
    vi.stubGlobal(
      'ResizeObserver',
      class {
        private readonly entry: { callback: ResizeObserverCallback; disconnected: boolean };

        constructor(callback: ResizeObserverCallback) {
          this.entry = { callback, disconnected: false };
          observers.push(this.entry);
        }

        observe() {}

        unobserve() {}

        disconnect() {
          this.entry.disconnected = true;
        }
      }
    );
    let nextFrame = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrame += 1;
      frames.set(nextFrame, callback);
      return nextFrame;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const resizeTo = (width: number, height: number) => {
    const live = observers.filter(({ disconnected }) => !disconnected);
    expect(live).toHaveLength(1);
    live[0].callback(
      [{ contentRect: { width, height } } as ResizeObserverEntry],
      {} as ResizeObserver
    );
  };

  const nextFrame = () => {
    const due = Array.from(frames.values());
    frames.clear();
    due.forEach((callback) => callback(0));
  };

  const Field = ({ scaleWithContent = true }: { scaleWithContent?: boolean }) => (
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreTextarea scaleWithContent={scaleWithContent} value='A note' />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

  const field = () => document.querySelector<HTMLTextAreaElement>('textarea.reqore-textarea');

  it('fits its text again in the frame after its width changes', () => {
    render(<Field />);
    expect(field().style.height).toBe(`${TEXT_AND_PADDING + 2}px`);

    resizeTo(300, 120);
    nextFrame();

    // narrowed, the text wraps onto more lines
    scrollHeight = 200;
    resizeTo(200, 120);
    // not in the observer's callback: that would change what it observes in the same frame
    expect(field().style.height).toBe(`${TEXT_AND_PADDING + 2}px`);
    nextFrame();
    expect(field().style.height).toBe('202px');
  });

  it('keeps its height when only its height changes', () => {
    render(<Field />);
    resizeTo(300, 120);
    nextFrame();

    // a drag of the grip: the text is the same, the box is higher
    field().style.height = '300px';
    scrollHeight = 298;
    resizeTo(300, 300);

    expect(frames.size).toBe(0);
    expect(field().style.height).toBe('300px');
  });

  it('is fitted once shown, after it was drawn hidden with no width', () => {
    // hidden, its text has no height
    scrollHeight = 0;
    render(<Field />);
    resizeTo(0, 0);
    nextFrame();
    expect(field().style.height).toBe('2px');

    scrollHeight = TEXT_AND_PADDING;
    resizeTo(360, 0);
    nextFrame();
    expect(field().style.height).toBe(`${TEXT_AND_PADDING + 2}px`);
  });

  it('stops following its width, and goes back to its rows, when it stops scaling', () => {
    const { rerender, unmount } = render(<Field />);
    resizeTo(300, 120);
    scrollHeight = 200;

    rerender(<Field scaleWithContent={false} />);

    expect(observers.every(({ disconnected }) => disconnected)).toBe(true);
    // the frame the width change asked for is not drawn for it
    expect(frames.size).toBe(0);
    expect(field().style.height).toBe('');

    unmount();
  });

  it('lets go of the observer and the frame when it is unmounted', () => {
    const { unmount } = render(<Field />);
    resizeTo(300, 120);

    unmount();

    expect(observers.every(({ disconnected }) => disconnected)).toBe(true);
    expect(frames.size).toBe(0);
  });
});
