// Copyright 2026 Qore Technologies, s.r.o.
// the library first: a component module on its own meets its imports half made
import '../src';
import { ICON_ACTIONS_TITLE_SHRINK, actionDrawsNoWords } from '../src/components/Panel';

// Which bar actions are drawn as their icon alone: those stay beside a title a little smaller (f66 c).
describe('a panel action draws no words', () => {
  test('when it is an icon with no label, or says its icon is enough', () => {
    expect(actionDrawsNoWords({ icon: 'QuestionLine', tooltip: 'Help' }, false)).toBe(true);
    expect(actionDrawsNoWords({ icon: 'RefreshLine', label: 'Refresh', iconOnly: true }, false)).toBe(
      true
    );
  });

  test('when a narrow bar drops its label, unless it keeps its words', () => {
    expect(actionDrawsNoWords({ icon: 'TableLine', label: 'Browse' }, true)).toBe(true);
    expect(actionDrawsNoWords({ icon: 'TableLine', label: 'Browse' }, false)).toBe(false);
    expect(
      actionDrawsNoWords({ icon: 'TableLine', label: 'Browse', responsive: false }, true)
    ).toBe(false);
  });

  test('never for a control the caller draws, a menu with its label, or a group with words', () => {
    expect(actionDrawsNoWords({ as: () => null, props: {} }, true)).toBe(false);
    expect(
      actionDrawsNoWords({ icon: 'MoreLine', label: 'More', actions: [{ label: 'A' }] }, true)
    ).toBe(false);
    expect(
      actionDrawsNoWords(
        { group: [{ icon: 'AddLine' }, { icon: 'TableLine', label: 'Browse', responsive: false }] },
        true
      )
    ).toBe(false);
    expect(actionDrawsNoWords({ group: [{ icon: 'AddLine' }, { icon: 'MoreLine' }] }, false)).toBe(
      true
    );
  });

  test('a title may be drawn a tenth smaller for them', () => {
    expect(ICON_ACTIONS_TITLE_SHRINK).toBe(0.9);
  });
});
