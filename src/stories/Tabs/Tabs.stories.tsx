import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { ReqoreFooter } from '../../components/Navbar';
import { IReqoreTabsListItem, IReqoreTabsProps } from '../../components/Tabs';
import { IReqoreTheme } from '../../constants/theme';
import {
  ReqoreContent,
  ReqoreHeader,
  ReqoreLayoutContent,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreUIProvider,
} from '../../index';

const tabs = {
  tabs: [
    {
      label: 'Tab 1',
      id: 'tab1',
      icon: 'Home3Line',
      tooltip: 'Hooooooome!',
    },
    {
      label: 'Tab 2',
      id: 'tab2',
      icon: 'Settings6Line',
      as: 'a',
      props: {
        href: 'https://google.com',
      },
    },
    {
      label: 'Really long tab name with tooltip',
      id: 'tab3',
      icon: 'FileSettingsLine',
      tooltip: 'Click to go to page 3!',
    },
    {
      id: 'tab4',
      icon: 'LightbulbLine',
      onCloseClick: (id) => {
        alert(`${id} close click`);
      },
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
    },
    {
      label: 'Hey I am another long tab',
      id: 'tab7',
      icon: 'LeafFill',
      onCloseClick: (id) => {
        alert(`${id} close click`);
      },
    },
    {
      label: 'Tab 8',
      id: 'tab8',
      icon: 'MapPin3Line',
    },
    {
      label: 'Tab 9',
      id: 'tab9',
      icon: 'EjectLine',
    },
  ] as IReqoreTabsListItem[],
  children: <p>Test</p>,
} as IReqoreTabsProps;

export default {
  title: 'ReQore/Tabs',
  args: {
    theme: {
      main: '#ffffff',
    },
    tabs,
  },
} as Meta;

