import { render } from '@testing-library/react';
import { ReqoreContent, ReqoreDrawer, ReqoreLayoutContent, ReqoreUIProvider } from '../src';

const panelStyle = () =>
  window.getComputedStyle(document.querySelector('.reqore-drawer') as HTMLElement);

const renderDrawer = (options: Record<string, unknown>, props: Record<string, unknown> = {}) =>
  render(
    <ReqoreUIProvider options={options as any}>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqoreDrawer isOpen {...props}>
            Hello
          </ReqoreDrawer>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

test('a see-through drawer with a backdrop is frosted by options.dialogBlur', () => {
  renderDrawer({ dialogOpacity: 0.7, dialogBlur: 20, animations: { dialogs: false } });
  expect(panelStyle().backdropFilter).toBe('blur(20px)');
});

test("a call site's own opacity wins over options.dialogOpacity", () => {
  renderDrawer(
    { dialogOpacity: 0.7, dialogBlur: 20, animations: { dialogs: false } },
    { opacity: 1 }
  );
  // a solid panel has nothing to frost
  expect(panelStyle().backdropFilter ?? '').not.toContain('blur');
});

test('unset, a drawer stays as it was: solid, no frost', () => {
  renderDrawer({ animations: { dialogs: false } });
  expect(panelStyle().backdropFilter ?? '').not.toContain('blur');
});

test('a see-through drawer without a backdrop is frosted by options.dialogBlur too', () => {
  renderDrawer({ dialogOpacity: 0.6, dialogBlur: 20, animations: { dialogs: false } }, { hasBackdrop: false });
  expect(panelStyle().backdropFilter).toBe('blur(20px)');
});

test("without a backdrop, a call site's own blur still wins", () => {
  renderDrawer(
    { dialogOpacity: 0.6, dialogBlur: 20, animations: { dialogs: false } },
    { hasBackdrop: false, blur: 8 }
  );
  expect(panelStyle().backdropFilter).toBe('blur(8px)');
});
