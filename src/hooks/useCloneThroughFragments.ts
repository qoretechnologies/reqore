import React, { useCallback, useMemo, useRef } from 'react';

/** Whether two inline styles say the same: the same properties, each the same value. */
const isSameStyle = (a: React.CSSProperties, b: React.CSSProperties): boolean => {
  const keys = Object.keys(a) as Array<keyof React.CSSProperties>;

  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && a[key] === b[key])
  );
};

export const useCloneThroughFragments = (
  propsMapper: (
    props: Record<string | number, any>,
    reactIndex: number,
    realIndex: number,
    childType: React.ReactElement['type']
  ) => Record<string | number, any>,
  deps?: any[]
) => {
  /* The style each child was last handed, by its place, kept while it says the same. A mapper makes the
     style anew on every render - a stacked control group squares the corners that meet and tucks each
     border under the one before - so it was a prop that always changed, and a memo child (a button, a
     dropdown) was drawn again with its group each time, whatever else it was handed (qorus#646). */
  const keptStyles = useRef(new Map<number, React.CSSProperties>());

  const clone = useCallback((children: React.ReactNode): React.ReactNode => {
    /* Counted per call, from the first child: the clone is kept between renders (`deps`), and a count kept with
       it went on from where the last render left it - a group re-rendering by itself numbered its first child
       the fourth. */
    let realIndex = 0;

    const cloneLevel = (nodes: React.ReactNode): React.ReactNode => {
      /* The keys given at this level of the children. A child keeps its own key, so React keeps it
         (and its state) when another is added before it; a key given again is made unique (`#1`,
         `#2`, ...), as the place a control group joined to every key used to make it. Children keyed
         by what they say (a label, a name) can repeat it, and two children with one key are one to
         React: it warns, and on an update drops or repeats one of them. A fragment's children are
         keyed under the fragment, so each level counts its own. */
      const given = new Map<React.Key, number>();

      return React.Children.map(nodes, (child, reactIndex) => {
        if (child && React.isValidElement(child)) {
          if (child.type === React.Fragment) {
            return cloneLevel(child.props.children);
          }

          const mapped = propsMapper(child.props, reactIndex, realIndex, child.type);
          const kept = keptStyles.current.get(realIndex);
          let props = mapped;

          if (mapped?.style) {
            if (kept && isSameStyle(kept, mapped.style)) {
              props = { ...mapped, style: kept };
            } else {
              keptStyles.current.set(realIndex, mapped.style);
            }
          }

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
    };

    return cloneLevel(children);
  }, deps);

  return useMemo(() => ({ clone }), [clone]);
};
