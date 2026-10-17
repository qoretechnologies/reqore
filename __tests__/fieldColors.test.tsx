/**
 * A field's colors. The icons and the clear button beside a transparent input or text area are
 * drawn in the color of its text, read on what the field is drawn on (the wrapper was given
 * neither `minimal` nor `transparent`, so they were read on the field's 10% wash its text is not
 * drawn on). A rich-text field's placeholder is faded as far as it reads on the field drawn in
 * the editor's own theme, not the provider's.
 */
import { render } from '@testing-library/react';
import { parseToRgb } from 'polished';
import { ReactElement } from 'react';
import { ReqoreInput, ReqoreRichTextEditor, ReqoreTextarea, ReqoreUIProvider } from '../src';
import { getInputColors } from '../src/components/Input';
import { DEFAULT_THEME } from '../src/constants/theme';
import { ReqoreSurfaceProvider } from '../src/context/SurfaceContext';
import { buildTheme } from '../src/helpers/colors';

/** A surface on which the dark theme's 10% wash turns the text that reads there dark to light. */
const SURFACE = '#777777';

/** A color as getComputedStyle writes it. */
const computed = (color: string) => {
  const { red, green, blue } = parseToRgb(color);

  return `rgb(${red}, ${green}, ${blue})`;
};

const colorOf = (selector: string) =>
  getComputedStyle(document.querySelector(selector) as HTMLElement).color;

const onSurface = (element: ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreSurfaceProvider color={SURFACE}>{element}</ReqoreSurfaceProvider>
    </ReqoreUIProvider>
  );

describe('beside a transparent field, the icons and the clear button', () => {
  // what the wrapper was written in: the text that reads on the wash a transparent field has not
  const onTheWash = computed(
    getInputColors(buildTheme(DEFAULT_THEME), false, false, false, SURFACE).text
  );

  test("of an input are in its text's color", () => {
    onSurface(
      <ReqoreInput
        transparent
        icon='SearchLine'
        value='a value'
        onChange={() => undefined}
        onClearClick={() => undefined}
      />
    );

    expect(colorOf('.reqore-control-wrapper')).toBe(colorOf('.reqore-input'));
    expect(colorOf('.reqore-control-wrapper')).not.toBe(onTheWash);
  });

  test("of a text area are in its text's color", () => {
    onSurface(
      <ReqoreTextarea
        transparent
        value='a value'
        onChange={() => undefined}
        onClearClick={() => undefined}
      />
    );

    expect(colorOf('.reqore-control-wrapper')).toBe(colorOf('.reqore-textarea'));
    expect(colorOf('.reqore-control-wrapper')).not.toBe(onTheWash);
  });
});

describe("a rich-text field's placeholder", () => {
  const placeholderOpacity = () =>
    Number(
      getComputedStyle(
        document.querySelector('.reqore-textarea [contenteditable="false"]') as HTMLElement
      ).opacity
    );

  test("is faded as it reads on the field in the editor's own theme, not the provider's", () => {
    const editor = (props: { customTheme?: { main: `#${string}` } }) => (
      <ReqoreSurfaceProvider color='#ffffff'>
        <ReqoreRichTextEditor
          {...props}
          value={[{ type: 'paragraph', children: [{ text: '' }] }]}
          onChange={() => undefined}
          placeholder='Ask a question'
        />
      </ReqoreSurfaceProvider>
    );
    // the same theme, given to the whole page
    const { unmount } = render(
      <ReqoreUIProvider theme={{ main: '#f0f0f0' }}>{editor({})}</ReqoreUIProvider>
    );
    const asThePage = placeholderOpacity();

    unmount();
    render(<ReqoreUIProvider>{editor({ customTheme: { main: '#f0f0f0' } })}</ReqoreUIProvider>);

    expect(placeholderOpacity()).toBe(asThePage);
  });
});
