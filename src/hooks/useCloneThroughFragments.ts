import React, { useCallback } from 'react';

export const useCloneThroughFragments = (
  propsMapper: (
    props: Record<string | number, any>,
    reactIndex: number,
    realIndex: number
  ) => Record<string | number, any>,
  deps?: any[]
) => {
  let realIndex = 0;

  const clone = useCallback((children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child, reactIndex) => {
      if (child && React.isValidElement(child)) {
        if (child.type === React.Fragment) {
          return clone(child.props.children);
        }

        const props = propsMapper(child.props, reactIndex, realIndex);

        /*
         * Because of the way React.Children.map works, we have to
         * manually decrement the index for every child that is `null`
         * because react maps through null children and returns them in `Count`
         * We filter these children out in the `realChildCount` variable,
         * but the index is still incremented
         * */
        realIndex = realIndex + 1;

        return React.cloneElement(child, props);
      }

      return child;
    });
  }, deps);

  return { clone };
};
