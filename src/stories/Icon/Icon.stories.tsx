import { StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreIcon,
  ReqorePanel,
  ReqoreUIProvider,
} from '../../index';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Other/Icon',
  component: ReqoreIcon,
} as StoryMeta<typeof ReqoreIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Icon in its default configuration.',
      },
    },
  },
  render: () => {
    return (
      <>
        <ReqorePanel label='Basic' flat minimal>
          <ReqoreIcon icon='AccountCircleLine' size='12px' margin='both' />
          <ReqoreIcon icon='4kFill' size='14px' margin='both' />
          <ReqoreIcon icon='ArrowLeftCircleFill' intent='success' margin='both' />
          <ReqoreIcon icon='HotelFill' size='18px' margin='both' />
          <ReqoreIcon icon='SignalTowerFill' size='20px' color='#ff0000' margin='both' />
          <ReqoreIcon
            icon='SignalTowerFill'
            size='20px'
            color='#291133'
            effect={{ sepia: true }}
            margin='both'
            tooltip={{ content: 'I have a tooltip', openOnMount: true }}
          />
          <ReqoreIcon
            icon='SignalTowerFill'
            size='20px'
            color='#0c7052'
            effect={{ blur: 1 }}
            margin='both'
          />
          <ReqoreIcon
            icon='SignalTowerFill'
            size='20px'
            color='#700c57'
            effect={{ contrast: 150 }}
            margin='both'
          />
          <ReqoreIcon
            icon='SignalTowerFill'
            size='20px'
            color='#d5be0f'
            effect={{ grayscale: true }}
            margin='both'
          />
          <ReqoreIcon
            icon='SignalTowerFill'
            size='20px'
            color='#0f5bd5'
            effect={{ invert: true }}
            margin='both'
          />
          <ReqoreIcon
            icon='SignalTowerFill'
            size='20px'
            color='#ffffff'
            effect={{ opacity: 0.5 }}
            margin='both'
          />
          <ReqoreIcon
            icon='SignalTowerFill'
            size='20px'
            color='#8d2a5c'
            rotation={90}
            margin='both'
          />
        </ReqorePanel>
        <br />
        <ReqorePanel label='Image' flat minimal>
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='20px'
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='40px'
            rounded
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='30px'
            effect={{ sepia: true }}
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='40px'
            effect={{ grayscale: true }}
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='70px'
            effect={{ blur: 1 }}
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='40px'
            effect={{ contrast: 150 }}
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='40px'
            effect={{ invert: true }}
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='40px'
            effect={{ opacity: 0.5 }}
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='40px'
            effect={{ saturate: 150 }}
            margin='both'
          />
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='40px'
            rotation={180}
            margin='both'
          />
        </ReqorePanel>
        <br />
        <ReqorePanel label='Margined' flat minimal>
          <ReqoreIcon icon='AccountCircleLine' />
          No Margin
          <div>
            <ReqoreIcon icon='4kFill' margin='right' />
            Right Margin
          </div>
          <div>
            Left Margin
            <ReqoreIcon
              image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
              size='20px'
              rounded
              margin='left'
            />
          </div>
          <div>
            Both
            <ReqoreIcon icon='HotelFill' margin='both' />
            Sides
          </div>
          <div>
            Huge
            <ReqoreIcon icon='HotelFill' margin='both' marginSize={50} />
            Margins
          </div>
          <div>
            Tiny
            <ReqoreIcon icon='HotelFill' margin='both' marginSize='tiny' />
            Margins
          </div>
        </ReqorePanel>
      </>
    );
  },
};

export const Glow: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders Icon with a glow effect applied.',
      },
    },
  },
  render: () => (
    <ReqorePanel padded>
      <ReqoreControlGroup gapSize='huge' verticalAlign='center'>
        <ReqoreIcon icon='SparklingLine' size='huge' intent='info' glow />
        <ReqoreIcon icon='AlarmWarningLine' size='huge' intent='danger' glow />
        <ReqoreIcon icon='CheckDoubleLine' size='huge' intent='success' glow />
        <ReqoreIcon icon='AlertLine' size='huge' intent='warning' glow />
        <ReqoreIcon icon='InformationLine' size='huge' color='#bd2ff6' glow />
        <ReqoreIcon
          icon='StarLine'
          size='huge'
          intent='success'
          glow={{ color: 'success', blur: 16, opacity: 0.7 }}
        />
      </ReqoreControlGroup>
    </ReqorePanel>
  ),
};

