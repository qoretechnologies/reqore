import { IReqoreBreadcrumbItem, IReqoreBreadcrumbItemTabs } from '../components/Breadcrumbs';
import { Icons } from './icons';

export default [
  {
    label: 'Dashboard',
    icon: Icons.Dashboard,
    tooltip: 'Dashboard',
    active: true,
  },
  {
    label: 'Workflows',
    icon: Icons.Workflow,
    tooltip: 'Opens in a new window',
    as: 'a',
    props: {
      href: 'https://google.com',
    },
  },
  {
    label: 'Services',
    icon: Icons.Services,
    tooltip: 'Services',
  },
  {
    label: 'Jobs',
    icon: Icons.Jobs,
    customTheme: '#a9a9a9',
  },
  {
    tooltip: 'Connections',
    icon: Icons.Connections,
    customTheme: '#a9a9a9',
  },
] as IReqoreBreadcrumbItem[];

export const breadcrumbsTabs = {
  withTabs: {
    tabs: [
      {
        label: 'RBAC',
        icon: Icons.RBAC,
        id: 'rbac',
      },
      {
        label: 'Value Maps',
        icon: Icons.Valuemaps,
        id: 'valuemaps',
      },
      {
        label: 'SLAs',
        icon: Icons.SLAs,
        id: 'sla',
      },
      {
        label: 'Releases',
        icon: Icons.Releases,
        id: 'releases',
      },
      {
        label: 'Errors',
        icon: Icons.Errors,
        id: 'errors',
      },
    ],
  } as IReqoreBreadcrumbItemTabs,
} as IReqoreBreadcrumbItem;
