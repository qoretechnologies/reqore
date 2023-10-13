import { noop } from 'lodash';
import { IReqoreBreadcrumbItem, IReqoreBreadcrumbItemTabs } from '../components/Breadcrumbs';
import { ReqoreH3 } from '../components/Header';
import { Icons } from './icons';

export default [
  {
    label: 'Dashboard',
    icon: Icons.Dashboard,
    tooltip: 'Dashboard',
    active: true,
  },
  {
    label: 'Workflows as Link',
    tooltip: 'Opens in a new window',
    as: 'a',
    props: {
      href: 'https://google.com',
    },
    leftIconProps: {
      image:
        'https://avatars.githubusercontent.com/u/44835090?s=400&u=371120ce0755102d2e432f11ad9aa0378c871b45&v=4',
    },
    flat: false,
    intent: 'info',
    effect: {
      glow: {
        color: 'info',
        size: 1,
        blur: 10,
        when: 'hover',
      },
    },
  },
  {
    icon: Icons.Services,
    tooltip: 'Services as H3',
    as: ReqoreH3,
    label: 'Services as H3',
    props: {
      onClick: noop,
    },
  },
  {
    label: 'Jobs',
    icon: Icons.Jobs,
    customTheme: { main: '#a9a9a9' },
    badge: 10,
    description: 'Some item description',
    intent: 'warning',
    minimal: false,
  },
  {
    tooltip: 'Connections',
    icon: Icons.Connections,
    customTheme: { main: 'danger:darken' },
  },
] satisfies IReqoreBreadcrumbItem[];

export const breadcrumbsTabs = {
  withTabs: {
    activeTab: 'valuemaps',
    onTabChange(tabId) {
      console.log('🚀 ~ file: breadcrumbs.ts ~ line 46 ~ onTabChange ~ tabId', tabId);
    },
    tabs: [
      {
        label: 'RBAC',
        icon: Icons.RBAC,
        id: 'rbac',
        props: {
          onClick() {
            console.log('rbac');
          },
        },
      },
      {
        label: 'Value Maps',
        icon: Icons.Valuemaps,
        id: 'valuemaps',
        onCloseClick(id) {
          console.log('🚀 ~ file: breadcrumbs.ts ~ line 54 ~ onCloseClick ~ id', id);
        },
        intent: 'success',
      },
      {
        label: 'SLAs',
        icon: Icons.SLAs,
        id: 'sla',
        intent: 'danger',
      },
      {
        label: 'Releases',
        icon: Icons.Releases,
        id: 'releases',
        tooltip: {
          content: 'Releases',
        },
      },
      {
        label: 'Errors',
        icon: Icons.Errors,
        id: 'errors',
        props: {
          onClick() {
            console.log('errors');
          },
        },
      },
    ],
  } as IReqoreBreadcrumbItemTabs,
} as IReqoreBreadcrumbItem;
