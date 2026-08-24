import { useEffect } from 'react';

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
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
};

export default useAutosizeTextArea;
