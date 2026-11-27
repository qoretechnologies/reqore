import { render } from '@testing-library/react';
import {
  CALM_DIALOG_WIDTHS,
  ReqoreContent,
  ReqoreLayoutContent,
  ReqoreModal,
  ReqoreUIProvider,
} from '../src';
import { IReqoreUIProviderProps } from '../src/containers/UIProvider';

/**
 * A modal that gives no width of its own takes the app's (`dialogWidth` on the provider): a form
 * 720px and a wide dialog 960px in the calm look, where 80vw was about 2,100px on a wide screen.
 * Its own `width` still wins, and with no app width it is 80vw as before.
 */
const widthOf = (options: IReqoreUIProviderProps['options'], modal: React.ReactNode) => {
  const { unmount } = render(
    <ReqoreUIProvider options={options}>
      <ReqoreLayoutContent>
        <ReqoreContent>{modal}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
  const root = document.querySelector<HTMLElement>('.reqore-modal')!;
  const sized = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))].find(
    (element) => element.style.width
  );
  const width = sized?.style.width;
  unmount();
  return width;
};

describe("a modal's width", () => {
  it("is the app's form width where it gives none", () => {
    expect(widthOf({ dialogWidth: CALM_DIALOG_WIDTHS }, <ReqoreModal isOpen>Form</ReqoreModal>)).toBe(
      '720px'
    );
  });

  it("is the app's wide width where it says it is wide", () => {
    expect(
      widthOf(
        { dialogWidth: CALM_DIALOG_WIDTHS },
        <ReqoreModal isOpen wide>
          Table
        </ReqoreModal>
      )
    ).toBe('960px');
  });

  it('is its own where it gives one', () => {
    expect(
      widthOf(
        { dialogWidth: CALM_DIALOG_WIDTHS },
        <ReqoreModal isOpen width='500px'>
          Own
        </ReqoreModal>
      )
    ).toBe('500px');
  });

  it('is 80vw with no app width, as before', () => {
    expect(widthOf(undefined, <ReqoreModal isOpen>Default</ReqoreModal>)).toBe('80vw');
  });
});
