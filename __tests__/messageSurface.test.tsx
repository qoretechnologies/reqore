import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreMessage, ReqoreUIProvider } from '../src';
import { IReqoreTheme } from '../src/constants/theme';

/* `theme.messageSurface` decides, once, how a message shows its intent: tinted with it
   (default, unchanged), or on the panel surface with the intent on the icon. */

const PANEL = { main: '#141417', border: '#2d2d33' } as const;

const renderMessage = (theme: Partial<IReqoreTheme> | undefined) =>
  render(
    <ReqoreUIProvider theme={{ ...theme, panel: PANEL }}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreMessage intent='danger' title='Could not load'>
            The server did not answer.
          </ReqoreMessage>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const surfaceOf = () => getComputedStyle(document.querySelector('.reqore-message') as Element);

describe('theme.messageSurface', () => {
  test('a message is tinted with its intent by default', () => {
    renderMessage(undefined);
    expect(surfaceOf().backgroundColor).not.toBe('rgb(20, 20, 23)');
  });

  test("'panel' draws a message on the panel surface, edged with the hairline", () => {
    renderMessage({ messageSurface: 'panel' });
    expect(surfaceOf().backgroundColor).toBe('rgb(20, 20, 23)');
    expect(surfaceOf().borderTopColor).toBe('rgb(45, 45, 51)');
    expect(document.querySelector('.reqore-message')?.textContent).toContain('Could not load');
    // The title is a callout's label, not a heading.
    expect(document.querySelector('.reqore-message .reqore-message-title')?.textContent).toBe(
      'Could not load'
    );
    expect(document.querySelector('.reqore-message h3, .reqore-message h4')).toBeNull();
  });
});
