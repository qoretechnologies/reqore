/**
 * A panel action whose icon says what it does (`iconOnly`) is drawn as its icon at every width, its label its
 * tooltip and its accessible name; an action without it keeps its words (only an obvious
 * action is its icon alone). The story is `Layout/Panel › An Obvious Action Is Its Icon`.
 */
import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';

const renderPanel = () =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePanel
            label='Orders this week'
            actions={[
              { label: 'Refresh', icon: 'RefreshLine', iconOnly: true, className: 'refresh' },
              { label: 'Compare with period before', icon: 'ArrowLeftRightLine', className: 'compare' },
              {
                label: 'Export',
                icon: 'DownloadLine',
                iconOnly: true,
                className: 'export',
                actions: [{ label: 'As CSV' }],
              },
            ]}
          />
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('an action whose icon says it is its icon, named by its words', () => {
  renderPanel();

  const refresh = document.querySelector<HTMLElement>('.refresh')!;

  expect(refresh.textContent?.trim()).toBe('');
  expect(refresh.getAttribute('aria-label')).toBe('Refresh');
  expect(refresh.hasAttribute('iconOnly')).toBe(false);
  expect(refresh.hasAttribute('icononly')).toBe(false);
});

test('a dropdown action whose icon says it is its icon too', () => {
  renderPanel();

  const exportButton = document.querySelector<HTMLElement>('.export')!;

  expect(exportButton.textContent).not.toContain('Export');
  expect(exportButton.getAttribute('aria-label')).toBe('Export');
});

test('an action without it keeps its words', () => {
  renderPanel();

  expect(document.querySelector<HTMLElement>('.compare')!.textContent).toContain(
    'Compare with period before'
  );
});
