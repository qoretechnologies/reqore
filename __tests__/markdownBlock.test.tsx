import { render } from '@testing-library/react';
import {
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreMarkdownBlock,
  ReqoreUIProvider,
} from '../src';

const renderBlock = (ui: React.ReactNode, theme?: Record<string, unknown>) =>
  render(
    <ReqoreUIProvider theme={theme as never}>
      <ReqoreLayoutContent>
        <ReqoreContent>{ui}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const px = (selector: string) =>
  parseFloat(getComputedStyle(document.querySelector(selector) as HTMLElement).fontSize);

describe('ReqoreMarkdownBlock', () => {
  test("Draws a renderer's headings one step above the body, from the theme's type scale", () => {
    renderBlock(
      <ReqoreMarkdownBlock>
        <h1>Order Sync</h1>
        <h4>What it needs</h4>
        <p>Copies every new order.</p>
      </ReqoreMarkdownBlock>,
      { typeScale: { text: { normal: 13, big: 15 } } }
    );

    expect(document.querySelector('.reqore-markdown-block')).not.toBeNull();
    expect(px('.reqore-markdown-block')).toBe(13);
    expect(px('.reqore-markdown-block h1')).toBe(15);
    expect(px('.reqore-markdown-block h4')).toBe(13);
  });

  test('Holds prose to about 72 characters a line unless told not to', () => {
    const { unmount } = renderBlock(
      <ReqoreMarkdownBlock>
        <p>Prose</p>
      </ReqoreMarkdownBlock>
    );

    expect(getComputedStyle(document.querySelector('.reqore-markdown-block p')!).maxWidth).toBe(
      '72ch'
    );
    unmount();

    renderBlock(
      <ReqoreMarkdownBlock measure={false}>
        <p>Prose</p>
      </ReqoreMarkdownBlock>
    );
    expect(getComputedStyle(document.querySelector('.reqore-markdown-block p')!).maxWidth).toBe(
      'none'
    );
  });

  test('Scales with size', () => {
    renderBlock(
      <ReqoreMarkdownBlock size='small'>
        <p>Small prose</p>
      </ReqoreMarkdownBlock>,
      { typeScale: { text: { small: 12, normal: 13 } } }
    );

    expect(px('.reqore-markdown-block')).toBe(12);
  });
});
