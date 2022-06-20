import { ComponentMeta, ComponentStory } from '@storybook/react';
import { IReqoreBreadcrumbItem, IReqoreBreadcrumbsProps } from '../../components/Breadcrumbs';
import { ReqoreBreadcrumbs } from '../../index';
import breadcrumbs, { breadcrumbsTabs } from '../../mock/breadcrumbs';
import { buildTemplate } from '../utils';

export default {
  title: 'Breadcrumbs',
  argTypes: {
    withTabs: {
      name: 'With tabs',
      defaultValue: false,
      description: 'Whether tabs should be shown alongside the breadcrumbs',
      control: 'boolean',
    },
  },
  args: {
    withTabs: false,
  },
  parameters: {
    jest: ['breadcrumbs.test.tsx'],
  },
} as ComponentMeta<typeof ReqoreBreadcrumbs & { withTabs?: boolean }>;

const Template: ComponentStory<typeof ReqoreBreadcrumbs & { withTabs?: boolean }> = (
  args: IReqoreBreadcrumbsProps & { withTabs?: boolean }
) => {
  const items = args.withTabs ? [...breadcrumbs, breadcrumbsTabs] : breadcrumbs;
  const customTheme = args.customTheme ? { main: args.customTheme } : undefined;

  return (
    <ReqoreBreadcrumbs
      {...args}
      items={items as IReqoreBreadcrumbItem[]}
      customTheme={customTheme as any}
    />
  );
};

export const Default = buildTemplate(Template);
export const WithTabs = buildTemplate(Template, { withTabs: true });
