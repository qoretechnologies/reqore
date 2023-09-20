import { ComponentStory, Meta, StoryFn } from '@storybook/react';
import { IReqoreUIProviderProps } from '../containers/UIProvider';
import { IReqorePagingOptions } from '../hooks/usePaging';
import { TestTableItem } from '../mock/tableData';

/**
 * It takes a template function and an object of properties, and returns a new function that has the
 * properties bound to it
 * @param template - The template function that you want to bind the props to.
 * @param {T} props - The props that will be passed to the template.
 * @returns A function that is bound to an empty object.
 */
export const buildTemplate = <T, C>(
  template: ComponentStory<React.FC<T>>,
  props?: Partial<T> & C
) => {
  const result = template.bind({});
  result.args = props as any;
  return result;
};

export type AdditionalStorybookArgs = IReqoreUIProviderProps & {
  otherThemeOptions?: IReqoreUIProviderProps['theme'];
  multipleColumns?: boolean;
  confirm?: boolean;
  notificationId?: string;
  pagingOptions?: Partial<IReqorePagingOptions<TestTableItem>>;
  insideModal?: boolean;
  animatedButtons?: IReqoreUIProviderProps['options']['animations']['buttons'];
  animatedDialogs?: IReqoreUIProviderProps['options']['animations']['dialogs'];
  globalUiScale?: IReqoreUIProviderProps['options']['uiScale'];
};

export type StoryMeta<
  Component extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
  AdditionalArgs = {}
> = Meta<React.ComponentProps<Component> & AdditionalArgs & AdditionalStorybookArgs>;

export type StoryRenderer<T> = StoryFn<T & AdditionalStorybookArgs>;