export const GlobalGlowingIcons: Story = {
  render: () => (
    <ReqoreUIProvider options={{ glowingIcons: true }}>
      <ReqorePanel padded>
        <ReqoreControlGroup gapSize='huge' verticalAlign='center'>
          <ReqoreIcon icon='SparklingLine' size='huge' intent='info' />
          <ReqoreIcon icon='AlarmWarningLine' size='huge' intent='danger' />
          <ReqoreIcon icon='CheckDoubleLine' size='huge' intent='success' />
          <ReqoreIcon icon='AlertLine' size='huge' intent='warning' />
          {/* Opt-out: pass glow={false} explicitly */}
          <ReqoreIcon icon='InformationLine' size='huge' intent='info' glow={false} />
        </ReqoreControlGroup>
      </ReqorePanel>
    </ReqoreUIProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Setting `glowingIcons: true` on the UI provider applies the glow to every ReqoreIcon by default. Individual icons can opt out with `glow={false}`.',
      },
    },
  },
};

export const GlobalGlowingIconsInheritedColor: Story = {
  render: () => (
    <ReqoreUIProvider options={{ glowingIcons: true }}>
      <ReqorePanel padded>
        <ReqoreControlGroup vertical gapSize='huge'>
          {/* Buttons: the glyph inherits the button's text colour. A minimal/flat
              button paints its icon the intent colour → it glows; a solid button
              paints a readable near-white icon → skipped (a white halo is noise). */}
          <ReqoreControlGroup gapSize='big' verticalAlign='center'>
            <ReqoreButton icon='InformationLine' intent='info' minimal flat>
              Info
            </ReqoreButton>
            <ReqoreButton icon='CheckDoubleLine' intent='success' minimal flat>
              Success
            </ReqoreButton>
            <ReqoreButton icon='AlarmWarningLine' intent='danger' minimal flat>
              Danger
            </ReqoreButton>
            <ReqoreButton icon='SparklingLine' intent='info'>
              Solid
            </ReqoreButton>
          </ReqoreControlGroup>
          {/* Bare icons coloured only by an ancestor's `color` (currentColor): the
              glow now reads the painted colour off the element and glows THAT. */}
          <ReqoreControlGroup gapSize='huge' verticalAlign='center'>
            <span style={{ color: '#3b82f6' }}>
              <ReqoreIcon icon='SparklingLine' size='huge' data-testid='inherited-glow' />
            </span>
            <span style={{ color: '#22c55e' }}>
              <ReqoreIcon icon='StarLine' size='huge' />
            </span>
            <span style={{ color: '#f59e0b' }}>
              <ReqoreIcon icon='AlertLine' size='huge' />
            </span>
            {/* A shade of white → no glow (would read as a grey smudge). */}
            <span style={{ color: '#f5f5f5' }}>
              <ReqoreIcon icon='InformationLine' size='huge' />
            </span>
          </ReqoreControlGroup>
          {/* Images are never haloed by the global default. */}
          <ReqoreIcon
            image='https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4'
            size='huge'
            intent='info'
          />
        </ReqoreControlGroup>
      </ReqorePanel>
    </ReqoreUIProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'With `glowingIcons: true`, an icon that has no colour of its own — it paints via inherited `currentColor` (a button glyph, an icon inside a coloured container) — now glows that *painted* colour, read off the mounted element. Shades of white/near-black are skipped (a white halo reads as a grey smudge), and image icons are never haloed.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Alpha of the resolved OKLCH glow. `NaN` when there's no drop-shadow at all;
    // a fully-opaque alpha (1) is omitted by the browser, so a present-but-alpha-
    // less drop-shadow counts as 1.
    const alphaOf = (el: HTMLElement) => {
      const f = getComputedStyle(el).filter;
      if (!f.includes('drop-shadow')) return NaN;
      const m = f.match(/\/\s*([0-9.]+)\s*\)/);
      return m ? parseFloat(m[1]) : 1;
    };
    await waitFor(() => {
      // A vivid inherited-colour icon glows (chroma keyed → alpha > 0)...
      const blue = canvasElement.querySelector('[data-testid="inherited-glow"]') as HTMLElement;
      expect(alphaOf(blue)).toBeGreaterThan(0);
      // ...coloured button glyphs (light-but-saturated) glow too, but the neutral
      // white 'Solid' glyph (near-zero chroma) does not.
      const btnAlphas = (
        Array.from(canvasElement.querySelectorAll('.reqore-button .reqore-icon')) as HTMLElement[]
      ).map(alphaOf);
      expect(btnAlphas.filter((a) => a > 0).length).toBeGreaterThanOrEqual(2);
      expect(btnAlphas[btnAlphas.length - 1]).toBeLessThan(0.05);
    });
  },
};
