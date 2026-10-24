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

// Updates the height of a <textarea> when the value changes.
const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
  scaleWithContent?: boolean
) => {
  useEffect(() => {
    if (textAreaRef && scaleWithContent) {
      // Reset to the intrinsic (auto) height momentarily so scrollHeight is
      // measured against the `rows` attribute: scrollHeight = max(rows height,
      // content height), which makes `rows` the floor the textarea never
      // shrinks below. (A '0px' reset measured content alone, so a consumer's
      // `rows` was ignored the moment scaleWithContent was on.)
      textAreaRef.style.height = '';

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = `${getTextareaHeightForText(textAreaRef)}px`;
    }
  }, [textAreaRef, value]);
};

export default useAutosizeTextArea;
