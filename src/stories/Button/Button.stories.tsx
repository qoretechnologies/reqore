import { expect } from '@storybook/jest';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import ReqoreButton from '../../components/Button';
import { IReqoreTheme } from '../../constants/theme';
import { IReqoreUIProviderProps } from '../../containers/UIProvider';
import { ReqoreContent, ReqoreLayoutContent, ReqorePopover, ReqoreUIProvider } from '../../index';
import { buildTemplate } from '../utils';

export default {
  title: 'Button',
  argTypes: {
    onClick: { action: true },
  },
  parameters: {
    jest: ['button.test.tsx'],
  },
} as ComponentMeta<typeof ReqoreButton>;

const Template: ComponentStory<typeof ReqoreUIProvider> = ({
  onClick,
  ...args
}: IReqoreUIProviderProps & any) => {
  console.log(args.theme);
  return (
    <ReqoreUIProvider {...args} theme={{ main: args.theme }}>
      <ReqoreLayoutContent>
        <ReqoreContent style={{ padding: '20px' }}>
          <h4>Default</h4>
          <ReqoreButton onClick={onClick} data-testid='test'>
            Click me
          </ReqoreButton>
          <h4>Tiny</h4>
          <ReqoreButton size='tiny'>Button</ReqoreButton>
          <h4>Small</h4>
          <ReqoreButton size='small'>Button</ReqoreButton>
          <h4>Big</h4>
          <ReqoreButton size='big'>Button</ReqoreButton>
          <h4>Huge</h4>
          <ReqoreButton size='huge'>Huge</ReqoreButton>

          <h2>With icons</h2>
          <h4>Default</h4>
          <ReqoreButton icon='4KLine'>Button</ReqoreButton>
          <h4>Small</h4>
          <ReqoreButton icon='24HoursFill' size='small'>
            Button
          </ReqoreButton>
          <h4>Big</h4>
          <ReqoreButton icon='BallPenFill' size='big'>
            Button
          </ReqoreButton>
          <h4>Right icons</h4>
          <ReqoreButton rightIcon='BallPenFill' size='big'>
            Button
          </ReqoreButton>
          <ReqoreButton icon='24HoursLine' rightIcon='BallPenFill' size='big' />
          <ReqoreButton icon='24HoursLine' rightIcon='BallPenFill' size='big'>
            {' '}
            HMmmmmmm{' '}
          </ReqoreButton>

          <h2>Active</h2>
          <h4>Default</h4>
          <ReqoreButton icon='4KLine' active>
            Button
          </ReqoreButton>
          <h4>Minimal</h4>
          <ReqoreButton icon='24HoursFill' size='small' active minimal>
            Button
          </ReqoreButton>

          <h4>With intents</h4>
          <ReqoreButton icon='BallPenFill' size='big' intent='pending' active>
            Button
          </ReqoreButton>
          <br />
          <ReqoreButton icon='BallPenFill' size='big' intent='info' active>
            Button
          </ReqoreButton>

          <h2>Only icons</h2>
          <h4>Default</h4>
          <ReqoreButton icon='4KLine'></ReqoreButton>
          <h4>Small</h4>
          <ReqoreButton icon='24HoursFill' size='small'></ReqoreButton>
          <h4>Big</h4>
          <ReqoreButton icon='BallPenFill' size='big'></ReqoreButton>
          <h2>Minimal</h2>
          <h4>Default</h4>
          <ReqoreButton minimal>Minimal</ReqoreButton>
          <h4>Small only icon</h4>
          <ReqoreButton icon='24HoursFill' size='small' minimal></ReqoreButton>
          <h4>Big with icon</h4>
          <ReqoreButton icon='BallPenFill' size='big' minimal>
            Big button
          </ReqoreButton>
          <h2>Disabled</h2>
          <h4>Minimal</h4>
          <ReqoreButton minimal disabled>
            Minimal
          </ReqoreButton>
          <h4>Small only icon</h4>
          <ReqoreButton icon='24HoursFill' size='small' disabled></ReqoreButton>
          <h4>Big with icon</h4>
          <ReqoreButton icon='BallPenFill' size='big' disabled>
            Big button
          </ReqoreButton>
          <h2>With tooltip</h2>
          <h4>Basic tooltip</h4>
          <ReqoreButton minimal tooltip='I am a minimal button'>
            Minimal
          </ReqoreButton>
          <h4>Basic tooltip & onlick popover</h4>
          <ReqorePopover
            component={ReqoreButton}
            componentProps={{
              icon: 'BallPenFill',
              tooltip: 'Hey',
            }}
            content='Hello'
            handler='click'
            isReqoreComponent
          >
            Click for more
          </ReqorePopover>
          <h4>With intents</h4>
          <ReqoreButton intent='info'>Info</ReqoreButton>
          <br />
          <ReqoreButton intent='success' icon='CheckDoubleLine'>
            Success
          </ReqoreButton>
          <br />
          <ReqoreButton intent='pending'>Pending</ReqoreButton>
          <br />
          <ReqoreButton intent='warning'>Warning</ReqoreButton>
          <br />
          <ReqoreButton intent='danger'>Danger</ReqoreButton>
          <br />

          <ReqoreButton intent='info' minimal>
            Info
          </ReqoreButton>
          <br />
          <ReqoreButton intent='success' minimal>
            Success
          </ReqoreButton>
          <br />
          <ReqoreButton intent='pending' minimal>
            Pending
          </ReqoreButton>
          <br />
          <ReqoreButton intent='warning' minimal>
            Warning
          </ReqoreButton>
          <br />
          <ReqoreButton intent='danger' minimal>
            Danger
          </ReqoreButton>
          <h4>Flat</h4>
          <ReqoreButton flat>Info</ReqoreButton>
          <br />
          <ReqoreButton intent='info' flat>
            Info
          </ReqoreButton>
          <br />
          <ReqoreButton icon='User2Line' flat intent='warning'>
            Info
          </ReqoreButton>
          <h4>Custom color</h4>
          <ReqoreButton flat customTheme={{ main: '#ff0000' }}>
            Red
          </ReqoreButton>
          <br />
          <ReqoreButton flat customTheme={{ main: '#000000' }}>
            Black
          </ReqoreButton>
          <br />
          <ReqoreButton flat customTheme={{ main: '#0000ff' }}>
            Blue
          </ReqoreButton>
          <br />
          <ReqoreButton customTheme={{ main: '#00ff00' }} minimal>
            Green minimal active
          </ReqoreButton>
        </ReqoreContent>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Basic = Template.bind({});

export const LightColor = buildTemplate<IReqoreUIProviderProps>(Template, {
  theme: '#ffffff',
});

export const CustomColor = Template.bind({});
CustomColor.args = {
  theme: {
    main: '#0d0221',
    text: {
      color: '#2de2e6',
    },
  },
};

export const CustomIntentColors = Template.bind({});
CustomIntentColors.args = {
  theme: {
    main: '#0d0221',
    intents: {
      success: '#eb98cf',
      pending: '#636363',
      warning: '#15057a',
    },
  } as IReqoreTheme,
};

Basic.play = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByTestId('test'));
  await expect(args.onClick).toHaveBeenCalled();
};
