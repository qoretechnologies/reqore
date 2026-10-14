import React, { useCallback, useMemo } from 'react';

export const useCloneThroughFragments = (
  propsMapper: (
    props: Record<string | number, any>,
    reactIndex: number,
    realIndex: number,
    childType: React.ReactElement['type']
  ) => Record<string | number, any>,
  deps?: any[]
) => {
  let realIndex = 0;

  const clone = useCallback((children: React.ReactNode): React.ReactNode => {
    /* The keys given at this level of the children. A child keeps its own key, so React keeps it
       (and its state) when another is added before it; a key given again is made unique (`#1`,
       `#2`, ...), as the place a control group joined to every key used to make it. Children keyed
       by what they say (a label, a name) can repeat it, and two children with one key are one to
       React: it warns, and on an update drops or repeats one of them. A fragment's children are
       keyed under the fragment, so each level counts its own. */
    const given = new Map<React.Key, number>();

    return React.Children.map(children, (child, reactIndex) => {
      if (child && React.isValidElement(child)) {
        if (child.type === React.Fragment) {
          return clone(child.props.children);
        }

        const props = propsMapper(child.props, reactIndex, realIndex, child.type);

        /*
         * Because of the way React.Children.map works, we have to
         * manually decrement the index for every child that is `null`
         * because react maps through null children and returns them in `Count`
         * We filter these children out in the `realChildCount` variable,
         * but the index is still incremented
         * */
        realIndex = realIndex + 1;

        // a key the mapper set (a control group's `reactKey`) is the caller's to keep unique
        if (props?.key === undefined && child.key !== null) {
          const times = given.get(child.key) ?? 0;

          given.set(child.key, times + 1);

          if (times > 0) {
            return React.cloneElement(child, { ...props, key: `${child.key}#${times}` });
          }
        }

        return React.cloneElement(child, props);
      }

      return child;
    });
  }, deps);

  return useMemo(() => ({ clone }), [clone]);
};
