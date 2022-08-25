import { ComponentStory } from '@storybook/react';

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
