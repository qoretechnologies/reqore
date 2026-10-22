// Copyright 2026 Qore Technologies, s.r.o.
// A chip in the rich text editor is the size it says, when it says one; otherwise a size less than its editor.
//
// The editor's size won over the chip's: a chip that has to be `small` for a finger to press it was `tiny` in a
// `small` editor, its label taller than its box (reqraft's reference chips, qorus#646).
import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreRichTextEditor, ReqoreUIProvider } from '../src';
import { IReqoreTagProps } from '../src/components/Tag';
import { BADGE_SIZE_TO_PX, TSizes } from '../src/constants/sizes';

const A_LINE_WITH_A_CHIP = [
  {
    type: 'paragraph' as const,
    children: [
      { text: 'Send to ' },
      {
        type: 'tag' as const,
        value: '$data:{id:1}',
        label: 'Customer name',
        children: [{ text: '' }],
      },
    ],
  },
];

/** The height the editor draws its chip at - a badge's, as the editor draws its chips - given the editor's size and
 *  what the chip says of itself. */
const chipHeightIn = (
  editorSize: TSizes | undefined,
  chip: IReqoreTagProps,
  tagsProps?: IReqoreTagProps
) => {
  const { unmount } = render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreRichTextEditor
            size={editorSize}
            value={A_LINE_WITH_A_CHIP}
            onChange={() => undefined}
            getTagProps={() => chip}
            tagsProps={tagsProps}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const tag = document.querySelector<HTMLElement>('.reqore-tag');
  expect(tag).not.toBeNull();
  const { height } = getComputedStyle(tag!);
  // one editor at a time: the next measurement finds its own chip
  unmount();
  return height;
};

describe('a chip in the rich text editor', () => {
  test('that says it is small is small in a small editor', () => {
    expect(chipHeightIn('small', { size: 'small' })).toBe(`${BADGE_SIZE_TO_PX.small}px`);
  });

  test('that says it is tiny is tiny in a normal editor', () => {
    expect(chipHeightIn('normal', { size: 'tiny' })).toBe(`${BADGE_SIZE_TO_PX.tiny}px`);
  });

  test('that says no size is a size less than its editor', () => {
    expect(chipHeightIn('small', {})).toBe(`${BADGE_SIZE_TO_PX.tiny}px`);
    expect(chipHeightIn('normal', {})).toBe(`${BADGE_SIZE_TO_PX.small}px`);
  });

  test('that says no size is small in an editor given no size', () => {
    expect(chipHeightIn(undefined, {})).toBe(`${BADGE_SIZE_TO_PX.small}px`);
  });

  test('is the size every chip is given (tagsProps), when it says none of its own', () => {
    expect(chipHeightIn('small', {}, { size: 'normal' })).toBe(`${BADGE_SIZE_TO_PX.normal}px`);
  });
});
