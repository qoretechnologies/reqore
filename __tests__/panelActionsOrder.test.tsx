// Copyright 2026 Qore Technologies, s.r.o.
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { ReqoreContent, ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';
import { IReqorePanelAction, IReqorePanelBottomAction } from '../src/components/Panel';

const renderInProvider = (element: ReactElement) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>{element}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const ACTION_CLASS = 'order-test-action';

/** The labels of the actions drawn in `root`, in the order they are drawn. */
const wordsIn = (root: Element | null) =>
  Array.from(root?.querySelectorAll<HTMLElement>(`.${ACTION_CLASS}`) ?? []).map(
    (button) => button.dataset.action
  );

const action = (label: string, keeps = false): IReqorePanelAction => ({
  label,
  icon: 'CheckLine',
  className: ACTION_CLASS,
  'data-action': label,
  ...(keeps ? { responsive: false } : {}),
} as IReqorePanelAction);

// A bar draws its actions in the page's order, whichever of them may fold (board f67).
describe("a panel's actions", () => {
  test('are drawn in the order the page gives them, a kept one first included', () => {
    const { container } = renderInProvider(
      <ReqorePanel
        label='Build'
        actions={[action('Start review', true), action('Show summary'), action('Settings')]}
      />
    );

    expect(wordsIn(container.querySelector('.reqore-panel-title'))).toEqual([
      'Start review',
      'Show summary',
      'Settings',
    ]);
  });

  test('keep the order a kept one after the folding ones already had', () => {
    const { container } = renderInProvider(
      <ReqorePanel label='Build' actions={[action('Upload'), action('Save', true)]} />
    );

    expect(wordsIn(container.querySelector('.reqore-panel-title'))).toEqual(['Upload', 'Save']);
    // only the kept actions the page lists first make a group of their own
    expect(container.querySelector('.reqore-panel-leading-actions')).toBeNull();
  });

  test("are drawn in the page's order on each side of the bottom bar", () => {
    const bottom = (label: string, position: 'left' | 'right', keeps = false) =>
      ({ ...action(label, keeps), position }) as IReqorePanelBottomAction;
    const { container } = renderInProvider(
      <ReqorePanel
        label='Build'
        bottomActions={[
          bottom('Help', 'left'),
          bottom('Keep', 'left', true),
          bottom('Discard', 'right', true),
          bottom('Preview', 'right'),
        ]}
      />
    );

    expect(wordsIn(container.querySelector('.reqore-panel-bottom-actions'))).toEqual([
      'Help',
      'Keep',
      'Discard',
      'Preview',
    ]);
  });

  test('without responsiveActions keep their order in one group', () => {
    const { container } = renderInProvider(
      <ReqorePanel
        label='Build'
        responsiveActions={false}
        actions={[action('Start review', true), action('Show summary')]}
      />
    );

    expect(wordsIn(container.querySelector('.reqore-panel-title'))).toEqual([
      'Start review',
      'Show summary',
    ]);
    expect(container.querySelector('.reqore-panel-leading-actions')).toBeNull();
  });
});

// Where the title and the actions do not fit on one line, the actions go under it (board f66).
describe('wrapActionsBelowTitle', () => {
  test('puts the actions in one box, in order, that the bar can move under the title', () => {
    const { container } = renderInProvider(
      <ReqorePanel
        label='feature/mvp #42'
        wrapActionsBelowTitle
        actions={[action('Start review', true), action('Upload'), action('Save', true)]}
      />
    );
    const box = container.querySelector('.reqore-panel-title > .reqore-panel-title-actions');

    expect(box).toBeTruthy();
    expect(wordsIn(box)).toEqual(['Start review', 'Upload', 'Save']);
  });

  test('leaves a lone destructive action on the title line', () => {
    const { container } = renderInProvider(
      <ReqorePanel
        label='Order sync template'
        wrapActionsBelowTitle
        actions={[{ icon: 'DeleteBinLine', tooltip: 'Delete', destructive: true }]}
      />
    );

    expect(container.querySelector('.reqore-panel-title-actions')).toBeNull();
  });

  test('changes nothing where it is not asked for', () => {
    const { container } = renderInProvider(
      <ReqorePanel label='Build' actions={[action('Upload'), action('Save', true)]} />
    );

    expect(container.querySelector('.reqore-panel-title-actions')).toBeNull();
  });
});
