import { StoryFn, StoryObj } from '@storybook/react';
import { IReqoreTabsProps } from '../../components/Tabs';
import { ReqoreH3, ReqoreTabs, ReqoreTabsContent } from '../../index';
import { StoryMeta } from '../utils';
import { IntentArg, SizeArg, argManager } from '../utils/args';

const tabs = [
  {
    label: 'Tab 1',
    id: 'tab1',
    icon: 'Home3Line',
    tooltip: 'Hooooooome!',
    badge: 5,
  },
  {
    label: 'Tab 2',
    id: 'tab2',
    icon: 'Settings6Line',
    as: 'a',
    props: {
      href: 'https://google.com',
    },
    badge: {
      rightIcon: 'ExternalLinkLine',
      label: 'Link',
      intent: 'info',
    },
  },
  {
    label: 'Really long tab name with tooltip',
    id: 3,
    icon: 'FileSettingsLine',
    tooltip: 'Click to go to page 3!',
    iconColor: 'info:lighten:3',
  },
  {
    id: 'tab4',
    icon: 'LightbulbLine',
    intent: 'success',
    onCloseClick: (id) => {
      alert(`${id} close click`);
    },
    closeIcon: 'DeleteBinFill',
  },
  {
    label: 'Tab 5',
    id: 'tab5',
    icon: 'Polaroid2Line',
    disabled: true,
    onCloseClick: (id) => {
      alert(`${id} close click`);
    },
  },
  {
    label: 'Lorem Ipsum',
    id: 'tab6',
    icon: 'DragMoveLine',
    intent: 'danger',
  },
  {
    label: 'Hey I am another long tab',
    id: 'tab7',
    icon: 'LeafFill',
    onCloseClick: (id) => {
      alert(`${id} close click`);
    },
    customTheme: {
      main: '#00e3e8',
    },
  },
  {
    label: 'With Effect',
    id: 'tab8',
    icon: 'MapPin3Line',
    flat: false,
    effect: {
      gradient: {
        colors: {
          0: 'info',
          100: 'danger',
        },
      },
    },
  },
  {
    label: 'With another effect',
    id: 'tab9',
    icon: 'EjectLine',
    effect: {
      glow: {
        color: 'warning',
        blur: 16,
        size: -5,
      },
      spaced: 3,
      uppercase: true,
      weight: 'thick',
      textSize: 'small',
    },
  },
] satisfies IReqoreTabsProps['tabs'];

const { createArg } = argManager<IReqoreTabsProps>();

