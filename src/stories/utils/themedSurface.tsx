import { ReactNode } from 'react';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreUIProvider from '../../containers/UIProvider';
import { ReqoreContent, ReqoreLayoutContent, ReqoreP } from '../../index';

/** The page the comparison sits on — a step darker than either theme's surfaces. */
const PAGE = '#0c0c0e';

/**
 * A calm theme: panels one step above the page on one surface, edged with one neutral hairline,
 * and buttons a step above the panels. What `theme.panel` and `theme.buttons.main` are for.
 */
export const THEMED_SURFACE: Partial<IReqoreTheme> = {
  main: '#121212',
  panel: { main: '#141417', border: '#2d2d33' },
  buttons: { main: '#1c1c20' },
};

const DERIVED: Partial<IReqoreTheme> = { main: '#121212' };

const Surface = ({
  label,
  theme,
  children,
}: {
  label: string;
  theme: Partial<IReqoreTheme>;
  children: ReactNode;
}) => (
  <div
    className='story-themed-surface'
    style={{ background: PAGE, padding: 24, flex: '1 1 420px', minWidth: 0 }}
  >
    <ReqoreUIProvider theme={theme} layoutWrapperProps={{ transparent: true }}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ReqoreP size='small'>{label}</ReqoreP>
          {children}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  </div>
);

/**
 * Renders the same content twice, side by side: on the left with every surface derived from
 * `main` (the default), on the right with `theme.panel` and `theme.buttons.main` set. Used by
 * each component that reads those keys, so a reviewer sees what the theme changes — and that an
 * intent or a customTheme still wins — next to what it was.
 */
export const ThemedSurfaceComparison = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
    <Surface label='Derived from main (default)' theme={DERIVED}>
      {children}
    </Surface>
    <Surface label='theme.panel + theme.buttons.main' theme={THEMED_SURFACE}>
      {children}
    </Surface>
  </div>
);

/** One themed surface, for overlays (drawers, modals) that cannot sit side by side. */
export const ThemedSurface = ({ children }: { children: ReactNode }) => (
  <Surface label='theme.panel + theme.buttons.main' theme={THEMED_SURFACE}>
    {children}
  </Surface>
);
