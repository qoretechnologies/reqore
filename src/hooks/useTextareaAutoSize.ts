import { useEffect } from 'react';

const px = (value: string): number => parseFloat(value) || 0;

/**
 * The `height` that shows all of a textarea's text and no more. `scrollHeight` is the text and the
 * padding around it, and the `height` style sizes the border box (`box-sizing: border-box`, which a
 * Reqore layout gives everything in it) or the content box (the browser's default). So the border
 * is added to it for the one, and the padding taken from it for the other.
 *
 * Set to `scrollHeight` as it was, a bordered field was its border short of its text (2px with the
 * default 1px border), and it scrolled by that much, with a scrollbar wherever the platform draws
 * one. A field in a content box was its padding too high.
 */
export const getTextareaHeightForText = (textarea: HTMLTextAreaElement): number => {
  const style = window.getComputedStyle(textarea);

  return style.boxSizing === 'border-box'
    ? textarea.scrollHeight + px(style.borderTopWidth) + px(style.borderBottomWidth)
    : textarea.scrollHeight - px(style.paddingTop) - px(style.paddingBottom);
};

/** Sizes `textarea` to its text, never lower than the height its `rows` give it. */
const fitTextareaToText = (textarea: HTMLTextAreaElement) => {
  /* Measured with no scrollbar, at the width the field is drawn at, as it is drawn once it
     fits. At the height the measurement starts from, the text overflows, and where the
     platform draws classic scrollbars (Linux, Windows, a Mac set to always show them) the
     field drew one: the text wrapped 15px narrower, onto more lines than it takes without
     it, and the field kept the empty lines under its text once the scrollbar had gone.

     The width is held for the measurement: a field as wide as its columns (not fluid, in a
     box as wide as what it holds) counts a scrollbar's width in its own only while it may
     scroll, so measured with its overflow hidden it would be 15px narrower, on every
     platform. Both are put back before anything is drawn. */
  const { overflowY, width } = textarea.style;
  textarea.style.width = window.getComputedStyle(textarea).width;
  textarea.style.overflowY = 'hidden';

  // Reset to the intrinsic (auto) height momentarily so scrollHeight is
  // measured against the `rows` attribute: scrollHeight = max(rows height,
  // content height), which makes `rows` the floor the textarea never
  // shrinks below. (A '0px' reset measured content alone, so a consumer's
  // `rows` was ignored the moment scaleWithContent was on.)
  textarea.style.height = '';
  const height = getTextareaHeightForText(textarea);

  // We then set the height directly, outside of the render loop
  // Trying to set this with state or a ref will product an incorrect value.
  textarea.style.height = `${height}px`;
  textarea.style.overflowY = overflowY;
  textarea.style.width = width;
};

/**
 * Keeps a `<textarea>` that scales with its content as high as its text: when the text changes,
 * and when the field's width does.
 */
const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
  scaleWithContent?: boolean
) => {
  useEffect(() => {
    if (textAreaRef && scaleWithContent) {
      fitTextareaToText(textAreaRef);
    }
  }, [textAreaRef, value, scaleWithContent]);

  /* The text wraps to the field's width, so a new width is a new height. Fitted only when the text
     changed, a field kept the height of the width it had then: narrowed (a narrower window or
     container), it held more lines than its box and scrolled; widened, it kept empty lines; and a
     field drawn while hidden (a closed tab or section, where it has no width and its text no height)
     was one line high once shown. A height alone changing (a drag of the grip, or the fit itself)
     fits nothing.

     The fit waits for the next frame: made in the observer's callback, it would change the size the
     observer is reporting, in the same frame. */
  useEffect(() => {
    if (!textAreaRef || !scaleWithContent) {
      return undefined;
    }

    let width: number | undefined;
    let frame = 0;
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(([entry]) => {
            if (entry.contentRect.width === width) {
              return;
            }
            width = entry.contentRect.width;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
              frame = 0;
              fitTextareaToText(textAreaRef);
            });
          });

    observer?.observe(textAreaRef);

    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      // a field that no longer scales with its content goes back to the height its rows give it
      textAreaRef.style.height = '';
    };
  }, [textAreaRef, scaleWithContent]);
};

export default useAutosizeTextArea;
