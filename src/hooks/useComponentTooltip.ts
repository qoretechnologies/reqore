import { ForwardedRef, useMemo } from 'react';
import { ReqorePopover } from '../components/Popover';
import { buildTooltipForComponents } from '../helpers/utils';
import { TReqoreTooltipProp } from '../types/global';

export const useComponentTooltip = <Props>(
  props: Props & { tooltip?: TReqoreTooltipProp },
  component: React.FC<Props>,
  ref: ForwardedRef<any>
): { Component: any; props: Record<string, unknown> } => {
  const componentAndProps = useMemo(() => {
    if (!props.tooltip) {
      return {
        Component: component,
        props: {
          ...props,
          ref,
        },
      };
    }

    return {
      Component: ReqorePopover,
      props: {
        ...buildTooltipForComponents(props.tooltip),
        component,
        isReqoreComponent: true,
        ref,
        componentProps: props,
      },
    };
  }, [props, component, ref]);

  return componentAndProps;
};
