import { rgba } from 'polished';
import { forwardRef, memo, ReactNode } from 'react';
import { MONO_FONT } from '../../constants/fonts';
import { TSizes } from '../../constants/sizes';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreThemeProvider from '../../containers/ThemeProvider';
import {
  getPanelHairlineColor,
  getReadableColor,
  getSecondaryTextColor,
} from '../../helpers/colors';
import styled from '../../helpers/styled';
import { getTextSize } from '../../helpers/typeScale';
import { getOneHigherSize, getOneLessSize } from '../../helpers/utils';
import { useReqoreTheme } from '../../hooks/useTheme';
import { IWithReqoreCustomTheme, IWithReqoreSize } from '../../types/global';

export interface IReqoreMarkdownBlockProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    IWithReqoreCustomTheme,
    IWithReqoreSize {
  /**
   * The rendered Markdown: any renderer's elements (`react-markdown`, `marked`, HTML a server
   * sent). The block styles them by tag, so it needs no renderer of its own.
   */
  children?: ReactNode;
  /**
   * The longest a line of prose runs, in characters, before it wraps. Unset, about 72 (decision
   * 025: lines a person can read); `false` lets prose fill the box.
   *
   * @default 72
   */
  measure?: number | false;
}

export interface IReqoreMarkdownBlockStyle {
  theme: IReqoreTheme;
  $size: TSizes;
  $measure?: number | false;
}

const primary = ({ theme }: IReqoreMarkdownBlockStyle) => getReadableColor(theme);
/* The theme's secondary text color where it names one (a calm palette's grey), else the readable
   color at 0.75, as before. */
const secondary = ({ theme }: IReqoreMarkdownBlockStyle) =>
  getSecondaryTextColor(theme) ?? rgba(getReadableColor(theme), 0.75);
const text = (step: 'up' | 'same' | 'down') => ({ theme, $size }: IReqoreMarkdownBlockStyle) =>
  `${getTextSize(
    theme,
    step === 'up' ? getOneHigherSize($size) : step === 'down' ? getOneLessSize($size) : $size
  )}px`;
const hairline = ({ theme }: IReqoreMarkdownBlockStyle) => getPanelHairlineColor(theme);

/**
 * Text a person wrote, drawn in the theme's type scale (decision 017). A "# Order Sync" at the top
 * of a template's description rendered as the browser's 28px heading, as loud as the page's own
 * title, inside a drawer section. Here a heading is at most one step above the body: h1-h3 a step
 * up and bold, h4-h6 the body's size and bold, both in the primary colour; prose is the body's size
 * in the secondary grey, about 72 characters a line (decision 025).
 */
export const StyledMarkdownBlock = styled.div<IReqoreMarkdownBlockStyle>`
  color: ${secondary};
  font-size: ${text('same')};
  line-height: 1.5;
  overflow-wrap: anywhere;
  min-width: 0;

  & > *:first-child {
    margin-top: 0;
  }

  & > *:last-child {
    margin-bottom: 0;
  }

  p,
  ul,
  ol,
  blockquote,
  pre,
  table {
    margin: 0 0 0.6em;
    max-width: ${({ $measure }) => ($measure === false ? 'none' : `${$measure ?? 72}ch`)};
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1em 0 0.35em;
    color: ${primary};
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: normal;
    text-transform: none;
  }

  h1,
  h2,
  h3 {
    font-size: ${text('up')};
  }

  h4,
  h5,
  h6 {
    font-size: ${text('same')};
  }

  strong,
  b {
    color: ${primary};
    font-weight: 600;
  }

  ul,
  ol {
    padding-left: 1.4em;
  }

  li {
    margin: 0.2em 0;
  }

  li > ul,
  li > ol {
    margin: 0.2em 0 0;
  }

  a {
    color: ${({ theme }) => theme.intents.info};
    text-decoration: none;
  }

  a:hover,
  a:focus-visible {
    text-decoration: underline;
  }

  code {
    font-family: ${MONO_FONT};
    font-size: 0.92em;
    color: ${primary};
    background: ${({ theme }) => rgba(getReadableColor(theme), 0.08)};
    border-radius: 3px;
    padding: 0.05em 0.35em;
  }

  pre {
    padding: 0.6em 0.8em;
    border: 1px solid ${hairline};
    border-radius: 4px;
    overflow-x: auto;
  }

  pre code {
    background: none;
    padding: 0;
    font-size: ${text('down')};
    white-space: pre;
  }

  blockquote {
    padding-left: 0.8em;
    border-left: 2px solid ${hairline};
  }

  hr {
    border: 0;
    border-top: 1px solid ${hairline};
    margin: 1em 0;
  }

  table {
    border-collapse: collapse;
  }

  th,
  td {
    text-align: left;
    padding: 0.3em 0.8em 0.3em 0;
    border-bottom: 1px solid ${hairline};
  }

  th {
    color: ${primary};
    font-weight: 600;
  }

  img {
    max-width: 100%;
  }
`;

/**
 * Markdown a person wrote, in the app's type: wrap whatever renders it (`<ReactMarkdown>` in
 * Reqraft's `ReqraftMarkdown`, or an app's own) and its headings, prose, lists, code and tables
 * take the theme's sizes and colours. `size` is the body's size; headings are at most one step up.
 */
export const ReqoreMarkdownBlock = memo(
  forwardRef<HTMLDivElement, IReqoreMarkdownBlockProps>(
    (
      { children, size = 'normal', measure, customTheme, inheritCustomTheme, className, ...rest },
      ref
    ) => {
      const theme = useReqoreTheme('main', customTheme, undefined, undefined, inheritCustomTheme);

      return (
        <StyledMarkdownBlock
          {...rest}
          ref={ref}
          theme={theme}
          $size={size}
          $measure={measure}
          className={`${className || ''} reqore-markdown-block`.trim()}
        >
          {/* Reqore components a renderer draws inside take the block's theme too. */}
          <ReqoreThemeProvider theme={theme} customTheme={customTheme}>
            {children}
          </ReqoreThemeProvider>
        </StyledMarkdownBlock>
      );
    }
  )
);

ReqoreMarkdownBlock.displayName = 'ReqoreMarkdownBlock';
