import { forwardRef, memo } from 'react';
import { buildTooltipForComponents } from '../../helpers/utils';
import { TReqoreTooltipProp } from '../../types/global';
import { ReqorePopover } from '../Popover';

export interface ITooltipComponentProps {
  tooltip?: TReqoreTooltipProp;
  Component: React.FC<any>;
  [key: string]: unknown;
}

export const ReqoreTooltipComponent = memo(
  forwardRef(({ Component, tooltip, ...rest }: ITooltipComponentProps, ref) => {
    // The tooltip is drawn by the popover. The component has no use for it, and would hand it on:
    // a DOM element (`Component='div'`) renders it as a `tooltip` attribute, and a styled
    // component rendered `as` another component (a router link) passes it to that component.
    if (!tooltip) {
      return <Component {...rest} ref={ref} />;
    }

    return (
      <ReqorePopover
        {...buildTooltipForComponents(tooltip)}
        component={Component}
        isReqoreComponent
        ref={ref}
        componentProps={rest}
      >
        {rest.children}
      </ReqorePopover>
    );
  })
);
