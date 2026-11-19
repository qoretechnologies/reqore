import { fireEvent, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { ReqoreContent, ReqoreLayoutContent, ReqorePanel, ReqoreUIProvider } from '../src';
import { PANEL_ACTIONS_ATTRIBUTE } from '../src/components/Panel';

/**
 * A title bar folds a collapsible panel only on a click on the bar itself, never on one of its actions (queue item
 * 34). An action used to keep its click from the bar only when it had an `onClick` of its own, so a custom (`as`)
 * action without one, or one that did not hand an `onClick` on to its DOM, folded the panel when it was used.
 */

/** A segmented choice that takes no `onClick`, as the IDE's heading choices: its buttons have their own. */
const Choices = ({ onPick }: { onPick: (value: string) => void }) => (
  <div className='choices'>
    <button type='button' onClick={() => onPick('day')}>
      Today
    </button>
    <button type='button' onClick={() => onPick('week')}>
      This week
    </button>
  </div>
);

/** A custom action that opens something in a portal, as a menu does: its clicks reach the bar through React. */
const Opener = () =>
  createPortal(
    <button type='button' className='in-a-portal'>
      Open in a portal
    </button>,
    document.body
  );

const drawn = (onPick = vi.fn()) =>
  render(
    <ReqoreUIProvider>
      <ReqoreLayoutContent>
        <ReqoreContent>
          <ReqorePanel
            label='Run history'
            collapsible
            actions={[
              { as: Choices, props: { onPick }, responsive: false },
              { as: Opener, responsive: false },
              { label: 'Plain', className: 'plain-action', responsive: false },
              { label: 'Kept', className: 'kept-action' },
            ]}
          >
            <p className='run-history-body'>Twelve runs today</p>
          </ReqorePanel>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const open = () => !!document.querySelector('.run-history-body');

describe("a title bar's actions", () => {
  it('leave a collapsible panel open, whatever they are', () => {
    const onPick = vi.fn();
    drawn(onPick);

    fireEvent.click(screen.getByText('This week'));
    expect(onPick).toHaveBeenCalledWith('week');
    expect(open()).toBe(true);

    fireEvent.click(document.querySelector('.in-a-portal') as HTMLElement);
    expect(open()).toBe(true);

    // an action with no onClick at all, kept or folding
    fireEvent.click(document.querySelector('.plain-action') as HTMLElement);
    expect(open()).toBe(true);
    fireEvent.click(document.querySelector('.kept-action') as HTMLElement);
    expect(open()).toBe(true);
  });

  it('are marked, so the bar knows them', () => {
    drawn();
    const marked = [...document.querySelectorAll(`[${PANEL_ACTIONS_ATTRIBUTE}]`)];

    expect(marked.some((group) => group.contains(screen.getByText('This week')))).toBe(true);
    expect(marked.some((group) => group.contains(document.querySelector('.kept-action')))).toBe(true);
  });

  it('leave the bar itself folding the panel', () => {
    drawn();

    fireEvent.click(screen.getByText('Run history'));
    expect(open()).toBe(false);
    fireEvent.click(screen.getByText('Run history'));
    expect(open()).toBe(true);
  });
});

describe("a clickable panel's actions", () => {
  it("are never the panel's click, in its head, its foot or a portal; its own click is", () => {
    const onOpen = vi.fn();
    render(
      <ReqoreUIProvider>
        <ReqoreLayoutContent>
          <ReqoreContent>
            <ReqorePanel
              label='Order 4211'
              onClick={onOpen}
              actions={[
                { as: Choices, props: { onPick: vi.fn() }, responsive: false },
                { as: Opener, responsive: false },
              ]}
              bottomActions={[{ label: 'Open in a new tab', className: 'foot-action' }]}
            >
              <p className='card-body'>Two lines</p>
            </ReqorePanel>
          </ReqoreContent>
        </ReqoreLayoutContent>
      </ReqoreUIProvider>
    );

    fireEvent.click(screen.getByText('Today'));
    fireEvent.click(document.querySelector('.in-a-portal') as HTMLElement);
    fireEvent.click(document.querySelector('.foot-action') as HTMLElement);
    expect(onOpen).not.toHaveBeenCalled();

    fireEvent.click(document.querySelector('.card-body') as HTMLElement);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