const Template: Story<{
  theme: IReqoreTheme;
  tabs: IReqoreTabsProps;
}> = ({ theme, tabs }: { theme: IReqoreTheme; tabs: IReqoreTabsProps }) => {
  return (
    <ReqoreUIProvider theme={theme}>
      <ReqoreLayoutContent>
        <ReqoreHeader></ReqoreHeader>
        <ReqoreContent>
          <ReqoreTabs {...tabs} activeTabIntent='info'>
            <ReqoreTabsContent id='tab1'>
              <h3>Tab 1</h3>
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab2'>
              <h3>Tab 2</h3>
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab3'>
              <h3>Tab 3</h3>
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab4'>
              <h3>Tab 4</h3>
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab5'>
              <h3>Tab 5</h3>
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab6'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
              vitae nisi ligula. Proin laoreet vitae risus sed pretium. Sed eu
              elit non tortor congue molestie vel ut elit. Duis id turpis
              tincidunt libero accumsan cursus. Quisque urna nibh, tempor ac
              lorem sed, dapibus ornare arcu. Vestibulum at nunc tempus,
              ultricies justo eget, luctus turpis. Curabitur et sapien in est
              rhoncus suscipit vitae id purus. Cras malesuada, metus vitae
              vulputate ornare, ligula ipsum fringilla ligula, a cursus tortor
              ligula semper sem. Praesent fringilla dui volutpat elementum
              ultrices. Nam rutrum, augue finibus tempus auctor, eros metus
              iaculis neque, at vehicula ante quam et metus. Etiam quis commodo
              nunc. Aenean rhoncus, mi ac tincidunt efficitur, nisl nunc tempor
              ipsum, accumsan eleifend felis nisl vitae diam. Nunc vitae dapibus
              nisi. Donec cursus vitae justo ut interdum. Suspendisse mattis,
              erat vel molestie faucibus, tortor neque mollis erat, vulputate
              aliquet tortor nulla eu diam. Ut eget fringilla sapien. Vivamus ut
              leo in tellus ultrices lacinia non vel lorem. Sed imperdiet sapien
              ut odio sagittis gravida nec vel lacus. Morbi euismod libero sed
              tristique condimentum. Nullam id erat justo. Ut in justo turpis.
              Nam eleifend tincidunt lacinia. Duis non lacinia purus. Mauris
              accumsan nunc nulla, at consectetur odio pharetra eu. Phasellus
              non massa maximus, placerat velit eget, porta ante. Sed porttitor
              arcu orci, vitae vestibulum odio blandit et. Fusce fringilla ipsum
              eu ante venenatis dapibus. Morbi ornare ultricies risus ut
              ullamcorper. Curabitur feugiat enim libero, non commodo nibh
              facilisis nec. Integer suscipit quis ligula a porta. Mauris eget
              odio tincidunt, fermentum tellus non, tincidunt tellus. Aliquam
              erat volutpat. Ut metus libero, facilisis quis est nec, auctor
              finibus justo. Quisque scelerisque placerat mi ac ullamcorper.
              Aenean vestibulum lorem id elit blandit, id viverra tortor
              fringilla. Vivamus consectetur sodales mauris, in semper tellus
              dapibus vitae. Donec eget sapien in eros accumsan vestibulum.
              Praesent nec purus libero. Aliquam maximus sem ac quam gravida, eu
              fermentum quam varius. In quam augue, rutrum maximus posuere non,
              molestie ut arcu. Sed pretium rhoncus ullamcorper. Praesent quis
              purus ac dolor tincidunt porttitor eget vitae felis. Sed posuere
              tellus eu ex dignissim porta. Nullam in molestie nisl. Class
              aptent taciti sociosqu ad litora torquent per conubia nostra, per
              inceptos himenaeos. Proin et varius justo, in faucibus diam.
              Aenean arcu ex, gravida vitae nunc nec, tincidunt venenatis
              sapien. Duis congue pulvinar ipsum. Integer maximus felis mattis
              ipsum vestibulum lacinia. Maecenas tortor risus, malesuada a est
              at, lobortis tempus tellus. Quisque commodo velit id nisi viverra,
              non dignissim turpis tristique. Suspendisse felis est, fringilla
              non pellentesque sit amet, varius quis sem. In non velit massa.
              Aenean at porttitor est. Sed viverra eleifend cursus. Ut nec justo
              porttitor, sollicitudin nisl ac, malesuada leo. Morbi consequat
              ornare suscipit. Maecenas eleifend quam sagittis tortor volutpat
              porttitor. Vivamus dictum ex id finibus tristique. Nulla rutrum,
              ante sagittis molestie aliquet, lectus quam condimentum nisl, a
              convallis mauris massa sed risus. Curabitur ac suscipit dolor, nec
              dapibus justo. Pellentesque nec sollicitudin sapien. Ut metus
              neque, volutpat eu est eu, iaculis suscipit augue. Fusce blandit
              magna tincidunt turpis semper venenatis. Nullam sit amet accumsan
              massa. Donec interdum ut dui nec varius. Pellentesque ut tellus
              sit amet tellus mollis consectetur. Aenean aliquam leo elit.
              Nullam convallis felis et rhoncus fermentum. Nunc rutrum nulla sed
              nisl efficitur laoreet. Suspendisse potenti. Sed vitae consequat
              tellus. Vestibulum in eros at turpis pretium rutrum. Phasellus
              commodo commodo libero, eu volutpat nunc tempus nec. Donec tempus
              dignissim lectus, quis molestie quam dignissim a. Cras eget mauris
              id libero suscipit consequat. Nulla facilisi. Donec arcu arcu,
              venenatis quis mattis quis, pretium nec justo. Praesent aliquet
              tortor in nulla pellentesque, condimentum congue sapien laoreet.
              Nullam semper consectetur feugiat. Nunc a orci non leo malesuada
              aliquam eu eget tellus. Suspendisse potenti. Nam ornare ornare
              ullamcorper. Sed semper porttitor sem, eu vehicula purus egestas
              sit amet. Cras sit amet aliquet augue. Cras velit leo,
              pellentesque quis eros eu, feugiat gravida quam. Mauris in turpis
              nunc. Suspendisse varius urna quam, sit amet tempus sem tristique
              ut. Quisque at velit nec nibh varius tempor venenatis vel felis.
              Morbi velit sapien, facilisis ut odio quis, laoreet euismod magna.
              Quisque efficitur euismod diam, in ullamcorper sapien tristique
              vitae. Nullam ac volutpat quam. Morbi vulputate arcu nisl, et
              tempus dui tincidunt vel. Morbi finibus pretium pretium. Aliquam
              fermentum turpis sit amet est faucibus elementum ac quis sem.
              Maecenas scelerisque commodo magna eget blandit. Praesent vitae
              bibendum mauris, eu blandit dui.
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab7'>
              <h3>Tab 7</h3>
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab8'>
              <h3>Tab 8</h3>
            </ReqoreTabsContent>
            <ReqoreTabsContent id='tab9'>
              <h3>Tab 9</h3>
            </ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreContent>
        <ReqoreFooter></ReqoreFooter>
      </ReqoreLayoutContent>
    </ReqoreUIProvider>
  );
};

export const Default = Template.bind({});
export const Fill = Template.bind({});
Fill.args = {
  tabs: {
    ...tabs,
    fill: true,
  },
};

export const Vertical = Template.bind({});
Vertical.args = {
  tabs: {
    ...tabs,
    vertical: true,
  },
};

export const VerticalFill = Template.bind({});
VerticalFill.args = {
  tabs: {
    ...tabs,
    vertical: true,
    fill: true,
  },
};

export const Dark = Template.bind({});
Dark.args = {
  theme: {
    main: '#222222',
  },
};

export const CustomMainColor = Template.bind({});
CustomMainColor.args = {
  theme: {
    main: '#194d5d',
  },
};
