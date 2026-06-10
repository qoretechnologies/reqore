import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import ReqoreControlGroup from '../../components/ControlGroup';
import { ReqoreIconPicker } from '../../components/IconPicker';
import { IReqoreIconName } from '../../types/icons';
import { StoryMeta } from '../utils';

const meta = {
  title: 'Form/Icon Picker',
  component: ReqoreIconPicker,
} as StoryMeta<typeof ReqoreIconPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    onPick: (icon) => console.log('Picked', icon),
  },
};

export const Controlled: Story = {
  render: () => {
    const [icon, setIcon] = useState<IReqoreIconName>('SunLine');

    return <ReqoreIconPicker value={icon} onPick={setIcon} />;
  },
};

export const Inline: Story = {
  args: {
    inline: true,
    onPick: (icon) => console.log('Picked', icon),
  },
};

export const InlineControlled: Story = {
  render: () => {
    const [icon, setIcon] = useState<IReqoreIconName>('SunLine');

    return <ReqoreIconPicker inline value={icon} onPick={setIcon} columns={10} />;
  },
};

export const InlineFluid: Story = {
  render: () => {
    const [icon, setIcon] = useState<IReqoreIconName>('SparklingLine');

    // `fluid` fills the parent width — the grid reflows to more columns and
    // the cells stretch to fill the available space.
    return (
      <div style={{ width: '100%' }}>
        <ReqoreIconPicker
          inline
          fluid
          value={icon}
          onPick={setIcon}
          selectedIconIntent='info'
        />
      </div>
    );
  },
};

export const InlineWithSelectedPreview: Story = {
  render: () => {
    const [icon, setIcon] = useState<IReqoreIconName>('Heart3Line');

    // The selected icon is previewed to the left of the filter input.
    return (
      <ReqoreIconPicker inline value={icon} onPick={setIcon} selectedIconIntent='success' />
    );
  },
};

export const InlineSelectedPreviewNoFilter: Story = {
  render: () => {
    const [icon, setIcon] = useState<IReqoreIconName>('StarLine');

    // Without a filter input the selected preview occupies the top row alone.
    return (
      <ReqoreIconPicker
        inline
        filterable={false}
        columns={6}
        value={icon}
        onPick={setIcon}
        selectedIconIntent='warning'
        icons={[
          'StarLine',
          'Heart3Line',
          'ThumbUpLine',
          'FireLine',
          'FlashlightLine',
          'MagicLine',
          'SparklingLine',
          'AwardLine',
          'MedalLine',
          'TrophyLine',
          'VipCrownLine',
          'BardLine',
        ]}
      />
    );
  },
};

export const InlineRestricted: Story = {
  args: {
    inline: true,
    filterable: false,
    columns: 5,
    icons: [
      'SunLine',
      'MoonLine',
      'CloudyLine',
      'RainyLine',
      'SnowyLine',
      'WindyLine',
      'ThunderstormsLine',
      'MistLine',
      'FoggyLine',
      'TornadoLine',
    ],
  },
};

export const Sizes: Story = {
  render: () => (
    <ReqoreControlGroup>
      <ReqoreIconPicker size='tiny' label='Tiny' />
      <ReqoreIconPicker size='small' label='Small' />
      <ReqoreIconPicker size='normal' label='Normal' />
      <ReqoreIconPicker size='big' label='Big' />
      <ReqoreIconPicker size='huge' label='Huge' />
    </ReqoreControlGroup>
  ),
};

export const Intents: Story = {
  render: () => (
    <ReqoreControlGroup>
      <ReqoreIconPicker intent='info' label='Info' />
      <ReqoreIconPicker intent='success' label='Success' />
      <ReqoreIconPicker intent='warning' label='Warning' />
      <ReqoreIconPicker intent='danger' label='Danger' />
    </ReqoreControlGroup>
  ),
};

export const Flat: Story = {
  args: {
    flat: true,
    label: 'Flat trigger',
  },
};

export const CustomColumns: Story = {
  args: {
    columns: 5,
    gridHeight: 260,
    label: '5-column grid',
    isDefaultOpen: true,
  },
};

export const RestrictedIcons: Story = {
  args: {
    label: 'Weather icons only',
    icons: [
      'SunLine',
      'MoonLine',
      'CloudyLine',
      'RainyLine',
      'SnowyLine',
      'WindyLine',
      'ThunderstormsLine',
      'MistLine',
      'FoggyLine',
      'TornadoLine',
    ],
    columns: 5,
    filterable: false,
    isDefaultOpen: true,
  },
};

export const NotFilterable: Story = {
  args: {
    label: 'No filter input',
    filterable: false,
    isDefaultOpen: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
};

export const Tooltip: Story = {
  args: {
    label: 'Hover me',
    tooltip: 'Pick an icon for this item',
  },
};

export const CustomTheme: Story = {
  args: {
    label: 'Custom theme',
    customTheme: { main: '#2c1a4d' },
    isDefaultOpen: true,
  },
};

export const FullyCustomized: Story = {
  args: {
    label: 'Customized parts',
    isDefaultOpen: true,
    buttonProps: { rightIcon: 'PaletteLine', effect: { gradient: { colors: 'info' } } },
    inputProps: { rounded: true, placeholder: 'Search the icon set...' },
    panelProps: { intent: 'info', rounded: true },
    iconButtonProps: { intent: 'info' },
    columns: 6,
  },
};

export const DefaultOpen: Story = {
  args: {
    label: 'Opened on mount',
    isDefaultOpen: true,
  },
};
