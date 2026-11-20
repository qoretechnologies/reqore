import { StoryObj } from '@storybook/react';
import { ReactNode } from 'react';
import { expect, waitFor } from 'storybook/test';
import { IReqoreTheme } from '../../constants/theme';
import ReqoreUIProvider from '../../containers/UIProvider';
import {
  ReqoreContent,
  ReqoreControlGroup,
  ReqoreEntityRow,
  ReqoreLayoutContent,
  ReqoreMarkdownBlock,
  ReqoreP,
  ReqorePanel,
  ReqoreStatistic,
} from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Theme/Text roles',
  component: ReqoreUIProvider,
} as StoryMeta<typeof ReqoreUIProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A calm palette's surface and its secondary grey, named once in the theme. */
const CALM: Partial<IReqoreTheme> = { main: '#141418', text: { secondary: '#a6a6af' } };

const Specimen = () => (
  <ReqoreControlGroup vertical gapSize='big' fluid>
    <ReqorePanel label='Order sync' description='Moves confirmed orders to the warehouse' flat={false}>
      <ReqoreStatistic label='Running' value={12} description='workflows with orders in flight' />
    </ReqorePanel>
    <ReqoreEntityRow label='Invoice import' description='Every night at 02:00' icon='FileListLine' />
    <ReqoreMarkdownBlock>
      <p>Two labels were printed for one order thirty seconds apart.</p>
    </ReqoreMarkdownBlock>
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
          <ReqoreP size='tiny' effect={{ uppercase: true, spaced: 1, opacity: 0.6 }}>
            {label}
          </ReqoreP>
          {children}
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  </div>
);

/** Where each component draws its secondary words. */
const SECONDARY = [
  '.reqore-panel-title-description',
  '.reqore-statistic-label',
  '.reqore-statistic-description',
  '.reqore-entity-row-description',
  '.reqore-markdown-block',
];

export const SecondaryTextFromTheTheme: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders a panel's description, a statistic's label and description, a row's description and Markdown prose twice: on the left as Reqore draws them by default, each the readable color at an opacity of its own (0.6 to 0.75); on the right under a theme that names its secondary text color (`text: { secondary: '#a6a6af' }`), where all five are that one grey.",
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', background: '#0c0c0e' }}>
      <Side label="Reqore's own" className='story-default' theme={{ main: '#141418' }}>
        <Specimen />
      </Side>
      <Side label='text.secondary' className='story-calm' theme={CALM}>
        <Specimen />
      </Side>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const find = (side: string, selector: string) => {
      const element = canvasElement.querySelector<HTMLElement>(`.${side} ${selector}`);
      if (!element) {
        throw new Error(`${selector} is not rendered on ${side}`);
      }
      return element;
    };

    await waitFor(() => find('story-calm', '.reqore-markdown-block'));
    for (const selector of SECONDARY) {
      await expect(getComputedStyle(find('story-calm', selector)).color, selector).toBe(
        'rgb(166, 166, 175)'
      );
      // Reqore's own: an opacity, not the grey.
      await expect(getComputedStyle(find('story-default', selector)).color, selector).not.toBe(
        'rgb(166, 166, 175)'
      );
    }
  },
};
