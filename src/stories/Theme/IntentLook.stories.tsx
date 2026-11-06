import { StoryObj } from '@storybook/react';
import { ReactNode } from 'react';
import { expect } from 'storybook/test';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreUIProvider from '../../containers/UIProvider';
import {
  ReqoreButton,
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreLayoutContent,
  ReqoreP,
  ReqorePanel,
} from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Theme/Intent look',
  component: ReqoreUIProvider,
  parameters: {
    docs: {
      description: {
        component:
          '`theme.buttons.intentLook` draws an intent as a fill (the default) or as text. With `{ danger: "text" }` a destructive button is red words on a plain button, and an icon-only bin is an ordinary icon that turns red only under the pointer.',
      },
    },
  },
} as StoryMeta<typeof ReqoreUIProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILL: Partial<IReqoreTheme> = { main: '#121212' };
const TEXT: Partial<IReqoreTheme> = { main: '#121212', buttons: { intentLook: { danger: 'text' } } };

const Specimen = () => (
  <ReqoreControlGroup vertical gapSize='big' fluid>
    <ReqoreControlGroup fluid={false}>
      <ReqoreButton className='specimen-delete' intent='danger' icon='DeleteBinLine'>
        Delete workflow
      </ReqoreButton>
      <ReqoreButton>Cancel</ReqoreButton>
    </ReqoreControlGroup>
    <ReqorePanel
      label='Order intake'
      flat
      actions={[
        { icon: 'EditLine', tooltip: 'Edit' },
        { icon: 'DeleteBinLine', intent: 'danger', tooltip: 'Delete', className: 'specimen-bin' },
      ]}
    >
      <ReqoreP size='small'>Receives orders from the shop and hands them to fulfilment.</ReqoreP>
    </ReqorePanel>
  </ReqoreControlGroup>
);

const Side = ({
  label,
  className,
  theme,
  children,
}: {
  label: string;
  className: string;
  theme: Partial<IReqoreTheme>;
  children: ReactNode;
}) => (
  <div className={className} style={{ padding: 24, flex: '1 1 420px', minWidth: 0 }}>
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ReqoreP size='small' effect={{ opacity: 0.6 }}>
            {label}
          </ReqoreP>
          {children}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  </div>
);

export const FillAndText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same buttons with the default fill (left) and with `intentLook: { danger: "text" }` (right): red words on a plain button, and a bin that is grey until hovered.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      <Side label='Fill (default)' className='side-fill' theme={FILL}>
        <Specimen />
      </Side>
      <Side label='Text' className='side-text' theme={TEXT}>
        <Specimen />
      </Side>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const fill = canvasElement.querySelector<HTMLElement>('.side-fill .specimen-delete')!;
    const text = canvasElement.querySelector<HTMLElement>('.side-text .specimen-delete')!;
    const bin = canvasElement.querySelector<HTMLElement>('.side-text .specimen-bin')!;
    await expect(fill.getAttribute('data-intent-text')).toBeNull();
    await expect(text.getAttribute('data-intent-text')).toBe('label');
    // Not a red block: the text-look button keeps an ordinary surface.
    await expect(getComputedStyle(text).backgroundColor).not.toBe(
      getComputedStyle(fill).backgroundColor
    );
    await expect(bin.getAttribute('data-intent-text')).toBe('icon');
    await expect(bin.style.color).toBe('');
  },
};
