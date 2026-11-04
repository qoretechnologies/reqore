import { render, screen } from '@testing-library/react';
import { ReqoreContent, ReqoreLayoutContent, ReqoreTree, ReqoreUIProvider } from '../src';
import { ReqoreTreeManagementDialog } from '../src/components/Tree/modal';
import { IReqoreTheme } from '../src/constants/theme';

/* `theme.colorDataByType` decides, once, whether the data viewers colour keys and values by
   type (default, unchanged), and `theme.primaryActionIntent` the intent of the primary action in
   the dialogs Reqore draws itself. */

const renderWith = (theme: Partial<IReqoreTheme> | undefined, children: React.ReactNode) =>
  render(
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent>{children}</ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );

const DATA = { name: 'order-process', retries: 3, enabled: true };

const styleOf = (text: string) => getComputedStyle(screen.getByText(text));

describe('theme.colorDataByType', () => {
  test('a tree colours its keys and values by type by default', () => {
    renderWith(undefined, <ReqoreTree data={DATA} showControls={false} />);
    const key = styleOf('retries:');
    expect(key.opacity).not.toBe('0.65');
    expect(key.color).not.toBe(styleOf('"order-process"').color);
  });

  test('false draws a key as a quiet label and every value as plain text', () => {
    const { container } = renderWith(
      { colorDataByType: false },
      <ReqoreTree data={DATA} showControls={false} />
    );
    expect(styleOf('retries:').opacity).toBe('0.65');
    // A number and a boolean read in the same colour as a string: no value is a verdict.
    const labels = Array.from(container.querySelectorAll('.reqore-tree-label')).map(
      (label) => getComputedStyle(label).color
    );
    expect(new Set(labels).size).toBe(1);
  });

  test("a tree's own colorByType wins over the theme", () => {
    renderWith(
      { colorDataByType: false },
      <ReqoreTree data={DATA} showControls={false} colorByType />
    );
    expect(styleOf('retries:').opacity).not.toBe('0.65');
  });
});

describe('theme.primaryActionIntent', () => {
  const saveBackground = (theme: Partial<IReqoreTheme> | undefined) => {
    const { unmount } = renderWith(
      theme,
      <ReqoreTreeManagementDialog
        data={{ key: 'a', value: '1' }}
        type='object'
        onClose={() => {}}
      />
    );
    const background = getComputedStyle(
      document.querySelector('.reqore-tree-save') as Element
    ).backgroundColor;
    unmount();
    return background;
  };

  test("the tree editor's Save takes the app's primary intent when the theme names one", () => {
    expect(saveBackground({ primaryActionIntent: 'danger' })).not.toBe(saveBackground(undefined));
  });
});
