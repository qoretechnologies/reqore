import { TReqoreMultiSelectItem } from '../components/MultiSelect';

export const MultiSelectItems: TReqoreMultiSelectItem[] = [
  {
    label: 'Existing item 1',
    value: 'Existing item 1',
    icon: 'SunCloudyLine',
  },
  {
    label: 'Existing item 2',
    value: 'Existing item 2',
    icon: 'BatteryChargeFill',
  },
  {
    label: 'Existing item 3',
    value: 'Existing item 3',
    icon: 'DropboxFill',
    intent: 'info',
    rightIcon: 'ArrowRightLine',
  },
  {
    label: 'Existing item 4',
    value: 'Existing item 4',
    icon: 'PagesLine',
    effect: { gradient: { colors: { 0: 'success', 100: 'info:darken:1' } } },
  },
  {
    disabled: true,
    label: 'Disabled item',
    value: 'Disabled item',
    icon: 'StopCircleLine',
  },
  {
    minimal: true,
    label: 'Minimal item',
    value: 'Minimal item',
    icon: 'StopCircleLine',
  },
  {
    divider: true,
    icon: 'CheckDoubleLine',
  },
  {
    value: 'itemWithNoLabel',
    icon: 'TakeawayLine',
    actions: [
      {
        icon: 'ArrowLeftUpFill',
        onClick: () => console.log('clicked'),
        intent: 'pending',
      },
    ],
  },
  {
    label: 'Other Item 1',
    value: 'Other Item 1',
    icon: 'MapFill',
  },
  {
    label: 'Other Item 2',
    value: 'Other Item 2',
    icon: 'ArrowLeftUpFill',
  },
  {
    label: 'Other Item 3',
    value: 'Other Item 3',
    icon: 'MicLine',
  },
];