const meta = {
  title: 'Navigation/Tabs/Stories',
  component: ReqoreTabs,
  args: {
    flat: true,
    fill: false,
    fillParent: false,
    wrapTabNames: false,
    vertical: false,
  },
  argTypes: {
    ...SizeArg,
    ...IntentArg,
    ...createArg('flat', {
      type: 'boolean',
      name: 'Flat',
      description: 'Whether the tabs should be flat or not',
    }),
    ...createArg('fill', {
      type: 'boolean',
      name: 'Fill',
      description: 'If the tabs should fill the container',
    }),
    ...createArg('fillParent', {
      type: 'boolean',
      name: 'Fill Parent',
      description: 'If the tabs should fill the parent container',
    }),
    ...createArg('wrapTabNames', {
      type: 'boolean',
      name: 'Wrap Tab Names',
      description: 'If the tab names should wrap',
    }),
    ...createArg('vertical', {
      type: 'boolean',
      name: 'Vertical',
      description: 'If the tabs should be vertical',
    }),
  },
} as StoryMeta<typeof ReqoreTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const Template: StoryFn<IReqoreTabsProps> = (args) => {
  return (
    <ReqoreTabs {...args} tabs={tabs}>
      <ReqoreTabsContent tabId='tab1'>
        <ReqoreH3>Tab 1</ReqoreH3>
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId='tab2'>
        <ReqoreH3>Tab 2</ReqoreH3>
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId={3} padded='vertical'>
        <ReqoreH3>Tab 3</ReqoreH3>
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId='tab4'>
        <ReqoreH3>Tab 4</ReqoreH3>
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId='tab5'>
        <ReqoreH3>Tab 5</ReqoreH3>
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId='tab6'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae nisi ligula. Proin
        laoreet vitae risus sed pretium. Sed eu elit non tortor congue molestie vel ut elit. Duis id
        turpis tincidunt libero accumsan cursus. Quisque urna nibh, tempor ac lorem sed, dapibus
        ornare arcu. Vestibulum at nunc tempus, ultricies justo eget, luctus turpis. Curabitur et
        sapien in est rhoncus suscipit vitae id purus. Cras malesuada, metus vitae vulputate ornare,
        ligula ipsum fringilla ligula, a cursus tortor ligula semper sem. Praesent fringilla dui
        volutpat elementum ultrices. Nam rutrum, augue finibus tempus auctor, eros metus iaculis
        neque, at vehicula ante quam et metus. Etiam quis commodo nunc. Aenean rhoncus, mi ac
        tincidunt efficitur, nisl nunc tempor ipsum, accumsan eleifend felis nisl vitae diam. Nunc
        vitae dapibus nisi. Donec cursus vitae justo ut interdum. Suspendisse mattis, erat vel
        molestie faucibus, tortor neque mollis erat, vulputate aliquet tortor nulla eu diam. Ut eget
        fringilla sapien. Vivamus ut leo in tellus ultrices lacinia non vel lorem. Sed imperdiet
        sapien ut odio sagittis gravida nec vel lacus. Morbi euismod libero sed tristique
        condimentum. Nullam id erat justo. Ut in justo turpis. Nam eleifend tincidunt lacinia. Duis
        non lacinia purus. Mauris accumsan nunc nulla, at consectetur odio pharetra eu. Phasellus
        non massa maximus, placerat velit eget, porta ante. Sed porttitor arcu orci, vitae
        vestibulum odio blandit et. Fusce fringilla ipsum eu ante venenatis dapibus. Morbi ornare
        ultricies risus ut ullamcorper. Curabitur feugiat enim libero, non commodo nibh facilisis
        nec. Integer suscipit quis ligula a porta. Mauris eget odio tincidunt, fermentum tellus non,
        tincidunt tellus. Aliquam erat volutpat. Ut metus libero, facilisis quis est nec, auctor
        finibus justo. Quisque scelerisque placerat mi ac ullamcorper. Aenean vestibulum lorem id
        elit blandit, id viverra tortor fringilla. Vivamus consectetur sodales mauris, in semper
        tellus dapibus vitae. Donec eget sapien in eros accumsan vestibulum. Praesent nec purus
        libero. Aliquam maximus sem ac quam gravida, eu fermentum quam varius. In quam augue, rutrum
        maximus posuere non, molestie ut arcu. Sed pretium rhoncus ullamcorper. Praesent quis purus
        ac dolor tincidunt porttitor eget vitae felis. Sed posuere tellus eu ex dignissim porta.
        Nullam in molestie nisl. Class aptent taciti sociosqu ad litora torquent per conubia nostra,
        per inceptos himenaeos. Proin et varius justo, in faucibus diam. Aenean arcu ex, gravida
        vitae nunc nec, tincidunt venenatis sapien. Duis congue pulvinar ipsum. Integer maximus
        felis mattis ipsum vestibulum lacinia. Maecenas tortor risus, malesuada a est at, lobortis
        tempus tellus. Quisque commodo velit id nisi viverra, non dignissim turpis tristique.
        Suspendisse felis est, fringilla non pellentesque sit amet, varius quis sem. In non velit
        massa. Aenean at porttitor est. Sed viverra eleifend cursus. Ut nec justo porttitor,
        sollicitudin nisl ac, malesuada leo. Morbi consequat ornare suscipit. Maecenas eleifend quam
        sagittis tortor volutpat porttitor. Vivamus dictum ex id finibus tristique. Nulla rutrum,
        ante sagittis molestie aliquet, lectus quam condimentum nisl, a convallis mauris massa sed
        risus. Curabitur ac suscipit dolor, nec dapibus justo. Pellentesque nec sollicitudin sapien.
        Ut metus neque, volutpat eu est eu, iaculis suscipit augue. Fusce blandit magna tincidunt
        turpis semper venenatis. Nullam sit amet accumsan massa. Donec interdum ut dui nec varius.
        Pellentesque ut tellus sit amet tellus mollis consectetur. Aenean aliquam leo elit. Nullam
        convallis felis et rhoncus fermentum. Nunc rutrum nulla sed nisl efficitur laoreet.
        Suspendisse potenti. Sed vitae consequat tellus. Vestibulum in eros at turpis pretium
        rutrum. Phasellus commodo commodo libero, eu volutpat nunc tempus nec. Donec tempus
        dignissim lectus, quis molestie quam dignissim a. Cras eget mauris id libero suscipit
        consequat. Nulla facilisi. Donec arcu arcu, venenatis quis mattis quis, pretium nec justo.
        Praesent aliquet tortor in nulla pellentesque, condimentum congue sapien laoreet. Nullam
        semper consectetur feugiat. Nunc a orci non leo malesuada aliquam eu eget tellus.
        Suspendisse potenti. Nam ornare ornare ullamcorper. Sed semper porttitor sem, eu vehicula
        purus egestas sit amet. Cras sit amet aliquet augue. Cras velit leo, pellentesque quis eros
        eu, feugiat gravida quam. Mauris in turpis nunc. Suspendisse varius urna quam, sit amet
        tempus sem tristique ut. Quisque at velit nec nibh varius tempor venenatis vel felis. Morbi
        velit sapien, facilisis ut odio quis, laoreet euismod magna. Quisque efficitur euismod diam,
        in ullamcorper sapien tristique vitae. Nullam ac volutpat quam. Morbi vulputate arcu nisl,
        et tempus dui tincidunt vel. Morbi finibus pretium pretium. Aliquam fermentum turpis sit
        amet est faucibus elementum ac quis sem. Maecenas scelerisque commodo magna eget blandit.
        Praesent vitae bibendum mauris, eu blandit dui.
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId='tab7'>
        <ReqoreH3>Tab 7</ReqoreH3>
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId='tab8'>
        <ReqoreH3>Tab 8</ReqoreH3>
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId='tab9'>
        <ReqoreH3>Tab 9</ReqoreH3>
      </ReqoreTabsContent>
    </ReqoreTabs>
  );
};

export const Basic: Story = {
  render: Template,
};

export const Fill: Story = {
  render: Template,

  args: {
    fill: true,
  },
};

export const CustomActiveIntent: Story = {
  render: Template,

  args: {
    activeTabIntent: 'warning',
    activeTab: 'tab8',
  },
};

export const NotFlat: Story = {
  render: Template,

  args: {
    flat: false,
  },
};

export const WithPadding: Story = {
  render: Template,

  args: {
    padded: true,
  },
};

export const Vertical: Story = {
  render: Template,

  args: {
    vertical: true,
    fillParent: true,
  },
};

export const VerticalNoTabsPadding: Story = {
  render: Template,

  args: {
    padded: false,
    vertical: true,
  },
};

export const VerticalWithWrapping: Story = {
  render: Template,

  args: {
    vertical: true,
    fillParent: true,
    wrapTabNames: true,
  },
};

export const VerticalCustomWidth: Story = {
  render: Template,

  args: {
    vertical: true,
    fillParent: true,
    width: '300px',
  },
};

export const CustomTabsPadding: Story = {
  render: Template,

  args: {
    tabsPadding: 'none',
  },
};
